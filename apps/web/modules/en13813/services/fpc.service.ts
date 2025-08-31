import { Recipe, FPCControlPlan, RecipeMaterial } from '../types'

interface ControlFrequency {
  frequency: string
  description: string
  interval_days?: number
}

interface TestRequirement {
  test: string
  norm: string
  frequency: ControlFrequency
  tolerance?: string
  action_limit?: string
  warning_limit?: string
}

export class FPCService {
  private readonly controlFrequencies: Record<string, ControlFrequency> = {
    per_delivery: {
      frequency: 'per_delivery',
      description: 'Bei jeder Lieferung',
    },
    per_batch: {
      frequency: 'per_batch',
      description: 'Bei jeder Charge',
    },
    daily: {
      frequency: 'daily',
      description: 'Täglich',
      interval_days: 1
    },
    weekly: {
      frequency: 'weekly',
      description: 'Wöchentlich',
      interval_days: 7
    },
    monthly: {
      frequency: 'monthly',
      description: 'Monatlich',
      interval_days: 30
    },
    quarterly: {
      frequency: 'quarterly',
      description: 'Vierteljährlich',
      interval_days: 90
    },
    annually: {
      frequency: 'annually',
      description: 'Jährlich',
      interval_days: 365
    }
  }

  /**
   * Creates a Factory Production Control plan for a recipe
   */
  async createControlPlan(
    recipe: Recipe,
    recipeMaterial?: RecipeMaterial
  ): Promise<Partial<FPCControlPlan>> {
    const plan: Partial<FPCControlPlan> = {
      recipe_id: recipe.id,
      active: true,
      
      // Incoming inspection
      incoming_inspection: {
        binder: {
          frequency: 'per_delivery',
          tests: ['certificate_check', 'visual_inspection'],
          tolerance: this.getBinderTolerance(recipe.estrich_type)
        },
        aggregates: {
          frequency: 'weekly',
          tests: ['moisture_content', 'grading'],
          tolerance: '±2%'
        }
      },
      
      // Production control
      production_control: {
        fresh_mortar: {
          frequency: 'per_batch',
          tests: this.getFreshMortarTests(recipe.estrich_type),
          limits: recipeMaterial?.fresh_mortar_properties || {}
        },
        hardened_mortar: {
          frequency: 'monthly',
          tests: this.getHardenedMortarTests(recipe),
          warning_limit: '90%_of_declared',
          action_limit: '85%_of_declared'
        }
      },
      
      // Calibration schedule
      calibration: {
        scales: 'quarterly',
        mixers: 'annually',
        testing_equipment: 'as_per_manufacturer'
      }
    }
    
    // Adjust frequencies based on production volume and risk
    if (recipe.intended_use?.wearing_surface) {
      // Higher control frequency for wearing surfaces
      plan.production_control!.hardened_mortar.frequency = 'weekly'
    }
    
    if (recipe.heated_screed) {
      // Additional controls for heated screeds
      plan.production_control!.fresh_mortar.tests.push('temperature_gradient')
    }
    
    return plan
  }

  /**
   * Gets required fresh mortar tests based on estrich type
   */
  private getFreshMortarTests(estrichType: string): string[] {
    const baseTests = ['consistency', 'temperature', 'density']
    
    switch (estrichType) {
      case 'CT':
      case 'CA':
        return [...baseTests, 'air_content', 'setting_time']
      case 'MA':
        return [...baseTests, 'ph_value', 'setting_time']
      case 'AS':
        return ['temperature', 'penetration', 'softening_point']
      case 'SR':
        return [...baseTests, 'pot_life', 'gel_time']
      default:
        return baseTests
    }
  }

  /**
   * Gets required hardened mortar tests based on recipe
   */
  private getHardenedMortarTests(recipe: Recipe): string[] {
    const tests: string[] = []
    
    // Basic mechanical properties
    if (['CT', 'CA', 'MA'].includes(recipe.estrich_type)) {
      tests.push('compressive_strength', 'flexural_strength')
    }
    
    // Wear resistance if applicable
    if (recipe.wear_resistance_method) {
      tests.push(`wear_${recipe.wear_resistance_method}`)
    }
    
    // Type-specific tests
    switch (recipe.estrich_type) {
      case 'MA':
        if (recipe.surface_hardness_class) {
          tests.push('surface_hardness')
        }
        break
      case 'SR':
        if (recipe.bond_strength_class) {
          tests.push('bond_strength')
        }
        if (recipe.impact_resistance_class) {
          tests.push('impact_resistance')
        }
        break
      case 'AS':
        if (recipe.indentation_class) {
          tests.push('indentation')
        }
        break
    }
    
    return tests
  }

  /**
   * Gets binder tolerance based on estrich type
   */
  private getBinderTolerance(estrichType: string): string {
    switch (estrichType) {
      case 'CT':
        return 'as_per_en197'
      case 'CA':
        return 'as_per_en13454'
      case 'MA':
        return 'as_per_en14016'
      case 'AS':
        return 'as_per_en13108'
      case 'SR':
        return 'as_per_manufacturer'
      default:
        return '±5%'
    }
  }

  /**
   * Generates a test schedule for the next period
   */
  generateTestSchedule(
    controlPlan: FPCControlPlan,
    startDate: Date,
    endDate: Date
  ): Array<{
    date: Date
    type: string
    tests: string[]
    description: string
  }> {
    const schedule: any[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      // Daily tests
      if (this.shouldTestToday(currentDate, 'daily')) {
        const dailyTests = this.getDailyTests(controlPlan)
        if (dailyTests.length > 0) {
          schedule.push({
            date: new Date(currentDate),
            type: 'daily',
            tests: dailyTests,
            description: 'Tägliche Kontrolle'
          })
        }
      }
      
      // Weekly tests
      if (this.shouldTestToday(currentDate, 'weekly')) {
        const weeklyTests = this.getWeeklyTests(controlPlan)
        if (weeklyTests.length > 0) {
          schedule.push({
            date: new Date(currentDate),
            type: 'weekly',
            tests: weeklyTests,
            description: 'Wöchentliche Kontrolle'
          })
        }
      }
      
      // Monthly tests
      if (this.shouldTestToday(currentDate, 'monthly')) {
        const monthlyTests = this.getMonthlyTests(controlPlan)
        if (monthlyTests.length > 0) {
          schedule.push({
            date: new Date(currentDate),
            type: 'monthly',
            tests: monthlyTests,
            description: 'Monatliche Kontrolle'
          })
        }
      }
      
      // Quarterly calibration
      if (this.shouldTestToday(currentDate, 'quarterly')) {
        schedule.push({
          date: new Date(currentDate),
          type: 'calibration',
          tests: ['scales'],
          description: 'Vierteljährliche Kalibrierung'
        })
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return schedule
  }

  private shouldTestToday(date: Date, frequency: string): boolean {
    const dayOfWeek = date.getDay()
    const dayOfMonth = date.getDate()
    const month = date.getMonth()
    
    switch (frequency) {
      case 'daily':
        return dayOfWeek >= 1 && dayOfWeek <= 5 // Weekdays only
      case 'weekly':
        return dayOfWeek === 1 // Mondays
      case 'monthly':
        return dayOfMonth === 1 // First day of month
      case 'quarterly':
        return dayOfMonth === 1 && (month === 0 || month === 3 || month === 6 || month === 9)
      case 'annually':
        return dayOfMonth === 1 && month === 0 // January 1st
      default:
        return false
    }
  }

  private getDailyTests(controlPlan: FPCControlPlan): string[] {
    // No daily tests in standard FPC
    return []
  }

  private getWeeklyTests(controlPlan: FPCControlPlan): string[] {
    if (controlPlan.incoming_inspection.aggregates.frequency === 'weekly') {
      return controlPlan.incoming_inspection.aggregates.tests
    }
    return []
  }

  private getMonthlyTests(controlPlan: FPCControlPlan): string[] {
    if (controlPlan.production_control.hardened_mortar.frequency === 'monthly') {
      return controlPlan.production_control.hardened_mortar.tests
    }
    return []
  }

  /**
   * Evaluates test results against control limits
   */
  evaluateTestResult(
    testType: string,
    testValue: number,
    targetValue: number,
    controlPlan: FPCControlPlan
  ): {
    status: 'pass' | 'warning' | 'fail'
    message: string
    action?: string
  } {
    const warningLimit = this.calculateLimit(
      targetValue,
      controlPlan.production_control.hardened_mortar.warning_limit
    )
    const actionLimit = this.calculateLimit(
      targetValue,
      controlPlan.production_control.hardened_mortar.action_limit
    )
    
    if (testValue >= targetValue) {
      return {
        status: 'pass',
        message: `Test bestanden: ${testValue} ≥ ${targetValue}`
      }
    } else if (testValue >= warningLimit) {
      return {
        status: 'warning',
        message: `Warnung: ${testValue} < ${targetValue} aber ≥ ${warningLimit}`,
        action: 'Erhöhte Aufmerksamkeit, zusätzliche Probenahme empfohlen'
      }
    } else if (testValue >= actionLimit) {
      return {
        status: 'fail',
        message: `Grenzwert unterschritten: ${testValue} < ${warningLimit}`,
        action: 'Sofortige Korrekturmaßnahmen erforderlich, Produktion prüfen'
      }
    } else {
      return {
        status: 'fail',
        message: `Kritischer Fehler: ${testValue} < ${actionLimit}`,
        action: 'Produktion stoppen, Ursachenanalyse durchführen'
      }
    }
  }

  private calculateLimit(targetValue: number, limitString: string): number {
    // Parse limit strings like "90%_of_declared"
    const match = limitString.match(/(\d+)%_of_declared/)
    if (match) {
      const percentage = parseInt(match[1])
      return targetValue * (percentage / 100)
    }
    return targetValue * 0.9 // Default to 90%
  }

  /**
   * Generates FPC documentation for audits
   */
  generateFPCDocumentation(
    controlPlan: FPCControlPlan,
    testResults: Array<any>
  ): {
    summary: string
    compliance: boolean
    nonConformities: string[]
    recommendations: string[]
  } {
    const nonConformities: string[] = []
    const recommendations: string[] = []
    
    // Analyze test results
    const failedTests = testResults.filter(r => r.status === 'fail')
    const warningTests = testResults.filter(r => r.status === 'warning')
    
    if (failedTests.length > 0) {
      nonConformities.push(
        `${failedTests.length} Prüfungen nicht bestanden`
      )
      recommendations.push(
        'Sofortige Korrekturmaßnahmen für fehlgeschlagene Tests implementieren'
      )
    }
    
    if (warningTests.length > 0) {
      recommendations.push(
        `${warningTests.length} Prüfungen im Warnbereich - erhöhte Überwachung empfohlen`
      )
    }
    
    // Check calibration status
    const calibrationDue = this.isCalibrationDue(controlPlan)
    if (calibrationDue.length > 0) {
      nonConformities.push(
        `Kalibrierung überfällig für: ${calibrationDue.join(', ')}`
      )
    }
    
    const compliance = nonConformities.length === 0
    
    return {
      summary: compliance 
        ? 'FPC-System vollständig konform mit EN 13813 Anforderungen'
        : `FPC-System weist ${nonConformities.length} Abweichungen auf`,
      compliance,
      nonConformities,
      recommendations
    }
  }

  private isCalibrationDue(controlPlan: FPCControlPlan): string[] {
    const due: string[] = []
    // This would check actual calibration records
    // For now, returning empty array
    return due
  }
}