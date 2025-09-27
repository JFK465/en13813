'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { LabValuesService } from '@/modules/en13813/services/lab-values.service'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FlaskConical,
  TestTube,
  BarChart3,
  Calendar,
  Timer,
  Thermometer,
  Droplets
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

interface LabValue {
  id: string
  recipe_id: string
  recipe?: any
  batch_id?: string
  batch?: any
  sample_id: string
  sample_datetime: string
  test_type: 'fresh' | 'hardened' | 'both'
  test_age_days?: number
  fresh_properties?: any
  hardened_properties?: any
  evaluation: {
    overall_result: 'pass' | 'warning' | 'fail'
    deviations?: string[]
    action_required?: string
  }
  status?: string
  released?: boolean
  created_at: string
}

interface SPCData {
  parameter: string
  mean_value: number
  std_deviation: number
  cpk?: number
  ucl: number
  lcl: number
  uwl: number
  lwl: number
  trend?: string
}

export default function LabValuesPage() {
  const [labValues, setLabValues] = useState<LabValue[]>([])
  const [spcData, setSpcData] = useState<SPCData[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [chartData, setChartData] = useState<any[]>([])
  const supabase = createClientComponentClient()
  const labValuesService = new LabValuesService(supabase)

  useEffect(() => {
    loadData()
  }, [selectedRecipe])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Lade Rezepturen
      const { data: recipesData, error: recipesError } = await supabase
        .from('en13813_recipes')
        .select('id, recipe_code, name')
        .eq('status', 'active')
        .order('recipe_code')

      if (recipesError) throw recipesError
      setRecipes(recipesData || [])

      // Setze erste Rezeptur als Standard
      if (recipesData && recipesData.length > 0 && !selectedRecipe) {
        setSelectedRecipe(recipesData[0].id)
      }

      // Lade Laborwerte
      let query = supabase
        .from('en13813_lab_values')
        .select(`
          *,
          recipe:en13813_recipes(
            id,
            recipe_code,
            name,
            compressive_strength_class,
            flexural_strength_class
          ),
          batch:en13813_batches(
            id,
            batch_number,
            production_date
          )
        `)
        .order('sample_datetime', { ascending: false })
        .limit(100)

      if (selectedRecipe) {
        query = query.eq('recipe_id', selectedRecipe)
      }

      const { data: labData, error: labError } = await query
      if (labError) throw labError
      setLabValues(labData || [])

      // Erstelle Chart-Daten für Trend-Analyse
      if (selectedRecipe && labData) {
        const chartPoints = labData
          .filter(lv => lv.hardened_properties?.compressive_strength && lv.test_age_days === 28)
          .map(lv => ({
            date: format(new Date(lv.sample_datetime), 'dd.MM', { locale: de }),
            value: lv.hardened_properties.compressive_strength.value,
            specification: parseFloat(lv.hardened_properties.compressive_strength.specification.replace('≥', '').trim()),
            batch: lv.batch?.batch_number
          }))
          .reverse()
        
        setChartData(chartPoints)
      }

      // Lade SPC-Daten wenn Rezeptur ausgewählt
      if (selectedRecipe) {
        try {
          const spcResult = await labValuesService.calculateSPC(selectedRecipe, 'compressive_strength_28d', 90)
          setSpcData([spcResult as any])
        } catch (error) {
          console.log('Nicht genug Daten für SPC')
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'pass':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Bestanden
          </Badge>
        )
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warnung
          </Badge>
        )
      case 'fail':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Fehlgeschlagen
          </Badge>
        )
      default:
        return null
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'stable':
        return <Activity className="w-4 h-4 text-blue-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Lade Laborwerte...</p>
        </div>
      </div>
    )
  }

  const passRate = labValues.length > 0 
    ? (labValues.filter(lv => lv.evaluation?.overall_result === 'pass').length / labValues.length * 100)
    : 0

  const currentSPC = spcData[0]

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Laborwerte & FPC</h1>
          <p className="text-muted-foreground mt-1">
            Werkseigene Produktionskontrolle und Qualitätssicherung
          </p>
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border rounded-lg"
            value={selectedRecipe}
            onChange={(e) => setSelectedRecipe(e.target.value)}
          >
            <option value="">Alle Rezepturen</option>
            {recipes.map(recipe => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.recipe_code} - {recipe.name}
              </option>
            ))}
          </select>
          <Button asChild>
            <Link href="/en13813/lab-values/new">
              <Plus className="mr-2 h-4 w-4" />
              Neuer Laborwert
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="values">Laborwerte</TabsTrigger>
          <TabsTrigger value="trends">Trends & SPC</TabsTrigger>
          <TabsTrigger value="fpc">FPC-Kontrolle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistik-Karten */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Gesamtproben</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{labValues.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Letzte 30 Tage
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Erfolgsquote</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {passRate.toFixed(1)}%
                </div>
                <Progress value={passRate} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Prozessfähigkeit (Cpk)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {currentSPC?.cpk?.toFixed(2) || 'N/A'}
                  </div>
                  {currentSPC?.cpk && currentSPC.cpk >= 1.33 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ziel: ≥ 1.33
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getTrendIcon(currentSPC?.trend)}
                  <span className="text-lg capitalize">
                    {currentSPC?.trend || 'Unbekannt'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aktuelle Warnungen */}
          {labValues.filter(lv => lv.evaluation?.overall_result === 'fail').length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle>Grenzwertüberschreitungen</AlertTitle>
              <AlertDescription>
                {labValues.filter(lv => lv.evaluation?.overall_result === 'fail').length} Proben 
                haben die Grenzwerte unterschritten. Sofortige Maßnahmen erforderlich!
              </AlertDescription>
            </Alert>
          )}

          {/* Letzte Prüfungen */}
          <Card>
            <CardHeader>
              <CardTitle>Letzte Prüfungen</CardTitle>
              <CardDescription>
                Neueste Laborwerte mit Bewertung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {labValues.slice(0, 5).map((value) => (
                  <div key={value.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {value.test_type === 'fresh' ? (
                          <Droplets className="w-5 h-5 text-blue-600" />
                        ) : (
                          <TestTube className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          Probe {value.sample_id}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(value.sample_datetime), 'dd.MM.yyyy HH:mm', { locale: de })}
                          {value.test_age_days && ` | ${value.test_age_days} Tage`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {value.hardened_properties?.compressive_strength && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Druckfestigkeit</div>
                          <div className="font-medium">
                            {value.hardened_properties.compressive_strength.value} N/mm²
                          </div>
                        </div>
                      )}
                      {getResultBadge(value.evaluation?.overall_result)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="values" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alle Laborwerte</CardTitle>
              <CardDescription>
                Detaillierte Übersicht aller Prüfungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4">Probe</th>
                      <th className="text-left py-2 px-4">Charge</th>
                      <th className="text-left py-2 px-4">Datum</th>
                      <th className="text-left py-2 px-4">Typ</th>
                      <th className="text-left py-2 px-4">Druckfestigkeit</th>
                      <th className="text-left py-2 px-4">Biegezug</th>
                      <th className="text-left py-2 px-4">Bewertung</th>
                      <th className="text-left py-2 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labValues.map((value) => (
                      <tr key={value.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {value.sample_id}
                        </td>
                        <td className="py-3 px-4">
                          {value.batch?.batch_number || '-'}
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(value.sample_datetime), 'dd.MM.yyyy', { locale: de })}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {value.test_type === 'fresh' ? 'Frischmörtel' : 'Festmörtel'}
                            {value.test_age_days && ` (${value.test_age_days}d)`}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {value.hardened_properties?.compressive_strength?.value 
                            ? `${value.hardened_properties.compressive_strength.value} N/mm²`
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {value.hardened_properties?.flexural_strength?.value 
                            ? `${value.hardened_properties.flexural_strength.value} N/mm²`
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {getResultBadge(value.evaluation?.overall_result)}
                        </td>
                        <td className="py-3 px-4">
                          {value.released ? (
                            <Badge className="bg-blue-100 text-blue-800">Freigegeben</Badge>
                          ) : (
                            <Badge variant="outline">Ausstehend</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Trend-Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Druckfestigkeit Trend (28 Tage)</CardTitle>
              <CardDescription>
                Verlauf mit Kontrollgrenzen und Spezifikation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    
                    {/* Spezifikationsgrenze */}
                    {chartData[0]?.specification && (
                      <ReferenceLine 
                        y={chartData[0].specification} 
                        stroke="red" 
                        strokeDasharray="5 5"
                        label="Spezifikation"
                      />
                    )}
                    
                    {/* Kontrollgrenzen wenn vorhanden */}
                    {currentSPC && (
                      <>
                        <ReferenceLine 
                          y={currentSPC.ucl} 
                          stroke="orange" 
                          strokeDasharray="3 3"
                          label="UCL"
                        />
                        <ReferenceLine 
                          y={currentSPC.lcl} 
                          stroke="orange" 
                          strokeDasharray="3 3"
                          label="LCL"
                        />
                        <ReferenceLine 
                          y={currentSPC.mean_value} 
                          stroke="blue" 
                          strokeDasharray="1 1"
                          label="Mittelwert"
                        />
                      </>
                    )}
                    
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb' }}
                      name="Messwert"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Daten für Trend-Analyse vorhanden
                </div>
              )}
            </CardContent>
          </Card>

          {/* SPC Kennzahlen */}
          {currentSPC && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Mittelwert ± Std.Abw.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {currentSPC.mean_value?.toFixed(1)} ± {currentSPC.std_deviation?.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">N/mm²</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Kontrollgrenzen (3σ)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div>UCL: {currentSPC.ucl?.toFixed(1)} N/mm²</div>
                    <div>LCL: {currentSPC.lcl?.toFixed(1)} N/mm²</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Out-of-Control</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {(currentSPC as any).out_of_control_points || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Punkte außerhalb</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fpc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FPC Kontrollpunkte</CardTitle>
              <CardDescription>
                Werkseigene Produktionskontrolle nach EN 13813
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Eingangskontrolle */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Eingangskontrolle Rohstoffe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Zement</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✓ Lieferschein & CE-Kennzeichnung</div>
                        <div>✓ Erstarrungszeit (monatlich)</div>
                        <div className="text-xs mt-2">Frequenz: Pro Lieferung</div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Gesteinskörnung</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✓ Korngrößenverteilung</div>
                        <div>✓ Feuchtegehalt</div>
                        <div className="text-xs mt-2">Frequenz: Täglich</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Produktionskontrolle */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Produktionskontrolle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Frischmörtel</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✓ Konsistenz (Ausbreitmaß)</div>
                        <div>✓ Temperatur</div>
                        <div>✓ pH-Wert</div>
                        <div className="text-xs mt-2">Frequenz: Pro Charge</div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Mischprozess</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✓ Mischzeit</div>
                        <div>✓ Dosiergenauigkeit</div>
                        <div className="text-xs mt-2">Frequenz: Pro Schicht</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Endproduktkontrolle */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Endproduktkontrolle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Festmörtel 28 Tage</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✓ Druckfestigkeit</div>
                        <div>✓ Biegezugfestigkeit</div>
                        <div className="text-xs mt-2">
                          Frequenz: Wöchentlich<br />
                          Akzeptanz: ≥ 0.95 × deklariert (Mittelwert)
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Frühfestigkeit 7 Tage</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✓ Druckfestigkeit (optional)</div>
                        <div className="text-xs mt-2">
                          Frequenz: Bei Bedarf<br />
                          Zur Prozessüberwachung
                        </div>
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
