'use client'

import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Save,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FlaskConical,
  Building,
  Calendar,
  Upload,
  Award
} from 'lucide-react'

// ITT Test Schema (Initial Type Testing gemäß EN13813)
const ittTestSchema = z.object({
  // === GRUNDDATEN ===
  recipe_id: z.string().min(1, 'Rezeptur muss ausgewählt werden'),
  test_number: z.string().min(1, 'Prüfnummer ist erforderlich'),
  test_date: z.string().min(1, 'Prüfdatum ist erforderlich'),

  // === LABOR ===
  laboratory_name: z.string().min(1, 'Laborname ist erforderlich'),
  laboratory_accreditation: z.string().optional(),
  notified_body_number: z.string().optional(),

  // === MECHANISCHE EIGENSCHAFTEN (EN13813 Tabelle 1) ===
  compressive_strength_result: z.number().optional(),
  compressive_strength_class_achieved: z.string().optional(),

  flexural_strength_result: z.number().optional(),
  flexural_strength_class_achieved: z.string().optional(),

  // === VERSCHLEIßWIDERSTAND (für Nutzschichten) ===
  wear_resistance_bohme: z.number().optional(),
  wear_resistance_bca: z.number().optional(),
  wear_resistance_rollrad: z.number().optional(),
  wear_resistance_class_achieved: z.string().optional(),

  // === OBERFLÄCHENEIGENSCHAFTEN ===
  surface_hardness_result: z.number().optional(),
  surface_hardness_class_achieved: z.string().optional(),

  // === HAFTFESTIGKEIT (für SR) ===
  bond_strength_result: z.number().optional(),
  bond_strength_class_achieved: z.string().optional(),

  // === BRANDVERHALTEN ===
  fire_test_result: z.string().optional(),
  fire_test_method: z.string().optional(),

  // === ZUSÄTZLICHE EIGENSCHAFTEN ===
  chemical_resistance_result: z.string().optional(),
  thermal_resistance_result: z.number().optional(),
  water_permeability: z.string().optional(),
  electrical_resistance: z.number().optional(),

  // === KONFORMITÄT ===
  compliant: z.boolean(),
  deviations: z.string().optional(),

  // === DOKUMENTATION ===
  test_report_number: z.string().optional(),
  test_report_url: z.string().optional(),
  certificate_number: z.string().optional(),

  // === FREIGABE ===
  approved_by: z.string().optional(),
  approved_date: z.string().optional()
})

type ITTTestData = z.infer<typeof ittTestSchema>

// Strength class validation helpers
const STRENGTH_CLASSES = {
  compressive: {
    C5: 5, C7: 7, C12: 12, C16: 16, C20: 20, C25: 25, C30: 30,
    C35: 35, C40: 40, C50: 50, C60: 60, C70: 70, C80: 80
  },
  flexural: {
    F1: 1, F2: 2, F3: 3, F4: 4, F5: 5, F6: 6, F7: 7,
    F10: 10, F15: 15, F20: 20, F30: 30, F40: 40, F50: 50
  }
}

interface ITTTestModuleProps {
  initialData?: Partial<ITTTestData>
  recipeId?: string
  onSubmit?: (data: ITTTestData) => Promise<void>
}

export function ITTTestModule({ initialData, recipeId, onSubmit }: ITTTestModuleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [recipe, setRecipe] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<ITTTestData>({
    resolver: zodResolver(ittTestSchema),
    defaultValues: initialData || {
      recipe_id: recipeId || '',
      test_date: new Date().toISOString().split('T')[0],
      compliant: false
    }
  })

  // Load recipe data
  const loadRecipe = async (recipeId: string) => {
    const { data, error } = await supabase
      .from('en13813_recipes')
      .select('*')
      .eq('id', recipeId)
      .single()

    if (!error && data) {
      setRecipe(data)
    }
  }

  // Check if test results meet declared classes
  const checkConformity = () => {
    if (!recipe) return false

    const compressiveResult = form.watch('compressive_strength_result')
    const flexuralResult = form.watch('flexural_strength_result')

    // Check compressive strength
    if (compressiveResult && recipe.compressive_strength_class) {
      const classKey = recipe.compressive_strength_class as keyof typeof STRENGTH_CLASSES.compressive
      const requiredStrength = STRENGTH_CLASSES.compressive[classKey]
      if (requiredStrength && compressiveResult < requiredStrength) return false
    }

    // Check flexural strength
    if (flexuralResult && recipe.flexural_strength_class) {
      const classKey = recipe.flexural_strength_class as keyof typeof STRENGTH_CLASSES.flexural
      const requiredStrength = STRENGTH_CLASSES.flexural[classKey]
      if (requiredStrength && flexuralResult < requiredStrength) return false
    }

    return true
  }

  const handleSubmit = async (data: ITTTestData) => {
    setIsLoading(true)

    try {
      // Check conformity
      const isCompliant = checkConformity()
      data.compliant = isCompliant

      if (onSubmit) {
        await onSubmit(data)
      } else {
        const { error } = await supabase
          .from('en13813_itt_tests')
          .insert(data)

        if (error) throw error

        // Update recipe status if compliant
        if (isCompliant && recipe) {
          await supabase
            .from('en13813_recipes')
            .update({ status: 'approved' })
            .eq('id', recipe.id)
        }

        toast({
          title: 'Erfolg',
          description: `ITT-Test wurde erfolgreich gespeichert. ${isCompliant ? 'Rezeptur ist konform!' : 'Abweichungen festgestellt.'}`
        })

        router.push('/en13813/itt')
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Fehler beim Speichern des ITT-Tests',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Initial Type Testing (ITT)
          </CardTitle>
          <CardDescription>
            Erstprüfung gemäß EN 13813:2002 Abschnitt 6.2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Wichtig</AlertTitle>
            <AlertDescription>
              Die Erstprüfung (ITT) ist zwingend erforderlich vor der ersten CE-Kennzeichnung
              und muss durch ein akkreditiertes Labor erfolgen.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Grunddaten</TabsTrigger>
              <TabsTrigger value="mechanical">Mechanisch</TabsTrigger>
              <TabsTrigger value="surface">Oberfläche</TabsTrigger>
              <TabsTrigger value="special">Spezial</TabsTrigger>
              <TabsTrigger value="conformity">Konformität</TabsTrigger>
            </TabsList>

            {/* === GRUNDDATEN TAB === */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prüfung Grunddaten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="test_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prüfnummer *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="z.B. ITT-2024-001" />
                        </FormControl>
                        <FormDescription>
                          Eindeutige Prüfnummer des Labors
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="test_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prüfdatum *</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Labor Information</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="laboratory_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Laborname *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Name des akkreditierten Labors" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="laboratory_accreditation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Akkreditierung</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="z.B. DAkkS D-PL-12345" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notified_body_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benannte Stelle Nr.</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="z.B. 0123" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === MECHANISCHE EIGENSCHAFTEN TAB === */}
            <TabsContent value="mechanical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mechanische Eigenschaften</CardTitle>
                  <CardDescription>
                    Prüfung gemäß EN 13892-2
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recipe && (
                    <Alert>
                      <AlertDescription>
                        <strong>Anforderungen der Rezeptur:</strong><br />
                        Druckfestigkeit: {recipe.compressive_strength_class} ({STRENGTH_CLASSES.compressive[recipe.compressive_strength_class as keyof typeof STRENGTH_CLASSES.compressive]} N/mm²)<br />
                        Biegezugfestigkeit: {recipe.flexural_strength_class} ({STRENGTH_CLASSES.flexural[recipe.flexural_strength_class as keyof typeof STRENGTH_CLASSES.flexural]} N/mm²)
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="compressive_strength_result"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Druckfestigkeit (N/mm²)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.1"
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Mittelwert aus Prüfkörpern
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="compressive_strength_class_achieved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Erreichte Klasse</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.keys(STRENGTH_CLASSES.compressive).map(cls => (
                                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="flexural_strength_result"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biegezugfestigkeit (N/mm²)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.1"
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Mittelwert aus Prüfkörpern
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="flexural_strength_class_achieved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Erreichte Klasse</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.keys(STRENGTH_CLASSES.flexural).map(cls => (
                                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                              ))}
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

            {/* === OBERFLÄCHE TAB === */}
            <TabsContent value="surface" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Oberflächeneigenschaften</CardTitle>
                  <CardDescription>
                    Verschleißwiderstand und Härte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Verschleißwiderstand (für Nutzschichten)</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="wear_resistance_bohme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Böhme (cm³/50cm²)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.1"
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
                      name="wear_resistance_bca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BCA (µm)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="1"
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
                      name="wear_resistance_rollrad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rollrad (cm³)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="1"
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="surface_hardness_result"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Oberflächenhärte (N/mm²)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="1"
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
                      name="bond_strength_result"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Haftfestigkeit (N/mm²)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.1"
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Nur für Kunstharzestrich (SR)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === SPEZIAL TAB === */}
            <TabsContent value="special" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Spezielle Eigenschaften</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fire_test_result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brandverhalten</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Klasse wählen..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A1fl">A1fl</SelectItem>
                            <SelectItem value="A2fl">A2fl</SelectItem>
                            <SelectItem value="Bfl">Bfl</SelectItem>
                            <SelectItem value="Cfl">Cfl</SelectItem>
                            <SelectItem value="Dfl">Dfl</SelectItem>
                            <SelectItem value="Efl">Efl</SelectItem>
                            <SelectItem value="Ffl">Ffl</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Klassifizierung nach EN 13501-1
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chemical_resistance_result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chemische Beständigkeit</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            placeholder="Ergebnisse der chemischen Beständigkeitsprüfung"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="thermal_resistance_result"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wärmedurchlasswiderstand (m²K/W)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.001"
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
                      name="electrical_resistance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Elektrischer Widerstand (Ω)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              value={field.value || ''}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* === KONFORMITÄT TAB === */}
            <TabsContent value="conformity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Konformitätsbewertung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      <h3 className="font-medium">Prüfergebnis</h3>
                    </div>

                    {checkConformity() ? (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Die Prüfergebnisse erfüllen die Anforderungen der deklarierten Klassen.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Die Prüfergebnisse erfüllen NICHT die Anforderungen der deklarierten Klassen.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="compliant"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Konformität bestätigt
                          </FormLabel>
                          <FormDescription>
                            Die Rezeptur erfüllt alle Anforderungen der EN 13813
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deviations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Abweichungen / Bemerkungen</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder="Dokumentieren Sie etwaige Abweichungen oder Besonderheiten"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Dokumentation</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="test_report_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prüfbericht-Nr.</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="certificate_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zertifikat-Nr.</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="test_report_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prüfbericht Upload</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input {...field} placeholder="Datei-URL oder Pfad" readOnly />
                            <Button type="button" variant="outline" size="icon">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          PDF-Dokument des Prüfberichts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="approved_by"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Freigegeben von</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="approved_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Freigabedatum</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/en13813/itt')}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Speichere...' : 'ITT-Test speichern'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}