'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CalibrationService, CalibrationDevice } from '@/modules/en13813/services/calibration.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function CalibrationPage() {
  const [devices, setDevices] = useState<CalibrationDevice[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const calibrationService = new CalibrationService(supabase)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [devicesData, stats] = await Promise.all([
        calibrationService.getDevices(),
        calibrationService.getCalibrationStatistics()
      ])
      setDevices(devicesData)
      setStatistics(stats)
    } catch (error) {
      console.error('Error loading calibration data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: CalibrationDevice['status']) => {
    switch (status) {
      case 'calibrated':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Kalibriert</Badge>
      case 'due':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Fällig</Badge>
      case 'overdue':
        return <Badge className="bg-red-500"><AlertTriangle className="w-3 h-3 mr-1" />Überfällig</Badge>
      case 'out_of_service':
        return <Badge className="bg-gray-500"><XCircle className="w-3 h-3 mr-1" />Außer Betrieb</Badge>
      default:
        return null
    }
  }

  const getDeviceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      scale: 'Waage',
      mixer: 'Mischer',
      testing_machine: 'Prüfmaschine',
      thermometer: 'Thermometer',
      hygrometer: 'Hygrometer',
      flow_table: 'Ausbreittisch',
      other: 'Sonstiges'
    }
    return labels[type] || type
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">Lade Kalibrierungsdaten...</div>
    </div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kalibrierungsmanagement</h1>
        <Link href="/en13813/calibration/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Gerät hinzufügen
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_devices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Kalibriert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.calibrated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Fällig</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.due_soon}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Überfällig</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.overdue}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Devices List */}
      <Card>
        <CardHeader>
          <CardTitle>Messgeräte und Prüfeinrichtungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Gerät</th>
                  <th className="text-left p-2">Typ</th>
                  <th className="text-left p-2">Seriennummer</th>
                  <th className="text-left p-2">Letzte Kalibrierung</th>
                  <th className="text-left p-2">Nächste Fälligkeit</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{device.device_name}</td>
                    <td className="p-2">{getDeviceTypeLabel(device.device_type)}</td>
                    <td className="p-2">{device.serial_number}</td>
                    <td className="p-2">
                      {new Date(device.last_calibration_date).toLocaleDateString('de-DE')}
                    </td>
                    <td className="p-2">
                      {new Date(device.next_calibration_date).toLocaleDateString('de-DE')}
                    </td>
                    <td className="p-2">{getStatusBadge(device.status)}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Link href={`/en13813/calibration/${device.id}/record`}>
                          <Button size="sm" variant="outline">Kalibrieren</Button>
                        </Link>
                        <Link href={`/en13813/calibration/${device.id}`}>
                          <Button size="sm" variant="ghost">Details</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {devices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Keine Geräte vorhanden. Fügen Sie das erste Gerät hinzu.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Calibrations */}
      {statistics?.upcoming_calibrations?.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nächste anstehende Kalibrierungen</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {statistics.upcoming_calibrations.map((device: CalibrationDevice) => (
                <li key={device.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{device.device_name}</span>
                  <span className="text-sm text-gray-600">
                    Fällig: {new Date(device.next_calibration_date).toLocaleDateString('de-DE')}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
