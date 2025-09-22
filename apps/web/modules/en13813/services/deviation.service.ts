import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'
import { evaluateConformity, type Deviation, type CorrectiveAction, type EffectivenessCheck } from '../schemas/deviation.schema'

/**
 * EN 13813:2002 CAPA Service
 * Implements § 6.3.2.2, § 6.3.4, § 6.3.6, § 9.2
 */
export class DeviationService {
  private supabase

  constructor() {
    this.supabase = createServerComponentClient<Database>({ cookies })
  }

  /**
   * Create a new deviation with automatic conformity evaluation
   */
  async createDeviation(data: Partial<Deviation>): Promise<Deviation> {
    // Evaluate conformity if test results provided
    if (data.test_results && data.conformity_mode && data.target_class) {
      const values = data.test_results.map(r => r.value)
      const targetValue = this.parseTargetValue(data.target_class)

      const evaluation = evaluateConformity(
        data.conformity_mode,
        values,
        targetValue,
        values.length
      )

      data.conformity_passed = evaluation.passed
      data.conformity_details = evaluation.details
      data.mean_value = evaluation.mean
      data.std_deviation = evaluation.stdDev
      data.min_value = evaluation.minValue
      data.max_value = evaluation.maxValue

      // Auto-set severity based on conformity
      if (!evaluation.passed && !data.severity && data.affected_characteristic) {
        data.severity = this.determineSeverity(data.affected_characteristic, evaluation)
      }

      // Auto-set immediate action flags for failures
      if (!evaluation.passed) {
        data.immediate_action_required = true
        data.batch_blocked = true
        data.marking_blocked = true
        if (!data.disposition) {
          data.disposition = 'quarantine'
        }
      }
    }

    const { data: deviation, error } = await this.supabase
      .from('en13813_deviations')
      .insert(data)
      .select()
      .single()

    if (error) throw error

    // Create initial effectiveness checks if needed
    if (!deviation.conformity_passed) {
      await this.scheduleAutomaticEffectivenessChecks(deviation.id)
    }

    // Check for recurring issues
    const similarDeviations = await this.findSimilarDeviations(deviation)
    if (similarDeviations.length > 2) {
      // Flag as potential systemic issue
      await this.flagSystemicIssue(deviation.id, similarDeviations)
    }

    return deviation
  }

  /**
   * Update deviation with validation
   */
  async updateDeviation(id: string, data: Partial<Deviation>): Promise<Deviation> {
    // Re-evaluate conformity if test results changed
    if (data.test_results) {
      const values = data.test_results.map(r => r.value)
      const targetValue = this.parseTargetValue(data.target_class!)

      const evaluation = evaluateConformity(
        data.conformity_mode!,
        values,
        targetValue,
        values.length
      )

      data.conformity_passed = evaluation.passed
      data.conformity_details = evaluation.details
      data.mean_value = evaluation.mean
      data.std_deviation = evaluation.stdDev
      data.min_value = evaluation.minValue
      data.max_value = evaluation.maxValue
    }

    // Validate workflow transitions
    const currentDeviation = await this.getDeviation(id)
    this.validateStatusTransition(currentDeviation.status, data.status!)

    // Check sign-off requirements
    if (data.status === 'closed') {
      if (!data.disposition) {
        throw new Error('Disposition required before closure')
      }
      if (!data.approved_by) {
        throw new Error('Approval required for closure')
      }

      // Check all effectiveness checks completed
      const pendingChecks = await this.getPendingEffectivenessChecks(id)
      if (pendingChecks.length > 0) {
        throw new Error('All effectiveness checks must be completed before closure')
      }
    }

    const { data: deviation, error } = await this.supabase
      .from('en13813_deviations')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return deviation
  }

  /**
   * Get deviation with all related data
   */
  async getDeviation(id: string): Promise<Deviation> {
    const { data, error } = await this.supabase
      .from('en13813_deviations')
      .select(`
        *,
        recipe:en13813_recipes(id, code, designation),
        batch:en13813_batches(id, batch_number),
        test:en13813_tests(id, test_type, standard),
        device:en13813_devices(id, name, next_cal_at)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  /**
   * List deviations with filters
   */
  async listDeviations(filters?: {
    status?: string[]
    severity?: string[]
    type?: string[]
    date_from?: string
    date_to?: string
    recipe_id?: string
    batch_id?: string
    has_pending_effectiveness_check?: boolean
  }): Promise<Deviation[]> {
    let query = this.supabase
      .from('en13813_deviations')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }
    if (filters?.severity && filters.severity.length > 0) {
      query = query.in('severity', filters.severity)
    }
    if (filters?.type && filters.type.length > 0) {
      query = query.in('deviation_type', filters.type)
    }
    if (filters?.date_from) {
      query = query.gte('discovered_date', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('discovered_date', filters.date_to)
    }
    if (filters?.recipe_id) {
      query = query.eq('recipe_id', filters.recipe_id)
    }
    if (filters?.batch_id) {
      query = query.eq('batch_id', filters.batch_id)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Add corrective action
   */
  async addCorrectiveAction(deviationId: string, action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    // Generate action number
    const { count } = await this.supabase
      .from('en13813_corrective_actions')
      .select('*', { count: 'exact', head: true })
      .eq('deviation_id', deviationId)

    action.action_number = `CA-${(count || 0) + 1}`
    action.deviation_id = deviationId

    const { data, error } = await this.supabase
      .from('en13813_corrective_actions')
      .insert(action)
      .select()
      .single()

    if (error) throw error

    // Check if ITT required
    if (action.procedure_update_required || action.system_wide_change) {
      await this.markITTRequired(deviationId)
    }

    return data
  }

  /**
   * Schedule effectiveness check
   */
  async scheduleEffectivenessCheck(deviationId: string, check: Partial<EffectivenessCheck>): Promise<EffectivenessCheck> {
    // Generate check number
    const { count } = await this.supabase
      .from('en13813_effectiveness_checks')
      .select('*', { count: 'exact', head: true })
      .eq('deviation_id', deviationId)

    check.check_number = `EC-${(count || 0) + 1}`
    check.deviation_id = deviationId

    const { data, error } = await this.supabase
      .from('en13813_effectiveness_checks')
      .insert(check)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Perform effectiveness check with conformity evaluation
   */
  async performEffectivenessCheck(checkId: string, results: any): Promise<void> {
    const check = await this.getEffectivenessCheck(checkId)
    const deviation = await this.getDeviation(check.deviation_id)

    // Evaluate conformity if test values provided
    if (results.test_values && results.test_values.length > 0) {
      const targetValue = this.parseTargetValue(deviation.target_class)
      const evaluation = evaluateConformity(
        check.conformity_check_mode || deviation.conformity_mode,
        results.test_values,
        targetValue,
        results.test_values.length
      )

      results.mean_result = evaluation.mean
      results.std_result = evaluation.stdDev
      results.conformity_evaluation = evaluation.details
      results.results = {
        ...results.results,
        criteria_met: evaluation.passed
      }

      // Determine effectiveness rating
      if (evaluation.passed) {
        results.effectiveness_rating = 'effective'
      } else if (evaluation.minValue >= targetValue * 0.95) {
        results.effectiveness_rating = 'partially_effective'
      } else {
        results.effectiveness_rating = 'not_effective'
        results.follow_up_required = true
      }
    }

    const { error } = await this.supabase
      .from('en13813_effectiveness_checks')
      .update({
        ...results,
        performed_date: new Date().toISOString()
      })
      .eq('id', checkId)

    if (error) throw error

    // Check if all effectiveness checks complete
    await this.checkDeviationCompleteness(check.deviation_id)
  }

  /**
   * Get overdue effectiveness checks
   */
  async getOverdueEffectivenessChecks(): Promise<EffectivenessCheck[]> {
    const { data, error } = await this.supabase
      .from('en13813_effectiveness_checks')
      .select('*')
      .is('performed_date', null)
      .lt('planned_date', new Date().toISOString())
      .order('planned_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Get pending effectiveness checks for a deviation
   */
  async getPendingEffectivenessChecks(deviationId: string): Promise<EffectivenessCheck[]> {
    const { data, error } = await this.supabase
      .from('en13813_effectiveness_checks')
      .select('*')
      .eq('deviation_id', deviationId)
      .is('performed_date', null)

    if (error) throw error
    return data || []
  }

  /**
   * Get CAPA statistics for dashboard
   */
  async getCAPAStatistics(tenantId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('en13813_capa_statistics')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Check if device is calibrated
   */
  async isDeviceCalibrated(deviceId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('en13813_devices')
      .select('next_cal_at, status')
      .eq('id', deviceId)
      .single()

    if (error) throw error

    const nextCalDate = new Date(data.next_cal_at)
    const now = new Date()

    return data.status === 'ok' && nextCalDate > now
  }

  /**
   * Block batch for deviation
   */
  async blockBatch(batchId: string, deviationNumber: string): Promise<void> {
    const { error } = await this.supabase
      .from('en13813_batches')
      .update({
        status: 'quarantined',
        notes: `[AUTO] Quarantined due to deviation ${deviationNumber}`
      })
      .eq('id', batchId)

    if (error) throw error
  }

  // Helper Methods

  private parseTargetValue(targetClass: string): number {
    // Extract numeric value from class designation (e.g., "C25" -> 25)
    const match = targetClass.match(/\d+(\.\d+)?/)
    return match ? parseFloat(match[0]) : 0
  }

  private determineSeverity(characteristic: string, evaluation: any): 'critical' | 'major' | 'minor' {
    const deviation = Math.abs((evaluation.minValue - this.parseTargetValue(characteristic)) / this.parseTargetValue(characteristic))

    if (deviation > 0.2) return 'critical' // >20% deviation
    if (deviation > 0.1) return 'major' // >10% deviation
    return 'minor'
  }

  private async scheduleAutomaticEffectivenessChecks(deviationId: string): Promise<void> {
    const now = new Date()

    // Immediate check (3 days)
    await this.scheduleEffectivenessCheck(deviationId, {
      check_type: 'immediate',
      check_method: 'test',
      planned_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      success_criteria: [
        { description: 'Repeat test meets target class', target: 'Target class value', tolerance: '±0%' }
      ]
    })

    // Short-term check (14 days)
    await this.scheduleEffectivenessCheck(deviationId, {
      check_type: 'short_term',
      check_method: 'trend_analysis',
      planned_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      success_criteria: [
        { description: 'Next 5 batches meet specification', target: '100% conformity', tolerance: 'None' }
      ]
    })

    // Long-term check (90 days)
    await this.scheduleEffectivenessCheck(deviationId, {
      check_type: 'long_term',
      check_method: 'trend_analysis',
      planned_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      success_criteria: [
        { description: '3-month trend shows stability', target: 'No recurring deviations', tolerance: 'Max 1 minor' }
      ]
    })
  }

  private async findSimilarDeviations(deviation: Deviation): Promise<Deviation[]> {
    const { data, error } = await this.supabase
      .from('en13813_deviations')
      .select('*')
      .eq('affected_characteristic', deviation.affected_characteristic)
      .eq('recipe_id', deviation.recipe_id)
      .neq('id', deviation.id)
      .gte('discovered_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()) // Last 6 months

    if (error) throw error
    return data || []
  }

  private async flagSystemicIssue(deviationId: string, similarDeviations: Deviation[]): Promise<void> {
    const note = `SYSTEMIC ISSUE DETECTED: ${similarDeviations.length} similar deviations in last 6 months`

    await this.supabase
      .from('en13813_deviations')
      .update({
        severity: 'major',
        root_cause_conclusion: note
      })
      .eq('id', deviationId)
  }

  private async markITTRequired(deviationId: string): Promise<void> {
    await this.supabase
      .from('en13813_deviations')
      .update({
        itt_required: true
      })
      .eq('id', deviationId)
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      'open': ['investigation', 'rejected'],
      'investigation': ['corrective_action', 'closed', 'rejected'],
      'corrective_action': ['effectiveness_check', 'closed'],
      'effectiveness_check': ['corrective_action', 'closed'],
      'closed': [],
      'rejected': []
    }

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`)
    }
  }

  private async checkDeviationCompleteness(deviationId: string): Promise<void> {
    const pendingChecks = await this.getPendingEffectivenessChecks(deviationId)
    const { data: pendingActions } = await this.supabase
      .from('en13813_corrective_actions')
      .select('*')
      .eq('deviation_id', deviationId)
      .in('status', ['planned', 'in_progress'])

    if (pendingChecks.length === 0 && (!pendingActions || pendingActions.length === 0)) {
      // All checks and actions complete, can be closed
      await this.supabase
        .from('en13813_deviations')
        .update({ status: 'effectiveness_check' })
        .eq('id', deviationId)
    }
  }

  private async getEffectivenessCheck(checkId: string): Promise<EffectivenessCheck> {
    const { data, error } = await this.supabase
      .from('en13813_effectiveness_checks')
      .select('*')
      .eq('id', checkId)
      .single()

    if (error) throw error
    return data
  }
}