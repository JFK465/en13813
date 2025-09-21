'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Calculator, AlertTriangle, CheckCircle2, Plus, Trash2, ChevronDown, ChevronRight, Package, FlaskConical, Microscope, Archive, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'
import { format, addYears } from 'date-fns'
import { MixingRatioEditor, RawMaterial } from '@/components/en13813/MixingRatioEditor'

interface Recipe {
  id: string
  name: string
  recipe_code: string
  version: number
  compressive_strength_class: string
  flexural_strength_class: string
  wear_resistance_method?: string
  wear_resistance_bohme_class?: string
  wear_resistance_bca_class?: string
  wear_resistance_rwa_class?: string
}

interface ZusatzmittelCharge {
  id: string
  produkt: string
  charge: string
  lieferant: string
}

export default function NewBatchPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingNumber, setGeneratingNumber] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [mixingRatioMaterials, setMixingRatioMaterials] = useState<RawMaterial[]>([])
  
  // Collapsible states
  const [openSections, setOpenSections] = useState({
    grunddaten: true,
    rohstoffe: true,
    qc: false,
    pruefkoerper: false,
    rueckstellung: false,
    konformitaet: false
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }
  
  const [formData, setFormData] = useState({
    // Grunddaten
    recipe_id: '',
    recipe_version: 0,
    batch_number: '',
    production_date: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    quantity_tons: '',
    production_site: '',
    status: 'produced',
    deviation_notes: '',
    mixer_id: '',
    itt_reference: '',

    // CE/Lieferschein-Infos
    ce_delivery_info: {
      designation: '',
      max_grain_size: '',
      thickness_range: '',
      mixing_instructions: '',
      processing_instructions: '',
      safety_instructions: '',
      manufacturer_address: '',
      shelf_life: '',
      storage_conditions: ''
    },
    
    // Rohstoffe
    raw_materials: {
      zement_charge: '',
      zement_lieferdatum: '',
      zement_lieferant: '',
      zuschlag_charge: '',
      zuschlag_lieferdatum: '',
      zuschlag_lieferant: '',
      zusatzmittel_charges: [] as ZusatzmittelCharge[]
    },
    
    // QC-Daten
    qc_data: {
      compressive_strength_28d: '',
      flexural_strength_28d: '',
      compressive_strength_7d: '',
      flexural_strength_7d: '',
      flow_diameter: '',
      density: '',
      temperature: '',
      humidity: '',
      w_c_ratio: '',
      air_content: '',
      setting_time_initial: '',
      setting_time_final: '',
      test_date: '',
      tested_by: ''
    },
    
    // Verschleißprüfung
    wear_test: {
      methode: '',
      ergebnis: '',
      pruefnorm: '',
      datum: ''
    },
    
    // Prüfkörper
    test_specimens: {
      anzahl_hergestellt: '',
      kennzeichnung: '',
      lagerung: 'Wasserbad 20°C',
      probenahmedatum: '',
      probenahme_ort: '',
      pruefnorm_version: 'EN 13892-2:2002',
      pruefplan: {
        '7_tage': '3',
        '28_tage': '3',
        'reserve': '3'
      }
    },
    
    // Rückstellmuster
    retention_sample: {
      entnommen: false,
      menge: '2 kg',
      lagerort: '',
      aufbewahrung_bis: format(addYears(new Date(), 2), 'yyyy-MM-dd'),
      entnahme_datum: format(new Date(), 'yyyy-MM-dd')
    },
    
    // Produktionsbedingungen
    production_conditions: {
      mischer_kalibrierung: '',
      waagen_kalibrierung: '',
      aussentemperatur: '',
      materialtemperatur: '',
      luftfeuchtigkeit: ''
    }
  })

  useEffect(() => {
    loadRecipes()
  }, [])

  useEffect(() => {
    if (formData.recipe_id && !formData.batch_number) {
      generateBatchNumber()
    }
  }, [formData.recipe_id])

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('en13813_recipes')
        .select('*')
        .order('name')

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error('Error loading recipes:', error)
      toast({
        title: 'Fehler',
        description: 'Rezepturen konnten nicht geladen werden',
        variant: 'destructive'
      })
    }
  }

  const generateBatchNumber = async () => {
    if (!formData.recipe_id) return
    
    setGeneratingNumber(true)
    try {
      const recipe = recipes.find(r => r.id === formData.recipe_id)
      if (!recipe) return

      const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      
      const { count } = await supabase
        .from('en13813_batches')
        .select('id', { count: 'exact', head: true })
        .eq('recipe_id', formData.recipe_id)
        .gte('production_date', startOfDay.toISOString())

      const sequence = String((count || 0) + 1).padStart(3, '0')
      const batchNumber = `${date}-${recipe.recipe_code}-${sequence}`
      
      setFormData(prev => ({ ...prev, batch_number: batchNumber }))
      
      // Auto-fill test specimen identification
      setFormData(prev => ({
        ...prev,
        test_specimens: {
          ...prev.test_specimens,
          kennzeichnung: `${batchNumber}-A bis I`
        }
      }))
    } catch (error) {
      console.error('Error generating batch number:', error)
    } finally {
      setGeneratingNumber(false)
    }
  }

  const addZusatzmittel = () => {
    const newZusatz: ZusatzmittelCharge = {
      id: crypto.randomUUID(),
      produkt: '',
      charge: '',
      lieferant: ''
    }
    
    setFormData(prev => ({
      ...prev,
      raw_materials: {
        ...prev.raw_materials,
        zusatzmittel_charges: [...prev.raw_materials.zusatzmittel_charges, newZusatz]
      }
    }))
  }

  const removeZusatzmittel = (id: string) => {
    setFormData(prev => ({
      ...prev,
      raw_materials: {
        ...prev.raw_materials,
        zusatzmittel_charges: prev.raw_materials.zusatzmittel_charges.filter(z => z.id !== id)
      }
    }))
  }

  const updateZusatzmittel = (id: string, field: keyof ZusatzmittelCharge, value: string) => {
    setFormData(prev => ({
      ...prev,
      raw_materials: {
        ...prev.raw_materials,
        zusatzmittel_charges: prev.raw_materials.zusatzmittel_charges.map(z => 
          z.id === id ? { ...z, [field]: value } : z
        )
      }
    }))
  }

  const validateForm = (): boolean => {
    const errors: string[] = []
    
    if (!formData.recipe_id) errors.push('Rezeptur muss ausgewählt werden')
    if (!formData.batch_number) errors.push('Chargennummer fehlt')
    if (!formData.production_date) errors.push('Produktionsdatum fehlt')
    
    // Rohstoffe (kritisch für Rückverfolgbarkeit)
    if (!formData.raw_materials.zement_charge) {
      errors.push('Zement-Chargennummer für Rückverfolgbarkeit erforderlich')
    }
    
    // Prüfkörper bei QC-Daten
    if (formData.qc_data.compressive_strength_28d || formData.qc_data.flexural_strength_28d) {
      if (!formData.test_specimens.anzahl_hergestellt) {
        errors.push('Anzahl Prüfkörper muss bei QC-Prüfung angegeben werden')
      }
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const calculateConformity = () => {
    const recipe = recipes.find(r => r.id === formData.recipe_id)
    if (!recipe) return null

    const minCompressive = parseInt(recipe.compressive_strength_class.replace('C', ''))
    const minFlexural = parseInt(recipe.flexural_strength_class.replace('F', ''))
    
    const conformity = {
      druckfestigkeit: {
        soll: minCompressive,
        ist: parseFloat(formData.qc_data.compressive_strength_28d) || 0,
        toleranz: '≥ deklariert',
        status: ''
      },
      biegezug: {
        soll: minFlexural,
        ist: parseFloat(formData.qc_data.flexural_strength_28d) || 0,
        toleranz: '≥ deklariert',
        status: ''
      }
    }
    
    conformity.druckfestigkeit.status = 
      conformity.druckfestigkeit.ist >= conformity.druckfestigkeit.soll ? 'PASS' : 'FAIL'
    conformity.biegezug.status = 
      conformity.biegezug.ist >= conformity.biegezug.soll ? 'PASS' : 'FAIL'
    
    return conformity
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: 'Validierungsfehler',
        description: 'Bitte prüfen Sie die markierten Felder',
        variant: 'destructive'
      })
      // Open sections with errors
      if (!formData.raw_materials.zement_charge) {
        setOpenSections(prev => ({ ...prev, rohstoffe: true }))
      }
      return
    }
    
    setLoading(true)

    try {
      // Prepare QC data
      const qcData: any = {}
      Object.entries(formData.qc_data).forEach(([key, value]) => {
        if (value !== '') {
          if (['compressive_strength_28d', 'flexural_strength_28d', 'compressive_strength_7d',
               'flexural_strength_7d', 'flow_diameter', 'density', 'temperature', 'humidity',
               'w_c_ratio', 'air_content', 'setting_time_initial', 'setting_time_final'].includes(key)) {
            qcData[key] = parseFloat(value)
          } else {
            qcData[key] = value
          }
        }
      })

      // Calculate conformity
      const conformity = calculateConformity()

      // Prepare batch data
      const batchData = {
        recipe_id: formData.recipe_id,
        recipe_version: formData.recipe_version,
        batch_number: formData.batch_number,
        production_date: formData.production_date,
        quantity_tons: formData.quantity_tons ? parseFloat(formData.quantity_tons) : null,
        production_site: formData.production_site || null,
        status: formData.status,
        deviation_notes: formData.deviation_notes || null,
        mixer_id: formData.mixer_id || null,
        itt_reference: formData.itt_reference || null,
        qc_data: qcData,
        raw_materials: formData.raw_materials,
        test_specimens: formData.test_specimens.anzahl_hergestellt ? formData.test_specimens : {},
        wear_test: formData.wear_test.methode ? formData.wear_test : {},
        retention_sample: formData.retention_sample.entnommen ? formData.retention_sample : {},
        production_conditions: formData.production_conditions,
        ce_delivery_info: formData.ce_delivery_info,
        conformity_check: conformity,
        external_temperature: formData.production_conditions.aussentemperatur ?
          parseFloat(formData.production_conditions.aussentemperatur) : null,
        material_temperature: formData.production_conditions.materialtemperatur ?
          parseFloat(formData.production_conditions.materialtemperatur) : null
      }

      const { error } = await supabase
        .from('en13813_batches')
        .insert(batchData)

      if (error) throw error

      toast({
        title: 'Erfolg',
        description: `Charge ${formData.batch_number} wurde erstellt`
      })

      router.push('/en13813/batches')
    } catch (error: any) {
      console.error('Error creating batch:', error)
      toast({
        title: 'Fehler',
        description: error.message || 'Charge konnte nicht erstellt werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedRecipe = recipes.find(r => r.id === formData.recipe_id)
  const showWearTest = selectedRecipe && (
    selectedRecipe.wear_resistance_method && 
    selectedRecipe.wear_resistance_method !== 'none'
  )

  // Check if QC data exists
  const hasQcData = formData.qc_data.compressive_strength_28d || formData.qc_data.flexural_strength_28d

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/en13813/batches">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Neue Charge anlegen</h1>
          <p className="text-muted-foreground">Vollständige Chargenerfassung nach EN 13813</p>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Validierungsfehler</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grunddaten - Immer sichtbar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Grunddaten
            </CardTitle>
            <CardDescription>Allgemeine Informationen zur Charge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipe">Rezeptur *</Label>
                <Select
                  value={formData.recipe_id}
                  onValueChange={(value) => {
                    const recipe = recipes.find(r => r.id === value)
                    setFormData(prev => ({
                      ...prev,
                      recipe_id: value,
                      recipe_version: recipe?.version || 0
                    }))
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rezeptur auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name} ({recipe.recipe_code}) v{recipe.version || 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRecipe && (
                  <div className="text-sm text-muted-foreground">
                    Anforderungen: {selectedRecipe.compressive_strength_class} / {selectedRecipe.flexural_strength_class}
                    {selectedRecipe.wear_resistance_method && selectedRecipe.wear_resistance_method !== 'none' && (
                      <Badge variant="outline" className="ml-2">
                        Verschleiß: {selectedRecipe.wear_resistance_method.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch_number">Chargennummer *</Label>
                <div className="flex gap-2">
                  <Input
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, batch_number: e.target.value }))}
                    required
                    disabled={generatingNumber}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateBatchNumber}
                    disabled={!formData.recipe_id || generatingNumber}
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="production_date">Produktionsdatum *</Label>
                <Input
                  id="production_date"
                  type="datetime-local"
                  value={formData.production_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, production_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Menge (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity_tons ? (parseFloat(formData.quantity_tons) * 1000).toString() : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity_tons: e.target.value ? (parseFloat(e.target.value) / 1000).toString() : '' }))}
                  placeholder="z.B. 25500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="production_site">Produktionsstandort</Label>
                <Input
                  id="production_site"
                  value={formData.production_site}
                  onChange={(e) => setFormData(prev => ({ ...prev, production_site: e.target.value }))}
                  placeholder="z.B. Werk Hamburg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mixer">Mischer-ID</Label>
                <Input
                  id="mixer"
                  value={formData.mixer_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, mixer_id: e.target.value }))}
                  placeholder="z.B. M-01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itt">ITT-Referenz</Label>
                <Input
                  id="itt"
                  value={formData.itt_reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, itt_reference: e.target.value }))}
                  placeholder="ITT-Prüfbericht Nr."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produced">Produziert</SelectItem>
                    <SelectItem value="released">Freigegeben</SelectItem>
                    <SelectItem value="blocked">Gesperrt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-3">Produktionsumgebung & Kalibrierung</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ext_temp">Außentemperatur (°C)</Label>
                  <Input
                    id="ext_temp"
                    type="number"
                    step="0.1"
                    value={formData.production_conditions.aussentemperatur}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      production_conditions: { ...prev.production_conditions, aussentemperatur: e.target.value }
                    }))}
                    placeholder="20.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mat_temp">Materialtemperatur (°C)</Label>
                  <Input
                    id="mat_temp"
                    type="number"
                    step="0.1"
                    value={formData.production_conditions.materialtemperatur}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      production_conditions: { ...prev.production_conditions, materialtemperatur: e.target.value }
                    }))}
                    placeholder="18.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="humidity_prod">Luftfeuchtigkeit (%)</Label>
                  <Input
                    id="humidity_prod"
                    type="number"
                    value={formData.production_conditions.luftfeuchtigkeit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      production_conditions: { ...prev.production_conditions, luftfeuchtigkeit: e.target.value }
                    }))}
                    placeholder="65"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calibration">Mischer-Kalibrierung</Label>
                  <Input
                    id="calibration"
                    type="date"
                    value={formData.production_conditions.mischer_kalibrierung}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      production_conditions: { ...prev.production_conditions, mischer_kalibrierung: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="waagen_calibration">Waagen-Kalibrierung</Label>
                  <Input
                    id="waagen_calibration"
                    type="date"
                    value={formData.production_conditions.waagen_kalibrierung}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      production_conditions: { ...prev.production_conditions, waagen_kalibrierung: e.target.value }
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    EN 13813: Regelmäßige Kalibrierung erforderlich
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Abweichungen / Notizen</Label>
              <Textarea
                id="notes"
                value={formData.deviation_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, deviation_notes: e.target.value }))}
                placeholder="Besondere Vorkommnisse oder Abweichungen dokumentieren..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* CE/Lieferschein-Informationen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              CE-Kennzeichnung & Lieferschein-Daten
            </CardTitle>
            <CardDescription>
              Pflichtangaben nach EN 13813 Abschnitt 8 für Lieferschein und CE-Kennzeichnung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Produktbezeichnung</Label>
                <Input
                  id="designation"
                  value={formData.ce_delivery_info.designation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ce_delivery_info: { ...prev.ce_delivery_info, designation: e.target.value }
                  }))}
                  placeholder="z.B. Zementestrich CT-C30-F5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_grain">Max. Größtkorn (mm)</Label>
                <Input
                  id="max_grain"
                  value={formData.ce_delivery_info.max_grain_size}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ce_delivery_info: { ...prev.ce_delivery_info, max_grain_size: e.target.value }
                  }))}
                  placeholder="z.B. 8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thickness">Dickenbereich (mm)</Label>
                <Input
                  id="thickness"
                  value={formData.ce_delivery_info.thickness_range}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ce_delivery_info: { ...prev.ce_delivery_info, thickness_range: e.target.value }
                  }))}
                  placeholder="z.B. 40-80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Herstelleranschrift</Label>
                <Input
                  id="manufacturer"
                  value={formData.ce_delivery_info.manufacturer_address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ce_delivery_info: { ...prev.ce_delivery_info, manufacturer_address: e.target.value }
                  }))}
                  placeholder="Firmierung und Adresse"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mixing">Mischhinweise</Label>
              <Textarea
                id="mixing"
                value={formData.ce_delivery_info.mixing_instructions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  ce_delivery_info: { ...prev.ce_delivery_info, mixing_instructions: e.target.value }
                }))}
                placeholder="Anweisungen für die korrekte Mischung..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="processing">Verarbeitungshinweise</Label>
              <Textarea
                id="processing"
                value={formData.ce_delivery_info.processing_instructions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  ce_delivery_info: { ...prev.ce_delivery_info, processing_instructions: e.target.value }
                }))}
                placeholder="Hinweise zur fachgerechten Verarbeitung..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safety">Sicherheitshinweise</Label>
              <Textarea
                id="safety"
                value={formData.ce_delivery_info.safety_instructions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  ce_delivery_info: { ...prev.ce_delivery_info, safety_instructions: e.target.value }
                }))}
                placeholder="Sicherheitsvorkehrungen bei der Handhabung..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shelf_life">Haltbarkeit (falls Trockenmörtel)</Label>
                <Input
                  id="shelf_life"
                  value={formData.ce_delivery_info.shelf_life}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ce_delivery_info: { ...prev.ce_delivery_info, shelf_life: e.target.value }
                  }))}
                  placeholder="z.B. 6 Monate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">Lagerbedingungen</Label>
                <Input
                  id="storage"
                  value={formData.ce_delivery_info.storage_conditions}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ce_delivery_info: { ...prev.ce_delivery_info, storage_conditions: e.target.value }
                  }))}
                  placeholder="z.B. Trocken und kühl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rohstoff-Rückverfolgbarkeit - KRITISCH */}
        <Card className={!formData.raw_materials.zement_charge ? 'ring-2 ring-red-500' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Rohstoff-Rückverfolgbarkeit
                {!formData.raw_materials.zement_charge && (
                  <Badge variant="destructive">Pflicht für EN 13813</Badge>
                )}
              </CardTitle>
            </div>
            <CardDescription>
              Dokumentation der verwendeten Rohstoff-Chargen für vollständige Rückverfolgbarkeit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                Zement
                <Badge variant="destructive" className="text-xs">Pflicht</Badge>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zement_charge">Chargennummer / Lieferschein *</Label>
                  <Input
                    id="zement_charge"
                    value={formData.raw_materials.zement_charge}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      raw_materials: { ...prev.raw_materials, zement_charge: e.target.value }
                    }))}
                    placeholder="z.B. LS-2025-001234"
                    className={!formData.raw_materials.zement_charge ? 'border-red-500' : ''}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zement_datum">Lieferdatum</Label>
                  <Input
                    id="zement_datum"
                    type="date"
                    value={formData.raw_materials.zement_lieferdatum}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      raw_materials: { ...prev.raw_materials, zement_lieferdatum: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zement_lieferant">Lieferant</Label>
                  <Input
                    id="zement_lieferant"
                    value={formData.raw_materials.zement_lieferant}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      raw_materials: { ...prev.raw_materials, zement_lieferant: e.target.value }
                    }))}
                    placeholder="z.B. HeidelbergCement"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-3">Zuschlagstoffe</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zuschlag_charge">Chargennummer / Lieferschein</Label>
                  <Input
                    id="zuschlag_charge"
                    value={formData.raw_materials.zuschlag_charge}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      raw_materials: { ...prev.raw_materials, zuschlag_charge: e.target.value }
                    }))}
                    placeholder="z.B. KS-2025-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zuschlag_datum">Lieferdatum</Label>
                  <Input
                    id="zuschlag_datum"
                    type="date"
                    value={formData.raw_materials.zuschlag_lieferdatum}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      raw_materials: { ...prev.raw_materials, zuschlag_lieferdatum: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zuschlag_lieferant">Lieferant</Label>
                  <Input
                    id="zuschlag_lieferant"
                    value={formData.raw_materials.zuschlag_lieferant}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      raw_materials: { ...prev.raw_materials, zuschlag_lieferant: e.target.value }
                    }))}
                    placeholder="z.B. Kieswerk Müller"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium">Zusatzmittel</h4>
                <Button type="button" variant="outline" size="sm" onClick={addZusatzmittel}>
                  <Plus className="mr-2 h-3 w-3" />
                  Hinzufügen
                </Button>
              </div>
              
              {formData.raw_materials.zusatzmittel_charges.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Keine Zusatzmittel hinzugefügt</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.raw_materials.zusatzmittel_charges.map((zusatz) => (
                    <div key={zusatz.id} className="grid grid-cols-4 gap-2 p-3 border rounded-lg bg-muted/30">
                      <Input
                        value={zusatz.produkt}
                        onChange={(e) => updateZusatzmittel(zusatz.id, 'produkt', e.target.value)}
                        placeholder="Produkt"
                      />
                      <Input
                        value={zusatz.charge}
                        onChange={(e) => updateZusatzmittel(zusatz.id, 'charge', e.target.value)}
                        placeholder="Charge"
                      />
                      <Input
                        value={zusatz.lieferant}
                        onChange={(e) => updateZusatzmittel(zusatz.id, 'lieferant', e.target.value)}
                        placeholder="Lieferant"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeZusatzmittel(zusatz.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mischungsverhältnisse - NEU */}
        <MixingRatioEditor
          recipeId={formData.recipe_id}
          recipeName={recipes.find(r => r.id === formData.recipe_id)?.name}
          materials={mixingRatioMaterials}
          onChange={setMixingRatioMaterials}
          readOnly={false}
        />

        {/* QC-Ergebnisse - Collapsible */}
        <Collapsible open={openSections.qc} onOpenChange={() => toggleSection('qc')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    <CardTitle>Qualitätskontrolle (QC)</CardTitle>
                    {hasQcData && (
                      <Badge variant="outline" className="ml-2">
                        Daten vorhanden
                      </Badge>
                    )}
                  </div>
                  {openSections.qc ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
                <CardDescription>Prüfergebnisse und Messwerte</CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div>
                  <h4 className="text-sm font-medium mb-3">Festigkeitswerte</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="comp_28">Druckfestigkeit 28d (N/mm²)</Label>
                      <Input
                        id="comp_28"
                        type="number"
                        step="0.1"
                        value={formData.qc_data.compressive_strength_28d}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          qc_data: { ...prev.qc_data, compressive_strength_28d: e.target.value }
                        }))}
                        placeholder="45.5"
                      />
                      {selectedRecipe && formData.qc_data.compressive_strength_28d && (
                        <div className="text-xs">
                          Min: {parseInt(selectedRecipe.compressive_strength_class.replace('C', ''))}
                          {parseFloat(formData.qc_data.compressive_strength_28d) >= 
                           parseInt(selectedRecipe.compressive_strength_class.replace('C', '')) ? (
                            <Badge variant="success" className="ml-2 text-xs">OK</Badge>
                          ) : (
                            <Badge variant="destructive" className="ml-2 text-xs">!</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flex_28">Biegezug 28d (N/mm²)</Label>
                      <Input
                        id="flex_28"
                        type="number"
                        step="0.1"
                        value={formData.qc_data.flexural_strength_28d}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          qc_data: { ...prev.qc_data, flexural_strength_28d: e.target.value }
                        }))}
                        placeholder="7.8"
                      />
                      {selectedRecipe && formData.qc_data.flexural_strength_28d && (
                        <div className="text-xs">
                          Min: {parseInt(selectedRecipe.flexural_strength_class.replace('F', ''))}
                          {parseFloat(formData.qc_data.flexural_strength_28d) >= 
                           parseInt(selectedRecipe.flexural_strength_class.replace('F', '')) ? (
                            <Badge variant="success" className="ml-2 text-xs">OK</Badge>
                          ) : (
                            <Badge variant="destructive" className="ml-2 text-xs">!</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comp_7">Druckfestigkeit 7d</Label>
                      <Input
                        id="comp_7"
                        type="number"
                        step="0.1"
                        value={formData.qc_data.compressive_strength_7d}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          qc_data: { ...prev.qc_data, compressive_strength_7d: e.target.value }
                        }))}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flex_7">Biegezug 7d</Label>
                      <Input
                        id="flex_7"
                        type="number"
                        step="0.1"
                        value={formData.qc_data.flexural_strength_7d}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          qc_data: { ...prev.qc_data, flexural_strength_7d: e.target.value }
                        }))}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                {showWearTest && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        Verschleißprüfung
                        <Badge variant="outline">Erforderlich</Badge>
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wear_method">Prüfmethode</Label>
                          <Select
                            value={formData.wear_test.methode}
                            onValueChange={(value) => setFormData(prev => ({
                              ...prev,
                              wear_test: { ...prev.wear_test, methode: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bohme">Böhme</SelectItem>
                              <SelectItem value="bca">BCA</SelectItem>
                              <SelectItem value="rollrad">Rollrad</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="wear_result">Ergebnis</Label>
                          <Input
                            id="wear_result"
                            value={formData.wear_test.ergebnis}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              wear_test: { ...prev.wear_test, ergebnis: e.target.value }
                            }))}
                            placeholder="A12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="wear_norm">Prüfnorm</Label>
                          <Input
                            id="wear_norm"
                            value={formData.wear_test.pruefnorm}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              wear_test: { ...prev.wear_test, pruefnorm: e.target.value }
                            }))}
                            placeholder="EN 13892-3"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="wear_date">Prüfdatum</Label>
                          <Input
                            id="wear_date"
                            type="date"
                            value={formData.wear_test.datum}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              wear_test: { ...prev.wear_test, datum: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3">Frischmörtel-Eigenschaften</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flow">Fließmaß (mm)</Label>
                      <Input
                        id="flow"
                        type="number"
                        value={formData.qc_data.flow_diameter}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          qc_data: { ...prev.qc_data, flow_diameter: e.target.value }
                        }))}
                        placeholder="280"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="density">Dichte (kg/m³)</Label>
                      <Input
                        id="density"
                        type="number"
                        value={formData.qc_data.density}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          qc_data: { ...prev.qc_data, density: e.target.value }
                        }))}
                        placeholder="2200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wc">w/z-Wert</Label>
                      <Input
                        id="wc"
                        type="number"
                        step="0.01"
                        value={formData.qc_data.w_c_ratio}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          qc_data: { ...prev.qc_data, w_c_ratio: e.target.value }
                        }))}
                        placeholder="0.45"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test_date">Prüfdatum</Label>
                    <Input
                      id="test_date"
                      type="date"
                      value={formData.qc_data.test_date}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        qc_data: { ...prev.qc_data, test_date: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tested_by">Geprüft von</Label>
                    <Input
                      id="tested_by"
                      value={formData.qc_data.tested_by}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        qc_data: { ...prev.qc_data, tested_by: e.target.value }
                      }))}
                      placeholder="Name des Prüfers"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Prüfkörper - Collapsible, wird wichtig bei QC */}
        <Collapsible open={Boolean(openSections.pruefkoerper || hasQcData)} onOpenChange={() => toggleSection('pruefkoerper')}>
          <Card className={hasQcData && !formData.test_specimens.anzahl_hergestellt ? 'ring-2 ring-yellow-500' : ''}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Microscope className="h-5 w-5" />
                    <CardTitle>Prüfkörper-Management</CardTitle>
                    {hasQcData && !formData.test_specimens.anzahl_hergestellt && (
                      <Badge variant="warning">Erforderlich bei QC</Badge>
                    )}
                  </div>
                  {openSections.pruefkoerper ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
                <CardDescription>Verwaltung der hergestellten Prüfkörper</CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="anzahl">Anzahl hergestellter Prüfkörper</Label>
                    <Input
                      id="anzahl"
                      type="number"
                      value={formData.test_specimens.anzahl_hergestellt}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        test_specimens: { ...prev.test_specimens, anzahl_hergestellt: e.target.value }
                      }))}
                      placeholder="z.B. 9"
                      className={hasQcData && !formData.test_specimens.anzahl_hergestellt ? 'border-yellow-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground">
                      Standard: 9 Würfel (3x7 Tage, 3x28 Tage, 3 Reserve)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kennzeichnung">Kennzeichnung</Label>
                    <Input
                      id="kennzeichnung"
                      value={formData.test_specimens.kennzeichnung}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        test_specimens: { ...prev.test_specimens, kennzeichnung: e.target.value }
                      }))}
                      placeholder="z.B. CH-2025-001-A bis I"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lagerung">Lagerungsbedingungen</Label>
                    <Select
                      value={formData.test_specimens.lagerung}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        test_specimens: { ...prev.test_specimens, lagerung: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wasserbad 20°C">Wasserbad 20°C</SelectItem>
                        <SelectItem value="Klimaraum 20°C/65%">Klimaraum 20°C/65% r.F.</SelectItem>
                        <SelectItem value="Feuchtlagerung">Feuchtlagerung</SelectItem>
                        <SelectItem value="Baustelle">Baustellenlagerung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="probenahmedatum">Probenahmedatum</Label>
                    <Input
                      id="probenahmedatum"
                      type="date"
                      value={formData.test_specimens.probenahmedatum}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        test_specimens: { ...prev.test_specimens, probenahmedatum: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="probenahme_ort">Probenahmeort</Label>
                    <Input
                      id="probenahme_ort"
                      value={formData.test_specimens.probenahme_ort}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        test_specimens: { ...prev.test_specimens, probenahme_ort: e.target.value }
                      }))}
                      placeholder="z.B. Mischer Auslauf"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pruefnorm_version">Prüfnorm-Version</Label>
                    <Input
                      id="pruefnorm_version"
                      value={formData.test_specimens.pruefnorm_version}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        test_specimens: { ...prev.test_specimens, pruefnorm_version: e.target.value }
                      }))}
                      placeholder="EN 13892-2:2002"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Prüfplan</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plan_7">7-Tage-Prüfung</Label>
                      <Input
                        id="plan_7"
                        type="number"
                        value={formData.test_specimens.pruefplan['7_tage']}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          test_specimens: {
                            ...prev.test_specimens,
                            pruefplan: { ...prev.test_specimens.pruefplan, '7_tage': e.target.value }
                          }
                        }))}
                        placeholder="3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plan_28">28-Tage-Prüfung</Label>
                      <Input
                        id="plan_28"
                        type="number"
                        value={formData.test_specimens.pruefplan['28_tage']}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          test_specimens: {
                            ...prev.test_specimens,
                            pruefplan: { ...prev.test_specimens.pruefplan, '28_tage': e.target.value }
                          }
                        }))}
                        placeholder="3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="plan_reserve">Reserve</Label>
                      <Input
                        id="plan_reserve"
                        type="number"
                        value={formData.test_specimens.pruefplan.reserve}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          test_specimens: {
                            ...prev.test_specimens,
                            pruefplan: { ...prev.test_specimens.pruefplan, reserve: e.target.value }
                          }
                        }))}
                        placeholder="3"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Rückstellmuster - Collapsible */}
        <Collapsible open={openSections.rueckstellung} onOpenChange={() => toggleSection('rueckstellung')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    <CardTitle>Rückstellmuster</CardTitle>
                    {formData.retention_sample.entnommen && (
                      <Badge variant="outline">Entnommen</Badge>
                    )}
                  </div>
                  {openSections.rueckstellung ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
                <CardDescription>Werksvorgabe (konfigurierbar): Rückstellmuster für 2 Jahre aufbewahren</CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Werksvorgabe (WPK-Policy)</AlertTitle>
                  <AlertDescription>
                    Gemäß interner Werksvorgabe werden Rückstellmuster für 2 Jahre aufbewahrt.
                    Diese Frist ist konfigurierbar und dient der nachträglichen Überprüfung bei Reklamationen.
                    (Hinweis: EN 13813 schreibt keine spezifische Aufbewahrungsdauer vor)
                  </AlertDescription>
                </Alert>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="retention"
                    checked={formData.retention_sample.entnommen}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      retention_sample: { ...prev.retention_sample, entnommen: checked as boolean }
                    }))}
                  />
                  <Label htmlFor="retention" className="font-medium cursor-pointer">
                    Rückstellmuster wurde entnommen
                  </Label>
                </div>

                {formData.retention_sample.entnommen && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="menge">Menge</Label>
                      <Input
                        id="menge"
                        value={formData.retention_sample.menge}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          retention_sample: { ...prev.retention_sample, menge: e.target.value }
                        }))}
                        placeholder="z.B. 2 kg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lagerort">Lagerort</Label>
                      <Input
                        id="lagerort"
                        value={formData.retention_sample.lagerort}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          retention_sample: { ...prev.retention_sample, lagerort: e.target.value }
                        }))}
                        placeholder="z.B. Musterlager R3-A12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="entnahme">Entnahmedatum</Label>
                      <Input
                        id="entnahme"
                        type="date"
                        value={formData.retention_sample.entnahme_datum}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          retention_sample: { ...prev.retention_sample, entnahme_datum: e.target.value }
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aufbewahrung">Aufbewahrung bis</Label>
                      <Input
                        id="aufbewahrung"
                        type="date"
                        value={formData.retention_sample.aufbewahrung_bis}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          retention_sample: { ...prev.retention_sample, aufbewahrung_bis: e.target.value }
                        }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Automatisch auf +2 Jahre gesetzt
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Konformitätsprüfung - Nur wenn QC-Daten vorhanden */}
        {formData.qc_data.compressive_strength_28d && formData.qc_data.flexural_strength_28d && selectedRecipe && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Konformitätsbewertung nach EN 13813 (9.2.3 Einzelwert-Ansatz)
              </CardTitle>
              <CardDescription>
                Jeder 28-Tage-Einzelwert muss ≥ deklarierter Klasse sein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Konformitätskriterium</AlertTitle>
                <AlertDescription>
                  Nach EN 13813, Abschnitt 9.2.3: Bei Einzelprüfung muss jeder Prüfwert die deklarierte
                  Klasse erreichen oder überschreiten. Bei Nichterfüllung: Alternativ statistischer
                  Ansatz nach 9.2.2 möglich.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Druckfestigkeit (Einzelwert)</p>
                  <p className="text-sm text-muted-foreground">
                    Deklariert: C{parseInt(selectedRecipe.compressive_strength_class.replace('C', ''))} (≥ {parseInt(selectedRecipe.compressive_strength_class.replace('C', ''))} N/mm²)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gemessen: {formData.qc_data.compressive_strength_28d} N/mm²
                  </p>
                </div>
                {parseFloat(formData.qc_data.compressive_strength_28d) >=
                 parseInt(selectedRecipe.compressive_strength_class.replace('C', '')) ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    KONFORM
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    NICHT KONFORM
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Biegezugfestigkeit (Einzelwert)</p>
                  <p className="text-sm text-muted-foreground">
                    Deklariert: F{parseInt(selectedRecipe.flexural_strength_class.replace('F', ''))} (≥ {parseInt(selectedRecipe.flexural_strength_class.replace('F', ''))} N/mm²)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gemessen: {formData.qc_data.flexural_strength_28d} N/mm²
                  </p>
                </div>
                {parseFloat(formData.qc_data.flexural_strength_28d) >=
                 parseInt(selectedRecipe.flexural_strength_class.replace('F', '')) ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    KONFORM
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    NICHT KONFORM
                  </Badge>
                )}
              </div>

              {(() => {
                const conformity = calculateConformity()
                const isConform = conformity &&
                  conformity.druckfestigkeit.status === 'PASS' &&
                  conformity.biegezug.status === 'PASS'

                return (
                  <>
                    {isConform ? (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Gesamtbewertung: KONFORM</AlertTitle>
                        <AlertDescription>
                          Alle Einzelwerte erfüllen die deklarierten Klassen. Die Charge entspricht
                          den Anforderungen nach EN 13813, Abschnitt 9.2.3.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Gesamtbewertung: NICHT KONFORM</AlertTitle>
                        <AlertDescription>
                          Mindestens ein Einzelwert unterschreitet die deklarierte Klasse.
                          Option: Prüfung nach statistischem Ansatz (9.2.2) oder Neuklassifizierung.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Weitere Optionen bei Nichtkonformität:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Statistischer Ansatz nach 9.2.2 mit Stichprobenplan</li>
                        <li>• Neuklassifizierung in niedrigere Festigkeitsklasse</li>
                        <li>• Produktionsparameter überprüfen und anpassen</li>
                      </ul>
                    </div>
                  </>
                )
              })()}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/en13813/batches">Abbrechen</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Speichern...' : 'Charge anlegen'}
          </Button>
        </div>
      </form>
    </div>
  )
}