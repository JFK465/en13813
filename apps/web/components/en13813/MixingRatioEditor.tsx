'use client'

import { useState } from 'react'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export interface RawMaterial {
  id: string
  name: string
  type: 'binder' | 'aggregate' | 'additive' | 'admixture' | 'water'
  unit: 'kg' | 'l' | 'ml' | 'g'
  amount: number
  percentage?: number
  supplier?: string
  batchNumber?: string
  certificate?: string
}

interface MixingRatioEditorProps {
  recipeId?: string
  recipeName?: string
  materials: RawMaterial[]
  onChange: (materials: RawMaterial[]) => void
  readOnly?: boolean
}

const MATERIAL_TYPES = [
  { value: 'binder', label: 'Bindemittel' },
  { value: 'aggregate', label: 'Zuschlagstoff' },
  { value: 'additive', label: 'Zusatzstoff' },
  { value: 'admixture', label: 'Zusatzmittel' },
  { value: 'water', label: 'Wasser' }
]

const UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'l', label: 'Liter' },
  { value: 'ml', label: 'ml' },
  { value: 'g', label: 'g' }
]

export function MixingRatioEditor({ 
  recipeId, 
  recipeName, 
  materials, 
  onChange, 
  readOnly = false 
}: MixingRatioEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMaterial, setNewMaterial] = useState<Partial<RawMaterial>>({
    type: 'aggregate',
    unit: 'kg',
    amount: 0
  })

  const calculateTotalWeight = () => {
    return materials
      .filter(m => m.unit === 'kg' || m.unit === 'g')
      .reduce((sum, m) => {
        const weight = m.unit === 'g' ? m.amount / 1000 : m.amount
        return sum + weight
      }, 0)
  }

  const calculatePercentages = () => {
    const totalWeight = calculateTotalWeight()
    if (totalWeight === 0) return materials

    return materials.map(m => {
      if (m.unit === 'kg' || m.unit === 'g') {
        const weight = m.unit === 'g' ? m.amount / 1000 : m.amount
        return { ...m, percentage: (weight / totalWeight) * 100 }
      }
      return m
    })
  }

  const addMaterial = () => {
    if (!newMaterial.name || !newMaterial.amount) {
      return
    }

    const material: RawMaterial = {
      id: `mat_${Date.now()}`,
      name: newMaterial.name,
      type: newMaterial.type as any,
      unit: newMaterial.unit as any,
      amount: newMaterial.amount,
      supplier: newMaterial.supplier,
      batchNumber: newMaterial.batchNumber,
      certificate: newMaterial.certificate
    }

    const updatedMaterials = [...materials, material]
    onChange(calculatePercentages(updatedMaterials))
    
    setNewMaterial({
      type: 'aggregate',
      unit: 'kg',
      amount: 0
    })
    setShowAddForm(false)
  }

  const removeMaterial = (id: string) => {
    const updatedMaterials = materials.filter(m => m.id !== id)
    onChange(calculatePercentages(updatedMaterials))
  }

  const updateMaterial = (id: string, field: keyof RawMaterial, value: any) => {
    const updatedMaterials = materials.map(m => {
      if (m.id === id) {
        return { ...m, [field]: value }
      }
      return m
    })
    onChange(calculatePercentages(updatedMaterials))
  }

  const totalWeight = calculateTotalWeight()
  const binderAmount = materials
    .filter(m => m.type === 'binder' && (m.unit === 'kg' || m.unit === 'g'))
    .reduce((sum, m) => {
      const weight = m.unit === 'g' ? m.amount / 1000 : m.amount
      return sum + weight
    }, 0)
  const waterAmount = materials
    .filter(m => m.type === 'water')
    .reduce((sum, m) => {
      if (m.unit === 'l' || m.unit === 'ml') {
        return sum + (m.unit === 'ml' ? m.amount / 1000 : m.amount)
      }
      return sum
    }, 0)
  
  const waterCementRatio = binderAmount > 0 ? (waterAmount / binderAmount).toFixed(2) : '-'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Mischungsverhältnisse
        </CardTitle>
        {recipeName && (
          <p className="text-sm text-muted-foreground">
            Rezeptur: {recipeName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>EN 13813 Anforderung:</strong> Vollständige Dokumentation aller Rohstoffe mit Mengenangaben, 
            Lieferantendaten und Chargennummern für lückenlose Rückverfolgbarkeit.
          </AlertDescription>
        </Alert>

        {/* Kennzahlen */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Gesamtgewicht</p>
            <p className="text-lg font-semibold">{totalWeight.toFixed(1)} kg</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Bindemittel</p>
            <p className="text-lg font-semibold">{binderAmount.toFixed(1)} kg</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Wasser</p>
            <p className="text-lg font-semibold">{waterAmount.toFixed(1)} l</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">w/z-Wert</p>
            <p className="text-lg font-semibold">{waterCementRatio}</p>
          </div>
        </div>

        {/* Materialien-Tabelle */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Menge</TableHead>
                <TableHead>Anteil</TableHead>
                <TableHead>Lieferant</TableHead>
                <TableHead>Charge</TableHead>
                {!readOnly && <TableHead className="w-[50px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    {readOnly ? (
                      material.name
                    ) : (
                      <Input
                        value={material.name}
                        onChange={(e) => updateMaterial(material.id, 'name', e.target.value)}
                        className="w-full"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      MATERIAL_TYPES.find(t => t.value === material.type)?.label
                    ) : (
                      <Select
                        value={material.type}
                        onValueChange={(v) => updateMaterial(material.id, 'type', v)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIAL_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      `${material.amount} ${material.unit}`
                    ) : (
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          value={material.amount}
                          onChange={(e) => updateMaterial(material.id, 'amount', parseFloat(e.target.value))}
                          className="w-20"
                        />
                        <Select
                          value={material.unit}
                          onValueChange={(v) => updateMaterial(material.id, 'unit', v)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS.map(unit => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {material.percentage ? `${material.percentage.toFixed(1)}%` : '-'}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      material.supplier || '-'
                    ) : (
                      <Input
                        value={material.supplier || ''}
                        onChange={(e) => updateMaterial(material.id, 'supplier', e.target.value)}
                        placeholder="Lieferant"
                        className="w-full"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      material.batchNumber || '-'
                    ) : (
                      <Input
                        value={material.batchNumber || ''}
                        onChange={(e) => updateMaterial(material.id, 'batchNumber', e.target.value)}
                        placeholder="Charge"
                        className="w-full"
                      />
                    )}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeMaterial(material.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              
              {materials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={readOnly ? 6 : 7} className="text-center text-muted-foreground py-8">
                    Keine Materialien erfasst
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Form */}
        {!readOnly && (
          <>
            {showAddForm ? (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Material *</Label>
                    <Input
                      value={newMaterial.name || ''}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                      placeholder="z.B. CEM I 42,5 R"
                    />
                  </div>
                  <div>
                    <Label>Typ *</Label>
                    <Select
                      value={newMaterial.type}
                      onValueChange={(v) => setNewMaterial({ ...newMaterial, type: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIAL_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Menge *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={newMaterial.amount || ''}
                        onChange={(e) => setNewMaterial({ ...newMaterial, amount: parseFloat(e.target.value) })}
                      />
                      <Select
                        value={newMaterial.unit}
                        onValueChange={(v) => setNewMaterial({ ...newMaterial, unit: v as any })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(unit => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Lieferant</Label>
                    <Input
                      value={newMaterial.supplier || ''}
                      onChange={(e) => setNewMaterial({ ...newMaterial, supplier: e.target.value })}
                      placeholder="Lieferantenname"
                    />
                  </div>
                  <div>
                    <Label>Chargennummer</Label>
                    <Input
                      value={newMaterial.batchNumber || ''}
                      onChange={(e) => setNewMaterial({ ...newMaterial, batchNumber: e.target.value })}
                      placeholder="z.B. 2024-001"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addMaterial} disabled={!newMaterial.name || !newMaterial.amount}>
                    Material hinzufügen
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      setNewMaterial({ type: 'aggregate', unit: 'kg', amount: 0 })
                    }}
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => setShowAddForm(true)} 
                variant="outline" 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Material hinzufügen
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}