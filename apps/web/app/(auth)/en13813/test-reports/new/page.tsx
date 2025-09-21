'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TestReportsService } from '@/modules/en13813/services/test-reports.service'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import {
  ArrowLeft,
  Save,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Shield,
  FlaskConical,
  Calendar,
  Building2,
  Info,
  Gauge,
  Flame,
  HardHat,
  Thermometer,
  Activity,
  CheckSquare
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { validateTestReport } from '@/lib/validations/en13813-test-report'
import {
  getCompressiveStrengthClass,
  getFlexuralStrengthClass,
  getWearResistanceClass,
  getRWFCClass,
  getSurfaceHardnessClass,
  getBondStrengthClass,
  calculateStatistics,
  checkConformity
} from '@/lib/validations/en13813-class-mapping'

const testReportSchema = z.object({
  recipe_id: z.string().min(1, 'Rezeptur ist erforderlich'),
  report_type: z.enum(['ITT', 'System1', 'System3', 'System4', 'FPC', 'External']),
  test_lab: z.string().min(1, 'Prüflabor ist erforderlich'),
  test_lab_address: z.string().optional(),
  notified_body_number: z.string().optional(),
  notified_body_name: z.string().optional(),
  report_number: z.string().min(1, 'Berichtsnummer ist erforderlich'),
  report_date: z.string().min(1, 'Berichtsdatum ist erforderlich'),
  test_date: z.string().min(1, 'Prüfdatum ist erforderlich'),
  test_age_days: z.number().optional(),
  sampling_norm: z.string().optional(),

  // Probenahme
  sampling_date: z.string().optional(),
  sampling_person: z.string().optional(),
  sampling_location: z.string().optional(),
  batch_number: z.string().optional(),
  specimen_count: z.number().optional(),
  specimen_geometry: z.string().optional(),
  curing_conditions: z.string().optional(),

  // Labor-Meta
  lab_accredited: z.boolean().optional(),
  accreditation_number: z.string().optional(),
  report_version: z.string().optional(),
  test_norm_version: z.string().optional(),
  measurement_uncertainty: z.number().optional(),

  // Testergebnisse mit Einzelwerten
  compressive_strength_value: z.number().optional(),
  compressive_strength_class: z.string().optional(),
  compressive_strength_values: z.array(z.number()).optional(),

  flexural_strength_value: z.number().optional(),
  flexural_strength_class: z.string().optional(),
  flexural_strength_values: z.array(z.number()).optional(),

  fire_class: z.string().optional(),
  fire_test_report: z.string().optional(),

  wear_resistance_type: z.string().optional(),
  wear_resistance_value: z.number().optional(),
  wear_resistance_class: z.string().optional(),

  rwfc_value: z.number().optional(),
  rwfc_class: z.string().optional(),

  surface_hardness_value: z.number().optional(),
  surface_hardness_class: z.string().optional(),

  bond_strength_value: z.number().optional(),
  bond_strength_class: z.string().optional(),

  impact_resistance_value: z.number().optional(),
  impact_resistance_class: z.string().optional(),

  thermal_conductivity_value: z.number().optional(),

  // FPC Checkboxen
  fpc_calibrations: z.boolean().optional(),
  fpc_sampling_plan: z.boolean().optional(),
  fpc_traceability: z.boolean().optional(),
  fpc_records: z.boolean().optional()
})

type TestReportFormData = z.infer<typeof testReportSchema>

export default function NewTestReportPage() {
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState<any[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('recipe_id')
  const supabase = createClientComponentClient()
  const testReportsService = new TestReportsService(supabase)

  const form = useForm<TestReportFormData>({
    resolver: zodResolver(testReportSchema),
    defaultValues: {
      report_type: 'ITT',
      recipe_id: recipeId || '',
      test_date: new Date().toISOString().split('T')[0],
      report_date: new Date().toISOString().split('T')[0]
    }
  })

  useEffect(() => {
    loadRecipes()
  }, [])

  useEffect(() => {
    if (recipeId) {
      form.setValue('recipe_id', recipeId)
      const recipe = recipes.find(r => r.id === recipeId)
      if (recipe) {
        setSelectedRecipe(recipe)
      }
    }
  }, [recipeId, recipes])

  // Automatische Klassenbestimmung für Druckfestigkeit
  useEffect(() => {
    const value = form.watch('compressive_strength_value')
    if (value) {
      const autoClass = getCompressiveStrengthClass(value)
      if (autoClass !== 'unter Klasse' && !form.watch('compressive_strength_class')) {
        form.setValue('compressive_strength_class', autoClass)
      }
    }
  }, [form.watch('compressive_strength_value')])

  // Automatische Klassenbestimmung für Biegezugfestigkeit
  useEffect(() => {
    const value = form.watch('flexural_strength_value')
    if (value) {
      const autoClass = getFlexuralStrengthClass(value)
      if (autoClass !== 'unter Klasse' && !form.watch('flexural_strength_class')) {
        form.setValue('flexural_strength_class', autoClass)
      }
    }
  }, [form.watch('flexural_strength_value')])

  // Automatische Klassenbestimmung für Oberflächenhärte
  useEffect(() => {
    const value = form.watch('surface_hardness_value')
    if (value) {
      const autoClass = getSurfaceHardnessClass(value)
      if (autoClass !== 'unter Klasse') {
        form.setValue('surface_hardness_class', autoClass)
      }
    }
  }, [form.watch('surface_hardness_value')])

  // Automatische Klassenbestimmung für Verbundfestigkeit
  useEffect(() => {
    const value = form.watch('bond_strength_value')
    if (value) {
      const autoClass = getBondStrengthClass(value)
      if (autoClass !== 'unter Klasse') {
        form.setValue('bond_strength_class', autoClass)
      }
    }
  }, [form.watch('bond_strength_value')])

  // Automatische Klassenbestimmung für RWFC
  useEffect(() => {
    const value = form.watch('rwfc_value')
    if (value) {
      const autoClass = getRWFCClass(value)
      if (autoClass !== 'unter RWFC150') {
        form.setValue('rwfc_class', autoClass)
      }
    }
  }, [form.watch('rwfc_value')])

  // Automatische Klassenbestimmung für Verschleiß
  useEffect(() => {
    const type = form.watch('wear_resistance_type')
    const value = form.watch('wear_resistance_value')
    if (type && value) {
      const autoClass = getWearResistanceClass(type, value)
      if (autoClass && !autoClass.includes('über')) {
        form.setValue('wear_resistance_class', autoClass)
      }
    }
  }, [form.watch('wear_resistance_type'), form.watch('wear_resistance_value')])

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
      toast({
        title: 'Fehler',
        description: 'Rezepturen konnten nicht geladen werden',
        variant: 'destructive'
      })
    }
  }

  const onSubmit = async (data: TestReportFormData) => {
    try {
      setLoading(true)

      // Erstelle test_results Objekt
      const testResults: any = {}

      // Druckfestigkeit
      if (data.compressive_strength_value) {
        testResults.compressive_strength = {
          value: data.compressive_strength_value,
          unit: 'N/mm²',
          class: data.compressive_strength_class,
          age_days: 28,
          norm: 'EN 13892-2',
          passed: true
        }
      }

      // Biegezugfestigkeit
      if (data.flexural_strength_value) {
        testResults.flexural_strength = {
          value: data.flexural_strength_value,
          unit: 'N/mm²',
          class: data.flexural_strength_class,
          age_days: 28,
          norm: 'EN 13892-2',
          passed: true
        }
      }

      // Brandverhalten
      if (data.fire_class && data.report_type === 'System1+') {
        testResults.fire_classification = {
          class: data.fire_class,
          norm: 'EN 13501-1',
          test_report: data.report_number,
          notified_body: data.notified_body_number
        }
      }

      // Verschleißwiderstand
      if (data.wear_resistance_value && data.wear_resistance_type) {
        const wearKey = `wear_resistance_${data.wear_resistance_type}`
        testResults[wearKey] = {
          value: data.wear_resistance_value,
          unit: data.wear_resistance_type === 'bohme' ? 'cm³/50cm²' :
                data.wear_resistance_type === 'bca' ? 'µm' :
                data.wear_resistance_type === 'rwa' ? 'cm³' : '',
          class: data.wear_resistance_class,
          norm: data.wear_resistance_type === 'bohme' ? 'EN 13892-3' :
                data.wear_resistance_type === 'bca' ? 'EN 13892-4' : 'EN 13892-5',
          passed: true
        }
      }

      // RWFC
      if (data.rwfc_value) {
        testResults.rwfc = {
          value: data.rwfc_value,
          unit: 'N/mm²',
          class: data.rwfc_class,
          norm: 'EN 13892-7',
          passed: true
        }
      }

      // Oberflächenhärte
      if (data.surface_hardness_value) {
        testResults.surface_hardness = {
          value: data.surface_hardness_value,
          unit: 'N/mm²',
          class: data.surface_hardness_class,
          norm: 'EN 13892-6',
          passed: true
        }
      }

      // Verbundfestigkeit
      if (data.bond_strength_value) {
        testResults.bond_strength = {
          value: data.bond_strength_value,
          unit: 'N/mm²',
          class: data.bond_strength_class,
          norm: 'EN 13892-8',
          passed: true
        }
      }

      // Wärmeleitfähigkeit
      if (data.thermal_conductivity_value) {
        testResults.thermal_conductivity = {
          value: data.thermal_conductivity_value,
          unit: 'W/(m·K)',
          norm: 'EN 12664',
          passed: true
        }
      }

      // Erstelle Prüfbericht
      const testReport = {
        recipe_id: data.recipe_id,
        report_type: data.report_type,
        test_lab: data.test_lab,
        test_lab_address: data.test_lab_address,
        notified_body_number: data.notified_body_number,
        notified_body_name: data.notified_body_name,
        report_number: data.report_number,
        report_date: data.report_date,
        test_date: data.test_date,
        test_results: testResults,
        metadata: {
          test_age_days: data.test_age_days || 28,
          sampling_norm: data.sampling_norm || 'prEN 13892-1',
          fpc_checks: data.report_type === 'FPC' ? {
            calibrations: data.fpc_calibrations || false,
            sampling_plan: data.fpc_sampling_plan || false,
            traceability: data.fpc_traceability || false,
            records: data.fpc_records || false
          } : undefined
        }
      }

      const createdReport = await testReportsService.createTestReport(testReport)

      // Upload PDF wenn vorhanden
      if (uploadedFile && createdReport.id) {
        await testReportsService.uploadTestReportPDF(createdReport.id, uploadedFile)
      }

      toast({
        title: 'Erfolg',
        description: 'Prüfbericht wurde erfolgreich erstellt'
      })

      router.push('/en13813/test-reports')
    } catch (error: any) {
      console.error('Error creating test report:', error)
      toast({
        title: 'Fehler',
        description: error.message || 'Prüfbericht konnte nicht erstellt werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const reportType = form.watch('report_type')

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/en13813/test-reports" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Neuer Prüfbericht</h1>
          <p className="text-muted-foreground mt-1">
            ITT, System 1 / 3 / 4 oder FPC Prüfbericht erfassen
          </p>
        </div>

        {/* Wichtige Hinweise */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Hinweise zur AVCP-Klassifizierung:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• <strong>System 1:</strong> Brandklasse mit produktionsbedingter Verbesserung → NB-Überwachung + NB-Nummer neben CE</li>
              <li>• <strong>System 3:</strong> Brandklasse ohne Produktionsverbesserung → NB-Prüfung, aber keine NB-Nummer neben CE</li>
              <li>• <strong>System 4:</strong> A1fl ohne Prüfung (96/603/EG) oder andere Verwendungen → kein NB erforderlich</li>
              <li>• ITT-Berichte sind nur bei Änderungen an Rezeptur, Produktion oder Norm zu erneuern</li>
            </ul>
          </AlertDescription>
        </Alert>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* === SECTION 1: GRUNDDATEN === */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Grunddaten</h2>
                <p className="text-sm text-muted-foreground">Berichtsinformationen und Prüflabor</p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <Label htmlFor="report_type">Berichtstyp *</Label>
                    <Select
                      value={form.watch('report_type')}
                      onValueChange={(value: any) => form.setValue('report_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ITT">ITT - Initial Type Testing</SelectItem>
                        <SelectItem value="System1+">System 1+ - Brandverhalten</SelectItem>
                        <SelectItem value="FPC">FPC - Factory Production Control</SelectItem>
                        <SelectItem value="External">Externer Bericht</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report_number">Berichtsnummer *</Label>
                    <Input
                      id="report_number"
                      {...form.register('report_number')}
                      placeholder="z.B. ITT-2025-001"
                    />
                    {form.formState.errors.report_number && (
                      <p className="text-sm text-red-600">{form.formState.errors.report_number.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test_lab">Prüflabor *</Label>
                    <Input
                      id="test_lab"
                      {...form.register('test_lab')}
                      placeholder="Name des Prüflabors"
                    />
                    {form.formState.errors.test_lab && (
                      <p className="text-sm text-red-600">{form.formState.errors.test_lab.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test_date">Prüfdatum *</Label>
                    <Input
                      id="test_date"
                      type="date"
                      {...form.register('test_date')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report_date">Berichtsdatum *</Label>
                    <Input
                      id="report_date"
                      type="date"
                      {...form.register('report_date')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test_age_days">Prüfalter (Tage)</Label>
                    <Input
                      id="test_age_days"
                      type="number"
                      {...form.register('test_age_days', { valueAsNumber: true })}
                      placeholder="28"
                      defaultValue={28}
                    />
                    <p className="text-xs text-muted-foreground">Standard: 28 Tage für EN 13892-2</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sampling_norm">Probennahme-Norm</Label>
                    <Input
                      id="sampling_norm"
                      {...form.register('sampling_norm')}
                      placeholder="prEN 13892-1"
                      defaultValue="prEN 13892-1"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <Label htmlFor="test_lab_address">Prüflabor Adresse</Label>
                    <Input
                      id="test_lab_address"
                      {...form.register('test_lab_address')}
                      placeholder="Vollständige Adresse des Prüflabors (optional)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === SECTION 2: PROBENAHME === */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Probenahme & Probekörper</h2>
                <p className="text-sm text-muted-foreground">Dokumentation der Probenahme und Lagerungsbedingungen</p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sampling_date">Probenahmedatum</Label>
                    <Input
                      id="sampling_date"
                      type="date"
                      {...form.register('sampling_date')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sampling_person">Probennehmer</Label>
                    <Input
                      id="sampling_person"
                      {...form.register('sampling_person')}
                      placeholder="Name des Probennehmers"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch_number">Chargennummer</Label>
                    <Input
                      id="batch_number"
                      {...form.register('batch_number')}
                      placeholder="z.B. 2025-001-A"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sampling_location">Probenahmeort</Label>
                    <Input
                      id="sampling_location"
                      {...form.register('sampling_location')}
                      placeholder="z.B. Produktionslinie 1, Baustelle XY"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specimen_count">Anzahl Probekörper</Label>
                    <Input
                      id="specimen_count"
                      type="number"
                      {...form.register('specimen_count', { valueAsNumber: true })}
                      placeholder="z.B. 6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specimen_geometry">Probekörper-Geometrie</Label>
                    <Select
                      value={form.watch('specimen_geometry') || ''}
                      onValueChange={(value) => form.setValue('specimen_geometry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40x40x160">40×40×160 mm (Prismen)</SelectItem>
                        <SelectItem value="100x100x100">100×100×100 mm (Würfel)</SelectItem>
                        <SelectItem value="150x150x150">150×150×150 mm (Würfel)</SelectItem>
                        <SelectItem value="custom">Andere</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <Label htmlFor="curing_conditions">Lagerungs-/Abbindebedingungen</Label>
                    <Textarea
                      id="curing_conditions"
                      {...form.register('curing_conditions')}
                      placeholder="z.B. 20 ± 2 °C, 65 ± 5 % r.F., 28 Tage Wasserlagerung"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === SECTION 3: NOTIFIED BODY (nur bei System 1 und 3) === */}
          {(reportType === 'System1' || reportType === 'System3') && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Notified Body</h2>
                  <p className="text-sm text-muted-foreground">Erforderlich für System 1+ Prüfungen</p>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="notified_body_number">NB Nummer *</Label>
                      <Input
                        id="notified_body_number"
                        {...form.register('notified_body_number')}
                        placeholder="z.B. 0672"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notified_body_name">NB Name</Label>
                      <Input
                        id="notified_body_name"
                        {...form.register('notified_body_name')}
                        placeholder="Name der notifizierten Stelle"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* === SECTION 3: FESTIGKEITSPRÜFUNGEN === */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Festigkeitsprüfungen</h2>
                <p className="text-sm text-muted-foreground">Druck- und Biegezugfestigkeit nach EN 13892-2</p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm uppercase text-muted-foreground">Druckfestigkeit</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Messwert (N/mm²)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register('compressive_strength_value', { valueAsNumber: true })}
                          placeholder="z.B. 28.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Klasse</Label>
                        <Input
                          {...form.register('compressive_strength_class')}
                          placeholder="z.B. C25"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm uppercase text-muted-foreground">Biegezugfestigkeit</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Messwert (N/mm²)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register('flexural_strength_value', { valueAsNumber: true })}
                          placeholder="z.B. 4.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Klasse</Label>
                        <Input
                          {...form.register('flexural_strength_class')}
                          placeholder="z.B. F4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === SECTION 4: VERSCHLEIßWIDERSTAND & RWFC === */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Verschleißwiderstand & RWFC</h2>
                <p className="text-sm text-muted-foreground">Oberflächeneigenschaften und Rollwiderstand</p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-sm uppercase text-muted-foreground mb-4">Verschleißwiderstand</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Prüfmethode</Label>
                        <Select
                          value={form.watch('wear_resistance_type') || ''}
                          onValueChange={(value) => form.setValue('wear_resistance_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Methode wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bohme">Böhme (EN 13892-3)</SelectItem>
                            <SelectItem value="bca">BCA (EN 13892-4)</SelectItem>
                            <SelectItem value="rwa">Rolling Wheel (EN 13892-5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Messwert {form.watch('wear_resistance_type') === 'bohme' ? '(cm³/50 cm²)' :
                                   form.watch('wear_resistance_type') === 'bca' ? '(µm max. Abtrag)' :
                                   form.watch('wear_resistance_type') === 'rwa' ? '(cm³)' : ''}
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register('wear_resistance_value', { valueAsNumber: true })}
                          placeholder={
                            form.watch('wear_resistance_type') === 'bohme' ? 'z.B. 12.5' :
                            form.watch('wear_resistance_type') === 'bca' ? 'z.B. 100' :
                            form.watch('wear_resistance_type') === 'rwa' ? 'z.B. 20' : 'Wert eingeben'
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Klasse</Label>
                        <Input
                          {...form.register('wear_resistance_class')}
                          placeholder={
                            form.watch('wear_resistance_type') === 'bohme' ? 'z.B. A12 (A22...A1.5)' :
                            form.watch('wear_resistance_type') === 'bca' ? 'z.B. AR6 (AR6...AR0.5)' :
                            form.watch('wear_resistance_type') === 'rwa' ? 'z.B. RWA20 (RWA300...RWA1)' : 'z.B. A12'
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {selectedRecipe?.properties?.use_with_covering && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium text-sm uppercase text-muted-foreground mb-4">RWFC (mit Bodenbelag)</h3>
                        <Alert className="mb-4">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            RWFC-Prüfung ist erforderlich, da diese Rezeptur für Einsatz mit Bodenbelag konfiguriert ist.
                          </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>RWFC Wert (N) *</Label>
                            <Input
                              type="number"
                              step="10"
                              {...form.register('rwfc_value', { valueAsNumber: true })}
                              placeholder="z.B. 350"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>RWFC Klasse</Label>
                            <Select
                              value={form.watch('rwfc_class') || ''}
                              onValueChange={(value) => form.setValue('rwfc_class', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Klasse wählen" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="RWFC150">RWFC150 (150 N)</SelectItem>
                                <SelectItem value="RWFC250">RWFC250 (250 N)</SelectItem>
                                <SelectItem value="RWFC350">RWFC350 (350 N)</SelectItem>
                                <SelectItem value="RWFC450">RWFC450 (450 N)</SelectItem>
                                <SelectItem value="RWFC550">RWFC550 (550 N)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === SECTION 5: SPEZIELLE EIGENSCHAFTEN === */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <HardHat className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Spezielle Eigenschaften</h2>
                <p className="text-sm text-muted-foreground">Typspezifische Prüfungen</p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm uppercase text-muted-foreground">Oberflächenhärte (SH)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Wert (N/mm²)</Label>
                        <Input
                          type="number"
                          step="1"
                          {...form.register('surface_hardness_value', { valueAsNumber: true })}
                          placeholder="z.B. 85"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Klasse</Label>
                        <Select
                          value={form.watch('surface_hardness_class') || ''}
                          onValueChange={(value) => form.setValue('surface_hardness_class', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Klasse wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SH30">SH30</SelectItem>
                            <SelectItem value="SH40">SH40</SelectItem>
                            <SelectItem value="SH50">SH50</SelectItem>
                            <SelectItem value="SH70">SH70</SelectItem>
                            <SelectItem value="SH100">SH100</SelectItem>
                            <SelectItem value="SH150">SH150</SelectItem>
                            <SelectItem value="SH200">SH200</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm uppercase text-muted-foreground">Verbundfestigkeit (B)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Wert (N/mm²)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register('bond_strength_value', { valueAsNumber: true })}
                          placeholder="z.B. 1.8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Klasse</Label>
                        <Select
                          value={form.watch('bond_strength_class') || ''}
                          onValueChange={(value) => form.setValue('bond_strength_class', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Klasse wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="B0.2">B0.2</SelectItem>
                            <SelectItem value="B0.5">B0.5</SelectItem>
                            <SelectItem value="B1.0">B1.0</SelectItem>
                            <SelectItem value="B1.5">B1.5</SelectItem>
                            <SelectItem value="B2.0">B2.0</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <h3 className="font-medium text-sm uppercase text-muted-foreground">Wärmeleitfähigkeit (Heizestrich)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>λ-Wert (W/(m·K))</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register('thermal_conductivity_value', { valueAsNumber: true })}
                          placeholder="z.B. 1.35"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === SECTION 6: BRANDVERHALTEN (nur bei System 1+) === */}
          {reportType === 'System1+' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Brandverhalten</h2>
                  <p className="text-sm text-muted-foreground">Klassifizierung nach EN 13501-1</p>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Brandklasse nach EN 13501-1</Label>
                        <Select
                          value={form.watch('fire_class') || ''}
                          onValueChange={(value) => form.setValue('fire_class', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Brandklasse wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A1fl">A1fl - Nicht brennbar (ohne Prüfung möglich)</SelectItem>
                            <SelectItem value="A2fl-s1">A2fl-s1</SelectItem>
                            <SelectItem value="Bfl-s1">Bfl-s1</SelectItem>
                            <SelectItem value="Cfl-s1">Cfl-s1</SelectItem>
                            <SelectItem value="Dfl-s1">Dfl-s1</SelectItem>
                            <SelectItem value="Efl">Efl</SelectItem>
                            <SelectItem value="Ffl">Ffl - Keine Leistung</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>EN 13501-1 Prüfbericht</Label>
                        <Input
                          {...form.register('fire_test_report')}
                          placeholder="Berichtsnummer der Brandprüfung"
                          disabled={form.watch('fire_class') === 'A1fl'}
                        />
                        {form.watch('fire_class') === 'A1fl' && (
                          <p className="text-xs text-muted-foreground">Bei A1fl: Verweis auf 96/603/EG</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* === SECTION 7: FPC KONTROLLPUNKTE === */}
          {reportType === 'FPC' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">FPC Kontrollpunkte</h2>
                  <p className="text-sm text-muted-foreground">Gemäß EN 13813 Abschnitt 6.3 & 6.3.6</p>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fpc_calibrations"
                        checked={form.watch('fpc_calibrations') || false}
                        onCheckedChange={(checked) => form.setValue('fpc_calibrations', checked as boolean)}
                      />
                      <Label htmlFor="fpc_calibrations" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Kalibrierungen durchgeführt und dokumentiert
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fpc_sampling_plan"
                        checked={form.watch('fpc_sampling_plan') || false}
                        onCheckedChange={(checked) => form.setValue('fpc_sampling_plan', checked as boolean)}
                      />
                      <Label htmlFor="fpc_sampling_plan" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Sampling-Plan eingehalten
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fpc_traceability"
                        checked={form.watch('fpc_traceability') || false}
                        onCheckedChange={(checked) => form.setValue('fpc_traceability', checked as boolean)}
                      />
                      <Label htmlFor="fpc_traceability" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Rückverfolgbarkeit gewährleistet
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fpc_records"
                        checked={form.watch('fpc_records') || false}
                        onCheckedChange={(checked) => form.setValue('fpc_records', checked as boolean)}
                      />
                      <Label htmlFor="fpc_records" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Aufzeichnungen vollständig
                      </Label>
                    </div>
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Diese Punkte müssen regelmäßig im Rahmen der werkseigenen Produktionskontrolle überprüft und dokumentiert werden.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* === SECTION 8: DATEI-UPLOAD === */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Prüfbericht Dokument</h2>
                <p className="text-sm text-muted-foreground">Original-Prüfbericht als PDF hochladen</p>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {uploadedFile && (
                      <Badge variant="secondary" className="gap-1">
                        <FileText className="w-3 h-3" />
                        {uploadedFile.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Das PDF wird sicher gespeichert und kann später heruntergeladen werden.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* === AKTIONEN === */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/en13813/test-reports')}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? (
                <>Speichert...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Prüfbericht speichern
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}