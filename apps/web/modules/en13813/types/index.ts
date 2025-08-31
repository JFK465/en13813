// EN13813 Type Definitions

export interface BaseEntity {
  id: string
  tenant_id?: string
  created_at: string
  updated_at?: string
}

export interface Recipe extends BaseEntity {
  recipe_code: string
  name: string
  description?: string
  
  // EN 13813 Classification
  estrich_type: 'CT' | 'CA' | 'MA' | 'AS' | 'SR'
  compressive_strength: string
  flexural_strength: string
  
  // Verschleißwiderstand - NUR EINE Methode!
  wear_resistance_method?: 'bohme' | 'bca' | 'rolling_wheel'
  wear_resistance_class?: string // A22-A1.5 | AR6-AR0.5 | RWA300-RWA1
  
  // Zusätzliche mechanische Eigenschaften
  surface_hardness_class?: string // SH30-SH200 für MA
  bond_strength_class?: string // B0.5-B2.0 für SR
  impact_resistance_class?: string // IR1-IR20 für SR
  indentation_class?: string // IC10-IC100 oder IP10-IP40 für AS
  
  // Verwendungszweck
  intended_use: {
    wearing_surface: boolean
    with_flooring: boolean
    heated_screed: boolean
    indoor_only: boolean
  }
  
  // Heizestrich
  heated_screed?: boolean
  
  // Fire & Emissions
  fire_class?: string
  emissions?: Record<string, any>
  
  // Additional data
  additives?: any[]
  mixing_ratio?: Record<string, any>
  application_thickness_min?: number
  application_thickness_max?: number
  
  // EN Designation (auto-generated)
  en_designation?: string
  
  // Status & Validation
  status: 'draft' | 'active' | 'archived'
  validation_errors?: any[]
  is_validated: boolean
  
  created_by?: string
  updated_by?: string
}

export interface TestReport extends BaseEntity {
  recipe_id: string
  report_number: string
  report_type: 'initial_type_testing' | 'factory_production_control' | 'external_monitoring'
  
  // Testing institute
  testing_institute: string
  notified_body_number?: string
  
  // Test data
  test_date: string
  sample_date?: string
  test_results: Record<string, any>
  
  // Document
  document_id?: string
  document_url?: string
  
  // Validity
  valid_from?: string
  valid_until: string
  is_expired?: boolean
  
  status: 'draft' | 'valid' | 'expired' | 'revoked'
  created_by?: string
}

export interface Batch extends BaseEntity {
  recipe_id: string
  batch_number: string
  production_date: string
  production_site?: string
  mixer_number?: string
  
  // Quantities
  quantity_tons?: number
  quantity_m3?: number
  
  // QC Data
  qc_test_results?: Record<string, any>
  qc_passed?: boolean
  deviation_notes?: string
  
  // Usage
  customer_name?: string
  project_name?: string
  delivery_note_numbers?: string[]
  
  status?: string
}

export interface DoP extends BaseEntity {
  recipe_id: string
  batch_id?: string
  test_report_ids?: string[]
  
  // DoP Identification
  dop_number: string
  version: number
  revision_of?: string
  
  // Manufacturer data
  manufacturer_data: ManufacturerData
  
  // Declared performance
  declared_performance: Record<string, any>
  
  // Generated documents
  pdf_document_id?: string
  ce_label_document_id?: string
  
  // QR Code & Public Access
  qr_code_data?: string
  public_uuid?: string
  public_url?: string
  
  // Workflow
  workflow_status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'published' | 'revoked'
  submitted_at?: string
  submitted_by?: string
  reviewed_at?: string
  reviewed_by?: string
  approved_at?: string
  approved_by?: string
  published_at?: string
  
  // Validity
  issue_date?: string
  expiry_date?: string
  is_active?: boolean
}

export interface ManufacturerData {
  name: string
  address: string
  postalCode: string
  city: string
  country: string
  phone?: string
  email?: string
  website?: string
  vat_number?: string
  registration_number?: string
}

export interface DoPPackage extends BaseEntity {
  name: string
  description?: string
  recipient_type?: 'dealer' | 'project' | 'authority' | 'customer'
  recipient_data?: Record<string, any>
  
  dop_ids: string[]
  
  package_document_id?: string
  download_url?: string
  download_count?: number
  
  created_by?: string
}

export interface ComplianceTask extends BaseEntity {
  task_type: 'test_report_renewal' | 'fpc_audit' | 'external_audit' | 'ce_renewal' | 'recipe_validation' | 'itt_testing' | 'dop_creation' | 'calibration' | 'retest_required'
  
  recipe_id?: string
  test_report_id?: string
  
  title: string
  description?: string
  due_date: string
  reminder_days?: number[]
  
  assigned_to?: string
  assigned_role?: string
  
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completed_at?: string
  completed_by?: string
  completion_notes?: string
}

// Neue Interfaces für erweiterte EN 13813 Konformität
export interface RecipeMaterial extends BaseEntity {
  recipe_id: string
  
  // Bindemittel
  binder_type: string
  binder_designation: string // z.B. "CEM I 42,5 R"
  binder_amount_kg_m3: number
  binder_supplier?: string
  
  // Zuschlagstoffe
  aggregate_type?: string // natürlich/rezykliert/leicht
  aggregate_max_size?: string // z.B. "0-8mm"
  sieve_curve?: Record<string, number> // Korngrößenverteilung
  
  // Wasser & W/B-Wert
  water_content?: number
  water_binder_ratio: number
  
  // Zusatzmittel
  additives?: Array<{
    type: string
    product: string
    dosage_percent: number
  }>
  
  fibers?: {
    type: string
    length_mm: number
    dosage_kg_m3: number
  }
  
  // Frischmörtel-Eigenschaften
  fresh_mortar_properties?: {
    consistency?: {
      method: string
      target_mm?: number
      tolerance_mm?: number
    }
    setting_time?: {
      initial_minutes?: number
      final_minutes?: number
    }
    ph_value?: number
    processing_time_minutes?: number
    temperature_range?: {
      min_celsius: number
      max_celsius: number
    }
  }
}

export interface ITTTestPlan extends BaseEntity {
  recipe_id: string
  
  required_tests: Array<{
    property: string
    norm: string
    test_age_days?: number
    target_class?: string
  }>
  
  optional_tests?: Array<{
    property: string
    norm: string
    reason?: string
  }>
  
  test_status: 'pending' | 'in_progress' | 'completed' | 'failed'
  test_results?: Record<string, any>
  
  last_validated_at?: string
  validation_notes?: string
}

export interface FPCControlPlan extends BaseEntity {
  recipe_id: string
  
  incoming_inspection: {
    binder: {
      frequency: string
      tests: string[]
      tolerance: string
    }
    aggregates: {
      frequency: string
      tests: string[]
      tolerance: string
    }
  }
  
  production_control: {
    fresh_mortar: {
      frequency: string
      tests: string[]
      limits: Record<string, any>
    }
    hardened_mortar: {
      frequency: string
      tests: string[]
      warning_limit: string
      action_limit: string
    }
  }
  
  calibration: {
    scales: string
    mixers: string
    testing_equipment: string
  }
  
  active: boolean
}

export interface RecipeVersion extends BaseEntity {
  recipe_id: string
  version_number: number
  changes: {
    old: Recipe
    new: Recipe
    changed_fields: Record<string, any>
  }
  requires_retest: boolean
  created_by?: string
}

// Service parameters
export interface DoPGenerationParams {
  recipeId: string
  batchId?: string
  testReportIds?: string[]
  language?: 'de' | 'en'
}

export interface PDFGenerationParams {
  dop: DoP
  recipe: Recipe
  manufacturer: ManufacturerData
  batch?: Batch
  testReports?: TestReport[]
  language?: 'de' | 'en'
}

// Filter types
export interface RecipeFilter {
  status?: string
  type?: string
  search?: string
}

export interface DoPFilter {
  status?: string
  recipe_id?: string
  search?: string
}