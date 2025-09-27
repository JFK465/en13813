'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createEN13813Services, Recipe } from '@/modules/en13813/services'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
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
  
  const supabase = createClientComponentClient()
  const services = createEN13813Services(supabase)
  const router = useRouter()

  useEffect(() => {
    loadRecipes()
  }, [typeFilter, statusFilter])

  async function loadRecipes() {
    try {
      const filter: any = {}
      if (typeFilter !== 'all') filter.type = typeFilter
      if (statusFilter !== 'all') filter.status = statusFilter
      if (searchTerm) filter.search = searchTerm

      const result = await queryWithTimeout(
        services.recipes.list(filter),
        10000
      )
      setRecipes(result || [])
    } catch (error: any) {
      console.error('Error loading recipes:', error)
      setRecipes([]) // Show empty list on error
      toast({
        title: 'Fehler beim Laden',
        description: error?.message || 'Rezepturen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

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

  if (loading && recipes.length === 0) {
    return <div className="flex items-center justify-center h-96">Lade Rezepturen...</div>
  }

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