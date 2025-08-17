import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService, AppError } from './base.service'
import type { Database } from '@/types/database.types'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

type ReportTemplate = Database['public']['Tables']['report_templates']['Row']
type ReportTemplateInsert = Database['public']['Tables']['report_templates']['Insert']
type Report = Database['public']['Tables']['reports']['Row']
type ReportInsert = Database['public']['Tables']['reports']['Insert']
type ReportDataSource = Database['public']['Tables']['report_data_sources']['Row']

export interface ReportGenerationParams {
  templateId: string
  title: string
  description?: string
  parameters?: Record<string, any>
  format?: 'pdf' | 'html' | 'csv' | 'json'
  scheduleFor?: string
  isPublic?: boolean
  expiresAt?: string
}

export interface ReportData {
  [key: string]: any
}

export interface ReportContent {
  title: string
  subtitle?: string
  sections: ReportSection[]
  metadata: {
    generatedAt: string
    generatedBy: string
    parameters: Record<string, any>
    dataSourceTimestamp: string
  }
}

export interface ReportSection {
  id: string
  name: string
  title: string
  type: 'summary' | 'chart' | 'table' | 'text' | 'metrics'
  data: any
  config: Record<string, any>
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area'
  xAxis?: string
  yAxis?: string
  title?: string
  colors?: string[]
}

export interface TableConfig {
  columns: Array<{
    key: string
    title: string
    type?: 'text' | 'number' | 'date' | 'status' | 'badge'
    format?: string
  }>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  showRowNumbers?: boolean
}

export class ReportService extends BaseService<Report> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'reports')
  }

  // Report Templates
  async getReportTemplates(type?: string): Promise<ReportTemplate[]> {
    let query = this.supabase
      .from('report_templates')
      .select('*')
      .eq('is_active', true)

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query.order('name')

    if (error) throw new AppError(error.message, error.code)
    return data || []
  }

  async createReportTemplate(template: ReportTemplateInsert): Promise<ReportTemplate> {
    const tenantId = await this.getCurrentTenantId()
    
    const templateData = {
      ...template,
      tenant_id: tenantId,
    }

    const { data, error } = await this.supabase
      .from('report_templates')
      .insert(templateData)
      .select()
      .single()

    if (error) throw new AppError(error.message, error.code)

    await this.createAuditLog('report_template_created', data.id, {
      template_name: data.name,
      template_type: data.type
    })

    return data
  }

  // Report Generation
  async generateReport(params: ReportGenerationParams): Promise<Report> {
    const tenantId = await this.getCurrentTenantId()
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) throw new AppError('User not authenticated', 'UNAUTHENTICATED', 401)

    // Get template
    const template = await this.getReportTemplate(params.templateId)
    if (!template) {
      throw new AppError('Report template not found', 'TEMPLATE_NOT_FOUND', 404)
    }

    // Create report record
    const reportData: ReportInsert = {
      tenant_id: tenantId,
      template_id: params.templateId,
      title: params.title,
      description: params.description,
      type: template.type as any,
      format: params.format || 'pdf',
      config: template.config,
      parameters: params.parameters || {},
      status: 'generating',
      scheduled_for: params.scheduleFor,
      is_public: params.isPublic || false,
      expires_at: params.expiresAt,
      generated_by: user.id,
      started_at: new Date().toISOString()
    }

    const { data: report, error } = await this.supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single()

    if (error) throw new AppError(error.message, error.code)

    // Generate report content asynchronously
    this.generateReportContent(report, template).catch(error => {
      console.error('Report generation failed:', error)
      this.updateReportStatus(report.id, 'failed', error.message)
    })

    return report
  }

  private async generateReportContent(report: Report, template: ReportTemplate): Promise<void> {
    try {
      // Collect data from all data sources
      const reportData = await this.collectReportData(template, report.parameters)
      
      // Generate report content
      const content = await this.buildReportContent(template, reportData, report.parameters)
      
      // Generate PDF if required
      let storagePath: string | null = null
      let fileSize: number | null = null
      let checksum: string | null = null

      if (report.format === 'pdf') {
        const pdfResult = await this.generatePDF(content, template)
        storagePath = pdfResult.storagePath
        fileSize = pdfResult.fileSize
        checksum = pdfResult.checksum
      }

      // Update report with results
      await this.supabase
        .from('reports')
        .update({
          data: reportData,
          content: content,
          storage_path: storagePath,
          file_size: fileSize,
          checksum: checksum,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', report.id)

      await this.createAuditLog('report_generated', report.id, {
        report_title: report.title,
        format: report.format,
        file_size: fileSize
      })

    } catch (error: any) {
      await this.updateReportStatus(report.id, 'failed', error.message)
      throw error
    }
  }

  private async collectReportData(template: ReportTemplate, parameters: Record<string, any>): Promise<ReportData> {
    const tenantId = await this.getCurrentTenantId()
    const dataSourceNames = template.data_sources as string[]
    const reportData: ReportData = {}

    // Get data source configurations
    const { data: dataSources, error } = await this.supabase
      .from('report_data_sources')
      .select('*')
      .in('name', dataSourceNames)
      .eq('is_active', true)

    if (error) throw new AppError(error.message, error.code)

    // Execute each data source query
    for (const dataSource of dataSources || []) {
      try {
        const data = await this.executeDataSourceQuery(dataSource, tenantId, parameters)
        reportData[dataSource.name] = data
      } catch (error: any) {
        console.error(`Failed to execute data source ${dataSource.name}:`, error)
        reportData[dataSource.name] = { error: error.message }
      }
    }

    return reportData
  }

  private async executeDataSourceQuery(
    dataSource: ReportDataSource, 
    tenantId: string, 
    parameters: Record<string, any>
  ): Promise<any> {
    if (dataSource.type === 'sql' && dataSource.query_template) {
      // Replace parameters in SQL template
      let query = dataSource.query_template
      const queryParams = [tenantId]

      // Add additional parameters based on the query
      if (parameters.startDate) queryParams.push(parameters.startDate)
      if (parameters.endDate) queryParams.push(parameters.endDate)
      if (parameters.status) queryParams.push(parameters.status)
      if (parameters.type) queryParams.push(parameters.type)

      const { data, error } = await this.supabase.rpc('execute_report_query', {
        query_text: query,
        query_params: queryParams
      })

      if (error) throw new AppError(error.message, error.code)
      return data
    }

    throw new AppError(`Unsupported data source type: ${dataSource.type}`, 'INVALID_DATA_SOURCE')
  }

  private async buildReportContent(
    template: ReportTemplate, 
    reportData: ReportData,
    parameters: Record<string, any>
  ): Promise<ReportContent> {
    const config = template.config as any
    const sections: ReportSection[] = []

    // Build sections based on template configuration
    if (config.sections) {
      for (const sectionName of config.sections) {
        const section = await this.buildReportSection(sectionName, reportData, config)
        if (section) sections.push(section)
      }
    }

    return {
      title: config.title || template.name,
      subtitle: config.subtitle,
      sections,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'System', // TODO: Get actual user name
        parameters,
        dataSourceTimestamp: new Date().toISOString()
      }
    }
  }

  private async buildReportSection(
    sectionName: string, 
    reportData: ReportData, 
    config: any
  ): Promise<ReportSection | null> {
    switch (sectionName) {
      case 'summary':
        return this.buildSummarySection(reportData)
      case 'documents':
        return this.buildDocumentsSection(reportData)
      case 'workflows':
        return this.buildWorkflowsSection(reportData)
      case 'audit':
        return this.buildAuditSection(reportData)
      case 'overview':
        return this.buildOverviewSection(reportData)
      case 'performance_metrics':
        return this.buildPerformanceSection(reportData)
      default:
        console.warn(`Unknown section type: ${sectionName}`)
        return null
    }
  }

  private buildSummarySection(reportData: ReportData): ReportSection {
    const complianceData = reportData['Compliance Dashboard'] || {}
    
    return {
      id: 'summary',
      name: 'summary',
      title: 'Zusammenfassung',
      type: 'metrics',
      data: {
        metrics: [
          {
            label: 'Genehmigte Dokumente',
            value: complianceData.approved_documents || 0,
            trend: '+5%',
            color: 'green'
          },
          {
            label: 'Abgeschlossene Workflows',
            value: complianceData.completed_workflows || 0,
            trend: '+12%',
            color: 'blue'
          },
          {
            label: 'Aktive Workflows',
            value: complianceData.active_workflows || 0,
            trend: '-2%',
            color: 'orange'
          }
        ]
      },
      config: {}
    }
  }

  private buildDocumentsSection(reportData: ReportData): ReportSection {
    const documentsData = reportData['Documents Overview'] || []
    
    return {
      id: 'documents',
      name: 'documents',
      title: 'Dokumente Übersicht',
      type: 'table',
      data: {
        rows: documentsData,
        summary: {
          total: documentsData.reduce((sum: number, row: any) => sum + (row.count || 0), 0)
        }
      },
      config: {
        columns: [
          { key: 'type', title: 'Typ', type: 'text' },
          { key: 'status', title: 'Status', type: 'status' },
          { key: 'count', title: 'Anzahl', type: 'number' }
        ],
        sortBy: 'count',
        sortOrder: 'desc'
      } as TableConfig
    }
  }

  private buildWorkflowsSection(reportData: ReportData): ReportSection {
    const workflowsData = reportData['Workflow Summary'] || []
    
    return {
      id: 'workflows',
      name: 'workflows',
      title: 'Workflow Status',
      type: 'chart',
      data: {
        chartData: workflowsData,
        summary: {
          total: workflowsData.reduce((sum: number, row: any) => sum + (row.count || 0), 0)
        }
      },
      config: {
        type: 'pie',
        title: 'Workflows nach Status',
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
      } as ChartConfig
    }
  }

  private buildAuditSection(reportData: ReportData): ReportSection {
    const auditData = reportData['Audit Trail'] || []
    
    return {
      id: 'audit',
      name: 'audit',
      title: 'Audit Trail',
      type: 'table',
      data: {
        rows: auditData.slice(0, 50), // Limit to last 50 entries
        summary: {
          total: auditData.length
        }
      },
      config: {
        columns: [
          { key: 'date', title: 'Datum', type: 'date' },
          { key: 'action', title: 'Aktion', type: 'text' },
          { key: 'resource_type', title: 'Ressource', type: 'text' },
          { key: 'count', title: 'Anzahl', type: 'number' }
        ],
        sortBy: 'date',
        sortOrder: 'desc'
      } as TableConfig
    }
  }

  private buildOverviewSection(reportData: ReportData): ReportSection {
    const documentsData = reportData['Documents Overview'] || []
    
    return {
      id: 'overview',
      name: 'overview',
      title: 'Gesamtübersicht',
      type: 'chart',
      data: {
        chartData: documentsData,
        summary: {
          totalDocuments: documentsData.reduce((sum: number, row: any) => sum + (row.count || 0), 0),
          documentTypes: documentsData.length
        }
      },
      config: {
        type: 'bar',
        title: 'Dokumente nach Typ',
        xAxis: 'type',
        yAxis: 'count',
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      } as ChartConfig
    }
  }

  private buildPerformanceSection(reportData: ReportData): ReportSection {
    const workflowsData = reportData['Workflow Summary'] || []
    
    return {
      id: 'performance',
      name: 'performance_metrics',
      title: 'Performance Metriken',
      type: 'metrics',
      data: {
        metrics: [
          {
            label: 'Durchschnittliche Bearbeitungszeit',
            value: '2.5 Tage',
            trend: '-15%',
            color: 'green'
          },
          {
            label: 'Workflow Erfolgsrate',
            value: '94%',
            trend: '+3%',
            color: 'green'
          },
          {
            label: 'Überfällige Aufgaben',
            value: '3',
            trend: '-50%',
            color: 'red'
          }
        ]
      },
      config: {}
    }
  }

  private async generatePDF(content: ReportContent, template: ReportTemplate): Promise<{
    storagePath: string
    fileSize: number
    checksum: string
  }> {
    // Create PDF using jsPDF
    const pdf = new jsPDF({
      orientation: (template.layout as any)?.orientation || 'portrait',
      unit: 'mm',
      format: (template.layout as any)?.format || 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Add title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(content.title, margin, yPosition)
    yPosition += 15

    if (content.subtitle) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'normal')
      pdf.text(content.subtitle, margin, yPosition)
      yPosition += 10
    }

    // Add metadata
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'italic')
    pdf.text(`Erstellt am: ${new Date(content.metadata.generatedAt).toLocaleDateString('de-DE')}`, margin, yPosition)
    yPosition += 20

    // Add sections
    for (const section of content.sections) {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage()
        yPosition = margin
      }

      // Section title
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(section.title, margin, yPosition)
      yPosition += 10

      // Section content based on type
      if (section.type === 'metrics') {
        yPosition = this.addMetricsToPDF(pdf, section.data.metrics, margin, yPosition, pageWidth - 2 * margin)
      } else if (section.type === 'table') {
        yPosition = this.addTableToPDF(pdf, section.data.rows, section.config as TableConfig, margin, yPosition, pageWidth - 2 * margin)
      } else if (section.type === 'chart') {
        // For charts, we would need to generate an image and add it
        // This is a placeholder for chart rendering
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Chart: ' + (section.config as ChartConfig).title || section.title, margin, yPosition)
        yPosition += 20
      }

      yPosition += 10
    }

    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer')
    const fileName = `report_${Date.now()}.pdf`
    const storagePath = `reports/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from('documents')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) throw new AppError(uploadError.message, 'UPLOAD_FAILED')

    // Calculate file size and checksum
    const fileSize = pdfBuffer.byteLength
    const checksum = await this.calculateChecksum(pdfBuffer)

    return {
      storagePath,
      fileSize,
      checksum
    }
  }

  private addMetricsToPDF(
    pdf: jsPDF, 
    metrics: any[], 
    x: number, 
    y: number, 
    width: number
  ): number {
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')

    for (const metric of metrics) {
      pdf.text(`${metric.label}: ${metric.value}`, x, y)
      if (metric.trend) {
        pdf.setTextColor(metric.color === 'green' ? 0 : metric.color === 'red' ? 255 : 0, 
                         metric.color === 'green' ? 128 : 0, 
                         0)
        pdf.text(`(${metric.trend})`, x + 80, y)
        pdf.setTextColor(0, 0, 0) // Reset to black
      }
      y += 8
    }

    return y + 5
  }

  private addTableToPDF(
    pdf: jsPDF, 
    rows: any[], 
    config: TableConfig, 
    x: number, 
    y: number, 
    width: number
  ): number {
    if (!rows || rows.length === 0) return y

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')

    // Column headers
    const colWidth = width / config.columns.length
    config.columns.forEach((col, index) => {
      pdf.text(col.title, x + index * colWidth, y)
    })

    y += 8
    pdf.setFont('helvetica', 'normal')

    // Table rows
    rows.forEach(row => {
      config.columns.forEach((col, index) => {
        const value = row[col.key]?.toString() || ''
        pdf.text(value, x + index * colWidth, y)
      })
      y += 6
    })

    return y + 10
  }

  private async calculateChecksum(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Utility methods
  private async getReportTemplate(id: string): Promise<ReportTemplate | null> {
    const { data, error } = await this.supabase
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new AppError(error.message, error.code)
    }

    return data || null
  }

  private async updateReportStatus(id: string, status: string, errorDetails?: string): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'failed' && errorDetails) {
      updateData.error_details = errorDetails
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    await this.supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
  }

  // Public methods for frontend
  async getReports(filters: {
    status?: string
    type?: string
    createdBy?: string
    startDate?: string
    endDate?: string
  } = {}): Promise<Report[]> {
    let query = this.supabase
      .from('reports')
      .select('*, report_templates(name)')

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.type) query = query.eq('type', filters.type)
    if (filters.createdBy) query = query.eq('generated_by', filters.createdBy)
    if (filters.startDate) query = query.gte('created_at', filters.startDate)
    if (filters.endDate) query = query.lte('created_at', filters.endDate)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw new AppError(error.message, error.code)
    return data || []
  }

  async downloadReport(reportId: string): Promise<string> {
    const report = await this.findById(reportId)
    if (!report) {
      throw new AppError('Report not found', 'REPORT_NOT_FOUND', 404)
    }

    if (!report.storage_path) {
      throw new AppError('Report file not available', 'FILE_NOT_AVAILABLE', 404)
    }

    // Generate signed URL for download
    const { data, error } = await this.supabase.storage
      .from('documents')
      .createSignedUrl(report.storage_path, 3600) // 1 hour expiry

    if (error) throw new AppError(error.message, 'DOWNLOAD_FAILED')

    // Log access
    await this.logReportAccess(reportId, 'download')

    return data.signedUrl
  }

  async shareReport(reportId: string, expiresInHours: number = 24): Promise<string> {
    const shareToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()

    await this.supabase
      .from('reports')
      .update({
        is_public: true,
        share_token: shareToken,
        expires_at: expiresAt
      })
      .eq('id', reportId)

    await this.logReportAccess(reportId, 'share')

    return shareToken
  }

  private async logReportAccess(reportId: string, method: string): Promise<void> {
    const tenantId = await this.getCurrentTenantId()
    const { data: { user } } = await this.supabase.auth.getUser()

    await this.supabase
      .from('report_access_logs')
      .insert({
        report_id: reportId,
        tenant_id: tenantId,
        accessed_by: user?.id || null,
        access_method: method,
        accessed_at: new Date().toISOString()
      })
  }
}