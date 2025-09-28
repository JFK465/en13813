'use client'

import { lazy, Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { Save, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { createEN13813Services } from '@/modules/en13813/services'
import { NormDesignationDisplay } from './NormDesignationDisplay'

// Lazy load erweiterte Felder
const AdvancedFields = lazy(() => import('./RecipeFormAdvanced'))

// Basis-Schema mit nur essentiellen Feldern
const basicRecipeSchema = z.object({
  recipe_code: z.string().min(1, 'Rezeptur-Code ist erforderlich'),
  name: z.string().min(1, 'Bezeichnung ist erforderlich'),
  type: z.enum(['CT', 'CA', 'MA', 'SR', 'AS']),
  version: z.string().default('1.0'),
  status: z.enum(['draft', 'in_review', 'approved', 'active', 'locked', 'archived']).default('draft'),
  compressive_strength_class: z.string(),
  flexural_strength_class: z.string(),
  avcp_system: z.enum(['4', '3', '2+', '1+', '1']).default('4'),
  test_age_days: z.number().default(28),
}).passthrough() // Erlaubt zusätzliche Felder von Advanced

type RecipeFormValues = z.infer<typeof basicRecipeSchema>

export function RecipeFormPragmatic() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const services = createEN13813Services(supabase)

  const form = useForm<any>({
    resolver: zodResolver(basicRecipeSchema),
    defaultValues: {
      recipe_code: '',
      name: '',
      type: 'CT',
      version: '1.0',
      status: 'draft',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      avcp_system: '4',
      test_age_days: 28,
    },
    mode: 'onBlur', // Performance: Nur bei Blur validieren
  })

  const watchedValues = form.watch(['type', 'compressive_strength_class', 'flexural_strength_class'])

  // Generiere EN-Bezeichnung
  const enDesignation = `${watchedValues[0]}-${watchedValues[1]}-${watchedValues[2]}`

  const onSubmit = async (values: any) => {
    setIsSaving(true)
    try {
      // Map 'type' zu 'binder_type' für die Datenbank
      const recipeData = {
        ...values,
        binder_type: values.type,  // Map type -> binder_type für DB
      }
      delete recipeData.type  // Entferne das 'type' Feld

      // Verwende API Route anstatt direkten Service Call
      const response = await fetch('/api/en13813/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Fehler beim Speichern')
      }

      const data = await response.json()

      toast({
        title: "Rezeptur gespeichert",
        description: `Die Rezeptur ${values.name} wurde erfolgreich angelegt.`,
      })

      router.push('/en13813/recipes')
    } catch (error: any) {
      console.error('Fehler beim Speichern:', error)
      toast({
        title: "Fehler",
        description: error.message || "Die Rezeptur konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* EN-Bezeichnung Anzeige */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Generierte EN-Bezeichnung</CardTitle>
          </CardHeader>
          <CardContent>
            <NormDesignationDisplay binderType={watchedValues[0]} compressiveClass={watchedValues[1]} flexuralClass={watchedValues[2]} />
          </CardContent>
        </Card>

        {/* === PFLICHTFELDER (Immer sichtbar) === */}
        <Card>
          <CardHeader>
            <CardTitle>Grunddaten</CardTitle>
            <CardDescription>
              Pflichtangaben für die EN 13813 konforme Rezeptur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Zeile 1: Code, Version, Typ, Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="recipe_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rezeptur-Code*</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. CT-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version*</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bindemitteltyp*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CT">CT - Zementestrich</SelectItem>
                        <SelectItem value="CA">CA - Calciumsulfatestrich</SelectItem>
                        <SelectItem value="MA">MA - Magnesiaestrich</SelectItem>
                        <SelectItem value="SR">SR - Kunstharzestrich</SelectItem>
                        <SelectItem value="AS">AS - Gussasphaltestrich</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="archived">Archiviert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Zeile 2: Bezeichnung */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bezeichnung*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. Zementestrich CT-C25-F4 für Industrieböden"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Aussagekräftige Bezeichnung der Rezeptur
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zeile 3: Festigkeitsklassen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="compressive_strength_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Druckfestigkeitsklasse*</FormLabel>
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
                    <FormDescription>N/mm² nach 28 Tagen</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="flexural_strength_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biegezugfestigkeitsklasse*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['F1', 'F2', 'F3', 'F4', 'F5', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'].map(cls => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>N/mm² nach 28 Tagen</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avcp_system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AVCP System*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">System 1</SelectItem>
                        <SelectItem value="1+">System 1+</SelectItem>
                        <SelectItem value="2+">System 2+</SelectItem>
                        <SelectItem value="3">System 3</SelectItem>
                        <SelectItem value="4">System 4</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* === ERWEITERTE FELDER (Lazy loaded) === */}
        <Card>
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Erweiterte Eigenschaften</CardTitle>
                <CardDescription>
                  Optionale Angaben wie Verschleißwiderstand, Oberflächenhärte, Brandverhalten etc.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-4"
              >
                {showAdvanced ? (
                  <>Ausblenden <ChevronUp className="ml-2 h-4 w-4" /></>
                ) : (
                  <>Anzeigen <ChevronDown className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </CardHeader>

          {showAdvanced && (
            <CardContent>
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                }
              >
                <AdvancedFields form={form} />
              </Suspense>
            </CardContent>
          )}
        </Card>

        {/* === ACTIONS === */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichert...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Rezeptur speichern
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}