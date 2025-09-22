import { Recipe, ITTTestPlan } from '../types'

interface TestMapping {
  norm: string
  test_age_days?: number
  required?: boolean
  required_if?: string
  required_for?: string[]
}

export class ITTMappingService {
  private readonly testMappings: Record<string, TestMapping> = {
    compressive_strength: { 
      norm: 'EN 13892-2', 
      test_age_days: 28,
      required: true 
    },
    flexural_strength: { 
      norm: 'EN 13892-2', 
      test_age_days: 28,
      required: true 
    },
    wear_bohme: { 
      norm: 'EN 13892-3',
      required_if: 'wearing_surface' 
    },
    wear_bca: { 
      norm: 'EN 13892-4',
      required_if: 'wearing_surface' 
    },
    wear_rolling: { 
      norm: 'EN 13892-5',
      required_if: 'wearing_surface' 
    },
    surface_hardness: { 
      norm: 'EN 13892-6',
      required_for: ['MA'] 
    },
    bond_strength: { 
      norm: 'EN 13892-8',
      required_for: ['SR'] 
    },
    impact_resistance: {
      norm: 'EN ISO 6272-1',
      required_for: ['SR']
    },
    indentation: {
      norm: 'EN 12697-20',
      required_for: ['AS']
    },
    fire_resistance: {
      norm: 'EN 13501-1',
      required: false
    },
    moisture_content: {
      norm: 'EN 12570',
      required: false
    },
    shrinkage: {
      norm: 'EN 13872',
      required: false
    }
  }

  generateTestPlan(recipe: Recipe): Partial<ITTTestPlan> {
    const requiredTests: ITTTestPlan['required_tests'] = []
    const optionalTests: ITTTestPlan['optional_tests'] = []

    // Pflicht-Tests für alle Estrichtypen
    if (['CT', 'CA', 'MA'].includes(recipe.binder_type)) {
      requiredTests.push({
        property: 'compressive_strength',
        norm: this.testMappings.compressive_strength.norm,
        test_age_days: this.testMappings.compressive_strength.test_age_days,
        target_class: recipe.compressive_strength_class
      })

      requiredTests.push({
        property: 'flexural_strength',
        norm: this.testMappings.flexural_strength.norm,
        test_age_days: this.testMappings.flexural_strength.test_age_days,
        target_class: recipe.flexural_strength_class
      })
    }

    // Verschleißwiderstand bei Nutzschicht
    if (recipe.intended_use?.wearing_surface && !recipe.intended_use?.with_flooring) {
      // Genau EINE Verschleißmethode erforderlich
      if (recipe.wear_resistance_method) {
        const wearTestKey = `wear_${recipe.wear_resistance_method}`
        const wearTestMapping = this.testMappings[wearTestKey]
        
        if (wearTestMapping) {
          requiredTests.push({
            property: wearTestKey,
            norm: wearTestMapping.norm,
            target_class: recipe.wear_resistance_class
          })
        }
      }
    }

    // Spezielle Tests je Estrichtyp
    switch (recipe.binder_type) {
      case 'MA': // Magnesiaestrich
        if (recipe.surface_hardness_class) {
          requiredTests.push({
            property: 'surface_hardness',
            norm: this.testMappings.surface_hardness.norm,
            target_class: recipe.surface_hardness_class
          })
        }
        break
        
      case 'SR': // Kunstharzestrich
        if (recipe.bond_strength_class) {
          requiredTests.push({
            property: 'bond_strength',
            norm: this.testMappings.bond_strength.norm,
            target_class: recipe.bond_strength_class
          })
        }
        if (recipe.impact_resistance_class) {
          requiredTests.push({
            property: 'impact_resistance',
            norm: this.testMappings.impact_resistance.norm,
            target_class: recipe.impact_resistance_class
          })
        }
        break
        
      case 'AS': // Gussasphalt
        if (recipe.indentation_class) {
          requiredTests.push({
            property: 'indentation',
            norm: this.testMappings.indentation.norm,
            target_class: recipe.indentation_class
          })
        }
        break
    }

    // Optionale Tests
    if (recipe.fire_class) {
      optionalTests.push({
        property: 'fire_resistance',
        norm: this.testMappings.fire_resistance.norm,
        reason: 'Fire classification declared'
      })
    }

    // Feuchtigkeitsprüfung bei Heizestrich
    if (recipe.heated_screed) {
      optionalTests.push({
        property: 'moisture_content',
        norm: this.testMappings.moisture_content.norm,
        reason: 'Heated screed application'
      })
    }

    // Schwindmaß bei großen Flächen
    optionalTests.push({
      property: 'shrinkage',
      norm: this.testMappings.shrinkage.norm,
      reason: 'Recommended for large areas'
    })

    return {
      recipe_id: recipe.id,
      required_tests: requiredTests,
      optional_tests: optionalTests,
      test_status: 'pending'
    }
  }

  validateTestResults(
    recipe: Recipe, 
    testResults: Record<string, any>
  ): {
    isValid: boolean
    missingTests: string[]
    failedTests: string[]
  } {
    const testPlan = this.generateTestPlan(recipe)
    const missingTests: string[] = []
    const failedTests: string[] = []

    // Prüfe ob alle Pflichttests vorhanden sind
    for (const test of testPlan.required_tests || []) {
      if (!testResults[test.property]) {
        missingTests.push(test.property)
      } else {
        // Prüfe ob Testergebnisse die Zielklasse erfüllen
        const result = testResults[test.property]
        if (test.target_class && !this.meetsTargetClass(test.property, result, test.target_class)) {
          failedTests.push(test.property)
        }
      }
    }

    return {
      isValid: missingTests.length === 0 && failedTests.length === 0,
      missingTests,
      failedTests
    }
  }

  private meetsTargetClass(property: string, result: any, targetClass: string): boolean {
    // Vereinfachte Validierung - in der Praxis würde hier die
    // tatsächliche Klassenprüfung nach EN 13813 erfolgen
    switch (property) {
      case 'compressive_strength':
        // Format: C20, C30, etc.
        const targetStrength = parseInt(targetClass.replace('C', ''))
        return result.value >= targetStrength
        
      case 'flexural_strength':
        // Format: F4, F5, F7, etc.
        const targetFlexural = parseInt(targetClass.replace('F', ''))
        return result.value >= targetFlexural
        
      case 'wear_bohme':
        // Format: A22, A15, A12, etc. (niedrigere Werte = besser)
        const targetWear = parseFloat(targetClass.replace('A', ''))
        return result.value <= targetWear
        
      case 'wear_bca':
        // Format: AR6, AR4, AR2, etc. (niedrigere Werte = besser)
        const targetAR = parseFloat(targetClass.replace('AR', ''))
        return result.value <= targetAR
        
      case 'wear_rolling':
        // Format: RWA300, RWA200, etc. (niedrigere Werte = besser)
        const targetRWA = parseInt(targetClass.replace('RWA', ''))
        return result.value <= targetRWA
        
      default:
        return true
    }
  }

  getRequiredNorms(recipe: Recipe): string[] {
    const testPlan = this.generateTestPlan(recipe)
    const norms = new Set<string>()

    for (const test of testPlan.required_tests || []) {
      norms.add(test.norm)
    }

    return Array.from(norms).sort()
  }

  estimateTestingDuration(recipe: Recipe): number {
    // Maximale Testdauer in Tagen
    let maxDays = 0

    const testPlan = this.generateTestPlan(recipe)
    for (const test of testPlan.required_tests || []) {
      if (test.test_age_days && test.test_age_days > maxDays) {
        maxDays = test.test_age_days
      }
    }

    // Zusätzliche Zeit für Probenvorbereitung und Auswertung
    return maxDays + 7
  }
}