'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Download, 
  Share2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Plus,
  Calendar,
  BarChart3,
  Eye
} from 'lucide-react'
import { useReports, useDownloadReport, useShareReport, useReportAnalytics } from '@/hooks/useReports'
import { formatDistanceToNow, format } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
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

interface ReportListProps {
  showFilters?: boolean
}

export function ReportList({ showFilters = true }: ReportListProps) {
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  })

  const { data: reports, isLoading } = useReports(filters)
  const { data: analytics } = useReportAnalytics()
  const downloadReport = useDownloadReport()
  const shareReport = useShareReport()

  const handleDownload = (reportId: string) => {
    downloadReport.mutate(reportId)
  }

  const handleShare = (reportId: string) => {
    shareReport.mutate({ reportId, expiresInHours: 24 })
  }

  const filteredReports = reports?.filter(report => {
    const matchesSearch = !filters.search || 
      report.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.description?.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesSearch
  }) || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Erstellen und verwalten Sie Compliance-Reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reports/templates">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </Link>
          <Link href="/reports/generate">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Report erstellen
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.completedReports} abgeschlossen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erfolgsrate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.failedReports} fehlgeschlagen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Bearbeitung</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.generatingReports}</div>
              <p className="text-xs text-muted-foreground">
                Werden generiert
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beliebter Typ</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.entries(analytics.reportsByType)[0]?.[1] || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {typeLabels[Object.entries(analytics.reportsByType)[0]?.[0] as keyof typeof typeLabels] || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Suche</Label>
              <Input
                id="search"
                placeholder="Report suchen..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Status</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="generating">In Bearbeitung</SelectItem>
                  <SelectItem value="failed">Fehlgeschlagen</SelectItem>
                  <SelectItem value="draft">Entwurf</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Typ</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Typen</SelectItem>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ status: '', type: '', search: '' })}
                className="w-full"
              >
                Filter zurücksetzen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Reports gefunden</h3>
              <p className="text-muted-foreground text-center">
                {filters.search || filters.status || filters.type 
                  ? 'Keine Reports entsprechen den aktuellen Filterkriterien.'
                  : 'Erstellen Sie Ihren ersten Report, um hier zu beginnen.'
                }
              </p>
              {!filters.search && !filters.status && !filters.type && (
                <Link href="/reports/generate" className="mt-4">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Report erstellen
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {report.title}
                      </CardTitle>
                      <CardDescription>
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
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(report.created_at), { 
                          addSuffix: true, 
                          locale: de 
                        })}
                      </div>
                      {report.completed_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Fertig {formatDistanceToNow(new Date(report.completed_at), { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </div>
                      )}
                      {report.file_size && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {Math.round(report.file_size / 1024)} KB
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/reports/${report.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                      
                      {report.status === 'completed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(report.id)}
                            disabled={downloadReport.isPending}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShare(report.id)}
                            disabled={shareReport.isPending}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Teilen
                          </Button>
                        </>
                      )}
                      
                      {report.status === 'generating' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Wird generiert...
                        </div>
                      )}
                      
                      {report.status === 'failed' && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Fehler
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}