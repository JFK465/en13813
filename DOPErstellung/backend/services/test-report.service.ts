import { BaseService, BaseEntity } from '@/lib/core/base.service'
import { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Test result schemas
export const testResultSchema = z.object({
  value: z.union([z.number(), z.string()]),
  unit: z.string(),
  test_method: z.string()
})

export const testResultsSchema = z.object({
  compressive_strength: testResultSchema.optional(),
  flexural_strength: testResultSchema.optional(),
  fire_behavior: z.object({
    class: z.string(),
    test_method: z.string()
  }).optional(),
  emissions: z.object({
    TVOC: z.string().optional(),
    formaldehyde: z.string().optional()
  }).optional(),
  density: testResultSchema.optional(),
  flow_diameter: testResultSchema.optional(),
  setting_time: testResultSchema.optional(),
  shrinkage: testResultSchema.optional(),
  adhesion: testResultSchema.optional()
})

export const testReportSchema = z.object({
  recipe_id: z.string().uuid(),
  report_number: z.string().min(1),
  test_type: z.enum(['initial_type_test', 'factory_control', 'audit']),
  test_date: z.string().datetime(),
  testing_body: z.string().min(1),
  notified_body_number: z.string().optional(),
  test_results: testResultsSchema,
  document_id: z.string().uuid().optional(),
  valid_until: z.string().datetime().optional(),
  status: z.enum(['valid', 'expired', 'revoked']).default('valid')
})

export interface TestReport extends BaseEntity {
  recipe_id: string
  report_number: string
  test_type: 'initial_type_test' | 'factory_control' | 'audit'
  test_date: string
  testing_body: string
  notified_body_number?: string
  test_results: z.infer<typeof testResultsSchema>
  document_id?: string
  valid_until?: string
  status: 'valid' | 'expired' | 'revoked'
}

export class TestReportService extends BaseService<TestReport> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'en13813_test_reports')
  }

  async create(data: z.infer<typeof testReportSchema>): Promise<TestReport> {
    // Validate input
    const validated = testReportSchema.parse(data)

    // Check for duplicate report number
    const { data: existing } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('report_number', validated.report_number)
      .single()

    if (existing) {
      throw new Error(`Report number ${validated.report_number} already exists`)
    }

    // Set valid_until if not provided (default 3 years for initial type test)
    if (!validated.valid_until && validated.test_type === 'initial_type_test') {
      const validUntilDate = new Date(validated.test_date)
      validUntilDate.setFullYear(validUntilDate.getFullYear() + 3)
      validated.valid_until = validUntilDate.toISOString()
    }

    return super.create(validated)
  }

  async getByRecipe(recipeId: string) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('recipe_id', recipeId)
      .order('test_date', { ascending: false })

    if (error) throw error
    return data as TestReport[]
  }

  async getValidReports(recipeId?: string) {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', 'valid')

    if (recipeId) {
      query = query.eq('recipe_id', recipeId)
    }

    // Check if valid_until is in the future or null
    query = query.or('valid_until.is.null,valid_until.gt.' + new Date().toISOString())

    const { data, error } = await query.order('test_date', { ascending: false })

    if (error) throw error
    return data as TestReport[]
  }

  async checkExpiredReports() {
    // Find all reports that should be expired
    const { data: expiredReports, error } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('status', 'valid')
      .lt('valid_until', new Date().toISOString())

    if (error) throw error

    // Update their status
    if (expiredReports && expiredReports.length > 0) {
      const ids = expiredReports.map(r => r.id)
      await this.supabase
        .from(this.tableName)
        .update({ status: 'expired' })
        .in('id', ids)

      // Create notifications for expired reports
      await this.createExpirationNotifications(ids)
    }

    return expiredReports?.length || 0
  }

  async getExpiringReports(daysAhead = 90) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        recipe:en13813_recipes(
          recipe_code,
          name
        )
      `)
      .eq('status', 'valid')
      .gte('valid_until', new Date().toISOString())
      .lte('valid_until', futureDate.toISOString())
      .order('valid_until')

    if (error) throw error
    return data
  }

  async attachDocument(reportId: string, documentId: string) {
    return this.update(reportId, { document_id: documentId })
  }

  async revokeReport(reportId: string, reason?: string) {
    const report = await this.getById(reportId)
    if (!report) {
      throw new Error('Report not found')
    }

    await this.update(reportId, { status: 'revoked' })

    // Create audit log with reason
    await this.createAuditLog('revoke', reportId, { reason })

    // Create notification
    await this.createRevocationNotification(report)

    return report
  }

  async getReportStatistics() {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('status, test_type')

    if (error) throw error

    const stats = {
      total: data.length,
      by_status: {} as Record<string, number>,
      by_type: {} as Record<string, number>,
      expiring_soon: 0
    }

    data.forEach(report => {
      stats.by_status[report.status] = (stats.by_status[report.status] || 0) + 1
      stats.by_type[report.test_type] = (stats.by_type[report.test_type] || 0) + 1
    })

    // Count expiring soon
    const expiringSoon = await this.getExpiringReports(30)
    stats.expiring_soon = expiringSoon.length

    return stats
  }

  async importFromCSV(csvData: string, recipeId: string) {
    // This would parse CSV data and create multiple test reports
    // Implementation would depend on the CSV format
    throw new Error('CSV import not yet implemented')
  }

  private async createExpirationNotifications(reportIds: string[]) {
    // Create notifications for expired reports
    const notifications = reportIds.map(id => ({
      type: 'test_report_expired',
      title: 'Test Report Expired',
      message: `Test report has expired and needs renewal`,
      resource_type: 'test_report',
      resource_id: id,
      priority: 'high'
    }))

    await this.supabase.from('notifications').insert(notifications)
  }

  private async createRevocationNotification(report: TestReport) {
    await this.supabase.from('notifications').insert({
      type: 'test_report_revoked',
      title: 'Test Report Revoked',
      message: `Test report ${report.report_number} has been revoked`,
      resource_type: 'test_report',
      resource_id: report.id,
      priority: 'high'
    })
  }

  async validateTestResults(results: any): z.infer<typeof testResultsSchema> {
    return testResultsSchema.parse(results)
  }
}