// EN 13813 Type Definitions

// Estrich-Typen nach EN 13813
export type EstrichType = 'CT' | 'CA' | 'MA' | 'SR' | 'AS'

// Festigkeitsklassen
export type CompressiveStrengthClass = 
  | 'C5' | 'C7' | 'C12' | 'C16' | 'C20' | 'C25' | 'C30' | 'C35' 
  | 'C40' | 'C50' | 'C60' | 'C70' | 'C80'

export type FlexuralStrengthClass = 
  | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F10' 
  | 'F15' | 'F20' | 'F30' | 'F40' | 'F50'

export type WearResistanceClass = 
  | 'A1' | 'A3' | 'A6' | 'A9' | 'A12' | 'A15' | 'A22' | 'AR0.5' 
  | 'AR1' | 'AR2' | 'AR4' | 'AR6'

export type FireClass = 
  | 'A1fl' | 'A2fl' | 'Bfl' | 'Cfl' | 'Dfl' | 'Efl' | 'Ffl'

// Recipe Type
export interface Recipe {
  id: string
  tenant_id: string
  recipe_code: string // z.B. "CT-C25-F4"
  name: string
  type: EstrichType
  compressive_strength_class: CompressiveStrengthClass
  flexural_strength_class: FlexuralStrengthClass
  wear_resistance_class?: WearResistanceClass
  fire_class: FireClass
  additives: Additive[]
  special_properties: SpecialProperties
  status: 'draft' | 'active' | 'archived'
  valid_from?: Date
  valid_until?: Date
  created_at: Date
  updated_at: Date
}

export interface Additive {
  type: string
  name: string
  percentage?: number
}

export interface SpecialProperties {
  shrinkage_class?: 'SH5' | 'SH30' | 'SH50' | 'SH75' | 'SH100' | 'SH125' | 'SH150' | 'SH200'
  surface_hardness_class?: 'SH30' | 'SH40' | 'SH50' | 'SH70' | 'SH100' | 'SH150' | 'SH200'
  electrical_resistance?: string
  thermal_resistance?: string
  acoustic_properties?: string
  release_of_dangerous_substances?: string
}

// Test Report Type
export interface TestReport {
  id: string
  tenant_id: string
  recipe_id: string
  report_number: string
  test_type: 'initial_type_test' | 'factory_control' | 'audit'
  test_date: Date
  testing_body: string
  notified_body_number?: string // z.B. "0757"
  test_results: TestResults
  document_id?: string
  valid_until?: Date
  status: 'valid' | 'expired' | 'revoked'
  created_at: Date
}

export interface TestResults {
  compressive_strength?: {
    value: number
    unit: string
    test_method: string
  }
  flexural_strength?: {
    value: number
    unit: string
    test_method: string
  }
  wear_resistance?: {
    value: number
    unit: string
    class: WearResistanceClass
  }
  fire_behavior?: {
    class: FireClass
    test_method: string
  }
  emissions?: {
    TVOC?: string
    formaldehyde?: string
    other?: Record<string, string>
  }
  additional_tests?: Record<string, any>
}

// Batch Type
export interface Batch {
  id: string
  tenant_id: string
  recipe_id: string
  batch_number: string
  production_date: Date
  quantity_tons: number
  production_site: string
  qc_data: QualityControlData
  deviation_notes?: string
  status: 'produced' | 'released' | 'blocked' | 'consumed'
  created_at: Date
}

export interface QualityControlData {
  compressive_strength_28d?: number
  flexural_strength_28d?: number
  flow_diameter?: number
  density?: number
  temperature?: number
  humidity?: number
  test_date: Date
  tested_by: string
}

// DoP Type
export interface DoP {
  id: string
  tenant_id: string
  recipe_id: string
  batch_id?: string
  dop_number: string // z.B. "2024-CT25-001"
  version: number
  product_name: string
  intended_use: string
  manufacturer_info: ManufacturerInfo
  declared_performance: DeclaredPerformance
  prepared_by?: string
  approved_by?: string
  approval_date?: Date
  pdf_document_id?: string
  ce_label_document_id?: string
  qr_code?: string
  public_url?: string
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'revoked'
  issued_at?: Date
  expires_at?: Date
  created_at: Date
  updated_at: Date
}

export interface ManufacturerInfo {
  company_name: string
  address: string
  postal_code: string
  city: string
  country: string
  phone?: string
  email?: string
  website?: string
  authorized_person: string
  authorized_person_role: string
}

export interface DeclaredPerformance {
  essential_characteristics: EssentialCharacteristic[]
  system: 'System 1' | 'System 1+' | 'System 2+' | 'System 3' | 'System 4'
  notified_body?: string
}

export interface EssentialCharacteristic {
  characteristic: string
  performance: string
  standard: string
}

// Compliance Task Type
export interface ComplianceTask {
  id: string
  tenant_id: string
  task_type: 'fpc_audit' | 'test_renewal' | 'cert_renewal' | 'calibration'
  related_recipe_id?: string
  related_test_id?: string
  description: string
  due_date: Date
  reminder_days: number[]
  assigned_to?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  completed_at?: Date
  created_at: Date
}

// DoP Package Type
export interface DoPPackage {
  id: string
  tenant_id: string
  name: string
  recipient_type: 'dealer' | 'project' | 'customer'
  recipient_info: {
    name: string
    email?: string
    company?: string
    project?: string
  }
  dop_ids: string[]
  package_document_id?: string
  created_by: string
  created_at: Date
}

// Validation Types
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// API Response Types
export interface ImportResult {
  imported: number
  total: number
  errors: ImportError[]
  recipes?: Recipe[]
}

export interface ImportError {
  row: number
  field: string
  value: any
  message: string
}

// Filter Types
export interface RecipeFilters {
  type?: EstrichType
  status?: string
  compressive_strength_min?: number
  flexural_strength_min?: number
  search?: string
}

export interface DoPFilters {
  status?: string
  recipe_id?: string
  date_from?: Date
  date_to?: Date
  search?: string
}