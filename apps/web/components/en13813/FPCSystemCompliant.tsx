'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Save,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  ClipboardCheck,
  User
} from 'lucide-react'

// FPC Control Plan Schema (EN13813 Section 6.3)
const fpcControlPlanSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'suspended', 'archived']),
  control_type: z.enum(['incoming_material', 'process', 'final_product'], {
    required_error: 'Kontrolltyp ist erforderlich'
  }),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'batch', 'continuous'], {
    required_error: 'Prüffrequenz ist erforderlich'
  }),
  test_parameter: z.string().min(1, 'Prüfparameter ist erforderlich'),
  test_method: z.string().optional(),
  test_standard: z.string().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  target_value: z.number().optional(),
  tolerance: z.number().optional(),
  unit: z.string().optional(),
  responsible_role: z.string().optional(),
  responsible_person: z.string().optional(),
  action_on_nonconformity: z.string().optional(),
  corrective_action_procedure: z.string().optional(),
  escalation_procedure: z.string().optional()
})

type FPCControlPlanData = z.infer<typeof fpcControlPlanSchema>

// Test parameters based on EN13813 requirements
const TEST_PARAMETERS = {
  incoming_material: [
    { value: 'cement_quality', label: 'Zementqualität', unit: '-' },
    { value: 'aggregate_grading', label: 'Zuschlagstoff-Sieblinie', unit: 'mm' },
    { value: 'water_quality', label: 'Wasserqualität', unit: '-' },
    { value: 'additive_content', label: 'Zusatzmittelgehalt', unit: '%' },
    { value: 'moisture_content', label: 'Feuchtigkeitsgehalt', unit: '%' }
  ],
  process: [
    { value: 'mixing_time', label: 'Mischzeit', unit: 's' },
    { value: 'consistency', label: 'Konsistenz', unit: 'mm' },
    { value: 'temperature', label: 'Temperatur', unit: '°C' },
    { value: 'application_thickness', label: 'Einbaudicke', unit: 'mm' },
    { value: 'compaction', label: 'Verdichtung', unit: '%' }
  ],
  final_product: [
    { value: 'compressive_strength', label: 'Druckfestigkeit', unit: 'N/mm²' },
    { value: 'flexural_strength', label: 'Biegezugfestigkeit', unit: 'N/mm²' },
    { value: 'surface_hardness', label: 'Oberflächenhärte', unit: 'N/mm²' },
    { value: 'thickness', label: 'Dicke', unit: 'mm' },
    { value: 'flatness', label: 'Ebenheit', unit: 'mm/2m' }
  ]
}

interface FPCSystemProps {
  initialData?: Partial<FPCControlPlanData> & { id?: string }
  onSubmit?: (data: FPCControlPlanData) => Promise<void>
}

export function FPCSystemCompliant({ initialData, onSubmit }: FPCSystemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<FPCControlPlanData>({
    resolver: zodResolver(fpcControlPlanSchema),
    defaultValues: initialData || {
      status: 'active',
      control_type: 'process',
      frequency: 'daily'
    }
  })

  const controlType = form.watch('control_type')

  const handleSubmit = async (data: FPCControlPlanData) => {
    setIsLoading(true)

    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        const { error } = await supabase
          .from('en13813_fpc_control_plans')
          .insert(data)

        if (error) throw error

        toast({
          title: 'Erfolg',
          description: 'FPC-Kontrollplan wurde erfolgreich gespeichert'
        })

        router.push('/en13813/fpc')
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Fehler beim Speichern des Kontrollplans',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load test results if editing existing plan
  useEffect(() => {
    const loadTestResults = async () => {
      if (!initialData?.id) return

      const { data, error } = await supabase
        .from('en13813_fpc_test_results')
        .select('*')
        .eq('control_plan_id', initialData.id)
        .order('test_date', { ascending: false })
        .limit(10)

      if (!error && data) {
        setTestResults(data)
      }
    }
    loadTestResults()
  }, [initialData?.id, supabase])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Werkseigene Produktionskontrolle (FPC)
          </CardTitle>
          <CardDescription>
            Gemäß EN 13813:2002 Abschnitt 6.3 - Factory Production Control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Die werkseigene Produktionskontrolle ist zwingend erforderlich für die CE-Kennzeichnung
              nach System 2+ gemäß Bauprodukteverordnung (CPR).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs defaultValue="plan" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="plan">Kontrollplan</TabsTrigger>
              <TabsTrigger value="criteria">Grenzwerte</TabsTrigger>
              <TabsTrigger value="responsibility">Verantwortlichkeiten</TabsTrigger>
              <TabsTrigger value="results">Ergebnisse</TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kontrollplan Definition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bezeichnung *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="z.B. FPC Druckfestigkeit 28d" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="control_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kontrolltyp *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="incoming_material">Eingangskontrolle</SelectItem>
                              <SelectItem value="process">Prozesskontrolle</SelectItem>
                              <SelectItem value="final_product">Endproduktkontrolle</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            EN 13813 Abschnitt 6.3.2
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prüffrequenz *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="continuous">Kontinuierlich</SelectItem>
                              <SelectItem value="batch">Chargenweise</SelectItem>
                              <SelectItem value="daily">Täglich</SelectItem>
                              <SelectItem value="weekly">Wöchentlich</SelectItem>
                              <SelectItem value="monthly">Monatlich</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="test_parameter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prüfparameter *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wählen Sie einen Parameter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEST_PARAMETERS[controlType]?.map(param => (
                              <SelectItem key={param.value} value={param.value}>
                                {param.label} ({param.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="test_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prüfmethode</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="z.B. EN 13892-2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="test_standard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prüfnorm</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="z.B. EN 13813" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="criteria" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Annahmekriterien & Grenzwerte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="min_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimalwert</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="max_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximalwert</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Die Grenzwerte müssen den Anforderungen der deklarierten
                      Leistungsklassen entsprechen (z.B. C30 = min. 30 N/mm² Druckfestigkeit)
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="responsibility" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verantwortlichkeiten & Maßnahmen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="action_on_nonconformity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maßnahmen bei Abweichung</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Beschreiben Sie die Sofortmaßnahmen bei Grenzwertüberschreitung"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="corrective_action_procedure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Korrekturmaßnahmen-Verfahren</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Beschreiben Sie das Verfahren für Korrekturmaßnahmen"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prüfergebnisse</CardTitle>
                  <CardDescription>
                    Letzte 10 Prüfergebnisse für diesen Kontrollplan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Messwert</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Abweichung</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testResults.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Noch keine Prüfergebnisse vorhanden
                          </TableCell>
                        </TableRow>
                      ) : (
                        testResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>{new Date(result.test_date).toLocaleDateString('de-DE')}</TableCell>
                            <TableCell className="font-mono">{result.measured_value}</TableCell>
                            <TableCell>
                              {result.pass ? (
                                <Badge variant="default">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Bestanden
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Abweichung
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {result.deviation_percentage && (
                                <span className={result.deviation_percentage > 0 ? 'text-red-600' : ''}>
                                  {result.deviation_percentage.toFixed(1)}%
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  <div className="mt-4">
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Neues Prüfergebnis erfassen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/en13813/fpc')}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Speichere...' : 'Kontrollplan speichern'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}