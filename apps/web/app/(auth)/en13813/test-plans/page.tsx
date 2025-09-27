'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TestPlanService, RecipeTestPlan, TestSchedule } from '@/modules/en13813/services/test-plan.service'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { Button } from '@/components/ui/button'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { Badge } from '@/components/ui/badge'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import {
  ClipboardList,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Plus
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { toast } from 'sonner'

export default function TestPlansPage() {
  const [testPlans, setTestPlans] = useState<RecipeTestPlan[]>([])
  const [upcomingTests, setUpcomingTests] = useState<TestSchedule[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [availableRecipes, setAvailableRecipes] = useState<any[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const supabase = createClientComponentClient()
  const testPlanService = new TestPlanService(supabase)

  useEffect(() => {
    loadData()
    loadAvailableRecipes()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [upcoming, stats] = await Promise.all([
        testPlanService.getUpcomingTests(30),
        testPlanService.getTestPlanStatistics()
      ])

      setUpcomingTests(upcoming)
      setStatistics(stats)
    } catch (error) {
      console.error('Error loading test plan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableRecipes = async () => {
    try {
      // Lade alle Rezepturen
      const { data: allRecipes, error: recipesError } = await supabase
        .from('en13813_recipes')
        .select('id, recipe_code, name, binder_type')
        .order('recipe_code', { ascending: true })

      if (recipesError) throw recipesError

      // Lade existierende Prüfpläne
      const { data: existingPlans, error: plansError } = await supabase
        .from('en13813_test_plans')
        .select('recipe_id')

      if (plansError) throw plansError

      // Filtere Rezepturen ohne Prüfplan
      const existingRecipeIds = existingPlans?.map(p => p.recipe_id) || []
      const recipesWithoutPlan = allRecipes?.filter(
        recipe => !existingRecipeIds.includes(recipe.id)
      ) || []

      setAvailableRecipes(recipesWithoutPlan)
    } catch (error) {
      console.error('Error loading available recipes:', error)
      toast.error('Fehler beim Laden der Rezepturen')
    }
  }

  const handleCreateTestPlan = async () => {
    if (!selectedRecipe) {
      toast.error('Bitte wählen Sie eine Rezeptur aus')
      return
    }

    try {
      setCreating(true)
      const recipe = availableRecipes.find(r => r.id === selectedRecipe)
      if (!recipe) {
        toast.error('Rezeptur nicht gefunden')
        return
      }

      // Erstelle Prüfplan
      const testPlan = await testPlanService.createTestPlan(recipe.id, recipe.binder_type)

      // Generiere initiale Prüftermine für die nächsten 12 Monate
      await testPlanService.generateTestSchedule(recipe.id)

      toast.success(`Prüfplan für ${recipe.recipe_code} erfolgreich erstellt`)

      // Aktualisiere Daten
      await loadData()
      await loadAvailableRecipes()

      // Schließe Dialog
      setDialogOpen(false)
      setSelectedRecipe('')
    } catch (error) {
      console.error('Error creating test plan:', error)
      toast.error('Fehler beim Erstellen des Prüfplans')
    } finally {
      setCreating(false)
    }
  }

  const getITTStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Abgeschlossen</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />In Bearbeitung</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Ausstehend</Badge>
      case 'failed':
        return <Badge className="bg-red-500">Fehlgeschlagen</Badge>
      default:
        return null
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      mechanical: 'Mechanisch',
      physical: 'Physikalisch',
      chemical: 'Chemisch',
      thermal: 'Thermisch',
      acoustic: 'Akustisch',
      electrical: 'Elektrisch'
    }
    return labels[category] || category
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      initial: 'Einmalig (ITT)',
      daily: 'Täglich',
      weekly: 'Wöchentlich',
      monthly: 'Monatlich',
      quarterly: 'Vierteljährlich',
      yearly: 'Jährlich'
    }
    return labels[frequency] || frequency
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">Lade Prüfpläne...</div>
    </div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Prüfpläne</h1>
          <p className="text-muted-foreground mt-1">
            ITT-Prüfungen und FPC-Kontrollen gemäß EN 13813
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Prüfplan erstellen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Prüfplan erstellen</DialogTitle>
              <DialogDescription>
                Wählen Sie eine Rezeptur aus, für die ein Prüfplan erstellt werden soll.
                Der Prüfplan umfasst alle erforderlichen ITT-Prüfungen und FPC-Kontrollen gemäß EN 13813.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipe">Rezeptur</Label>
                <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                  <SelectTrigger id="recipe">
                    <SelectValue placeholder="Rezeptur auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRecipes.length > 0 ? (
                      availableRecipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.recipe_code} - {recipe.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Alle Rezepturen haben bereits einen Prüfplan
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedRecipe && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Hinweis:</strong> Nach Erstellung des Prüfplans werden automatisch:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• ITT-Prüfungen (Erstprüfung) angelegt</li>
                    <li>• FPC-Kontrolltermine für 12 Monate generiert</li>
                    <li>• Prüfintervalle gemäß EN 13813 festgelegt</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setSelectedRecipe('')
                }}
                disabled={creating}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCreateTestPlan}
                disabled={!selectedRecipe || creating}
              >
                {creating ? 'Erstelle...' : 'Prüfplan erstellen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Prüfpläne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_test_plans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">ITT Ausstehend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.itt_pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">ITT Abgeschlossen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.itt_completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">FPC Aktiv</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.fpc_active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Überfällige Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.overdue_tests}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            <Calendar className="mr-2 h-4 w-4" />
            Anstehende Prüfungen
          </TabsTrigger>
          <TabsTrigger value="itt">
            <FileText className="mr-2 h-4 w-4" />
            ITT-Prüfungen
          </TabsTrigger>
          <TabsTrigger value="fpc">
            <ClipboardList className="mr-2 h-4 w-4" />
            FPC-Kontrollen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Anstehende Prüfungen (nächste 30 Tage)</CardTitle>
              <CardDescription>
                Geplante Tests und Kontrollen für Ihre Rezepturen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTests.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {(test as any).recipe?.name || 'Rezeptur'} - {(test as any).recipe?.recipe_code}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Prüfung: {test.test_plan_item_id}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Fällig: {new Date(test.scheduled_date).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Durchführen</Button>
                        <Button size="sm" variant="outline">Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Keine anstehenden Prüfungen in den nächsten 30 Tagen
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itt">
          <Card>
            <CardHeader>
              <CardTitle>ITT-Prüfungen (Erstprüfung)</CardTitle>
              <CardDescription>
                Status der Erstprüfungen gemäß EN 13813
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-900">ITT-Prüfungen erforderlich</div>
                      <div className="text-sm text-yellow-700 mt-1">
                        Für jede neue Rezeptur müssen alle wesentlichen Eigenschaften durch Erstprüfung (ITT) nachgewiesen werden.
                        Dies umfasst Druckfestigkeit, Biegezugfestigkeit und alle deklarierten Eigenschaften.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fpc">
          <Card>
            <CardHeader>
              <CardTitle>FPC-Kontrollen (Werkseigene Produktionskontrolle)</CardTitle>
              <CardDescription>
                Regelmäßige Kontrollen zur Qualitätssicherung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Tägliche Kontrollen</div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Konsistenz (Ausbreitmaß)</li>
                      <li>• Frischmörteldichte</li>
                      <li>• Visuelle Kontrolle</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Monatliche Kontrollen</div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Druckfestigkeit (28 Tage)</li>
                      <li>• Biegezugfestigkeit (28 Tage)</li>
                      <li>• Trockenrohdichte</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Vierteljährliche Kontrollen</div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Verschleißwiderstand (wenn deklariert)</li>
                      <li>• Oberflächenhärte (MA)</li>
                      <li>• Haftzugfestigkeit (SR)</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Jährliche Kontrollen</div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Wärmeleitfähigkeit</li>
                      <li>• Chemische Beständigkeit</li>
                      <li>• Überprüfung aller Prüfverfahren</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}