'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
import type { Recipe } from '../types'

const recipeSchema = z.object({
  recipe_code: z.string().min(1, 'Rezeptur-Code ist erforderlich'),
  name: z.string().min(1, 'Name ist erforderlich'),
  type: z.enum(['CT', 'CA', 'MA', 'SR', 'AS']),
  compressive_strength_class: z.string(),
  flexural_strength_class: z.string(),
  wear_resistance_class: z.string().optional(),
  fire_class: z.string().default('A1fl'),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  additives: z.array(z.object({
    type: z.string(),
    name: z.string(),
    percentage: z.number().optional()
  })).default([]),
  special_properties: z.object({
    shrinkage_class: z.string().optional(),
    surface_hardness_class: z.string().optional(),
    electrical_resistance: z.string().optional(),
    thermal_resistance: z.string().optional(),
    acoustic_properties: z.string().optional(),
    release_of_dangerous_substances: z.string().optional()
  }).default({})
})

type RecipeFormData = z.infer<typeof recipeSchema>

interface RecipeFormProps {
  recipe?: Recipe | null
  onSubmit: (data: RecipeFormData) => Promise<void>
  onCancel: () => void
}

export function RecipeForm({ recipe, onSubmit, onCancel }: RecipeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: recipe || {
      recipe_code: '',
      name: '',
      type: 'CT',
      compressive_strength_class: 'C20',
      flexural_strength_class: 'F4',
      fire_class: 'A1fl',
      status: 'draft',
      additives: [],
      special_properties: {}
    }
  })

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      await onSubmit(data)
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addAdditive = () => {
    const current = form.getValues('additives') || []
    form.setValue('additives', [
      ...current,
      { type: 'additive', name: '', percentage: undefined }
    ])
  }

  const removeAdditive = (index: number) => {
    const current = form.getValues('additives') || []
    form.setValue('additives', current.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Grunddaten</TabsTrigger>
          <TabsTrigger value="technical">Technische Eigenschaften</TabsTrigger>
          <TabsTrigger value="additives">Zusatzstoffe</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipe_code">Rezeptur-Code*</Label>
              <Input
                id="recipe_code"
                {...form.register('recipe_code')}
                placeholder="z.B. CT-C25-F4"
              />
              {form.formState.errors.recipe_code && (
                <p className="text-sm text-red-500">{form.formState.errors.recipe_code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Bezeichnung*</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="z.B. Zementestrich CT-C25-F4"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Estrichtyp*</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) => form.setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CT">CT - Zementestrich</SelectItem>
                  <SelectItem value="CA">CA - Calciumsulfatestrich</SelectItem>
                  <SelectItem value="MA">MA - Magnesiaestrich</SelectItem>
                  <SelectItem value="SR">SR - Kunstharzestrich</SelectItem>
                  <SelectItem value="AS">AS - Gussasphaltestrich</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value) => form.setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="archived">Archiviert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Festigkeitsklassen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="compressive_strength_class">Druckfestigkeit*</Label>
                  <Select
                    value={form.watch('compressive_strength_class')}
                    onValueChange={(value) => form.setValue('compressive_strength_class', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80'].map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flexural_strength_class">Biegezugfestigkeit*</Label>
                  <Select
                    value={form.watch('flexural_strength_class')}
                    onValueChange={(value) => form.setValue('flexural_strength_class', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'].map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wear_resistance_class">Verschleißwiderstand (optional)</Label>
                  <Select
                    value={form.watch('wear_resistance_class') || ''}
                    onValueChange={(value) => form.setValue('wear_resistance_class', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Keine Angabe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Keine Angabe</SelectItem>
                      {['A1', 'A3', 'A6', 'A9', 'A12', 'A15', 'A22', 'AR0.5', 'AR1', 'AR2', 'AR4', 'AR6'].map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fire_class">Brandklasse*</Label>
                  <Select
                    value={form.watch('fire_class')}
                    onValueChange={(value) => form.setValue('fire_class', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['A1fl', 'A2fl', 'Bfl', 'Cfl', 'Dfl', 'Efl', 'Ffl'].map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zusätzliche Eigenschaften</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shrinkage_class">Schwindmaßklasse</Label>
                  <Input
                    id="shrinkage_class"
                    {...form.register('special_properties.shrinkage_class')}
                    placeholder="z.B. SH50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surface_hardness_class">Oberflächenhärte</Label>
                  <Input
                    id="surface_hardness_class"
                    {...form.register('special_properties.surface_hardness_class')}
                    placeholder="z.B. SH70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="electrical_resistance">Elektrischer Widerstand</Label>
                <Input
                  id="electrical_resistance"
                  {...form.register('special_properties.electrical_resistance')}
                  placeholder="z.B. < 10⁶ Ω"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="release_of_dangerous_substances">Freisetzung gefährlicher Substanzen</Label>
                <Input
                  id="release_of_dangerous_substances"
                  {...form.register('special_properties.release_of_dangerous_substances')}
                  placeholder="Standard: NPD"
                  defaultValue="NPD"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additives" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Zusatzstoffe</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAdditive}
              >
                <Plus className="h-4 w-4 mr-1" />
                Hinzufügen
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.watch('additives')?.map((_, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Name des Zusatzstoffs"
                    {...form.register(`additives.${index}.name`)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="%"
                    {...form.register(`additives.${index}.percentage`, { valueAsNumber: true })}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAdditive(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {(!form.watch('additives') || form.watch('additives').length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Zusatzstoffe definiert
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Speichern...' : recipe ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  )
}