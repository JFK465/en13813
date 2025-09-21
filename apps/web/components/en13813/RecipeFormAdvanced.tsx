'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
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
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Save, X, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

// Enhanced validation schema
const recipeFormSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(255),
  description: z.string().optional(),
  estrich_type: z.enum(['CT', 'CA', 'MA', 'AS', 'SR'], {
    required_error: 'Estrichtyp ist erforderlich',
  }),
  compressive_strength: z.string().regex(/^C\d{1,3}$/, 'Format: C + Zahl (z.B. C25)'),
  flexural_strength: z.string().regex(/^F\d{1,2}$/, 'Format: F + Zahl (z.B. F4)'),
  
  // Verschleißwiderstand
  wear_resistance_method: z.enum(['bohme', 'bca', 'rolling_wheel']).optional(),
  wear_resistance_class: z.string().optional(),
  
  // Spezielle Eigenschaften
  surface_hardness_class: z.string().optional(),
  bond_strength_class: z.string().optional(),
  impact_resistance_class: z.string().optional(),
  indentation_class: z.string().optional(),
  
  // Verwendungszweck
  intended_use: z.object({
    wearing_surface: z.boolean(),
    with_flooring: z.boolean(),
    heated_screed: z.boolean(),
    indoor_only: z.boolean(),
  }),
  
  heated_screed: z.boolean().optional(),
  fire_class: z.enum(['A1fl', 'A2fl', 'Bfl', 'Cfl', 'Dfl', 'Efl', 'Ffl']).default('A1fl'),
  
  application_thickness_min: z.coerce.number().min(0).optional(),
  application_thickness_max: z.coerce.number().min(0).optional(),
  
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
})

type RecipeFormValues = z.infer<typeof recipeFormSchema>

interface RecipeFormAdvancedProps {
  recipe?: any
  onSuccess?: () => void
  onCancel?: () => void
}

// Wear resistance classes by method
const wearResistanceClasses = {
  bohme: ['A22', 'A15', 'A12', 'A9', 'A6', 'A3', 'A1.5'],
  bca: ['AR6', 'AR4', 'AR2', 'AR1', 'AR0.5'],
  rolling_wheel: ['RWA300', 'RWA200', 'RWA100', 'RWA50', 'RWA20', 'RWA10', 'RWA1']
}

export function RecipeFormAdvanced({ recipe, onSuccess, onCancel }: RecipeFormAdvancedProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!recipe

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: recipe || {
      name: '',
      description: '',
      estrich_type: 'CT',
      compressive_strength: 'C25',
      flexural_strength: 'F4',
      wear_resistance_method: undefined,
      wear_resistance_class: '',
      surface_hardness_class: '',
      bond_strength_class: '',
      impact_resistance_class: '',
      indentation_class: '',
      intended_use: {
        wearing_surface: false,
        with_flooring: false,
        heated_screed: false,
        indoor_only: true,
      },
      heated_screed: false,
      fire_class: 'A1fl',
      application_thickness_min: undefined,
      application_thickness_max: undefined,
      status: 'draft',
    },
  })

  const estrichType = form.watch('estrich_type')
  const compressiveStrength = form.watch('compressive_strength')
  const flexuralStrength = form.watch('flexural_strength')
  const intendedUse = form.watch('intended_use')
  const wearMethod = form.watch('wear_resistance_method')
  const wearClass = form.watch('wear_resistance_class')
  
  // Determine if wear resistance is required
  const isWearResistanceRequired = intendedUse?.wearing_surface && !intendedUse?.with_flooring

  // Generate EN designation
  const generateENDesignation = () => {
    const parts = [estrichType]
    
    // Add strength classes for CT/CA/MA
    if (['CT', 'CA', 'MA'].includes(estrichType)) {
      parts.push(compressiveStrength)
      parts.push(flexuralStrength)
    }
    
    // Add wear resistance if applicable
    if (wearClass) {
      parts.push(wearClass)
    }
    
    // Add special properties based on type
    if (estrichType === 'MA' && form.watch('surface_hardness_class')) {
      parts.push(form.watch('surface_hardness_class'))
    }
    
    if (estrichType === 'SR') {
      if (form.watch('bond_strength_class')) parts.push(form.watch('bond_strength_class'))
      if (form.watch('impact_resistance_class')) parts.push(form.watch('impact_resistance_class'))
    }
    
    if (estrichType === 'AS' && form.watch('indentation_class')) {
      parts.push(form.watch('indentation_class'))
    }
    
    // Add H for heated screed
    if (form.watch('heated_screed')) {
      parts.push('H')
    }
    
    return parts.join('-')
  }

  async function onSubmit(values: RecipeFormValues) {
    setIsSubmitting(true)
    
    try {
      // Add EN designation to values
      const enrichedValues = {
        ...values,
        en_designation: generateENDesignation(),
        recipe_code: generateENDesignation() // Keep for compatibility
      }
      
      const response = await fetch(
        isEditing ? `/api/en13813/recipes/${recipe.id}` : '/api/en13813/recipes',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enrichedValues),
        }
      )

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Rezeptur')
      }

      toast({
        title: 'Erfolg',
        description: `Rezeptur wurde ${isEditing ? 'aktualisiert' : 'erstellt'}`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/en13813/recipes')
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Die Rezeptur konnte nicht gespeichert werden',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Rezeptur bearbeiten' : 'Neue Rezeptur erstellen'}</CardTitle>
            <CardDescription>
              Definieren Sie eine normkonforme Estrichrezeptur nach EN 13813
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>EN 13813 Bezeichnung</AlertTitle>
                <AlertDescription>
                  <strong className="text-lg">{generateENDesignation()}</strong>
                  <br />
                  Diese Bezeichnung wird automatisch aus den eingegebenen Eigenschaften generiert.
                </AlertDescription>
              </Alert>
            </div>

            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                <TabsTrigger value="intended-use">Verwendung</TabsTrigger>
                <TabsTrigger value="properties">Eigenschaften</TabsTrigger>
                <TabsTrigger value="special">Spezial</TabsTrigger>
                <TabsTrigger value="additional">Zusätzlich</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Premium Zementestrich CT-C30-F5" {...field} />
                      </FormControl>
                      <FormDescription>
                        Eindeutiger Name für diese Rezeptur
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
                        <Textarea
                          placeholder="Beschreiben Sie die Rezeptur und deren Anwendungsbereich..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estrich_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estrichtyp *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wählen Sie einen Typ" />
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
                        Estrichtyp nach EN 13813
                      </FormDescription>
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
                      <FormDescription>
                        Nur aktive Rezepturen können für DoPs verwendet werden
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="intended-use" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Verwendungszweck</CardTitle>
                    <CardDescription>
                      Bestimmt die erforderlichen Eigenschaften und Prüfungen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="intended_use.wearing_surface"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Als Nutzschicht (Wearing Surface)
                            </FormLabel>
                            <FormDescription>
                              Estrich wird direkt genutzt ohne Bodenbelag
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.with_flooring"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Mit Bodenbelag versehen
                            </FormLabel>
                            <FormDescription>
                              Estrich erhält einen Bodenbelag (Fliesen, Parkett, etc.)
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.heated_screed"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                // Also update heated_screed field
                                form.setValue('heated_screed', checked as boolean)
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Heizestrich
                            </FormLabel>
                            <FormDescription>
                              Estrich mit integrierter Fußbodenheizung
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intended_use.indoor_only"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Nur Innenbereich
                            </FormLabel>
                            <FormDescription>
                              Estrich wird nur in Innenräumen verwendet
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {isWearResistanceRequired && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Bei Nutzschicht ohne Bodenbelag ist <strong>genau eine</strong> Verschleißwiderstandsmethode anzugeben!
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4">
                {['CT', 'CA', 'MA'].includes(estrichType) && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="compressive_strength"
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
                              {['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80'].map(cls => (
                                <SelectItem key={cls} value={cls}>{cls} N/mm²</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Nach EN 13892-2
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="flexural_strength"
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
                              {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'].map(cls => (
                                <SelectItem key={cls} value={cls}>{cls} N/mm²</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Nach EN 13892-2
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {isWearResistanceRequired && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Verschleißwiderstand {isWearResistanceRequired && '*'}</CardTitle>
                      <CardDescription>
                        Wählen Sie genau eine Prüfmethode und die entsprechende Klasse
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="wear_resistance_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prüfmethode</FormLabel>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-start space-x-2">
                                <RadioGroupItem value="bohme" id="bohme" />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor="bohme">
                                    Böhme-Verfahren (EN 13892-3)
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    A-Klassen: Abrieb in cm³/50cm²
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <RadioGroupItem value="bca" id="bca" />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor="bca">
                                    BCA-Verfahren (EN 13892-4)
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    AR-Klassen: Verschleißtiefe in µm
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <RadioGroupItem value="rolling_wheel" id="rolling_wheel" />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor="rolling_wheel">
                                    Rollrad-Verfahren (EN 13892-5)
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    RWA-Klassen: Verschleißtiefe in µm
                                  </p>
                                </div>
                              </div>
                            </RadioGroup>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {wearMethod && (
                        <FormField
                          control={form.control}
                          name="wear_resistance_class"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verschleißklasse</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Wählen Sie eine Klasse" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {wearResistanceClasses[wearMethod]?.map(cls => (
                                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                {wearMethod === 'bohme' && 'Niedrigere Werte = bessere Verschleißfestigkeit'}
                                {wearMethod === 'bca' && 'Niedrigere Werte = bessere Verschleißfestigkeit'}
                                {wearMethod === 'rolling_wheel' && 'Niedrigere Werte = bessere Verschleißfestigkeit'}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                )}

                <FormField
                  control={form.control}
                  name="fire_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brandklasse</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A1fl">A1fl - Nicht brennbar</SelectItem>
                          <SelectItem value="A2fl">A2fl - Nicht brennbar</SelectItem>
                          <SelectItem value="Bfl">Bfl - Schwer entflammbar</SelectItem>
                          <SelectItem value="Cfl">Cfl - Normal entflammbar</SelectItem>
                          <SelectItem value="Dfl">Dfl - Normal entflammbar</SelectItem>
                          <SelectItem value="Efl">Efl - Normal entflammbar</SelectItem>
                          <SelectItem value="Ffl">Ffl - Leicht entflammbar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Nach EN 13501-1
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="special" className="space-y-4">
                {estrichType === 'MA' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Magnesiaestrich Eigenschaften</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="surface_hardness_class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Oberflächenhärte</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Keine Angabe</SelectItem>
                                {['SH30', 'SH40', 'SH50', 'SH70', 'SH100', 'SH150', 'SH200'].map(cls => (
                                  <SelectItem key={cls} value={cls}>{cls} N/mm²</SelectItem>
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
                    </CardContent>
                  </Card>
                )}

                {estrichType === 'SR' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Kunstharzestrich Eigenschaften</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bond_strength_class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verbundfestigkeit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Keine Angabe</SelectItem>
                                {['B0.5', 'B1.0', 'B1.5', 'B2.0'].map(cls => (
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
                            <FormLabel>Schlagfestigkeit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Keine Angabe</SelectItem>
                                {['IR1', 'IR2', 'IR4', 'IR10', 'IR20'].map(cls => (
                                  <SelectItem key={cls} value={cls}>{cls} Nm</SelectItem>
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
                    </CardContent>
                  </Card>
                )}

                {estrichType === 'AS' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Gussasphalt Eigenschaften</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="indentation_class"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eindrückklasse</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Keine Angabe</SelectItem>
                                <SelectItem value="IC10">IC10 - Industrie schwer</SelectItem>
                                <SelectItem value="IC15">IC15 - Industrie mittel</SelectItem>
                                <SelectItem value="IC40">IC40 - Industrie leicht</SelectItem>
                                <SelectItem value="IC100">IC100 - Wohnen</SelectItem>
                                <SelectItem value="IP10">IP10 - Punktlast schwer</SelectItem>
                                <SelectItem value="IP15">IP15 - Punktlast mittel</SelectItem>
                                <SelectItem value="IP40">IP40 - Punktlast leicht</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Nach EN 12697-20
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="heated_screed"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Heizestrich (H-Kennzeichnung)
                              </FormLabel>
                              <FormDescription>
                                Gussasphalt als Heizestrich ausgelegt
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="additional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="application_thickness_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min. Schichtdicke (mm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimale Einbaudicke
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="application_thickness_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max. Schichtdicke (mm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximale Einbaudicke
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel ? onCancel() : router.push('/en13813/recipes')}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Speichern...' : isEditing ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </div>
      </form>
    </Form>
  )
}