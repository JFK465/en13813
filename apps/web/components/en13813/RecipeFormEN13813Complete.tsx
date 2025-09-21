'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createEN13813Services } from '@/modules/en13813/services'
import { useRouter } from 'next/navigation'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { 
  Save, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Calculator,
  FlaskConical,
  Shield,
  Thermometer,
  Droplets,
  Timer,
  Gauge,
  Zap,
  Volume2,
  Snowflake,
  ShieldAlert,
  Info,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Vollständiges EN 13813 Schema mit ALLEN normativen Anforderungen
const en13813CompleteSchema = z.object({
  // === GRUNDDATEN ===
  recipe_code: z.string().min(1, 'Rezeptur-Code ist erforderlich'),
  name: z.string().min(1, 'Bezeichnung ist erforderlich'),
  type: z.enum(['CT', 'CA', 'MA', 'SR', 'AS']),
  
  // === FESTIGKEITSKLASSEN ===
  compressive_strength_class: z.string(),
  flexural_strength_class: z.string(),
  
  // === VERSCHLEIßWIDERSTAND ===
  wear_resistance_method: z.enum(['bohme', 'bca', 'rolling_wheel', 'none']).optional(),
  wear_resistance_class: z.string().optional(),
  
  // === BRANDVERHALTEN ===
  fire_class: z.string().default('A1fl'),
  fire_smoke_class: z.enum(['s1', 's2', 'none']).optional(),
  
  // === OBERFLÄCHENEIGENSCHAFTEN ===
  surface_hardness_class: z.string().optional(),
  bond_strength_class: z.string().optional(),
  impact_resistance_class: z.string().optional(),
  indentation_class: z.string().optional(),
  
  // === VERWENDUNGSZWECK ===
  intended_use: z.object({
    wearing_surface: z.boolean().default(false),
    with_flooring: z.boolean().default(false),
    heated_screed: z.boolean().default(false),
    indoor_only: z.boolean().default(true),
    outdoor_use: z.boolean().default(false),
    wet_areas: z.boolean().default(false),
    chemical_exposure: z.boolean().default(false),
    heavy_duty: z.boolean().default(false),
    esd_requirements: z.boolean().default(false)
  }),
  
  // === WASSEREIGENSCHAFTEN ===
  water_permeability_class: z.string().optional(),
  water_vapour_permeability: z.number().optional(),
  water_absorption_class: z.enum(['W0', 'W1', 'W2', 'NPD']).optional(),
  
  // === THERMISCHE EIGENSCHAFTEN ===
  thermal_conductivity: z.number().optional(),
  thermal_resistance: z.number().optional(),
  specific_heat_capacity: z.number().optional(),
  
  // === AKUSTISCHE EIGENSCHAFTEN ===
  sound_insulation: z.number().optional(),
  sound_absorption_coefficient: z.number().min(0).max(1).optional(),
  impact_sound_improvement: z.number().optional(),
  
  // === ELEKTRISCHE EIGENSCHAFTEN (PFLICHT für AS bei ESD) ===
  electrical_resistance: z.string().optional(),
  electrical_conductivity: z.string().optional(),
  electrostatic_behaviour: z.enum(['insulating', 'dissipative', 'conductive', 'NPD']).optional(),
  
  // === CHEMISCHE BESTÄNDIGKEIT ===
  chemical_resistance_class: z.enum(['CR0', 'CR1', 'CR2', 'CR3', 'CR4', 'NPD']).optional(),
  ph_resistance_min: z.number().min(0).max(14).optional(),
  ph_resistance_max: z.number().min(0).max(14).optional(),
  oil_resistance: z.boolean().optional(),
  
  // === MECHANISCHE ZUSATZEIGENSCHAFTEN ===
  creep_coefficient: z.number().optional(),
  elastic_modulus: z.number().optional(),
  shrinkage_class: z.enum(['S1', 'S2', 'S3', 'NPD']).optional(),
  curling_tendency: z.enum(['low', 'medium', 'high', 'NPD']).optional(),
  
  // === DAUERHAFTIGKEIT ===
  freeze_thaw_resistance: z.enum(['FT0', 'FT1', 'FT2', 'NPD']).optional(),
  
  // === SICHERHEIT ===
  slip_resistance_class: z.enum(['R9', 'R10', 'R11', 'R12', 'R13', 'NPD']).optional(),
  release_dangerous_substances: z.string().default('NPD'),
  
  // === ANWENDUNGSSPEZIFISCH ===
  thickness_tolerance_class: z.enum(['T1', 'T2', 'T3', 'NPD']).optional(),
  flatness_tolerance: z.number().optional(),
  surface_texture: z.enum(['smooth', 'textured', 'structured']).optional(),
  
  // === MATERIALZUSAMMENSETZUNG ===
  materials: z.object({
    binder_type: z.string(),
    binder_designation: z.string(),
    binder_amount_kg_m3: z.number().min(0),
    binder_supplier: z.string().optional(),
    aggregate_type: z.string().optional(),
    aggregate_max_size: z.string().optional(),
    aggregate_amount_kg_m3: z.number().min(0).optional(),
    water_content: z.number().min(0).optional(),
    water_binder_ratio: z.number().min(0.2).max(1.0),
    additives: z.array(z.object({
      type: z.string(),
      name: z.string(),
      dosage_percent: z.number(),
      supplier: z.string().optional()
    })).default([]),
    fibers: z.object({
      type: z.enum(['steel', 'polymer', 'glass', 'other', 'none']),
      length_mm: z.number().optional(),
      dosage_kg_m3: z.number().optional(),
      supplier: z.string().optional()
    }).optional()
  }),
  
  // === FRISCHMÖRTEL-EIGENSCHAFTEN ===
  fresh_mortar: z.object({
    consistency_method: z.enum(['flow_table', 'slump', 'compacting_factor']),
    consistency_target_mm: z.number().optional(),
    consistency_tolerance_mm: z.number().optional(),
    setting_time_initial_minutes: z.number().optional(),
    setting_time_final_minutes: z.number().optional(),
    ph_value: z.number().min(0).max(14).optional(),
    processing_time_minutes: z.number().optional(),
    temperature_min_celsius: z.number().default(5),
    temperature_max_celsius: z.number().default(30)
  }),
  
  // === VERARBEITUNGSPARAMETER ===
  processing: z.object({
    mixing_time_seconds: z.number().optional(),
    mixing_speed_rpm: z.number().optional(),
    layer_thickness_min_mm: z.number().optional(),
    layer_thickness_max_mm: z.number().optional(),
    application_method: z.string().optional(),
    curing_time_days: z.number().default(28),
    curing_conditions: z.string().optional()
  }),
  
  // === QUALITÄTSKONTROLLE ===
  quality_control: z.object({
    test_frequency_fresh: z.string().default('per_batch'),
    test_frequency_hardened: z.string().default('monthly'),
    sample_size: z.string().optional(),
    acceptance_criteria: z.string().optional()
  }),
  
  // === STATUS ===
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  
  // === NOTIZEN ===
  notes: z.string().optional()
})

type EN13813CompleteFormValues = z.infer<typeof en13813CompleteSchema>

export function RecipeFormEN13813Complete() {
  const [loading, setLoading] = useState(false)
  const [enDesignation, setEnDesignation] = useState('')
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClientComponentClient()
  const services = createEN13813Services(supabase)

  const form = useForm<EN13813CompleteFormValues>({
    resolver: zodResolver(en13813CompleteSchema) as any,
    defaultValues: {
      recipe_code: '',
      name: '',
      type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      wear_resistance_method: 'none',
      fire_class: 'A1fl',
      fire_smoke_class: 'none',
      release_dangerous_substances: 'NPD',
      intended_use: {
        wearing_surface: false,
        with_flooring: false,
        heated_screed: false,
        indoor_only: true,
        outdoor_use: false,
        wet_areas: false,
        chemical_exposure: false,
        heavy_duty: false,
        esd_requirements: false
      },
      materials: {
        binder_type: 'CEM I 42.5 R',
        binder_designation: '',
        binder_amount_kg_m3: 320,
        water_binder_ratio: 0.5,
        additives: []
      },
      fresh_mortar: {
        consistency_method: 'flow_table',
        temperature_min_celsius: 5,
        temperature_max_celsius: 30
      },
      processing: {
        curing_time_days: 28
      },
      quality_control: {
        test_frequency_fresh: 'per_batch',
        test_frequency_hardened: 'monthly'
      },
      status: 'draft'
    }
  })

  const watchedValues = form.watch()

  // Validierung der EN 13813 Anforderungen
  useEffect(() => {
    const warnings: string[] = []
    
    // Pflicht: Verschleißwiderstand bei Nutzschicht ohne Bodenbelag
    if (watchedValues.intended_use?.wearing_surface && 
        !watchedValues.intended_use?.with_flooring &&
        (!watchedValues.wear_resistance_method || watchedValues.wear_resistance_method === 'none')) {
      warnings.push('Verschleißwiderstand ist bei Nutzschicht ohne Bodenbelag erforderlich')
    }
    
    // Pflicht: Elektrische Eigenschaften für AS bei ESD-Anforderungen
    if (watchedValues.type === 'AS' && 
        watchedValues.intended_use?.esd_requirements &&
        !watchedValues.electrical_resistance) {
      warnings.push('Elektrischer Widerstand muss für Gussasphalt mit ESD-Anforderungen angegeben werden')
    }
    
    // Empfehlung: Wärmeleitfähigkeit bei Heizestrich
    if (watchedValues.intended_use?.heated_screed && !watchedValues.thermal_conductivity) {
      warnings.push('Wärmeleitfähigkeit sollte bei Heizestrich angegeben werden')
    }
    
    // Empfehlung: Frostbeständigkeit bei Außenbereich
    if (watchedValues.intended_use?.outdoor_use && !watchedValues.freeze_thaw_resistance) {
      warnings.push('Frostbeständigkeit sollte für Außenbereiche angegeben werden')
    }
    
    // Empfehlung: Chemische Beständigkeit
    if (watchedValues.intended_use?.chemical_exposure && 
        (!watchedValues.chemical_resistance_class || watchedValues.chemical_resistance_class === 'NPD')) {
      warnings.push('Chemische Beständigkeitsklasse sollte bei chemischer Belastung angegeben werden')
    }
    
    // Empfehlung: Wasseraufnahme bei Nassbereichen
    if (watchedValues.intended_use?.wet_areas && 
        (!watchedValues.water_absorption_class || watchedValues.water_absorption_class === 'NPD')) {
      warnings.push('Wasseraufnahmeklasse sollte für Nassbereiche angegeben werden')
    }
    
    // Empfehlung: Rutschfestigkeit bei Nutzschicht
    if (watchedValues.intended_use?.wearing_surface && 
        !watchedValues.intended_use?.with_flooring &&
        (!watchedValues.slip_resistance_class || watchedValues.slip_resistance_class === 'NPD')) {
      warnings.push('Rutschfestigkeitsklasse sollte bei Nutzschichten angegeben werden')
    }
    
    setValidationWarnings(warnings)
  }, [watchedValues])

  // EN-Bezeichnung generieren
  useEffect(() => {
    const type = watchedValues.type
    const compressive = watchedValues.compressive_strength_class
    const flexural = watchedValues.flexural_strength_class
    const wear = watchedValues.wear_resistance_class
    const wearMethod = watchedValues.wear_resistance_method
    
    let designation = `EN 13813 ${type}-${compressive}-${flexural}`
    
    if (wear && wearMethod && wearMethod !== 'none') {
      designation += `-${wear}`
    }
    
    if (watchedValues.surface_hardness_class) {
      designation += `-${watchedValues.surface_hardness_class}`
    }
    
    if (watchedValues.bond_strength_class) {
      designation += `-${watchedValues.bond_strength_class}`
    }
    
    if (watchedValues.intended_use?.heated_screed) {
      designation += `-H`
    }
    
    setEnDesignation(designation)
  }, [watchedValues])

  const handleAddAdditive = () => {
    const currentAdditives = form.getValues('materials.additives') || []
    form.setValue('materials.additives', [
      ...currentAdditives,
      { type: '', name: '', dosage_percent: 0, supplier: '' }
    ])
  }

  const handleRemoveAdditive = (index: number) => {
    const currentAdditives = form.getValues('materials.additives') || []
    form.setValue('materials.additives', currentAdditives.filter((_, i) => i !== index))
  }

  async function onSubmit(data: EN13813CompleteFormValues) {
    setLoading(true)
    try {
      // Finale Validierung
      if (validationWarnings.some(w => w.includes('erforderlich'))) {
        toast({
          title: 'Validierungsfehler',
          description: 'Bitte beheben Sie alle erforderlichen Felder',
          variant: 'destructive'
        })
        setLoading(false)
        return
      }

      // Rezeptur erstellen mit allen EN 13813 Eigenschaften
      const recipe = await services.recipes.create({
        ...data,
        en_designation: enDesignation,
        ph_resistance_range: (data.ph_resistance_min && data.ph_resistance_max) ? {
          min: data.ph_resistance_min,
          max: data.ph_resistance_max
        } : undefined
      } as any)

      toast({
        title: 'Erfolg',
        description: 'EN 13813 konforme Rezeptur wurde erstellt'
      })
      
      router.push(`/en13813/recipes/${recipe.id}`)
    } catch (error: any) {
      console.error('Error creating recipe:', error)
      toast({
        title: 'Fehler',
        description: error.message || 'Rezeptur konnte nicht erstellt werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const strengthClasses = {
    compressive: ['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80'],
    flexural: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'],
    wear_a: ['A1.5', 'A3', 'A6', 'A9', 'A12', 'A15', 'A22'],
    wear_ar: ['AR0.5', 'AR1', 'AR2', 'AR4', 'AR6'],
    wear_rwa: ['RWA1', 'RWA10', 'RWA20', 'RWA50', 'RWA100', 'RWA200', 'RWA300'],
    surface_hardness: ['SH30', 'SH40', 'SH50', 'SH70', 'SH100', 'SH150', 'SH200'],
    bond_strength: ['B0.5', 'B1.0', 'B1.5', 'B2.0'],
    impact_resistance: ['IR1', 'IR2', 'IR4', 'IR10', 'IR20'],
    indentation: ['IC10', 'IC15', 'IC40', 'IC100', 'IP10', 'IP15', 'IP40']
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* EN-Bezeichnung & Validierungsstatus */}
        <div className="space-y-4">
          {enDesignation && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">EN 13813 Bezeichnung</CardTitle>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {enDesignation}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          )}
          
          {validationWarnings.length > 0 && (
            <Alert variant={validationWarnings.some(w => w.includes('erforderlich')) ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>EN 13813 Konformitätsprüfung</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {validationWarnings.map((warning, idx) => (
                    <li key={idx} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7 lg:grid-cols-10">
            <TabsTrigger value="basic">Grunddaten</TabsTrigger>
            <TabsTrigger value="mechanical">Mechanisch</TabsTrigger>
            <TabsTrigger value="water">Wasser</TabsTrigger>
            <TabsTrigger value="thermal">Thermisch</TabsTrigger>
            <TabsTrigger value="acoustic">Akustisch</TabsTrigger>
            <TabsTrigger value="electrical">Elektrisch</TabsTrigger>
            <TabsTrigger value="chemical">Chemisch</TabsTrigger>
            <TabsTrigger value="safety">Sicherheit</TabsTrigger>
            <TabsTrigger value="materials">Material</TabsTrigger>
            <TabsTrigger value="quality">Qualität</TabsTrigger>
          </TabsList>

          {/* === TAB 1: GRUNDDATEN === */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grunddaten & Klassifizierung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="recipe_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rezeptur-Code*</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. CT-C25-F4-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estrich-Typ*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CT">CT - Zementestrich</SelectItem>
                            <SelectItem value="CA">CA - Calciumsulfatestrich</SelectItem>
                            <SelectItem value="MA">MA - Magnesiaestrich</SelectItem>
                            <SelectItem value="SR">SR - Kunstharzestrich</SelectItem>
                            <SelectItem value="AS">AS - Gussasphaltestrich</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Entwurf</SelectItem>
                            <SelectItem value="active">Aktiv</SelectItem>
                            <SelectItem value="archived">Archiviert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bezeichnung*</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Zementestrich für Industrieboden" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-4">Verwendungszweck</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="intended_use.wearing_surface"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Nutzschicht
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.with_flooring"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Mit Bodenbelag
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.heated_screed"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Heizestrich
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.outdoor_use"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Außenbereich
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.wet_areas"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Nassbereich
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.chemical_exposure"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Chemische Belastung
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.heavy_duty"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Schwerlast
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.esd_requirements"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            ESD-Anforderungen
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 2: MECHANISCHE EIGENSCHAFTEN === */}
          <TabsContent value="mechanical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mechanische Eigenschaften</CardTitle>
                <CardDescription>
                  Festigkeitsklassen und mechanische Kennwerte nach EN 13813
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="compressive_strength_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Druckfestigkeitsklasse*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {strengthClasses.compressive.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls} N/mm²</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Nach EN 13892-2</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="flexural_strength_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biegezugfestigkeitsklasse*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {strengthClasses.flexural.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls} N/mm²</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Nach EN 13892-2</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Verschleißwiderstand</h3>
                  {watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Bei Nutzschicht ohne Bodenbelag ist der Verschleißwiderstand <strong>erforderlich</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="wear_resistance_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prüfverfahren</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Keine Angabe (NPD)</SelectItem>
                            <SelectItem value="bohme">Böhme (EN 13892-3)</SelectItem>
                            <SelectItem value="bca">BCA (EN 13892-4)</SelectItem>
                            <SelectItem value="rolling_wheel">Rollrad (EN 13892-5)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedValues.wear_resistance_method && watchedValues.wear_resistance_method !== 'none' && (
                    <FormField
                      control={form.control}
                      name="wear_resistance_class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verschleißwiderstandsklasse</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {watchedValues.wear_resistance_method === 'bohme' && 
                                strengthClasses.wear_a.map(cls => (
                                  <SelectItem key={cls} value={cls}>{cls} cm³/50cm²</SelectItem>
                                ))}
                              {watchedValues.wear_resistance_method === 'bca' && 
                                strengthClasses.wear_ar.map(cls => (
                                  <SelectItem key={cls} value={cls}>{cls} µm</SelectItem>
                                ))}
                              {watchedValues.wear_resistance_method === 'rolling_wheel' && 
                                strengthClasses.wear_rwa.map(cls => (
                                  <SelectItem key={cls} value={cls}>{cls} µm</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {watchedValues.type === 'MA' && (
                    <FormField
                      control={form.control}
                      name="surface_hardness_class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Oberflächenhärte</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="NPD" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NPD">NPD</SelectItem>
                              {strengthClasses.surface_hardness.map(cls => (
                                <SelectItem key={cls} value={cls}>{cls} N/mm²</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Nach EN 13892-6</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedValues.type === 'SR' && (
                    <>
                      <FormField
                        control={form.control}
                        name="bond_strength_class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Haftzugfestigkeit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="NPD" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="NPD">NPD</SelectItem>
                                {strengthClasses.bond_strength.map(cls => (
                                  <SelectItem key={cls} value={cls}>{cls} N/mm²</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Nach EN 13892-8</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="impact_resistance_class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schlagfestigkeit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="NPD" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="NPD">NPD</SelectItem>
                                {strengthClasses.impact_resistance.map(cls => (
                                  <SelectItem key={cls} value={cls}>{cls} Nm</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Nach EN ISO 6272-1</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {watchedValues.type === 'AS' && (
                    <FormField
                      control={form.control}
                      name="indentation_class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eindrückklasse</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="NPD" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NPD">NPD</SelectItem>
                              {strengthClasses.indentation.map(cls => (
                                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Nach EN 12697-20</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="elastic_modulus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-Modul (N/mm²)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="z.B. 30000"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Elastizitätsmodul</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creep_coefficient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kriechzahl</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.1"
                            placeholder="z.B. 2.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Langzeitverformung</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shrinkage_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schwindklasse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="NPD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD</SelectItem>
                            <SelectItem value="S1">S1 (≤ 0.3 mm/m)</SelectItem>
                            <SelectItem value="S2">S2 (≤ 0.5 mm/m)</SelectItem>
                            <SelectItem value="S3">S3 (≤ 0.8 mm/m)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="curling_tendency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schüsselungsneigung</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="NPD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD</SelectItem>
                            <SelectItem value="low">Niedrig</SelectItem>
                            <SelectItem value="medium">Mittel</SelectItem>
                            <SelectItem value="high">Hoch</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="thickness_tolerance_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dickentolleranzklasse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="NPD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD</SelectItem>
                            <SelectItem value="T1">T1 (±3 mm)</SelectItem>
                            <SelectItem value="T2">T2 (±5 mm)</SelectItem>
                            <SelectItem value="T3">T3 (±10 mm)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="flatness_tolerance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ebenheitstoleranz (mm/2m)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.1"
                            placeholder="z.B. 4"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="surface_texture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Oberflächentextur</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wählen..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="smooth">Glatt</SelectItem>
                            <SelectItem value="textured">Texturiert</SelectItem>
                            <SelectItem value="structured">Strukturiert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 3: WASSEREIGENSCHAFTEN === */}
          <TabsContent value="water" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Wassereigenschaften
                </CardTitle>
                <CardDescription>
                  Feuchtigkeitsverhalten und Wasserdurchlässigkeit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedValues.intended_use?.wet_areas && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Für Nassbereiche sollten Wasseraufnahme und Wasserdampfdurchlässigkeit angegeben werden
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="water_absorption_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wasseraufnahmeklasse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="NPD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD</SelectItem>
                            <SelectItem value="W0">W0 (keine Anforderung)</SelectItem>
                            <SelectItem value="W1">W1 (≤ 2.0 kg/m²)</SelectItem>
                            <SelectItem value="W2">W2 (≤ 0.5 kg/m²)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Nach EN 1062-3</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="water_permeability_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wasserdurchlässigkeit</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="NPD oder Wert in ml/m²"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Nach EN 12808-5</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="water_vapour_permeability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wasserdampfdiffusionswiderstand (µ)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="z.B. 200"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Diffusionswiderstandszahl</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 4: THERMISCHE EIGENSCHAFTEN === */}
          <TabsContent value="thermal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Thermische Eigenschaften
                </CardTitle>
                <CardDescription>
                  Wärmeleitung und thermisches Verhalten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedValues.intended_use?.heated_screed && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Für Heizestrich ist die Wärmeleitfähigkeit besonders wichtig
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="thermal_conductivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wärmeleitfähigkeit λ (W/(m·K))</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="z.B. 1.4"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Nach EN 12664 {watchedValues.intended_use?.heated_screed && '(wichtig für Heizestrich)'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="thermal_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wärmedurchlasswiderstand R (m²·K/W)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.001"
                            placeholder="z.B. 0.05"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Bei definierter Schichtdicke</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specific_heat_capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spezifische Wärmekapazität (J/(kg·K))</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="z.B. 1000"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Wärmespeicherfähigkeit</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedValues.intended_use?.outdoor_use && (
                    <FormField
                      control={form.control}
                      name="freeze_thaw_resistance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frost-Tau-Widerstand</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="NPD" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NPD">NPD</SelectItem>
                              <SelectItem value="FT0">FT0 (keine Anforderung)</SelectItem>
                              <SelectItem value="FT1">FT1 (beständig 25 Zyklen)</SelectItem>
                              <SelectItem value="FT2">FT2 (beständig 50 Zyklen)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Nach EN 13892-2</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 5: AKUSTISCHE EIGENSCHAFTEN === */}
          <TabsContent value="acoustic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Akustische Eigenschaften
                </CardTitle>
                <CardDescription>
                  Schallschutz und Akustikverhalten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="impact_sound_improvement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trittschallverbesserung ΔLw (dB)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="z.B. 17"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Nach EN ISO 140-8</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sound_insulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Luftschallverbesserung (dB)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="z.B. 5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Nach EN ISO 140-3</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sound_absorption_coefficient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schallabsorptionsgrad α</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            placeholder="z.B. 0.05"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Nach EN ISO 354 (0-1)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 6: ELEKTRISCHE EIGENSCHAFTEN === */}
          <TabsContent value="electrical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Elektrische Eigenschaften
                </CardTitle>
                <CardDescription>
                  Elektrischer Widerstand und ESD-Eigenschaften
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedValues.type === 'AS' && watchedValues.intended_use?.esd_requirements && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Für Gussasphalt mit ESD-Anforderungen ist der elektrische Widerstand <strong>erforderlich</strong>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="electrical_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Elektrischer Widerstand (Ω)
                          {watchedValues.type === 'AS' && watchedValues.intended_use?.esd_requirements && ' *'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="z.B. 10^6 - 10^9"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Nach EN 1081</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="electrical_conductivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elektrische Leitfähigkeit</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="z.B. 10^-6 S/m"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Siemens pro Meter</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="electrostatic_behaviour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elektrostatisches Verhalten</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="NPD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD</SelectItem>
                            <SelectItem value="insulating">Isolierend (&gt;10^9 Ω)</SelectItem>
                            <SelectItem value="dissipative">Ableitfähig (10^4-10^9 Ω)</SelectItem>
                            <SelectItem value="conductive">Leitfähig (&lt;10^4 Ω)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Nach EN 61340-4-1</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 7: CHEMISCHE BESTÄNDIGKEIT === */}
          <TabsContent value="chemical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Chemische Beständigkeit
                </CardTitle>
                <CardDescription>
                  Widerstand gegen chemische Einwirkungen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedValues.intended_use?.chemical_exposure && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Bei chemischer Belastung sollte die Beständigkeitsklasse angegeben werden
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="chemical_resistance_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chemische Beständigkeitsklasse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="NPD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD</SelectItem>
                            <SelectItem value="CR0">CR0 (keine Beständigkeit)</SelectItem>
                            <SelectItem value="CR1">CR1 (begrenzte Beständigkeit)</SelectItem>
                            <SelectItem value="CR2">CR2 (mittlere Beständigkeit)</SelectItem>
                            <SelectItem value="CR3">CR3 (hohe Beständigkeit)</SelectItem>
                            <SelectItem value="CR4">CR4 (sehr hohe Beständigkeit)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Nach EN 13529</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="oil_resistance"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 pt-8">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Ölbeständig
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <Label>pH-Beständigkeitsbereich</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ph_resistance_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min. pH-Wert</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.1"
                              min="0"
                              max="14"
                              placeholder="z.B. 3"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ph_resistance_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max. pH-Wert</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.1"
                              min="0"
                              max="14"
                              placeholder="z.B. 12"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 8: SICHERHEIT === */}
          <TabsContent value="safety" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Sicherheitseigenschaften
                </CardTitle>
                <CardDescription>
                  Brandverhalten, Rutschfestigkeit und Emissionen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Brandverhalten</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fire_class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brandklasse*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A1fl">A1fl (nicht brennbar)</SelectItem>
                              <SelectItem value="A2fl">A2fl (nicht brennbar)</SelectItem>
                              <SelectItem value="Bfl">Bfl (schwer entflammbar)</SelectItem>
                              <SelectItem value="Cfl">Cfl (schwer entflammbar)</SelectItem>
                              <SelectItem value="Dfl">Dfl (normal entflammbar)</SelectItem>
                              <SelectItem value="Efl">Efl (normal entflammbar)</SelectItem>
                              <SelectItem value="Ffl">Ffl (leicht entflammbar)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Nach EN 13501-1</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fire_smoke_class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rauchentwicklung</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Keine Angabe" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Keine Angabe</SelectItem>
                              <SelectItem value="s1">s1 (geringe Rauchentwicklung)</SelectItem>
                              <SelectItem value="s2">s2 (mittlere Rauchentwicklung)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Zusatzklassifizierung</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-4">Rutschfestigkeit</h3>
                  {watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring && (
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Bei Nutzschichten sollte die Rutschfestigkeitsklasse angegeben werden
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="slip_resistance_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rutschfestigkeitsklasse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="NPD" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD</SelectItem>
                            <SelectItem value="R9">R9 (geringe Rutschhemmung)</SelectItem>
                            <SelectItem value="R10">R10 (normale Rutschhemmung)</SelectItem>
                            <SelectItem value="R11">R11 (erhöhte Rutschhemmung)</SelectItem>
                            <SelectItem value="R12">R12 (große Rutschhemmung)</SelectItem>
                            <SelectItem value="R13">R13 (sehr große Rutschhemmung)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Nach DIN 51130</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-4">Emissionen</h3>
                  <FormField
                    control={form.control}
                    name="release_dangerous_substances"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Freisetzung gefährlicher Stoffe</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="NPD oder 'Siehe Sicherheitsdatenblatt'"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Verweis auf Sicherheitsdatenblatt oder NPD
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 9: MATERIALZUSAMMENSETZUNG === */}
          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Materialzusammensetzung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Bindemittel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="materials.binder_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bindemittel-Typ*</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. CEM I 42.5 R" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="materials.binder_designation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Handelsbezeichnung*</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. Portland-Zement" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="materials.binder_amount_kg_m3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Menge (kg/m³)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="materials.water_binder_ratio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>W/B-Wert*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Zusatzmittel</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAdditive}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Hinzufügen
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {watchedValues.materials?.additives?.map((_, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <FormField
                          control={form.control}
                          name={`materials.additives.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Typ</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Typ wählen" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="plasticizer">Fließmittel</SelectItem>
                                  <SelectItem value="retarder">Verzögerer</SelectItem>
                                  <SelectItem value="accelerator">Beschleuniger</SelectItem>
                                  <SelectItem value="air_entrainer">Luftporenbildner</SelectItem>
                                  <SelectItem value="waterproofer">Dichtungsmittel</SelectItem>
                                  <SelectItem value="other">Sonstiges</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`materials.additives.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Bezeichnung</FormLabel>
                              <FormControl>
                                <Input placeholder="Produktname" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`materials.additives.${index}.dosage_percent`}
                          render={({ field }) => (
                            <FormItem className="w-32">
                              <FormLabel>Dosierung (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  step="0.1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAdditive(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-4">Frischmörtel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fresh_mortar.consistency_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konsistenz-Prüfverfahren</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flow_table">Ausbreitmaß</SelectItem>
                              <SelectItem value="slump">Setzmaß</SelectItem>
                              <SelectItem value="compacting_factor">Verdichtungsmaß</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fresh_mortar.consistency_target_mm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zielwert (mm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="z.B. 160"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-4">Verarbeitung</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="processing.layer_thickness_min_mm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min. Schichtdicke (mm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="z.B. 35"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="processing.layer_thickness_max_mm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max. Schichtdicke (mm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="z.B. 80"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="processing.curing_time_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Erhärtungszeit (Tage)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 10: QUALITÄTSKONTROLLE === */}
          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Qualitätskontrolle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quality_control.test_frequency_fresh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prüfhäufigkeit Frischmörtel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="per_batch">Je Charge</SelectItem>
                            <SelectItem value="daily">Täglich</SelectItem>
                            <SelectItem value="weekly">Wöchentlich</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quality_control.test_frequency_hardened"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prüfhäufigkeit Festmörtel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Wöchentlich</SelectItem>
                            <SelectItem value="monthly">Monatlich</SelectItem>
                            <SelectItem value="quarterly">Quartalsweise</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notizen</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Zusätzliche Informationen..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* === ACTIONS === */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            * Pflichtfelder
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/en13813/recipes')}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={loading || validationWarnings.some(w => w.includes('erforderlich'))}
              className="min-w-[150px]"
            >
              {loading ? (
                <>Speichern...</>
              ) : (
                <>
                  {validationWarnings.length === 0 ? (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Rezeptur erstellen
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}