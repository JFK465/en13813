'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format, subDays } from 'date-fns'
import { de } from 'date-fns/locale'

interface QCIssue {
  batch_id: string
  batch_number: string
  recipe_name: string
  issue_type: 'strength' | 'flow' | 'density' | 'other'
  description: string
  severity: 'high' | 'medium' | 'low'
  date: string
}

interface QCMetrics {
  total_tests: number
  passed_tests: number
  failed_tests: number
  pending_tests: number
  pass_rate: number
  recent_issues: QCIssue[]
  test_coverage: {
    compressive: number
    flexural: number
    flow: number
    density: number
  }
  performance_by_recipe: Array<{
    recipe_name: string
    recipe_code: string
    total_batches: number
    tested_batches: number
    pass_rate: number
    avg_compressive: number
    avg_flexural: number
  }>
  control_limits: {
    compressive: { ucl: number; lcl: number; mean: number }
    flexural: { ucl: number; lcl: number; mean: number }
    flow: { ucl: number; lcl: number; mean: number }
  }
}

export default function QCDashboard() {
  const [metrics, setMetrics] = useState<QCMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadQCMetrics()
  }, [selectedPeriod])

  const loadQCMetrics = async () => {
    try {
      const startDate = subDays(new Date(), parseInt(selectedPeriod))
      
      const { data: batches, error } = await supabase
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
        .order('production_date', { ascending: false })

      if (error) throw error

      if (batches) {
        const metrics: QCMetrics = {
          total_tests: 0,
          passed_tests: 0,
          failed_tests: 0,
          pending_tests: 0,
          pass_rate: 0,
          recent_issues: [],
          test_coverage: {
            compressive: 0,
            flexural: 0,
            flow: 0,
            density: 0
          },
          performance_by_recipe: [],
          control_limits: {
            compressive: { ucl: 0, lcl: 0, mean: 0 },
            flexural: { ucl: 0, lcl: 0, mean: 0 },
            flow: { ucl: 0, lcl: 0, mean: 0 }
          }
        }

        // Process batches
        const recipeStats: Record<string, any> = {}
        const strengthValues = { compressive: [], flexural: [], flow: [] } as any

        batches.forEach(batch => {
          metrics.total_tests++

          // Check test coverage
          if (batch.qc_data?.compressive_strength_28d !== undefined) {
            metrics.test_coverage.compressive++
            strengthValues.compressive.push(batch.qc_data.compressive_strength_28d)
          }
          if (batch.qc_data?.flexural_strength_28d !== undefined) {
            metrics.test_coverage.flexural++
            strengthValues.flexural.push(batch.qc_data.flexural_strength_28d)
          }
          if (batch.qc_data?.flow_diameter !== undefined) {
            metrics.test_coverage.flow++
            strengthValues.flow.push(batch.qc_data.flow_diameter)
          }
          if (batch.qc_data?.density !== undefined) {
            metrics.test_coverage.density++
          }

          // Check if tests are complete
          const hasTests = batch.qc_data?.compressive_strength_28d !== undefined && 
                          batch.qc_data?.flexural_strength_28d !== undefined

          if (!hasTests) {
            metrics.pending_tests++
          } else if (batch.recipe) {
            // Check pass/fail
            const minCompressive = parseInt(batch.recipe.compressive_strength_class.replace('C', ''))
            const minFlexural = parseInt(batch.recipe.flexural_strength_class.replace('F', ''))
            
            const passed = batch.qc_data.compressive_strength_28d >= minCompressive &&
                          batch.qc_data.flexural_strength_28d >= minFlexural

            if (passed) {
              metrics.passed_tests++
            } else {
              metrics.failed_tests++
              
              // Add to recent issues
              const issues: string[] = []
              if (batch.qc_data.compressive_strength_28d < minCompressive) {
                issues.push(`Druckfestigkeit ${batch.qc_data.compressive_strength_28d} < ${minCompressive} N/mm²`)
              }
              if (batch.qc_data.flexural_strength_28d < minFlexural) {
                issues.push(`Biegezugfestigkeit ${batch.qc_data.flexural_strength_28d} < ${minFlexural} N/mm²`)
              }

              metrics.recent_issues.push({
                batch_id: batch.id,
                batch_number: batch.batch_number,
                recipe_name: batch.recipe.name,
                issue_type: 'strength',
                description: issues.join(', '),
                severity: 'high',
                date: batch.production_date
              })
            }

            // Aggregate by recipe
            const recipeKey = batch.recipe.recipe_code
            if (!recipeStats[recipeKey]) {
              recipeStats[recipeKey] = {
                name: batch.recipe.name,
                code: batch.recipe.recipe_code,
                total: 0,
                tested: 0,
                passed: 0,
                compressive_sum: 0,
                flexural_sum: 0
              }
            }
            recipeStats[recipeKey].total++
            if (hasTests) {
              recipeStats[recipeKey].tested++
              if (passed) recipeStats[recipeKey].passed++
              recipeStats[recipeKey].compressive_sum += batch.qc_data.compressive_strength_28d
              recipeStats[recipeKey].flexural_sum += batch.qc_data.flexural_strength_28d
            }
          }
        })

        // Calculate coverage percentages
        if (metrics.total_tests > 0) {
          metrics.test_coverage.compressive = (metrics.test_coverage.compressive / metrics.total_tests) * 100
          metrics.test_coverage.flexural = (metrics.test_coverage.flexural / metrics.total_tests) * 100
          metrics.test_coverage.flow = (metrics.test_coverage.flow / metrics.total_tests) * 100
          metrics.test_coverage.density = (metrics.test_coverage.density / metrics.total_tests) * 100
        }

        // Calculate pass rate
        const testedBatches = metrics.passed_tests + metrics.failed_tests
        if (testedBatches > 0) {
          metrics.pass_rate = (metrics.passed_tests / testedBatches) * 100
        }

        // Process recipe statistics
        metrics.performance_by_recipe = Object.values(recipeStats).map((stats: any) => ({
          recipe_name: stats.name,
          recipe_code: stats.code,
          total_batches: stats.total,
          tested_batches: stats.tested,
          pass_rate: stats.tested > 0 ? (stats.passed / stats.tested) * 100 : 0,
          avg_compressive: stats.tested > 0 ? stats.compressive_sum / stats.tested : 0,
          avg_flexural: stats.tested > 0 ? stats.flexural_sum / stats.tested : 0
        }))

        // Calculate control limits (simplified - using mean ± 3 std dev)
        const calculateControlLimits = (values: number[]) => {
          if (values.length === 0) return { ucl: 0, lcl: 0, mean: 0 }
          
          const mean = values.reduce((a, b) => a + b, 0) / values.length
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
          const stdDev = Math.sqrt(variance)
          
          return {
            mean: mean,
            ucl: mean + 3 * stdDev,
            lcl: Math.max(0, mean - 3 * stdDev)
          }
        }

        metrics.control_limits.compressive = calculateControlLimits(strengthValues.compressive)
        metrics.control_limits.flexural = calculateControlLimits(strengthValues.flexural)
        metrics.control_limits.flow = calculateControlLimits(strengthValues.flow)

        // Limit recent issues to 10
        metrics.recent_issues = metrics.recent_issues.slice(0, 10)

        setMetrics(metrics)
      }
    } catch (error) {
      console.error('Error loading QC metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      case 'low':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-4 h-4" />
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  if (loading || !metrics) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gesamtprüfungen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_tests}</div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-green-600">{metrics.passed_tests} bestanden</span>
              <span className="text-red-600">{metrics.failed_tests} fehlgeschlagen</span>
              <span className="text-yellow-600">{metrics.pending_tests} ausstehend</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Erfolgsquote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.pass_rate.toFixed(1)}%</div>
              {metrics.pass_rate >= 95 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : metrics.pass_rate >= 90 ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <Progress value={metrics.pass_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Testabdeckung Druckfestigkeit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.test_coverage.compressive.toFixed(0)}%</div>
            <Progress value={metrics.test_coverage.compressive} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Testabdeckung Biegezug</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.test_coverage.flexural.toFixed(0)}%</div>
            <Progress value={metrics.test_coverage.flexural} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {metrics.recent_issues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Aktuelle QC-Probleme</AlertTitle>
          <AlertDescription>
            {metrics.recent_issues.length} Charge(n) erfüllen die Qualitätsanforderungen nicht
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Aktuelle Probleme</TabsTrigger>
          <TabsTrigger value="performance">Rezeptur-Performance</TabsTrigger>
          <TabsTrigger value="control">Kontrollgrenzen</TabsTrigger>
        </TabsList>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Letzte QC-Probleme</CardTitle>
              <CardDescription>Chargen mit Qualitätsabweichungen</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.recent_issues.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Charge</TableHead>
                      <TableHead>Rezeptur</TableHead>
                      <TableHead>Problem</TableHead>
                      <TableHead>Schweregrad</TableHead>
                      <TableHead>Datum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.recent_issues.map((issue) => (
                      <TableRow key={issue.batch_id}>
                        <TableCell className="font-medium">{issue.batch_number}</TableCell>
                        <TableCell>{issue.recipe_name}</TableCell>
                        <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(issue.severity) as any} className="gap-1">
                            {getSeverityIcon(issue.severity)}
                            {issue.severity === 'high' ? 'Hoch' : issue.severity === 'medium' ? 'Mittel' : 'Niedrig'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(issue.date), 'dd.MM.yyyy', { locale: de })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>Keine aktuellen QC-Probleme</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance nach Rezeptur</CardTitle>
              <CardDescription>Qualitätskennzahlen je Rezeptur</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rezeptur</TableHead>
                    <TableHead>Chargen</TableHead>
                    <TableHead>Getestet</TableHead>
                    <TableHead>Erfolgsquote</TableHead>
                    <TableHead>Ø Druckfest.</TableHead>
                    <TableHead>Ø Biegezug</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.performance_by_recipe.map((perf) => (
                    <TableRow key={perf.recipe_code}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{perf.recipe_name}</div>
                          <div className="text-sm text-muted-foreground">{perf.recipe_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{perf.total_batches}</TableCell>
                      <TableCell>{perf.tested_batches}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {perf.pass_rate.toFixed(0)}%
                          {perf.pass_rate >= 95 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : perf.pass_rate >= 90 ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{perf.avg_compressive.toFixed(1)} N/mm²</TableCell>
                      <TableCell>{perf.avg_flexural.toFixed(1)} N/mm²</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="control">
          <Card>
            <CardHeader>
              <CardTitle>Statistische Kontrollgrenzen</CardTitle>
              <CardDescription>Obere und untere Kontrollgrenzen (UCL/LCL)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Druckfestigkeit (N/mm²)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Untere Grenze (LCL)</Label>
                      <p className="text-xl font-bold">{metrics.control_limits.compressive.lcl.toFixed(1)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Mittelwert</Label>
                      <p className="text-xl font-bold">{metrics.control_limits.compressive.mean.toFixed(1)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Obere Grenze (UCL)</Label>
                      <p className="text-xl font-bold">{metrics.control_limits.compressive.ucl.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Biegezugfestigkeit (N/mm²)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Untere Grenze (LCL)</Label>
                      <p className="text-xl font-bold">{metrics.control_limits.flexural.lcl.toFixed(1)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Mittelwert</Label>
                      <p className="text-xl font-bold">{metrics.control_limits.flexural.mean.toFixed(1)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Obere Grenze (UCL)</Label>
                      <p className="text-xl font-bold">{metrics.control_limits.flexural.ucl.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Fließmaß (mm)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Untere Grenze (LCL)</Label>
                      <p className="text-xl font-bold">{metrics.control_limits.flow.lcl.toFixed(0)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Mittelwert</Label>
                      <p className="text-xl font-bold">{metrics.control_limits.flow.mean.toFixed(0)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Obere Grenze (UCL)</Label>
                      <p className="text-xl font-bold">{metrics.control_limits.flow.ucl.toFixed(0)}</p>
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

import { Label } from '@/components/ui/label'