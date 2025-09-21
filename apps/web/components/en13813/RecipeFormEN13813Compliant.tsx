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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Building,
  Shield,
  FlaskConical,
  Gauge,
  FileText,
  AlertCircle,
  Check,
  Lock
} from 'lucide-react'

// EN13813 Compliant Recipe Schema
const recipeSchema = z.object({
  // === GRUNDDATEN (Required by EN13813) ===
  recipe_code: z.string().min(1, 'Rezeptur-Code ist erforderlich'),
  name: z.string().min(1, 'Bezeichnung ist erforderlich'),
  product_name: z.string().min(1, 'Produktname ist erforderlich'),
  description: z.string().optional(),

  // === HERSTELLER (Required by EN13813 Annex ZA) ===
  manufacturer_name: z.string().min(1, 'Herstellername ist erforderlich'),
  manufacturer_address: z.string().min(1, 'Herstelleradresse ist erforderlich'),
  manufacturer_contact: z.string().optional(),

  // === BENANNTE STELLE (Required for System 2+) ===
  notified_body_name: z.string().optional(),
  notified_body_number: z.string().optional(),
  notified_body_certificate: z.string().optional(),

  // === BINDEMITTEL TYP (Required) ===
  binder_type: z.enum(['CT', 'CA', 'MA', 'SR', 'AS'], {
    required_error: 'Bindemittel-Typ ist erforderlich'
  }),

  // === FESTIGKEITSKLASSEN (Required) ===
  compressive_strength_class: z.string().min(1, 'Druckfestigkeitsklasse ist erforderlich'),
  flexural_strength_class: z.string().min(1, 'Biegezugfestigkeitsklasse ist erforderlich'),

  // === VERSCHLEIßWIDERSTAND (Required for wearing surfaces) ===
  wear_resistance_bohme_class: z.string().optional(),
  wear_resistance_bca_class: z.string().optional(),
  wear_resistance_rollrad_class: z.string().optional(),

  // === OBERFLÄCHENEIGENSCHAFTEN ===
  surface_hardness_class: z.string().optional(),
  rwfc_class: z.string().optional(), // Rolling Wheel with Floor Covering

  // === BRANDVERHALTEN (Required) ===
  fire_class: z.string().min(1, 'Brandklasse ist erforderlich'),

  // === MATERIALZUSAMMENSETZUNG ===
  cement_type: z.string().optional(),
  cement_content: z.number().optional(),
  aggregate_type: z.string().optional(),
  max_aggregate_size: z.number().optional(),
  water_cement_ratio: z.number().optional(),

  // === PRÜFALTER ===
  test_age_days: z.number().default(28),
  early_strength: z.boolean().default(false),

  // === pH-WERT (Required for CA) ===
  ph_value: z.number().optional(),

  // === STATUS ===
  status: z.enum(['draft', 'in_review', 'approved', 'active', 'locked']).default('draft')
})

type RecipeFormData = z.infer<typeof recipeSchema>

// Strength class options based on EN13813
const COMPRESSIVE_STRENGTH_CLASSES = ['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80']
const FLEXURAL_STRENGTH_CLASSES = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50']
const WEAR_RESISTANCE_BOHME = ['A22', 'A15', 'A12', 'A9', 'A6', 'A3', 'A1.5']
const WEAR_RESISTANCE_BCA = ['AR6', 'AR4', 'AR2', 'AR1', 'AR0.5']
const WEAR_RESISTANCE_ROLLRAD = ['RWA300', 'RWA100', 'RWA20', 'RWA10', 'RWA1']
const SURFACE_HARDNESS_CLASSES = ['SH30', 'SH40', 'SH50', 'SH70', 'SH100', 'SH150', 'SH200']
const RWFC_CLASSES = ['RWFC150', 'RWFC250', 'RWFC350', 'RWFC450', 'RWFC550']
const FIRE_CLASSES = ['A1fl', 'A2fl', 'Bfl', 'Cfl', 'Dfl', 'Efl', 'Ffl']

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>
  onSubmit?: (data: RecipeFormData) => Promise<void>
}

export function RecipeFormEN13813Compliant({ initialData, onSubmit }: RecipeFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData || {
      binder_type: 'CT',
      test_age_days: 28,
      early_strength: false,
      status: 'draft'
    }
  })

  const binderType = form.watch('binder_type')

  const handleSubmit = async (data: RecipeFormData) => {
    setIsLoading(true)

    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Default save to database
        const { error } = await supabase
          .from('en13813_recipes')
          .insert(data)

        if (error) throw error

        toast({
          title: 'Erfolg',
          description: 'Rezeptur wurde erfolgreich gespeichert'
        })

        router.push('/en13813/recipes')
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Fehler beim Speichern der Rezeptur',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Grunddaten</TabsTrigger>
            <TabsTrigger value="manufacturer">Hersteller</TabsTrigger>
            <TabsTrigger value="properties">Eigenschaften</TabsTrigger>
            <TabsTrigger value="composition">Zusammensetzung</TabsTrigger>
            <TabsTrigger value="compliance">Konformität</TabsTrigger>
          </TabsList>

          {/* === GRUNDDATEN TAB === */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grunddaten der Rezeptur</CardTitle>
                <CardDescription>
                  Pflichtangaben gemäß EN 13813:2002
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recipe_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rezeptur-Code *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="z.B. RZ-2024-001" />
                        </FormControl>
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
                            <SelectItem value="in_review">In Prüfung</SelectItem>
                            <SelectItem value="approved">Freigegeben</SelectItem>
                            <SelectItem value="active">Aktiv</SelectItem>
                            <SelectItem value="locked">Gesperrt</SelectItem>
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
                      <FormLabel>Rezepturbezeichnung *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. Zementestrich CT-C30-F5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produktname *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Handelsname des Produkts" />
                      </FormControl>
                      <FormDescription>
                        Produktname für CE-Kennzeichnung und Leistungserklärung
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="binder_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bindemittel-Typ *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CT">CT - Zementestrich</SelectItem>
                          <SelectItem value="CA">CA - Calciumsulfatestrich</SelectItem>
                          <SelectItem value="MA">MA - Magnesitestrich</SelectItem>
                          <SelectItem value="SR">SR - Kunstharzestrich</SelectItem>
                          <SelectItem value="AS">AS - Gussasphaltestrich</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Bindemittel-Typ gemäß EN 13813 Abschnitt 3.2
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beschreibung</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* === HERSTELLER TAB === */}
          <TabsContent value="manufacturer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Herstellerangaben</CardTitle>
                <CardDescription>
                  Pflichtangaben für CE-Kennzeichnung gemäß EN 13813 Annex ZA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="manufacturer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Herstellername *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Firmenname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturer_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Herstelleradresse *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Vollständige Adresse" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturer_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontaktdaten</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Telefon, E-Mail" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">Benannte Stelle (System 2+)</h3>
                  <p className="text-sm text-muted-foreground">
                    Erforderlich für Konformitätsbewertung nach System 2+
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="notified_body_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name der benannten Stelle</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="notified_body_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kennnummer</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="z.B. 0123" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notified_body_certificate"
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* === EIGENSCHAFTEN TAB === */}
          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mechanische Eigenschaften</CardTitle>
                <CardDescription>
                  Festigkeitsklassen gemäß EN 13813 Tabellen 2-11
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="compressive_strength_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Druckfestigkeitsklasse *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COMPRESSIVE_STRENGTH_CLASSES.map(cls => (
                              <SelectItem key={cls} value={cls}>
                                {cls} ({cls.replace('C', '')} N/mm²)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Klasse C gemäß Tabelle 2
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
                        <FormLabel>Biegezugfestigkeitsklasse *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FLEXURAL_STRENGTH_CLASSES.map(cls => (
                              <SelectItem key={cls} value={cls}>
                                {cls} ({cls.replace('F', '')} N/mm²)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Klasse F gemäß Tabelle 3
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">Verschleißwiderstand (für Nutzschichten)</h3>
                  <p className="text-sm text-muted-foreground">
                    Mindestens eine Methode erforderlich für Nutzschichten
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="wear_resistance_bohme_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Böhme (A)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WEAR_RESISTANCE_BOHME.map(cls => (
                              <SelectItem key={cls} value={cls}>
                                {cls} cm³/50cm²
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
                    name="wear_resistance_bca_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BCA (AR)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WEAR_RESISTANCE_BCA.map(cls => (
                              <SelectItem key={cls} value={cls}>
                                {cls} µm
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
                    name="wear_resistance_rollrad_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rollrad (RWA)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {WEAR_RESISTANCE_ROLLRAD.map(cls => (
                              <SelectItem key={cls} value={cls}>
                                {cls} cm³
                              </SelectItem>
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
                    name="surface_hardness_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Oberflächenhärte (SH)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SURFACE_HARDNESS_CLASSES.map(cls => (
                              <SelectItem key={cls} value={cls}>
                                {cls} N/mm²
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
                    name="rwfc_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rollwiderstand mit Bodenbelag</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RWFC_CLASSES.map(cls => (
                              <SelectItem key={cls} value={cls}>
                                {cls} N
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="fire_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brandverhalten *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FIRE_CLASSES.map(cls => (
                            <SelectItem key={cls} value={cls}>
                              {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Brandklasse gemäß EN 13501-1
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="test_age_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prüfalter (Tage)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormDescription>
                          Standard: 28 Tage
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {binderType === 'CA' && (
                    <FormField
                      control={form.control}
                      name="ph_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>pH-Wert</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.1" onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormDescription>
                            Muss ≥ 7 für CA-Estriche
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === ZUSAMMENSETZUNG TAB === */}
          <TabsContent value="composition" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Materialzusammensetzung</CardTitle>
                <CardDescription>
                  Angaben zur Rezeptur-Zusammensetzung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="cement_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zementart</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. CEM I 42,5 R" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cement_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zementgehalt (kg/m³)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="water_cement_ratio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>w/z-Wert</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="aggregate_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zuschlagstoff</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. Quarzsand 0/4" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_aggregate_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Größtkorn (mm)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* === KONFORMITÄT TAB === */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Konformitätsbewertung</CardTitle>
                <CardDescription>
                  Status der Normkonformität gemäß EN 13813
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <h3 className="font-medium">CE-Kennzeichnung</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      {form.watch('manufacturer_name') && form.watch('manufacturer_address') ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      )}
                      <span>Herstellerangaben vollständig</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {form.watch('compressive_strength_class') && form.watch('flexural_strength_class') ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      )}
                      <span>Festigkeitsklassen definiert</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {form.watch('fire_class') ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      )}
                      <span>Brandverhalten klassifiziert</span>
                    </div>
                    {binderType === 'CA' && (
                      <div className="flex items-center gap-2">
                        {form.watch('ph_value') && form.watch('ph_value') >= 7 ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                        <span>pH-Wert ≥ 7 (CA-Estrich)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h3 className="font-medium">Normbezeichnung</h3>
                  </div>
                  <div className="bg-muted px-3 py-2 rounded-md font-mono text-sm">
                    EN 13813 {binderType}-{form.watch('compressive_strength_class')}-{form.watch('flexural_strength_class')}
                    {form.watch('wear_resistance_bohme_class') && `-${form.watch('wear_resistance_bohme_class')}`}
                    {form.watch('surface_hardness_class') && `-${form.watch('surface_hardness_class')}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Diese Rezeptur muss durch ITT (Initial Type Testing) validiert werden
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/en13813/recipes')}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Speichere...' : 'Rezeptur speichern'}
          </Button>
        </div>
      </form>
    </Form>
  )
}