'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  FileText, 
  BarChart3, 
  Calendar as CalendarIcon,
  Settings,
  Play,
  Clock,
  Download
} from 'lucide-react'
import { 
  useReportTemplates, 
  useGenerateReport,
  useGenerateComplianceReport,
  useGenerateDocumentReport,
  useGenerateWorkflowReport
} from '@/hooks/useReports'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const predefinedReports = [
  {
    id: 'compliance',
    name: 'Compliance Dashboard',
    description: 'Vollständiger Compliance-Überblick mit aktuellen Kennzahlen',
    icon: BarChart3,
    color: 'bg-blue-500',
    defaultTitle: 'Compliance Report'
  },
  {
    id: 'documents',
    name: 'Dokument Report',
    description: 'Übersicht aller Dokumente nach Status und Typ',
    icon: FileText,
    color: 'bg-green-500',
    defaultTitle: 'Document Status Report'
  },
  {
    id: 'workflows',
    name: 'Workflow Report',
    description: 'Performance-Analyse und Status aller Workflows',
    icon: Clock,
    color: 'bg-purple-500',
    defaultTitle: 'Workflow Performance Report'
  }
]

export function ReportGenerator() {
  const [selectedReport, setSelectedReport] = useState<string>('')
  const [customTemplate, setCustomTemplate] = useState<string>('')
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    format: 'pdf' as 'pdf' | 'html' | 'csv',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    parameters: {} as Record<string, any>
  })

  const { data: templates, isLoading: templatesLoading } = useReportTemplates()
  const generateReport = useGenerateReport()
  const generateCompliance = useGenerateComplianceReport()
  const generateDocument = useGenerateDocumentReport()
  const generateWorkflow = useGenerateWorkflowReport()

  const handlePredefinedReport = async (reportType: string) => {
    const reportConfig = predefinedReports.find(r => r.id === reportType)
    if (!reportConfig) return

    const params = {
      title: reportData.title || reportConfig.defaultTitle,
      startDate: reportData.startDate?.toISOString().split('T')[0],
      endDate: reportData.endDate?.toISOString().split('T')[0],
      ...reportData.parameters
    }

    try {
      switch (reportType) {
        case 'compliance':
          await generateCompliance.mutateAsync(params)
          break
        case 'documents':
          await generateDocument.mutateAsync(params)
          break
        case 'workflows':
          await generateWorkflow.mutateAsync(params)
          break
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  const handleCustomReport = async () => {
    if (!customTemplate || !reportData.title) return

    try {
      await generateReport.mutateAsync({
        templateId: customTemplate,
        title: reportData.title,
        description: reportData.description,
        format: reportData.format,
        parameters: {
          startDate: reportData.startDate?.toISOString().split('T')[0],
          endDate: reportData.endDate?.toISOString().split('T')[0],
          ...reportData.parameters
        }
      })
    } catch (error) {
      console.error('Failed to generate custom report:', error)
    }
  }

  const isGenerating = generateReport.isPending || 
                     generateCompliance.isPending || 
                     generateDocument.isPending || 
                     generateWorkflow.isPending

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Report Generator</h2>
        <p className="text-muted-foreground">
          Erstellen Sie Compliance-Reports aus vorgefertigten Templates oder benutzerdefinierten Vorlagen
        </p>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Schnell-Reports</CardTitle>
          <CardDescription>
            Generieren Sie häufig verwendete Reports mit einem Klick
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {predefinedReports.map((report) => (
              <div
                key={report.id}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
                  selectedReport === report.id && "border-primary bg-primary/5"
                )}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg text-white", report.color)}>
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Report Konfiguration
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie die Parameter für Ihren Report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Report Titel</Label>
              <Input
                id="title"
                placeholder="z.B. Monatlicher Compliance Report"
                value={reportData.title}
                onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="format">Format</Label>
              <Select
                value={reportData.format}
                onValueChange={(value: 'pdf' | 'html' | 'csv') => 
                  setReportData(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              placeholder="Zusätzliche Informationen über den Report..."
              value={reportData.description}
              onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Startdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reportData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportData.startDate ? (
                      format(reportData.startDate, "dd.MM.yyyy", { locale: de })
                    ) : (
                      "Startdatum wählen"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reportData.startDate}
                    onSelect={(date) => setReportData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Enddatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reportData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportData.endDate ? (
                      format(reportData.endDate, "dd.MM.yyyy", { locale: de })
                    ) : (
                      "Enddatum wählen"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reportData.endDate}
                    onSelect={(date) => setReportData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Additional Parameters based on selected report type */}
          {selectedReport === 'compliance' && (
            <div className="space-y-3">
              <Label>Zusätzliche Optionen</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAudit"
                  checked={reportData.parameters.includeAudit !== false}
                  onCheckedChange={(checked) => 
                    setReportData(prev => ({ 
                      ...prev, 
                      parameters: { ...prev.parameters, includeAudit: checked }
                    }))
                  }
                />
                <Label htmlFor="includeAudit" className="text-sm">
                  Audit Trail einschließen
                </Label>
              </div>
            </div>
          )}

          {selectedReport === 'documents' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="docType">Dokumenttyp (optional)</Label>
                <Select
                  value={reportData.parameters.documentType || ''}
                  onValueChange={(value) => 
                    setReportData(prev => ({ 
                      ...prev, 
                      parameters: { ...prev.parameters, documentType: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Typen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    <SelectItem value="policy">Richtlinie</SelectItem>
                    <SelectItem value="certificate">Zertifikat</SelectItem>
                    <SelectItem value="report">Bericht</SelectItem>
                    <SelectItem value="evidence">Nachweis</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="docStatus">Status (optional)</Label>
                <Select
                  value={reportData.parameters.status || ''}
                  onValueChange={(value) => 
                    setReportData(prev => ({ 
                      ...prev, 
                      parameters: { ...prev.parameters, status: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="draft">Entwurf</SelectItem>
                    <SelectItem value="pending_approval">Genehmigung ausstehend</SelectItem>
                    <SelectItem value="approved">Genehmigt</SelectItem>
                    <SelectItem value="archived">Archiviert</SelectItem>
                    <SelectItem value="expired">Abgelaufen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {selectedReport === 'workflows' && (
            <div className="space-y-3">
              <Label>Performance Optionen</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePerformance"
                  checked={reportData.parameters.includePerformance !== false}
                  onCheckedChange={(checked) => 
                    setReportData(prev => ({ 
                      ...prev, 
                      parameters: { ...prev.parameters, includePerformance: checked }
                    }))
                  }
                />
                <Label htmlFor="includePerformance" className="text-sm">
                  Performance-Metriken einschließen
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Benutzerdefinierte Templates</CardTitle>
          <CardDescription>
            Verwenden Sie eigene Report-Templates für spezielle Anforderungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="template">Template auswählen</Label>
            <Select
              value={customTemplate}
              onValueChange={setCustomTemplate}
              disabled={templatesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Template wählen..." />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {selectedReport && (
            <Button
              onClick={() => handlePredefinedReport(selectedReport)}
              disabled={isGenerating || !reportData.title}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Play className="h-4 w-4" />
              )}
              {predefinedReports.find(r => r.id === selectedReport)?.name} generieren
            </Button>
          )}
          
          {customTemplate && (
            <Button
              variant="outline"
              onClick={handleCustomReport}
              disabled={isGenerating || !reportData.title || !customTemplate}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              Custom Report generieren
            </Button>
          )}
        </div>

        <Button variant="outline" asChild>
          <a href="/reports">
            Alle Reports anzeigen
          </a>
        </Button>
      </div>

      {isGenerating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium">Report wird generiert...</p>
                <p className="text-sm text-muted-foreground">
                  Dies kann einige Minuten dauern. Sie werden benachrichtigt, wenn der Report fertig ist.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}