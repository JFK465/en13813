'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createEN13813Services, Recipe } from '@/modules/en13813/services'
import type { RecipeDraft } from '@/modules/en13813/services/recipe-draft.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Copy,
  Trash,
  FileText,
  FlaskConical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [localDraft, setLocalDraft] = useState<any>(null)
  const [cloudDrafts, setCloudDrafts] = useState<any[]>([])
  const [hasInitialized, setHasInitialized] = useState(false)

  // Use refs to access current filter values without causing re-renders
  const filterRefs = useRef({
    typeFilter: 'all',
    statusFilter: 'all',
    searchTerm: ''
  })

  // Update refs when state changes
  useEffect(() => {
    filterRefs.current.typeFilter = typeFilter
    filterRefs.current.statusFilter = statusFilter
    filterRefs.current.searchTerm = searchTerm
  }, [typeFilter, statusFilter, searchTerm])

  const supabase = createClientComponentClient()
  const services = createEN13813Services(supabase)
  const router = useRouter()

  // Lade lokale Entwürfe aus LocalStorage
  const loadLocalDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem('en13813-recipe-draft-new')
      if (saved) {
        const draft = JSON.parse(saved)
        setLocalDraft(draft)
      }
    } catch (error) {
      console.error('Failed to load local draft:', error)
    }
  }, [])

  // Lade Entwürfe aus der Cloud (Supabase)
  const loadCloudDrafts = useCallback(async () => {
    try {
      console.log('📥 Loading cloud drafts...')
      // Super kurzes Timeout - wir wollen nicht warten!
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Draft load timeout')), 1000) // Nur 1 Sekunde!
      )
      const draftsPromise = services.drafts.list()
      const drafts = await Promise.race([draftsPromise, timeoutPromise]).catch(() => [])
      console.log('☁️ Found', (drafts as RecipeDraft[]).length, 'cloud drafts')
      setCloudDrafts(drafts as RecipeDraft[])
    } catch (error) {
      console.log('Drafts not loaded (working offline)')
      setCloudDrafts([])
    }
  }, [services])

  const loadRecipes = useCallback(async () => {
    console.log('🔍 loadRecipes called - starting to load recipes...')

    try {
      const filter: any = {}
      // Use refs to get current filter values
      if (filterRefs.current.typeFilter !== 'all') filter.type = filterRefs.current.typeFilter
      if (filterRefs.current.statusFilter !== 'all') filter.status = filterRefs.current.statusFilter
      if (filterRefs.current.searchTerm) filter.search = filterRefs.current.searchTerm

      console.log('📤 Calling services.recipes.list with filter:', filter)

      // Sehr kurzes Timeout - wir zeigen lieber eine leere Liste als zu warten!
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 2000) // Nur 2 Sekunden!
      )

      const loadPromise = services.recipes.list(filter)

      const result = await Promise.race([loadPromise, timeoutPromise]).catch((error) => {
        console.log('⚠️ Using empty array (timeout or error)')
        return [] as Recipe[] // Sofort leere Liste zeigen
      }) as Recipe[]

      console.log('📥 Received recipes:', result?.length || 0, 'items')
      setRecipes(result || [])

      // Don't show error toast if it's just empty results
      if (result === null || result === undefined) {
        console.log('ℹ️ No recipes found or service unavailable')
      }
    } catch (error: any) {
      console.error('❌ Unexpected error loading recipes:', error)
      setRecipes([]) // Show empty list on error
      // Only show toast for real errors, not for auth issues
      if (!error.message?.includes('auth') && !error.message?.includes('timeout')) {
        toast({
          title: 'Hinweis',
          description: 'Rezepturen konnten nicht geladen werden. Die Liste ist möglicherweise leer.',
          variant: 'default' // Use default instead of destructive for less alarming message
        })
      }
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }, []) // Remove dependencies to make function stable

  // Initial load - parallel und non-blocking
  useEffect(() => {
    console.log('🚀 RecipesPage initializing...')
    loadLocalDraft()
    // Keine Verzögerung - lade sofort!
    loadCloudDrafts()
    loadRecipes()
    // Setze loading sofort auf false
    setLoading(false)
  }, []) // Only run once on mount

  // Load recipes when filters change (but not on initial mount)
  useEffect(() => {
    if (hasInitialized) {
      console.log('🔄 Filter changed, reloading recipes...')
      loadRecipes()
    } else {
      setHasInitialized(true)
    }
  }, [typeFilter, statusFilter]) // Only depend on actual filter values

  async function handleSearch() {
    setLoading(true)
    await loadRecipes()
  }

  async function handleDelete(id: string) {
    if (!confirm('Sind Sie sicher, dass Sie diese Rezeptur löschen möchten?')) {
      return
    }

    try {
      await services.recipes.delete(id)
      toast({
        title: 'Erfolg',
        description: 'Rezeptur wurde gelöscht'
      })
      await loadRecipes()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Rezeptur konnte nicht gelöscht werden',
        variant: 'destructive'
      })
    }
  }

  async function handleClone(recipe: Recipe) {
    const newCode = prompt('Bitte geben Sie einen neuen Rezeptur-Code ein:', `${recipe.recipe_code}-KOPIE`)
    if (!newCode) return

    try {
      // Clone recipe by creating a copy
      const newRecipe = { ...recipe, recipe_code: newCode, id: undefined }
      await services.recipes.create(newRecipe)
      toast({
        title: 'Erfolg',
        description: 'Rezeptur wurde kopiert'
      })
      await loadRecipes()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Rezeptur konnte nicht kopiert werden',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: { label: 'Aktiv', variant: 'default' },
      draft: { label: 'Entwurf', variant: 'secondary' },
      archived: { label: 'Archiviert', variant: 'outline' }
    }
    const config = variants[status] || variants.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      CT: 'Zementestrich',
      CA: 'Calciumsulfatestrich',
      MA: 'Magnesiaestrich',
      SR: 'Kunstharzestrich',
      AS: 'Gussasphaltestrich'
    }
    return <Badge variant="outline">{types[type] || type}</Badge>
  }

  // Zeige die Seite sofort, auch während des Ladens
  // Kein Warten auf "Lade Rezepturen..."

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rezeptur-Verwaltung</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Ihre Estrichmörtel-Rezepturen nach EN 13813
          </p>
        </div>
        <Button asChild>
          <Link href="/en13813/recipes/new">
            <Plus className="mr-2 h-4 w-4" />
            Neue Rezeptur
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Suche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Suche nach Code oder Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Typen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="CT">Zementestrich</SelectItem>
                <SelectItem value="CA">Calciumsulfatestrich</SelectItem>
                <SelectItem value="MA">Magnesiaestrich</SelectItem>
                <SelectItem value="SR">Kunstharzestrich</SelectItem>
                <SelectItem value="AS">Gussasphaltestrich</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="archived">Archiviert</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cloud Drafts */}
      {cloudDrafts.length > 0 && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              ☁️ Cloud-Entwürfe
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              {cloudDrafts.length} {cloudDrafts.length === 1 ? 'Entwurf' : 'Entwürfe'} in der Cloud gespeichert
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cloudDrafts.map((draft) => (
                <div key={draft.id} className="p-3 border rounded-lg bg-white dark:bg-gray-900">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{draft.draft_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Code: {draft.draft_data?.recipe_code || 'Nicht vergeben'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Typ: {draft.draft_data?.binder_type || 'Nicht definiert'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Aktualisiert: {new Date(draft.updated_at).toLocaleString('de-DE')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Verwende draft_name als eindeutigen Identifier
                          router.push(`/en13813/recipes/new?draft=${encodeURIComponent(draft.draft_name)}`)
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (confirm('Sind Sie sicher, dass Sie diesen Entwurf löschen möchten?')) {
                            const deleted = await services.drafts.delete(draft.draft_name)
                            if (deleted) {
                              toast({
                                title: 'Entwurf gelöscht',
                                description: 'Der Cloud-Entwurf wurde entfernt.'
                              })
                              loadCloudDrafts() // Reload drafts
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local Draft Alert (Legacy) */}
      {localDraft && localDraft.data && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200">
              Lokaler Entwurf vorhanden
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Zuletzt gespeichert: {new Date(localDraft.savedAt).toLocaleString('de-DE')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {localDraft.data.name || 'Ohne Namen'}
              </div>
              <div>
                <strong>Code:</strong> {localDraft.data.recipe_code || 'Noch nicht vergeben'}
              </div>
              <div>
                <strong>Typ:</strong> {localDraft.data.binder_type || 'Nicht definiert'}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => router.push('/en13813/recipes/new')}
                  variant="default"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Entwurf fortsetzen
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Sind Sie sicher, dass Sie den lokalen Entwurf löschen möchten?')) {
                      localStorage.removeItem('en13813-recipe-draft-new')
                      setLocalDraft(null)
                      toast({
                        title: 'Entwurf gelöscht',
                        description: 'Der lokale Entwurf wurde entfernt.'
                      })
                    }
                  }}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Entwurf löschen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rezepturen</CardTitle>
          <CardDescription>
            {recipes.length} Rezepturen gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Festigkeitsklassen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt am</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-mono">{recipe.recipe_code}</TableCell>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell>{getTypeBadge((recipe as any).binder_type || (recipe as any).type || 'CT')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant="secondary">{(recipe as any).compressive_strength_class || (recipe as any).compressive_strength || 'C25'}</Badge>
                      <Badge variant="secondary">{(recipe as any).flexural_strength_class || (recipe as any).flexural_strength || 'F4'}</Badge>
                      {((recipe as any).wear_resistance_bohme_class || (recipe as any).wear_resistance_bca_class || (recipe as any).wear_resistance_rollrad_class) && (
                        <Badge variant="secondary">
                          {(recipe as any).wear_resistance_bohme_class || (recipe as any).wear_resistance_bca_class || (recipe as any).wear_resistance_rollrad_class}
                        </Badge>
                      )}
                      {(recipe as any).rwfc_class && (
                        <Badge variant="secondary">{(recipe as any).rwfc_class}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(recipe.status)}</TableCell>
                  <TableCell>
                    {new Date(recipe.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menü öffnen</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/en13813/recipes/${recipe.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleClone(recipe)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Kopieren
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/en13813/dops/new?recipe=${recipe.id}`)}>
                          <FileText className="mr-2 h-4 w-4" />
                          DoP erstellen
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(recipe.id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {recipes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Keine Rezepturen gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}