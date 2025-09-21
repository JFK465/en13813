'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TestReportsService } from '@/modules/en13813/services/test-reports.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Upload,
  Download,
  Eye,
  Shield,
  FlaskConical,
  Calendar,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface TestReport {
  id: string
  recipe_id: string
  recipe?: any
  report_type: 'ITT' | 'System1+' | 'FPC' | 'External'
  avcp_system?: '1' | '4'
  test_lab: string
  notified_body_number?: string
  notified_body_name?: string
  report_number: string
  report_date: string
  test_date: string
  test_results: any
  validation_status?: 'pending' | 'valid' | 'invalid' | 'superseded'
  validation_errors?: any[]
  pdf_url?: string
  created_at: string
}

interface RecipeWithITT {
  id: string
  recipe_code: string
  name: string
  estrich_type: string
  itt_status: 'valid' | 'missing' | 'expired'
  itt_complete: boolean
  missing_tests: string[]
  can_generate_dop: boolean
}

export default function TestReportsPage() {
  const [testReports, setTestReports] = useState<TestReport[]>([])
  const [recipesWithITT, setRecipesWithITT] = useState<RecipeWithITT[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')
  const supabase = createClientComponentClient()
  const testReportsService = new TestReportsService(supabase)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Lade alle Prüfberichte
      const { data: reports, error: reportsError } = await supabase
        .from('en13813_test_reports')
        .select(`
          *,
          recipe:en13813_recipes(
            id,
            recipe_code,
            name,
            estrich_type,
            compressive_strength_class,
            flexural_strength_class
          )
        `)
        .order('test_date', { ascending: false })

      if (reportsError) throw reportsError
      setTestReports(reports || [])

      // Lade Rezepturen mit ITT-Status
      const { data: recipeStatus, error: statusError } = await supabase
        .from('v_recipe_itt_status')
        .select('*')
        .order('recipe_code')

      if (statusError) throw statusError
      
      const recipesData = (recipeStatus || []).map(r => ({
        ...r,
        missing_tests: r.missing_tests ? JSON.parse(r.missing_tests) : [],
        itt_complete: r.itt_complete === 'true',
        can_generate_dop: r.itt_complete === 'true'
      }))
      
      setRecipesWithITT(recipesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Gültig</Badge>
      case 'invalid':
        return <Badge className="bg-red-100 text-red-800">Ungültig</Badge>
      case 'superseded':
        return <Badge className="bg-gray-100 text-gray-800">Überholt</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  const getAVCPBadge = (system?: string) => {
    if (system === '3') {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          <Shield className="w-3 h-3 mr-1" />
          System 1+
        </Badge>
      )
    }
    return (
      <Badge className="bg-blue-100 text-blue-800">
        <FlaskConical className="w-3 h-3 mr-1" />
        System 4
      </Badge>
    )
  }

  const getITTStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Lade Prüfberichte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Prüfberichte</h1>
          <p className="text-muted-foreground mt-1">
            ITT, System 1+ und FPC Prüfberichte verwalten
          </p>
        </div>
        <Button asChild>
          <Link href="/en13813/test-reports/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Prüfbericht
          </Link>
        </Button>
      </div>

      {/* Wichtige Hinweise basierend auf Feedback */}
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Wichtig:</strong> ITT-Berichte haben KEIN automatisches Ablaufdatum. 
          Sie müssen nur bei Änderungen an Rezeptur, Produktion oder Norm erneuert werden.
          Bei Brandklasse ≠ A1fl ist System 1+ mit Notified Body erforderlich.
        </AlertDescription>
      </Alert>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="reports">Prüfberichte</TabsTrigger>
          <TabsTrigger value="matrix">Test-Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistik-Karten */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Gesamt Berichte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testReports.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>ITT Berichte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testReports.filter(r => r.report_type === 'ITT').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>System 1+ (Brand)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testReports.filter(r => r.report_type === 'System1+').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>DOP-bereit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {recipesWithITT.filter(r => r.can_generate_dop).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rezepturen mit ITT-Status */}
          <Card>
            <CardHeader>
              <CardTitle>Rezepturen ITT-Status</CardTitle>
              <CardDescription>
                Übersicht über ITT-Vollständigkeit für DOP-Erstellung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipesWithITT.map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getITTStatusIcon(recipe.itt_status)}
                      <div>
                        <div className="font-medium">
                          {recipe.recipe_code} - {recipe.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Typ: {recipe.estrich_type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {recipe.missing_tests.length > 0 && (
                        <div className="text-sm text-red-600">
                          Fehlend: {recipe.missing_tests.join(', ')}
                        </div>
                      )}
                      
                      {recipe.can_generate_dop ? (
                        <Button size="sm" variant="default" asChild>
                          <Link href={`/en13813/dops/new?recipe_id=${recipe.id}`}>
                            DOP erstellen
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/en13813/test-reports/new?recipe_id=${recipe.id}`}>
                            ITT hinzufügen
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alle Prüfberichte</CardTitle>
              <CardDescription>
                Chronologische Übersicht aller Prüfberichte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4">Bericht-Nr.</th>
                      <th className="text-left py-2 px-4">Typ</th>
                      <th className="text-left py-2 px-4">AVCP</th>
                      <th className="text-left py-2 px-4">Labor</th>
                      <th className="text-left py-2 px-4">Rezeptur</th>
                      <th className="text-left py-2 px-4">Prüfdatum</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-left py-2 px-4">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testReports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {report.report_number}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{report.report_type}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {getAVCPBadge(report.avcp_system)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{report.test_lab}</div>
                            {report.notified_body_number && (
                              <div className="text-xs text-muted-foreground">
                                NB: {report.notified_body_number}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {report.recipe?.recipe_code} - {report.recipe?.name}
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(report.test_date), 'dd.MM.yyyy', { locale: de })}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(report.validation_status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/en13813/test-reports/${report.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {report.pdf_url && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={report.pdf_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test-Matrix nach EN 13813</CardTitle>
              <CardDescription>
                Übersicht der erforderlichen Tests je Estrichtyp und Verwendungszweck
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* CT/CA/MA Pflichtprüfungen */}
                <div>
                  <h3 className="font-semibold mb-3">CT/CA/MA - Pflichtprüfungen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Druckfestigkeit</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        EN 13892-2 | 28 Tage | Pflicht
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Biegezugfestigkeit</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        EN 13892-2 | 28 Tage | Pflicht
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bedingte Prüfungen */}
                <div>
                  <h3 className="font-semibold mb-3">Bedingte Prüfungen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Verschleißwiderstand</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bei Nutzschicht ohne Bodenbelag<br />
                        EN 13892-3/4/5 je nach Methode
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">RWFC</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bei Verwendung mit Bodenbelag<br />
                        EN 13892-7 | Pflicht
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Wärmeleitfähigkeit</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bei Heizestrich<br />
                        EN 12664 | Pflicht
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Brandverhalten</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Bei Klasse ≠ A1fl → System 1+<br />
                        EN 13501-1 | Mit Notified Body
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typspezifische Anforderungen */}
                <div>
                  <h3 className="font-semibold mb-3">Typspezifische Anforderungen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">MA (Magnesiaestrich)</div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Oberflächenhärte (SH) - Pflicht
                        </div>
                        <div className="text-xs mt-1">EN 13892-6</div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">AS (Gussasphalt)</div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Eindrücktiefe (IC/IP) - Pflicht
                        </div>
                        <div className="text-xs mt-1">EN 13813</div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">SR (Kunstharz)</div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Verbundfestigkeit (B) - Pflicht
                        </div>
                        <div className="text-xs mt-1">EN 13892-8 | 7 Tage</div>
                      </div>
                    </div>
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