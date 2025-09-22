import { z } from 'zod';

export const auditSchema = z.object({
  audit_type: z.enum(['internal', 'external', 'certification']),
  audit_date: z.string().min(1, 'Auditdatum erforderlich'),
  auditor_name: z.string().min(1, 'Auditor Name erforderlich'),
  audit_scope: z.string().min(1, 'Audit-Umfang erforderlich'),
  status: z.enum(['planned', 'in_progress', 'completed', 'closed']).default('planned'),

  // Produktspezifische Informationen
  binder_types: z.array(z.enum(['CT', 'CA', 'MA', 'AS', 'SR'])).optional(),
  intended_use: z.enum(['wearing_layer', 'non_wearing_layer']).optional(),

  // AVCP-System Berechnung
  rf_regulated: z.boolean().optional(),
  rf_improvement_stage: z.boolean().optional(),
  dangerous_substances_regulated: z.boolean().optional(),
  avcp_system: z.enum(['4', '3', '1']).optional(),

  // ITT & Änderungen
  itt_available: z.boolean().optional(),
  itt_after_change: z.boolean().optional(),

  // Konformitätsbewertung
  conformity_method: z.enum(['variables', 'attributes']).optional(),
  sample_size: z.number().int().min(3).optional(),
  mean_value: z.number().optional(),
  standard_deviation: z.number().min(0).optional(),
  ka_value: z.number().optional(),

  // Audit-Ergebnisse
  findings_summary: z.string().optional(),
  nonconformities_count: z.number().int().min(0).default(0),
  observations_count: z.number().int().min(0).default(0),
  opportunities_count: z.number().int().min(0).default(0),
  next_audit_date: z.string().optional(),
  corrective_actions_required: z.boolean().default(false)
});

export const checklistItemSchema = z.object({
  audit_id: z.string().uuid(),
  section: z.string().min(1),
  category: z.enum([
    'fpc_general',
    'process_control',
    'incoming_materials',
    'production_process',
    'screed_material_tests',
    'alternative_tests',
    'test_equipment',
    'traceability',
    'labelling',
    'records',
    'itt_properties',
    'conformity_assessment',
    'designation_marking',
    'avcp_ce'
  ]),
  requirement: z.string().min(1),
  reference: z.string().optional(),
  status: z.enum(['conform', 'nonconform', 'not_applicable', 'observation']),
  evidence: z.string().optional(),
  finding: z.string().optional(),
  severity: z.enum(['critical', 'major', 'minor']).optional(),
  corrective_action_required: z.boolean().default(false),
  corrective_action_description: z.string().optional(),
  responsible_person: z.string().optional(),
  due_date: z.string().optional()
});

export const findingSchema = z.object({
  audit_id: z.string().uuid(),
  finding_number: z.string().min(1),
  finding_type: z.enum(['nonconformity', 'observation', 'opportunity']),
  severity: z.enum(['critical', 'major', 'minor']).optional(),
  description: z.string().min(1, 'Beschreibung erforderlich'),
  evidence: z.string().optional(),
  affected_process: z.string().optional(),
  root_cause: z.string().optional(),
  corrective_action_required: z.boolean().default(true),
  corrective_action_description: z.string().optional(),
  preventive_action_description: z.string().optional(),
  responsible_person: z.string().optional(),
  target_date: z.string().optional(),
  verification_date: z.string().optional(),
  verification_result: z.enum(['effective', 'not_effective', 'pending']).optional(),
  verified_by: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'closed', 'overdue']).default('open'),
  closure_date: z.string().optional(),
  closure_comments: z.string().optional()
});

export type AuditFormData = z.infer<typeof auditSchema>;
export type ChecklistItemFormData = z.infer<typeof checklistItemSchema>;
export type FindingFormData = z.infer<typeof findingSchema>;