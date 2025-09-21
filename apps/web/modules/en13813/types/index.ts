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

  // Mandatory manufacturer info (EN 13813)
  manufacturer_name?: string
  manufacturer_address?: string
  production_date?: string
  batch_size_kg?: number
  shelf_life_months?: number
  storage_conditions?: string
  max_grain_size?: string
  layer_thickness_range?: string
  
  // EN 13813 Classification
  binder_type: 'CT' | 'CA' | 'MA' | 'AS' | 'SR' // Renamed from estrich_type
  compressive_strength_class: string // Renamed from compressive_strength
  flexural_strength_class: string // Renamed from flexural_strength

  // CE Marking & AVCP System
  avcp_system?: '1' | '1+' | '2+' | '3' | '4'
  notified_body_number?: string
  
  // Verschleißwiderstand - NUR EINE Methode!
  wear_resistance_method?: 'bohme' | 'bca' | 'rolling_wheel' | 'none' | 'NPD'
  wear_resistance_class?: string // A22-A1.5 | AR6-AR0.5 | RWA300-RWA1
  
  // Zusätzliche mechanische Eigenschaften
  surface_hardness_class?: string // SH30-SH200 für MA
  bond_strength_class?: string // B0.2-B2.0 für SR und optional andere
  impact_resistance_class?: string // IR1-IR20 für SR
  indentation_class?: string // IC10-IC100 oder IP10-IP40 für AS
  
  // Rollradprüfung für bedeckte Estriche (EN 13813 Abschnitt 5.2.6)
  rwfc_class?: string // RWFC150, RWFC250, RWFC350, RWFC450, RWFC550 oder NPD
  
  // Verwendungszweck
  intended_use: {
    wearing_surface: boolean
    with_flooring: boolean
    heated_screed: boolean
    indoor_only: boolean
    outdoor_use?: boolean
    wet_areas?: boolean
    chemical_exposure?: boolean
    heavy_duty?: boolean
    esd_requirements?: boolean
  }
  
  // Heizestrich
  heated_screed?: boolean
  
  // Fire & Emissions  
  fire_class?: string // A1fl-Ffl oder NPD
  fire_smoke_class?: string // s1, s2
  emissions?: Record<string, any>
  
  // Freisetzung korrosiver Substanzen (EN 13813 Abschnitt 5.3.5)
  release_corrosive_substances?: string // Deklaration des Materialtyps (CT/CA/MA/AS/SR)
  
  // === VOLLSTÄNDIGE EN 13813 EIGENSCHAFTEN ===
  
  // Wassereigenschaften
  water_permeability?: string // NPD oder Wert
  water_permeability_value?: number // Wert in ml/(m²·h)
  water_vapour_permeability?: string // NPD oder µ-Wert
  water_vapour_permeability_value?: number // µ-Wert (Diffusionswiderstand)
  water_absorption_class?: string // W0, W1, W2 oder NPD
  
  // Thermische Eigenschaften
  thermal_conductivity?: number // λ-Wert in W/(m·K)
  thermal_resistance?: number // R-Wert in m²·K/W
  specific_heat_capacity?: number // J/(kg·K)
  
  // Akustische Eigenschaften
  sound_insulation?: number // Luftschallverbesserung in dB
  sound_absorption_coefficient?: number // α-Wert
  impact_sound_improvement?: number // ΔLw in dB
  
  // Elektrische Eigenschaften (PFLICHT für AS bei ESD)
  electrical_resistance?: string // 10^4 - 10^9 Ω
  electrical_conductivity?: string // Leitfähigkeit
  electrostatic_behaviour?: 'insulating' | 'dissipative' | 'conductive'
  
  // Chemische Beständigkeit
  chemical_resistance_class?: string // CR0 - CR4 oder NPD
  ph_resistance_range?: {
    min: number
    max: number
  }
  oil_resistance?: boolean
  
  // pH-Wert (EN 13813 Abschnitt 5.2.10)
  ph_value?: number // MUSS ≥ 7 für CA-Estriche, optional für andere

  // Setting Time
  setting_time_initial_minutes?: number
  setting_time_final_minutes?: number
  setting_time_norm?: 'EN 13454-2' | 'EN 196-3'
  
  // Mechanische Zusatzeigenschaften
  creep_coefficient?: number // Kriechzahl
  elastic_modulus?: number // E-Modul in N/mm² (E1-E20+)
  elastic_modulus_class?: string // E1, E2, E5, E10, E15, E20 oder höher
  
  // Schwinden und Quellen (EN 13813 Abschnitt 5.2.8)
  shrinkage_value?: number // mm/m
  swelling_value?: number // mm/m
  shrinkage_class?: string // S1, S2, S3 oder NPD
  curling_tendency?: string // niedrig/mittel/hoch oder NPD
  
  // Dauerhaftigkeit
  freeze_thaw_resistance?: string // FT0, FT1, FT2
  abrasion_resistance_class?: string // Alternativ zu wear_resistance
  
  // Sicherheit
  slip_resistance_class?: string // R9 - R13 oder NPD
  release_dangerous_substances?: string // NPD oder "Siehe SDB"
  
  // Anwendungsspezifisch
  thickness_tolerance_class?: string // T1, T2, T3 oder NPD
  flatness_tolerance?: number // mm/2m
  surface_texture?: 'smooth' | 'textured' | 'structured' | 'NPD'
  
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
  language: 'de' | 'en' | 'fr' | string
  
  // Manufacturer data
  manufacturer_data: ManufacturerData
  authorized_representative?: AuthorizedRepresentative
  
  // AVCP System (System 1+ oder 4)
  avcp_system: 1 | 4
  notified_body?: NotifiedBody
  
  // Harmonized specification
  harmonized_specification: {
    standard: string // 'EN 13813:2002'
    title: string
  }
  
  // Declared performance
  declared_performance: DeclaredPerformance
  
  // Generated documents
  pdf_document_id?: string
  ce_label_document_id?: string
  
  // QR Code & Public Access
  qr_code_data?: string
  public_uuid?: string
  public_url?: string
  digital_availability_url?: string
  
  // Retention
  retention_period?: string // '10 years'
  retention_location?: string
  
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
  
  // Signatory
  signatory?: {
    name: string
    position: string
    place?: string
  }
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

export interface AuthorizedRepresentative {
  name: string
  address: string
  postalCode: string
  city: string
  country: string
  mandate_reference?: string
}

export interface NotifiedBody {
  name: string
  number: string // z.B. '0672'
  task: string // 'Klassifizierung des Brandverhaltens'
  certificate_number?: string // z.B. '0672-CPR-2024-12345'
  test_report?: string // z.B. 'PB-2024-12345'
  test_date?: string
}

export interface DeclaredPerformance {
  // Bindemitteltyp (korrosive Stoffe)
  release_of_corrosive_substances: 'CT' | 'CA' | 'MA' | 'AS' | 'SR'
  
  // Mechanische Eigenschaften
  compressive_strength_class: string
  flexural_strength_class: string
  
  // Verschleißwiderstand (je nach Methode)
  wear_resistance_bohme_class?: string // A22-A1.5
  wear_resistance_bca_class?: string // AR6-AR0.5
  wear_resistance_rwfc_class?: string // RWFC350-RWFC50
  
  // Zusätzliche mechanische Eigenschaften
  surface_hardness_class?: string // SH30-SH200
  bond_strength_class?: string // B0.2-B2.0
  impact_resistance_class?: string // IR1-IR20
  
  // Brandverhalten
  fire_class?: string // A1fl, Bfl-s1, etc. oder NPD
  
  // Weitere Eigenschaften gemäß EN 13813
  water_permeability?: string // NPD oder Wert
  water_vapour_permeability?: string // NPD oder Wert
  sound_insulation?: string // NPD oder Wert
  sound_absorption?: string // NPD oder Wert
  thermal_resistance?: string // NPD oder Wert
  chemical_resistance?: string // NPD oder Klasse
  
  // Freisetzung gefährlicher Substanzen
  release_of_dangerous_substances?: string // 'Siehe SDS' oder NPD
  
  // Elektrische Eigenschaften (nur für AS)
  electrical_resistance?: string // NPD oder Wert
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
      method: 'flow_table' | 'slump' | 'compacting_factor' | 'EN12706' | 'EN13454-2'
      value_mm?: number // Konsistenzwert in mm
      target_mm?: number
      tolerance_mm?: number
    }
    setting_time?: {
      initial_minutes?: number
      final_minutes?: number
      method?: 'EN13454-2' | 'Vicat' | 'other'
    }
    ph_value?: number // PFLICHT ≥ 7 für CA-Estriche
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
  language?: 'de' | 'en' | 'fr' | string
  signatory?: {
    name: string
    position: string
    place?: string
  }
  authorizedRepresentative?: AuthorizedRepresentative
  notifiedBody?: NotifiedBody
}

export interface PDFGenerationParams {
  dop: DoP
  recipe: Recipe
  manufacturer: ManufacturerData
  batch?: Batch
  testReports?: TestReport[]
  language?: 'de' | 'en'
}

// Validation
export interface DoPValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

export interface DoPValidationRules {
  requireNotifiedBody?: boolean // für System 1+
  requireTestReports?: boolean
  requireBatch?: boolean
  checkExpiry?: boolean
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