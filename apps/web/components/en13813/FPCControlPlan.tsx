'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Activity, Calendar, AlertTriangle } from 'lucide-react'
import { FPCControlPlan } from '@/modules/en13813/services/compliance.service'

interface FPCControlPlanProps {
  recipeId: string
  controlPlan?: FPCControlPlan
  onUpdate?: (plan: FPCControlPlan) => Promise<void>
  readOnly?: boolean
}

export function FPCControlPlan({ 
  recipeId, 
  controlPlan, 
  onUpdate, 
  readOnly = false 
}: FPCControlPlanProps) {
  const [plan] = useState<FPCControlPlan>(controlPlan || {
    recipe_id: recipeId,
    incoming_inspection: {
      binder: {
        frequency: 'per_delivery',
        tests: ['certificate_check', 'visual_inspection'],
        tolerance: 'as_per_en197'
      },
      aggregates: {
        frequency: 'weekly',
        tests: ['moisture_content', 'grading'],
        tolerance: '±2%'
      }
    },
    production_control: {
      fresh_mortar: {
        frequency: 'per_batch',
        tests: ['consistency', 'temperature'],
        limits: {}
      },
      hardened_mortar: {
        frequency: 'monthly',
        tests: ['compressive_strength', 'flexural_strength'],
        warning_limit: '90%_of_declared',
        action_limit: '85%_of_declared'
      }
    },
    calibration: {
      scales: 'quarterly',
      mixers: 'annually',
      testing_equipment: 'as_per_manufacturer'
    },
    active: true
  })

  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      'per_delivery': 'bg-blue-100 text-blue-800',
      'per_batch': 'bg-purple-100 text-purple-800',
      'daily': 'bg-green-100 text-green-800',
      'weekly': 'bg-yellow-100 text-yellow-800',
      'monthly': 'bg-orange-100 text-orange-800',
      'quarterly': 'bg-red-100 text-red-800',
      'annually': 'bg-gray-100 text-gray-800'
    }

    const labels: Record<string, string> = {
      'per_delivery': 'Je Lieferung',
      'per_batch': 'Je Charge',
      'daily': 'Täglich',
      'weekly': 'Wöchentlich',
      'monthly': 'Monatlich',
      'quarterly': 'Quartalsweise',
      'annually': 'Jährlich'
    }

    return (
      <Badge className={colors[frequency] || 'bg-gray-100 text-gray-800'}>
        {labels[frequency] || frequency}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Werkseigene Produktionskontrolle (FPC)
          </div>
          {plan.active ? (
            <Badge className="bg-green-100 text-green-800">
              <Activity className="mr-1 h-3 w-3" />
              Aktiv
            </Badge>
          ) : (
            <Badge variant="secondary">Inaktiv</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Kontrollplan nach EN 13813 für die kontinuierliche Qualitätssicherung
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="incoming" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="incoming">Eingangskontrolle</TabsTrigger>
            <TabsTrigger value="production">Produktionskontrolle</TabsTrigger>
            <TabsTrigger value="calibration">Kalibrierung</TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            {/* Bindemittel-Kontrolle */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Bindemittel</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Prüfhäufigkeit</Label>
                  <div className="mt-1">
                    {getFrequencyBadge(plan.incoming_inspection.binder.frequency)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Prüfungen</Label>
                  <div className="mt-1 space-y-1">
                    {plan.incoming_inspection.binder.tests.map(test => (
                      <Badge key={test} variant="outline" className="text-xs">
                        {test === 'certificate_check' ? 'Zertifikatsprüfung' : 'Sichtprüfung'}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Toleranz</Label>
                  <p className="mt-1 text-sm">{plan.incoming_inspection.binder.tolerance}</p>
                </div>
              </div>
            </div>

            {/* Zuschlagstoff-Kontrolle */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Zuschlagstoffe</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Prüfhäufigkeit</Label>
                  <div className="mt-1">
                    {getFrequencyBadge(plan.incoming_inspection.aggregates.frequency)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Prüfungen</Label>
                  <div className="mt-1 space-y-1">
                    {plan.incoming_inspection.aggregates.tests.map(test => (
                      <Badge key={test} variant="outline" className="text-xs">
                        {test === 'moisture_content' ? 'Feuchtegehalt' : 'Sieblinie'}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Toleranz</Label>
                  <p className="mt-1 text-sm">{plan.incoming_inspection.aggregates.tolerance}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            {/* Frischmörtel-Kontrolle */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Frischmörtel</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Prüfhäufigkeit</Label>
                  <div className="mt-1">
                    {getFrequencyBadge(plan.production_control.fresh_mortar.frequency)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Prüfungen</Label>
                  <div className="mt-1 space-x-2">
                    {plan.production_control.fresh_mortar.tests.map(test => (
                      <Badge key={test} variant="outline" className="text-xs">
                        {test === 'consistency' ? 'Konsistenz' : 'Temperatur'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Festmörtel-Kontrolle */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Festmörtel</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Prüfhäufigkeit</Label>
                  <div className="mt-1">
                    {getFrequencyBadge(plan.production_control.hardened_mortar.frequency)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Prüfungen</Label>
                  <div className="mt-1 space-x-2">
                    {plan.production_control.hardened_mortar.tests.map(test => (
                      <Badge key={test} variant="outline" className="text-xs">
                        {test === 'compressive_strength' ? 'Druckfestigkeit' : 'Biegezugfestigkeit'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">Grenzwerte:</p>
                    <ul className="mt-1 space-y-1 text-amber-800">
                      <li>• Warngrenze: {plan.production_control.hardened_mortar.warning_limit.replace('_', ' ')}</li>
                      <li>• Eingreifgrenze: {plan.production_control.hardened_mortar.action_limit.replace('_', ' ')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calibration" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Kalibrierungsintervalle
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <Label>Waagen</Label>
                  {getFrequencyBadge(plan.calibration.scales)}
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <Label>Mischer</Label>
                  {getFrequencyBadge(plan.calibration.mixers)}
                </div>
                <div className="flex justify-between items-center py-2">
                  <Label>Prüfgeräte</Label>
                  <Badge variant="outline">
                    {plan.calibration.testing_equipment.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Hinweis:</strong> Die Kalibrierung muss durch akkreditierte Stellen oder nach 
                Herstellervorgaben erfolgen. Kalibrierzertifikate sind aufzubewahren.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {!readOnly && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Die FPC-Parameter können über die Einstellungen angepasst werden. 
              Änderungen sollten dokumentiert und begründet werden.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}