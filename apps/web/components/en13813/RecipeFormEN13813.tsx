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
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Save, X, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

// EN 13813 vollständiges Schema
const recipeFormSchema = z.object({
  // Grunddaten
  name: z.string().min(1, 'Name ist erforderlich').max(255),
  description: z.string().optional(),
  estrich_type: z.enum(['CT', 'CA', 'MA', 'AS', 'SR'], {
    required_error: 'Estrichtyp ist erforderlich',
  }),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  
  // Mechanische Eigenschaften - Pflicht
  compressive_strength: z.string().regex(/^C\d{1,2}$/, 'Format: C + Zahl (z.B. C25)'),
  flexural_strength: z.string().regex(/^F\d{1,2}$/, 'Format: F + Zahl (z.B. F4)'),
  
  // Verschleißwiderstand (verschiedene Methoden)
  wear_resistance_bohme: z.string().regex(/^A\d{1,2}(\.\d)?$/, 'Format: A + Zahl (z.B. A12)').optional().or(z.literal('')),
  wear_resistance_bca: z.string().regex(/^AR\d{1,2}(\.\d)?$/, 'Format: AR + Zahl (z.B. AR1)').optional().or(z.literal('')),
  wear_resistance_rwa: z.string().regex(/^RWA\d{1,3}$/, 'Format: RWA + Zahl (z.B. RWA10)').optional().or(z.literal('')),
  
  // Oberflächenhärte
  surface_hardness: z.string().regex(/^SH\d{2,3}$/, 'Format: SH + Zahl (z.B. SH50)').optional().or(z.literal('')),
  
  // Härteeigenschaften für Gussasphalt
  indentation_class_ic: z.string().regex(/^IC(H)?\d{1,3}$/, 'Format: IC + Zahl (z.B. IC10)').optional().or(z.literal('')),
  indentation_class_ip: z.string().regex(/^IP\s?(I{1,3}V?|\d{1,2})$/, 'Format: IP + Klasse (z.B. IP10 oder IP III)').optional().or(z.literal('')),
  
  // Weitere mechanische Eigenschaften
  bond_strength: z.string().regex(/^B\d(\.\d)?$/, 'Format: B + Zahl (z.B. B1.5)').optional().or(z.literal('')),
  impact_resistance: z.string().regex(/^IR\d{1,2}$/, 'Format: IR + Zahl (z.B. IR4)').optional().or(z.literal('')),
  modulus_of_elasticity: z.string().regex(/^E\d{1,2}$/, 'Format: E + Zahl (z.B. E10)').optional().or(z.literal('')),
  rwfc_resistance: z.string().regex(/^RWFC\d{3}$/, 'Format: RWFC + Zahl (z.B. RWFC350)').optional().or(z.literal('')),
  
  // Brandverhalten
  fire_class: z.enum(['A1fl', 'A2fl', 'Bfl', 'Cfl', 'Dfl', 'Efl', 'Ffl']).default('A1fl'),
  
  // Spezielle Eigenschaften
  electrical_resistance: z.string().optional(),
  chemical_resistance: z.string().optional(),
  water_vapour_permeability: z.number().optional(),
  water_permeability: z.number().optional(),
  thermal_resistance: z.number().optional(),
  sound_insulation: z.number().optional(),
  sound_absorption: z.number().optional(),
  
  // Dimensionale Eigenschaften
  shrinkage: z.number().optional(),
  swelling: z.number().optional(),
  consistency: z.number().optional(),
  ph_value: z.number().min(0).max(14).optional(),
  setting_time_initial: z.number().optional(),
  setting_time_final: z.number().optional(),
  
  // Anwendungseigenschaften
  application_thickness_min: z.coerce.number().min(0).optional(),
  application_thickness_max: z.coerce.number().min(0).optional(),
  max_aggregate_size: z.number().optional(),
  
  // CE-Kennzeichnung
  release_of_corrosive_substances: z.boolean().default(false),
  dangerous_substances_declaration: z.string().optional(),
  
  // Zusätzliche Normangaben
  norm_designation: z.string().optional(),
  ce_marking_info: z.string().optional(),
  dop_number: z.string().optional(),
})

type RecipeFormValues = z.infer<typeof recipeFormSchema>

interface RecipeFormProps {
  recipe?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function RecipeFormEN13813({ recipe, onSuccess, onCancel }: RecipeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const isEditing = !!recipe

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: recipe || {
      name: '',
      description: '',
      estrich_type: 'CT',
      compressive_strength: 'C25',
      flexural_strength: 'F4',
      fire_class: 'A1fl',
      status: 'draft',
      release_of_corrosive_substances: false,
    },
  })

  const estrichType = form.watch('estrich_type')
  const compressiveStrength = form.watch('compressive_strength')
  const flexuralStrength = form.watch('flexural_strength')
  const wearResistance = form.watch('wear_resistance_bohme') || 
                         form.watch('wear_resistance_bca') || 
                         form.watch('wear_resistance_rwa')
  const surfaceHardness = form.watch('surface_hardness')
  const indentationIC = form.watch('indentation_class_ic')
  const indentationIP = form.watch('indentation_class_ip')
  
  // Generiere vollständige Normbezeichnung nach EN 13813
  const generateNormDesignation = () => {
    let designation = `EN 13813 ${estrichType}-${compressiveStrength}-${flexuralStrength}`
    
    // Füge optionale Eigenschaften hinzu
    if (wearResistance && estrichType === 'CT') {
      designation += `-${wearResistance}`
    }
    if (surfaceHardness && estrichType === 'MA') {
      designation += `-${surfaceHardness}`
    }
    if ((indentationIC || indentationIP) && estrichType === 'AS') {
      designation += `-${indentationIC || indentationIP}`
    }
    
    return designation
  }

  // Bedingungen für anzuzeigende Felder basierend auf Estrichtyp
  const showWearResistance = ['CT', 'SR'].includes(estrichType)
  const showSurfaceHardness = ['MA'].includes(estrichType)
  const showIndentation = estrichType === 'AS'
  const showBondStrength = ['SR', 'CT', 'CA', 'MA'].includes(estrichType)
  const showImpactResistance = ['SR', 'CT'].includes(estrichType)
  const showPHValue = estrichType === 'CA'

  useEffect(() => {
    // Aktualisiere Normbezeichnung
    form.setValue('norm_designation', generateNormDesignation())
  }, [estrichType, compressiveStrength, flexuralStrength, wearResistance, surfaceHardness, indentationIC, indentationIP])

  async function onSubmit(values: RecipeFormValues) {
    setIsSubmitting(true)
    
    try {
      // Validiere spezielle Anforderungen
      if (values.estrich_type === 'CA' && values.ph_value && values.ph_value < 7) {
        toast({
          title: 'Validierungsfehler',
          description: 'pH-Wert für Calciumsulfatestrich muss ≥ 7 sein',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      const response = await fetch(
        isEditing ? `/api/en13813/recipes/${recipe.id}` : '/api/en13813/recipes',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
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
              Vollständige Rezepturdefinition nach EN 13813:2002
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Normbezeichnung:</strong> {generateNormDesignation()}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    Diese Bezeichnung wird automatisch nach EN 13813 generiert
                  </span>
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="optional-fields"
                  checked={showOptionalFields}
                  onCheckedChange={setShowOptionalFields}
                />
                <label htmlFor="optional-fields" className="text-sm font-medium">
                  Erweiterte Eigenschaften anzeigen
                </label>
              </div>
            </div>

            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                <TabsTrigger value="mechanical">Mechanisch</TabsTrigger>
                <TabsTrigger value="special">Speziell</TabsTrigger>
                <TabsTrigger value="application">Anwendung</TabsTrigger>
                <TabsTrigger value="ce-marking">CE/DoP</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Standard Zementestrich C25-F4" {...field} />
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estrich_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estrichtyp * (EN 13813)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Wählen Sie einen Typ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CT">CT - Zementestrich (Cementitious)</SelectItem>
                            <SelectItem value="CA">CA - Calciumsulfatestrich</SelectItem>
                            <SelectItem value="MA">MA - Magnesiaestrich</SelectItem>
                            <SelectItem value="AS">AS - Gussasphaltestrich</SelectItem>
                            <SelectItem value="SR">SR - Kunstharzestrich (Synthetic Resin)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Bindemitteltyp nach EN 13813 Abschnitt 3.2
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
                </div>
              </TabsContent>

              <TabsContent value="mechanical" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Pflicht-Eigenschaften (Tabelle 1, EN 13813)</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="compressive_strength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Druckfestigkeitsklasse * (5.2.1)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80'].map(cls => (
                                <SelectItem key={cls} value={cls}>
                                  {cls} ({cls.replace('C', '')} N/mm²)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Nach EN 13892-2 (Tabelle 2)
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
                          <FormLabel>Biegezugfestigkeitsklasse * (5.2.2)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'].map(cls => (
                                <SelectItem key={cls} value={cls}>
                                  {cls} ({cls.replace('F', '')} N/mm²)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Nach EN 13892-2 (Tabelle 3)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />
                  
                  {(showWearResistance || showOptionalFields) && (
                    <>
                      <h3 className="text-sm font-semibold">Verschleißwiderstand (5.2.3)</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="wear_resistance_bohme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Böhme-Verfahren (Tabelle 4)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Optional" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Keine Angabe</SelectItem>
                                  {['A1.5', 'A3', 'A6', 'A9', 'A12', 'A15', 'A22'].map(cls => (
                                    <SelectItem key={cls} value={cls}>
                                      {cls} ({cls.replace('A', '')} cm³/50cm²)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                EN 13892-3
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="wear_resistance_bca"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>BCA-Verfahren (Tabelle 5)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Optional" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Keine Angabe</SelectItem>
                                  {['AR0.5', 'AR1', 'AR2', 'AR4', 'AR6'].map(cls => (
                                    <SelectItem key={cls} value={cls}>
                                      {cls} (max. {cls.replace('AR', '').replace('.', ',')}00 μm)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                EN 13892-4
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="wear_resistance_rwa"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rolling Wheel (Tabelle 6)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Optional" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Keine Angabe</SelectItem>
                                  {['RWA1', 'RWA10', 'RWA20', 'RWA100', 'RWA300'].map(cls => (
                                    <SelectItem key={cls} value={cls}>
                                      {cls} ({cls.replace('RWA', '')} cm³)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                EN 13892-5
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {(showSurfaceHardness || showOptionalFields) && (
                    <FormField
                      control={form.control}
                      name="surface_hardness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Oberflächenhärte (5.2.4, Tabelle 7)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Für MA-Estriche" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Keine Angabe</SelectItem>
                              {['SH30', 'SH40', 'SH50', 'SH70', 'SH100', 'SH150', 'SH200'].map(cls => (
                                <SelectItem key={cls} value={cls}>
                                  {cls} ({cls.replace('SH', '')} N/mm²)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Nach EN 13892-6 (für Magnesiaestrich)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {(showIndentation || showOptionalFields) && (
                    <>
                      <h3 className="text-sm font-semibold">Härteeigenschaften Gussasphalt (5.2.5)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="indentation_class_ic"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IC-Klasse (Tabelle 8a)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Für AS-Estriche" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Keine Angabe</SelectItem>
                                  <SelectItem value="ICH10">ICH10 (beheizt)</SelectItem>
                                  <SelectItem value="IC10">IC10</SelectItem>
                                  <SelectItem value="IC15">IC15</SelectItem>
                                  <SelectItem value="IC40">IC40</SelectItem>
                                  <SelectItem value="IC100">IC100</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                EN 12697-20 (Würfel)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="indentation_class_ip"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IP-Klasse (Tabelle 8b/8c)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Für AS-Estriche" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Keine Angabe</SelectItem>
                                  <SelectItem value="IP10">IP10</SelectItem>
                                  <SelectItem value="IP12">IP12</SelectItem>
                                  <SelectItem value="IP30">IP30</SelectItem>
                                  <SelectItem value="IP70">IP70</SelectItem>
                                  <SelectItem value="IP I">IP I</SelectItem>
                                  <SelectItem value="IP II">IP II</SelectItem>
                                  <SelectItem value="IP III">IP III</SelectItem>
                                  <SelectItem value="IP IV">IP IV</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                EN 12697-21 (Platten)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {(showOptionalFields || showBondStrength) && (
                    <>
                      <Separator />
                      <h3 className="text-sm font-semibold">Weitere mechanische Eigenschaften</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bond_strength"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Haftfestigkeit (5.2.12, Tabelle 11)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Optional" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Keine Angabe</SelectItem>
                                  {['B0.2', 'B0.5', 'B1.0', 'B1.5', 'B2.0'].map(cls => (
                                    <SelectItem key={cls} value={cls}>
                                      {cls} ({cls.replace('B', '')} N/mm²)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                EN 13892-8
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {(showImpactResistance || showOptionalFields) && (
                          <FormField
                            control={form.control}
                            name="impact_resistance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Schlagfestigkeit (5.2.13)</FormLabel>
                                <FormControl>
                                  <Input placeholder="z.B. IR4 (in Nm)" {...field} />
                                </FormControl>
                                <FormDescription>
                                  EN ISO 6272 (für SR-Estriche)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="modulus_of_elasticity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-Modul (5.2.11, Tabelle 10)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Optional" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Keine Angabe</SelectItem>
                                  {['E1', 'E2', 'E5', 'E10', 'E15', 'E20'].map(cls => (
                                    <SelectItem key={cls} value={cls}>
                                      {cls} ({cls.replace('E', '')} kN/mm²)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                EN ISO 178
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="rwfc_resistance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>RWFC (5.2.6, Tabelle 9)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Mit Bodenbelag" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Keine Angabe</SelectItem>
                                  {['RWFC150', 'RWFC250', 'RWFC350', 'RWFC450', 'RWFC550'].map(cls => (
                                    <SelectItem key={cls} value={cls}>
                                      {cls} ({cls.replace('RWFC', '')} N)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                EN 13892-7 (mit Bodenbelag)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="special" className="space-y-4">
                <h3 className="text-sm font-semibold">Spezielle Eigenschaften (5.3)</h3>
                
                <FormField
                  control={form.control}
                  name="fire_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brandklasse (5.3.4)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A1fl">A1fl - Nicht brennbar (ohne Prüfung)</SelectItem>
                          <SelectItem value="A2fl">A2fl - Nicht brennbar</SelectItem>
                          <SelectItem value="Bfl">Bfl - Schwer entflammbar</SelectItem>
                          <SelectItem value="Cfl">Cfl - Normal entflammbar</SelectItem>
                          <SelectItem value="Dfl">Dfl - Normal entflammbar</SelectItem>
                          <SelectItem value="Efl">Efl - Normal entflammbar</SelectItem>
                          <SelectItem value="Ffl">Ffl - Leicht entflammbar/Keine Anforderung</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Nach EN 13501-1
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="electrical_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elektrischer Widerstand (5.3.2)</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. ER10⁵ (in Ohm)" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 1081
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chemical_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chemische Beständigkeit (5.3.3)</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. CR1-8 (Klasse 2)" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 13529
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="water_vapour_permeability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wasserdampfdurchlässigkeit (5.3.6)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="μ-Wert" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 12086
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="water_permeability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wasserpermeabilität (5.3.8)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" placeholder="kg/(m²·h⁰·⁵)" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 1062-3
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="thermal_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wärmewiderstand (5.3.7)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="λ in W/(m·K)" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 12524/12664
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sound_insulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trittschallschutz (5.3.9)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="ΔLw in dB" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN ISO 140-6
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sound_absorption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schallabsorption (5.3.10)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="α-Wert" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN ISO 354
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="application" className="space-y-4">
                <h3 className="text-sm font-semibold">Verarbeitungseigenschaften</h3>
                
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shrinkage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schwindung (5.2.8)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="mm/m" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 13454-2/13872
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="swelling"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quellung (5.2.8)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="mm/m" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 13454-2/13872
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="consistency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konsistenz (5.2.9)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="mm" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 13454-2/12706
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(showPHValue || showOptionalFields) && (
                    <FormField
                      control={form.control}
                      name="ph_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>pH-Wert (5.2.10) {estrichType === 'CA' && '*'}</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" max="14" placeholder="7-14" {...field} />
                          </FormControl>
                          <FormDescription>
                            {estrichType === 'CA' && 'Muss ≥ 7 sein'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="max_aggregate_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max. Korngröße (mm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="z.B. 8" {...field} />
                        </FormControl>
                        <FormDescription>
                          Größtkorn der Gesteinskörnung
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="setting_time_initial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Erstarrungsbeginn (5.2.7)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Minuten" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 13454-2
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="setting_time_final"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Erstarrungsende (5.2.7)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Minuten" {...field} />
                        </FormControl>
                        <FormDescription>
                          EN 13454-2
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ce-marking" className="space-y-4">
                <h3 className="text-sm font-semibold">CE-Kennzeichnung & Leistungserklärung</h3>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Diese Informationen sind für die Leistungserklärung (DoP) nach Bauproduktenverordnung erforderlich
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="norm_designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Normbezeichnung (Abschnitt 7)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        Automatisch generiert nach EN 13813
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dop_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DoP-Nummer</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. DoP-001-2024" {...field} />
                      </FormControl>
                      <FormDescription>
                        Eindeutige Nummer der Leistungserklärung
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="release_of_corrosive_substances"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Freisetzung korrosiver Substanzen (5.3.5)
                        </FormLabel>
                        <FormDescription>
                          Deklaration nach Materialtyp
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
                  name="dangerous_substances_declaration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gefährliche Substanzen (Anhang ZA)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Deklaration gemäß nationalen Bestimmungen..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Nach Anhang ZA der EN 13813
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ce_marking_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CE-Kennzeichnung Zusatzinfo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Zusätzliche Informationen für CE-Kennzeichnung..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Weitere Angaben nach Anhang ZA.3
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            * Pflichtfelder gemäß EN 13813:2002
          </div>
          
          <div className="flex gap-4">
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
        </div>
      </form>
    </Form>
  )
}