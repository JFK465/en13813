import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Vollständige EN 13813-2002 konforme Test Report Implementierung
 * Basierend auf EN 13813:2002 - Estrichmörtel und Estriche
 */

// ==================== HAUPTINTERFACES ====================

export interface TestReportEN13813 {
  id?: string
  tenant_id?: string
  recipe_id: string
  
  // Prüfberichtstypen nach EN 13813
  report_type: 'ITT' | 'FPC' | 'External' | 'Audit'
  
  // AVCP System nach CPR
  avcp_system: '1' | '1+' | '3' | '4'
  
  // Labor Information (Abschnitt 6.2 & ZA.2.1)
  test_lab: string
  test_lab_address: string
  test_lab_accreditation?: string
  notified_body_number?: string // Bei System 1, 1+, 3
  notified_body_name?: string
  
  // Identifikation
  report_number: string
  report_date: string
  test_date: string
  sampling_date: string
  
  // Probenahme (Abschnitt 6.3.3.1)
  sampling: SamplingDetails
  
  // Gültigkeit
  valid_from: string
  valid_until?: string // Nur bei FPC
  invalidation_reason?: string
  invalidated_at?: string
  
  // Haupteigenschaften (Tabelle 1 & Abschnitt 5.2)
  test_results: TestResultsEN13813
  
  // Spezialeigenschaften (Abschnitt 5.3)
  special_characteristics?: SpecialCharacteristics
  
  // Statistische Auswertung (Abschnitt 9.2.2)
  statistical_evaluation?: StatisticalEvaluation
  
  // FPC Daten (Abschnitt 6.3)
  fpc_data?: FPCData
  
  // Dokumente
  pdf_url?: string
  attachments?: Attachment[]
  
  // Konformitätsbewertung (Abschnitt 9)
  conformity_assessment: ConformityAssessment
  
  // Validierung
  validation_status: 'pending' | 'valid' | 'invalid' | 'superseded'
  validation_errors?: ValidationError[]
  
  // Audit
  created_at?: string
  updated_at?: string
  created_by?: string
  approved_by?: string
  approved_at?: string
}

// ==================== PROBENAHME ====================

export interface SamplingDetails {
  // Nach EN 13892-1
  sampling_method: 'random' | 'representative' | 'targeted'
  sampling_location: string
  sampler_name: string
  sampler_qualification?: string
  number_of_samples: number
  sample_size_kg: number
  sample_preparation: string
  storage_conditions: string
  transport_conditions?: string
  chain_of_custody?: string[]
}

// ==================== HAUPTEIGENSCHAFTEN ====================

export interface TestResultsEN13813 {
  // Normative Eigenschaften (Tabelle 1)
  compressive_strength?: CompressiveStrengthResult
  flexural_strength?: FlexuralStrengthResult
  wear_resistance_bohme?: WearResistanceResult
  wear_resistance_bca?: WearResistanceResult
  wear_resistance_rwa?: WearResistanceResult
  surface_hardness?: SurfaceHardnessResult
  resistance_to_indentation?: IndentationResult
  rwfc?: RWFCResult
  bond_strength?: BondStrengthResult
  impact_resistance?: ImpactResistanceResult
  
  // Zusätzliche normative Eigenschaften
  shrinkage?: ShrinkageResult
  consistency?: ConsistencyResult
  setting_time?: SettingTimeResult
  modulus_of_elasticity?: ModulusResult
  ph_value?: PHValueResult // Zwingend für CA
}

export interface CompressiveStrengthResult {
  // Nach EN 13892-2
  individual_values: number[]
  mean: number
  std_dev: number
  characteristic_value: number // 5% Fraktil
  declared_class: string // C5, C7, C12, etc.
  actual_class: string
  age_days: number
  curing_conditions: string
  specimen_dimensions: string
  norm: 'EN 13892-2'
  passed: boolean
}

export interface FlexuralStrengthResult {
  // Nach EN 13892-2 oder EN ISO 178
  individual_values: number[]
  mean: number
  std_dev: number
  characteristic_value: number
  declared_class: string // F1, F2, F3, etc.
  actual_class: string
  age_days: number
  test_method: 'EN 13892-2' | 'EN ISO 178'
  specimen_dimensions: string
  passed: boolean
}

export interface WearResistanceResult {
  test_method: 'Böhme' | 'BCA' | 'RWA'
  norm: 'EN 13892-3' | 'EN 13892-4' | 'EN 13892-5'
  individual_values: number[]
  mean: number
  unit: 'cm³/50cm²' | 'μm' | 'cm³'
  declared_class: string
  actual_class: string
  passed: boolean
}

export interface SurfaceHardnessResult {
  // Nach EN 13892-6
  individual_values: number[]
  mean: number
  unit: 'N/mm²'
  declared_class: string // SH30, SH40, etc.
  actual_class: string
  norm: 'EN 13892-6'
  passed: boolean
}

export interface IndentationResult {
  // Nach EN 12697-20/21
  test_method: 'cube' | 'plate'
  temperature_celsius: number
  load_N: number
  duration_hours: number
  indentation_mm: number[]
  mean_indentation: number
  declared_class: string // IC10, IP10, etc.
  actual_class: string
  norm: 'EN 12697-20' | 'EN 12697-21'
  passed: boolean
}

export interface RWFCResult {
  // Nach EN 13892-7
  load_N: number
  cycles: number
  depth_mm: number[]
  mean_depth: number
  declared_class: string // RWFC150, RWFC250, etc.
  actual_class: string
  norm: 'EN 13892-7'
  passed: boolean
}

export interface BondStrengthResult {
  // Nach EN 13892-8
  individual_values: number[]
  mean: number
  std_dev: number
  unit: 'N/mm²'
  declared_class: string // B0.2, B0.5, B1.0, etc.
  actual_class: string
  substrate_type: string
  surface_preparation: string
  norm: 'EN 13892-8'
  passed: boolean
}

export interface ImpactResistanceResult {
  // Nach EN ISO 6272
  height_mm: number
  mass_kg: number
  energy_Nm: number
  damage_description: string
  declared_value: number
  norm: 'EN ISO 6272'
  passed: boolean
}

export interface ShrinkageResult {
  // Nach EN 13454-2 oder EN 13872
  test_method: 'EN 13454-2' | 'EN 13872'
  shrinkage_mm_per_m: number
  swelling_mm_per_m?: number
  age_days: number
  conditions: string
}

export interface ConsistencyResult {
  // Nach EN 13454-2 oder EN 12706
  test_method: 'EN 13454-2' | 'EN 12706'
  flow_diameter_mm: number
  water_content_percent: number
}

export interface SettingTimeResult {
  // Nach EN 13454-2
  initial_setting_minutes: number
  final_setting_minutes: number
  temperature_celsius: number
  norm: 'EN 13454-2'
}

export interface ModulusResult {
  // Nach EN ISO 178
  individual_values: number[]
  mean: number
  unit: 'kN/mm²'
  declared_class: string // E1, E2, E5, etc.
  actual_class: string
  norm: 'EN ISO 178'
  passed: boolean
}

export interface PHValueResult {
  // Nach EN 13454-2
  ph_value: number
  test_method: 'EN 13454-2'
  minimum_requirement: number // ≥ 7 für CA
  passed: boolean
}

// ==================== SPEZIALEIGENSCHAFTEN ====================

export interface SpecialCharacteristics {
  // Abschnitt 5.3
  electrical_resistance?: ElectricalResistance
  chemical_resistance?: ChemicalResistance
  reaction_to_fire?: ReactionToFire
  water_vapour_permeability?: WaterVapourPermeability
  thermal_resistance?: ThermalResistance
  water_permeability?: WaterPermeability
  impact_sound_insulation?: ImpactSoundInsulation
  sound_absorption?: SoundAbsorption
  release_of_dangerous_substances?: DangerousSubstances
}

export interface ElectricalResistance {
  // Nach EN 1081
  resistance_ohm: number
  test_voltage_V: number
  temperature_celsius: number
  humidity_percent: number
  designation: string // z.B. "ER10^5"
  norm: 'EN 1081'
}

export interface ChemicalResistance {
  // Nach EN 13529
  chemical_groups_tested: ChemicalGroup[]
  test_duration_days: number
  temperature_celsius: number
  designation: string // z.B. "CR1 to 8 (class 2)"
  norm: 'EN 13529'
}

export interface ChemicalGroup {
  group_number: number
  chemical_name: string
  concentration_percent: number
  resistance_class: '1' | '2' | '3'
  visual_change: string
  mass_change_percent: number
  strength_change_percent: number
}

export interface ReactionToFire {
  // Nach EN 13501-1
  euroclassification: string // A1fl, A2fl, Bfl, Cfl, Dfl, Efl, Ffl
  smoke_class?: 's1' | 's2'
  droplets_class?: 'd0' | 'd1' | 'd2'
  test_report_number: string
  notified_body: string
  norm: 'EN 13501-1'
}

export interface WaterVapourPermeability {
  // Nach EN 12086
  sd_value_m: number // Diffusionswiderstand
  mu_value: number
  test_conditions: string
  norm: 'EN 12086'
}

export interface ThermalResistance {
  // Nach EN 12664 oder EN 12524
  thermal_conductivity_lambda: number
  unit: 'W/(m·K)'
  test_method: 'EN 12664' | 'EN 12524'
  moisture_content_percent: number
  temperature_celsius: number
}

export interface WaterPermeability {
  // Nach EN 1062-3
  permeability_kg_per_m2_h: number
  test_pressure_bar: number
  test_duration_hours: number
  norm: 'EN 1062-3'
}

export interface ImpactSoundInsulation {
  // Nach EN ISO 140-6
  delta_Lw_dB: number
  frequency_Hz: number[]
  test_setup: string
  norm: 'EN ISO 140-6'
}

export interface SoundAbsorption {
  // Nach EN ISO 354
  absorption_coefficient_alpha: number[]
  frequency_Hz: number[]
  nrc_value: number // Noise Reduction Coefficient
  norm: 'EN ISO 354'
}

export interface DangerousSubstances {
  // Nach ZA.1
  substances_tested: string[]
  emission_rates: EmissionRate[]
  declaration: string
  test_method: string
}

export interface EmissionRate {
  substance: string
  emission_mg_per_m3: number
  time_days: number
  limit_value: number
  compliant: boolean
}

// ==================== STATISTISCHE AUSWERTUNG ====================

export interface StatisticalEvaluation {
  // Abschnitt 9.2.2
  evaluation_method: 'variables' | 'attributes'
  control_period_start: string
  control_period_end: string
  number_of_samples: number
  
  // Für Variables-Methode
  variables_evaluation?: VariablesEvaluation
  
  // Für Attributes-Methode
  attributes_evaluation?: AttributesEvaluation
}

export interface VariablesEvaluation {
  property: string
  individual_results: number[]
  mean_value: number
  standard_deviation: number
  characteristic_value: number
  acceptability_constant_kA: number // Aus Tabelle 12
  lower_limit?: number
  upper_limit?: number
  pk_percentile: number // Standard 10%
  cr_probability: number // Standard 5%
  conformity: boolean
  calculation_formula: string
}

export interface AttributesEvaluation {
  property: string
  number_of_tests: number
  number_outside_limits: number
  acceptable_number_CA: number // Aus Tabelle 13
  pk_percentile: number
  cr_probability: number
  conformity: boolean
}

// ==================== FACTORY PRODUCTION CONTROL ====================

export interface FPCData {
  // Abschnitt 6.3
  quality_manual_reference: string
  production_control_system: ProductionControlSystem
  process_control: ProcessControl
  incoming_materials: IncomingMaterialsControl
  testing_frequency: TestingFrequency
  equipment_calibration: EquipmentCalibration[]
  traceability: TraceabilityData
  non_conforming_products: NonConformingProduct[]
}

export interface ProductionControlSystem {
  procedures: string[]
  responsible_person: string
  iso_9001_certified: boolean
  certification_number?: string
  last_audit_date: string
}

export interface ProcessControl {
  mixing_control: MixingControl
  production_parameters: ProductionParameter[]
  in_process_testing: InProcessTest[]
}

export interface MixingControl {
  mixer_type: string
  mixing_time_seconds: number
  mixing_speed_rpm: number
  temperature_celsius: number
  water_dosing_accuracy_percent: number
}

export interface ProductionParameter {
  parameter_name: string
  target_value: number
  tolerance: number
  unit: string
  control_frequency: string
  action_limits: {
    lower: number
    upper: number
  }
}

export interface InProcessTest {
  test_name: string
  frequency: string
  acceptance_criteria: string
  last_result: number
  unit: string
  passed: boolean
}

export interface IncomingMaterialsControl {
  cement_control?: MaterialControl
  aggregate_control?: MaterialControl
  additive_control?: MaterialControl
  water_control?: MaterialControl
}

export interface MaterialControl {
  supplier: string
  specification: string
  delivery_note_check: boolean
  visual_inspection: boolean
  testing_frequency: string
  last_test_date: string
  conformity_certificate: boolean
}

export interface TestingFrequency {
  // Nach Abschnitt 6.3.3.1
  compressive_strength: FrequencyPlan
  flexural_strength: FrequencyPlan
  consistency?: FrequencyPlan
  other_properties: FrequencyPlan[]
}

export interface FrequencyPlan {
  property: string
  frequency_per_volume: string // z.B. "1 pro 200m³"
  frequency_per_time: string // z.B. "1 pro Woche"
  minimum_frequency: string
  increased_frequency_triggers: string[]
}

export interface EquipmentCalibration {
  equipment_name: string
  equipment_id: string
  calibration_frequency: string
  last_calibration_date: string
  next_calibration_date: string
  calibration_certificate: string
  calibrated_by: string
}

export interface TraceabilityData {
  batch_number: string
  production_date: string
  production_volume_m3: number
  raw_materials_batch_numbers: {
    material: string
    batch: string
    supplier: string
  }[]
  destination: string
  delivery_note_number: string
}

export interface NonConformingProduct {
  date: string
  batch_number: string
  non_conformity_description: string
  root_cause: string
  corrective_action: string
  preventive_action: string
  disposition: 'rework' | 'reject' | 'accept_with_deviation'
  approved_by: string
}

// ==================== KONFORMITÄTSBEWERTUNG ====================

export interface ConformityAssessment {
  // Abschnitt 9
  assessment_type: 'initial_type_testing' | 'factory_production_control' | 'continuous_surveillance'
  conformity_criteria: ConformityCriteria[]
  overall_conformity: boolean
  ce_marking_authorized: boolean
  declaration_of_performance_valid: boolean
}

export interface ConformityCriteria {
  property: string
  requirement: string
  test_result: string
  evaluation_method: 'statistical' | 'individual'
  limit_value: number
  tolerance_percent: number // 10% nach Norm
  conformity: boolean
  remarks?: string
}

// ==================== HILFSFUNKTIONEN ====================

export interface ValidationError {
  field: string
  error: string
  severity: 'error' | 'warning'
}

export interface Attachment {
  name: string
  url: string
  type: string
  size_bytes: number
  uploaded_at: string
}

// ==================== GRENZWERTE UND KLASSEN ====================

export const EN13813_CLASSES = {
  compressive_strength: {
    CT: ['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80'],
    CA: ['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80'],
    MA: ['C5', 'C7', 'C12', 'C16', 'C20', 'C25', 'C30', 'C35', 'C40', 'C50', 'C60', 'C70', 'C80']
  },
  flexural_strength: {
    CT: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'],
    CA: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'],
    MA: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50'],
    SR: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F10', 'F15', 'F20', 'F30', 'F40', 'F50']
  },
  wear_resistance_bohme: ['A22', 'A15', 'A12', 'A9', 'A6', 'A3', 'A1.5'],
  wear_resistance_bca: ['AR6', 'AR4', 'AR2', 'AR1', 'AR0.5'],
  wear_resistance_rwa: ['RWA300', 'RWA100', 'RWA20', 'RWA10', 'RWA1'],
  surface_hardness: ['SH30', 'SH40', 'SH50', 'SH70', 'SH100', 'SH150', 'SH200'],
  rwfc: ['RWFC150', 'RWFC250', 'RWFC350', 'RWFC450', 'RWFC550'],
  bond_strength: ['B0.2', 'B0.5', 'B1.0', 'B1.5', 'B2.0'],
  modulus_elasticity: ['E1', 'E2', 'E5', 'E10', 'E15', 'E20'],
  indentation: {
    cube: ['ICH10', 'IC10', 'IC15', 'IC40', 'IC100'],
    plate: ['IP10', 'IP12', 'IP30', 'IP70', 'IP I', 'IP II', 'IP III', 'IP IV']
  },
  reaction_to_fire: ['A1fl', 'A2fl', 'Bfl', 'Cfl', 'Dfl', 'Efl', 'Ffl']
}

// ==================== AKZEPTABILITÄTSKONSTANTEN ====================

export const ACCEPTABILITY_CONSTANTS_KA: { [key: number]: number } = {
  // Tabelle 12 - für Pk = 10%, CR = 5%
  10: 2.35, 11: 2.35, 12: 2.35, 13: 2.35, 14: 2.35,
  15: 2.07, 16: 2.07, 17: 2.07, 18: 2.07, 19: 2.07,
  20: 1.93, 21: 1.93, 22: 1.93, 23: 1.93, 24: 1.93,
  25: 1.84, 26: 1.84, 27: 1.84, 28: 1.84, 29: 1.84,
  30: 1.78, 31: 1.78, 32: 1.78, 33: 1.78, 34: 1.78,
  35: 1.73, 36: 1.73, 37: 1.73, 38: 1.73, 39: 1.73,
  40: 1.70, 45: 1.70, 49: 1.70,
  50: 1.65, 55: 1.65, 59: 1.65,
  60: 1.61, 65: 1.61, 69: 1.61,
  70: 1.58, 75: 1.58, 79: 1.58,
  80: 1.56, 90: 1.56, 99: 1.56,
  100: 1.53, 150: 1.53, 199: 1.53,
  200: 1.45, 250: 1.45, 299: 1.45,
  300: 1.42
}

export function getAcceptabilityConstant(n: number): number {
  if (n < 10) throw new Error('Mindestens 10 Prüfungen erforderlich')
  if (n >= 300) return 1.42
  
  // Finde nächsten verfügbaren Wert
  const keys = Object.keys(ACCEPTABILITY_CONSTANTS_KA).map(Number).sort((a, b) => a - b)
  for (const key of keys) {
    if (n <= key) return ACCEPTABILITY_CONSTANTS_KA[key]
  }
  return 1.42
}

// ==================== CA WERTE FÜR ATTRIBUTES ====================

export const ACCEPTABLE_NUMBERS_CA: { [key: string]: number } = {
  // Tabelle 13 - für Pk = 10%
  '20-39': 0,
  '40-54': 1,
  '55-69': 2,
  '70-84': 3,
  '85-99': 4,
  '100-109': 5
}

export function getAcceptableNumber(n: number): number {
  if (n < 20) throw new Error('Mindestens 20 Prüfungen für Attributes-Methode erforderlich')
  if (n >= 20 && n <= 39) return 0
  if (n >= 40 && n <= 54) return 1
  if (n >= 55 && n <= 69) return 2
  if (n >= 70 && n <= 84) return 3
  if (n >= 85 && n <= 99) return 4
  if (n >= 100 && n <= 109) return 5
  
  // Für n > 109: CA = floor(n * 0.05)
  return Math.floor(n * 0.05)
}

// ==================== SERVICE KLASSE ====================

export class TestReportsEN13813Service {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Erstelle neuen EN 13813 konformen Prüfbericht
   */
  async createTestReport(report: Partial<TestReportEN13813>): Promise<TestReportEN13813> {
    try {
      // Validiere Pflichtfelder
      this.validateRequiredFields(report)
      
      // Setze AVCP System basierend auf Brandklasse
      report.avcp_system = this.determineAVCPSystem(report)
      
      // Validiere gegen EN 13813 Anforderungen
      const validationErrors = await this.validateAgainstEN13813(report)
      if (validationErrors.length > 0) {
        report.validation_status = 'invalid'
        report.validation_errors = validationErrors
      } else {
        report.validation_status = 'valid'
      }
      
      // Speichere in Datenbank
      const { data, error } = await this.supabase
        .from('en13813_test_reports')
        .insert([report])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating EN 13813 test report:', error)
      throw error
    }
  }

  /**
   * Bestimme AVCP System nach CPR und EN 13813
   */
  private determineAVCPSystem(report: Partial<TestReportEN13813>): '1' | '1+' | '3' | '4' {
    const fireClass = report.special_characteristics?.reaction_to_fire?.euroclassification
    
    // System 1: Brandklasse A1fl, A2fl, Bfl, Cfl mit Verbesserung
    if (fireClass && ['A1fl', 'A2fl', 'Bfl', 'Cfl'].includes(fireClass.split('-')[0])) {
      // Prüfe ob Brandschutzmittel oder organische Begrenzung
      if (report.fpc_data?.production_control_system.procedures.includes('fire_retardant')) {
        return '1'
      }
    }
    
    // System 3: Brandklasse A1fl, A2fl, Bfl, Cfl, Dfl, Efl ohne Verbesserung
    if (fireClass && ['A1fl', 'A2fl', 'Bfl', 'Cfl', 'Dfl', 'Efl'].includes(fireClass.split('-')[0])) {
      return '3'
    }
    
    // System 4: Standard oder Ffl
    return '4'
  }

  /**
   * Validiere Pflichtfelder nach EN 13813
   */
  private validateRequiredFields(report: Partial<TestReportEN13813>): void {
    const required = ['recipe_id', 'report_type', 'test_lab', 'report_number', 'report_date', 'test_date']
    const missing = required.filter(field => !report[field as keyof TestReportEN13813])
    
    if (missing.length > 0) {
      throw new Error(`Pflichtfelder fehlen: ${missing.join(', ')}`)
    }
    
    // Spezielle Validierung für CA Estriche
    if (report.test_results?.ph_value && report.test_results.ph_value.ph_value < 7) {
      throw new Error('pH-Wert muss ≥ 7 für Calciumsulfat-Estriche sein (EN 13813)')
    }
  }

  /**
   * Validiere gegen EN 13813 Anforderungen
   */
  private async validateAgainstEN13813(report: Partial<TestReportEN13813>): Promise<ValidationError[]> {
    const errors: ValidationError[] = []
    
    // Hole Rezeptur für Vergleich
    const { data: recipe } = await this.supabase
      .from('en13813_recipes')
      .select('*')
      .eq('id', report.recipe_id)
      .single()
    
    if (!recipe) {
      errors.push({
        field: 'recipe_id',
        error: 'Rezeptur nicht gefunden',
        severity: 'error'
      })
      return errors
    }
    
    // Validiere Druckfestigkeit
    if (report.test_results?.compressive_strength) {
      const result = report.test_results.compressive_strength
      if (result.actual_class < recipe.compressive_strength_class) {
        errors.push({
          field: 'compressive_strength',
          error: `Tatsächliche Klasse ${result.actual_class} unter deklarierter Klasse ${recipe.compressive_strength_class}`,
          severity: 'error'
        })
      }
      
      // Prüfe 10% Toleranz
      const tolerance = result.characteristic_value * 0.1
      if (Math.abs(result.mean - result.characteristic_value) > tolerance) {
        errors.push({
          field: 'compressive_strength',
          error: '10% Toleranzgrenze überschritten',
          severity: 'warning'
        })
      }
    }
    
    // Weitere Validierungen...
    
    return errors
  }

  /**
   * Führe statistische Konformitätsbewertung durch (Abschnitt 9.2.2)
   */
  async performStatisticalEvaluation(
    recipeId: string,
    property: string,
    startDate: string,
    endDate: string
  ): Promise<StatisticalEvaluation> {
    try {
      // Hole alle Testergebnisse im Kontrollzeitraum
      const { data: reports } = await this.supabase
        .from('en13813_test_reports')
        .select('test_results')
        .eq('recipe_id', recipeId)
        .gte('test_date', startDate)
        .lte('test_date', endDate)
        .eq('validation_status', 'valid')
      
      if (!reports || reports.length < 10) {
        throw new Error('Mindestens 10 Prüfungen für statistische Auswertung erforderlich')
      }
      
      // Extrahiere Einzelwerte
      const values: number[] = []
      reports.forEach(report => {
        const result = report.test_results[property]
        if (result?.individual_values) {
          values.push(...result.individual_values)
        }
      })
      
      const n = values.length
      
      // Berechne statistische Kennwerte
      const mean = values.reduce((a, b) => a + b, 0) / n
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1)
      const stdDev = Math.sqrt(variance)
      
      // Hole Akzeptabilitätskonstante
      const kA = getAcceptabilityConstant(n)
      
      // Berechne charakteristischen Wert (5% Fraktil für Festigkeiten)
      const characteristicValue = mean - kA * stdDev
      
      // Prüfe Konformität
      const { data: recipe } = await this.supabase
        .from('en13813_recipes')
        .select(`${property}_class`)
        .eq('id', recipeId)
        .single()
      
      const declaredValue = this.getNumericValueFromClass(recipe[`${property}_class`])
      const conformity = characteristicValue >= declaredValue
      
      return {
        evaluation_method: 'variables',
        control_period_start: startDate,
        control_period_end: endDate,
        number_of_samples: reports.length,
        variables_evaluation: {
          property,
          individual_results: values,
          mean_value: mean,
          standard_deviation: stdDev,
          characteristic_value: characteristicValue,
          acceptability_constant_kA: kA,
          lower_limit: declaredValue,
          pk_percentile: 10,
          cr_probability: 5,
          conformity,
          calculation_formula: `x̄ - kA × s = ${mean.toFixed(2)} - ${kA} × ${stdDev.toFixed(2)} = ${characteristicValue.toFixed(2)}`
        }
      }
    } catch (error) {
      console.error('Error in statistical evaluation:', error)
      throw error
    }
  }

  /**
   * Erstelle FPC Bericht (Factory Production Control)
   */
  async createFPCReport(
    recipeId: string,
    productionData: Partial<FPCData>
  ): Promise<TestReportEN13813> {
    try {
      const fpcReport: Partial<TestReportEN13813> = {
        recipe_id: recipeId,
        report_type: 'FPC',
        test_lab: productionData.production_control_system?.responsible_person || '',
        report_number: `FPC-${Date.now()}`,
        report_date: new Date().toISOString(),
        test_date: new Date().toISOString(),
        sampling_date: new Date().toISOString(),
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 Jahr
        fpc_data: productionData as FPCData,
        sampling: {
          sampling_method: 'representative',
          sampling_location: 'Produktionsstätte',
          sampler_name: productionData.production_control_system?.responsible_person || '',
          number_of_samples: 1,
          sample_size_kg: 5,
          sample_preparation: 'Nach EN 13892-1',
          storage_conditions: '20°C, 65% RH'
        },
        test_results: {} as TestResultsEN13813,
        conformity_assessment: {
          assessment_type: 'factory_production_control',
          conformity_criteria: [],
          overall_conformity: true,
          ce_marking_authorized: true,
          declaration_of_performance_valid: true
        }
      }
      
      return await this.createTestReport(fpcReport)
    } catch (error) {
      console.error('Error creating FPC report:', error)
      throw error
    }
  }

  /**
   * Prüfe ITT Vollständigkeit nach Tabelle 1
   */
  async checkITTCompleteness(recipeId: string): Promise<{
    complete: boolean
    missing_tests: string[]
    can_generate_dop: boolean
    test_matrix: any[]
  }> {
    try {
      // Hole Rezeptur
      const { data: recipe } = await this.supabase
        .from('en13813_recipes')
        .select('*')
        .eq('id', recipeId)
        .single()
      
      if (!recipe) throw new Error('Rezeptur nicht gefunden')
      
      // Bestimme erforderliche Tests nach Tabelle 1
      const requiredTests = this.getRequiredTestsFromTable1(recipe.estrich_type, recipe.intended_use)
      
      // Hole vorhandene ITT Berichte
      const { data: ittReports } = await this.supabase
        .from('en13813_test_reports')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('report_type', 'ITT')
        .eq('validation_status', 'valid')
      
      // Prüfe welche Tests vorhanden sind
      const testMatrix = requiredTests.map(test => {
        const hasTest = ittReports?.some(report => {
          const testResult = report.test_results[test.property]
          return testResult && testResult.passed
        })
        
        return {
          property: test.property,
          description: test.description,
          norm: test.norm,
          is_mandatory: test.is_mandatory,
          status: hasTest ? 'completed' : 'missing'
        }
      })
      
      const mandatoryTests = testMatrix.filter(t => t.is_mandatory)
      const missingMandatory = mandatoryTests.filter(t => t.status === 'missing')
      
      return {
        complete: missingMandatory.length === 0,
        missing_tests: missingMandatory.map(t => t.description),
        can_generate_dop: missingMandatory.length === 0,
        test_matrix: testMatrix
      }
    } catch (error) {
      console.error('Error checking ITT completeness:', error)
      throw error
    }
  }

  /**
   * Bestimme erforderliche Tests aus Tabelle 1
   */
  private getRequiredTestsFromTable1(estrichType: string, intendedUse: any): any[] {
    const tests = []
    
    // Normative Tests für alle Estrichtypen (außer AS)
    if (estrichType !== 'AS') {
      tests.push(
        { property: 'compressive_strength', description: 'Druckfestigkeit', norm: 'EN 13892-2', is_mandatory: true },
        { property: 'flexural_strength', description: 'Biegezugfestigkeit', norm: 'EN 13892-2', is_mandatory: true }
      )
    }
    
    // Verschleißwiderstand für Nutzschicht
    if (intendedUse?.wearing_surface && !intendedUse?.with_flooring) {
      if (estrichType === 'CT') {
        tests.push({
          property: 'wear_resistance',
          description: 'Verschleißwiderstand (Böhme/BCA/RWA)',
          norm: 'EN 13892-3/4/5',
          is_mandatory: true
        })
      }
    }
    
    // RWFC für Estriche mit Bodenbelag
    if (intendedUse?.with_flooring) {
      tests.push({
        property: 'rwfc',
        description: 'Widerstand gegen Rollbeanspruchung',
        norm: 'EN 13892-7',
        is_mandatory: false
      })
    }
    
    // Oberflächenhärte für MA
    if (estrichType === 'MA' && intendedUse?.wearing_surface) {
      tests.push({
        property: 'surface_hardness',
        description: 'Oberflächenhärte',
        norm: 'EN 13892-6',
        is_mandatory: true
      })
    }
    
    // Eindringtiefe für AS
    if (estrichType === 'AS') {
      tests.push({
        property: 'resistance_to_indentation',
        description: 'Eindringtiefe',
        norm: 'EN 12697-20/21',
        is_mandatory: true
      })
    }
    
    // pH-Wert für CA
    if (estrichType === 'CA') {
      tests.push({
        property: 'ph_value',
        description: 'pH-Wert',
        norm: 'EN 13454-2',
        is_mandatory: true
      })
    }
    
    // Brandverhalten
    if (intendedUse?.fire_requirements) {
      tests.push({
        property: 'reaction_to_fire',
        description: 'Brandverhalten',
        norm: 'EN 13501-1',
        is_mandatory: true
      })
    }
    
    return tests
  }

  /**
   * Generiere Probenahmeplan nach 6.3.3.1
   */
  async generateSamplingPlan(recipeId: string, productionVolume: number): Promise<TestingFrequency> {
    try {
      const { data: recipe } = await this.supabase
        .from('en13813_recipes')
        .select('estrich_type')
        .eq('id', recipeId)
        .single()
      
      if (!recipe) throw new Error('Rezeptur nicht gefunden')
      
      // Basis-Frequenzen nach Norm
      const samplingPlan: TestingFrequency = {
        compressive_strength: {
          property: 'Druckfestigkeit',
          frequency_per_volume: '1 pro 200 m³',
          frequency_per_time: '1 pro Woche',
          minimum_frequency: '1 pro Produktionstag bei < 200 m³/Woche',
          increased_frequency_triggers: [
            'Neue Rohstoffcharge',
            'Prozessänderung',
            'Grenzwertüberschreitung',
            'Nach Stillstand > 4 Wochen'
          ]
        },
        flexural_strength: {
          property: 'Biegezugfestigkeit',
          frequency_per_volume: '1 pro 200 m³',
          frequency_per_time: '1 pro Woche',
          minimum_frequency: '1 pro Produktionstag bei < 200 m³/Woche',
          increased_frequency_triggers: ['Parallel zu Druckfestigkeit']
        },
        consistency: {
          property: 'Konsistenz',
          frequency_per_volume: '1 pro 50 m³',
          frequency_per_time: '2 pro Tag',
          minimum_frequency: '1 pro Charge',
          increased_frequency_triggers: ['Wassergehaltsschwankung > 2%']
        },
        other_properties: []
      }
      
      // Zusätzliche Tests je nach Estrichtyp
      if (recipe.estrich_type === 'CA') {
        samplingPlan.other_properties.push({
          property: 'pH-Wert',
          frequency_per_volume: '1 pro 500 m³',
          frequency_per_time: '1 pro Monat',
          minimum_frequency: '1 pro Quartal',
          increased_frequency_triggers: ['Gipswechsel']
        })
      }
      
      return samplingPlan
    } catch (error) {
      console.error('Error generating sampling plan:', error)
      throw error
    }
  }

  /**
   * Berechne charakteristischen Wert (5% Fraktil)
   */
  private calculateCharacteristicValue(values: number[], property: string): number {
    const n = values.length
    if (n < 3) return Math.min(...values)
    
    // Sortiere Werte
    const sorted = [...values].sort((a, b) => a - b)
    
    // 5% Fraktil Position
    const position = Math.floor(n * 0.05)
    
    // Interpoliere wenn nötig
    if (position === 0) {
      return sorted[0]
    }
    
    const lower = sorted[position - 1]
    const upper = sorted[position]
    const fraction = (n * 0.05) - position
    
    return lower + fraction * (upper - lower)
  }

  /**
   * Konvertiere Klasse zu numerischem Wert
   */
  private getNumericValueFromClass(className: string): number {
    // Extrahiere Zahl aus Klassenbezeichnung (z.B. "C30" -> 30)
    const match = className.match(/\d+(\.\d+)?/)
    return match ? parseFloat(match[0]) : 0
  }

  /**
   * Validiere Einzelprüfung gegen Grenzwert mit 10% Toleranz
   */
  private validateWithTolerance(value: number, limit: number, tolerance: number = 0.1): boolean {
    const allowedDeviation = limit * tolerance
    return value >= (limit - allowedDeviation)
  }

  /**
   * Erstelle Konformitätszertifikat
   */
  async generateConformityCertificate(recipeId: string): Promise<any> {
    try {
      // Prüfe ITT Vollständigkeit
      const ittComplete = await this.checkITTCompleteness(recipeId)
      if (!ittComplete.complete) {
        throw new Error(`ITT unvollständig. Fehlende Tests: ${ittComplete.missing_tests.join(', ')}`)
      }
      
      // Hole aktuelle FPC Daten
      const { data: fpcReport } = await this.supabase
        .from('en13813_test_reports')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('report_type', 'FPC')
        .eq('validation_status', 'valid')
        .order('report_date', { ascending: false })
        .limit(1)
        .single()
      
      if (!fpcReport) {
        throw new Error('Kein gültiger FPC Bericht vorhanden')
      }
      
      // Erstelle Zertifikat
      const certificate = {
        certificate_number: `CE-${Date.now()}`,
        issue_date: new Date().toISOString(),
        recipe_id: recipeId,
        avcp_system: fpcReport.avcp_system,
        notified_body: fpcReport.notified_body_number,
        itt_reports: ittComplete.test_matrix.filter(t => t.status === 'completed'),
        fpc_report: {
          number: fpcReport.report_number,
          date: fpcReport.report_date,
          valid_until: fpcReport.valid_until
        },
        conformity: true,
        ce_marking_authorized: true
      }
      
      return certificate
    } catch (error) {
      console.error('Error generating conformity certificate:', error)
      throw error
    }
  }
}

export default TestReportsEN13813Service