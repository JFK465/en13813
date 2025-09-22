'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  Search,
  Target,
  TrendingUp,
  Activity,
  AlertOctagon,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  RefreshCw,
} from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'
import { de } from 'date-fns/locale'
import CAPAService from '@/modules/en13813/services/capa.service'
import type {
  Deviation,
  EffectivenessCheck,
  CAPAStatistics,
  CorrectiveAction,
} from '@/modules/en13813/types/deviation.types'

export default function DeviationsPage() {
  const [deviations, setDeviations] = useState<Deviation[]>([])
  const [statistics, setStatistics] = useState<CAPAStatistics | null>(null)
  const [overdueChecks, setOverdueChecks] = useState<EffectivenessCheck[]>([])
  const [selectedDeviation, setSelectedDeviation] = useState<Deviation | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const capaService = CAPAService.getInstance()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Lade Abweichungen
    const devs = await capaService.listDeviations()
    setDeviations(devs)

    // Lade Statistiken
    const stats = await capaService.getCAPAStatistics()
    setStatistics(stats)

    // Lade überfällige Wirksamkeitsprüfungen
    const overdue = await capaService.getOverdueEffectivenessChecks()
    setOverdueChecks(overdue)

    // Demo-Daten erstellen wenn leer
    if (devs.length === 0) {
      await createDemoData()
    }
  }

  const createDemoData = async () => {
    // Erstelle Demo-Abweichung
    const deviation = await capaService.createDeviation({
      title: 'Druckfestigkeit C25 unterschritten',
      description: 'Bei Routineprüfung wurde festgestellt, dass die 28-Tage Druckfestigkeit nur 23,5 N/mm² erreicht hat (Soll: ≥25 N/mm²)',
      type: 'product',
      severity: 'major',
      source: 'quality_control',
      discovered_by: 'QM Labor',
      recipe_id: 'recipe1',
      batch_id: 'batch1',
    })

    // Füge Ursachenanalyse hinzu
    await capaService.performRootCauseAnalysis(deviation.id, {
      method: '5why',
      five_why: {
        why1: { question: 'Warum war die Druckfestigkeit zu niedrig?', answer: 'Zu hoher Wassergehalt im Frischmörtel' },
        why2: { question: 'Warum war der Wassergehalt zu hoch?', answer: 'Dosieranlage hat zu viel Wasser zugegeben' },
        why3: { question: 'Warum hat die Dosieranlage zu viel Wasser zugegeben?', answer: 'Kalibrierung der Waage war nicht korrekt' },
        why4: { question: 'Warum war die Kalibrierung nicht korrekt?', answer: 'Kalibrierintervall überschritten' },
        why5: { question: 'Warum wurde das Kalibrierintervall überschritten?', answer: 'Fehlende automatische Erinnerung im System' },
        root_cause: 'Fehlende systematische Überwachung von Kalibrierintervallen',
      },
      performed_by: 'QM Team',
      performed_at: new Date().toISOString(),
      conclusion: 'Systematisches Problem in der Kalibrierverwaltung identifiziert',
    })

    // Füge Korrekturmaßnahme hinzu
    await capaService.addCorrectiveAction(deviation.id, {
      description: 'Implementierung automatischer Kalibrier-Erinnerungen im QM-System',
      responsible_person: 'Max Mustermann',
      department: 'Qualitätsmanagement',
      planned_start_date: new Date().toISOString(),
      planned_end_date: addDays(new Date(), 14).toISOString(),
      estimated_cost: 500,
    })

    // Lade Daten neu
    await loadData()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'major': return 'warning'
      case 'minor': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'investigation': return 'warning'
      case 'corrective_action': return 'secondary'
      case 'effectiveness_check': return 'default'
      case 'closed': return 'success'
      default: return 'default'
    }
  }

  const getEffectivenessColor = (rating?: string) => {
    switch (rating) {
      case 'effective': return 'text-green-600'
      case 'partially_effective': return 'text-yellow-600'
      case 'not_effective': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const performEffectivenessCheck = async (check: EffectivenessCheck) => {
    // Simuliere Prüfungsergebnisse
    await capaService.performEffectivenessCheck(check.id, {
      criteria_met: true,
      actual_values: {
        'Druckfestigkeit': 26.2,
        'Wiederholungen': 0,
      },
      observations: 'Keine weiteren Abweichungen aufgetreten. Maßnahme zeigt Wirkung.',
    })

    await loadData()
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          CAPA Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Abweichungen, Korrekturmaßnahmen & Wirksamkeitsprüfungen
        </p>
      </div>

      {/* Kritische Alerts */}
      {overdueChecks.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertOctagon className="h-4 w-4" />
          <AlertDescription>
            <strong>{overdueChecks.length} überfällige Wirksamkeitsprüfungen!</strong>
            <span className="ml-2">Sofortige Durchführung erforderlich gemäß EN 13813 § 6.3.2.2</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistik-Karten */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Offene Abweichungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.open_deviations}</div>
              <p className="text-xs text-muted-foreground">
                von {statistics.total_deviations} gesamt
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Überfällige Aktionen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statistics.overdue_actions}
              </div>
              <p className="text-xs text-muted-foreground">
                Sofortiger Handlungsbedarf
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ausstehende Prüfungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.pending_effectiveness_checks}
              </div>
              <p className="text-xs text-muted-foreground">
                Wirksamkeitsprüfungen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Wirksamkeitsrate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.effectiveness_rate.effective > 0
                  ? Math.round((statistics.effectiveness_rate.effective /
                      (statistics.effectiveness_rate.effective +
                       statistics.effectiveness_rate.partially_effective +
                       statistics.effectiveness_rate.not_effective)) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Erfolgreiche Maßnahmen
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Activity className="w-4 h-4 mr-2" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="deviations">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Abweichungen
          </TabsTrigger>
          <TabsTrigger value="effectiveness">
            <Target className="w-4 h-4 mr-2" />
            Wirksamkeitsprüfungen
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analysen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Abweichungen</CardTitle>
              <CardDescription>
                Übersicht aller offenen und in Bearbeitung befindlichen Abweichungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nr.</TableHead>
                    <TableHead>Titel</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Schwere</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Entdeckt</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deviations.map(deviation => (
                    <TableRow key={deviation.id}>
                      <TableCell className="font-mono">
                        {deviation.deviation_number}
                      </TableCell>
                      <TableCell>{deviation.title}</TableCell>
                      <TableCell>{deviation.type}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(deviation.severity)}>
                          {deviation.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(deviation.status)}>
                          {deviation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(deviation.discovered_date), 'dd.MM.yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDeviation(deviation)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Wirksamkeitsprüfungen
                <Badge variant="destructive">
                  EN 13813 § 6.3.2.2
                </Badge>
              </CardTitle>
              <CardDescription>
                Überprüfung der Wirksamkeit von Korrektur- und Vorbeugemaßnahmen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueChecks.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertOctagon className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Überfällige Prüfungen:</strong>
                    <ul className="mt-2 space-y-2">
                      {overdueChecks.map(check => (
                        <li key={check.id} className="flex items-center justify-between">
                          <span>
                            {check.check_number} - Fällig seit {
                              differenceInDays(new Date(), new Date(check.planned_date))
                            } Tagen
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => performEffectivenessCheck(check)}
                          >
                            Jetzt durchführen
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {deviations.map(deviation => {
                  if (!deviation.effectiveness_checks || deviation.effectiveness_checks.length === 0) {
                    return null
                  }

                  return (
                    <Card key={deviation.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {deviation.deviation_number}: {deviation.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {deviation.effectiveness_checks.map(check => (
                            <div
                              key={check.id}
                              className="border rounded-lg p-4 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{check.check_type}</Badge>
                                  <span className="font-medium">{check.check_number}</span>
                                  <Badge>{check.check_method}</Badge>
                                </div>
                                {check.performed_date ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className={`w-5 h-5 ${getEffectivenessColor(check.effectiveness_rating)}`} />
                                    <span className={getEffectivenessColor(check.effectiveness_rating)}>
                                      {check.effectiveness_rating === 'effective' && 'Wirksam'}
                                      {check.effectiveness_rating === 'partially_effective' && 'Teilweise wirksam'}
                                      {check.effectiveness_rating === 'not_effective' && 'Nicht wirksam'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-muted-foreground">
                                      Geplant: {format(new Date(check.planned_date), 'dd.MM.yyyy')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {check.success_criteria && check.success_criteria.length > 0 && (
                                <div className="mt-2 text-sm">
                                  <p className="font-medium mb-1">Erfolgskriterien:</p>
                                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {check.success_criteria.map((criteria, idx) => (
                                      <li key={idx}>
                                        {criteria.description}
                                        {criteria.measurable_target && (
                                          <span className="ml-2 font-mono text-xs">
                                            (Ziel: {criteria.measurable_target})
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {check.results && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                  <p className="font-medium">Ergebnis:</p>
                                  <p className="text-muted-foreground">{check.results.observations}</p>
                                </div>
                              )}

                              {check.follow_up_required && (
                                <Alert>
                                  <RefreshCw className="h-4 w-4" />
                                  <AlertDescription>
                                    Follow-up erforderlich: {check.follow_up_actions?.[0]?.description}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deviations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Abweichungsverwaltung</CardTitle>
                  <CardDescription>
                    Erfassung und Bearbeitung von Abweichungen
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Neue Abweichung
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedDeviation && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{selectedDeviation.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedDeviation.description}
                    </p>

                    {selectedDeviation.root_cause_analysis && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Ursachenanalyse (5-Why):</h4>
                        <div className="space-y-2 text-sm">
                          {selectedDeviation.root_cause_analysis.five_why && (
                            <>
                              <div>
                                <span className="font-medium">Why 1:</span> {selectedDeviation.root_cause_analysis.five_why.why1.answer}
                              </div>
                              <div>
                                <span className="font-medium">Why 2:</span> {selectedDeviation.root_cause_analysis.five_why.why2.answer}
                              </div>
                              <div>
                                <span className="font-medium">Root Cause:</span> {selectedDeviation.root_cause_analysis.five_why.root_cause}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedDeviation.corrective_actions && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Korrekturmaßnahmen:</h4>
                        {selectedDeviation.corrective_actions.map(action => (
                          <div key={action.id} className="border-l-2 border-blue-500 pl-3 mb-2">
                            <p className="text-sm font-medium">{action.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Verantwortlich: {action.responsible_person} |
                              Frist: {format(new Date(action.planned_end_date), 'dd.MM.yyyy')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CAPA Analysen</CardTitle>
              <CardDescription>
                Trends und wiederkehrende Probleme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statistics && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Verteilung nach Schweregrad</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-sm">Kritisch:</span>
                        <Progress value={(statistics.by_severity.critical / statistics.total_deviations) * 100} className="flex-1" />
                        <span className="text-sm font-medium">{statistics.by_severity.critical}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-sm">Major:</span>
                        <Progress value={(statistics.by_severity.major / statistics.total_deviations) * 100} className="flex-1" />
                        <span className="text-sm font-medium">{statistics.by_severity.major}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-sm">Minor:</span>
                        <Progress value={(statistics.by_severity.minor / statistics.total_deviations) * 100} className="flex-1" />
                        <span className="text-sm font-medium">{statistics.by_severity.minor}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Wirksamkeit der Maßnahmen</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {statistics.effectiveness_rate.effective}
                        </div>
                        <p className="text-sm text-muted-foreground">Wirksam</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {statistics.effectiveness_rate.partially_effective}
                        </div>
                        <p className="text-sm text-muted-foreground">Teilweise</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {statistics.effectiveness_rate.not_effective}
                        </div>
                        <p className="text-sm text-muted-foreground">Nicht wirksam</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Durchschnittliche Schließzeit: <span className="font-medium">{statistics.avg_closure_time_days} Tage</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}