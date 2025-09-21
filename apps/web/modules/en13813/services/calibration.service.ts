/**
 * Kalibrierungsmanagement Service
 * EN 13813 fordert regelmäßige Kalibrierung aller Mess- und Prüfgeräte
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface CalibrationDevice {
  id: string
  device_name: string
  device_type: 'scale' | 'mixer' | 'testing_machine' | 'thermometer' | 'hygrometer' | 'flow_table' | 'other'
  serial_number: string
  manufacturer?: string
  model?: string
  location?: string
  
  // Kalibrierungsintervalle
  calibration_interval_months: number
  last_calibration_date: string
  next_calibration_date: string
  
  // EN 13813 spezifische Testintervalle
  test_specific_intervals?: {
    compressive_strength?: number // Monate - für Druckprüfmaschinen
    flexural_strength?: number // Monate - für Biegeprüfmaschinen
    wear_resistance?: number // Monate - für Verschleißprüfgeräte
    consistency?: number // Monate - für Ausbreittische
  }
  
  // Messbereich und Genauigkeit
  measurement_range?: {
    min: number
    max: number
    unit: string
    accuracy_class?: string // z.B. Klasse 1, 2, 3
    resolution?: number
  }
  
  calibration_certificate?: string
  calibration_company?: string
  accreditation_number?: string // DAkkS, DKD Akkreditierungsnummer
  
  status: 'calibrated' | 'due' | 'overdue' | 'out_of_service'
  responsible_person?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface CalibrationHistory {
  id: string
  device_id: string
  calibration_date: string
  calibration_type: 'regular' | 'repair' | 'initial'
  performed_by: string
  certificate_number: string
  result: 'passed' | 'failed' | 'adjusted'
  next_due_date: string
  
  // EN 13813 konforme Zusatzfelder
  measurement_uncertainty?: number // Messunsicherheit in %
  calibration_standard?: string // Referenznormal (z.B. DKD, DAkkS)
  environmental_conditions?: {
    temperature: number // °C
    humidity: number // %
    pressure?: number // hPa
  }
  
  // Prüfmittelspezifische Daten
  calibration_points?: Array<{
    nominal_value: number
    actual_value: number
    deviation: number
    unit: string
  }>
  
  cost?: number
  notes?: string
  created_at?: string
}

export class CalibrationService {
  constructor(private supabase: SupabaseClient) {}

  // Device Management
  async getDevices(): Promise<CalibrationDevice[]> {
    const { data, error } = await this.supabase
      .from('en13813_calibration_devices')
      .select('*')
      .order('next_calibration_date', { ascending: true })

    if (error) throw error
    
    // Update status based on current date
    const today = new Date()
    return (data || []).map(device => {
      const nextDue = new Date(device.next_calibration_date)
      const daysUntilDue = Math.floor((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      let status: CalibrationDevice['status'] = 'calibrated'
      if (daysUntilDue < 0) {
        status = 'overdue'
      } else if (daysUntilDue <= 30) {
        status = 'due'
      }
      
      return { ...device, status }
    })
  }

  async getDevicesDue(withinDays: number = 30): Promise<CalibrationDevice[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + withinDays)
    
    const { data, error } = await this.supabase
      .from('en13813_calibration_devices')
      .select('*')
      .lte('next_calibration_date', futureDate.toISOString())
      .order('next_calibration_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  async createDevice(device: Omit<CalibrationDevice, 'id' | 'created_at' | 'updated_at'>): Promise<CalibrationDevice> {
    const { data, error } = await this.supabase
      .from('en13813_calibration_devices')
      .insert(device)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateDevice(id: string, updates: Partial<CalibrationDevice>): Promise<CalibrationDevice> {
    const { data, error } = await this.supabase
      .from('en13813_calibration_devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Calibration History
  async getCalibrationHistory(deviceId?: string): Promise<CalibrationHistory[]> {
    let query = this.supabase
      .from('en13813_calibration_history')
      .select('*')

    if (deviceId) {
      query = query.eq('device_id', deviceId)
    }

    const { data, error } = await query.order('calibration_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async recordCalibration(calibration: Omit<CalibrationHistory, 'id' | 'created_at'>): Promise<CalibrationHistory> {
    // Start transaction
    const { data: historyData, error: historyError } = await this.supabase
      .from('en13813_calibration_history')
      .insert(calibration)
      .select()
      .single()

    if (historyError) throw historyError

    // Update device with new calibration info
    const { error: deviceError } = await this.supabase
      .from('en13813_calibration_devices')
      .update({
        last_calibration_date: calibration.calibration_date,
        next_calibration_date: calibration.next_due_date,
        status: 'calibrated'
      })
      .eq('id', calibration.device_id)

    if (deviceError) throw deviceError

    return historyData
  }

  // Dashboard Statistics
  async getCalibrationStatistics() {
    const devices = await this.getDevices()
    
    const stats = {
      total_devices: devices.length,
      calibrated: devices.filter(d => d.status === 'calibrated').length,
      due_soon: devices.filter(d => d.status === 'due').length,
      overdue: devices.filter(d => d.status === 'overdue').length,
      out_of_service: devices.filter(d => d.status === 'out_of_service').length,
      devices_by_type: {} as Record<string, number>,
      upcoming_calibrations: devices
        .filter(d => d.status === 'due' || d.status === 'calibrated')
        .slice(0, 5)
    }

    // Count by type
    devices.forEach(device => {
      stats.devices_by_type[device.device_type] = 
        (stats.devices_by_type[device.device_type] || 0) + 1
    })

    return stats
  }

  // Compliance Check
  async checkCompliance(): Promise<{
    compliant: boolean
    issues: string[]
  }> {
    const devices = await this.getDevices()
    const issues: string[] = []
    
    // Check for overdue calibrations
    const overdueDevices = devices.filter(d => d.status === 'overdue')
    if (overdueDevices.length > 0) {
      overdueDevices.forEach(device => {
        issues.push(`${device.device_name} (${device.serial_number}) ist überfällig zur Kalibrierung`)
      })
    }

    // Check for devices without calibration history
    for (const device of devices) {
      const history = await this.getCalibrationHistory(device.id)
      if (history.length === 0) {
        issues.push(`${device.device_name} hat keine dokumentierte Kalibrierungshistorie`)
      }
    }

    // Check critical devices (scales, testing machines)
    const criticalTypes = ['scale', 'mixer', 'testing_machine']
    const criticalDevices = devices.filter(d => criticalTypes.includes(d.device_type))
    
    for (const device of criticalDevices) {
      if (!device.calibration_certificate) {
        issues.push(`Kritisches Gerät ${device.device_name} hat kein Kalibrierzertifikat`)
      }
    }

    return {
      compliant: issues.length === 0,
      issues
    }
  }

  // Generate Calibration Report
  async generateCalibrationReport(year?: number) {
    const targetYear = year || new Date().getFullYear()
    const startDate = `${targetYear}-01-01`
    const endDate = `${targetYear}-12-31`

    const { data: calibrations, error } = await this.supabase
      .from('en13813_calibration_history')
      .select(`
        *,
        device:en13813_calibration_devices(*)
      `)
      .gte('calibration_date', startDate)
      .lte('calibration_date', endDate)
      .order('calibration_date', { ascending: true })

    if (error) throw error

    return {
      year: targetYear,
      total_calibrations: calibrations?.length || 0,
      calibrations_by_month: this.groupByMonth(calibrations || []),
      total_cost: calibrations?.reduce((sum, c) => sum + (c.cost || 0), 0) || 0,
      devices_calibrated: new Set(calibrations?.map(c => c.device_id)).size,
      calibrations: calibrations || []
    }
  }

  private groupByMonth(calibrations: any[]) {
    const months: Record<string, number> = {}
    
    calibrations.forEach(cal => {
      const month = new Date(cal.calibration_date).toISOString().substring(0, 7)
      months[month] = (months[month] || 0) + 1
    })

    return months
  }

  // EN 13813 Konformitätsprüfung: Validierung ob Gerät zum Testzeitpunkt kalibriert war
  async validateTestWithCalibration(
    testDate: string,
    deviceId: string
  ): Promise<{
    valid: boolean
    calibration?: CalibrationHistory
    message: string
  }> {
    // Hole Kalibrierungshistorie für das Gerät
    const history = await this.getCalibrationHistory(deviceId)
    
    if (history.length === 0) {
      return {
        valid: false,
        message: 'Keine Kalibrierungshistorie vorhanden'
      }
    }

    const testDateObj = new Date(testDate)
    
    // Finde die relevante Kalibrierung (letzte vor dem Testdatum)
    const relevantCalibration = history
      .filter(cal => new Date(cal.calibration_date) <= testDateObj)
      .sort((a, b) => new Date(b.calibration_date).getTime() - new Date(a.calibration_date).getTime())[0]
    
    if (!relevantCalibration) {
      return {
        valid: false,
        message: 'Keine gültige Kalibrierung vor dem Testdatum gefunden'
      }
    }

    // Prüfe ob Test innerhalb der Gültigkeitsperiode lag
    const nextDueDate = new Date(relevantCalibration.next_due_date)
    
    if (testDateObj > nextDueDate) {
      return {
        valid: false,
        calibration: relevantCalibration,
        message: `Kalibrierung war zum Testzeitpunkt abgelaufen (gültig bis ${nextDueDate.toLocaleDateString('de-DE')})`
      }
    }

    return {
      valid: true,
      calibration: relevantCalibration,
      message: 'Gerät war zum Testzeitpunkt ordnungsgemäß kalibriert'
    }
  }

  // Berechne erweiterte Messunsicherheit für EN 13813 Tests
  calculateExpandedUncertainty(
    deviceUncertainty: number,
    environmentalFactors?: {
      temperature_deviation?: number
      humidity_deviation?: number
    }
  ): number {
    // Basis-Messunsicherheit des Geräts
    let totalUncertainty = deviceUncertainty || 0
    
    // Umgebungseinflüsse hinzufügen (vereinfachte Berechnung)
    if (environmentalFactors) {
      if (environmentalFactors.temperature_deviation) {
        totalUncertainty += environmentalFactors.temperature_deviation * 0.1
      }
      if (environmentalFactors.humidity_deviation) {
        totalUncertainty += environmentalFactors.humidity_deviation * 0.05
      }
    }
    
    // Erweiterte Messunsicherheit (k=2 für 95% Vertrauensbereich)
    return totalUncertainty * 2
  }
}