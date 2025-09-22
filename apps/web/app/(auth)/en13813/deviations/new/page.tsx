'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  AlertTriangle,
  Save,
  X,
  Plus,
  Calculator,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { DeviationFormSchema, evaluateConformity, type DeviationForm } from '@/modules/en13813/schemas/deviation.schema'

export default function NewDeviationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<{ value: number; date: string; age_days: number }[]>([])
  const [conformityEvaluation, setConformityEvaluation] = useState<any>(null)
  const [recipes, setRecipes] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [selectedDevice, setSelectedDevice] = useState<any>(null)

  const form = useForm<DeviationForm>({
    resolver: zodResolver(DeviationFormSchema),
    defaultValues: {
      title: '',
      description: '',
      affected_characteristic: '',
      target_class: '',
      test_standard: 'EN 13892-2',
      conformity_mode: 'single_value',
      test_results: [],
      deviation_type: 'product',
      severity: 'minor',
      source: 'quality_control',
      discovered_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      discovered_by: '',
      immediate_action_required: true,
      batch_blocked: false,
      marking_blocked: false,
      created_by: '',
      status: 'open'
    }
  })

  useEffect(() => {
    loadReferenceData()
  }, [])

  const loadReferenceData = async () => {
    try {
      // Load recipes
      const recipesRes = await fetch('/api/en13813/recipes')
      const recipesData = await recipesRes.json()
      setRecipes(recipesData)

      // Load recent batches
      const batchesRes = await fetch('/api/en13813/batches?limit=50')
      const batchesData = await batchesRes.json()
      setBatches(batchesData)

      // Load devices
      const devicesRes = await fetch('/api/en13813/devices')
      const devicesData = await devicesRes.json()
      setDevices(devicesData)
    } catch (error) {
      console.error('Error loading reference data:', error)
    }
  }

  const addTestResult = () => {
    const newResult = {
      value: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      age_days: 28
    }
    setTestResults([...testResults, newResult])
  }

  const removeTestResult = (index: number) => {
    setTestResults(testResults.filter((_, i) => i !== index))
  }

  const updateTestResult = (index: number, field: string, value: any) => {
    const updated = [...testResults]
    updated[index] = { ...updated[index], [field]: value }
    setTestResults(updated)

    // Update form
    form.setValue('test_results', updated)

    // Evaluate conformity
    if (updated.length > 0 && form.getValues('target_class')) {
      evaluateTestResults(updated)
    }
  }

  const evaluateTestResults = (results: any[]) => {
    const values = results.map(r => parseFloat(r.value))
    const targetClass = form.getValues('target_class')
    const targetValue = parseTargetValue(targetClass)
    const mode = form.getValues('conformity_mode')

    const evaluation = evaluateConformity(mode, values, targetValue, values.length)
    setConformityEvaluation(evaluation)

    // Auto-set severity based on conformity
    if (!evaluation.passed) {
      const deviation = Math.abs((evaluation.minValue - targetValue) / targetValue)
      if (deviation > 0.2) {
        form.setValue('severity', 'critical')
      } else if (deviation > 0.1) {
        form.setValue('severity', 'major')
      } else {
        form.setValue('severity', 'minor')
      }

      // Set immediate action flags
      form.setValue('immediate_action_required', true)
      form.setValue('batch_blocked', true)
      form.setValue('marking_blocked', true)
    }
  }

  const parseTargetValue = (targetClass: string): number => {
    const match = targetClass.match(/\d+(\.\d+)?/)
    return match ? parseFloat(match[0]) : 0
  }

  const onSubmit = async (data: DeviationForm) => {
    try {
      setIsSubmitting(true)

      // Add test results
      data.test_results = testResults

      // Add user info
      const userRes = await fetch('/api/auth/session')
      const user = await userRes.json()
      data.created_by = user.email || user.id

      // Check device calibration
      if (data.device_id && selectedDevice) {
        const calDate = new Date(selectedDevice.next_cal_at)
        if (calDate < new Date()) {
          toast({
            title: 'Kalibrierung überfällig',
            description: 'Das gewählte Gerät hat eine überfällige Kalibrierung!',
            variant: 'destructive'
          })
          return
        }
      }

      const response = await fetch('/api/en13813/deviations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to create deviation')
      }

      const deviation = await response.json()

      toast({
        title: 'Abweichung erstellt',
        description: `Abweichungsnummer: ${deviation.deviation_number}`
      })

      router.push(`/en13813/deviations/${deviation.id}`)
    } catch (error) {
      console.error('Error creating deviation:', error)
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Abweichung konnte nicht erstellt werden',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          Neue Abweichung erfassen
        </h1>
        <p className="text-muted-foreground mt-2">
          EN 13813:2002 § 6.3.2.2 - Erfassung von Abweichungen und Nichtkonformitäten
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Grundinformationen</CardTitle>
              <CardDescription>
                Identifikation und Klassifizierung der Abweichung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Kurze Beschreibung der Abweichung" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Detaillierte Beschreibung der Abweichung..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deviation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typ *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="product">Produkt</SelectItem>
                          <SelectItem value="process">Prozess</SelectItem>
                          <SelectItem value="incoming_material">Eingangsmaterial</SelectItem>
                          <SelectItem value="device">Gerät/Kalibrierung</SelectItem>
                          <SelectItem value="documentation">Dokumentation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schweregrad *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critical">Kritisch</SelectItem>
                          <SelectItem value="major">Major</SelectItem>
                          <SelectItem value="minor">Minor</SelectItem>
                          <SelectItem value="observation">Beobachtung</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quelle *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="internal_audit">Internes Audit</SelectItem>
                          <SelectItem value="external_audit">Externes Audit</SelectItem>
                          <SelectItem value="customer_complaint">Kundenreklamation</SelectItem>
                          <SelectItem value="quality_control">Qualitätskontrolle</SelectItem>
                          <SelectItem value="production">Produktion</SelectItem>
                          <SelectItem value="fpc_test">FPC Prüfung</SelectItem>
                          <SelectItem value="itt_test">ITT Prüfung</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discovered_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entdeckungsdatum *</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discovered_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entdeckt von *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Name oder Abteilung" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detection_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Erkennungsmethode</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. Routineprüfung, Stichprobe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* EN13813 Specific Fields */}
          <Card>
            <CardHeader>
              <CardTitle>EN 13813 Konformität</CardTitle>
              <CardDescription>
                Normspezifische Angaben und Konformitätsbewertung nach § 9.2
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="affected_characteristic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Betroffenes Merkmal *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. C25, F4, A22" />
                      </FormControl>
                      <FormDescription>
                        Merkmal gemäß EN 13813 (z.B. C für Druckfestigkeit)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zielklasse *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. 25, 4" />
                      </FormControl>
                      <FormDescription>
                        Deklarierter Klassenwert
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="test_standard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prüfnorm *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. EN 13892-2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conformity_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konformitätsmodus *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single_value">
                            Einzelwert (§ 9.2.3)
                          </SelectItem>
                          <SelectItem value="statistics">
                            Statistik (§ 9.2.2)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Bewertungsmodus gemäß EN 13813 Kapitel 9
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Test Results */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Prüfergebnisse *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTestResult}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ergebnis hinzufügen
                  </Button>
                </div>

                {testResults.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wert</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Alter (Tage)</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.1"
                              value={result.value}
                              onChange={(e) => updateTestResult(index, 'value', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={result.date}
                              onChange={(e) => updateTestResult(index, 'date', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={result.age_days}
                              onChange={(e) => updateTestResult(index, 'age_days', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTestResult(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {testResults.length === 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Fügen Sie mindestens ein Prüfergebnis hinzu
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Conformity Evaluation */}
              {conformityEvaluation && (
                <Alert variant={conformityEvaluation.passed ? 'default' : 'destructive'}>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">
                        Konformitätsbewertung: {conformityEvaluation.passed ? 'BESTANDEN' : 'NICHT BESTANDEN'}
                      </p>
                      <p className="text-sm">{conformityEvaluation.details}</p>
                      <div className="text-sm mt-2">
                        <span>Mittelwert: {conformityEvaluation.mean.toFixed(2)}</span>
                        <span className="ml-4">Std.Abw.: {conformityEvaluation.stdDev.toFixed(2)}</span>
                        <span className="ml-4">Min: {conformityEvaluation.minValue.toFixed(2)}</span>
                        <span className="ml-4">Max: {conformityEvaluation.maxValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* References */}
          <Card>
            <CardHeader>
              <CardTitle>Referenzen</CardTitle>
              <CardDescription>
                Verknüpfung mit Rezeptur, Charge und Prüfgeräten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recipe_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rezeptur</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Rezeptur wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recipes.map(recipe => (
                            <SelectItem key={recipe.id} value={recipe.id}>
                              {recipe.code} - {recipe.designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="batch_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charge</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Charge wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batches.map(batch => (
                            <SelectItem key={batch.id} value={batch.id}>
                              {batch.batch_number} - {format(new Date(batch.produced_at), 'dd.MM.yyyy')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="device_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prüfgerät</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          const device = devices.find(d => d.id === value)
                          setSelectedDevice(device)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Gerät wählen..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {devices.map(device => {
                            const isOverdue = new Date(device.next_cal_at) < new Date()
                            return (
                              <SelectItem
                                key={device.id}
                                value={device.id}
                                disabled={isOverdue}
                              >
                                <div className="flex items-center gap-2">
                                  {device.name}
                                  {isOverdue && (
                                    <Badge variant="destructive">Kalibrierung überfällig</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      {selectedDevice && new Date(selectedDevice.next_cal_at) < new Date() && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Gerät hat überfällige Kalibrierung! Tests mit diesem Gerät sind nicht zulässig.
                          </AlertDescription>
                        </Alert>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="raw_material_batch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rohstoff-Charge</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. Zement Charge 2024-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Immediate Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Sofortmaßnahmen</CardTitle>
              <CardDescription>
                Unmittelbar zu ergreifende Maßnahmen (PFLICHT bei Nichtkonformität)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="immediate_action_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung der Sofortmaßnahmen</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="z.B. Charge gesperrt, Produktion gestoppt, Kunden informiert..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="batch_blocked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Charge sperren</FormLabel>
                        <FormDescription>
                          Betroffene Charge für Auslieferung sperren
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marking_blocked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>CE-Kennzeichnung sperren</FormLabel>
                        <FormDescription>
                          CE-Kennzeichnung und DoP für betroffene Produkte sperren
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_informed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Kunde informiert</FormLabel>
                        <FormDescription>
                          Betroffene Kunden wurden informiert
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/en13813/deviations')}
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Wird erstellt...' : 'Abweichung erstellen'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}