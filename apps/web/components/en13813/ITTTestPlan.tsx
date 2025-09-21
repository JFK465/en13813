'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ClipboardCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { ITTTestPlan as ITTTestPlanType } from '@/modules/en13813/services/compliance.service'

interface ITTTestPlanProps {
  recipeId: string
  testPlan?: ITTTestPlanType
  onUpdate?: (testPlan: ITTTestPlanType) => Promise<void>
  readOnly?: boolean
}

export function ITTTestPlan({ recipeId, testPlan, onUpdate, readOnly = false }: ITTTestPlanProps) {
  const [plan, setPlan] = useState<ITTTestPlanType>(testPlan || {
    recipe_id: recipeId,
    required_tests: [],
    optional_tests: [],
    test_status: 'pending',
    test_results: {}
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Abgeschlossen</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Bearbeitung</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fehlgeschlagen</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Ausstehend</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <ClipboardCheck className="h-5 w-5 text-gray-600" />
    }
  }

  const requiredTests = [
    { property: 'compressive_strength', norm: 'EN 13892-2', label: 'Druckfestigkeit', unit: 'N/mm²' },
    { property: 'flexural_strength', norm: 'EN 13892-2', label: 'Biegezugfestigkeit', unit: 'N/mm²' },
    { property: 'wear_resistance', norm: 'EN 13892-3/4/5', label: 'Verschleißwiderstand', unit: 'cm³/50cm²' },
    { property: 'fire_behavior', norm: 'EN 13501-1', label: 'Brandverhalten', unit: 'Klasse' },
    { property: 'emissions', norm: 'EN 13813', label: 'Emissionen', unit: 'µg/m³' }
  ]

  const optionalTests = [
    { property: 'surface_hardness', norm: 'EN 13892-6', label: 'Oberflächenhärte' },
    { property: 'bond_strength', norm: 'EN 13892-8', label: 'Haftzugfestigkeit' },
    { property: 'impact_resistance', norm: 'EN ISO 6272-1', label: 'Schlagfestigkeit' },
    { property: 'thermal_conductivity', norm: 'EN 12664', label: 'Wärmeleitfähigkeit' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(plan.test_status)}
            ITT-Prüfplan (Erstprüfung)
          </div>
          {getStatusBadge(plan.test_status)}
        </CardTitle>
        <CardDescription>
          Initial Type Testing nach EN 13813 - Nachweis der deklarierten Eigenschaften
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Erforderliche Prüfungen */}
        <div>
          <h3 className="font-medium mb-3">Erforderliche Prüfungen</h3>
          <div className="space-y-2">
            {requiredTests.map((test) => {
              const isCompleted = plan.test_results?.[test.property]
              return (
                <div key={test.property} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isCompleted}
                      disabled={readOnly}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPlan(prev => ({
                            ...prev,
                            test_results: {
                              ...prev.test_results,
                              [test.property]: { completed: true }
                            }
                          }))
                        }
                      }}
                    />
                    <div>
                      <Label className="font-medium">{test.label}</Label>
                      <p className="text-sm text-muted-foreground">{test.norm}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    {isCompleted ? (
                      <Badge variant="outline" className="bg-green-50">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Geprüft
                      </Badge>
                    ) : (
                      <Badge variant="outline">Ausstehend</Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Optionale Prüfungen */}
        <div>
          <h3 className="font-medium mb-3">Optionale Prüfungen</h3>
          <div className="space-y-2">
            {optionalTests.map((test) => {
              const isSelected = plan.optional_tests?.some(t => t.property === test.property)
              return (
                <div key={test.property} className="flex items-center justify-between p-3 border rounded-lg opacity-75">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isSelected}
                      disabled={readOnly}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPlan(prev => ({
                            ...prev,
                            optional_tests: [
                              ...(prev.optional_tests || []),
                              { property: test.property, norm: test.norm }
                            ]
                          }))
                        } else {
                          setPlan(prev => ({
                            ...prev,
                            optional_tests: prev.optional_tests?.filter(t => t.property !== test.property)
                          }))
                        }
                      }}
                    />
                    <div>
                      <Label className="font-medium">{test.label}</Label>
                      <p className="text-sm text-muted-foreground">{test.norm}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status-Zusammenfassung */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Prüfstatus</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Erforderliche Prüfungen:</span>
              <span className="font-medium">
                {Object.keys(plan.test_results || {}).length} / {requiredTests.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Optionale Prüfungen:</span>
              <span className="font-medium">{plan.optional_tests?.length || 0}</span>
            </div>
            {plan.last_validated_at && (
              <div className="flex justify-between">
                <span>Letzte Validierung:</span>
                <span className="font-medium">
                  {new Date(plan.last_validated_at).toLocaleDateString('de-DE')}
                </span>
              </div>
            )}
          </div>
        </div>

        {!readOnly && onUpdate && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPlan(prev => ({ ...prev, test_status: 'in_progress' }))
              }}
            >
              Als &quot;In Bearbeitung&quot; markieren
            </Button>
            <Button
              onClick={() => onUpdate(plan)}
              disabled={Object.keys(plan.test_results || {}).length < requiredTests.length}
            >
              Prüfplan aktualisieren
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}