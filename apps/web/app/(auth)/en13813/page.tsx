'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { Button } from '@/components/ui/button'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { Badge } from '@/components/ui/badge'
import { queryWithTimeout } from '@/lib/utils/query-timeout'
import { 
  FileText, 
  FlaskConical, 
  Package, 
  ClipboardCheck,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface Statistics {
  total_recipes: number
  active_recipes: number
  total_dops: number
  published_dops: number
  total_batches: number
  total_test_reports: number
  valid_test_reports: number
}

export default function EN13813Dashboard() {
  console.log('🏗️ EN13813Dashboard component is rendering')
  
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    console.log('🚀 EN13813Dashboard useEffect triggered')
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    console.log('📊 Loading EN13813 dashboard data...')
    try {
      // Get statistics from materialized view
      const { data: stats } = await supabase
        .from('en13813_statistics')
        .select('*')
        .single()

      if (stats) {
        setStatistics(stats)
      }

      // Get recent activities (last 10 items)
      const { data: activities } = await supabase
        .from('audit_logs')
        .select('*')
        .in('resource_type', ['en13813_recipes', 'en13813_dops', 'en13813_batches'])
        .order('created_at', { ascending: false })
        .limit(10)

      setRecentActivities(activities || [])

      // Get upcoming compliance tasks
      const { data: tasks } = await supabase
        .from('en13813_compliance_tasks')
        .select('*')
        .eq('status', 'pending')
        .order('due_date')
        .limit(5)

      setUpcomingTasks(tasks || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Lade Dashboard...</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">EN 13813 Compliance Center</h1>
          <p className="text-muted-foreground mt-1">
            Verwaltung von Estrichmörtel-Rezepturen und Leistungserklärungen
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/en13813/recipes/new">
              <Plus className="mr-2 h-4 w-4" />
              Neue Rezeptur
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/en13813/dops/new">
              <FileText className="mr-2 h-4 w-4" />
              DoP erstellen
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Rezepturen</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.active_recipes || 0}</div>
            <p className="text-xs text-muted-foreground">
              von {statistics?.total_recipes || 0} gesamt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veröffentlichte DoPs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.published_dops || 0}</div>
            <p className="text-xs text-muted-foreground">
              von {statistics?.total_dops || 0} gesamt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chargen</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.total_batches || 0}</div>
            <p className="text-xs text-muted-foreground">
              Produktionschargen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gültige Prüfberichte</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.valid_test_reports || 0}</div>
            <p className="text-xs text-muted-foreground">
              von {statistics?.total_test_reports || 0} gesamt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          <TabsTrigger value="activities">Aktivitäten</TabsTrigger>
          <TabsTrigger value="analytics">Analysen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Schnellzugriff</CardTitle>
                <CardDescription>Häufig verwendete Funktionen</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/en13813/recipes">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Rezepturen verwalten
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/en13813/dops">
                    <FileText className="mr-2 h-4 w-4" />
                    Leistungserklärungen
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/en13813/batches">
                    <Package className="mr-2 h-4 w-4" />
                    Chargen überwachen
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/en13813/test-reports">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Prüfberichte
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Wichtige Hinweise</CardTitle>
                <CardDescription>Anstehende Aufgaben und Warnungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">{task.description}</span>
                      </div>
                      <Badge variant="outline">
                        {new Date(task.due_date).toLocaleDateString('de-DE')}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Keine anstehenden Aufgaben</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance-Aufgaben</CardTitle>
              <CardDescription>Übersicht aller anstehenden und überfälligen Aufgaben</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Task list implementation */}
              <div className="text-center py-8 text-muted-foreground">
                Aufgabenliste wird geladen...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Letzte Aktivitäten</CardTitle>
              <CardDescription>Änderungen und Ereignisse im System</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.resource_type.replace('en13813_', '')}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString('de-DE')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Produktionstrends</CardTitle>
                <CardDescription>Chargenproduktion der letzten 30 Tage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mr-2" />
                  Diagramm wird implementiert
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualitätskennzahlen</CardTitle>
                <CardDescription>Durchschnittliche Prüfwerte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <ClipboardCheck className="h-8 w-8 mr-2" />
                  Statistiken werden berechnet
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}