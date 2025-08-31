'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Calculator, Save } from 'lucide-react'
import { RecipeMaterials } from '@/modules/en13813/services/recipe-materials.service'

interface MaterialCompositionProps {
  recipeId: string
  materials?: RecipeMaterials
  onSave?: (materials: RecipeMaterials) => Promise<void>
  readOnly?: boolean
}

export function MaterialComposition({ 
  recipeId, 
  materials: initialMaterials, 
  onSave,
  readOnly = false 
}: MaterialCompositionProps) {
  const [materials, setMaterials] = useState<Partial<RecipeMaterials>>(
    initialMaterials || {
      recipe_id: recipeId,
      binder_type: 'CEM I 42.5 R',
      binder_designation: '',
      binder_amount_kg_m3: 320,
      water_binder_ratio: 0.5,
      additives: [],
      fresh_mortar_properties: {
        consistency: {
          method: 'flow_table',
          target_mm: 160,
          tolerance_mm: 10
        },
        setting_time: {
          initial_minutes: null,
          final_minutes: null
        },
        ph_value: null,
        processing_time_minutes: null,
        temperature_range: {
          min_celsius: 5,
          max_celsius: 30
        }
      }
    }
  )

  const [loading, setLoading] = useState(false)

  // Berechne W/B-Wert automatisch
  useEffect(() => {
    if (materials.water_content && materials.binder_amount_kg_m3) {
      const ratio = materials.water_content / materials.binder_amount_kg_m3
      setMaterials(prev => ({
        ...prev,
        water_binder_ratio: Math.round(ratio * 1000) / 1000
      }))
    }
  }, [materials.water_content, materials.binder_amount_kg_m3])

  const handleAddAdditive = () => {
    setMaterials(prev => ({
      ...prev,
      additives: [
        ...(prev.additives || []),
        { type: '', name: '', dosage_percent: 0, supplier: '' }
      ]
    }))
  }

  const handleRemoveAdditive = (index: number) => {
    setMaterials(prev => ({
      ...prev,
      additives: prev.additives?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSave = async () => {
    if (!onSave || readOnly) return
    
    setLoading(true)
    try {
      await onSave(materials as RecipeMaterials)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Materialzusammensetzung
        </CardTitle>
        <CardDescription>
          Detaillierte Rezeptur und Mischungsverhältnisse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="binder" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="binder">Bindemittel</TabsTrigger>
            <TabsTrigger value="aggregates">Zuschläge</TabsTrigger>
            <TabsTrigger value="additives">Zusätze</TabsTrigger>
            <TabsTrigger value="fresh">Frischmörtel</TabsTrigger>
          </TabsList>

          <TabsContent value="binder" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="binder_type">Bindemittel-Typ*</Label>
                <Input
                  id="binder_type"
                  value={materials.binder_type || ''}
                  onChange={(e) => setMaterials(prev => ({ ...prev, binder_type: e.target.value }))}
                  placeholder="z.B. CEM I 42.5 R"
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="binder_designation">Bezeichnung*</Label>
                <Input
                  id="binder_designation"
                  value={materials.binder_designation || ''}
                  onChange={(e) => setMaterials(prev => ({ ...prev, binder_designation: e.target.value }))}
                  placeholder="Handelsname"
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="binder_amount">Menge (kg/m³)*</Label>
                <Input
                  id="binder_amount"
                  type="number"
                  value={materials.binder_amount_kg_m3 || ''}
                  onChange={(e) => setMaterials(prev => ({ 
                    ...prev, 
                    binder_amount_kg_m3: parseFloat(e.target.value) 
                  }))}
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="binder_supplier">Lieferant</Label>
                <Input
                  id="binder_supplier"
                  value={materials.binder_supplier || ''}
                  onChange={(e) => setMaterials(prev => ({ ...prev, binder_supplier: e.target.value }))}
                  placeholder="Hersteller/Lieferant"
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="water_content">Wasserzugabe (l/m³)</Label>
                <Input
                  id="water_content"
                  type="number"
                  value={materials.water_content || ''}
                  onChange={(e) => setMaterials(prev => ({ 
                    ...prev, 
                    water_content: parseFloat(e.target.value) 
                  }))}
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label htmlFor="wb_ratio">W/B-Wert*</Label>
                <Input
                  id="wb_ratio"
                  type="number"
                  step="0.01"
                  value={materials.water_binder_ratio || ''}
                  onChange={(e) => setMaterials(prev => ({ 
                    ...prev, 
                    water_binder_ratio: parseFloat(e.target.value) 
                  }))}
                  disabled={readOnly}
                />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground">
                  {materials.water_content && materials.binder_amount_kg_m3 && (
                    <span>
                      Berechnet: {(materials.water_content / materials.binder_amount_kg_m3).toFixed(3)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="aggregates" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aggregate_type">Zuschlagstoff-Art</Label>
                <Select
                  value={materials.aggregate_type || ''}
                  onValueChange={(value) => setMaterials(prev => ({ ...prev, aggregate_type: value }))}
                  disabled={readOnly}
                >
                  <SelectTrigger id="aggregate_type">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural_sand">Natursand</SelectItem>
                    <SelectItem value="crushed_stone">Brechsand</SelectItem>
                    <SelectItem value="recycled">Recyclat</SelectItem>
                    <SelectItem value="lightweight">Leichtzuschlag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="aggregate_size">Max. Korngröße</Label>
                <Select
                  value={materials.aggregate_max_size || ''}
                  onValueChange={(value) => setMaterials(prev => ({ ...prev, aggregate_max_size: value }))}
                  disabled={readOnly}
                >
                  <SelectTrigger id="aggregate_size">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0/4">0/4 mm</SelectItem>
                    <SelectItem value="0/8">0/8 mm</SelectItem>
                    <SelectItem value="0/16">0/16 mm</SelectItem>
                    <SelectItem value="0/32">0/32 mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Sieblinie könnte hier ergänzt werden */}
            <div className="text-sm text-muted-foreground">
              Detaillierte Sieblinie kann in einer späteren Version erfasst werden
            </div>
          </TabsContent>

          <TabsContent value="additives" className="space-y-4">
            <div className="space-y-2">
              {materials.additives?.map((additive, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Typ</Label>
                    <Select
                      value={additive.type}
                      onValueChange={(value) => {
                        const updated = [...(materials.additives || [])]
                        updated[index] = { ...updated[index], type: value }
                        setMaterials(prev => ({ ...prev, additives: updated }))
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Typ wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plasticizer">Fließmittel</SelectItem>
                        <SelectItem value="retarder">Verzögerer</SelectItem>
                        <SelectItem value="accelerator">Beschleuniger</SelectItem>
                        <SelectItem value="air_entrainer">Luftporenbildner</SelectItem>
                        <SelectItem value="waterproofer">Dichtungsmittel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Bezeichnung</Label>
                    <Input
                      value={additive.name}
                      onChange={(e) => {
                        const updated = [...(materials.additives || [])]
                        updated[index] = { ...updated[index], name: e.target.value }
                        setMaterials(prev => ({ ...prev, additives: updated }))
                      }}
                      placeholder="Produktname"
                      disabled={readOnly}
                    />
                  </div>
                  <div className="w-32">
                    <Label>Dosierung (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={additive.dosage_percent}
                      onChange={(e) => {
                        const updated = [...(materials.additives || [])]
                        updated[index] = { ...updated[index], dosage_percent: parseFloat(e.target.value) }
                        setMaterials(prev => ({ ...prev, additives: updated }))
                      }}
                      disabled={readOnly}
                    />
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAdditive(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAdditive}
              >
                <Plus className="mr-2 h-4 w-4" />
                Zusatzmittel hinzufügen
              </Button>
            )}

            {/* Fasern */}
            <div className="pt-4 border-t">
              <Label className="text-base font-medium">Fasern (optional)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="fiber_type">Fasertyp</Label>
                  <Select
                    value={materials.fibers?.type || ''}
                    onValueChange={(value) => setMaterials(prev => ({
                      ...prev,
                      fibers: { ...prev.fibers, type: value as any } as any
                    }))}
                    disabled={readOnly}
                  >
                    <SelectTrigger id="fiber_type">
                      <SelectValue placeholder="Keine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine</SelectItem>
                      <SelectItem value="steel">Stahlfasern</SelectItem>
                      <SelectItem value="polymer">Polymerfasern</SelectItem>
                      <SelectItem value="glass">Glasfasern</SelectItem>
                      <SelectItem value="other">Andere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {materials.fibers?.type && materials.fibers.type !== 'none' && (
                  <>
                    <div>
                      <Label htmlFor="fiber_length">Länge (mm)</Label>
                      <Input
                        id="fiber_length"
                        type="number"
                        value={materials.fibers?.length_mm || ''}
                        onChange={(e) => setMaterials(prev => ({
                          ...prev,
                          fibers: { ...prev.fibers, length_mm: parseFloat(e.target.value) } as any
                        }))}
                        disabled={readOnly}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fiber_dosage">Dosierung (kg/m³)</Label>
                      <Input
                        id="fiber_dosage"
                        type="number"
                        value={materials.fibers?.dosage_kg_m3 || ''}
                        onChange={(e) => setMaterials(prev => ({
                          ...prev,
                          fibers: { ...prev.fibers, dosage_kg_m3: parseFloat(e.target.value) } as any
                        }))}
                        disabled={readOnly}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fresh" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Konsistenz-Prüfverfahren</Label>
                <Select
                  value={materials.fresh_mortar_properties?.consistency?.method || 'flow_table'}
                  onValueChange={(value) => setMaterials(prev => ({
                    ...prev,
                    fresh_mortar_properties: {
                      ...prev.fresh_mortar_properties,
                      consistency: {
                        ...prev.fresh_mortar_properties?.consistency,
                        method: value as any
                      }
                    } as any
                  }))}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flow_table">Ausbreitmaß</SelectItem>
                    <SelectItem value="slump">Setzmaß</SelectItem>
                    <SelectItem value="compacting_factor">Verdichtungsmaß</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Zielwert (mm)</Label>
                <Input
                  type="number"
                  value={materials.fresh_mortar_properties?.consistency?.target_mm || ''}
                  onChange={(e) => setMaterials(prev => ({
                    ...prev,
                    fresh_mortar_properties: {
                      ...prev.fresh_mortar_properties,
                      consistency: {
                        ...prev.fresh_mortar_properties?.consistency,
                        target_mm: parseFloat(e.target.value)
                      }
                    } as any
                  }))}
                  placeholder="z.B. 160"
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Erstarrungsbeginn (min)</Label>
                <Input
                  type="number"
                  value={materials.fresh_mortar_properties?.setting_time?.initial_minutes || ''}
                  onChange={(e) => setMaterials(prev => ({
                    ...prev,
                    fresh_mortar_properties: {
                      ...prev.fresh_mortar_properties,
                      setting_time: {
                        ...prev.fresh_mortar_properties?.setting_time,
                        initial_minutes: parseFloat(e.target.value)
                      }
                    } as any
                  }))}
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label>Erstarrungsende (min)</Label>
                <Input
                  type="number"
                  value={materials.fresh_mortar_properties?.setting_time?.final_minutes || ''}
                  onChange={(e) => setMaterials(prev => ({
                    ...prev,
                    fresh_mortar_properties: {
                      ...prev.fresh_mortar_properties,
                      setting_time: {
                        ...prev.fresh_mortar_properties?.setting_time,
                        final_minutes: parseFloat(e.target.value)
                      }
                    } as any
                  }))}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>pH-Wert</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={materials.fresh_mortar_properties?.ph_value || ''}
                  onChange={(e) => setMaterials(prev => ({
                    ...prev,
                    fresh_mortar_properties: {
                      ...prev.fresh_mortar_properties,
                      ph_value: parseFloat(e.target.value)
                    } as any
                  }))}
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label>Verarbeitungszeit (min)</Label>
                <Input
                  type="number"
                  value={materials.fresh_mortar_properties?.processing_time_minutes || ''}
                  onChange={(e) => setMaterials(prev => ({
                    ...prev,
                    fresh_mortar_properties: {
                      ...prev.fresh_mortar_properties,
                      processing_time_minutes: parseFloat(e.target.value)
                    } as any
                  }))}
                  disabled={readOnly}
                />
              </div>
              <div>
                <Label>Temperaturbereich (°C)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={materials.fresh_mortar_properties?.temperature_range?.min_celsius || ''}
                    onChange={(e) => setMaterials(prev => ({
                      ...prev,
                      fresh_mortar_properties: {
                        ...prev.fresh_mortar_properties,
                        temperature_range: {
                          ...prev.fresh_mortar_properties?.temperature_range,
                          min_celsius: parseFloat(e.target.value)
                        }
                      } as any
                    }))}
                    disabled={readOnly}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={materials.fresh_mortar_properties?.temperature_range?.max_celsius || ''}
                    onChange={(e) => setMaterials(prev => ({
                      ...prev,
                      fresh_mortar_properties: {
                        ...prev.fresh_mortar_properties,
                        temperature_range: {
                          ...prev.fresh_mortar_properties?.temperature_range,
                          max_celsius: parseFloat(e.target.value)
                        }
                      } as any
                    }))}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {!readOnly && onSave && (
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Speichern...' : 'Materialzusammensetzung speichern'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}