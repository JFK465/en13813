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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  Gauge
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Umfassendes Schema mit ALLEN EN13813 Feldern
const completeRecipeSchema = z.object({
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
    chemical_resistance: z.boolean().default(false)
  }),
  
  // === MATERIALZUSAMMENSETZUNG ===
  materials: z.object({
    // Bindemittel
    binder_type: z.string(),
    binder_designation: z.string(),
    binder_amount_kg_m3: z.number().min(0),
    binder_supplier: z.string().optional(),
    
    // Zuschlagstoffe
    aggregate_type: z.string().optional(),
    aggregate_max_size: z.string().optional(),
    aggregate_amount_kg_m3: z.number().min(0).optional(),
    sieve_curve: z.object({
      size_mm: z.array(z.number()).optional(),
      passing_percent: z.array(z.number()).optional()
    }).optional(),
    
    // Wasser
    water_content: z.number().min(0).optional(),
    water_binder_ratio: z.number().min(0.2).max(1.0),
    
    // Zusatzmittel
    additives: z.array(z.object({
      type: z.string(),
      name: z.string(),
      dosage_percent: z.number(),
      supplier: z.string().optional()
    })).default([]),
    
    // Fasern
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
  
  // === ZUSÄTZLICHE EIGENSCHAFTEN ===
  special_properties: z.object({
    thermal_conductivity: z.number().optional(),
    electrical_resistance: z.number().optional(),
    shrinkage_mm_m: z.number().optional(),
    creep_coefficient: z.number().optional()
  }).optional(),
  
  // === STATUS ===
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  
  // === NOTIZEN ===
  notes: z.string().optional()
})

type CompleteRecipeFormValues = z.infer<typeof completeRecipeSchema>

export function RecipeFormComplete() {
  const [loading, setLoading] = useState(false)
  const [enDesignation, setEnDesignation] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()
  const services = createEN13813Services(supabase)

  const form = useForm<CompleteRecipeFormValues>({
    resolver: zodResolver(completeRecipeSchema) as any,
    defaultValues: {
      recipe_code: '',
      name: '',
      type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      wear_resistance_method: 'none',
      fire_class: 'A1fl',
      intended_use: {
        wearing_surface: false,
        with_flooring: false,
        heated_screed: false,
        indoor_only: true,
        outdoor_use: false,
        wet_areas: false,
        chemical_resistance: false
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
      designation += `-SH${watchedValues.surface_hardness_class}`
    }
    
    if (watchedValues.bond_strength_class) {
      designation += `-B${watchedValues.bond_strength_class}`
    }
    
    setEnDesignation(designation)
  }, [watchedValues])

  // W/B-Wert berechnen
  useEffect(() => {
    if (watchedValues.materials?.water_content && watchedValues.materials?.binder_amount_kg_m3) {
      const ratio = watchedValues.materials.water_content / watchedValues.materials.binder_amount_kg_m3
      form.setValue('materials.water_binder_ratio', Math.round(ratio * 1000) / 1000)
    }
  }, [watchedValues.materials?.water_content, watchedValues.materials?.binder_amount_kg_m3, form])

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

  async function onSubmit(data: CompleteRecipeFormValues) {
    setLoading(true)
    try {
      // Validierung: Verschleißwiderstand bei Nutzschicht
      if (data.intended_use.wearing_surface && !data.intended_use.with_flooring) {
        if (!data.wear_resistance_method || data.wear_resistance_method === 'none' || !data.wear_resistance_class) {
          toast({
            title: 'Validierungsfehler',
            description: 'Bei Nutzschicht ohne Bodenbelag ist der Verschleißwiderstand erforderlich',
            variant: 'destructive'
          })
          setLoading(false)
          return
        }
      }

      // Rezeptur erstellen
      const recipe = await services.recipes.create({
        ...data,
        en_designation: enDesignation
      } as any)

      // Materialzusammensetzung speichern
      if (data.materials) {
        await services.materials.create({
          recipe_id: recipe.id,
          ...data.materials,
          fresh_mortar_properties: {
            consistency: {
              method: data.fresh_mortar.consistency_method,
              target_mm: data.fresh_mortar.consistency_target_mm,
              tolerance_mm: data.fresh_mortar.consistency_tolerance_mm
            },
            setting_time: {
              initial_minutes: data.fresh_mortar.setting_time_initial_minutes,
              final_minutes: data.fresh_mortar.setting_time_final_minutes
            },
            ph_value: data.fresh_mortar.ph_value,
            processing_time_minutes: data.fresh_mortar.processing_time_minutes,
            temperature_range: {
              min_celsius: data.fresh_mortar.temperature_min_celsius,
              max_celsius: data.fresh_mortar.temperature_max_celsius
            }
          }
        } as any)
      }

      // Compliance-Tasks erstellen
      await services.compliance.createAutomaticTasks(recipe.id)

      toast({
        title: 'Erfolg',
        description: 'Rezeptur wurde vollständig erstellt'
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
    wear_a: ['A1', 'A3', 'A6', 'A9', 'A12', 'A15', 'A22'],
    wear_ar: ['AR0.5', 'AR1', 'AR2', 'AR4', 'AR6'],
    wear_rwa: ['RWA1', 'RWA10', 'RWA20', 'RWA100', 'RWA300'],
    surface_hardness: ['SH30', 'SH40', 'SH50', 'SH70', 'SH100', 'SH150', 'SH200'],
    bond_strength: ['B0.5', 'B1.0', 'B1.5', 'B2.0'],
    impact_resistance: ['IR1', 'IR2', 'IR4', 'IR10', 'IR20'],
    indentation: ['E6', 'E9', 'E15', 'E30']
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* EN-Bezeichnung Preview */}
        {enDesignation && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generierte EN-Bezeichnung</CardTitle>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {enDesignation}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* === SECTION 1: GRUNDDATEN === */}
        <Card>
          <CardHeader>
            <CardTitle>Grunddaten</CardTitle>
            <CardDescription>
              Allgemeine Informationen zur Rezeptur
            </CardDescription>
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
                    <FormDescription>
                      Eindeutiger interner Code
                    </FormDescription>
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
                    <Input 
                      placeholder="z.B. Zementestrich Standard für Wohnbereich" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* === SECTION 2: FESTIGKEITSKLASSEN === */}
        <Card>
          <CardHeader>
            <CardTitle>Festigkeitsklassen</CardTitle>
            <CardDescription>
              Mechanische Eigenschaften nach EN 13813
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
                    <FormDescription>
                      Nach EN 13892-2 (28 Tage)
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
                        {strengthClasses.flexural.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls} N/mm²</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Nach EN 13892-2 (28 Tage)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Verschleißwiderstand */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Verschleißwiderstand</h3>
              
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
                        <SelectItem value="none">Keine Angabe</SelectItem>
                        <SelectItem value="bohme">Böhme (A-Klassen)</SelectItem>
                        <SelectItem value="bca">BCA (AR-Klassen)</SelectItem>
                        <SelectItem value="rolling_wheel">Rollrad (RWA-Klassen)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Bei Nutzschicht ohne Bodenbelag erforderlich
                    </FormDescription>
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
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          {watchedValues.wear_resistance_method === 'bca' && 
                            strengthClasses.wear_ar.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          {watchedValues.wear_resistance_method === 'rolling_wheel' && 
                            strengthClasses.wear_rwa.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
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

            {/* Weitere mechanische Eigenschaften */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="surface_hardness_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oberflächenhärte (optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                      defaultValue={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Keine Angabe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Keine Angabe</SelectItem>
                        {strengthClasses.surface_hardness.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Nach EN 13892-6
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bond_strength_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Haftzugfestigkeit (optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                      defaultValue={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Keine Angabe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Keine Angabe</SelectItem>
                        {strengthClasses.bond_strength.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls} N/mm²</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Nach EN 13892-8
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impact_resistance_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schlagfestigkeit (optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                      defaultValue={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Keine Angabe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Keine Angabe</SelectItem>
                        {strengthClasses.impact_resistance.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Nach EN ISO 6272-1
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="indentation_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eindringtiefe (optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)} 
                      defaultValue={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Keine Angabe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Keine Angabe</SelectItem>
                        {strengthClasses.indentation.map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Widerstand gegen Eindrücke
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 3: VERWENDUNGSZWECK === */}
        <Card>
          <CardHeader>
            <CardTitle>Verwendungszweck</CardTitle>
            <CardDescription>
              Geplante Anwendungsbereiche und besondere Anforderungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      Als Nutzschicht
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
                name="intended_use.indoor_only"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Nur Innenbereich
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
                      Nassbereiche
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intended_use.chemical_resistance"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Chemische Beständigkeit
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Warnung bei Nutzschicht ohne Bodenbelag */}
            {watchedValues.intended_use?.wearing_surface && !watchedValues.intended_use?.with_flooring && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">
                      Verschleißwiderstand erforderlich
                    </p>
                    <p className="text-amber-700 mt-1">
                      Bei Verwendung als Nutzschicht ohne Bodenbelag muss der Verschleißwiderstand 
                      angegeben werden (siehe oben).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* === SECTION 4: MATERIALZUSAMMENSETZUNG === */}
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
          <CardContent className="space-y-6">
            {/* Bindemittel */}
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
                  name="materials.binder_supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieferant</FormLabel>
                      <FormControl>
                        <Input placeholder="Hersteller/Lieferant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Zuschlagstoffe */}
            <div>
              <h3 className="text-sm font-medium mb-4">Zuschlagstoffe</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="materials.aggregate_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Art</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="natural_sand">Natursand</SelectItem>
                          <SelectItem value="crushed_stone">Brechsand</SelectItem>
                          <SelectItem value="recycled">Recyclat</SelectItem>
                          <SelectItem value="lightweight">Leichtzuschlag</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.aggregate_max_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max. Korngröße</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0/4">0/4 mm</SelectItem>
                          <SelectItem value="0/8">0/8 mm</SelectItem>
                          <SelectItem value="0/16">0/16 mm</SelectItem>
                          <SelectItem value="0/32">0/32 mm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materials.aggregate_amount_kg_m3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menge (kg/m³)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="z.B. 1800"
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

            {/* Wasser & W/B-Wert */}
            <div>
              <h3 className="text-sm font-medium mb-4">Wasser & W/B-Wert</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="materials.water_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wasserzugabe (l/m³)</FormLabel>
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
                      <FormDescription>
                        {watchedValues.materials?.water_content && watchedValues.materials?.binder_amount_kg_m3 && (
                          <span className="text-xs">
                            Berechnet: {(watchedValues.materials.water_content / watchedValues.materials.binder_amount_kg_m3).toFixed(3)}
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Zusatzmittel */}
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
                  Zusatzmittel hinzufügen
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

            {/* Fasern */}
            <div>
              <h3 className="text-sm font-medium mb-4">Fasern (optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="materials.fibers.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fasertyp</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Keine" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Keine</SelectItem>
                          <SelectItem value="steel">Stahlfasern</SelectItem>
                          <SelectItem value="polymer">Polymerfasern</SelectItem>
                          <SelectItem value="glass">Glasfasern</SelectItem>
                          <SelectItem value="other">Andere</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedValues.materials?.fibers?.type && watchedValues.materials.fibers.type !== 'none' && (
                  <>
                    <FormField
                      control={form.control}
                      name="materials.fibers.length_mm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Länge (mm)</FormLabel>
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
                      name="materials.fibers.dosage_kg_m3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosierung (kg/m³)</FormLabel>
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
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 5: FRISCHMÖRTEL-EIGENSCHAFTEN === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Frischmörtel-Eigenschaften
            </CardTitle>
            <CardDescription>
              Eigenschaften und Verarbeitungsparameter des frischen Mörtels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Konsistenz */}
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Konsistenz
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="fresh_mortar.consistency_method"
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

                <FormField
                  control={form.control}
                  name="fresh_mortar.consistency_tolerance_mm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Toleranz (±mm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="z.B. 10"
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

            {/* Erstarrungszeiten */}
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Erstarrungszeiten
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fresh_mortar.setting_time_initial_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erstarrungsbeginn (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="z.B. 180"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Nach EN 196-3
                      </FormDescription>
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
                          placeholder="z.B. 360"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Nach EN 196-3
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Weitere Eigenschaften */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fresh_mortar.ph_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>pH-Wert</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        placeholder="z.B. 12.5"
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
                name="fresh_mortar.processing_time_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verarbeitungszeit (min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 45"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperaturbereich
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fresh_mortar.temperature_min_celsius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min. Temperatur (°C)</FormLabel>
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
                  name="fresh_mortar.temperature_max_celsius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max. Temperatur (°C)</FormLabel>
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

        {/* === SECTION 6: VERARBEITUNGSPARAMETER === */}
        <Card>
          <CardHeader>
            <CardTitle>Verarbeitungsparameter</CardTitle>
            <CardDescription>
              Misch- und Einbauparameter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="processing.mixing_time_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mischzeit (Sekunden)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 180"
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
                name="processing.mixing_speed_rpm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mischerdrehzahl (U/min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="z.B. 30"
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
                name="processing.application_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Einbauverfahren</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="z.B. Pumpe, konventionell"
                        {...field}
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

            <FormField
              control={form.control}
              name="processing.curing_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nachbehandlung</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="z.B. Feuchthalten für 7 Tage, Folienabdeckung, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* === SECTION 7: QUALITÄTSKONTROLLE === */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Qualitätskontrolle
            </CardTitle>
            <CardDescription>
              Prüfhäufigkeiten und Akzeptanzkriterien
            </CardDescription>
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

              <FormField
                control={form.control}
                name="quality_control.sample_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probengröße</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="z.B. 3 Würfel je Prüfung"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quality_control.acceptance_criteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Akzeptanzkriterien</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="z.B. ≥ 95% der deklarierten Werte"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* === SECTION 8: BRANDVERHALTEN === */}
        <Card>
          <CardHeader>
            <CardTitle>Brandverhalten</CardTitle>
            <CardDescription>
              Klassifizierung nach EN 13501-1
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <FormDescription>
                    Zusätzliche Klassifizierung für Rauchentwicklung (s1, s2) kann in Notizen ergänzt werden
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* === SECTION 9: NOTIZEN === */}
        <Card>
          <CardHeader>
            <CardTitle>Zusätzliche Informationen</CardTitle>
            <CardDescription>
              Weitere Hinweise und besondere Anforderungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notizen</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Zusätzliche Informationen, besondere Anforderungen, etc."
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
              disabled={loading}
              className="min-w-[150px]"
            >
              {loading ? (
                <>Speichern...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
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