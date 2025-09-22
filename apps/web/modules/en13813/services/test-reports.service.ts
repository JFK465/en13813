import { SupabaseClient } from '@supabase/supabase-js'

export interface TestReport {
  id?: string
  tenant_id?: string
  recipe_id: string
  report_type: 'ITT' | 'System1+' | 'System1' | 'System3' | 'System4' | 'FPC' | 'External'
  avcp_system?: '1' | '4'
  
  // Labor Information
  test_lab: string
  test_lab_address?: string
  notified_body_number?: string // Bei System 1+
  notified_body_name?: string
  
  // Identifikation
  report_number: string
  report_date: string
  test_date: string
  
  // Keine automatische Ablaufzeit für ITT!
  valid_from?: string
  invalidation_reason?: string
  invalidated_at?: string
  
  // Testergebnisse
  test_results: TestResults
  
  // Dokumente
  pdf_url?: string
  attachments?: Attachment[]
  
  // Validierung
  validation_status?: 'pending' | 'valid' | 'invalid' | 'superseded'
  validation_errors?: ValidationError[]
  
  // Audit
  created_at?: string
  updated_at?: string
}

export interface TestResults {
  compressive_strength?: TestResult
  flexural_strength?: TestResult
  fire_classification?: FireTestResult
  wear_resistance_bohme?: TestResult
  wear_resistance_bca?: TestResult
  wear_resistance_rwa?: TestResult
  rwfc?: TestResult
  surface_hardness?: TestResult
  bond_strength?: TestResult
  impact_resistance?: TestResult
  thermal_conductivity?: TestResult
  indentation?: TestResult
}

export interface TestResult {
  value: number
  unit: string
  class?: string
  age_days?: number
  norm: string
  passed: boolean
  individual_values?: number[]
  mean?: number
  std_dev?: number
}

export interface FireTestResult {
  class: string // z.B. "Bfl-s1"
  norm: string
  test_report?: string
  notified_body?: string
}

export interface Attachment {
  name: string
  url: string
  type: string
}

export interface ValidationError {
  field: string
  error: string
}

export interface ITTCompleteness {
  complete: boolean
  missing_tests: string[]
  can_generate_dop: boolean
}

export interface TestValidationRule {
  binder_type: string
  property: string
  is_mandatory: boolean
  conditions?: any
  test_norm: string
  test_age_days?: number
  notes?: string
}

export class TestReportsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Erstelle neuen Prüfbericht
   */
  async createTestReport(report: Partial<TestReport>): Promise<TestReport> {
    try {
      // AVCP System automatisch setzen basierend auf Brandklasse
      if (report.test_results?.fire_classification && 
          report.test_results.fire_classification.class !== 'A1fl' &&
          report.test_results.fire_classification.class !== 'NPD') {
        report.avcp_system = '1'
        if (!report.notified_body_number) {
          throw new Error('Notified Body Number ist erforderlich für System 1+ (Brandklasse != A1fl)')
        }
      } else {
        report.avcp_system = '4'
      }

      const { data, error } = await this.supabase
        .from('en13813_test_reports')
        .insert([report])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating test report:', error)
      throw error
    }
  }

  /**
   * Hole alle Prüfberichte für eine Rezeptur
   */
  async getTestReportsForRecipe(recipeId: string): Promise<TestReport[]> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_test_reports')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('test_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching test reports:', error)
      throw error
    }
  }

  /**
   * Prüfe ITT-Vollständigkeit für eine Rezeptur
   */
  async checkITTCompleteness(recipeId: string): Promise<ITTCompleteness> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_itt_completeness', { recipe_uuid: recipeId })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error checking ITT completeness:', error)
      throw error
    }
  }

  /**
   * Validiere Prüfbericht gegen Rezeptur
   */
  async validateTestReport(reportId: string): Promise<boolean> {
    try {
      // Hole Prüfbericht mit Rezeptur
      const { data: report, error: reportError } = await this.supabase
        .from('en13813_test_reports')
        .select(`
          *,
          recipe:en13813_recipes(*)
        `)
        .eq('id', reportId)
        .single()

      if (reportError) throw reportError
      if (!report) return false

      const errors: ValidationError[] = []
      const recipe = report.recipe

      // Validiere Druckfestigkeit
      if (report.test_results?.compressive_strength) {
        const testClass = report.test_results.compressive_strength.class
        const declaredClass = recipe.compressive_strength_class
        
        if (declaredClass !== 'NPD' && testClass < declaredClass) {
          errors.push({
            field: 'compressive_strength',
            error: `Getestete Klasse ${testClass} unter deklarierter Klasse ${declaredClass}`
          })
        }
      }

      // Validiere Biegezugfestigkeit
      if (report.test_results?.flexural_strength) {
        const testClass = report.test_results.flexural_strength.class
        const declaredClass = recipe.flexural_strength_class
        
        if (declaredClass !== 'NPD' && testClass < declaredClass) {
          errors.push({
            field: 'flexural_strength',
            error: `Getestete Klasse ${testClass} unter deklarierter Klasse ${declaredClass}`
          })
        }
      }

      // RWFC bei "mit Bodenbelag"
      if (recipe.intended_use?.with_flooring && !report.test_results?.rwfc) {
        errors.push({
          field: 'rwfc',
          error: 'RWFC (EN 13892-7) ist erforderlich bei "mit Bodenbelag"'
        })
      }

      // Update Validierungsstatus
      const validationStatus = errors.length === 0 ? 'valid' : 'invalid'
      
      const { error: updateError } = await this.supabase
        .from('en13813_test_reports')
        .update({
          validation_status: validationStatus,
          validation_errors: errors,
          validated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (updateError) throw updateError

      return errors.length === 0
    } catch (error) {
      console.error('Error validating test report:', error)
      throw error
    }
  }

  /**
   * Invalidiere ITT bei Rezepturänderung
   */
  async invalidateITTForRecipe(recipeId: string, reason: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('en13813_test_reports')
        .update({
          validation_status: 'superseded',
          invalidation_reason: reason,
          invalidated_at: new Date().toISOString()
        })
        .eq('recipe_id', recipeId)
        .eq('report_type', 'ITT')
        .eq('validation_status', 'valid')

      if (error) throw error
    } catch (error) {
      console.error('Error invalidating ITT:', error)
      throw error
    }
  }

  /**
   * Hole erforderliche Tests für Estrichtyp
   */
  async getRequiredTests(estrichType: string, intendedUse?: any): Promise<TestValidationRule[]> {
    try {
      const { data, error } = await this.supabase
        .from('en13813_test_validation_rules')
        .select('*')
        .eq('binder_type', estrichType)

      if (error) throw error
      
      // Filtere basierend auf Bedingungen
      const requiredTests = (data || []).filter(rule => {
        if (!rule.conditions) return rule.is_mandatory
        
        // Prüfe Bedingungen (vereinfacht)
        if (rule.property === 'wear_resistance' && intendedUse?.wearing_surface && !intendedUse?.with_flooring) {
          return true
        }
        if (rule.property === 'rwfc' && intendedUse?.with_flooring) {
          return true
        }
        if (rule.property === 'thermal_conductivity' && intendedUse?.heated_screed) {
          return true
        }
        
        return rule.is_mandatory
      })

      return requiredTests
    } catch (error) {
      console.error('Error fetching required tests:', error)
      throw error
    }
  }

  /**
   * Generiere Test-Matrix für Rezeptur
   */
  async generateTestMatrix(recipeId: string): Promise<any> {
    try {
      // Hole Rezeptur
      const { data: recipe, error: recipeError } = await this.supabase
        .from('en13813_recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      if (recipeError) throw recipeError
      if (!recipe) throw new Error('Rezeptur nicht gefunden')

      // Hole erforderliche Tests
      const requiredTests = await this.getRequiredTests(recipe.binder_type, recipe.intended_use)
      
      // Hole vorhandene Tests
      const existingReports = await this.getTestReportsForRecipe(recipeId)
      
      // Erstelle Matrix
      const testMatrix = requiredTests.map(test => {
        const hasTest = existingReports.some(report =>
          (report.test_results as any)[test.property] &&
          report.validation_status === 'valid'
        )
        
        return {
          property: test.property,
          norm: test.test_norm,
          age_days: test.test_age_days,
          is_mandatory: test.is_mandatory,
          status: hasTest ? 'completed' : 'missing',
          notes: test.notes
        }
      })

      return {
        recipe_id: recipeId,
        recipe_code: recipe.recipe_code,
        binder_type: recipe.binder_type,
        tests: testMatrix,
        all_tests_complete: testMatrix.every(t => !t.is_mandatory || t.status === 'completed'),
        can_generate_dop: testMatrix.filter(t => t.is_mandatory).every(t => t.status === 'completed')
      }
    } catch (error) {
      console.error('Error generating test matrix:', error)
      throw error
    }
  }

  /**
   * Upload Prüfbericht PDF
   */
  async uploadTestReportPDF(reportId: string, file: File): Promise<string> {
    try {
      const fileName = `test-reports/${reportId}/${file.name}`
      
      const { data, error } = await this.supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (error) throw error

      // Hole öffentliche URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // Update Prüfbericht mit PDF URL
      await this.supabase
        .from('en13813_test_reports')
        .update({ pdf_url: publicUrl })
        .eq('id', reportId)

      return publicUrl
    } catch (error) {
      console.error('Error uploading PDF:', error)
      throw error
    }
  }
}