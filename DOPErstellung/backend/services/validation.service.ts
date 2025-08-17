import { z } from 'zod'

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

export class EN13813ValidationService {
  // Strength class validation patterns
  private readonly strengthPatterns = {
    compressive: /^C(5|7|12|16|20|25|30|35|40|50|60|70|80)$/,
    flexural: /^F(1|2|3|4|5|6|7|10|15|20|30|40|50)$/,
    wear: /^(A(1|3|6|9|12|15|22)|AR(0\.5|1|2|4|6))$/
  }

  // Fire class validation
  private readonly fireClasses = ['A1fl', 'A2fl', 'Bfl', 'Cfl', 'Dfl', 'Efl', 'Ffl']

  // Estrich types
  private readonly estrichTypes = ['CT', 'CA', 'MA', 'SR', 'AS']

  // Minimum strength relationships (compressive -> flexural)
  private readonly minFlexuralStrength: Record<string, string> = {
    'C5': 'F1',
    'C7': 'F1',
    'C12': 'F2',
    'C16': 'F3',
    'C20': 'F3',
    'C25': 'F4',
    'C30': 'F4',
    'C35': 'F5',
    'C40': 'F6',
    'C50': 'F7',
    'C60': 'F10',
    'C70': 'F15',
    'C80': 'F20'
  }

  validateRecipeCode(code: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Basic format check
    const parts = code.split('-')
    if (parts.length < 3) {
      errors.push({
        field: 'recipe_code',
        message: 'Rezeptur-Code muss mindestens Typ-Druckfestigkeit-Biegezugfestigkeit enthalten (z.B. CT-C25-F4)',
        code: 'INVALID_FORMAT'
      })
      return { valid: false, errors, warnings }
    }

    const [type, compressive, flexural, ...additional] = parts

    // Validate type
    if (!this.estrichTypes.includes(type)) {
      errors.push({
        field: 'recipe_code',
        message: `Ungültiger Estrich-Typ: ${type}. Erlaubt sind: ${this.estrichTypes.join(', ')}`,
        code: 'INVALID_TYPE'
      })
    }

    // Validate compressive strength
    if (!this.strengthPatterns.compressive.test(compressive)) {
      errors.push({
        field: 'recipe_code',
        message: `Ungültige Druckfestigkeitsklasse: ${compressive}`,
        code: 'INVALID_COMPRESSIVE_STRENGTH'
      })
    }

    // Validate flexural strength
    if (!this.strengthPatterns.flexural.test(flexural)) {
      errors.push({
        field: 'recipe_code',
        message: `Ungültige Biegezugfestigkeitsklasse: ${flexural}`,
        code: 'INVALID_FLEXURAL_STRENGTH'
      })
    }

    // Validate wear resistance if present
    if (additional.length > 0) {
      const wear = additional[0]
      if (!this.strengthPatterns.wear.test(wear)) {
        warnings.push({
          field: 'recipe_code',
          message: `Möglicherweise ungültige Verschleißwiderstandsklasse: ${wear}`,
          code: 'POSSIBLY_INVALID_WEAR'
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  validateStrengthRelationship(compressiveClass: string, flexuralClass: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Extract numeric values
    const compressiveValue = parseInt(compressiveClass.replace('C', ''))
    const flexuralValue = parseFloat(flexuralClass.replace('F', ''))

    // Check minimum flexural strength requirement
    const minFlexural = this.minFlexuralStrength[compressiveClass]
    if (minFlexural) {
      const minFlexuralValue = parseFloat(minFlexural.replace('F', ''))
      if (flexuralValue < minFlexuralValue) {
        errors.push({
          field: 'flexural_strength_class',
          message: `Für Druckfestigkeitsklasse ${compressiveClass} ist mindestens Biegezugfestigkeitsklasse ${minFlexural} erforderlich`,
          code: 'INSUFFICIENT_FLEXURAL_STRENGTH'
        })
      }
    }

    // Check typical relationships
    const typicalRatio = compressiveValue / flexuralValue
    if (typicalRatio < 4 || typicalRatio > 8) {
      warnings.push({
        field: 'strength_ratio',
        message: `Das Verhältnis Druckfestigkeit/Biegezugfestigkeit (${typicalRatio.toFixed(1)}) liegt außerhalb des typischen Bereichs (4-8)`,
        code: 'UNUSUAL_STRENGTH_RATIO'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  validateTestResults(testResults: any, recipe: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Extract class values
    const requiredCompressive = parseInt(recipe.compressive_strength_class.replace('C', ''))
    const requiredFlexural = parseFloat(recipe.flexural_strength_class.replace('F', ''))

    // Validate compressive strength
    if (testResults.compressive_strength) {
      const actualCompressive = testResults.compressive_strength.value
      if (actualCompressive < requiredCompressive) {
        errors.push({
          field: 'compressive_strength',
          message: `Druckfestigkeit (${actualCompressive} N/mm²) unterschreitet die geforderte Klasse ${recipe.compressive_strength_class} (${requiredCompressive} N/mm²)`,
          code: 'COMPRESSIVE_STRENGTH_TOO_LOW'
        })
      }

      // Check for safety margin
      const margin = ((actualCompressive - requiredCompressive) / requiredCompressive) * 100
      if (margin < 10 && margin >= 0) {
        warnings.push({
          field: 'compressive_strength',
          message: `Druckfestigkeit hat nur ${margin.toFixed(1)}% Sicherheitsmarge. Empfohlen sind mindestens 10%`,
          code: 'LOW_SAFETY_MARGIN'
        })
      }
    }

    // Validate flexural strength
    if (testResults.flexural_strength) {
      const actualFlexural = testResults.flexural_strength.value
      if (actualFlexural < requiredFlexural) {
        errors.push({
          field: 'flexural_strength',
          message: `Biegezugfestigkeit (${actualFlexural} N/mm²) unterschreitet die geforderte Klasse ${recipe.flexural_strength_class} (${requiredFlexural} N/mm²)`,
          code: 'FLEXURAL_STRENGTH_TOO_LOW'
        })
      }
    }

    // Validate test methods
    if (testResults.compressive_strength && testResults.compressive_strength.test_method !== 'EN 13892-2') {
      warnings.push({
        field: 'test_method',
        message: 'Druckfestigkeit sollte nach EN 13892-2 geprüft werden',
        code: 'NON_STANDARD_TEST_METHOD'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  validateDoP(dop: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Validate manufacturer info
    if (!dop.manufacturer_info.company_name || dop.manufacturer_info.company_name.length < 3) {
      errors.push({
        field: 'manufacturer_info.company_name',
        message: 'Firmenname ist erforderlich',
        code: 'MISSING_COMPANY_NAME'
      })
    }

    if (!dop.manufacturer_info.authorized_person) {
      errors.push({
        field: 'manufacturer_info.authorized_person',
        message: 'Bevollmächtigte Person ist erforderlich',
        code: 'MISSING_AUTHORIZED_PERSON'
      })
    }

    // Validate essential characteristics
    const requiredCharacteristics = [
      'Brandverhalten',
      'Freisetzung ätzender Substanzen',
      'Druckfestigkeit',
      'Biegezugfestigkeit'
    ]

    const providedCharacteristics = dop.declared_performance.essential_characteristics.map((c: any) => c.characteristic)
    
    for (const required of requiredCharacteristics) {
      if (!providedCharacteristics.includes(required)) {
        errors.push({
          field: 'declared_performance.essential_characteristics',
          message: `Wesentliches Merkmal fehlt: ${required}`,
          code: 'MISSING_ESSENTIAL_CHARACTERISTIC'
        })
      }
    }

    // Validate system
    const validSystems = ['System 1', 'System 1+', 'System 2+', 'System 3', 'System 4']
    if (!validSystems.includes(dop.declared_performance.system)) {
      errors.push({
        field: 'declared_performance.system',
        message: `Ungültiges System: ${dop.declared_performance.system}`,
        code: 'INVALID_SYSTEM'
      })
    }

    // System 1, 1+, 2+ require notified body
    if (['System 1', 'System 1+', 'System 2+'].includes(dop.declared_performance.system)) {
      if (!dop.declared_performance.notified_body) {
        errors.push({
          field: 'declared_performance.notified_body',
          message: `Benannte Stelle erforderlich für ${dop.declared_performance.system}`,
          code: 'MISSING_NOTIFIED_BODY'
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  validateBatch(batch: any, recipe: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Validate production date
    const productionDate = new Date(batch.production_date)
    const today = new Date()
    if (productionDate > today) {
      errors.push({
        field: 'production_date',
        message: 'Produktionsdatum kann nicht in der Zukunft liegen',
        code: 'FUTURE_PRODUCTION_DATE'
      })
    }

    // Validate QC data if released
    if (batch.status === 'released') {
      if (!batch.qc_data.compressive_strength_28d) {
        errors.push({
          field: 'qc_data.compressive_strength_28d',
          message: '28-Tage Druckfestigkeit erforderlich für Freigabe',
          code: 'MISSING_COMPRESSIVE_STRENGTH'
        })
      }

      if (!batch.qc_data.flexural_strength_28d) {
        errors.push({
          field: 'qc_data.flexural_strength_28d',
          message: '28-Tage Biegezugfestigkeit erforderlich für Freigabe',
          code: 'MISSING_FLEXURAL_STRENGTH'
        })
      }

      // Validate against recipe requirements
      if (batch.qc_data.compressive_strength_28d) {
        const requiredCompressive = parseInt(recipe.compressive_strength_class.replace('C', ''))
        if (batch.qc_data.compressive_strength_28d < requiredCompressive) {
          errors.push({
            field: 'qc_data.compressive_strength_28d',
            message: `Druckfestigkeit (${batch.qc_data.compressive_strength_28d}) unterschreitet Anforderung (${requiredCompressive})`,
            code: 'QC_COMPRESSIVE_BELOW_SPEC'
          })
        }
      }
    }

    // Validate quantity
    if (batch.quantity_tons && batch.quantity_tons > 1000) {
      warnings.push({
        field: 'quantity_tons',
        message: 'Ungewöhnlich große Chargenmenge (>1000t)',
        code: 'UNUSUAL_QUANTITY'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Compliance check for complete EN13813 certification
  validateComplianceStatus(recipe: any, testReports: any[], dops: any[]): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Check for valid ITT (Initial Type Test)
    const validITT = testReports.find(report => 
      report.test_type === 'initial_type_test' && 
      report.status === 'valid' &&
      (!report.valid_until || new Date(report.valid_until) > new Date())
    )

    if (!validITT) {
      errors.push({
        field: 'test_reports',
        message: 'Keine gültige Erstprüfung (ITT) vorhanden',
        code: 'NO_VALID_ITT'
      })
    }

    // Check for regular FPC (Factory Production Control)
    const latestFPC = testReports
      .filter(report => report.test_type === 'factory_control')
      .sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())[0]

    if (latestFPC) {
      const daysSinceLastFPC = Math.floor((new Date().getTime() - new Date(latestFPC.test_date).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLastFPC > 180) {
        warnings.push({
          field: 'test_reports',
          message: `Letzte werkseigene Produktionskontrolle ist ${daysSinceLastFPC} Tage alt (empfohlen: alle 6 Monate)`,
          code: 'OUTDATED_FPC'
        })
      }
    } else {
      warnings.push({
        field: 'test_reports',
        message: 'Keine werkseigene Produktionskontrolle vorhanden',
        code: 'NO_FPC'
      })
    }

    // Check for published DoP
    const publishedDoP = dops.find(dop => dop.status === 'published')
    if (!publishedDoP) {
      errors.push({
        field: 'dops',
        message: 'Keine veröffentlichte Leistungserklärung vorhanden',
        code: 'NO_PUBLISHED_DOP'
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}