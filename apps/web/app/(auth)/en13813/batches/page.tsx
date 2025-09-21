'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Download, TrendingUp, Package, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import BatchStatistics from '@/components/en13813/BatchStatistics'
import QCDashboard from '@/components/en13813/QCDashboard'

interface Batch {
  id: string
  recipe_id: string
  batch_number: string
  production_date: string
  quantity_tons?: number
  production_site?: string
  status: 'produced' | 'released' | 'blocked' | 'consumed'
  qc_data: {
    compressive_strength_28d?: number
    flexural_strength_28d?: number
    flow_diameter?: number
    density?: number
    test_date?: string
  }
  deviation_notes?: string
  created_at: string
  recipe?: {
    name: string
    recipe_code: string
    compressive_strength_class: string
    flexural_strength_class: string
  }
}

interface BatchStatistics {
  total_batches: number
  total_quantity: number
  by_status: Record<string, number>
  average_strength: {
    compressive: number
    flexural: number
  }
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [statistics, setStatistics] = useState<BatchStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    loadBatches()
    loadStatistics()
  }, [statusFilter, dateRange])

  const loadBatches = async () => {
    try {
      let query = supabase
        .from('en13813_batches')
        .select(`
          *,
          recipe:en13813_recipes(
            name,
            recipe_code,
            compressive_strength_class,
            flexural_strength_class
          )
        `)
        .order('production_date', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (dateRange.start) {
        query = query.gte('production_date', dateRange.start)
      }

      if (dateRange.end) {
        query = query.lte('production_date', dateRange.end)
      }

      const { data, error } = await query

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error('Error loading batches:', error)
      toast({
        title: 'Fehler beim Laden',
        description: 'Chargen konnten nicht geladen werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('en13813_batches')
        .select('*')

      if (error) throw error

      if (data) {
        const stats: BatchStatistics = {
          total_batches: data.length,
          total_quantity: data.reduce((sum, b) => sum + (b.quantity_tons || 0), 0),
          by_status: {},
          average_strength: { compressive: 0, flexural: 0 }
        }

        let strengthCount = 0
        data.forEach(batch => {
          stats.by_status[batch.status] = (stats.by_status[batch.status] || 0) + 1
          
          if (batch.qc_data?.compressive_strength_28d) {
            stats.average_strength.compressive += batch.qc_data.compressive_strength_28d
            strengthCount++
          }
          if (batch.qc_data?.flexural_strength_28d) {
            stats.average_strength.flexural += batch.qc_data.flexural_strength_28d
          }
        })

        if (strengthCount > 0) {
          stats.average_strength.compressive /= strengthCount
          stats.average_strength.flexural /= strengthCount
        }

        setStatistics(stats)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  const getStatusIcon = (status: Batch['status']) => {
    switch (status) {
      case 'produced':
        return <Clock className="w-4 h-4" />
      case 'released':
        return <CheckCircle2 className="w-4 h-4" />
      case 'blocked':
        return <XCircle className="w-4 h-4" />
      case 'consumed':
        return <Package className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Batch['status']) => {
    switch (status) {
      case 'produced':
        return 'default'
      case 'released':
        return 'success'
      case 'blocked':
        return 'destructive'
      case 'consumed':
        return 'secondary'
    }
  }

  const getStatusLabel = (status: Batch['status']) => {
    switch (status) {
      case 'produced':
        return 'Produziert'
      case 'released':
        return 'Freigegeben'
      case 'blocked':
        return 'Gesperrt'
      case 'consumed':
        return 'Verbraucht'
    }
  }

  const filteredBatches = batches.filter(batch =>
    batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.recipe?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.recipe?.recipe_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportBatches = () => {
    const csv = [
      ['Chargennummer', 'Rezept', 'Produktionsdatum', 'Menge (t)', 'Status', 'Druckfestigkeit', 'Biegezugfestigkeit'],
      ...filteredBatches.map(batch => [
        batch.batch_number,
        batch.recipe?.name || '',
        format(new Date(batch.production_date), 'dd.MM.yyyy'),
        batch.quantity_tons?.toString() || '',
        getStatusLabel(batch.status),
        batch.qc_data.compressive_strength_28d?.toString() || '',
        batch.qc_data.flexural_strength_28d?.toString() || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chargen_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Chargenverwaltung</h1>
          <p className="text-muted-foreground">Produktionschargen überwachen und verwalten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportBatches}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/en13813/batches/new">
              <Plus className="mr-2 h-4 w-4" />
              Neue Charge
            </Link>
          </Button>
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Gesamt Chargen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_batches}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.total_quantity.toFixed(1)} Tonnen gesamt
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Freigegeben</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.by_status.released || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {((statistics.by_status.released || 0) / statistics.total_batches * 100).toFixed(0)}% der Chargen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ø Druckfestigkeit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.average_strength.compressive.toFixed(1)} N/mm²
              </div>
              <p className="text-xs text-muted-foreground">28 Tage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ø Biegezugfestigkeit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.average_strength.flexural.toFixed(1)} N/mm²
              </div>
              <p className="text-xs text-muted-foreground">28 Tage</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Chargenliste</TabsTrigger>
          <TabsTrigger value="analytics">Analysen</TabsTrigger>
          <TabsTrigger value="qc">Qualitätskontrolle</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Chargenübersicht</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Suche..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="produced">Produziert</SelectItem>
                      <SelectItem value="released">Freigegeben</SelectItem>
                      <SelectItem value="blocked">Gesperrt</SelectItem>
                      <SelectItem value="consumed">Verbraucht</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chargennummer</TableHead>
                    <TableHead>Rezept</TableHead>
                    <TableHead>Produktionsdatum</TableHead>
                    <TableHead>Menge</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>QC-Daten</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batch_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{batch.recipe?.name}</div>
                          <div className="text-sm text-muted-foreground">{batch.recipe?.recipe_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(batch.production_date), 'dd.MM.yyyy', { locale: de })}
                      </TableCell>
                      <TableCell>{batch.quantity_tons ? `${batch.quantity_tons} t` : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(batch.status) as any} className="gap-1">
                          {getStatusIcon(batch.status)}
                          {getStatusLabel(batch.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {batch.qc_data.compressive_strength_28d ? (
                          <div className="text-sm">
                            <div>C: {batch.qc_data.compressive_strength_28d} N/mm²</div>
                            <div>F: {batch.qc_data.flexural_strength_28d} N/mm²</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Ausstehend</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/en13813/batches/${batch.id}`}>Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <BatchStatistics />
        </TabsContent>

        <TabsContent value="qc">
          <QCDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}