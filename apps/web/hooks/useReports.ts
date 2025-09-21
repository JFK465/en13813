'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ReportService, ReportGenerationParams } from '@/lib/core/reports'
import { createClient } from '@/lib/supabase/client'

const reportService = new ReportService(createClient())

// Report Templates
export function useReportTemplates(type?: string) {
  return useQuery({
    queryKey: ['report-templates', type],
    queryFn: () => reportService.getReportTemplates(type),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateReportTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (template: any) => reportService.createReportTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] })
      toast.success('Report template created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create report template')
    },
  })
}

// Reports
export function useReports(filters?: {
  status?: string
  type?: string
  createdBy?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportService.getReports(filters || {}),
    refetchInterval: 30000, // Refetch every 30 seconds for status updates
  })
}

export function useReport(reportId: string) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportService.getById(reportId),
    enabled: !!reportId,
    refetchInterval: (query) => {
      // Refetch more frequently if report is generating
      return query.state.data?.status === 'generating' ? 5000 : 30000
    },
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: ReportGenerationParams) => reportService.generateReport(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success(`Report "${data.title}" generation started`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate report')
    },
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: (reportId: string) => reportService.downloadReport(reportId),
    onSuccess: (downloadUrl) => {
      // Open download in new tab
      window.open(downloadUrl, '_blank')
      toast.success('Report download started')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to download report')
    },
  })
}

export function useShareReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, expiresInHours }: { reportId: string; expiresInHours?: number }) => 
      reportService.shareReport(reportId, expiresInHours),
    onSuccess: (shareToken, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] })
      
      // Copy share link to clipboard
      const shareUrl = `${window.location.origin}/shared/reports/${shareToken}`
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Share link copied to clipboard')
      }).catch(() => {
        toast.success(`Share link created: ${shareUrl}`)
      })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to share report')
    },
  })
}

// Predefined report generation hooks
export function useGenerateComplianceReport() {
  const generateReport = useGenerateReport()

  return useMutation({
    mutationFn: (params: {
      title?: string
      startDate?: string
      endDate?: string
      includeAudit?: boolean
    }) => {
      const reportParams: ReportGenerationParams = {
        templateId: 'compliance-template', // This should be the actual template ID
        title: params.title || `Compliance Report - ${new Date().toLocaleDateString('de-DE')}`,
        description: 'Automatisch generierter Compliance-Bericht',
        parameters: {
          startDate: params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: params.endDate || new Date().toISOString().split('T')[0],
          includeAudit: params.includeAudit !== false
        },
        format: 'pdf'
      }
      return generateReport.mutateAsync(reportParams)
    },
    onSuccess: () => {
      toast.success('Compliance report generation started')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate compliance report')
    },
  })
}

export function useGenerateDocumentReport() {
  const generateReport = useGenerateReport()

  return useMutation({
    mutationFn: (params: {
      title?: string
      documentType?: string
      status?: string
    }) => {
      const reportParams: ReportGenerationParams = {
        templateId: 'document-template', // This should be the actual template ID
        title: params.title || `Document Report - ${new Date().toLocaleDateString('de-DE')}`,
        description: 'Dokumenten-Statusbericht',
        parameters: {
          documentType: params.documentType,
          status: params.status
        },
        format: 'pdf'
      }
      return generateReport.mutateAsync(reportParams)
    },
    onSuccess: () => {
      toast.success('Document report generation started')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate document report')
    },
  })
}

export function useGenerateWorkflowReport() {
  const generateReport = useGenerateReport()

  return useMutation({
    mutationFn: (params: {
      title?: string
      startDate?: string
      endDate?: string
      includePerformance?: boolean
    }) => {
      const reportParams: ReportGenerationParams = {
        templateId: 'workflow-template', // This should be the actual template ID
        title: params.title || `Workflow Report - ${new Date().toLocaleDateString('de-DE')}`,
        description: 'Workflow-Performance und Status Bericht',
        parameters: {
          startDate: params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: params.endDate || new Date().toISOString().split('T')[0],
          includePerformance: params.includePerformance !== false
        },
        format: 'pdf'
      }
      return generateReport.mutateAsync(reportParams)
    },
    onSuccess: () => {
      toast.success('Workflow report generation started')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate workflow report')
    },
  })
}

// Report analytics
export function useReportAnalytics() {
  return useQuery({
    queryKey: ['report-analytics'],
    queryFn: async () => {
      const reports = await reportService.getReports()
      
      // Calculate analytics
      const totalReports = reports.length
      const completedReports = reports.filter(r => r.status === 'completed').length
      const failedReports = reports.filter(r => r.status === 'failed').length
      const generatingReports = reports.filter(r => r.status === 'generating').length
      
      const reportsByType = reports.reduce((acc, report) => {
        acc[report.type] = (acc[report.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const recentReports = reports
        .filter(r => r.created_at)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
      
      return {
        totalReports,
        completedReports,
        failedReports,
        generatingReports,
        successRate: totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0,
        reportsByType,
        recentReports
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}