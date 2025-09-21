'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calculator,
  FlaskConical,
  ClipboardCheck,
  TrendingUp,
  Building,
  Shield,
  Flame,
  Droplets,
  Zap,
  Activity
} from 'lucide-react'
import { TestReportEN13813, EN13813_CLASSES } from '@/modules/en13813/services/test-reports-en13813-complete.service'

interface TestReportEN13813FormProps {
  recipeId: string
  reportType: 'ITT' | 'FPC' | 'External' | 'Audit'
  estrichType: string
  onSubmit: (report: Partial<TestReportEN13813>) => Promise<void>
  initialData?: Partial<TestReportEN13813>
}

export default function TestReportEN13813Form({
  recipeId,
  reportType,
  estrichType,
  onSubmit,
  initialData
}: TestReportEN13813FormProps) {
  const [formData, setFormData] = useState<Partial<TestReportEN13813>>(initialData || {
    recipe_id: recipeId,
    report_type: reportType,
    test_date: new Date().toISOString().split('T')[0],
    report_date: new Date().toISOString().split('T')[0],
    sampling_date: new Date().toISOString().split('T')[0],
    valid_from: new Date().toISOString().split('T')[0],
    test_results: {},
    special_characteristics: {}
  })

  const [activeTab, setActiveTab] = useState('general')
  const [validationErrors, setValidationErrors] = useState<any[]>([])
  const [isCalculating, setIsCalculating] = useState(false)

  // Bestimme erforderliche Tests basierend auf Estrichtyp
  const getRequiredTests = () => {
    const tests = []
    
    // Normative Tests nach Tabelle 1
    if (estrichType !== 'AS') {
      tests.push('compressive_strength', 'flexural_strength')
    }
    
    if (estrichType === 'CA') {
      tests.push('ph_value')
    }
    
    if (estrichType === 'MA') {
      tests.push('surface_hardness')
    }
    
    if (estrichType === 'AS') {
      tests.push('resistance_to_indentation')
    }
    
    if (estrichType === 'SR') {
      tests.push('bond_strength')
    }
    
    return tests
  }

  const requiredTests = getRequiredTests()

  // Berechne charakteristischen Wert (5% Fraktil)
  const calculateCharacteristicValue = (values: number[]): number => {
    if (!values || values.length === 0) return 0
    if (values.length < 3) return Math.min(...values)
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1)
    const stdDev = Math.sqrt(variance)
    
    // k-Faktor für 5% Fraktil bei normaler Verteilung
    const kFactor = 1.64
    
    return mean - kFactor * stdDev
  }

  // Bestimme tatsächliche Klasse basierend auf Wert
  const determineActualClass = (value: number, property: string): string => {
    const classes = EN13813_CLASSES[property as keyof typeof EN13813_CLASSES]
    if (!classes) return 'NPD'
    
    if (Array.isArray(classes)) {
      // Finde passende Klasse
      for (const cls of classes.reverse()) {
        const classValue = parseFloat(cls.replace(/[A-Z]/g, ''))
        if (value >= classValue) return cls
      }
    }
    
    return 'NPD'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsCalculating(true)
      
      // Validiere Pflichtfelder
      const errors = []
      
      if (!formData.test_lab) {
        errors.push({ field: 'test_lab', error: 'Prüflabor ist erforderlich' })
      }
      
      if (!formData.report_number) {
        errors.push({ field: 'report_number', error: 'Berichtsnummer ist erforderlich' })
      }
      
      // Prüfe erforderliche Tests
      for (const test of requiredTests) {
        if (!formData.test_results?.[test]) {
          errors.push({ 
            field: test, 
            error: `${test.replace('_', ' ')} ist erforderlich für ${estrichType}` 
          })
        }
      }
      
      // pH-Wert Validierung für CA
      if (estrichType === 'CA' && formData.test_results?.ph_value) {
        const phValue = formData.test_results.ph_value.ph_value
        if (phValue < 7) {
          errors.push({ 
            field: 'ph_value', 
            error: 'pH-Wert muss ≥ 7 für Calciumsulfat-Estriche sein' 
          })
        }
      }
      
      setValidationErrors(errors)
      
      if (errors.length === 0) {
        await onSubmit(formData)
      }
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general">
            <FileText className="w-4 h-4 mr-2" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="sampling">
            <FlaskConical className="w-4 h-4 mr-2" />
            Probenahme
          </TabsTrigger>
          <TabsTrigger value="main-properties">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Haupteigenschaften
          </TabsTrigger>
          <TabsTrigger value="special">
            <Shield className="w-4 h-4 mr-2" />
            Spezialeigenschaften
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Statistik
          </TabsTrigger>
          <TabsTrigger value="fpc">
            <Building className="w-4 h-4 mr-2" />
            FPC
          </TabsTrigger>
        </TabsList>

        {/* Allgemeine Informationen */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Informationen</CardTitle>
              <CardDescription>Grunddaten des Prüfberichts nach EN 13813</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Berichtstyp</Label>
                  <Badge variant="outline" className="mt-2">
                    {reportType}
                  </Badge>
                </div>
                <div>
                  <Label>AVCP System</Label>
                  <Select
                    value={formData.avcp_system}
                    onValueChange={(value) => setFormData({...formData, avcp_system: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle System" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">System 1</SelectItem>
                      <SelectItem value="1+">System 1+</SelectItem>
                      <SelectItem value="3">System 3</SelectItem>
                      <SelectItem value="4">System 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Prüflabor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name des Prüflabors*</Label>
                    <Input
                      value={formData.test_lab || ''}
                      onChange={(e) => setFormData({...formData, test_lab: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Adresse*</Label>
                    <Input
                      value={formData.test_lab_address || ''}
                      onChange={(e) => setFormData({...formData, test_lab_address: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Akkreditierung</Label>
                    <Input
                      value={formData.test_lab_accreditation || ''}
                      onChange={(e) => setFormData({...formData, test_lab_accreditation: e.target.value})}
                      placeholder="z.B. DAkkS D-PL-12345"
                    />
                  </div>
                  {(formData.avcp_system === '1' || formData.avcp_system === '1+' || formData.avcp_system === '3') && (
                    <>
                      <div>
                        <Label>Notified Body Nummer*</Label>
                        <Input
                          value={formData.notified_body_number || ''}
                          onChange={(e) => setFormData({...formData, notified_body_number: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label>Notified Body Name*</Label>
                        <Input
                          value={formData.notified_body_name || ''}
                          onChange={(e) => setFormData({...formData, notified_body_name: e.target.value})}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Identifikation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Berichtsnummer*</Label>
                    <Input
                      value={formData.report_number || ''}
                      onChange={(e) => setFormData({...formData, report_number: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Berichtsdatum*</Label>
                    <Input
                      type="date"
                      value={formData.report_date || ''}
                      onChange={(e) => setFormData({...formData, report_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Prüfdatum*</Label>
                    <Input
                      type="date"
                      value={formData.test_date || ''}
                      onChange={(e) => setFormData({...formData, test_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Probenahmezeitpunkt*</Label>
                    <Input
                      type="date"
                      value={formData.sampling_date || ''}
                      onChange={(e) => setFormData({...formData, sampling_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Probenahme */}
        <TabsContent value="sampling">
          <Card>
            <CardHeader>
              <CardTitle>Probenahme nach EN 13892-1</CardTitle>
              <CardDescription>Details zur Probenahme und -vorbereitung</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Probenahmeverfahren*</Label>
                  <Select
                    value={formData.sampling?.sampling_method}
                    onValueChange={(value) => setFormData({
                      ...formData,
                      sampling: {...formData.sampling, sampling_method: value as any}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle Verfahren" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Zufällig</SelectItem>
                      <SelectItem value="representative">Repräsentativ</SelectItem>
                      <SelectItem value="targeted">Gezielt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Probenahmeort*</Label>
                  <Input
                    value={formData.sampling?.sampling_location || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      sampling: {...formData.sampling, sampling_location: e.target.value}
                    })}
                    required
                  />
                </div>
                <div>
                  <Label>Probenehmer*</Label>
                  <Input
                    value={formData.sampling?.sampler_name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      sampling: {...formData.sampling, sampler_name: e.target.value}
                    })}
                    required
                  />
                </div>
                <div>
                  <Label>Qualifikation</Label>
                  <Input
                    value={formData.sampling?.sampler_qualification || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      sampling: {...formData.sampling, sampler_qualification: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label>Anzahl Proben*</Label>
                  <Input
                    type="number"
                    value={formData.sampling?.number_of_samples || 3}
                    onChange={(e) => setFormData({
                      ...formData,
                      sampling: {...formData.sampling, number_of_samples: parseInt(e.target.value)}
                    })}
                    min={1}
                    required
                  />
                </div>
                <div>
                  <Label>Probengröße (kg)*</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.sampling?.sample_size_kg || 5}
                    onChange={(e) => setFormData({
                      ...formData,
                      sampling: {...formData.sampling, sample_size_kg: parseFloat(e.target.value)}
                    })}
                    min={0.1}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Probenvorbereitung*</Label>
                  <Textarea
                    value={formData.sampling?.sample_preparation || 'Nach EN 13892-1'}
                    onChange={(e) => setFormData({
                      ...formData,
                      sampling: {...formData.sampling, sample_preparation: e.target.value}
                    })}
                    required
                  />
                </div>
                <div>
                  <Label>Lagerbedingungen*</Label>
                  <Input
                    value={formData.sampling?.storage_conditions || '20°C, 65% RH'}
                    onChange={(e) => setFormData({
                      ...formData,
                      sampling: {...formData.sampling, storage_conditions: e.target.value}
                    })}
                    required
                  />
                </div>
                <div>
                  <Label>Transportbedingungen</Label>
                  <Input
                    value={formData.sampling?.transport_conditions || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      sampling: {...formData.sampling, transport_conditions: e.target.value}
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Haupteigenschaften */}
        <TabsContent value="main-properties">
          <Card>
            <CardHeader>
              <CardTitle>Haupteigenschaften nach Tabelle 1</CardTitle>
              <CardDescription>Normative Prüfungen gemäß EN 13813</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Druckfestigkeit */}
              {estrichType !== 'AS' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Druckfestigkeit (EN 13892-2)
                    </h3>
                    {requiredTests.includes('compressive_strength') && (
                      <Badge variant="destructive">Pflicht</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Einzelwerte (N/mm²)</Label>
                      <Input
                        placeholder="z.B. 32.5, 33.1, 31.8"
                        onChange={(e) => {
                          const values = e.target.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v))
                          const mean = values.reduce((a, b) => a + b, 0) / values.length
                          const charValue = calculateCharacteristicValue(values)
                          const actualClass = determineActualClass(charValue, 'compressive_strength')
                          
                          setFormData({
                            ...formData,
                            test_results: {
                              ...formData.test_results,
                              compressive_strength: {
                                individual_values: values,
                                mean,
                                characteristic_value: charValue,
                                actual_class: actualClass,
                                norm: 'EN 13892-2',
                                age_days: 28,
                                passed: true
                              } as any
                            }
                          })
                        }}
                      />
                    </div>
                    <div>
                      <Label>Mittelwert</Label>
                      <Input
                        value={formData.test_results?.compressive_strength?.mean?.toFixed(1) || ''}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Charakteristischer Wert</Label>
                      <Input
                        value={formData.test_results?.compressive_strength?.characteristic_value?.toFixed(1) || ''}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Deklarierte Klasse</Label>
                      <Select
                        value={formData.test_results?.compressive_strength?.declared_class}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          test_results: {
                            ...formData.test_results,
                            compressive_strength: {
                              ...formData.test_results?.compressive_strength,
                              declared_class: value
                            } as any
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wähle Klasse" />
                        </SelectTrigger>
                        <SelectContent>
                          {EN13813_CLASSES.compressive_strength[estrichType as keyof typeof EN13813_CLASSES.compressive_strength]?.map(cls => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tatsächliche Klasse</Label>
                      <Badge className="mt-2">
                        {formData.test_results?.compressive_strength?.actual_class || 'NPD'}
                      </Badge>
                    </div>
                    <div>
                      <Label>Prüfalter (Tage)</Label>
                      <Input
                        type="number"
                        value={formData.test_results?.compressive_strength?.age_days || 28}
                        onChange={(e) => setFormData({
                          ...formData,
                          test_results: {
                            ...formData.test_results,
                            compressive_strength: {
                              ...formData.test_results?.compressive_strength,
                              age_days: parseInt(e.target.value)
                            } as any
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* pH-Wert für CA */}
              {estrichType === 'CA' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      pH-Wert (EN 13454-2)
                    </h3>
                    <Badge variant="destructive">Pflicht (≥ 7)</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>pH-Wert*</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={formData.test_results?.ph_value?.ph_value || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          setFormData({
                            ...formData,
                            test_results: {
                              ...formData.test_results,
                              ph_value: {
                                ph_value: value,
                                test_method: 'EN 13454-2',
                                minimum_requirement: 7,
                                passed: value >= 7
                              } as any
                            }
                          })
                        }}
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      {formData.test_results?.ph_value?.passed ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Bestanden
                        </Badge>
                      ) : formData.test_results?.ph_value ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          Nicht bestanden
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* Weitere Tests analog... */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spezialeigenschaften */}
        <TabsContent value="special">
          <Card>
            <CardHeader>
              <CardTitle>Spezialeigenschaften nach Abschnitt 5.3</CardTitle>
              <CardDescription>Optionale Eigenschaften bei regulatorischen Anforderungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Brandverhalten */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Brandverhalten (EN 13501-1)
                  </h3>
                  <Switch />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Euroklassifizierung</Label>
                    <Select
                      value={formData.special_characteristics?.reaction_to_fire?.euroclassification}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        special_characteristics: {
                          ...formData.special_characteristics,
                          reaction_to_fire: {
                            ...formData.special_characteristics?.reaction_to_fire,
                            euroclassification: value,
                            norm: 'EN 13501-1'
                          } as any
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wähle Klasse" />
                      </SelectTrigger>
                      <SelectContent>
                        {EN13813_CLASSES.reaction_to_fire.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Rauchklasse</Label>
                    <Select
                      value={formData.special_characteristics?.reaction_to_fire?.smoke_class}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        special_characteristics: {
                          ...formData.special_characteristics,
                          reaction_to_fire: {
                            ...formData.special_characteristics?.reaction_to_fire,
                            smoke_class: value as any
                          } as any
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="s1">s1</SelectItem>
                        <SelectItem value="s2">s2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prüfbericht Nr.</Label>
                    <Input
                      value={formData.special_characteristics?.reaction_to_fire?.test_report_number || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        special_characteristics: {
                          ...formData.special_characteristics,
                          reaction_to_fire: {
                            ...formData.special_characteristics?.reaction_to_fire,
                            test_report_number: e.target.value
                          } as any
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Elektrischer Widerstand */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Elektrischer Widerstand (EN 1081)
                  </h3>
                  <Switch />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Widerstand (Ω)</Label>
                    <Input
                      type="number"
                      value={formData.special_characteristics?.electrical_resistance?.resistance_ohm || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        special_characteristics: {
                          ...formData.special_characteristics,
                          electrical_resistance: {
                            ...formData.special_characteristics?.electrical_resistance,
                            resistance_ohm: parseFloat(e.target.value),
                            norm: 'EN 1081'
                          } as any
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Prüfspannung (V)</Label>
                    <Input
                      type="number"
                      value={formData.special_characteristics?.electrical_resistance?.test_voltage_V || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        special_characteristics: {
                          ...formData.special_characteristics,
                          electrical_resistance: {
                            ...formData.special_characteristics?.electrical_resistance,
                            test_voltage_V: parseFloat(e.target.value)
                          } as any
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Bezeichnung</Label>
                    <Input
                      value={formData.special_characteristics?.electrical_resistance?.designation || ''}
                      placeholder="z.B. ER10^5"
                      onChange={(e) => setFormData({
                        ...formData,
                        special_characteristics: {
                          ...formData.special_characteristics,
                          electrical_resistance: {
                            ...formData.special_characteristics?.electrical_resistance,
                            designation: e.target.value
                          } as any
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistische Auswertung */}
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Statistische Konformitätsbewertung</CardTitle>
              <CardDescription>Nach Abschnitt 9.2.2 der EN 13813</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Die statistische Auswertung erfordert mindestens 10 Prüfungen im Kontrollzeitraum.
                  Diese Funktion ist für kontinuierliche Produktionskontrolle (FPC) vorgesehen.
                </AlertDescription>
              </Alert>
              
              {reportType === 'FPC' && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Kontrollzeitraum Start</Label>
                      <Input
                        type="date"
                        value={formData.statistical_evaluation?.control_period_start || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          statistical_evaluation: {
                            ...formData.statistical_evaluation,
                            control_period_start: e.target.value
                          } as any
                        })}
                      />
                    </div>
                    <div>
                      <Label>Kontrollzeitraum Ende</Label>
                      <Input
                        type="date"
                        value={formData.statistical_evaluation?.control_period_end || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          statistical_evaluation: {
                            ...formData.statistical_evaluation,
                            control_period_end: e.target.value
                          } as any
                        })}
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Hier würde die statistische Auswertung durchgeführt
                      alert('Statistische Auswertung wird durchgeführt...')
                    }}
                    className="w-full"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Statistische Auswertung durchführen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FPC */}
        <TabsContent value="fpc">
          <Card>
            <CardHeader>
              <CardTitle>Factory Production Control</CardTitle>
              <CardDescription>Nach Abschnitt 6.3 der EN 13813</CardDescription>
            </CardHeader>
            <CardContent>
              {reportType === 'FPC' ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Qualitätsmanagement</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>QM-Handbuch Referenz*</Label>
                        <Input
                          value={formData.fpc_data?.quality_manual_reference || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            fpc_data: {
                              ...formData.fpc_data,
                              quality_manual_reference: e.target.value
                            } as any
                          })}
                        />
                      </div>
                      <div>
                        <Label>Verantwortliche Person*</Label>
                        <Input
                          value={formData.fpc_data?.production_control_system?.responsible_person || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            fpc_data: {
                              ...formData.fpc_data,
                              production_control_system: {
                                ...formData.fpc_data?.production_control_system,
                                responsible_person: e.target.value
                              } as any
                            } as any
                          })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.fpc_data?.production_control_system?.iso_9001_certified || false}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            fpc_data: {
                              ...formData.fpc_data,
                              production_control_system: {
                                ...formData.fpc_data?.production_control_system,
                                iso_9001_certified: checked
                              } as any
                            } as any
                          })}
                        />
                        <Label>ISO 9001 zertifiziert</Label>
                      </div>
                      {formData.fpc_data?.production_control_system?.iso_9001_certified && (
                        <div>
                          <Label>Zertifikatsnummer</Label>
                          <Input
                            value={formData.fpc_data?.production_control_system?.certification_number || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              fpc_data: {
                                ...formData.fpc_data,
                                production_control_system: {
                                  ...formData.fpc_data?.production_control_system,
                                  certification_number: e.target.value
                                } as any
                              } as any
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Prüffrequenzen</h3>
                    <Alert>
                      <AlertDescription>
                        Die Prüffrequenzen müssen gemäß Abschnitt 6.3.3.1 festgelegt werden.
                        Standard: 1 Prüfung pro 200 m³ oder 1 pro Woche.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Druckfestigkeit</span>
                        <span className="text-sm text-muted-foreground">1 pro 200 m³ / 1 pro Woche</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Biegezugfestigkeit</span>
                        <span className="text-sm text-muted-foreground">1 pro 200 m³ / 1 pro Woche</span>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Konsistenz</span>
                        <span className="text-sm text-muted-foreground">1 pro 50 m³ / 2 pro Tag</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    FPC-Daten sind nur für Factory Production Control Berichte relevant.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validierungsfehler */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error.error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-between">
        <Button type="button" variant="outline">
          Abbrechen
        </Button>
        <div className="space-x-2">
          <Button type="button" variant="outline">
            Als Entwurf speichern
          </Button>
          <Button type="submit" disabled={isCalculating}>
            {isCalculating ? 'Berechne...' : 'Prüfbericht erstellen'}
          </Button>
        </div>
      </div>
    </form>
  )
}