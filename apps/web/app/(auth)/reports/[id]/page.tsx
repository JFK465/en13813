'use client'

import * as React from 'react'
import { useReport, useDownloadReport, useShareReport } from '@/hooks/useReports'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Calendar, 
  FileText, 
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const statusIcons = {
  draft: Clock,
  generating: Clock,
  completed: CheckCircle2,
  failed: AlertCircle,
  archived: FileText,
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  generating: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  archived: 'bg-gray-100 text-gray-800 border-gray-200',
}

const typeLabels = {
  compliance_dashboard: 'Compliance Dashboard',
  audit_report: 'Audit Bericht',
  document_overview: 'Dokumentenübersicht',
  workflow_summary: 'Workflow Zusammenfassung',
  risk_assessment: 'Risikobewertung',
  certification_status: 'Zertifizierungsstatus',
  gdpr_report: 'DSGVO Bericht',
  iso_report: 'ISO Bericht',
  custom: 'Benutzerdefiniert'
}

interface ReportPageProps {
  params: {
    id: string
  }
}

export default function ReportPage({ params }: ReportPageProps) {
  const { data: report, isLoading } = useReport(params.id)
  const downloadReport = useDownloadReport()
  const shareReport = useShareReport()

  const handleDownload = () => {
    if (report?.id) {
      downloadReport.mutate(report.id)
    }
  }

  const handleShare = () => {
    if (report?.id) {
      shareReport.mutate({ reportId: report.id, expiresInHours: 24 })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="animate-pulse">
          <CardHeader className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report nicht gefunden</h3>
            <p className="text-muted-foreground">
              Der angeforderte Report existiert nicht oder Sie haben keine Berechtigung.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const content = report.content as any

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Reports
          </Button>
        </Link>
      </div>

      {/* Report Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{report.title}</CardTitle>
              <CardDescription className="text-base">
                {report.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(statusColors[report.status as keyof typeof statusColors])}
              >
                {React.createElement(statusIcons[report.status as keyof typeof statusIcons], { 
                  className: "h-3 w-3 mr-1" 
                })}
                {report.status === 'completed' ? 'Abgeschlossen' :
                 report.status === 'generating' ? 'Wird generiert' :
                 report.status === 'failed' ? 'Fehlgeschlagen' :
                 report.status === 'draft' ? 'Entwurf' :
                 report.status}
              </Badge>
              <Badge variant="secondary">
                {typeLabels[report.type as keyof typeof typeLabels] || report.type}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span>Erstellt</span>
              </div>
              <p className="font-medium">
                {format(new Date(report.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
              </p>
            </div>
            {report.completed_at && (
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Abgeschlossen</span>
                </div>
                <p className="font-medium">
                  {format(new Date(report.completed_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                </p>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span>Format</span>
              </div>
              <p className="font-medium uppercase">{report.format}</p>
            </div>
            {report.file_size && (
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Settings className="h-4 w-4" />
                  <span>Dateigröße</span>
                </div>
                <p className="font-medium">
                  {Math.round(report.file_size / 1024)} KB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {report.status === 'completed' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                disabled={downloadReport.isPending}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {downloadReport.isPending ? 'Wird heruntergeladen...' : 'Report herunterladen'}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={shareReport.isPending}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                {shareReport.isPending ? 'Wird geteilt...' : 'Report teilen'}
              </Button>
            </div>
            {report.is_public && report.share_token && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Report ist öffentlich verfügbar</p>
                <p className="text-sm text-blue-700">
                  Gültig bis: {report.expires_at ? 
                    format(new Date(report.expires_at), 'dd.MM.yyyy HH:mm', { locale: de }) : 
                    'Unbegrenzt'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Report Status */}
      {report.status === 'generating' && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium">Report wird generiert...</p>
                <p className="text-sm text-muted-foreground">
                  Generierung gestartet {formatDistanceToNow(new Date(report.started_at || report.created_at), { 
                    addSuffix: true, 
                    locale: de 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {report.status === 'failed' && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Report-Generierung fehlgeschlagen</p>
                {report.error_details && (
                  <p className="text-sm text-red-700 mt-1">
                    Fehler: {report.error_details}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Parameters */}
      {Object.keys(report.parameters).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Parameter</CardTitle>
            <CardDescription>
              Konfiguration und Filter für diesen Report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {Object.entries(report.parameters).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </span>
                  <span className="text-muted-foreground">
                    {typeof value === 'boolean' ? (value ? 'Ja' : 'Nein') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Content Preview */}
      {content && report.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Report Vorschau</CardTitle>
            <CardDescription>
              Inhalt und Struktur des generierten Reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Report Title */}
              <div>
                <h2 className="text-xl font-bold">{content.title}</h2>
                {content.subtitle && (
                  <p className="text-muted-foreground">{content.subtitle}</p>
                )}
              </div>

              <Separator />

              {/* Report Sections */}
              {content.sections?.map((section: any, index: number) => (
                <div key={section.id || index} className="space-y-3">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  
                  {section.type === 'metrics' && section.data?.metrics && (
                    <div className="grid gap-3 md:grid-cols-3">
                      {section.data.metrics.map((metric: any, i: number) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                          <p className="text-2xl font-bold">{metric.value}</p>
                          {metric.trend && (
                            <p className={cn(
                              "text-sm",
                              metric.color === 'green' ? 'text-green-600' :
                              metric.color === 'red' ? 'text-red-600' : 'text-gray-600'
                            )}>
                              {metric.trend}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'table' && section.data?.rows && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            {section.config?.columns?.map((col: any) => (
                              <th key={col.key} className="px-4 py-2 text-left text-sm font-medium">
                                {col.title}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.data.rows.slice(0, 10).map((row: any, i: number) => (
                            <tr key={i} className="border-t">
                              {section.config?.columns?.map((col: any) => (
                                <td key={col.key} className="px-4 py-2 text-sm">
                                  {row[col.key]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {section.data.rows.length > 10 && (
                        <div className="px-4 py-2 bg-gray-50 text-sm text-muted-foreground">
                          ... und {section.data.rows.length - 10} weitere Einträge
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === 'chart' && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Diagramm: {section.config?.title || section.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Typ: {section.config?.type || 'Unbekannt'} • 
                        Datenpunkte: {section.data?.chartData?.length || 0}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Report Metadata */}
              {content.metadata && (
                <>
                  <Separator />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Generiert am: {format(new Date(content.metadata.generatedAt), 'dd.MM.yyyy HH:mm', { locale: de })}</p>
                    <p>Erstellt von: {content.metadata.generatedBy}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}