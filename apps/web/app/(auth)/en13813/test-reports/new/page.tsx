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
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const testReportSchema = z.object({
  recipe_id: z.string().min(1, 'Rezeptur ist erforderlich'),
  report_type: z.enum(['ITT', 'System1+', 'FPC', 'External']),
  test_lab: z.string().min(1, 'Prüflabor ist erforderlich'),
  test_lab_address: z.string().optional(),
  notified_body_number: z.string().optional(),
  notified_body_name: z.string().optional(),
  report_number: z.string().min(1, 'Berichtsnummer ist erforderlich'),
  report_date: z.string().min(1, 'Berichtsdatum ist erforderlich'),
  test_date: z.string().min(1, 'Prüfdatum ist erforderlich'),
  // Testergebnisse
  compressive_strength_value: z.number().optional(),
  compressive_strength_class: z.string().optional(),
  flexural_strength_value: z.number().optional(),
  flexural_strength_class: z.string().optional(),
  fire_class: z.string().optional(),
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
  indentation_resistance_value: z.number().optional(),
  indentation_resistance_class: z.string().optional(),
  thermal_conductivity_value: z.number().optional()
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
          unit: data.wear_resistance_type === 'bohme' ? 'cm³/50cm²' : 'mm',
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
        test_results: testResults
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
            ITT, System 1+ oder FPC Prüfbericht erfassen
          </p>
        </div>

        {/* Wichtige Hinweise */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Hinweis:</strong> ITT-Berichte haben kein automatisches Ablaufdatum. 
            Sie werden nur ungültig bei Änderungen an Rezeptur, Produktion oder Norm.
            Bei Brandklasse ≠ A1fl ist System 1+ mit Notified Body erforderlich.
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

          {/* === SECTION 2: NOTIFIED BODY (nur bei System 1+) === */}
          {reportType === 'System1+' && (
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
                        <Label>Messwert</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register('wear_resistance_value', { valueAsNumber: true })}
                          placeholder="Wert eingeben"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Klasse</Label>
                        <Input
                          {...form.register('wear_resistance_class')}
                          placeholder="z.B. A12"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium text-sm uppercase text-muted-foreground mb-4">RWFC (mit Bodenbelag)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>RWFC Wert (N/mm²)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register('rwfc_value', { valueAsNumber: true })}
                          placeholder="z.B. 5.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>RWFC Klasse</Label>
                        <Input
                          {...form.register('rwfc_class')}
                          placeholder="z.B. RWFC5"
                        />
                      </div>
                    </div>
                  </div>
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
                    <h3 className="font-medium text-sm uppercase text-muted-foreground">Oberflächenhärte (MA)</h3>
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
                        <Input
                          {...form.register('surface_hardness_class')}
                          placeholder="z.B. SH75"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-sm uppercase text-muted-foreground">Verbundfestigkeit (SR)</h3>
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
                        <Input
                          {...form.register('bond_strength_class')}
                          placeholder="z.B. B1.5"
                        />
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
                  <div className="space-y-2">
                    <Label>Brandklasse</Label>
                    <Select
                      value={form.watch('fire_class') || ''}
                      onValueChange={(value) => form.setValue('fire_class', value)}
                    >
                      <SelectTrigger className="w-full md:w-1/3">
                        <SelectValue placeholder="Brandklasse wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A1fl">A1fl - Nicht brennbar</SelectItem>
                        <SelectItem value="A2fl-s1">A2fl-s1</SelectItem>
                        <SelectItem value="Bfl-s1">Bfl-s1</SelectItem>
                        <SelectItem value="Cfl-s1">Cfl-s1</SelectItem>
                        <SelectItem value="Dfl-s1">Dfl-s1</SelectItem>
                        <SelectItem value="Efl">Efl</SelectItem>
                        <SelectItem value="Ffl">Ffl - Keine Leistung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* === SECTION 7: DATEI-UPLOAD === */}
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