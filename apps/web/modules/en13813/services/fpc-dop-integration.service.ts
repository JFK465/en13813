import { SupabaseClient } from '@supabase/supabase-js'
import { DoP, Recipe, FPCControlPlan } from '../types'

export interface FPCValidationResult {
  valid: boolean
  compliant: boolean
  errors: string[]
  warnings: string[]
  lastAuditDate?: string
  nextAuditDate?: string
  complianceScore?: number
}

export interface FPCAuditRecord {
  id: string
  recipe_id: string
  dop_id?: string
  audit_date: string
  audit_type: 'internal' | 'external' | 'notified_body'
  auditor_name: string
  auditor_organization?: string
  
  // Compliance areas
  incoming_materials_compliant: boolean
  production_control_compliant: boolean
  testing_compliant: boolean
  calibration_compliant: boolean
  documentation_compliant: boolean
  
  // Results
  overall_compliant: boolean
  non_conformities: string[]
  corrective_actions: string[]
  
  // Certification
  certificate_number?: string
  valid_until?: string
  
  created_at: string
  created_by?: string
}

export class FPCDoPIntegrationService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Validate FPC compliance for DoP generation
   */
  async validateFPCForDoP(recipeId: string): Promise<FPCValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Get active FPC control plan
      const { data: fpcPlan, error: fpcError } = await this.supabase
        .from('en13813_fpc_control_plans')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('active', true)
        .single()

      if (fpcError || !fpcPlan) {
        errors.push('No active FPC control plan found for this recipe')
        return {
          valid: false,
          compliant: false,
          errors,
          warnings
        }
      }

      // Get latest FPC audit
      const { data: latestAudit, error: auditError } = await this.supabase
        .from('en13813_fpc_audits')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('audit_date', { ascending: false })
        .limit(1)
        .single()

      if (auditError || !latestAudit) {
        errors.push('No FPC audit records found')
        return {
          valid: false,
          compliant: false,
          errors,
          warnings
        }
      }

      // Check audit validity
      const auditDate = new Date(latestAudit.audit_date)
      const today = new Date()
      const daysSinceAudit = Math.floor((today.getTime() - auditDate.getTime()) / (1000 * 60 * 60 * 24))

      // EN 13813 requires FPC audit at least annually
      if (daysSinceAudit > 365) {
        errors.push(`FPC audit is outdated (${daysSinceAudit} days old). Annual audit required.`)
      } else if (daysSinceAudit > 270) {
        warnings.push(`FPC audit expires in ${365 - daysSinceAudit} days`)
      }

      // Check compliance status
      if (!latestAudit.overall_compliant) {
        errors.push('Latest FPC audit shows non-compliance')
        if (latestAudit.non_conformities && latestAudit.non_conformities.length > 0) {
          errors.push(`Non-conformities: ${latestAudit.non_conformities.join(', ')}`)
        }
      }

      // Check certificate validity for System 1+
      if (latestAudit.certificate_number && latestAudit.valid_until) {
        const validUntil = new Date(latestAudit.valid_until)
        if (validUntil < today) {
          errors.push('FPC certificate has expired')
        } else if (validUntil < new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) {
          warnings.push(`FPC certificate expires soon: ${latestAudit.valid_until}`)
        }
      }

      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(latestAudit)

      // Calculate next audit date
      const nextAuditDate = new Date(auditDate)
      nextAuditDate.setFullYear(nextAuditDate.getFullYear() + 1)

      return {
        valid: errors.length === 0,
        compliant: latestAudit.overall_compliant,
        errors,
        warnings,
        lastAuditDate: latestAudit.audit_date,
        nextAuditDate: nextAuditDate.toISOString().split('T')[0],
        complianceScore
      }
    } catch (error) {
      console.error('Error validating FPC:', error)
      errors.push('Error validating FPC compliance')
      return {
        valid: false,
        compliant: false,
        errors,
        warnings
      }
    }
  }

  /**
   * Link FPC audit to DoP
   */
  async linkFPCToDoP(dopId: string, auditId: string): Promise<boolean> {
    try {
      // Update audit record with DoP reference
      const { error: updateError } = await this.supabase
        .from('en13813_fpc_audits')
        .update({ dop_id: dopId })
        .eq('id', auditId)

      if (updateError) throw updateError

      // Update DoP with FPC reference
      const { error: dopError } = await this.supabase
        .from('en13813_dops')
        .update({ 
          fpc_audit_id: auditId,
          fpc_compliant: true
        })
        .eq('id', dopId)

      if (dopError) throw dopError

      return true
    } catch (error) {
      console.error('Error linking FPC to DoP:', error)
      return false
    }
  }

  /**
   * Create FPC audit record
   */
  async createFPCAudit(audit: Partial<FPCAuditRecord>): Promise<FPCAuditRecord | null> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_fpc_audits')
        .insert(audit)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating FPC audit:', error)
      return null
    }
  }

  /**
   * Get FPC test results for period
   */
  async getFPCTestResults(recipeId: string, fromDate: string, toDate: string) {
    try {
      const { data, error } = await this.supabase
        .from('en13813_fpc_test_results')
        .select('*')
        .eq('recipe_id', recipeId)
        .gte('test_date', fromDate)
        .lte('test_date', toDate)
        .order('test_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching FPC test results:', error)
      return []
    }
  }

  /**
   * Check FPC test frequency compliance
   */
  async checkTestFrequencyCompliance(
    recipeId: string,
    testType: string,
    requiredFrequencyDays: number
  ): Promise<{ compliant: boolean; message?: string }> {
    try {
      // Get last test of this type
      const { data: lastTest, error } = await this.supabase
        .from('en13813_fpc_test_results')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('test_type', testType)
        .order('test_date', { ascending: false })
        .limit(1)
        .single()

      if (error || !lastTest) {
        return {
          compliant: false,
          message: `No ${testType} test found`
        }
      }

      const lastTestDate = new Date(lastTest.test_date)
      const today = new Date()
      const daysSinceTest = Math.floor((today.getTime() - lastTestDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceTest > requiredFrequencyDays) {
        return {
          compliant: false,
          message: `${testType} test overdue by ${daysSinceTest - requiredFrequencyDays} days`
        }
      }

      return { compliant: true }
    } catch (error) {
      console.error('Error checking test frequency:', error)
      return {
        compliant: false,
        message: 'Error checking test frequency'
      }
    }
  }

  /**
   * Generate FPC compliance report for DoP
   */
  async generateFPCComplianceReport(recipeId: string): Promise<any> {
    const report = {
      recipe_id: recipeId,
      generated_at: new Date().toISOString(),
      control_plan: null as any,
      latest_audit: null as any,
      test_compliance: [] as any[],
      overall_compliance: false,
      recommendations: [] as string[]
    }

    try {
      // Get control plan
      const { data: controlPlan } = await this.supabase
        .from('en13813_fpc_control_plans')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('active', true)
        .single()

      report.control_plan = controlPlan

      // Get latest audit
      const { data: audit } = await this.supabase
        .from('en13813_fpc_audits')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('audit_date', { ascending: false })
        .limit(1)
        .single()

      report.latest_audit = audit

      // Check test frequencies
      if (controlPlan) {
        const testTypes = [
          { type: 'compressive_strength', days: 7 },
          { type: 'flexural_strength', days: 7 },
          { type: 'consistency', days: 1 },
          { type: 'density', days: 1 }
        ]

        for (const test of testTypes) {
          const compliance = await this.checkTestFrequencyCompliance(
            recipeId,
            test.type,
            test.days
          )
          report.test_compliance.push({
            test: test.type,
            required_frequency_days: test.days,
            ...compliance
          })
        }
      }

      // Overall compliance
      report.overall_compliance = 
        report.latest_audit?.overall_compliant &&
        report.test_compliance.every(t => t.compliant)

      // Recommendations
      if (!report.overall_compliance) {
        if (!report.latest_audit?.overall_compliant) {
          report.recommendations.push('Schedule FPC audit to resolve non-conformities')
        }
        
        const overdueTests = report.test_compliance
          .filter(t => !t.compliant)
          .map(t => t.test)
        
        if (overdueTests.length > 0) {
          report.recommendations.push(`Perform overdue tests: ${overdueTests.join(', ')}`)
        }
      }

      return report
    } catch (error) {
      console.error('Error generating FPC compliance report:', error)
      return report
    }
  }

  /**
   * Calculate compliance score from audit
   */
  private calculateComplianceScore(audit: any): number {
    const areas = [
      'incoming_materials_compliant',
      'production_control_compliant',
      'testing_compliant',
      'calibration_compliant',
      'documentation_compliant'
    ]

    const compliantAreas = areas.filter(area => audit[area]).length
    return Math.round((compliantAreas / areas.length) * 100)
  }

  /**
   * Check if FPC is required for AVCP system
   */
  isFPCRequired(avcpSystem: 1 | 4): boolean {
    // System 1+ requires FPC with notified body involvement
    // System 4 requires FPC but without notified body
    return true // FPC is always required for EN 13813
  }

  /**
   * Get FPC requirements for recipe
   */
  getFPCRequirements(recipe: Recipe): string[] {
    const requirements: string[] = [
      'Factory Production Control system',
      'Initial type testing (ITT)',
      'Regular testing of samples'
    ]

    if (recipe.fire_class && recipe.fire_class !== 'A1fl' && recipe.fire_class !== 'NPD') {
      requirements.push('FPC certification by notified body (System 1+)')
      requirements.push('Annual surveillance by notified body')
    } else {
      requirements.push('Internal FPC documentation (System 4)')
      requirements.push('Annual internal audit')
    }

    // Specific test requirements based on properties
    requirements.push('Compressive strength testing (weekly)')
    requirements.push('Flexural strength testing (weekly)')
    
    if (recipe.wear_resistance_class) {
      requirements.push('Wear resistance testing (monthly)')
    }

    if (recipe.intended_use?.heated_screed) {
      requirements.push('Thermal conductivity testing (quarterly)')
    }

    return requirements
  }
}