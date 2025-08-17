'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createEN13813Services } from '@/modules/en13813/services'
import { recipeSchema } from '@/modules/en13813/services/recipe.service'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft, Save, FlaskConical, Plus, Trash } from 'lucide-react'
import Link from 'next/link'

type RecipeFormValues = z.infer<typeof recipeSchema>

export default function NewRecipePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const services = createEN13813Services(supabase)

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      recipe_code: '',
      name: '',
      type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      wear_resistance_class: '',
      fire_class: 'A1fl',
      additives: [],
      special_properties: {},
      status: 'draft'
    }
  })

  async function onSubmit(data: RecipeFormValues) {
    setLoading(true)
    try {
      const recipe = await services.recipes.create(data)
      toast({
        title: 'Erfolg',
        description: 'Rezeptur wurde erstellt'
      })
      router.push(`/en13813/recipes/${recipe.id}`)
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'Rezeptur konnte nicht erstellt werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const strengthClasses = {
    compressive: ['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80'],
    flexural: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'],
    wear: ['A1', 'A3', 'A6', 'A9', 'A12', 'A15', 'A22', 'AR0.5', 'AR1', 'AR2', 'AR4', 'AR6']
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/en13813/recipes" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Neue Rezeptur anlegen</h1>
          <p className="text-muted-foreground mt-1">
            Erstellen Sie eine neue Estrichmörtel-Rezeptur nach EN 13813
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Grunddaten</CardTitle>
                <CardDescription>
                  Allgemeine Informationen zur Rezeptur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recipe_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rezeptur-Code*</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. CT-C25-F4" {...field} />
                        </FormControl>
                        <FormDescription>
                          Eindeutiger Code für diese Rezeptur
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estrich-Typ*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Typ auswählen" />
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
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bezeichnung*</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Zementestrich Standard C25/F4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Technical Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Technische Eigenschaften</CardTitle>
                <CardDescription>
                  Festigkeitsklassen und weitere Eigenschaften
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="compressive_strength_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Druckfestigkeitsklasse*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Klasse wählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {strengthClasses.compressive.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nach EN 13813 (N/mm²)
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
                        <FormLabel>Biegezugfestigkeitsklasse*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Klasse wählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {strengthClasses.flexural.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nach EN 13813 (N/mm²)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="wear_resistance_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verschleißwiderstandsklasse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Keine Angabe</SelectItem>
                            {strengthClasses.wear.map(cls => (
                              <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Böhme oder BCA Verfahren
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fire_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brandverhalten*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Klasse wählen" />
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
                          Nach EN 13501-1
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rezeptur-Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status wählen" />
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
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/en13813/recipes')}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Speichern...' : 'Rezeptur erstellen'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}