/**
 * CAPA & Deviation Management Types
 * EN 13813:2002 § 6.3.2.2 - Corrective Actions
 *
 * Anforderung: Bei Nichterreichen von Kriterien sind Maßnahmen zu ergreifen
 * und deren Wirksamkeit zu überprüfen
 */

export interface Deviation {
  id: string
  tenant_id?: string
  created_at: string
  updated_at?: string

  // Identifikation
  deviation_number: string
  title: string
  description: string

  // Kategorisierung
  type: 'product' | 'process' | 'system' | 'documentation' | 'calibration'
  severity: 'critical' | 'major' | 'minor' | 'observation'
  source: 'internal_audit' | 'external_audit' | 'customer_complaint' | 'quality_control' | 'production' | 'other'

  // Bezüge
  recipe_id?: string
  batch_id?: string
  test_report_id?: string
  calibration_id?: string
  customer_id?: string
  project_name?: string

  // Entdeckung
  discovered_date: string
  discovered_by: string
  detection_method?: string
  affected_quantity?: number
  affected_unit?: string

  // Status
  status: 'open' | 'investigation' | 'corrective_action' | 'effectiveness_check' | 'closed' | 'rejected'

  // Sofortmaßnahmen
  immediate_action?: {
    description: string
    taken_by: string
    taken_at: string
    batch_blocked?: boolean
    customer_informed?: boolean
    product_recalled?: boolean
  }

  // Ursachenanalyse (Root Cause Analysis)
  root_cause_analysis?: RootCauseAnalysis

  // Korrektur- und Vorbeugemaßnahmen (CAPA)
  corrective_actions?: CorrectiveAction[]
  preventive_actions?: PreventiveAction[]

  // Wirksamkeitsprüfung (KRITISCH - NEU)
  effectiveness_checks?: EffectivenessCheck[]

  // Abschluss
  closure?: {
    closed_by: string
    closed_at: string
    closure_notes: string
    final_status: 'resolved' | 'not_reproducible' | 'accepted_risk' | 'rejected'
  }

  // Anhänge
  attachments?: Attachment[]

  created_by?: string
  updated_by?: string
}

/**
 * Root Cause Analysis (Ursachenanalyse)
 */
export interface RootCauseAnalysis {
  method: '5why' | 'fishbone' | 'fault_tree' | '8d' | 'other'

  // 5-Why Analyse
  five_why?: {
    why1: { question: string; answer: string }
    why2: { question: string; answer: string }
    why3: { question: string; answer: string }
    why4?: { question: string; answer: string }
    why5?: { question: string; answer: string }
    root_cause: string
  }

  // Ishikawa/Fishbone
  fishbone?: {
    categories: {
      man?: string[]      // Mensch
      machine?: string[]  // Maschine
      method?: string[]   // Methode
      material?: string[] // Material
      measurement?: string[] // Messung
      environment?: string[] // Umgebung
    }
    root_cause: string
  }

  // 8D Report
  eight_d?: {
    d1_team: string[]
    d2_problem_description: string
    d3_interim_actions: string
    d4_root_cause: string
    d5_corrective_actions: string
    d6_preventive_actions: string
    d7_prevention_measures: string
    d8_team_recognition: string
  }

  performed_by: string
  performed_at: string
  conclusion: string
}

/**
 * Corrective Action (Korrekturmaßnahme)
 */
export interface CorrectiveAction {
  id: string
  action_number: string
  description: string

  // Verantwortlichkeit
  responsible_person: string
  department?: string

  // Zeitplanung
  planned_start_date: string
  planned_end_date: string
  actual_start_date?: string
  actual_end_date?: string

  // Status
  status: 'planned' | 'in_progress' | 'completed' | 'verified' | 'cancelled'

  // Ressourcen
  estimated_cost?: number
  actual_cost?: number
  resources_required?: string[]

  // Dokumentation
  implementation_notes?: string
  verification?: {
    verified_by: string
    verified_at: string
    verification_notes: string
    result: 'effective' | 'partially_effective' | 'not_effective'
  }

  // Verknüpfungen
  related_documents?: string[]
  training_required?: boolean
  procedure_update_required?: boolean
}

/**
 * Preventive Action (Vorbeugemaßnahme)
 */
export interface PreventiveAction extends CorrectiveAction {
  risk_assessment?: {
    probability: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    risk_level: 'acceptable' | 'tolerable' | 'unacceptable'
  }
  affects_other_products?: boolean
  affects_other_processes?: boolean
  system_wide_change?: boolean
}

/**
 * Effectiveness Check (Wirksamkeitsprüfung) - KRITISCH NEU
 * EN 13813 § 6.3.2.2 fordert Überprüfung der Wirksamkeit
 */
export interface EffectivenessCheck {
  id: string
  check_number: string

  // Prüfungsdetails
  check_type: 'immediate' | 'short_term' | 'long_term'
  check_method: 'audit' | 'test' | 'measurement' | 'observation' | 'document_review' | 'customer_feedback'

  // Zeitplanung
  planned_date: string
  performed_date?: string

  // Durchführung
  performed_by?: string

  // Kriterien für Wirksamkeit
  success_criteria: {
    description: string
    measurable_target?: string
    tolerance?: string
  }[]

  // Ergebnisse
  results?: {
    criteria_met: boolean
    actual_values?: Record<string, any>
    evidence?: string[]
    observations?: string
  }

  // Bewertung
  effectiveness_rating?: 'effective' | 'partially_effective' | 'not_effective'

  // Follow-up bei nicht wirksamen Maßnahmen
  follow_up_required?: boolean
  follow_up_actions?: {
    description: string
    responsible: string
    due_date: string
  }[]

  // Dokumentation
  test_reports?: string[]
  measurements?: {
    parameter: string
    value: number
    unit: string
    specification: string
    pass: boolean
  }[]

  attachments?: string[]
  notes?: string
}

/**
 * Attachment (Anhang)
 */
export interface Attachment {
  id: string
  filename: string
  file_type: string
  file_size: number
  uploaded_by: string
  uploaded_at: string
  description?: string
  category?: 'evidence' | 'report' | 'photo' | 'document' | 'other'
}

/**
 * CAPA Dashboard Statistics
 */
export interface CAPAStatistics {
  total_deviations: number
  open_deviations: number
  overdue_actions: number
  pending_effectiveness_checks: number

  by_severity: {
    critical: number
    major: number
    minor: number
    observation: number
  }

  by_status: {
    open: number
    investigation: number
    corrective_action: number
    effectiveness_check: number
    closed: number
  }

  effectiveness_rate: {
    effective: number
    partially_effective: number
    not_effective: number
    pending: number
  }

  avg_closure_time_days: number
  recurring_issues: {
    issue: string
    count: number
    last_occurrence: string
  }[]
}

/**
 * CAPA Workflow Configuration
 */
export interface CAPAWorkflow {
  // Automatische Eskalation
  escalation_rules: {
    severity: 'critical' | 'major'
    escalate_after_hours: number
    escalate_to: string[]
  }[]

  // Wirksamkeitsprüfung Intervalle
  effectiveness_check_intervals: {
    immediate: number // Tage nach Maßnahme
    short_term: number // Tage
    long_term: number // Tage
  }

  // Benachrichtigungen
  notifications: {
    on_creation: string[]
    on_escalation: string[]
    on_effectiveness_check_due: string[]
    on_closure: string[]
  }

  // Genehmigungen
  approval_required: {
    for_closure: boolean
    for_effectiveness_rating: boolean
    approvers: string[]
  }
}

/**
 * Service Interface für CAPA Management
 */
export interface ICAPAService {
  // Deviation Management
  createDeviation(data: Partial<Deviation>): Promise<Deviation>
  updateDeviation(id: string, data: Partial<Deviation>): Promise<Deviation>
  getDeviation(id: string): Promise<Deviation>
  listDeviations(filter?: DeviationFilter): Promise<Deviation[]>

  // Root Cause Analysis
  performRootCauseAnalysis(deviationId: string, analysis: RootCauseAnalysis): Promise<void>

  // CAPA Actions
  addCorrectiveAction(deviationId: string, action: Partial<CorrectiveAction>): Promise<CorrectiveAction>
  addPreventiveAction(deviationId: string, action: Partial<PreventiveAction>): Promise<PreventiveAction>
  updateAction(actionId: string, data: Partial<CorrectiveAction>): Promise<void>

  // Effectiveness Checks (KRITISCH)
  scheduleEffectivenessCheck(deviationId: string, check: Partial<EffectivenessCheck>): Promise<EffectivenessCheck>
  performEffectivenessCheck(checkId: string, results: EffectivenessCheck['results']): Promise<void>
  getOverdueEffectivenessChecks(): Promise<EffectivenessCheck[]>

  // Reporting
  getCAPAStatistics(): Promise<CAPAStatistics>
  generateCAPAReport(deviationId: string): Promise<Uint8Array> // PDF

  // Validation
  validateDeviation(data: Partial<Deviation>): DeviationValidationResult
  checkRecurrence(deviation: Partial<Deviation>): Promise<Deviation[]> // Similar deviations
}

export interface DeviationFilter {
  status?: string[]
  severity?: string[]
  type?: string[]
  date_from?: string
  date_to?: string
  recipe_id?: string
  batch_id?: string
  has_pending_effectiveness_check?: boolean
}

export interface DeviationValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}