'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  FileText, 
  Package, 
  ClipboardCheck,
  AlertCircle,
  Download,
  Send,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function NewDoPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [recipes, setRecipes] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [testReports, setTestReports] = useState<any[]>([])
  
  const [selectedRecipe, setSelectedRecipe] = useState<string>(searchParams.get('recipe') || '')
  const [selectedBatch, setSelectedBatch] = useState<string>('')
  const [selectedTestReports, setSelectedTestReports] = useState<string[]>([])
  const [language, setLanguage] = useState<'de' | 'en'>('de')
  
  const [recipeDetails, setRecipeDetails] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedRecipe) {
      loadRecipeDetails(selectedRecipe)
      loadBatches(selectedRecipe)
      loadTestReports(selectedRecipe)
    }
  }, [selectedRecipe])

  async function loadData() {
    setLoading(true)
    try {
      // Load active recipes
      const { data: recipesData } = await supabase
        .from('en13813_recipes')
        .select('*')
        .eq('status', 'active')
        .eq('is_validated', true)
        .order('recipe_code')
      
      setRecipes(recipesData || [])
      
      // If recipe was passed via URL, select it
      if (searchParams.get('recipe')) {
        setSelectedRecipe(searchParams.get('recipe')!)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Fehler',
        description: 'Daten konnten nicht geladen werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadRecipeDetails(recipeId: string) {
    try {
      const { data } = await supabase
        .from('en13813_recipes')
        .select('*')
        .eq('id', recipeId)
        .single()
      
      setRecipeDetails(data)
    } catch (error) {
      console.error('Error loading recipe details:', error)
    }
  }

  async function loadBatches(recipeId: string) {
    try {
      const { data } = await supabase
        .from('en13813_batches')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('production_date', { ascending: false })
      
      setBatches(data || [])
    } catch (error) {
      console.error('Error loading batches:', error)
    }
  }

  async function loadTestReports(recipeId: string) {
    try {
      const { data } = await supabase
        .from('en13813_test_reports')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('status', 'valid')
        .order('test_date', { ascending: false })
      
      setTestReports(data || [])
      
      // Auto-select the most recent test report
      if (data && data.length > 0) {
        setSelectedTestReports([data[0].id])
      }
    } catch (error) {
      console.error('Error loading test reports:', error)
    }
  }

  async function handleGenerateDoP() {
    if (!selectedRecipe) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie eine Rezeptur aus',
        variant: 'destructive'
      })
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/en13813/dops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe_id: selectedRecipe,
          batch_id: selectedBatch === 'none' ? undefined : selectedBatch,
          test_report_ids: selectedTestReports,
          language
        })
      })

      if (!response.ok) {
        throw new Error('DoP-Generierung fehlgeschlagen')
      }

      const dop = await response.json()
      
      toast({
        title: 'Erfolg',
        description: `DoP ${dop.dop_number} wurde erstellt`,
      })
      
      // Navigate to DoP details
      router.push(`/en13813/dops/${dop.id}`)
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message || 'DoP konnte nicht generiert werden',
        variant: 'destructive'
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Link 
          href="/en13813/dops" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Neue Leistungserklärung (DoP)</h1>
          <p className="text-muted-foreground mt-1">
            Generieren Sie eine CE-konforme Leistungserklärung nach EN 13813
          </p>
        </div>

        {recipes.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Keine aktiven und validierten Rezepturen gefunden. 
              Bitte erstellen und validieren Sie zuerst eine Rezeptur.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="recipe" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recipe">
                <FileText className="mr-2 h-4 w-4" />
                Rezeptur
              </TabsTrigger>
              <TabsTrigger value="batch" disabled={!selectedRecipe}>
                <Package className="mr-2 h-4 w-4" />
                Charge (Optional)
              </TabsTrigger>
              <TabsTrigger value="tests" disabled={!selectedRecipe}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Prüfberichte
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recipe" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rezeptur auswählen</CardTitle>
                  <CardDescription>
                    Wählen Sie die Rezeptur für die Leistungserklärung
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Rezeptur *</Label>
                    <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rezeptur wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{recipe.recipe_code}</Badge>
                              <span>{recipe.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {recipeDetails && (
                    <Alert>
                      <AlertDescription>
                        <div className="space-y-2">
                          <div><strong>Code:</strong> {recipeDetails.recipe_code}</div>
                          <div><strong>Typ:</strong> {recipeDetails.estrich_type}</div>
                          <div><strong>Druckfestigkeit:</strong> {recipeDetails.compressive_strength}</div>
                          <div><strong>Biegezugfestigkeit:</strong> {recipeDetails.flexural_strength}</div>
                          {recipeDetails.wear_resistance && (
                            <div><strong>Verschleißwiderstand:</strong> {recipeDetails.wear_resistance}</div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Charge (Optional)</CardTitle>
                  <CardDescription>
                    Verknüpfen Sie die DoP mit einer spezifischen Produktionscharge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>Charge</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Keine Charge ausgewählt" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keine Charge</SelectItem>
                        {batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.batch_number} - {new Date(batch.production_date).toLocaleDateString('de-DE')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {batches.length === 0 && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Keine Chargen für diese Rezeptur gefunden. 
                        Die DoP kann auch ohne Charge erstellt werden.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prüfberichte</CardTitle>
                  <CardDescription>
                    Wählen Sie die relevanten Prüfberichte für die DoP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {testReports.length > 0 ? (
                    <div className="space-y-2">
                      {testReports.map((report) => (
                        <div key={report.id} className="flex items-center space-x-2 p-2 border rounded">
                          <input
                            type="checkbox"
                            id={report.id}
                            checked={selectedTestReports.includes(report.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTestReports([...selectedTestReports, report.id])
                              } else {
                                setSelectedTestReports(selectedTestReports.filter(id => id !== report.id))
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <label htmlFor={report.id} className="flex-1 cursor-pointer">
                            <div className="font-medium">{report.report_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {report.testing_institute} - {new Date(report.test_date).toLocaleDateString('de-DE')}
                            </div>
                            {report.valid_until && (
                              <div className="text-sm">
                                Gültig bis: {new Date(report.valid_until).toLocaleDateString('de-DE')}
                              </div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Keine gültigen Prüfberichte für diese Rezeptur gefunden.
                        Bitte laden Sie zuerst einen Prüfbericht hoch.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Language Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sprache</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={(v) => setLanguage(v as 'de' | 'en')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/en13813/dops')}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleGenerateDoP}
            disabled={!selectedRecipe || generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generiere DoP...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                DoP Generieren
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}