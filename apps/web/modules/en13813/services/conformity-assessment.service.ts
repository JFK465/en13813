/**
 * EN 13813 Konformitätsbewertung Service
 * Implementiert die statistischen Akzeptanzkriterien nach EN 13813 Abschnitt 9.2
 */

export interface ConformityResult {
  passed: boolean
  individualCheck: {
    passed: boolean
    minValue: number
    maxValue: number
    declaredValue: number
    allowedDeviation: number
    failedValues: number[]
  }
  statisticalCheck?: {
    passed: boolean
    mean: number
    standardDeviation: number
    characteristicValue: number
    kA: number
    requiredValue: number
  }
  warnings: string[]
}

export class ConformityAssessmentService {
  /**
   * Akzeptanzkonstanten kA nach EN 13813 Tabelle NA.2
   * Basierend auf Stichprobengröße n
   */
  private static readonly ACCEPTANCE_CONSTANTS: Record<number, number> = {
    3: 1.89,
    4: 1.83,
    5: 1.80,
    6: 1.77,
    7: 1.75,
    8: 1.74,
    9: 1.73,
    10: 1.72,
    11: 1.71,
    12: 1.71,
    13: 1.70,
    14: 1.70,
    15: 1.70,
    16: 1.69,
    17: 1.69,
    18: 1.69,
    19: 1.69,
    20: 1.68,
    30: 1.67,
    40: 1.66,
    50: 1.66,
    100: 1.64,
    200: 1.64,
    1000: 1.64
  }

  /**
   * Holt die Akzeptanzkonstante kA für eine gegebene Stichprobengröße
   */
  private static getAcceptanceConstant(n: number): number {
    if (n < 3) {
      throw new Error('Mindestens 3 Prüfwerte erforderlich für statistische Bewertung')
    }
    
    // Finde den nächsten passenden kA-Wert
    const sizes = Object.keys(this.ACCEPTANCE_CONSTANTS)
      .map(Number)
      .sort((a, b) => a - b)
    
    for (const size of sizes) {
      if (n <= size) {
        return this.ACCEPTANCE_CONSTANTS[size]
      }
    }
    
    // Für n > 1000 verwende kA = 1.64
    return 1.64
  }

  /**
   * Bewertet Druckfestigkeit nach EN 13813
   * @param values Array der Einzelwerte in N/mm²
   * @param declaredClass Deklarierte Klasse (z.B. "C25")
   * @returns Konformitätsergebnis
   */
  static assessCompressiveStrength(
    values: number[], 
    declaredClass: string
  ): ConformityResult {
    const declaredValue = this.parseCompressiveClass(declaredClass)
    
    // Regel 1: Kein Einzelwert < 0.85 × deklariert
    const minAllowed = 0.85 * declaredValue
    const failedIndividual = values.filter(v => v < minAllowed)
    
    // Regel 2: Mittelwert ≥ deklariert
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    
    // Berechne Standardabweichung
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1)
    const stdDev = Math.sqrt(variance)
    
    // Charakteristischer Wert (5% Fraktil mit 90% Vertrauensniveau)
    const kA = this.getAcceptanceConstant(values.length)
    const characteristicValue = mean - kA * stdDev
    
    const result: ConformityResult = {
      passed: failedIndividual.length === 0 && characteristicValue >= declaredValue,
      individualCheck: {
        passed: failedIndividual.length === 0,
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        declaredValue,
        allowedDeviation: minAllowed,
        failedValues: failedIndividual
      },
      statisticalCheck: {
        passed: characteristicValue >= declaredValue,
        mean,
        standardDeviation: stdDev,
        characteristicValue,
        kA,
        requiredValue: declaredValue
      },
      warnings: []
    }
    
    if (failedIndividual.length > 0) {
      result.warnings.push(
        `${failedIndividual.length} Wert(e) unter 85% der deklarierten Festigkeit`
      )
    }
    
    if (characteristicValue < declaredValue) {
      result.warnings.push(
        `Charakteristischer Wert (${characteristicValue.toFixed(1)} N/mm²) unter deklarierter Klasse`
      )
    }
    
    return result
  }

  /**
   * Bewertet Biegezugfestigkeit nach EN 13813
   */
  static assessFlexuralStrength(
    values: number[], 
    declaredClass: string
  ): ConformityResult {
    const declaredValue = this.parseFlexuralClass(declaredClass)
    
    // Regel 1: Kein Einzelwert < 0.75 × deklariert
    const minAllowed = 0.75 * declaredValue
    const failedIndividual = values.filter(v => v < minAllowed)
    
    // Regel 2: Mittelwert ≥ deklariert
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    
    // Berechne Standardabweichung
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1)
    const stdDev = Math.sqrt(variance)
    
    // Charakteristischer Wert
    const kA = this.getAcceptanceConstant(values.length)
    const characteristicValue = mean - kA * stdDev
    
    const result: ConformityResult = {
      passed: failedIndividual.length === 0 && characteristicValue >= declaredValue,
      individualCheck: {
        passed: failedIndividual.length === 0,
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        declaredValue,
        allowedDeviation: minAllowed,
        failedValues: failedIndividual
      },
      statisticalCheck: {
        passed: characteristicValue >= declaredValue,
        mean,
        standardDeviation: stdDev,
        characteristicValue,
        kA,
        requiredValue: declaredValue
      },
      warnings: []
    }
    
    if (failedIndividual.length > 0) {
      result.warnings.push(
        `${failedIndividual.length} Wert(e) unter 75% der deklarierten Biegezugfestigkeit`
      )
    }
    
    if (characteristicValue < declaredValue) {
      result.warnings.push(
        `Charakteristischer Wert (${characteristicValue.toFixed(1)} N/mm²) unter deklarierter Klasse`
      )
    }
    
    return result
  }

  /**
   * Bewertet Verschleißwiderstand nach EN 13813
   * Niedrigere Werte = besser (weniger Abrieb)
   */
  static assessWearResistance(
    values: number[], 
    declaredClass: string,
    method: 'bohme' | 'bca' | 'rollrad' = 'bohme'
  ): ConformityResult {
    const declaredValue = this.parseWearClass(declaredClass, method)
    
    // Bei Verschleiß: Einzelwert darf nicht > 1.5 × deklariert sein
    const maxAllowed = 1.5 * declaredValue
    const failedIndividual = values.filter(v => v > maxAllowed)
    
    // Mittelwert ≤ deklariert
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    
    // Berechne Standardabweichung
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1)
    const stdDev = Math.sqrt(variance)
    
    // Charakteristischer Wert (95% Fraktil für ungünstige Richtung)
    const kA = this.getAcceptanceConstant(values.length)
    const characteristicValue = mean + kA * stdDev
    
    const result: ConformityResult = {
      passed: failedIndividual.length === 0 && characteristicValue <= declaredValue,
      individualCheck: {
        passed: failedIndividual.length === 0,
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        declaredValue,
        allowedDeviation: maxAllowed,
        failedValues: failedIndividual
      },
      statisticalCheck: {
        passed: characteristicValue <= declaredValue,
        mean,
        standardDeviation: stdDev,
        characteristicValue,
        kA,
        requiredValue: declaredValue
      },
      warnings: []
    }
    
    if (failedIndividual.length > 0) {
      result.warnings.push(
        `${failedIndividual.length} Wert(e) über 150% des deklarierten Verschleißwiderstands`
      )
    }
    
    if (characteristicValue > declaredValue) {
      result.warnings.push(
        `Charakteristischer Wert (${characteristicValue.toFixed(1)}) über deklarierter Klasse`
      )
    }
    
    return result
  }

  /**
   * Bewertet Oberflächenhärte nach EN 13813
   */
  static assessSurfaceHardness(
    values: number[], 
    declaredClass: string
  ): ConformityResult {
    const declaredValue = this.parseSurfaceHardnessClass(declaredClass)
    
    // Regel: Kein Einzelwert < 0.8 × deklariert
    const minAllowed = 0.8 * declaredValue
    const failedIndividual = values.filter(v => v < minAllowed)
    
    // Mittelwert ≥ deklariert
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    
    const result: ConformityResult = {
      passed: failedIndividual.length === 0 && mean >= declaredValue,
      individualCheck: {
        passed: failedIndividual.length === 0,
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        declaredValue,
        allowedDeviation: minAllowed,
        failedValues: failedIndividual
      },
      warnings: []
    }
    
    if (values.length >= 3) {
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1)
      const stdDev = Math.sqrt(variance)
      const kA = this.getAcceptanceConstant(values.length)
      const characteristicValue = mean - kA * stdDev
      
      result.statisticalCheck = {
        passed: characteristicValue >= declaredValue,
        mean,
        standardDeviation: stdDev,
        characteristicValue,
        kA,
        requiredValue: declaredValue
      }
    }
    
    return result
  }

  /**
   * Bewertet Haftzugfestigkeit nach EN 13813
   */
  static assessBondStrength(
    values: number[], 
    declaredClass: string
  ): ConformityResult {
    const declaredValue = this.parseBondStrengthClass(declaredClass)
    
    // Regel: Kein Einzelwert < 0.5 N/mm² oder < 0.75 × deklariert
    const minAbsolute = 0.5
    const minRelative = 0.75 * declaredValue
    const minAllowed = Math.max(minAbsolute, minRelative)
    
    const failedIndividual = values.filter(v => v < minAllowed)
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    
    const result: ConformityResult = {
      passed: failedIndividual.length === 0 && mean >= declaredValue,
      individualCheck: {
        passed: failedIndividual.length === 0,
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        declaredValue,
        allowedDeviation: minAllowed,
        failedValues: failedIndividual
      },
      warnings: []
    }
    
    if (failedIndividual.length > 0) {
      result.warnings.push(
        `${failedIndividual.length} Wert(e) unter Mindestanforderung (${minAllowed.toFixed(2)} N/mm²)`
      )
    }
    
    return result
  }

  // Parser-Funktionen für Klassen
  private static parseCompressiveClass(className: string): number {
    const match = className.match(/C(\d+)/)
    if (!match) throw new Error(`Ungültige Druckfestigkeitsklasse: ${className}`)
    return parseInt(match[1])
  }

  private static parseFlexuralClass(className: string): number {
    const match = className.match(/F(\d+)/)
    if (!match) throw new Error(`Ungültige Biegezugfestigkeitsklasse: ${className}`)
    return parseInt(match[1])
  }

  private static parseWearClass(className: string, method: string): number {
    if (method === 'bohme') {
      const match = className.match(/A(\d+)/)
      if (!match) throw new Error(`Ungültige Verschleißklasse (Böhme): ${className}`)
      return parseInt(match[1])
    } else if (method === 'bca') {
      const match = className.match(/AR(\d+(?:\.\d+)?)/)
      if (!match) throw new Error(`Ungültige Verschleißklasse (BCA): ${className}`)
      return parseFloat(match[1])
    } else {
      const match = className.match(/RWA(\d+)/)
      if (!match) throw new Error(`Ungültige Verschleißklasse (Rollrad): ${className}`)
      return parseInt(match[1])
    }
  }

  private static parseSurfaceHardnessClass(className: string): number {
    const match = className.match(/SH(\d+)/)
    if (!match) throw new Error(`Ungültige Oberflächenhärteklasse: ${className}`)
    return parseInt(match[1])
  }

  private static parseBondStrengthClass(className: string): number {
    const match = className.match(/B([\d.]+)/)
    if (!match) throw new Error(`Ungültige Haftzugfestigkeitsklasse: ${className}`)
    return parseFloat(match[1])
  }

  /**
   * Generiert einen Konformitätsbericht für alle Eigenschaften
   */
  static generateConformityReport(
    testResults: Record<string, number[]>,
    declaredClasses: Record<string, string>
  ): Record<string, ConformityResult> {
    const report: Record<string, ConformityResult> = {}
    
    if (testResults.compressive && declaredClasses.compressive) {
      report.compressive = this.assessCompressiveStrength(
        testResults.compressive,
        declaredClasses.compressive
      )
    }
    
    if (testResults.flexural && declaredClasses.flexural) {
      report.flexural = this.assessFlexuralStrength(
        testResults.flexural,
        declaredClasses.flexural
      )
    }
    
    if (testResults.wear && declaredClasses.wear) {
      report.wear = this.assessWearResistance(
        testResults.wear,
        declaredClasses.wear
      )
    }
    
    if (testResults.surfaceHardness && declaredClasses.surfaceHardness) {
      report.surfaceHardness = this.assessSurfaceHardness(
        testResults.surfaceHardness,
        declaredClasses.surfaceHardness
      )
    }
    
    if (testResults.bondStrength && declaredClasses.bondStrength) {
      report.bondStrength = this.assessBondStrength(
        testResults.bondStrength,
        declaredClasses.bondStrength
      )
    }
    
    return report
  }
}