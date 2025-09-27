'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { LabValuesService } from '@/modules/en13813/services/lab-values.service'
import { ConformityAssessmentService } from '@/modules/en13813/services'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft, 
  Save, 
  TestTube,
  Droplets,
  Thermometer,
  Timer,
  Calendar,
  Info,
  CheckCircle,
  AlertTriangle,
  Gauge,
  Hammer,
  Link2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const labValueSchema = z.object({
  recipe_id: z.string().min(1, 'Rezeptur ist erforderlich'),
  batch_id: z.string().optional(),
  sample_id: z.string().min(1, 'Proben-ID ist erforderlich'),
  sample_datetime: z.string().min(1, 'Probenahmezeit ist erforderlich'),
  sample_location: z.string().optional(),
  sampled_by: z.string().optional(),
  test_type: z.enum(['fresh', 'hardened', 'both']),
  test_age_days: z.number().optional(),
  
  // Frischmörtel
  fresh_consistency: z.number().optional(),
  fresh_temperature: z.number().optional(),
  fresh_ph: z.number().optional(),
  fresh_density: z.number().optional(),
  fresh_workability_time: z.number().optional(),
  
  // Festmörtel
  compressive_strength_1: z.number().optional(),
  compressive_strength_2: z.number().optional(),
  compressive_strength_3: z.number().optional(),
  flexural_strength: z.number().optional(),
  hardened_density: z.number().optional(),
  
  // Verschleißprüfungen
  wear_resistance_bohme: z.number().optional(),
  wear_resistance_bca: z.number().optional(),
  wear_resistance_rollrad: z.number().optional(),
  
  // Oberflächenhärte (MA-Estriche)
  surface_hardness: z.number().optional(),
  
  // Haftzugfestigkeit (Verbundestriche)
  bond_strength: z.number().optional(),
  
  // Kommentare
  comments: z.string().optional()
})

type LabValueFormData = z.infer<typeof labValueSchema>

// Hilfsfunktionen für Verschleißklassen
function getWearClassBohme(value: number): string {
  if (value <= 1.5) return 'A1,5'
  if (value <= 3) return 'A3'
  if (value <= 6) return 'A6'
  if (value <= 9) return 'A9'
  if (value <= 12) return 'A12'
  if (value <= 15) return 'A15'
  if (value <= 22) return 'A22'
  return 'A22+'
}

function getWearLimitBohme(className?: string): number {
  const limits: Record<string, number> = {
    'A1,5': 1.5, 'A3': 3, 'A6': 6, 'A9': 9, 'A12': 12, 'A15': 15, 'A22': 22
  }
  return limits[className || ''] || 22
}

function getWearClassBCA(value: number): string {
  if (value <= 50) return 'AR0,5'
  if (value <= 100) return 'AR1'
  if (value <= 200) return 'AR2'
  if (value <= 400) return 'AR4'
  if (value <= 600) return 'AR6'
  return 'AR6+'
}

function getWearLimitBCA(className?: string): number {
  const limits: Record<string, number> = {
    'AR0,5': 50, 'AR1': 100, 'AR2': 200, 'AR4': 400, 'AR6': 600
  }
  return limits[className || ''] || 600
}

function getWearClassRollrad(value: number): string {
  if (value <= 1) return 'RWA1'
  if (value <= 2) return 'RWA2'
  if (value <= 5) return 'RWA5'
  if (value <= 10) return 'RWA10'
  if (value <= 15) return 'RWA15'
  if (value <= 20) return 'RWA20'
  return 'RWA20+'
}

function getWearLimitRollrad(className?: string): number {
  const limits: Record<string, number> = {
    'RWA1': 1, 'RWA2': 2, 'RWA5': 5, 'RWA10': 10, 'RWA15': 15, 'RWA20': 20
  }
  return limits[className || ''] || 20
}

function NewLabValuePageContent() {
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const batchId = searchParams.get('batch_id')
  const supabase = createClientComponentClient()
  const labValuesService = new LabValuesService(supabase)

  const form = useForm<LabValueFormData>({
    resolver: zodResolver(labValueSchema),
    defaultValues: {
      test_type: 'both',
      sample_datetime: new Date().toISOString().slice(0, 16),
      test_age_days: 28,
      batch_id: batchId || ''
    }
  })

  useEffect(() => {
    loadRecipes()
    loadBatches()
  }, [])

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('en13813_recipes')
        .select('*')
        .eq('status', 'active')
        .order('recipe_code')

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error('Error loading recipes:', error)
    }
  }

  const loadBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('en13813_batches')
        .select('*')
        .order('batch_number', { ascending: false })
        .limit(50)

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error('Error loading batches:', error)
    }
  }

  const onSubmit = async (data: LabValueFormData) => {
    try {
      setLoading(true)

      // Hole Rezeptur für Spezifikationen
      const recipe = recipes.find(r => r.id === data.recipe_id)
      if (!recipe) throw new Error('Rezeptur nicht gefunden')

      // Erstelle fresh_properties
      const freshProperties: any = {}
      if (data.fresh_consistency) {
        freshProperties.consistency = {
          value: data.fresh_consistency,
          unit: 'mm',
          method: 'flow_table',
          specification: '170-190', // Sollte aus Rezeptur kommen
          passed: data.fresh_consistency >= 170 && data.fresh_consistency <= 190
        }
      }
      if (data.fresh_temperature) {
        freshProperties.temperature = {
          value: data.fresh_temperature,
          unit: '°C',
          specification: '10-30',
          passed: data.fresh_temperature >= 10 && data.fresh_temperature <= 30
        }
      }
      if (data.fresh_ph) {
        freshProperties.ph = {
          value: data.fresh_ph,
          specification: '12-13.5',
          passed: data.fresh_ph >= 12 && data.fresh_ph <= 13.5
        }
      }
      if (data.fresh_density) {
        freshProperties.density = {
          value: data.fresh_density,
          unit: 'kg/m³',
          specification: '2200-2300',
          passed: data.fresh_density >= 2200 && data.fresh_density <= 2300
        }
      }
      if (data.fresh_workability_time) {
        freshProperties.workability_time = {
          value: data.fresh_workability_time,
          unit: 'min',
          specification: '≥30',
          passed: data.fresh_workability_time >= 30
        }
      }

      // Erstelle hardened_properties
      const hardenedProperties: any = {}
      const compressiveValues = [
        data.compressive_strength_1,
        data.compressive_strength_2,
        data.compressive_strength_3
      ].filter(v => v !== undefined) as number[]

      if (compressiveValues.length > 0) {
        const mean = compressiveValues.reduce((a, b) => a + b, 0) / compressiveValues.length
        const variance = compressiveValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / compressiveValues.length
        const stdDev = Math.sqrt(variance)
        
        // Nutze EN 13813 konforme Konformitätskriterien
        const conformityResult = ConformityAssessmentService.assessCompressiveStrength(
          compressiveValues,
          recipe.compressive_strength_class || 'C25'
        )
        
        hardenedProperties.compressive_strength = {
          value: mean,
          unit: 'N/mm²',
          individual_values: compressiveValues,
          mean: mean,
          std_dev: stdDev,
          specification: `≥${conformityResult.individualCheck.declaredValue}`,
          class: recipe.compressive_strength_class,
          passed: conformityResult.passed,
          conformity: conformityResult
        }
      }

      if (data.flexural_strength) {
        const declaredFlexural = parseFloat(recipe.flexural_strength_class?.replace('F', '') || '4')
        hardenedProperties.flexural_strength = {
          value: data.flexural_strength,
          unit: 'N/mm²',
          specification: `≥${declaredFlexural}`,
          class: recipe.flexural_strength_class,
          passed: data.flexural_strength >= declaredFlexural
        }
      }

      if (data.hardened_density) {
        hardenedProperties.density = {
          value: data.hardened_density,
          unit: 'kg/m³',
          specification: '2150-2250',
          passed: data.hardened_density >= 2150 && data.hardened_density <= 2250
        }
      }

      // Verschleißprüfungen
      if (data.wear_resistance_bohme) {
        hardenedProperties.wear_resistance_bohme = {
          value: data.wear_resistance_bohme,
          unit: 'cm³/50cm²',
          method: 'Böhme',
          norm: 'EN 13892-3',
          class: getWearClassBohme(data.wear_resistance_bohme),
          specification: `≤${getWearLimitBohme(recipe.wear_resistance_bohme_class)}`,
          passed: data.wear_resistance_bohme <= getWearLimitBohme(recipe.wear_resistance_bohme_class)
        }
      }

      if (data.wear_resistance_bca) {
        hardenedProperties.wear_resistance_bca = {
          value: data.wear_resistance_bca,
          unit: 'μm',
          method: 'BCA',
          norm: 'EN 13892-4',
          class: getWearClassBCA(data.wear_resistance_bca),
          specification: `≤${getWearLimitBCA(recipe.wear_resistance_bca_class)}`,
          passed: data.wear_resistance_bca <= getWearLimitBCA(recipe.wear_resistance_bca_class)
        }
      }

      if (data.wear_resistance_rollrad) {
        hardenedProperties.wear_resistance_rollrad = {
          value: data.wear_resistance_rollrad,
          unit: 'cm³/cm²',
          method: 'Rollrad',
          norm: 'EN 13892-5',
          class: getWearClassRollrad(data.wear_resistance_rollrad),
          specification: `≤${getWearLimitRollrad(recipe.wear_resistance_rwa_class)}`,
          passed: data.wear_resistance_rollrad <= getWearLimitRollrad(recipe.wear_resistance_rwa_class)
        }
      }

      // Oberflächenhärte (PFLICHT bei MA)
      if (data.surface_hardness) {
        const declaredSH = parseFloat(recipe.surface_hardness_class?.replace('SH', '') || '0')
        hardenedProperties.surface_hardness = {
          value: data.surface_hardness,
          unit: 'N/mm²',
          norm: 'EN 13892-6',
          specification: `≥${declaredSH}`,
          class: recipe.surface_hardness_class,
          passed: data.surface_hardness >= declaredSH,
          mandatory_for_MA: recipe.estrich_type === 'MA'
        }
      }

      // Haftzugfestigkeit (PFLICHT bei SR)
      if (data.bond_strength) {
        const declaredBond = parseFloat(recipe.bond_strength_class?.replace('B', '').replace(',', '.') || '0')
        hardenedProperties.bond_strength = {
          value: data.bond_strength,
          unit: 'N/mm²',
          norm: 'EN 13892-8',
          specification: `≥${declaredBond}`,
          class: recipe.bond_strength_class,
          passed: data.bond_strength >= declaredBond,
          mandatory_for_SR: recipe.estrich_type === 'SR'
        }
      }

      // Erstelle Laborwert
      const labValue = {
        recipe_id: data.recipe_id,
        batch_id: data.batch_id === 'none' ? undefined : data.batch_id,
        sample_id: data.sample_id,
        sample_datetime: data.sample_datetime,
        sample_location: data.sample_location,
        sampled_by: data.sampled_by,
        test_type: data.test_type,
        test_age_days: data.test_age_days,
        fresh_properties: Object.keys(freshProperties).length > 0 ? freshProperties : null,
        hardened_properties: Object.keys(hardenedProperties).length > 0 ? hardenedProperties : null,
        comments: data.comments
      }

      await labValuesService.createLabValue(labValue)

      toast({
        title: 'Erfolg',
        description: 'Laborwert wurde erfolgreich erfasst'
      })

      router.push('/en13813/lab-values')
    } catch (error: any) {
      console.error('Error creating lab value:', error)
      toast({
        title: 'Fehler',
        description: error.message || 'Laborwert konnte nicht erstellt werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const testType = form.watch('test_type')

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/en13813/lab-values" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Neuer Laborwert</h1>
          <p className="text-muted-foreground mt-1">
            Frisch- und Festmörtelprüfung erfassen
          </p>
        </div>

        {/* Wichtige Hinweise */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Akzeptanzkriterien:</strong> Einzelwerte ≥ 0.85 × deklariert, 
            Mittelwert ≥ 0.95 × deklariert. Bei Unterschreitung wird automatisch 
            eine Warnung erstellt.
          </AlertDescription>
        </Alert>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Probenahme */}
          <Card>
            <CardHeader>
              <CardTitle>Probenahme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe_id">Rezeptur *</Label>
                  <Select
                    value={form.watch('recipe_id')}
                    onValueChange={(value) => {
                      form.setValue('recipe_id', value)
                      const recipe = recipes.find(r => r.id === value)
                      setSelectedRecipe(recipe)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rezeptur auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipes.map(recipe => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.recipe_code} - {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.recipe_id && (
                    <p className="text-sm text-red-600">{form.formState.errors.recipe_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch_id">Charge (optional)</Label>
                  <Select
                    value={form.watch('batch_id') || ''}
                    onValueChange={(value) => form.setValue('batch_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Charge auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine Charge</SelectItem>
                      {batches.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batch_number} - {format(new Date(batch.production_date), 'dd.MM.yyyy', { locale: de })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample_id">Proben-ID *</Label>
                  <Input
                    id="sample_id"
                    {...form.register('sample_id')}
                    placeholder="z.B. P-2025-001"
                  />
                  {form.formState.errors.sample_id && (
                    <p className="text-sm text-red-600">{form.formState.errors.sample_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample_datetime">Probenahmezeit *</Label>
                  <Input
                    id="sample_datetime"
                    type="datetime-local"
                    {...form.register('sample_datetime')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample_location">Probenahmeort</Label>
                  <Input
                    id="sample_location"
                    {...form.register('sample_location')}
                    placeholder="z.B. Mischer 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampled_by">Probenehmer</Label>
                  <Input
                    id="sampled_by"
                    {...form.register('sampled_by')}
                    placeholder="Name des Probenehmers"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test_type">Prüfart *</Label>
                  <Select
                    value={form.watch('test_type')}
                    onValueChange={(value: any) => form.setValue('test_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresh">Nur Frischmörtel</SelectItem>
                      <SelectItem value="hardened">Nur Festmörtel</SelectItem>
                      <SelectItem value="both">Frisch- und Festmörtel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(testType === 'hardened' || testType === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="test_age_days">Prüfalter (Tage)</Label>
                    <Select
                      value={form.watch('test_age_days')?.toString() || '28'}
                      onValueChange={(value) => form.setValue('test_age_days', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Tage</SelectItem>
                        <SelectItem value="28">28 Tage</SelectItem>
                        <SelectItem value="56">56 Tage</SelectItem>
                        <SelectItem value="90">90 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prüfergebnisse */}
          <Card>
            <CardHeader>
              <CardTitle>Prüfergebnisse</CardTitle>
              <CardDescription>
                Geben Sie die Messwerte ein
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={testType === 'hardened' ? 'hardened' : 'fresh'}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="fresh" disabled={testType === 'hardened'}>
                    <Droplets className="w-4 h-4 mr-2" />
                    Frischmörtel
                  </TabsTrigger>
                  <TabsTrigger value="hardened" disabled={testType === 'fresh'}>
                    <TestTube className="w-4 h-4 mr-2" />
                    Festmörtel
                  </TabsTrigger>
                  <TabsTrigger value="wear" disabled={testType === 'fresh'}>
                    <Gauge className="w-4 h-4 mr-2" />
                    Verschleiß
                  </TabsTrigger>
                  <TabsTrigger value="special" disabled={testType === 'fresh'}>
                    <Hammer className="w-4 h-4 mr-2" />
                    Spezial
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="fresh" className="space-y-4">
                  {(testType === 'fresh' || testType === 'both') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Konsistenz (Ausbreitmaß in mm)</Label>
                        <Input
                          type="number"
                          step="1"
                          {...form.register('fresh_consistency', { valueAsNumber: true })}
                          placeholder="z.B. 180"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Temperatur (°C)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register('fresh_temperature', { valueAsNumber: true })}
                          placeholder="z.B. 18.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>pH-Wert</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register('fresh_ph', { valueAsNumber: true })}
                          placeholder="z.B. 12.8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frischdichte (kg/m³)</Label>
                        <Input
                          type="number"
                          step="1"
                          {...form.register('fresh_density', { valueAsNumber: true })}
                          placeholder="z.B. 2250"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Verarbeitungszeit (min)</Label>
                        <Input
                          type="number"
                          step="5"
                          {...form.register('fresh_workability_time', { valueAsNumber: true })}
                          placeholder="z.B. 45"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="hardened" className="space-y-4">
                  {(testType === 'hardened' || testType === 'both') && (
                    <>
                      <div>
                        <Label className="mb-3 block">Druckfestigkeit (N/mm²) - 3 Einzelwerte</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Probe 1</Label>
                            <Input
                              type="number"
                              step="0.1"
                              {...form.register('compressive_strength_1', { valueAsNumber: true })}
                              placeholder="z.B. 25.8"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Probe 2</Label>
                            <Input
                              type="number"
                              step="0.1"
                              {...form.register('compressive_strength_2', { valueAsNumber: true })}
                              placeholder="z.B. 26.5"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Probe 3</Label>
                            <Input
                              type="number"
                              step="0.1"
                              {...form.register('compressive_strength_3', { valueAsNumber: true })}
                              placeholder="z.B. 27.2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Biegezugfestigkeit (N/mm²)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            {...form.register('flexural_strength', { valueAsNumber: true })}
                            placeholder="z.B. 4.2"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Rohdichte (kg/m³)</Label>
                          <Input
                            type="number"
                            step="1"
                            {...form.register('hardened_density', { valueAsNumber: true })}
                            placeholder="z.B. 2180"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="wear" className="space-y-4">
                  {(testType === 'hardened' || testType === 'both') && (
                    <>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Verschleißprüfungen sind erforderlich bei Nutzschichten ohne Bodenbelag.
                          Wählen Sie die zutreffende Prüfmethode gemäß Rezeptur.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Verschleiß nach Böhme (cm³/50cm²) - EN 13892-3</Label>
                          <Input
                            type="number"
                            step="0.1"
                            {...form.register('wear_resistance_bohme', { valueAsNumber: true })}
                            placeholder="z.B. 12.5 für Klasse A12"
                          />
                          <p className="text-xs text-muted-foreground">
                            A1,5 (≤1,5) | A3 (≤3) | A6 (≤6) | A9 (≤9) | A12 (≤12) | A15 (≤15) | A22 (≤22)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Verschleiß BCA (µm) - EN 13892-4</Label>
                          <Input
                            type="number"
                            step="1"
                            {...form.register('wear_resistance_bca', { valueAsNumber: true })}
                            placeholder="z.B. 100 für Klasse AR1"
                          />
                          <p className="text-xs text-muted-foreground">
                            AR0,5 (≤50) | AR1 (≤100) | AR2 (≤200) | AR4 (≤400) | AR6 (≤600)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Rollrad-Verschleiß (cm³/cm²) - EN 13892-5</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register('wear_resistance_rollrad', { valueAsNumber: true })}
                            placeholder="z.B. 2.0 für Klasse RWA2"
                          />
                          <p className="text-xs text-muted-foreground">
                            RWA1 (≤1) | RWA2 (≤2) | RWA5 (≤5) | RWA10 (≤10) | RWA15 (≤15) | RWA20 (≤20)
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="special" className="space-y-4">
                  {(testType === 'hardened' || testType === 'both') && (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Hammer className="w-4 h-4" />
                            Oberflächenhärte (N/mm²) - EN 13892-6
                          </Label>
                          <Input
                            type="number"
                            step="1"
                            {...form.register('surface_hardness', { valueAsNumber: true })}
                            placeholder="z.B. 80 für Klasse SH75"
                          />
                          <p className="text-xs text-muted-foreground">
                            <strong>Pflicht bei MA-Estrichen!</strong> SH30 (≥30) | SH40 (≥40) | SH50 (≥50) | 
                            SH60 (≥60) | SH70 (≥70) | SH75 (≥75) | SH80 (≥80) | SH100 (≥100) | 
                            SH150 (≥150) | SH200 (≥200)
                          </p>
                          {selectedRecipe?.estrich_type === 'MA' && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Oberflächenhärte ist PFLICHT bei Magnesiaestrichen (MA)!
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Link2 className="w-4 h-4" />
                            Haftzugfestigkeit (N/mm²) - EN 13892-8
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            {...form.register('bond_strength', { valueAsNumber: true })}
                            placeholder="z.B. 1.8 für Klasse B1.5"
                          />
                          <p className="text-xs text-muted-foreground">
                            <strong>Pflicht bei Verbundestrichen (SR)!</strong> 
                            B0,2 (≥0,2) | B0,5 (≥0,5) | B1,0 (≥1,0) | B1,5 (≥1,5) | B2,0 (≥2,0)
                          </p>
                          {selectedRecipe?.estrich_type === 'SR' && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Haftzugfestigkeit ist PFLICHT bei Kunstharzestrichen im Verbund (SR)!
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Kommentare */}
          <Card>
            <CardHeader>
              <CardTitle>Kommentare</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...form.register('comments')}
                placeholder="Optional: Anmerkungen zur Prüfung"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Aktionen */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/en13813/lab-values')}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Speichert...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Laborwert speichern
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewLabValuePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Lädt...</div>}>
      <NewLabValuePageContent />
    </Suspense>
  )
}