'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Send,
  QrCode,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'

export default function DoPDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [dop, setDop] = useState<any>(null)
  const [recipe, setRecipe] = useState<any>(null)
  const [batch, setBatch] = useState<any>(null)
  const [testReports, setTestReports] = useState<any[]>([])
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  
  useEffect(() => {
    loadDoPDetails()
  }, [params.id])

  async function loadDoPDetails() {
    try {
      // Load DoP
      const { data: dopData, error: dopError } = await supabase
        .from('en13813_dops')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (dopError || !dopData) {
        toast({
          title: 'Fehler',
          description: 'DoP konnte nicht geladen werden',
          variant: 'destructive'
        })
        router.push('/en13813/dops')
        return
      }
      
      setDop(dopData)
      
      // Load related recipe
      const { data: recipeData } = await supabase
        .from('en13813_recipes')
        .select('*')
        .eq('id', dopData.recipe_id)
        .single()
      
      setRecipe(recipeData)
      
      // Load batch if exists
      if (dopData.batch_id) {
        const { data: batchData } = await supabase
          .from('en13813_batches')
          .select('*')
          .eq('id', dopData.batch_id)
          .single()
        
        setBatch(batchData)
      }
      
      // Load test reports
      if (dopData.test_report_ids && dopData.test_report_ids.length > 0) {
        const { data: reportsData } = await supabase
          .from('en13813_test_reports')
          .select('*')
          .in('id', dopData.test_report_ids)
        
        setTestReports(reportsData || [])
      }
    } catch (error) {
      console.error('Error loading DoP details:', error)
      toast({
        title: 'Fehler',
        description: 'Daten konnten nicht geladen werden',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  async function handleDownloadPdf() {
    setDownloadingPdf(true)
    try {
      const response = await fetch(`/api/en13813/dops/${params.id}/pdf`)
      
      if (!response.ok) {
        throw new Error('PDF konnte nicht geladen werden')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DoP_${dop.dop_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: 'Erfolg',
        description: 'PDF wurde heruntergeladen',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'PDF konnte nicht heruntergeladen werden',
        variant: 'destructive'
      })
    } finally {
      setDownloadingPdf(false)
    }
  }
  
  async function handlePublish() {
    try {
      const { error } = await supabase
        .from('en13813_dops')
        .update({ 
          workflow_status: 'published',
          published_at: new Date().toISOString(),
          is_active: true
        })
        .eq('id', params.id)
      
      if (error) throw error
      
      toast({
        title: 'Erfolg',
        description: 'DoP wurde veröffentlicht',
      })
      
      loadDoPDetails()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'DoP konnte nicht veröffentlicht werden',
        variant: 'destructive'
      })
    }
  }
  
  function copyPublicUrl() {
    if (dop?.public_url) {
      navigator.clipboard.writeText(dop.public_url)
      toast({
        title: 'Kopiert',
        description: 'Öffentliche URL wurde in die Zwischenablage kopiert',
      })
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  if (!dop) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            DoP nicht gefunden
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  const statusColors = {
    draft: 'secondary',
    submitted: 'default',
    reviewed: 'default',
    approved: 'default',
    published: 'success',
    revoked: 'destructive'
  } as const
  
  return (
    <div className="container mx-auto py-6 max-w-6xl">
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
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Leistungserklärung {dop.dop_number}
              <Badge variant={statusColors[dop.workflow_status as keyof typeof statusColors] || 'default'}>
                {dop.workflow_status}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Version {dop.version} • Erstellt am {new Date(dop.created_at).toLocaleDateString('de-DE')}
            </p>
          </div>
          
          <div className="flex gap-2">
            {dop.workflow_status === 'draft' && (
              <Button onClick={handlePublish}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Veröffentlichen
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              PDF Download
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="performance">Leistung</TabsTrigger>
            <TabsTrigger value="documents">Dokumente</TabsTrigger>
            <TabsTrigger value="distribution">Verteilung</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recipe Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Rezeptur-Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Code:</span>
                    <p className="font-medium">{recipe?.recipe_code}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <p className="font-medium">{recipe?.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Typ:</span>
                    <p className="font-medium">{recipe?.estrich_type}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Batch Information */}
              {batch ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Chargen-Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Nummer:</span>
                      <p className="font-medium">{batch.batch_number}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Produktionsdatum:</span>
                      <p className="font-medium">
                        {new Date(batch.production_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Menge:</span>
                      <p className="font-medium">{batch.quantity_tons} t</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Workflow:</span>
                        <p className="font-medium">{dop.workflow_status}</p>
                      </div>
                      {dop.issue_date && (
                        <div>
                          <span className="text-sm text-muted-foreground">Ausstellungsdatum:</span>
                          <p className="font-medium">
                            {new Date(dop.issue_date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      )}
                      {dop.expiry_date && (
                        <div>
                          <span className="text-sm text-muted-foreground">Gültig bis:</span>
                          <p className="font-medium">
                            {new Date(dop.expiry_date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Public Access */}
            {dop.public_url && (
              <Card>
                <CardHeader>
                  <CardTitle>Öffentlicher Zugang</CardTitle>
                  <CardDescription>
                    Diese DoP kann über einen öffentlichen Link abgerufen werden
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={dop.public_url}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-muted"
                    />
                    <Button variant="outline" size="icon" onClick={copyPublicUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={dop.public_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  {dop.qr_code_data && (
                    <div className="mt-4">
                      <img 
                        src={dop.qr_code_data} 
                        alt="QR Code" 
                        className="w-32 h-32"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deklarierte Leistung</CardTitle>
                <CardDescription>
                  Wesentliche Merkmale gemäß EN 13813
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dop.declared_performance ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Druckfestigkeit:</span>
                        <p className="font-medium">{recipe?.compressive_strength}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Biegezugfestigkeit:</span>
                        <p className="font-medium">{recipe?.flexural_strength}</p>
                      </div>
                      {recipe?.wear_resistance && (
                        <div>
                          <span className="text-sm text-muted-foreground">Verschleißwiderstand:</span>
                          <p className="font-medium">{recipe.wear_resistance}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-muted-foreground">Brandverhalten:</span>
                        <p className="font-medium">{recipe?.fire_class || 'A1fl'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Keine Leistungsdaten verfügbar</p>
                )}
              </CardContent>
            </Card>

            {/* Test Reports */}
            {testReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Verknüpfte Prüfberichte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {testReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{report.report_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.testing_institute} • {new Date(report.test_date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <Badge variant={report.status === 'valid' ? 'success' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dokumente</CardTitle>
                <CardDescription>
                  Generierte und verknüpfte Dokumente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Leistungserklärung PDF</p>
                        <p className="text-sm text-muted-foreground">
                          DoP_{dop.dop_number}.pdf
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {dop.ce_label_document_id && (
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">CE-Kennzeichnung</p>
                          <p className="text-sm text-muted-foreground">
                            CE_Label_{dop.dop_number}.pdf
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verteilung</CardTitle>
                <CardDescription>
                  Empfänger und Versand-Historie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-8 w-8 mx-auto mb-2" />
                  <p>Noch keine Verteilung erfolgt</p>
                  <Button className="mt-4" variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    DoP versenden
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}