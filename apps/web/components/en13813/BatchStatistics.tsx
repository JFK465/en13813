'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, XCircle, Package } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'

interface BatchData {
  id: string
  production_date: string
  status: string
  quantity_tons?: number
  qc_data: {
    compressive_strength_28d?: number
    flexural_strength_28d?: number
    flow_diameter?: number
  }
  recipe?: {
    name: string
    recipe_code: string
    compressive_strength_class: string
    flexural_strength_class: string
  }
}

interface TrendData {
  date: string
  compressive_strength: number | null
  flexural_strength: number | null
  flow_diameter: number | null
}

interface Statistics {
  total_batches: number
  total_quantity: number
  by_status: Record<string, number>
  by_recipe: Record<string, { count: number; name: string }>
  average_strength: {
    compressive: number
    flexural: number
  }
  trend: {
    compressive: 'up' | 'down' | 'stable'
    flexural: 'up' | 'down' | 'stable'
  }
  compliance_rate: number
}

export default function BatchStatistics() {
  const [timeRange, setTimeRange] = useState('30')
  const [selectedRecipe, setSelectedRecipe] = useState<string>('all')
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [recipes, setRecipes] = useState<Array<{ id: string; name: string; recipe_code: string }>>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadRecipes()
  }, [])

  useEffect(() => {
    loadStatistics()
    loadTrendData()
  }, [timeRange, selectedRecipe])

  const loadRecipes = async () => {
    const { data } = await supabase
      .from('en13813_recipes')
      .select('id, name, recipe_code')
      .order('name')
    
    if (data) {
      setRecipes(data)
    }
  }

  const loadStatistics = async () => {
    try {
      const startDate = subDays(new Date(), parseInt(timeRange))
      
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
        .gte('production_date', startDate.toISOString())

      if (selectedRecipe !== 'all') {
        query = query.eq('recipe_id', selectedRecipe)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        const stats: Statistics = {
          total_batches: data.length,
          total_quantity: 0,
          by_status: {},
          by_recipe: {},
          average_strength: { compressive: 0, flexural: 0 },
          trend: { compressive: 'stable', flexural: 'stable' },
          compliance_rate: 0
        }

        let strengthCount = 0
        let compliantBatches = 0
        const recentStrengths = { compressive: [], flexural: [] } as any

        data.forEach((batch: BatchData) => {
          // Total quantity
          stats.total_quantity += batch.quantity_tons || 0

          // Status distribution
          stats.by_status[batch.status] = (stats.by_status[batch.status] || 0) + 1

          // Recipe distribution
          if (batch.recipe) {
            const recipeKey = batch.recipe.recipe_code
            if (!stats.by_recipe[recipeKey]) {
              stats.by_recipe[recipeKey] = { count: 0, name: batch.recipe.name }
            }
            stats.by_recipe[recipeKey].count++
          }

          // Strength averages
          if (batch.qc_data?.compressive_strength_28d) {
            stats.average_strength.compressive += batch.qc_data.compressive_strength_28d
            recentStrengths.compressive.push(batch.qc_data.compressive_strength_28d)
            strengthCount++

            // Check compliance
            if (batch.recipe) {
              const minCompressive = parseInt(batch.recipe.compressive_strength_class.replace('C', ''))
              const minFlexural = parseInt(batch.recipe.flexural_strength_class.replace('F', ''))
              
              if (batch.qc_data.compressive_strength_28d >= minCompressive &&
                  batch.qc_data.flexural_strength_28d && 
                  batch.qc_data.flexural_strength_28d >= minFlexural) {
                compliantBatches++
              }
            }
          }
          if (batch.qc_data?.flexural_strength_28d) {
            stats.average_strength.flexural += batch.qc_data.flexural_strength_28d
            recentStrengths.flexural.push(batch.qc_data.flexural_strength_28d)
          }
        })

        // Calculate averages
        if (strengthCount > 0) {
          stats.average_strength.compressive /= strengthCount
          stats.average_strength.flexural /= strengthCount
          stats.compliance_rate = (compliantBatches / strengthCount) * 100
        }

        // Calculate trends (comparing first half vs second half)
        if (recentStrengths.compressive.length > 4) {
          const midpoint = Math.floor(recentStrengths.compressive.length / 2)
          const firstHalf = recentStrengths.compressive.slice(0, midpoint)
          const secondHalf = recentStrengths.compressive.slice(midpoint)
          
          const firstAvg = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length
          const secondAvg = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length
          
          if (secondAvg > firstAvg * 1.02) stats.trend.compressive = 'up'
          else if (secondAvg < firstAvg * 0.98) stats.trend.compressive = 'down'
        }

        setStatistics(stats)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTrendData = async () => {
    try {
      const startDate = subDays(new Date(), parseInt(timeRange))
      
      let query = supabase
        .from('en13813_batches')
        .select('production_date, qc_data')
        .gte('production_date', startDate.toISOString())
        .order('production_date')

      if (selectedRecipe !== 'all') {
        query = query.eq('recipe_id', selectedRecipe)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        const trend = data.map(batch => ({
          date: batch.production_date,
          compressive_strength: batch.qc_data?.compressive_strength_28d || null,
          flexural_strength: batch.qc_data?.flexural_strength_28d || null,
          flow_diameter: batch.qc_data?.flow_diameter || null
        }))

        setTrendData(trend)
      }
    } catch (error) {
      console.error('Error loading trend data:', error)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'released':
        return <CheckCircle2 className="w-4 h-4" />
      case 'blocked':
        return <XCircle className="w-4 h-4" />
      case 'produced':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'released':
        return 'bg-green-500'
      case 'blocked':
        return 'bg-red-500'
      case 'produced':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!statistics) return null

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Letzte 7 Tage</SelectItem>
            <SelectItem value="30">Letzte 30 Tage</SelectItem>
            <SelectItem value="90">Letzte 90 Tage</SelectItem>
            <SelectItem value="365">Letztes Jahr</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Rezepturen</SelectItem>
            {recipes.map(recipe => (
              <SelectItem key={recipe.id} value={recipe.id}>
                {recipe.name} ({recipe.recipe_code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Produzierte Chargen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_batches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.total_quantity.toFixed(1)} Tonnen gesamt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Konformitätsrate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{statistics.compliance_rate.toFixed(1)}%</div>
              {statistics.compliance_rate >= 95 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <Progress value={statistics.compliance_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ø Druckfestigkeit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {statistics.average_strength.compressive.toFixed(1)}
              </div>
              <span className="text-sm text-muted-foreground">N/mm²</span>
              {getTrendIcon(statistics.trend.compressive)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">28 Tage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ø Biegezugfestigkeit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {statistics.average_strength.flexural.toFixed(1)}
              </div>
              <span className="text-sm text-muted-foreground">N/mm²</span>
              {getTrendIcon(statistics.trend.flexural)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">28 Tage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Statusverteilung</CardTitle>
            <CardDescription>Chargen nach Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(statistics.by_status).map(([status, count]) => {
                const percentage = (count / statistics.total_batches) * 100
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className="capitalize">{status}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(status)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Rezepturen</CardTitle>
            <CardDescription>Häufigste Produktionen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statistics.by_recipe)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([code, data]) => (
                  <div key={code} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{code}</p>
                    </div>
                    <Badge variant="secondary">{data.count} Chargen</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Festigkeitsentwicklung</CardTitle>
          <CardDescription>Verlauf der Prüfwerte über Zeit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="mb-2">Diagramm-Visualisierung</p>
              <p className="text-sm">
                {trendData.length} Datenpunkte im gewählten Zeitraum
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}