'use client'

import { useState } from 'react'
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
import { AlertCircle, Save, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Form validation schema
const recipeFormSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').max(255),
  description: z.string().optional(),
  estrich_type: z.enum(['CT', 'CA', 'MA', 'AS', 'SR'], {
    required_error: 'Estrichtyp ist erforderlich',
  }),
  compressive_strength: z.string().regex(/^C\d{1,2}$/, 'Format: C + Zahl (z.B. C25)'),
  flexural_strength: z.string().regex(/^F\d{1,2}$/, 'Format: F + Zahl (z.B. F4)'),
  wear_resistance: z.string().regex(/^A\d{1,2}$/, 'Format: A + Zahl (z.B. A12)').optional().or(z.literal('')),
  hardness: z.string().optional(),
  fire_class: z.enum(['A1fl', 'A2fl', 'Bfl', 'Cfl', 'Dfl', 'Efl', 'Ffl']).default('A1fl'),
  application_thickness_min: z.coerce.number().min(0).optional(),
  application_thickness_max: z.coerce.number().min(0).optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
})

type RecipeFormValues = z.infer<typeof recipeFormSchema>

interface RecipeFormProps {
  recipe?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function RecipeForm({ recipe, onSuccess, onCancel }: RecipeFormProps) {
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
      wear_resistance: '',
      hardness: '',
      fire_class: 'A1fl',
      application_thickness_min: undefined,
      application_thickness_max: undefined,
      status: 'draft',
    },
  })

  const estrichType = form.watch('estrich_type')
  const compressiveStrength = form.watch('compressive_strength')
  const flexuralStrength = form.watch('flexural_strength')
  
  // Generate recipe code preview
  const recipeCode = `${estrichType}-${compressiveStrength}-${flexuralStrength}`

  async function onSubmit(values: RecipeFormValues) {
    setIsSubmitting(true)
    
    try {
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
              Definieren Sie eine Estrichrezeptur nach EN 13813
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rezeptur-Code:</strong> {recipeCode}
                  <br />
                  Dieser Code wird automatisch aus Typ und Festigkeitsklassen generiert.
                </AlertDescription>
              </Alert>
            </div>

            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Grunddaten</TabsTrigger>
                <TabsTrigger value="properties">Eigenschaften</TabsTrigger>
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
                        <Input placeholder="z.B. Standard Zementestrich" {...field} />
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

              <TabsContent value="properties" className="space-y-4">
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
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Druckfestigkeit in N/mm²
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
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Biegezugfestigkeit in N/mm²
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="wear_resistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verschleißwiderstand</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Keine Angabe</SelectItem>
                            {['A1', 'A3', 'A6', 'A9', 'A12', 'A15', 'A22'].map(cls => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nach Böhme-Verfahren
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hardness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Oberflächenhärte</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. SH50" {...field} />
                        </FormControl>
                        <FormDescription>
                          Nach EN 13892-6
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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