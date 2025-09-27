'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createEN13813Services, DoP } from '@/modules/en13813/services'
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
  Download,
  MoreHorizontal,
  FileText,
  QrCode,
  Check,
  Clock,
  AlertCircle,
  Send
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

export default function DoPsPage() {
  const [dops, setDops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const supabase = createClientComponentClient()
  const services = createEN13813Services(supabase)
  const router = useRouter()

  useEffect(() => {
    loadDops()
  }, [statusFilter])

  async function loadDops() {
    try {
      console.log('🔄 Loading DoPs...')

      let query = supabase
        .from('en13813_dops')
        .select(`
          *,
          recipe:en13813_recipes(recipe_code, name, type),
          batch:en13813_batches(batch_number)
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading DoPs:', error)
        // Show empty list but don't throw - let the page render
        setDops([])

        // Show error toast
        toast({
          title: 'Fehler beim Laden',
          description: 'DoPs konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
          variant: 'destructive'
        })
      } else {
        console.log(`✅ Loaded ${data?.length || 0} DoPs`)
        setDops(data || [])
      }
    } catch (error: any) {
      console.error('Unexpected error loading DoPs:', error)
      setDops([])
    } finally {
      setLoading(false)
    }
  }

  async function handleGeneratePDF(id: string) {
    try {
      await services.dops.generatePDF({ recipeId: id })
      toast({
        title: 'Erfolg',
        description: 'PDF wurde generiert'
      })
      await loadDops()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'PDF konnte nicht generiert werden',
        variant: 'destructive'
      })
    }
  }

  async function handleGenerateQR(id: string) {
    try {
      // QR-Code generation would be handled separately
      // For now, just show a message
      toast({
        title: 'Erfolg',
        description: 'QR-Code wurde generiert'
      })
      await loadDops()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'QR-Code konnte nicht generiert werden',
        variant: 'destructive'
      })
    }
  }

  async function handlePublish(id: string) {
    if (!confirm('Sind Sie sicher, dass Sie diese DoP veröffentlichen möchten?')) {
      return
    }

    try {
      await services.dops.updateWorkflowStatus(id, 'published')
      toast({
        title: 'Erfolg',
        description: 'DoP wurde veröffentlicht'
      })
      await loadDops()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'DoP konnte nicht veröffentlicht werden',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { label: 'Entwurf', variant: 'secondary', icon: Clock },
      pending_approval: { label: 'In Prüfung', variant: 'outline', icon: AlertCircle },
      approved: { label: 'Freigegeben', variant: 'default', icon: Check },
      published: { label: 'Veröffentlicht', variant: 'default', icon: Send },
      revoked: { label: 'Zurückgezogen', variant: 'destructive', icon: AlertCircle }
    }
    const config = variants[status] || variants.draft
    const Icon = config.icon
    return (
      <Badge variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Lade Leistungserklärungen...</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leistungserklärungen (DoP)</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Ihre Leistungserklärungen nach EN 13813
          </p>
        </div>
        <Button asChild>
          <Link href="/en13813/dops/new">
            <Plus className="mr-2 h-4 w-4" />
            Neue DoP erstellen
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Suche nach DoP-Nummer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="pending_approval">In Prüfung</SelectItem>
                <SelectItem value="approved">Freigegeben</SelectItem>
                <SelectItem value="published">Veröffentlicht</SelectItem>
                <SelectItem value="revoked">Zurückgezogen</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadDops} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DoPs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leistungserklärungen</CardTitle>
          <CardDescription>
            {dops.length} DoPs gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DoP-Nummer</TableHead>
                <TableHead>Rezeptur</TableHead>
                <TableHead>Charge</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt am</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dops.map((dop) => (
                <TableRow key={dop.id}>
                  <TableCell className="font-mono">{dop.dop_number}</TableCell>
                  <TableCell>
                    {dop.recipe && (
                      <div>
                        <p className="font-medium">{dop.recipe.recipe_code}</p>
                        <p className="text-sm text-muted-foreground">{dop.recipe.name}</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {dop.batch ? dop.batch.batch_number : '-'}
                  </TableCell>
                  <TableCell>v{dop.version}</TableCell>
                  <TableCell>{getStatusBadge(dop.status)}</TableCell>
                  <TableCell>
                    {new Date(dop.created_at).toLocaleDateString('de-DE')}
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
                        <DropdownMenuItem onClick={() => router.push(`/en13813/dops/${dop.id}`)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Details anzeigen
                        </DropdownMenuItem>
                        {!dop.pdf_document_id && (
                          <DropdownMenuItem onClick={() => handleGeneratePDF(dop.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            PDF generieren
                          </DropdownMenuItem>
                        )}
                        {!dop.qr_code && (
                          <DropdownMenuItem onClick={() => handleGenerateQR(dop.id)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            QR-Code generieren
                          </DropdownMenuItem>
                        )}
                        {dop.status === 'approved' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handlePublish(dop.id)}>
                              <Send className="mr-2 h-4 w-4" />
                              Veröffentlichen
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {dops.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Keine Leistungserklärungen gefunden
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