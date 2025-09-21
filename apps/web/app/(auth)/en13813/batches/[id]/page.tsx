'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, CheckCircle2, XCircle, AlertTriangle, Download, Printer, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

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
    temperature?: number
    humidity?: number
    w_c_ratio?: number
    air_content?: number
    setting_time_initial?: number
    setting_time_final?: number
    test_date?: string
    tested_by?: string
  }
  deviation_notes?: string
  created_at: string
  updated_at: string
  recipe?: {
    name: string
    recipe_code: string
    compressive_strength_class: string
    flexural_strength_class: string
  }
}

interface ValidationResult {
  valid: boolean
  issues: string[]
}

export default function BatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  
  const [qcData, setQcData] = useState<Batch['qc_data']>({})

  useEffect(() => {
    loadBatch()
  }, [params.id])

  const loadBatch = async () => {
    try {
      const { data, error } = await supabase
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
        .eq('id', params.id)
        .single()

      if (error) throw error
      
      setBatch(data)
      setQcData(data.qc_data || {})
      validateBatch(data)
    } catch (error) {
      console.error('Error loading batch:', error)
      toast({
        title: 'Fehler',
        description: 'Charge konnte nicht geladen werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const validateBatch = (batchData: Batch) => {
    const issues: string[] = []
    
    if (batchData.recipe) {
      // Extract minimum values from strength classes
      const minCompressive = parseInt(batchData.recipe.compressive_strength_class.replace('C', ''))
      const minFlexural = parseInt(batchData.recipe.flexural_strength_class.replace('F', ''))

      // Check compressive strength
      if (batchData.qc_data.compressive_strength_28d !== undefined) {
        if (batchData.qc_data.compressive_strength_28d < minCompressive) {
          issues.push(`Druckfestigkeit (${batchData.qc_data.compressive_strength_28d} N/mm²) unter Mindestanforderung (${minCompressive} N/mm²)`)
        }
      } else if (batchData.status === 'released') {
        issues.push('Druckfestigkeitsprüfung für Freigabe erforderlich')
      }

      // Check flexural strength  
      if (batchData.qc_data.flexural_strength_28d !== undefined) {
        if (batchData.qc_data.flexural_strength_28d < minFlexural) {
          issues.push(`Biegezugfestigkeit (${batchData.qc_data.flexural_strength_28d} N/mm²) unter Mindestanforderung (${minFlexural} N/mm²)`)
        }
      } else if (batchData.status === 'released') {
        issues.push('Biegezugfestigkeitsprüfung für Freigabe erforderlich')
      }
    }

    setValidation({
      valid: issues.length === 0,
      issues
    })
  }

  const updateQCData = async () => {
    if (!batch) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('en13813_batches')
        .update({
          qc_data: {
            ...qcData,
            test_date: new Date().toISOString()
          }
        })
        .eq('id', batch.id)

      if (error) throw error

      toast({
        title: 'Erfolg',
        description: 'QC-Daten wurden aktualisiert'
      })

      await loadBatch()
      setEditing(false)
    } catch (error) {
      console.error('Error updating QC data:', error)
      toast({
        title: 'Fehler',
        description: 'QC-Daten konnten nicht aktualisiert werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const releaseBatch = async () => {
    if (!batch || !validation?.valid) return
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('en13813_batches')
        .update({
          status: 'released',
          updated_by: user?.email
        })
        .eq('id', batch.id)

      if (error) throw error

      toast({
        title: 'Erfolg',
        description: 'Charge wurde freigegeben'
      })

      await loadBatch()
      setShowReleaseDialog(false)
    } catch (error) {
      console.error('Error releasing batch:', error)
      toast({
        title: 'Fehler',
        description: 'Charge konnte nicht freigegeben werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const blockBatch = async () => {
    if (!batch || !blockReason) return
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('en13813_batches')
        .update({
          status: 'blocked',
          deviation_notes: blockReason,
          updated_by: user?.email
        })
        .eq('id', batch.id)

      if (error) throw error

      toast({
        title: 'Erfolg',
        description: 'Charge wurde gesperrt'
      })

      await loadBatch()
      setShowBlockDialog(false)
      setBlockReason('')
    } catch (error) {
      console.error('Error blocking batch:', error)
      toast({
        title: 'Fehler',
        description: 'Charge konnte nicht gesperrt werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Batch['status']) => {
    switch (status) {
      case 'produced':
        return <AlertTriangle className="w-4 h-4" />
      case 'released':
        return <CheckCircle2 className="w-4 h-4" />
      case 'blocked':
        return <XCircle className="w-4 h-4" />
      default:
        return null
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

  const exportBatchReport = () => {
    if (!batch) return
    
    const report = `
CHARGENPROTOKOLL
================

Chargennummer: ${batch.batch_number}
Rezept: ${batch.recipe?.name} (${batch.recipe?.recipe_code})
Produktionsdatum: ${format(new Date(batch.production_date), 'dd.MM.yyyy HH:mm')}
Status: ${getStatusLabel(batch.status)}

QUALITÄTSKONTROLLE
------------------
Druckfestigkeit (28d): ${batch.qc_data.compressive_strength_28d || '-'} N/mm²
Biegezugfestigkeit (28d): ${batch.qc_data.flexural_strength_28d || '-'} N/mm²
Fließmaß: ${batch.qc_data.flow_diameter || '-'} mm
Dichte: ${batch.qc_data.density || '-'} kg/m³
W/Z-Wert: ${batch.qc_data.w_c_ratio || '-'}

Prüfdatum: ${batch.qc_data.test_date ? format(new Date(batch.qc_data.test_date), 'dd.MM.yyyy') : '-'}
Geprüft von: ${batch.qc_data.tested_by || '-'}

VALIDIERUNG
-----------
${validation?.valid ? 'Alle Anforderungen erfüllt' : validation?.issues.join('\n')}
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `charge_${batch.batch_number}.txt`
    a.click()
  }

  if (loading || !batch) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/en13813/batches">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Charge {batch.batch_number}</h1>
            <p className="text-muted-foreground">
              {batch.recipe?.name} • Produziert am {format(new Date(batch.production_date), 'dd.MM.yyyy', { locale: de })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={exportBatchReport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {validation && !validation.valid && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Validierungsprobleme</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2">
              {validation.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Grunddaten</CardTitle>
                  <CardDescription>Allgemeine Informationen zur Charge</CardDescription>
                </div>
                <Badge variant={getStatusColor(batch.status) as any} className="gap-1">
                  {getStatusIcon(batch.status)}
                  {getStatusLabel(batch.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Chargennummer</Label>
                  <p className="font-medium">{batch.batch_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rezept</Label>
                  <p className="font-medium">{batch.recipe?.name}</p>
                  <p className="text-sm text-muted-foreground">{batch.recipe?.recipe_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Produktionsdatum</Label>
                  <p className="font-medium">
                    {format(new Date(batch.production_date), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Menge</Label>
                  <p className="font-medium">{batch.quantity_tons ? `${batch.quantity_tons} t` : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Produktionsstandort</Label>
                  <p className="font-medium">{batch.production_site || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Anforderungen</Label>
                  <p className="font-medium">
                    {batch.recipe?.compressive_strength_class} / {batch.recipe?.flexural_strength_class}
                  </p>
                </div>
              </div>

              {batch.deviation_notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">Abweichungen / Notizen</Label>
                    <p className="mt-2 p-3 bg-muted rounded-md">{batch.deviation_notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Qualitätskontrolle</CardTitle>
                  <CardDescription>Prüfergebnisse und Messwerte</CardDescription>
                </div>
                {!editing && batch.status === 'produced' && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="strength" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="strength">Festigkeiten</TabsTrigger>
                  <TabsTrigger value="fresh">Frischbeton</TabsTrigger>
                  <TabsTrigger value="conditions">Prüfbedingungen</TabsTrigger>
                </TabsList>

                <TabsContent value="strength" className="space-y-4">
                  {editing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Druckfestigkeit 28d (N/mm²)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={qcData.compressive_strength_28d || ''}
                          onChange={(e) => setQcData(prev => ({
                            ...prev,
                            compressive_strength_28d: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Biegezugfestigkeit 28d (N/mm²)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={qcData.flexural_strength_28d || ''}
                          onChange={(e) => setQcData(prev => ({
                            ...prev,
                            flexural_strength_28d: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Druckfestigkeit (28 Tage)</Label>
                        <p className="font-medium text-lg">
                          {batch.qc_data.compressive_strength_28d ? 
                            `${batch.qc_data.compressive_strength_28d} N/mm²` : 
                            'Nicht geprüft'}
                        </p>
                        {batch.recipe && (
                          <p className="text-sm text-muted-foreground">
                            Anforderung: ≥ {parseInt(batch.recipe.compressive_strength_class.replace('C', ''))} N/mm²
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Biegezugfestigkeit (28 Tage)</Label>
                        <p className="font-medium text-lg">
                          {batch.qc_data.flexural_strength_28d ? 
                            `${batch.qc_data.flexural_strength_28d} N/mm²` : 
                            'Nicht geprüft'}
                        </p>
                        {batch.recipe && (
                          <p className="text-sm text-muted-foreground">
                            Anforderung: ≥ {parseInt(batch.recipe.flexural_strength_class.replace('F', ''))} N/mm²
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="fresh" className="space-y-4">
                  {editing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fließmaß (mm)</Label>
                        <Input
                          type="number"
                          value={qcData.flow_diameter || ''}
                          onChange={(e) => setQcData(prev => ({
                            ...prev,
                            flow_diameter: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dichte (kg/m³)</Label>
                        <Input
                          type="number"
                          value={qcData.density || ''}
                          onChange={(e) => setQcData(prev => ({
                            ...prev,
                            density: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>W/Z-Wert</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={qcData.w_c_ratio || ''}
                          onChange={(e) => setQcData(prev => ({
                            ...prev,
                            w_c_ratio: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Luftgehalt (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={qcData.air_content || ''}
                          onChange={(e) => setQcData(prev => ({
                            ...prev,
                            air_content: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Fließmaß</Label>
                        <p className="font-medium">{batch.qc_data.flow_diameter ? `${batch.qc_data.flow_diameter} mm` : '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Dichte</Label>
                        <p className="font-medium">{batch.qc_data.density ? `${batch.qc_data.density} kg/m³` : '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">W/Z-Wert</Label>
                        <p className="font-medium">{batch.qc_data.w_c_ratio || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Luftgehalt</Label>
                        <p className="font-medium">{batch.qc_data.air_content ? `${batch.qc_data.air_content}%` : '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Erstarrungsbeginn</Label>
                        <p className="font-medium">{batch.qc_data.setting_time_initial ? `${batch.qc_data.setting_time_initial} min` : '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Erstarrungsende</Label>
                        <p className="font-medium">{batch.qc_data.setting_time_final ? `${batch.qc_data.setting_time_final} min` : '-'}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="conditions" className="space-y-4">
                  {editing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Temperatur (°C)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={qcData.temperature || ''}
                          onChange={(e) => setQcData(prev => ({
                            ...prev,
                            temperature: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Luftfeuchtigkeit (%)</Label>
                        <Input
                          type="number"
                          value={qcData.humidity || ''}
                          onChange={(e) => setQcData(prev => ({
                            ...prev,
                            humidity: e.target.value ? parseFloat(e.target.value) : undefined
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Geprüft von</Label>
                        <Input
                          value={qcData.tested_by || ''}
                          onChange={(e) => setQcData(prev => ({
                            ...prev,
                            tested_by: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Temperatur</Label>
                        <p className="font-medium">{batch.qc_data.temperature ? `${batch.qc_data.temperature}°C` : '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Luftfeuchtigkeit</Label>
                        <p className="font-medium">{batch.qc_data.humidity ? `${batch.qc_data.humidity}%` : '-'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Prüfdatum</Label>
                        <p className="font-medium">
                          {batch.qc_data.test_date ? 
                            format(new Date(batch.qc_data.test_date), 'dd.MM.yyyy') : 
                            '-'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Geprüft von</Label>
                        <p className="font-medium">{batch.qc_data.tested_by || '-'}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {editing && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => {
                    setEditing(false)
                    setQcData(batch.qc_data)
                  }}>
                    Abbrechen
                  </Button>
                  <Button onClick={updateQCData} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    Speichern
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktionen</CardTitle>
              <CardDescription>Chargenstatus verwalten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {batch.status === 'produced' && (
                <>
                  <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant={validation?.valid ? "default" : "secondary"}
                        disabled={!validation?.valid}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Charge freigeben
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Charge freigeben</DialogTitle>
                        <DialogDescription>
                          Sind Sie sicher, dass Sie diese Charge freigeben möchten?
                          {validation?.valid && (
                            <Alert className="mt-4" variant="default">
                              <CheckCircle2 className="h-4 w-4" />
                              <AlertDescription>
                                Alle Qualitätsanforderungen sind erfüllt.
                              </AlertDescription>
                            </Alert>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
                          Abbrechen
                        </Button>
                        <Button onClick={releaseBatch} disabled={loading}>
                          Freigeben
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Charge sperren
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Charge sperren</DialogTitle>
                        <DialogDescription>
                          Geben Sie einen Grund für die Sperrung an.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="reason">Sperrgrund *</Label>
                          <Textarea
                            id="reason"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Grund für die Sperrung..."
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                          Abbrechen
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={blockBatch} 
                          disabled={loading || !blockReason}
                        >
                          Sperren
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {batch.status === 'blocked' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Charge gesperrt</AlertTitle>
                  <AlertDescription>{batch.deviation_notes}</AlertDescription>
                </Alert>
              )}

              {batch.status === 'released' && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Charge freigegeben</AlertTitle>
                  <AlertDescription>
                    Diese Charge wurde freigegeben und kann verwendet werden.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Erstellt</p>
                  <p>{format(new Date(batch.created_at), 'dd.MM.yyyy HH:mm')}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground">Zuletzt geändert</p>
                  <p>{format(new Date(batch.updated_at), 'dd.MM.yyyy HH:mm')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}