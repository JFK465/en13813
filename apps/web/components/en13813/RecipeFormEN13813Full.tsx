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

// Vollständiges EN 13813-2002 konformes Schema
const en13813FullSchema = z.object({
  // === GRUNDDATEN ===
  recipe_code: z.string().min(1, 'Rezeptur-Code ist erforderlich'),
  name: z.string().min(1, 'Bezeichnung ist erforderlich'),
  type: z.enum(['CT', 'CA', 'MA', 'SR', 'AS']),
  
  // === NORMATIVE FESTIGKEITSKLASSEN (Pflicht) ===
  compressive_strength_class: z.string().regex(/^C(5|7|12|16|20|25|30|35|40|50|60|70|80)$/, 'Gültige Klasse erforderlich'),
  flexural_strength_class: z.string().regex(/^F(1|2|3|4|5|6|7|10|15|20|30|40|50)$/, 'Gültige Klasse erforderlich'),
  
  // === VERSCHLEIßWIDERSTAND (für Nutzschichten) ===
  wear_resistance_method: z.enum(['bohme', 'bca', 'rolling_wheel', 'none', 'NPD']).default('NPD'),
  wear_resistance_class: z.string().optional(),
  
  // === ROLLRADPRÜFUNG FÜR BEDECKTE ESTRICHE (EN 13813 5.2.6) ===
  rolling_wheel_floor_covering_class: z.enum(['RWFC150', 'RWFC250', 'RWFC350', 'RWFC450', 'RWFC550', 'NPD']).default('NPD'),
  
  // === BRANDVERHALTEN (Pflicht für exponierte Oberflächen) ===
  fire_class: z.enum(['A1fl', 'A2fl', 'Bfl', 'Cfl', 'Dfl', 'Efl', 'Ffl', 'NPD']).default('A1fl'),
  fire_smoke_class: z.enum(['s1', 's2', 'none', 'NPD']).default('NPD'),
  
  // === FREISETZUNG KORROSIVER SUBSTANZEN (Pflicht) ===
  release_corrosive_substances: z.string(), // Automatisch aus type abgeleitet
  
  // === OBERFLÄCHENEIGENSCHAFTEN ===
  surface_hardness_class: z.string().optional(), // SH30-SH200 für MA
  bond_strength_class: z.string().optional(), // B0.2-B2.0
  impact_resistance_class: z.string().optional(), // IR für SR
  indentation_class: z.string().optional(), // IC/IP für AS
  
  // === pH-WERT FÜR CA-ESTRICHE (Pflicht für CA) ===
  ph_value_ca: z.number().min(7).optional().refine((val, ctx) => {
    const formData = ctx as any
    if (formData?.type === 'CA' && (!val || val < 7)) {
      return false
    }
    return true
  }, 'pH-Wert muss ≥ 7 für CA-Estriche sein'),
  
  // === WASSEREIGENSCHAFTEN ===
  water_permeability: z.enum(['NPD', 'value']).default('NPD'),
  water_permeability_value: z.number().optional(),
  water_vapour_permeability: z.enum(['NPD', 'value']).default('NPD'),
  water_vapour_permeability_value: z.number().optional(),
  water_absorption_class: z.enum(['W0', 'W1', 'W2', 'NPD']).default('NPD'),
  
  // === THERMISCHE EIGENSCHAFTEN ===
  thermal_conductivity: z.number().optional(),
  thermal_resistance: z.number().optional(),
  specific_heat_capacity: z.number().optional(),
  
  // === AKUSTISCHE EIGENSCHAFTEN ===
  sound_insulation: z.number().optional(),
  sound_absorption_coefficient: z.number().min(0).max(1).optional(),
  impact_sound_improvement: z.number().optional(),
  
  // === ELEKTRISCHE EIGENSCHAFTEN ===
  electrical_resistance: z.enum(['NPD', 'value']).default('NPD'),
  electrical_resistance_value: z.string().optional(),
  electrical_conductivity: z.string().optional(),
  electrostatic_behaviour: z.enum(['insulating', 'dissipative', 'conductive', 'NPD']).default('NPD'),
  
  // === CHEMISCHE BESTÄNDIGKEIT ===
  chemical_resistance_class: z.enum(['CR0', 'CR1', 'CR2', 'CR3', 'CR4', 'NPD']).default('NPD'),
  ph_resistance_min: z.number().min(0).max(14).optional(),
  ph_resistance_max: z.number().min(0).max(14).optional(),
  oil_resistance: z.boolean().optional(),
  
  // === E-MODUL (EN 13813 5.2.11) ===
  elastic_modulus: z.number().optional(),
  elastic_modulus_class: z.enum(['E1', 'E2', 'E5', 'E10', 'E15', 'E20', 'E25', 'E30', 'NPD']).default('NPD'),
  
  // === SCHWINDEN UND QUELLEN (EN 13813 5.2.8) ===
  shrinkage_value: z.number().optional(), // mm/m
  swelling_value: z.number().optional(), // mm/m
  shrinkage_class: z.enum(['S1', 'S2', 'S3', 'NPD']).default('NPD'),
  curling_tendency: z.enum(['low', 'medium', 'high', 'NPD']).default('NPD'),
  
  // === DAUERHAFTIGKEIT ===
  freeze_thaw_resistance: z.enum(['FT0', 'FT1', 'FT2', 'NPD']).default('NPD'),
  
  // === SICHERHEIT ===
  slip_resistance_class: z.enum(['R9', 'R10', 'R11', 'R12', 'R13', 'NPD']).default('NPD'),
  release_dangerous_substances: z.enum(['NPD', 'See_SDS']).default('NPD'),
  
  // === ANWENDUNGSSPEZIFISCH ===
  thickness_tolerance_class: z.enum(['T1', 'T2', 'T3', 'NPD']).default('NPD'),
  flatness_tolerance: z.number().optional(),
  surface_texture: z.enum(['smooth', 'textured', 'structured', 'NPD']).default('NPD'),
  
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
    // Konsistenz mit Wert in mm (EN 13813 5.2.9)
    consistency_method: z.enum(['flow_table', 'slump', 'compacting_factor', 'EN12706', 'EN13454-2']),
    consistency_value_mm: z.number().optional(), // Der tatsächliche Messwert
    consistency_target_mm: z.number().optional(),
    consistency_tolerance_mm: z.number().optional(),
    
    // Erstarrungszeit (EN 13813 5.2.7)
    setting_time_initial_minutes: z.number().optional(),
    setting_time_final_minutes: z.number().optional(),
    setting_time_method: z.enum(['EN13454-2', 'Vicat', 'other']).optional(),
    
    // pH-Wert für Frischmörtel
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

type EN13813FullFormValues = z.infer<typeof en13813FullSchema>

export function RecipeFormEN13813Full() {
  const [loading, setLoading] = useState(false)
  const [enDesignation, setEnDesignation] = useState('')
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClientComponentClient()
  const services = createEN13813Services(supabase)

  const form = useForm<EN13813FullFormValues>({
    resolver: zodResolver(en13813FullSchema),
    defaultValues: {
      recipe_code: '',
      name: '',
      type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      wear_resistance_method: 'NPD',
      rolling_wheel_floor_covering_class: 'NPD',
      fire_class: 'A1fl',
      fire_smoke_class: 'NPD',
      release_corrosive_substances: 'CT',
      water_permeability: 'NPD',
      water_vapour_permeability: 'NPD',
      water_absorption_class: 'NPD',
      electrical_resistance: 'NPD',
      electrostatic_behaviour: 'NPD',
      chemical_resistance_class: 'NPD',
      elastic_modulus_class: 'NPD',
      shrinkage_class: 'NPD',
      curling_tendency: 'NPD',
      freeze_thaw_resistance: 'NPD',
      slip_resistance_class: 'NPD',
      release_dangerous_substances: 'NPD',
      thickness_tolerance_class: 'NPD',
      surface_texture: 'NPD',
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

  // Watch form values for dynamic validation
  const watchType = form.watch('type')
  const watchIntendedUse = form.watch('intended_use')

  // Update release_corrosive_substances based on type
  useEffect(() => {
    form.setValue('release_corrosive_substances', watchType)
  }, [watchType, form])

  // Validate CA-specific requirements
  useEffect(() => {
    if (watchType === 'CA') {
      const phValue = form.getValues('ph_value_ca')
      if (!phValue || phValue < 7) {
        setValidationWarnings(prev => [...prev, 'pH-Wert muss ≥ 7 für CA-Estriche sein'])
      }
    }
  }, [watchType, form])

  // Generate EN designation
  useEffect(() => {
    const values = form.getValues()
    let designation = `EN 13813 ${values.type}-${values.compressive_strength_class}-${values.flexural_strength_class}`
    
    // Add wear resistance if applicable
    if (values.wear_resistance_class && values.wear_resistance_method !== 'NPD') {
      designation += `-${values.wear_resistance_class}`
    }
    
    // Add RWFC if applicable
    if (values.rolling_wheel_floor_covering_class !== 'NPD' && watchIntendedUse.with_flooring) {
      designation += `-${values.rolling_wheel_floor_covering_class}`
    }
    
    // Add surface hardness for MA
    if (values.type === 'MA' && values.surface_hardness_class) {
      designation += `-${values.surface_hardness_class}`
    }
    
    // Add bond strength for SR
    if (values.type === 'SR' && values.bond_strength_class) {
      designation += `-${values.bond_strength_class}`
    }
    
    setEnDesignation(designation)
  }, [form.watch(), watchIntendedUse])

  const onSubmit = async (data: EN13813FullFormValues) => {
    try {
      setLoading(true)
      
      // Additional validation for CA-screeds
      if (data.type === 'CA' && (!data.ph_value_ca || data.ph_value_ca < 7)) {
        toast({
          title: 'Fehler',
          description: 'pH-Wert muss ≥ 7 für CA-Estriche sein',
          variant: 'destructive'
        })
        return
      }
      
      // Save recipe
      const result = await services.recipeService.create({
        ...data,
        en_designation: enDesignation
      })
      
      if (result) {
        toast({
          title: 'Erfolgreich',
          description: 'Rezeptur wurde erfolgreich erstellt'
        })
        router.push('/en13813/recipes')
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern der Rezeptur',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* EN Designation Display */}
        <Card>
          <CardHeader>
            <CardTitle>EN 13813 Bezeichnung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-lg font-mono">{enDesignation}</code>
            </div>
          </CardContent>
        </Card>

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validierungshinweise</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Grunddaten</TabsTrigger>
            <TabsTrigger value="mechanical">Mechanisch</TabsTrigger>
            <TabsTrigger value="physical">Physikalisch</TabsTrigger>
            <TabsTrigger value="materials">Material</TabsTrigger>
            <TabsTrigger value="fresh">Frischmörtel</TabsTrigger>
            <TabsTrigger value="quality">Qualität</TabsTrigger>
          </TabsList>

          {/* Basic Data Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Grunddaten</CardTitle>
                <CardDescription>
                  Basisinformationen zur Rezeptur gemäß EN 13813
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recipe_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rezeptur-Code*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="z.B. CT-C25-F4-001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bezeichnung*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="z.B. Zementestrich Standard" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estrichtyp*</FormLabel>
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
                          <SelectItem value="AS">AS - Gussasphaltestrich</SelectItem>
                          <SelectItem value="SR">SR - Kunstharzestrich</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Bindemitteltyp gemäß EN 13813
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* pH-Value for CA screeds */}
                {watchType === 'CA' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>CA-Estrich Anforderung</AlertTitle>
                    <AlertDescription>
                      <FormField
                        control={form.control}
                        name="ph_value_ca"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>pH-Wert (muss ≥ 7 sein)*</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1"
                                min="7"
                                max="14"
                                {...field} 
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              EN 13813 Abschnitt 5.2.10: pH-Wert für CA-Estriche muss ≥ 7 sein
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AlertDescription>
                  </Alert>
                )}

                {/* Intended Use */}
                <div className="space-y-4">
                  <Label>Verwendungszweck</Label>
                  <div className="grid grid-cols-3 gap-4">
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
                          <FormLabel className="!mt-0">Nutzschicht</FormLabel>
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
                          <FormLabel className="!mt-0">Mit Bodenbelag</FormLabel>
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
                          <FormLabel className="!mt-0">Heizestrich</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mechanical Properties Tab */}
          <TabsContent value="mechanical">
            <Card>
              <CardHeader>
                <CardTitle>Mechanische Eigenschaften</CardTitle>
                <CardDescription>
                  Normative und optionale mechanische Eigenschaften
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Compressive and Flexural Strength */}
                <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="C5">C5</SelectItem>
                            <SelectItem value="C7">C7</SelectItem>
                            <SelectItem value="C12">C12</SelectItem>
                            <SelectItem value="C16">C16</SelectItem>
                            <SelectItem value="C20">C20</SelectItem>
                            <SelectItem value="C25">C25</SelectItem>
                            <SelectItem value="C30">C30</SelectItem>
                            <SelectItem value="C35">C35</SelectItem>
                            <SelectItem value="C40">C40</SelectItem>
                            <SelectItem value="C50">C50</SelectItem>
                            <SelectItem value="C60">C60</SelectItem>
                            <SelectItem value="C70">C70</SelectItem>
                            <SelectItem value="C80">C80</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          EN 13813 Tabelle 2
                        </FormDescription>
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
                            <SelectItem value="F1">F1</SelectItem>
                            <SelectItem value="F2">F2</SelectItem>
                            <SelectItem value="F3">F3</SelectItem>
                            <SelectItem value="F4">F4</SelectItem>
                            <SelectItem value="F5">F5</SelectItem>
                            <SelectItem value="F6">F6</SelectItem>
                            <SelectItem value="F7">F7</SelectItem>
                            <SelectItem value="F10">F10</SelectItem>
                            <SelectItem value="F15">F15</SelectItem>
                            <SelectItem value="F20">F20</SelectItem>
                            <SelectItem value="F30">F30</SelectItem>
                            <SelectItem value="F40">F40</SelectItem>
                            <SelectItem value="F50">F50</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          EN 13813 Tabelle 3
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Wear Resistance */}
                {watchIntendedUse.wearing_surface && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <Label>Verschleißwiderstand (für Nutzschichten)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="wear_resistance_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prüfmethode</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="NPD">NPD - Leistung nicht bestimmt</SelectItem>
                                <SelectItem value="bohme">Böhme (A-Klassen)</SelectItem>
                                <SelectItem value="bca">BCA (AR-Klassen)</SelectItem>
                                <SelectItem value="rolling_wheel">Rolling Wheel (RWA-Klassen)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('wear_resistance_method') !== 'NPD' && (
                        <FormField
                          control={form.control}
                          name="wear_resistance_class"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Klasse</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="z.B. A6, AR1, RWA10" />
                              </FormControl>
                              <FormDescription>
                                EN 13813 Tabellen 4-6
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* RWFC for covered screeds */}
                {watchIntendedUse.with_flooring && (
                  <FormField
                    control={form.control}
                    name="rolling_wheel_floor_covering_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rollradprüfung für bedeckte Estriche</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD - Leistung nicht bestimmt</SelectItem>
                            <SelectItem value="RWFC150">RWFC150 (150 N)</SelectItem>
                            <SelectItem value="RWFC250">RWFC250 (250 N)</SelectItem>
                            <SelectItem value="RWFC350">RWFC350 (350 N)</SelectItem>
                            <SelectItem value="RWFC450">RWFC450 (450 N)</SelectItem>
                            <SelectItem value="RWFC550">RWFC550 (550 N)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          EN 13813 Abschnitt 5.2.6 - Tabelle 9
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* E-Modulus */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="elastic_modulus_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-Modul Klasse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NPD">NPD</SelectItem>
                            <SelectItem value="E1">E1 (1 kN/mm²)</SelectItem>
                            <SelectItem value="E2">E2 (2 kN/mm²)</SelectItem>
                            <SelectItem value="E5">E5 (5 kN/mm²)</SelectItem>
                            <SelectItem value="E10">E10 (10 kN/mm²)</SelectItem>
                            <SelectItem value="E15">E15 (15 kN/mm²)</SelectItem>
                            <SelectItem value="E20">E20 (20 kN/mm²)</SelectItem>
                            <SelectItem value="E25">E25 (25 kN/mm²)</SelectItem>
                            <SelectItem value="E30">E30 (30 kN/mm²)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          EN 13813 Tabelle 10
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="elastic_modulus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-Modul Wert (kN/mm²)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Shrinkage and Swelling */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label>Schwinden und Quellen (EN 13813 5.2.8)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="shrinkage_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schwindmaß (mm/m)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="swelling_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quellmaß (mm/m)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
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
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NPD">NPD</SelectItem>
                              <SelectItem value="S1">S1</SelectItem>
                              <SelectItem value="S2">S2</SelectItem>
                              <SelectItem value="S3">S3</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fresh Mortar Tab */}
          <TabsContent value="fresh">
            <Card>
              <CardHeader>
                <CardTitle>Frischmörtel-Eigenschaften</CardTitle>
                <CardDescription>
                  Eigenschaften des frischen Estrichmörtels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Consistency */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label>Konsistenz (EN 13813 5.2.9)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fresh_mortar.consistency_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prüfmethode*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flow_table">Ausbreittisch</SelectItem>
                              <SelectItem value="slump">Setzmaß</SelectItem>
                              <SelectItem value="compacting_factor">Verdichtungsmaß</SelectItem>
                              <SelectItem value="EN12706">EN 12706 (&gt;300mm)</SelectItem>
                              <SelectItem value="EN13454-2">EN 13454-2</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fresh_mortar.consistency_value_mm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konsistenzwert (mm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="z.B. 180"
                              {...field} 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Tatsächlicher Messwert in mm
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Setting Time */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <Label>Erstarrungszeit (EN 13813 5.2.7)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="fresh_mortar.setting_time_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Methode</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="EN13454-2">EN 13454-2</SelectItem>
                              <SelectItem value="Vicat">Vicat</SelectItem>
                              <SelectItem value="other">Andere</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fresh_mortar.setting_time_initial_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Erstarrungsbeginn (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fresh_mortar.setting_time_final_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Erstarrungsende (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* pH Value */}
                <FormField
                  control={form.control}
                  name="fresh_mortar.ph_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>pH-Wert Frischmörtel</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          min="0"
                          max="14"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        EN 13813 5.2.10 - Optional außer für CA (muss ≥ 7)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <span className="animate-spin mr-2">⏳</span>}
            <Save className="mr-2 h-4 w-4" />
            Rezeptur speichern
          </Button>
        </div>
      </form>
    </Form>
  )
}