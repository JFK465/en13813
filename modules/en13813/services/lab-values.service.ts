import { SupabaseClient } from '@supabase/supabase-js'

export interface LabValue {
  id?: string
  tenant_id?: string
  recipe_id: string
  batch_id?: string
  
  // Probenahme
  sample_id: string
  sample_datetime: string
  sample_location?: string
  sampled_by?: string
  
  // Test-Typ
  test_type: 'fresh' | 'hardened' | 'both'
  test_age_days?: number
  
  // Frischmörtel-Eigenschaften
  fresh_properties?: FreshProperties
  
  // Festmörtel-Eigenschaften
  hardened_properties?: HardenedProperties
  
  // Bewertung
  evaluation: Evaluation
  
  // Equipment
  equipment_used?: Equipment[]
  
  // Rohstoff-Chargen (Traceability)
  raw_material_batches?: RawMaterialBatches
  
  // Status
  status?: 'pending' | 'in_test' | 'completed' | 'rejected'
  released?: boolean
  released_by?: string
  released_at?: string
  
  // Kommentare
  comments?: string
  deviation_report_id?: string
  
  // Audit
  created_at?: string
  updated_at?: string
}

export interface FreshProperties {
  consistency?: {
    value: number
    unit: string
    method: 'flow_table' | 'slump'
    specification: string
    passed: boolean
  }
  temperature?: {
    value: number
    unit: string
    specification: string
    passed: boolean
  }
  ph?: {
    value: number
    specification: string
    passed: boolean
  }
  density?: {
    value: number
    unit: string
    specification: string
    passed: boolean
  }
  workability_time?: {
    value: number
    unit: string
    specification: string
    passed: boolean
  }
}

export interface HardenedProperties {
  compressive_strength?: {
    value: number
    unit: string
    individual_values?: number[]
    mean?: number
    std_dev?: number
    specification: string
    class?: string
    passed: boolean
    conformity?: any
  }
  flexural_strength?: {
    value: number
    unit: string
    specification: string
    class?: string
    passed: boolean
  }
  density?: {
    value: number
    unit: string
    specification: string
    passed: boolean
  }
  // Verschleißprüfungen
  wear_resistance_bohme?: {
    value: number
    unit: string
    method: string
    norm: string
    class?: string
    specification: string
    passed: boolean
  }
  wear_resistance_bca?: {
    value: number
    unit: string
    method: string
    norm: string
    class?: string
    specification: string
    passed: boolean
  }
  wear_resistance_rollrad?: {
    value: number
    unit: string
    method: string
    norm: string
    class?: string
    specification: string
    passed: boolean
  }
  // Oberflächenhärte (PFLICHT bei MA)
  surface_hardness?: {
    value: number
    unit: string
    norm: string
    specification: string
    class?: string
    passed: boolean
    mandatory_for_MA?: boolean
  }
  // Haftzugfestigkeit (PFLICHT bei SR)
  bond_strength?: {
    value: number
    unit: string
    norm: string
    specification: string
    class?: string
    passed: boolean
    mandatory_for_SR?: boolean
  }
}

export interface Evaluation {
  overall_result: 'pass' | 'warning' | 'fail'
  individual_check?: boolean // ≥ 0.85 × deklariert
  mean_check?: boolean       // ≥ 0.95 × deklariert
  deviations?: string[]
  action_required?: string
  comments?: string
}

export interface Equipment {
  device: string
  model?: string
  calibration_date?: string
  calibration_valid_until?: string
}

export interface RawMaterialBatches {
  cement?: { batch: string; supplier: string }
  aggregate_0_4?: { batch: string; supplier: string }
  aggregate_4_8?: { batch: string; supplier: string }
  additive_1?: { batch: string; supplier: string }
  [key: string]: any
}

export interface FPCControlPoint {
  id?: string
  tenant_id?: string
  control_type: 'incoming_material' | 'production' | 'final_product'
  control_name: string
  control_category?: string
  frequency_low?: string    // < 500 m³/Jahr
  frequency_medium?: string  // 500-5000 m³/Jahr
  frequency_high?: string    // > 5000 m³/Jahr
  parameters: ControlParameter[]
  requirements?: string
  acceptance_criteria?: any
  active?: boolean
  mandatory?: boolean
}

export interface ControlParameter {
  name: string
  method?: string
  norm?: string
  unit?: string
  specification?: string
  tolerance?: string
  age_days?: number
}

export interface FPCExecution {
  id?: string
  tenant_id?: string
  control_point_id: string
  batch_id?: string
  execution_date: string
  execution_time?: string
  executed_by: string
  results: any
  passed: boolean
  deviations?: any[]
  corrective_actions?: string
  status?: 'completed' | 'pending_review' | 'approved'
  reviewed_by?: string
  reviewed_at?: string
}

export interface SPCData {
  id?: string
  tenant_id?: string
  recipe_id: string
  period_start: string
  period_end: string
  parameter: string
  n_samples: number
  mean_value?: number
  std_deviation?: number
  min_value?: number
  max_value?: number
  cpk?: number // Prozessfähigkeitsindex (Minimum 1.33)
  cp?: number
  ucl?: number // Upper Control Limit (3σ)
  lcl?: number // Lower Control Limit (3σ)
  uwl?: number // Upper Warning Limit (2σ)
  lwl?: number // Lower Warning Limit (2σ)
  trend?: 'stable' | 'increasing' | 'decreasing' | 'erratic'
  out_of_control_points?: number
}

export class LabValuesService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Erstelle neuen Laborwert
   */
  async createLabValue(labValue: Partial<LabValue>): Promise<LabValue> {
    try {
      // Automatische Bewertung durchführen
      labValue.evaluation = this.evaluateLabValue(labValue)
      
      const { data, error } = await this.supabase
        .from('en13813_lab_values')
        .insert([labValue])
        .select()
        .single()

      if (error) throw error
      
      // Prüfe ob Alarm notwendig
      if (labValue.evaluation?.overall_result === 'fail') {
        await this.createAlert(data.id, 'Grenzwertüberschreitung', labValue.evaluation.action_required)
      }
      
      return data
    } catch (error) {
      console.error('Error creating lab value:', error)
      throw error
    }
  }

  /**
   * Bewerte Laborwert gegen Spezifikation
   */
  private evaluateLabValue(labValue: Partial<LabValue>): Evaluation {
    const evaluation: Evaluation = {
      overall_result: 'pass',
      deviations: [],
      comments: ''
    }

    // Prüfe Festmörtel-Eigenschaften
    if (labValue.hardened_properties?.compressive_strength) {
      const cs = labValue.hardened_properties.compressive_strength
      const specValue = parseFloat(cs.specification.replace('≥', '').trim())
      
      // Einzelwert-Prüfung (≥ 0.85 × deklariert)
      const minIndividual = specValue * 0.85
      if (cs.individual_values) {
        const failedIndividuals = cs.individual_values.filter(v => v < minIndividual)
        if (failedIndividuals.length > 0) {
          evaluation.individual_check = false
          evaluation.overall_result = 'fail'
          evaluation.deviations?.push(`Einzelwerte unter ${minIndividual} N/mm²`)
          evaluation.action_required = 'Charge sperren, Ursachenanalyse durchführen'
        } else {
          evaluation.individual_check = true
        }
      }
      
      // Mittelwert-Prüfung (≥ 0.95 × deklariert)
      const minMean = specValue * 0.95
      if (cs.mean && cs.mean < minMean) {
        evaluation.mean_check = false
        if (evaluation.overall_result !== 'fail') {
          evaluation.overall_result = 'warning'
        }
        evaluation.deviations?.push(`Mittelwert ${cs.mean} unter ${minMean} N/mm²`)
        evaluation.action_required = evaluation.action_required || 'Prozess überprüfen'
      } else {
        evaluation.mean_check = true
      }
    }

    // Prüfe Frischmörtel-Eigenschaften
    if (labValue.fresh_properties) {
      const fresh = labValue.fresh_properties
      
      // Konsistenz
      if (fresh.consistency && !fresh.consistency.passed) {
        evaluation.deviations?.push('Konsistenz außerhalb Spezifikation')
        if (evaluation.overall_result === 'pass') {
          evaluation.overall_result = 'warning'
        }
      }
      
      // Temperatur
      if (fresh.temperature && !fresh.temperature.passed) {
        evaluation.deviations?.push('Temperatur außerhalb Spezifikation')
        if (evaluation.overall_result === 'pass') {
          evaluation.overall_result = 'warning'
        }
      }
    }

    // Prüfe Verschleißwiderstand
    if (labValue.hardened_properties) {
      const hardened = labValue.hardened_properties
      
      // Böhme
      if (hardened.wear_resistance_bohme && !hardened.wear_resistance_bohme.passed) {
        evaluation.deviations?.push('Verschleiß Böhme überschreitet Grenzwert')
        evaluation.overall_result = 'fail'
        evaluation.action_required = 'Rezeptur überprüfen, Material nicht konform'
      }
      
      // BCA
      if (hardened.wear_resistance_bca && !hardened.wear_resistance_bca.passed) {
        evaluation.deviations?.push('Verschleiß BCA überschreitet Grenzwert')
        evaluation.overall_result = 'fail'
        evaluation.action_required = 'Rezeptur überprüfen, Material nicht konform'
      }
      
      // Rollrad
      if (hardened.wear_resistance_rollrad && !hardened.wear_resistance_rollrad.passed) {
        evaluation.deviations?.push('Rollrad-Verschleiß überschreitet Grenzwert')
        evaluation.overall_result = 'fail'
        evaluation.action_required = 'Rezeptur überprüfen, Material nicht konform'
      }
      
      // Oberflächenhärte (KRITISCH bei MA)
      if (hardened.surface_hardness) {
        if (!hardened.surface_hardness.passed) {
          evaluation.deviations?.push('Oberflächenhärte unterschreitet Anforderung')
          if (hardened.surface_hardness.mandatory_for_MA) {
            evaluation.overall_result = 'fail'
            evaluation.action_required = 'MA-Estrich nicht konform! Oberflächenhärte ist Pflicht'
          } else if (evaluation.overall_result === 'pass') {
            evaluation.overall_result = 'warning'
          }
        }
      }
      
      // Haftzugfestigkeit (KRITISCH bei SR)
      if (hardened.bond_strength) {
        if (!hardened.bond_strength.passed) {
          evaluation.deviations?.push('Haftzugfestigkeit unterschreitet Anforderung')
          if (hardened.bond_strength.mandatory_for_SR) {
            evaluation.overall_result = 'fail'
            evaluation.action_required = 'SR-Estrich nicht konform! Haftzugfestigkeit ist Pflicht'
          } else if (evaluation.overall_result === 'pass') {
            evaluation.overall_result = 'warning'
          }
        }
      }
    }

    return evaluation
  }

  /**
   * Hole Laborwerte für Charge
   */
  async getLabValuesForBatch(batchId: string): Promise<LabValue[]> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_lab_values')
        .select('*')
        .eq('batch_id', batchId)
        .order('sample_datetime', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching lab values:', error)
      throw error
    }
  }

  /**
   * Hole Laborwerte für Rezeptur (Trend-Analyse)
   */
  async getLabValuesForRecipe(recipeId: string, days: number = 30): Promise<LabValue[]> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      const { data, error } = await this.supabase
        .from('en13813_lab_values')
        .select('*')
        .eq('recipe_id', recipeId)
        .gte('sample_datetime', startDate.toISOString())
        .order('sample_datetime', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching lab values:', error)
      throw error
    }
  }

  /**
   * Berechne SPC-Daten für Parameter
   */
  async calculateSPC(recipeId: string, parameter: string, periodDays: number = 90): Promise<SPCData> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - periodDays)
      
      // Hole Laborwerte für Periode
      const labValues = await this.getLabValuesForRecipe(recipeId, periodDays)
      
      // Extrahiere Werte für Parameter
      const values: number[] = []
      labValues.forEach(lv => {
        if (parameter === 'compressive_strength_28d' && lv.test_age_days === 28) {
          if (lv.hardened_properties?.compressive_strength?.value) {
            values.push(lv.hardened_properties.compressive_strength.value)
          }
        }
        // Weitere Parameter...
      })
      
      if (values.length < 3) {
        throw new Error('Mindestens 3 Werte für SPC-Berechnung erforderlich')
      }
      
      // Berechne Statistik
      const n = values.length
      const mean = values.reduce((a, b) => a + b, 0) / n
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1)
      const stdDev = Math.sqrt(variance)
      const min = Math.min(...values)
      const max = Math.max(...values)
      
      // Kontrollgrenzen
      const ucl = mean + 3 * stdDev
      const lcl = mean - 3 * stdDev
      const uwl = mean + 2 * stdDev
      const lwl = mean - 2 * stdDev
      
      // Prozessfähigkeit (vereinfacht, benötigt eigentlich Spezifikationsgrenzen)
      // Annahme: Untere Spezifikationsgrenze ist deklarierte Klasse
      const lsl = 25.0 // Beispiel für C25
      const cpk = Math.min((mean - lsl) / (3 * stdDev), (ucl - mean) / (3 * stdDev))
      
      // Trend-Analyse (vereinfacht)
      const firstHalf = values.slice(0, Math.floor(n / 2))
      const secondHalf = values.slice(Math.floor(n / 2))
      const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      
      let trend: 'stable' | 'increasing' | 'decreasing' | 'erratic' = 'stable'
      if (Math.abs(secondMean - firstMean) > stdDev) {
        trend = secondMean > firstMean ? 'increasing' : 'decreasing'
      }
      
      // Out-of-control Punkte
      const outOfControl = values.filter(v => v > ucl || v < lcl).length
      
      const spcData: SPCData = {
        recipe_id: recipeId,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        parameter,
        n_samples: n,
        mean_value: mean,
        std_deviation: stdDev,
        min_value: min,
        max_value: max,
        cpk,
        ucl,
        lcl,
        uwl,
        lwl,
        trend,
        out_of_control_points: outOfControl
      }
      
      // Speichere SPC-Daten
      const { data, error } = await this.supabase
        .from('en13813_spc_data')
        .upsert([spcData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error calculating SPC:', error)
      throw error
    }
  }

  /**
   * Hole FPC-Kontrollpunkte
   */
  async getFPCControlPoints(productionVolume: 'low' | 'medium' | 'high' = 'medium'): Promise<FPCControlPoint[]> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_fpc_control_points')
        .select('*')
        .eq('active', true)
        .order('control_type', { ascending: true })

      if (error) throw error
      
      // Setze richtige Frequenz basierend auf Produktionsvolumen
      const controlPoints = (data || []).map(cp => ({
        ...cp,
        frequency: cp[`frequency_${productionVolume}`] || cp.frequency_medium
      }))
      
      return controlPoints
    } catch (error) {
      console.error('Error fetching FPC control points:', error)
      throw error
    }
  }

  /**
   * Erstelle FPC-Durchführung
   */
  async createFPCExecution(execution: Partial<FPCExecution>): Promise<FPCExecution> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_fpc_executions')
        .insert([execution])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating FPC execution:', error)
      throw error
    }
  }

  /**
   * Hole FPC-Durchführungen für Zeitraum
   */
  async getFPCExecutions(startDate: string, endDate: string): Promise<FPCExecution[]> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_fpc_executions')
        .select(`
          *,
          control_point:en13813_fpc_control_points(*)
        `)
        .gte('execution_date', startDate)
        .lte('execution_date', endDate)
        .order('execution_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching FPC executions:', error)
      throw error
    }
  }

  /**
   * Erstelle Alarm bei Grenzwertüberschreitung
   */
  private async createAlert(labValueId: string, type: string, message?: string): Promise<void> {
    try {
      // Hier könnte eine Benachrichtigung erstellt werden
      // z.B. E-Mail, Push-Notification, etc.
      console.warn(`ALARM: ${type} - ${message} (Lab Value: ${labValueId})`)
      
      // Optional: In Datenbank speichern
      // await this.supabase.from('alerts').insert([...])
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  /**
   * Freigabe eines Laborwerts
   */
  async releaseLabValue(labValueId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('en13813_lab_values')
        .update({
          released: true,
          released_by: userId,
          released_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', labValueId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error releasing lab value:', error)
      throw error
    }
  }

  /**
   * Hole Trend-Daten für Dashboard
   */
  async getTrendData(recipeId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('v_lab_value_trends')
        .select('*')
        .eq('recipe_id', recipeId)
        .limit(12) // Letzte 12 Wochen

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching trend data:', error)
      throw error
    }
  }
}