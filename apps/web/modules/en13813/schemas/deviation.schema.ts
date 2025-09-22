import { z } from 'zod'

/**
 * EN 13813:2002 CAPA Validation Schemas
 * Compliance with § 6.3.2.2, § 6.3.4, § 6.3.6, § 9.2
 */

// Enums
export const DeviationTypeEnum = z.enum(['product', 'process', 'incoming_material', 'device', 'documentation'])
export const SeverityEnum = z.enum(['critical', 'major', 'minor', 'observation'])
export const SourceEnum = z.enum(['internal_audit', 'external_audit', 'customer_complaint', 'quality_control', 'production', 'fpc_test', 'itt_test'])
export const ConformityModeEnum = z.enum(['single_value', 'statistics'])
export const StatusEnum = z.enum(['open', 'investigation', 'corrective_action', 'effectiveness_check', 'closed', 'rejected'])
export const DispositionEnum = z.enum(['quarantine', 'rework', 'downgrade', 'scrap', 'release_with_concession', 'pending'])
export const RootCauseMethodEnum = z.enum(['5why', 'fishbone', 'fault_tree', '8d', 'other'])
export const RiskLevelEnum = z.enum(['low', 'medium', 'high'])
export const RiskRatingEnum = z.enum(['acceptable', 'tolerable', 'unacceptable'])
export const ActionStatusEnum = z.enum(['planned', 'in_progress', 'completed', 'verified', 'cancelled'])
export const EffectivenessRatingEnum = z.enum(['effective', 'partially_effective', 'not_effective'])
export const CheckTypeEnum = z.enum(['immediate', 'short_term', 'long_term'])
export const CheckMethodEnum = z.enum(['audit', 'test', 'measurement', 'observation', 'document_review', 'customer_feedback', 'trend_analysis'])

// Test Result Schema
export const TestResultSchema = z.object({
  value: z.number(),
  date: z.string(),
  age_days: z.number().optional()
})

// Success Criteria Schema
export const SuccessCriteriaSchema = z.object({
  description: z.string().min(1, 'Description required'),
  target: z.string().optional(),
  tolerance: z.string().optional()
})

// Main Deviation Schema
const DeviationBaseSchema = z.object({
  id: z.string().uuid().optional(),
  tenant_id: z.string().uuid().optional(),

  // Identification (Required)
  deviation_number: z.string().optional(), // Auto-generated
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),

  // EN13813 Specific (Required)
  affected_characteristic: z.string().regex(/^[CF]\d{1,3}|[A-Z]{1,3}\d{1,3}$/, 'Invalid characteristic format (e.g., C25, F4, A22)'),
  target_class: z.string().min(1, 'Target class required'),
  test_standard: z.string().regex(/^EN \d{4,5}(-\d+)?$/, 'Invalid standard format (e.g., EN 13892-2)'),
  conformity_mode: ConformityModeEnum,

  // Test Results (Required)
  test_results: z.array(TestResultSchema).min(1, 'At least one test result required'),
  mean_value: z.number().optional(),
  std_deviation: z.number().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),

  // Conformity Evaluation
  conformity_passed: z.boolean(),
  conformity_details: z.string().optional(),

  // Classification (Required)
  deviation_type: DeviationTypeEnum,
  severity: SeverityEnum,
  source: SourceEnum,

  // References
  recipe_id: z.string().uuid().optional(),
  recipe_version: z.number().int().positive().optional(),
  batch_id: z.string().uuid().optional(),
  test_id: z.string().uuid().optional(),
  device_id: z.string().uuid().optional(),
  raw_material_batch: z.string().optional(),
  affected_process_step: z.string().optional(),

  // Discovery (Required)
  discovered_date: z.string().datetime(),
  discovered_by: z.string().min(1, 'Discovered by required'),
  detection_method: z.string().optional(),
  affected_quantity: z.number().positive().optional(),
  affected_unit: z.string().optional(),

  // Status
  status: StatusEnum,

  // Immediate Actions
  immediate_action_required: z.boolean(),
  immediate_action_description: z.string().optional(),
  immediate_action_taken_by: z.string().optional(),
  immediate_action_taken_at: z.string().datetime().optional(),
  batch_blocked: z.boolean().optional(),
  marking_blocked: z.boolean().optional(),
  customer_informed: z.boolean().optional(),
  product_recalled: z.boolean().optional(),

  // Disposition (Required before closure)
  disposition: DispositionEnum.optional(),
  disposition_note: z.string().optional(),
  disposition_decided_by: z.string().optional(),
  disposition_decided_at: z.string().datetime().optional(),

  // Root Cause Analysis
  root_cause_method: RootCauseMethodEnum.optional(),
  root_cause_analysis: z.any().optional(), // JSONB
  root_cause_conclusion: z.string().optional(),
  root_cause_performed_by: z.string().optional(),
  root_cause_performed_at: z.string().datetime().optional(),

  // Risk Assessment
  risk_probability: RiskLevelEnum.optional(),
  risk_impact: RiskLevelEnum.optional(),
  risk_level: RiskRatingEnum.optional(),

  // ITT Flag
  itt_required: z.boolean().optional(),
  itt_task_created: z.boolean().optional(),

  // Sampling Adjustment
  sampling_frequency_adjustment: z.enum(['increase', 'maintain', 'decrease']).optional(),
  new_sampling_frequency: z.string().optional(),

  // Sign-off Workflow
  created_by: z.string().min(1),
  created_by_role: z.string().optional(),
  reviewed_by: z.string().optional(),
  reviewed_by_role: z.string().optional(),
  reviewed_at: z.string().datetime().optional(),
  approved_by: z.string().optional(),
  approved_by_role: z.string().optional(),
  approved_at: z.string().datetime().optional(),

  // Closure
  closed_by: z.string().optional(),
  closed_at: z.string().datetime().optional(),
  closure_notes: z.string().optional(),
  final_status: z.enum(['resolved', 'not_reproducible', 'accepted_risk', 'rejected']).optional(),

  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

// Export with refinements for validation
export const DeviationSchema = DeviationBaseSchema.refine(
  (data) => {
    // Disposition required for closure
    if (data.status === 'closed' && !data.disposition) {
      return false
    }
    return true
  },
  {
    message: 'Disposition required before closure',
    path: ['disposition']
  }
).refine(
  (data) => {
    // Immediate action required for critical/major
    if ((data.severity === 'critical' || data.severity === 'major') && !data.immediate_action_description) {
      return false
    }
    return true
  },
  {
    message: 'Immediate action required for critical/major deviations',
    path: ['immediate_action_description']
  }
)

// Corrective Action Schema
const CorrectiveActionBaseSchema = z.object({
  id: z.string().uuid().optional(),
  deviation_id: z.string().uuid(),

  action_number: z.string().min(1),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  action_type: z.enum(['corrective', 'preventive']).default('corrective'),

  // Responsibility
  responsible_person: z.string().min(1, 'Responsible person required'),
  department: z.string().optional(),

  // Planning
  planned_start_date: z.string().datetime(),
  planned_end_date: z.string().datetime(),
  actual_start_date: z.string().datetime().optional(),
  actual_end_date: z.string().datetime().optional(),

  // Status
  status: ActionStatusEnum,

  // Resources
  estimated_cost: z.number().positive().optional(),
  actual_cost: z.number().positive().optional(),
  resources_required: z.array(z.string()).optional(),

  // Documentation
  implementation_notes: z.string().optional(),

  // Verification
  verification_required: z.boolean().default(true),
  verified_by: z.string().optional(),
  verified_at: z.string().datetime().optional(),
  verification_notes: z.string().optional(),
  verification_result: EffectivenessRatingEnum.optional(),

  // Links
  related_documents: z.array(z.string()).optional(),
  training_required: z.boolean().optional(),
  procedure_update_required: z.boolean().optional(),

  // Preventive specific
  affects_other_products: z.boolean().optional(),
  affects_other_processes: z.boolean().optional(),
  system_wide_change: z.boolean().optional(),

  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const CorrectiveActionSchema = CorrectiveActionBaseSchema.refine(
  (data) => {
    const start = new Date(data.planned_start_date)
    const end = new Date(data.planned_end_date)
    return end >= start
  },
  {
    message: 'End date must be after start date',
    path: ['planned_end_date']
  }
)

// Effectiveness Check Schema
export const EffectivenessCheckSchema = z.object({
  id: z.string().uuid().optional(),
  deviation_id: z.string().uuid(),

  check_number: z.string().min(1),
  check_type: CheckTypeEnum,
  check_method: CheckMethodEnum,

  // Planning
  planned_date: z.string().datetime(),
  performed_date: z.string().datetime().optional(),
  performed_by: z.string().optional(),

  // Success Criteria (Required)
  success_criteria: z.array(SuccessCriteriaSchema).min(1, 'At least one success criterion required'),

  // Conformity Check
  conformity_check_samples: z.number().int().positive().optional(),
  conformity_check_mode: ConformityModeEnum.optional(),

  // Results
  results: z.object({
    criteria_met: z.boolean(),
    actual_values: z.record(z.any()).optional(),
    evidence: z.array(z.string()).optional(),
    observations: z.string().optional()
  }).optional(),
  test_values: z.array(z.number()).optional(),
  mean_result: z.number().optional(),
  std_result: z.number().optional(),
  conformity_evaluation: z.string().optional(),

  // Rating
  effectiveness_rating: EffectivenessRatingEnum.optional(),

  // Follow-up
  follow_up_required: z.boolean().optional(),
  follow_up_actions: z.array(z.object({
    description: z.string(),
    responsible: z.string(),
    due_date: z.string().datetime()
  })).optional(),

  // Documentation
  test_reports: z.array(z.string()).optional(),
  measurements: z.array(z.object({
    parameter: z.string(),
    value: z.number(),
    unit: z.string(),
    specification: z.string(),
    pass: z.boolean()
  })).optional(),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),

  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

// Form Schemas for UI
export const DeviationFormSchema = DeviationBaseSchema.omit({
  id: true,
  tenant_id: true,
  deviation_number: true,
  created_at: true,
  updated_at: true,
  conformity_passed: true,
  conformity_details: true,
  mean_value: true,
  std_deviation: true,
  min_value: true,
  max_value: true
})

export const CorrectiveActionFormSchema = CorrectiveActionBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

export const EffectivenessCheckFormSchema = EffectivenessCheckSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

// Type exports
export type Deviation = z.infer<typeof DeviationSchema>
export type CorrectiveAction = z.infer<typeof CorrectiveActionSchema>
export type EffectivenessCheck = z.infer<typeof EffectivenessCheckSchema>
export type DeviationForm = z.infer<typeof DeviationFormSchema>
export type CorrectiveActionForm = z.infer<typeof CorrectiveActionFormSchema>
export type EffectivenessCheckForm = z.infer<typeof EffectivenessCheckFormSchema>

// Conformity Evaluation Helper
export function evaluateConformity(
  mode: 'single_value' | 'statistics',
  values: number[],
  targetValue: number,
  sampleSize?: number
): {
  passed: boolean
  mean: number
  stdDev: number
  minValue: number
  maxValue: number
  details: string
  kFactor?: number
  lowerLimit?: number
} {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  if (mode === 'single_value') {
    // § 9.2.3: Every single value must be ≥ target
    const passed = minValue >= targetValue
    return {
      passed,
      mean,
      stdDev,
      minValue,
      maxValue,
      details: `Single value mode: Min=${minValue}, Target=${targetValue}, Pass=${passed}`
    }
  } else {
    // § 9.2.2: Statistical evaluation
    const n = sampleSize || values.length

    // k-factors from EN 13813 Table 12
    let kFactor: number
    if (n <= 4) kFactor = 2.63
    else if (n === 5) kFactor = 2.33
    else if (n === 6) kFactor = 2.18
    else if (n <= 9) kFactor = 2.00
    else if (n <= 14) kFactor = 1.93
    else if (n <= 19) kFactor = 1.87
    else if (n <= 29) kFactor = 1.83
    else if (n <= 39) kFactor = 1.80
    else if (n <= 59) kFactor = 1.77
    else if (n <= 99) kFactor = 1.75
    else kFactor = 1.72

    const lowerLimit = mean - (kFactor * stdDev)
    const minThreshold = targetValue * 0.9 // No value < 90% of target

    const passed = lowerLimit >= targetValue && minValue >= minThreshold

    return {
      passed,
      mean,
      stdDev,
      minValue,
      maxValue,
      kFactor,
      lowerLimit,
      details: `Statistical mode: Mean=${mean.toFixed(2)}, StdDev=${stdDev.toFixed(2)}, k=${kFactor}, Lower limit=${lowerLimit.toFixed(2)}, Target=${targetValue}, Min=${minValue} (90% threshold=${minThreshold.toFixed(2)}), Pass=${passed}`
    }
  }
}