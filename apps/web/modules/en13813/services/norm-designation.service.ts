/**
 * EN 13813 Normbezeichnungs-Generator
 * Generiert die korrekte Produktbezeichnung nach EN 13813 Abschnitt 7
 * Format: Bindemittel-Festigkeitsklassen-Zusatzeigenschaften
 * Beispiel: CT-C25-F4 oder CA-C30-F6-A12-SH70
 */

export interface NormDesignationParams {
  // Bindemitteltyp (Pflicht)
  binderType: 'CT' | 'CA' | 'MA' | 'SR' | 'AS'
  
  // Festigkeitsklassen (mindestens eine Pflicht)
  compressiveClass?: string // C5...C80
  flexuralClass?: string // F1...F50
  
  // Optionale Eigenschaften
  wearResistanceClass?: string // A1...A22 (Böhme)
  wearResistanceBCA?: string // AR0.5...AR6 (BCA)
  wearResistanceRollrad?: string // RWA100...RWA15000
  surfaceHardnessClass?: string // SH30...SH200
  bondStrengthClass?: string // B0.2...B2.0
  impactResistanceClass?: string // IR1...IR20
  electricalResistance?: string // E1...E3
  thermalConductivity?: number // λ in W/(m·K)
  chemicalResistance?: boolean
  fireClass?: string // A1fl...Ffl
  
  // Spezielle Eigenschaften
  rwfc?: string // RWFC150...RWFC550 (Rollstuhlbefahrbarkeit)
  slipResistance?: string // R9...R13
  dampProof?: boolean
  waterResistance?: boolean
}

export class NormDesignationService {
  /**
   * Validiert und formatiert eine Festigkeitsklasse
   */
  private static validateStrengthClass(value: string | undefined, prefix: string): string | null {
    if (!value) return null
    
    // Entferne Prefix falls vorhanden und validiere
    const cleanValue = value.replace(new RegExp(`^${prefix}`), '')
    const numValue = parseInt(cleanValue)
    
    if (isNaN(numValue)) return null
    
    // Validiere Bereiche
    if (prefix === 'C') {
      const validValues = [5, 7, 12, 16, 20, 25, 30, 35, 40, 50, 60, 70, 80]
      if (!validValues.includes(numValue)) {
        console.warn(`Ungültige Druckfestigkeitsklasse C${numValue}`)
      }
      return `C${numValue}`
    } else if (prefix === 'F') {
      const validValues = [1, 2, 3, 4, 5, 6, 7, 10, 15, 20, 30, 40, 50]
      if (!validValues.includes(numValue)) {
        console.warn(`Ungültige Biegezugfestigkeitsklasse F${numValue}`)
      }
      return `F${numValue}`
    }
    
    return null
  }

  /**
   * Validiert Verschleißwiderstandsklassen
   */
  private static validateWearClass(value: string | undefined, type: 'A' | 'AR' | 'RWA'): string | null {
    if (!value) return null
    
    if (type === 'A') {
      const validValues = [1, 3, 6, 9, 12, 15, 22]
      const cleanValue = value.replace(/^A/, '')
      const numValue = parseInt(cleanValue)
      if (!validValues.includes(numValue)) {
        console.warn(`Ungültige Verschleißklasse A${numValue}`)
      }
      return `A${numValue}`
    } else if (type === 'AR') {
      const validValues = [0.5, 1, 2, 4, 6]
      const cleanValue = value.replace(/^AR/, '')
      const numValue = parseFloat(cleanValue)
      if (!validValues.includes(numValue)) {
        console.warn(`Ungültige BCA-Verschleißklasse AR${numValue}`)
      }
      return `AR${numValue}`
    } else if (type === 'RWA') {
      const cleanValue = value.replace(/^RWA/, '')
      const numValue = parseInt(cleanValue)
      if (numValue < 100 || numValue > 15000) {
        console.warn(`Ungültige Rollrad-Verschleißklasse RWA${numValue}`)
      }
      return `RWA${numValue}`
    }
    
    return null
  }

  /**
   * Validiert Oberflächenhärteklasse
   */
  private static validateSurfaceHardness(value: string | undefined): string | null {
    if (!value) return null

    const validValues = [30, 40, 50, 70, 100, 150, 200]
    const cleanValue = value.replace(/^SH/, '')
    const numValue = parseInt(cleanValue)

    // Prüfe ob numValue eine gültige Zahl ist
    if (isNaN(numValue)) return null

    if (!validValues.includes(numValue)) {
      console.warn(`Ungültige Oberflächenhärteklasse SH${numValue}`)
    }

    return `SH${numValue}`
  }

  /**
   * Validiert Haftzugfestigkeitsklasse
   */
  private static validateBondStrength(value: string | undefined): string | null {
    if (!value) return null

    const validValues = [0.2, 0.5, 1.0, 1.5, 2.0]
    const cleanValue = value.replace(/^B/, '')
    const numValue = parseFloat(cleanValue)

    // Prüfe ob numValue eine gültige Zahl ist
    if (isNaN(numValue)) return null

    if (!validValues.includes(numValue)) {
      console.warn(`Ungültige Haftzugfestigkeitsklasse B${numValue}`)
    }
    
    // Formatiere korrekt (B1.5, nicht B1,5)
    return `B${numValue.toFixed(1).replace('.0', '')}`
  }

  /**
   * Validiert Schlagfestigkeitsklasse
   */
  private static validateImpactResistance(value: string | undefined): string | null {
    if (!value) return null
    
    const validValues = [1, 2, 4, 10, 20]
    const cleanValue = value.replace(/^IR/, '')
    const numValue = parseInt(cleanValue)
    
    if (!validValues.includes(numValue)) {
      console.warn(`Ungültige Schlagfestigkeitsklasse IR${numValue}`)
    }
    
    return `IR${numValue}`
  }

  /**
   * Generiert die vollständige EN 13813 Normbezeichnung
   * @param params Eigenschaften des Estrichs
   * @returns Normkonforme Bezeichnung
   */
  static generateDesignation(params: NormDesignationParams): string {
    const parts: string[] = []
    
    // 1. Bindemitteltyp (Pflicht)
    if (!params.binderType) {
      throw new Error('Bindemitteltyp ist erforderlich')
    }
    parts.push(params.binderType)
    
    // 2. Festigkeitsklassen (mindestens eine Pflicht)
    const compressive = this.validateStrengthClass(params.compressiveClass, 'C')
    const flexural = this.validateStrengthClass(params.flexuralClass, 'F')
    
    if (!compressive && !flexural) {
      throw new Error('Mindestens eine Festigkeitsklasse (C oder F) ist erforderlich')
    }
    
    if (compressive) parts.push(compressive)
    if (flexural) parts.push(flexural)
    
    // 3. Verschleißwiderstand (optional, nur eine Methode)
    if (params.wearResistanceClass) {
      const wear = this.validateWearClass(params.wearResistanceClass, 'A')
      if (wear) parts.push(wear)
    } else if (params.wearResistanceBCA) {
      const wear = this.validateWearClass(params.wearResistanceBCA, 'AR')
      if (wear) parts.push(wear)
    } else if (params.wearResistanceRollrad) {
      const wear = this.validateWearClass(params.wearResistanceRollrad, 'RWA')
      if (wear) parts.push(wear)
    }
    
    // 4. Oberflächenhärte (optional)
    const surfaceHardness = this.validateSurfaceHardness(params.surfaceHardnessClass)
    if (surfaceHardness) parts.push(surfaceHardness)
    
    // 5. Haftzugfestigkeit (optional)
    const bondStrength = this.validateBondStrength(params.bondStrengthClass)
    if (bondStrength) parts.push(bondStrength)
    
    // 6. Schlagfestigkeit (optional)
    const impactResistance = this.validateImpactResistance(params.impactResistanceClass)
    if (impactResistance) parts.push(impactResistance)
    
    // 7. Spezielle Eigenschaften
    if (params.rwfc) {
      // Rollstuhlbefahrbarkeit mit Belag
      const validRWFC = ['RWFC150', 'RWFC250', 'RWFC350', 'RWFC450', 'RWFC550']
      if (validRWFC.includes(params.rwfc)) {
        parts.push(params.rwfc)
      }
    }
    
    if (params.electricalResistance) {
      parts.push(params.electricalResistance)
    }
    
    if (params.thermalConductivity) {
      // Wärmeleitfähigkeit in W/(m·K)
      parts.push(`λ${params.thermalConductivity}`)
    }
    
    if (params.slipResistance) {
      // Rutschfestigkeit nach DIN 51130
      parts.push(params.slipResistance)
    }
    
    // Brandklasse wird separat angegeben, nicht in der Bezeichnung
    
    return parts.join('-')
  }

  /**
   * Parst eine vorhandene EN 13813 Bezeichnung
   * @param designation Die zu parsende Bezeichnung
   * @returns Aufgeschlüsselte Eigenschaften
   */
  static parseDesignation(designation: string): Partial<NormDesignationParams> {
    const parts = designation.split('-')
    const result: Partial<NormDesignationParams> = {}
    
    if (parts.length === 0) {
      throw new Error('Ungültige Bezeichnung')
    }
    
    // Bindemitteltyp
    const binderTypes = ['CT', 'CA', 'MA', 'SR', 'AS']
    if (binderTypes.includes(parts[0])) {
      result.binderType = parts[0] as any
    } else {
      throw new Error(`Ungültiger Bindemitteltyp: ${parts[0]}`)
    }
    
    // Parse remaining parts
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      
      if (part.startsWith('C') && /^C\d+$/.test(part)) {
        result.compressiveClass = part
      } else if (part.startsWith('F') && /^F\d+$/.test(part)) {
        result.flexuralClass = part
      } else if (part.startsWith('A') && /^A\d+$/.test(part)) {
        result.wearResistanceClass = part
      } else if (part.startsWith('AR') && /^AR[\d.]+$/.test(part)) {
        result.wearResistanceBCA = part
      } else if (part.startsWith('RWA') && /^RWA\d+$/.test(part)) {
        result.wearResistanceRollrad = part
      } else if (part.startsWith('SH') && /^SH\d+$/.test(part)) {
        result.surfaceHardnessClass = part
      } else if (part.startsWith('B') && /^B[\d.]+$/.test(part)) {
        result.bondStrengthClass = part
      } else if (part.startsWith('IR') && /^IR\d+$/.test(part)) {
        result.impactResistanceClass = part
      } else if (part.startsWith('RWFC')) {
        result.rwfc = part
      } else if (part.startsWith('E') && /^E\d$/.test(part)) {
        result.electricalResistance = part
      } else if (part.startsWith('λ')) {
        result.thermalConductivity = parseFloat(part.substring(1))
      } else if (part.startsWith('R') && /^R\d+$/.test(part)) {
        result.slipResistance = part
      }
    }
    
    return result
  }

  /**
   * Validiert eine EN 13813 Bezeichnung
   * @param designation Die zu validierende Bezeichnung
   * @returns true wenn gültig, sonst false mit Fehlermeldungen
   */
  static validateDesignation(designation: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    try {
      const parsed = this.parseDesignation(designation)
      
      // Prüfe Pflichtfelder
      if (!parsed.binderType) {
        errors.push('Bindemitteltyp fehlt')
      }
      
      if (!parsed.compressiveClass && !parsed.flexuralClass) {
        errors.push('Mindestens eine Festigkeitsklasse erforderlich')
      }
      
      // Prüfe bindemittelspezifische Anforderungen
      if (parsed.binderType === 'CT' || parsed.binderType === 'CA') {
        if (!parsed.compressiveClass) {
          errors.push(`Druckfestigkeitsklasse erforderlich für ${parsed.binderType}`)
        }
        if (!parsed.flexuralClass) {
          errors.push(`Biegezugfestigkeitsklasse erforderlich für ${parsed.binderType}`)
        }
      }
      
      // Weitere Validierungen...
      
    } catch (error: any) {
      errors.push(error.message)
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Generiert eine benutzerfreundliche Beschreibung aus der Normbezeichnung
   */
  static getDescription(designation: string): string {
    try {
      const parsed = this.parseDesignation(designation)
      const parts: string[] = []
      
      // Bindemitteltyp
      const binderNames: Record<string, string> = {
        CT: 'Zementestrich',
        CA: 'Calciumsulfatestrich',
        MA: 'Magnesiaestrich',
        SR: 'Kunstharzestrich',
        AS: 'Gussasphaltestrich'
      }
      
      if (parsed.binderType) {
        parts.push(binderNames[parsed.binderType] || parsed.binderType)
      }
      
      // Festigkeiten
      if (parsed.compressiveClass) {
        const value = parsed.compressiveClass.replace('C', '')
        parts.push(`Druckfestigkeit ${value} N/mm²`)
      }
      
      if (parsed.flexuralClass) {
        const value = parsed.flexuralClass.replace('F', '')
        parts.push(`Biegezugfestigkeit ${value} N/mm²`)
      }
      
      // Verschleiß
      if (parsed.wearResistanceClass) {
        const value = parsed.wearResistanceClass.replace('A', '')
        parts.push(`Verschleißwiderstand ${value} cm³/50cm² (Böhme)`)
      }
      
      if (parsed.surfaceHardnessClass) {
        const value = parsed.surfaceHardnessClass.replace('SH', '')
        parts.push(`Oberflächenhärte ${value} N/mm²`)
      }
      
      return parts.join(', ')
    } catch {
      return designation
    }
  }
}