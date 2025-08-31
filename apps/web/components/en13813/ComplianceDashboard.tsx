'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ClipboardCheck,
  RefreshCw
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface ComplianceStats {
  total_recipes: number
  compliant: number
  missing_itt: number
  retest_required: number
  dop_ready: number
  dop_ready_percentage: number
  pending_tasks: number
  overdue_tasks: number
}

interface ComplianceTask {
  id: string
  task_type: string
  title: string
  description?: string
  due_date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in_progress' | 'completed'
  recipe_id?: string
  recipe_code?: string
}

interface RecipeComplianceStatus {
  recipe_id: string
  recipe_code: string
  en_designation: string
  is_compliant: boolean
  missing_tests: string[]
  pending_tasks: number
  dop_ready: boolean
  last_test_date?: string
  next_test_due?: string
}

export function ComplianceDashboard() {
  const [stats, setStats] = useState<ComplianceStats>({
    total_recipes: 0,
    compliant: 0,
    missing_itt: 0,
    retest_required: 0,
    dop_ready: 0,
    dop_ready_percentage: 0,
    pending_tasks: 0,
    overdue_tasks: 0
  })
  
  const [tasks, setTasks] = useState<ComplianceTask[]>([])
  const [recipeStatuses, setRecipeStatuses] = useState<RecipeComplianceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      setLoading(true)
      
      // Fetch compliance statistics
      const statsResponse = await fetch('/api/en13813/compliance/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
      
      // Fetch pending tasks
      const tasksResponse = await fetch('/api/en13813/compliance/tasks?status=pending')
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      }
      
      // Fetch recipe compliance statuses
      const recipesResponse = await fetch('/api/en13813/compliance/recipe-status')
      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json()
        setRecipeStatuses(recipesData)
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return null
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd.MM.yyyy', { locale: de })
  }

  const isOverdue = (date: string) => {
    return new Date(date) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Rezeptur-Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compliant}/{stats.total_recipes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vollständig konform
            </p>
            <Progress 
              value={(stats.compliant / stats.total_recipes) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">DoP-Bereitschaft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dop_ready_percentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.dop_ready} von {stats.total_recipes} bereit
            </p>
            <Progress value={stats.dop_ready_percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Offene Aufgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_tasks}</div>
            {stats.overdue_tasks > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                <p className="text-xs text-destructive">
                  {stats.overdue_tasks} überfällig
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Nachprüfungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Fehlende ITT</span>
                <Badge variant="warning">{stats.missing_itt}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Re-ITT nötig</span>
                <Badge variant="destructive">{stats.retest_required}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-[600px]">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          <TabsTrigger value="recipes">Rezepturen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Critical Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kritische Aufgaben</CardTitle>
                <CardDescription>Aufgaben mit hoher Priorität</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {tasks
                      .filter(t => t.priority === 'critical' || t.priority === 'high')
                      .slice(0, 5)
                      .map(task => (
                        <div key={task.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(task.status)}
                                <p className="text-sm font-medium">{task.title}</p>
                              </div>
                              {task.recipe_code && (
                                <Badge variant="outline" className="text-xs">
                                  {task.recipe_code}
                                </Badge>
                              )}
                            </div>
                            <Badge variant={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span className={isOverdue(task.due_date) ? 'text-destructive' : ''}>
                              Fällig: {formatDate(task.due_date)}
                            </span>
                          </div>
                        </div>
                      ))}
                    {tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Keine kritischen Aufgaben
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Non-Compliant Recipes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nicht-konforme Rezepturen</CardTitle>
                <CardDescription>Rezepturen mit fehlenden Anforderungen</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {recipeStatuses
                      .filter(r => !r.is_compliant)
                      .slice(0, 5)
                      .map(recipe => (
                        <div key={recipe.recipe_id} className="border rounded-lg p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{recipe.en_designation}</Badge>
                              {recipe.dop_ready ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            {recipe.missing_tests.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Fehlende Tests: {recipe.missing_tests.join(', ')}
                              </div>
                            )}
                            {recipe.pending_tasks > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {recipe.pending_tasks} offene Aufgaben
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    {recipeStatuses.filter(r => !r.is_compliant).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Alle Rezepturen sind konform
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance-Trend</CardTitle>
              <CardDescription>Entwicklung der letzten 12 Monate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <TrendingUp className="h-8 w-8 mr-2" />
                <span>Trend-Diagramm wird hier angezeigt</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance-Aufgaben</CardTitle>
                  <CardDescription>
                    {tasks.length} offene Aufgaben
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={fetchComplianceData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aktualisieren
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <p className="font-medium">{task.title}</p>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {task.recipe_code && (
                            <Badge variant="outline">{task.recipe_code}</Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className={isOverdue(task.due_date) ? 'text-destructive font-medium' : ''}>
                              {formatDate(task.due_date)}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </Button>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3" />
                      <p>Keine offenen Aufgaben</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rezeptur-Compliance</CardTitle>
              <CardDescription>
                Status aller Rezepturen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {recipeStatuses.map(recipe => (
                    <div key={recipe.recipe_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                          <p className="font-medium">{recipe.en_designation}</p>
                          <Badge variant="outline">{recipe.recipe_code}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {recipe.is_compliant ? (
                            <Badge variant="success">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Konform
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Nicht konform
                            </Badge>
                          )}
                          {recipe.dop_ready && (
                            <Badge variant="secondary">
                              <FileCheck className="h-3 w-3 mr-1" />
                              DoP bereit
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {!recipe.is_compliant && (
                        <div className="mt-3 space-y-2">
                          {recipe.missing_tests.length > 0 && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle className="text-sm">Fehlende Tests</AlertTitle>
                              <AlertDescription className="text-xs">
                                {recipe.missing_tests.join(', ')}
                              </AlertDescription>
                            </Alert>
                          )}
                          {recipe.pending_tasks > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {recipe.pending_tasks} offene Aufgaben
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        {recipe.last_test_date && (
                          <span>Letzte Prüfung: {formatDate(recipe.last_test_date)}</span>
                        )}
                        {recipe.next_test_due && (
                          <span className={isOverdue(recipe.next_test_due) ? 'text-destructive' : ''}>
                            Nächste Prüfung: {formatDate(recipe.next_test_due)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}