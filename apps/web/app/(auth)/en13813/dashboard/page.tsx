'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Package,
  ClipboardCheck,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface DashboardStats {
  recipes: {
    total: number
    active: number
    draft: number
    locked: number
  }
  dops: {
    total: number
    published: number
    draft: number
    thisMonth: number
  }
  fpc: {
    testsToday: number
    testsThisWeek: number
    passRate: number
    pendingActions: number
  }
  itt: {
    total: number
    compliant: number
    pending: number
    failed: number
  }
  batches: {
    total: number
    thisMonth: number
    conforming: number
    nonConforming: number
  }
  compliance: {
    overdueTasks: number
    upcomingTasks: number
    completedThisMonth: number
    calibrationsDue: number
  }
}

interface RecentActivity {
  id: string
  type: 'recipe' | 'dop' | 'test' | 'batch' | 'fpc'
  action: string
  description: string
  timestamp: string
  user?: string
  status?: 'success' | 'warning' | 'error'
}

export default function EN13813Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const [recipesRes, dopsRes, complianceRes] = await Promise.all([
        fetch('/api/en13813/recipes'),
        fetch('/api/en13813/dops'),
        fetch('/api/en13813/compliance/stats')
      ])

      const recipesData = await recipesRes.json()
      const dopsData = await dopsRes.json()
      const complianceData = await complianceRes.json()

      // Calculate statistics
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const recipes = recipesData.recipes || []
      const dops = dopsData.dops || []

      setStats({
        recipes: {
          total: recipes.length,
          active: recipes.filter((r: any) => r.status === 'active').length,
          draft: recipes.filter((r: any) => r.status === 'draft').length,
          locked: recipes.filter((r: any) => r.status === 'locked').length
        },
        dops: {
          total: dops.length,
          published: dops.filter((d: any) => d.status === 'published').length,
          draft: dops.filter((d: any) => d.status === 'draft').length,
          thisMonth: dops.filter((d: any) => new Date(d.created_at) >= thisMonthStart).length
        },
        fpc: {
          testsToday: complianceData.fpc?.testsToday || 0,
          testsThisWeek: complianceData.fpc?.testsThisWeek || 0,
          passRate: complianceData.fpc?.passRate || 95,
          pendingActions: complianceData.fpc?.pendingActions || 0
        },
        itt: {
          total: complianceData.itt?.total || 0,
          compliant: complianceData.itt?.compliant || 0,
          pending: complianceData.itt?.pending || 0,
          failed: complianceData.itt?.failed || 0
        },
        batches: {
          total: complianceData.batches?.total || 0,
          thisMonth: complianceData.batches?.thisMonth || 0,
          conforming: complianceData.batches?.conforming || 0,
          nonConforming: complianceData.batches?.nonConforming || 0
        },
        compliance: {
          overdueTasks: complianceData.tasks?.overdue || 0,
          upcomingTasks: complianceData.tasks?.upcoming || 0,
          completedThisMonth: complianceData.tasks?.completedThisMonth || 0,
          calibrationsDue: complianceData.calibrations?.due || 0
        }
      })

      // Mock recent activities (would come from API)
      setRecentActivities([
        {
          id: '1',
          type: 'recipe',
          action: 'Rezeptur freigegeben',
          description: 'CT-C25-F4 wurde für Produktion freigegeben',
          timestamp: new Date().toISOString(),
          user: 'Max Mustermann',
          status: 'success'
        },
        {
          id: '2',
          type: 'fpc',
          action: 'FPC-Test durchgeführt',
          description: 'Druckfestigkeit Charge #2024-001 bestanden',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'success'
        },
        {
          id: '3',
          type: 'dop',
          action: 'DoP erstellt',
          description: 'DoP-2024-0042 für CA-C16-F3 generiert',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'success'
        },
        {
          id: '4',
          type: 'batch',
          action: 'Charge produziert',
          description: 'Charge #2024-002 - 25 Tonnen',
          timestamp: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: '5',
          type: 'test',
          action: 'Kalibrierung fällig',
          description: 'Druckprüfmaschine DPM-01 in 5 Tagen',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          status: 'warning'
        }
      ])

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast({
        title: 'Fehler',
        description: 'Dashboard-Daten konnten nicht geladen werden',
        variant: 'destructive'
      })
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'recipe': return <FileText className="h-4 w-4" />
      case 'dop': return <Shield className="h-4 w-4" />
      case 'test': return <ClipboardCheck className="h-4 w-4" />
      case 'batch': return <Package className="h-4 w-4" />
      case 'fpc': return <Activity className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getActivityBadgeVariant = (status?: string) => {
    switch (status) {
      case 'success': return 'default'
      case 'warning': return 'secondary'
      case 'error': return 'destructive'
      default: return 'outline'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)

    if (hours < 1) return 'vor wenigen Minuten'
    if (hours < 24) return `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`
    const days = Math.floor(hours / 24)
    return `vor ${days} Tag${days > 1 ? 'en' : ''}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">EN 13813 Dashboard</h1>
          <p className="text-gray-600 mt-1">Übersicht über Ihre Estrich-Produktion und Compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/en13813/recipes/new')}>
            Neue Rezeptur
          </Button>
          <Button onClick={() => router.push('/en13813/dops/new')}>
            DoP erstellen
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {stats && (stats.compliance.overdueTasks > 0 || stats.compliance.calibrationsDue > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Wichtige Hinweise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.compliance.overdueTasks > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{stats.compliance.overdueTasks} überfällige Aufgaben</span>
                  <Link href="/en13813/compliance">
                    <Button size="sm" variant="ghost">
                      Anzeigen <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
              {stats.compliance.calibrationsDue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{stats.compliance.calibrationsDue} Kalibrierungen fällig</span>
                  <Link href="/en13813/calibration">
                    <Button size="sm" variant="ghost">
                      Anzeigen <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
              {stats.fpc.pendingActions > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{stats.fpc.pendingActions} FPC-Maßnahmen ausstehend</span>
                  <Link href="/en13813/fpc">
                    <Button size="sm" variant="ghost">
                      Anzeigen <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Rezepturen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recipes.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              von {stats?.recipes.total || 0} gesamt
            </p>
            <Progress value={(stats?.recipes.active || 0) / (stats?.recipes.total || 1) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DoPs diesen Monat</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dops.thisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.dops.published || 0} veröffentlicht
            </p>
            <div className="mt-2 flex gap-1">
              <Badge variant="secondary">{stats?.dops.total || 0} gesamt</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FPC Erfolgsrate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.fpc.passRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.fpc.testsThisWeek || 0} Tests diese Woche
            </p>
            <Progress value={stats?.fpc.passRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chargen-Konformität</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.batches.conforming || 0}/{stats?.batches.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.batches.thisMonth || 0} diesen Monat
            </p>
            {stats?.batches.nonConforming && stats.batches.nonConforming > 0 && (
              <Badge variant="destructive" className="mt-2">
                {stats.batches.nonConforming} nicht konform
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="fpc">FPC-Status</TabsTrigger>
          <TabsTrigger value="itt">ITT-Tests</TabsTrigger>
          <TabsTrigger value="activity">Aktivitäten</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recipe Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rezeptur-Status</CardTitle>
                <CardDescription>Verteilung nach Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Aktiv</span>
                    <Badge>{stats?.recipes.active || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Entwurf</span>
                    <Badge variant="secondary">{stats?.recipes.draft || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gesperrt</span>
                    <Badge variant="outline">{stats?.recipes.locked || 0}</Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/en13813/recipes">
                    <Button variant="ghost" className="w-full">
                      Alle Rezepturen anzeigen <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compliance-Aufgaben</CardTitle>
                <CardDescription>Anstehende Aufgaben</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Überfällig
                    </span>
                    <Badge variant="destructive">{stats?.compliance.overdueTasks || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      Anstehend
                    </span>
                    <Badge variant="secondary">{stats?.compliance.upcomingTasks || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Erledigt (Monat)
                    </span>
                    <Badge variant="outline">{stats?.compliance.completedThisMonth || 0}</Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/en13813/compliance">
                    <Button variant="ghost" className="w-full">
                      Compliance-Center öffnen <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fpc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Werkseigene Produktionskontrolle</CardTitle>
              <CardDescription>Aktuelle FPC-Statistiken und Trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tests heute</p>
                  <p className="text-2xl font-bold">{stats?.fpc.testsToday || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diese Woche</p>
                  <p className="text-2xl font-bold">{stats?.fpc.testsThisWeek || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Erfolgsrate</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.fpc.passRate || 0}%</p>
                </div>
              </div>

              {stats?.fpc.pendingActions && stats.fpc.pendingActions > 0 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {stats.fpc.pendingActions} Korrekturmaßnahmen ausstehend
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Link href="/en13813/fpc">
                  <Button>FPC-Modul öffnen</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Initial Type Testing (ITT)</CardTitle>
              <CardDescription>Status der Erstprüfungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt</p>
                  <p className="text-2xl font-bold">{stats?.itt.total || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Konform</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.itt.compliant || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ausstehend</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.itt.pending || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fehlgeschlagen</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.itt.failed || 0}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/en13813/itt">
                  <Button>ITT-Modul öffnen</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Letzte Aktivitäten</CardTitle>
              <CardDescription>Aktuelle Ereignisse im System</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          {activity.user && (
                            <p className="text-xs text-gray-500 mt-1">von {activity.user}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {activity.status && (
                            <Badge variant={getActivityBadgeVariant(activity.status)} className="mb-1">
                              {activity.status === 'success' ? 'Erfolgreich' :
                               activity.status === 'warning' ? 'Warnung' : 'Fehler'}
                            </Badge>
                          )}
                          <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}