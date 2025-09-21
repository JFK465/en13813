'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CalibrationService, CalibrationDevice } from '@/modules/en13813/services/calibration.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCalibrationDevicePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const calibrationService = new CalibrationService(supabase)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: 'scale' as CalibrationDevice['device_type'],
    serial_number: '',
    manufacturer: '',
    location: '',
    calibration_interval_months: 12,
    last_calibration_date: new Date().toISOString().split('T')[0],
    calibration_certificate: '',
    calibration_company: '',
    responsible_person: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calculate next calibration date
      const lastCalDate = new Date(formData.last_calibration_date)
      const nextCalDate = new Date(lastCalDate)
      nextCalDate.setMonth(nextCalDate.getMonth() + formData.calibration_interval_months)

      const deviceData: Omit<CalibrationDevice, 'id' | 'created_at' | 'updated_at'> = {
        ...formData,
        next_calibration_date: nextCalDate.toISOString(),
        status: 'calibrated'
      }

      await calibrationService.createDevice(deviceData)
      router.push('/en13813/calibration')
    } catch (error) {
      console.error('Error creating device:', error)
      alert('Fehler beim Erstellen des Geräts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/en13813/calibration">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neues Messgerät hinzufügen</CardTitle>
          <CardDescription>
            Erfassen Sie ein neues Gerät für das Kalibrierungsmanagement gemäß EN 13813
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="device_name">Gerätename *</Label>
                <Input
                  id="device_name"
                  value={formData.device_name}
                  onChange={(e) => setFormData({...formData, device_name: e.target.value})}
                  required
                  placeholder="z.B. Druckprüfmaschine 1"
                />
              </div>

              <div>
                <Label htmlFor="device_type">Gerätetyp *</Label>
                <Select
                  value={formData.device_type}
                  onValueChange={(value: CalibrationDevice['device_type']) => 
                    setFormData({...formData, device_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scale">Waage</SelectItem>
                    <SelectItem value="mixer">Mischer</SelectItem>
                    <SelectItem value="testing_machine">Prüfmaschine</SelectItem>
                    <SelectItem value="thermometer">Thermometer</SelectItem>
                    <SelectItem value="hygrometer">Hygrometer</SelectItem>
                    <SelectItem value="flow_table">Ausbreittisch</SelectItem>
                    <SelectItem value="other">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="serial_number">Seriennummer *</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                  required
                  placeholder="z.B. SN-123456"
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Hersteller</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                  placeholder="z.B. Toni Technik"
                />
              </div>

              <div>
                <Label htmlFor="location">Standort</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="z.B. Labor 1"
                />
              </div>

              <div>
                <Label htmlFor="calibration_interval_months">Kalibrierintervall (Monate) *</Label>
                <Input
                  id="calibration_interval_months"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.calibration_interval_months}
                  onChange={(e) => setFormData({...formData, calibration_interval_months: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="last_calibration_date">Letzte Kalibrierung *</Label>
                <Input
                  id="last_calibration_date"
                  type="date"
                  value={formData.last_calibration_date}
                  onChange={(e) => setFormData({...formData, last_calibration_date: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="calibration_company">Kalibrierfirma</Label>
                <Input
                  id="calibration_company"
                  value={formData.calibration_company}
                  onChange={(e) => setFormData({...formData, calibration_company: e.target.value})}
                  placeholder="z.B. DKD Labor GmbH"
                />
              </div>

              <div>
                <Label htmlFor="calibration_certificate">Zertifikatsnummer</Label>
                <Input
                  id="calibration_certificate"
                  value={formData.calibration_certificate}
                  onChange={(e) => setFormData({...formData, calibration_certificate: e.target.value})}
                  placeholder="z.B. DKD-K-12345"
                />
              </div>

              <div>
                <Label htmlFor="responsible_person">Verantwortliche Person</Label>
                <Input
                  id="responsible_person"
                  value={formData.responsible_person}
                  onChange={(e) => setFormData({...formData, responsible_person: e.target.value})}
                  placeholder="z.B. Max Mustermann"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notizen</Label>
              <textarea
                id="notes"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Zusätzliche Informationen..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Link href="/en13813/calibration">
                <Button type="button" variant="outline">
                  Abbrechen
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Wird gespeichert...' : 'Gerät hinzufügen'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}