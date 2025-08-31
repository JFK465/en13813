import { Recipe } from '../types'

export class RecipeCodeGenerator {
  /**
   * Generates the EN 13813 designation for a recipe
   * Format: Type-CompressiveStrength-FlexuralStrength-AdditionalProperties
   * Example: CT-C30-F5-A12-H
   */
  generate(recipe: Recipe): string {
    const parts: string[] = []
    
    // 1. Estrich Type (always required)
    parts.push(recipe.estrich_type)
    
    // 2. Compressive & Flexural Strength for CT/CA/MA
    if (['CT', 'CA', 'MA'].includes(recipe.estrich_type)) {
      parts.push(recipe.compressive_strength)
      parts.push(recipe.flexural_strength)
    }
    
    // 3. Wear Resistance (if wearing surface)
    if (recipe.intended_use?.wearing_surface && 
        !recipe.intended_use?.with_flooring && 
        recipe.wear_resistance_class) {
      parts.push(recipe.wear_resistance_class)
    }
    
    // 4. Type-specific properties
    switch (recipe.estrich_type) {
      case 'MA':
        // Magnesiaestrich - Surface hardness
        if (recipe.surface_hardness_class) {
          parts.push(recipe.surface_hardness_class)
        }
        break
        
      case 'SR':
        // Kunstharzestrich - Bond strength, wear resistance, impact resistance
        if (recipe.bond_strength_class) {
          parts.push(recipe.bond_strength_class)
        }
        // Wear resistance might already be added above
        if (!parts.includes(recipe.wear_resistance_class || '') && recipe.wear_resistance_class) {
          parts.push(recipe.wear_resistance_class)
        }
        if (recipe.impact_resistance_class) {
          parts.push(recipe.impact_resistance_class)
        }
        break
        
      case 'AS':
        // Gussasphaltestrich - Indentation class
        if (recipe.indentation_class) {
          parts.push(recipe.indentation_class)
        }
        break
        
      case 'CA':
      case 'CT':
        // No additional special properties for these types
        break
    }
    
    // 5. Heated screed designation
    if (recipe.heated_screed || recipe.intended_use?.heated_screed) {
      parts.push('H')
    }
    
    return parts.join('-')
  }
  
  /**
   * Validates if a given EN designation is correct for the recipe
   */
  validate(recipe: Recipe, designation: string): boolean {
    const expectedDesignation = this.generate(recipe)
    return expectedDesignation === designation
  }
  
  /**
   * Parses an EN designation string and returns the components
   */
  parse(designation: string): {
    type?: string
    compressiveStrength?: string
    flexuralStrength?: string
    wearResistance?: string
    surfaceHardness?: string
    bondStrength?: string
    impactResistance?: string
    indentation?: string
    heated?: boolean
  } {
    const parts = designation.split('-')
    const result: any = {}
    
    if (parts.length === 0) return result
    
    // First part is always the type
    result.type = parts[0]
    
    // Parse remaining parts based on patterns
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      
      // Compressive strength (C followed by numbers)
      if (/^C\d+$/.test(part)) {
        result.compressiveStrength = part
      }
      // Flexural strength (F followed by numbers)
      else if (/^F\d+$/.test(part)) {
        result.flexuralStrength = part
      }
      // Wear resistance - Böhme (A followed by numbers)
      else if (/^A\d+(\.\d+)?$/.test(part)) {
        result.wearResistance = part
      }
      // Wear resistance - BCA (AR followed by numbers)
      else if (/^AR\d+(\.\d+)?$/.test(part)) {
        result.wearResistance = part
      }
      // Wear resistance - Rolling wheel (RWA followed by numbers)
      else if (/^RWA\d+$/.test(part)) {
        result.wearResistance = part
      }
      // Surface hardness (SH followed by numbers)
      else if (/^SH\d+$/.test(part)) {
        result.surfaceHardness = part
      }
      // Bond strength (B followed by numbers)
      else if (/^B\d+(\.\d+)?$/.test(part)) {
        result.bondStrength = part
      }
      // Impact resistance (IR followed by numbers)
      else if (/^IR\d+$/.test(part)) {
        result.impactResistance = part
      }
      // Indentation class (IC or IP followed by numbers)
      else if (/^I[CP]\d+$/.test(part)) {
        result.indentation = part
      }
      // Heated screed
      else if (part === 'H') {
        result.heated = true
      }
    }
    
    return result
  }
  
  /**
   * Gets required properties for a given estrich type
   */
  getRequiredProperties(type: string): string[] {
    const required: string[] = []
    
    switch (type) {
      case 'CT':
      case 'CA':
      case 'MA':
        required.push('compressive_strength', 'flexural_strength')
        break
      case 'AS':
        // AS doesn't require strength classes
        break
      case 'SR':
        // SR has optional properties but none are strictly required
        break
    }
    
    return required
  }
  
  /**
   * Gets optional properties for a given estrich type
   */
  getOptionalProperties(type: string, intendedUse?: Recipe['intended_use']): string[] {
    const optional: string[] = []
    
    // Wear resistance is optional but required for wearing surfaces
    if (intendedUse?.wearing_surface && !intendedUse?.with_flooring) {
      optional.push('wear_resistance')
    }
    
    switch (type) {
      case 'MA':
        optional.push('surface_hardness')
        break
      case 'SR':
        optional.push('bond_strength', 'impact_resistance')
        if (!optional.includes('wear_resistance')) {
          optional.push('wear_resistance')
        }
        break
      case 'AS':
        optional.push('indentation')
        break
    }
    
    // Heated screed is optional for all types
    optional.push('heated_screed')
    
    return optional
  }
  
  /**
   * Formats the designation for display with tooltips
   */
  formatForDisplay(designation: string): {
    parts: Array<{
      value: string
      label: string
      description: string
    }>
  } {
    const parsed = this.parse(designation)
    const parts: any[] = []
    
    if (parsed.type) {
      parts.push({
        value: parsed.type,
        label: 'Estrichtyp',
        description: this.getTypeDescription(parsed.type)
      })
    }
    
    if (parsed.compressiveStrength) {
      parts.push({
        value: parsed.compressiveStrength,
        label: 'Druckfestigkeit',
        description: `${parsed.compressiveStrength.replace('C', '')} N/mm² nach EN 13892-2`
      })
    }
    
    if (parsed.flexuralStrength) {
      parts.push({
        value: parsed.flexuralStrength,
        label: 'Biegezugfestigkeit',
        description: `${parsed.flexuralStrength.replace('F', '')} N/mm² nach EN 13892-2`
      })
    }
    
    if (parsed.wearResistance) {
      const method = this.getWearResistanceMethod(parsed.wearResistance)
      parts.push({
        value: parsed.wearResistance,
        label: 'Verschleißwiderstand',
        description: `${method.description} nach ${method.norm}`
      })
    }
    
    if (parsed.surfaceHardness) {
      parts.push({
        value: parsed.surfaceHardness,
        label: 'Oberflächenhärte',
        description: `${parsed.surfaceHardness.replace('SH', '')} N/mm² nach EN 13892-6`
      })
    }
    
    if (parsed.bondStrength) {
      parts.push({
        value: parsed.bondStrength,
        label: 'Verbundfestigkeit',
        description: `${parsed.bondStrength.replace('B', '')} N/mm² nach EN 13892-8`
      })
    }
    
    if (parsed.impactResistance) {
      parts.push({
        value: parsed.impactResistance,
        label: 'Schlagfestigkeit',
        description: `${parsed.impactResistance.replace('IR', '')} Nm nach EN ISO 6272-1`
      })
    }
    
    if (parsed.indentation) {
      parts.push({
        value: parsed.indentation,
        label: 'Eindrückklasse',
        description: this.getIndentationDescription(parsed.indentation)
      })
    }
    
    if (parsed.heated) {
      parts.push({
        value: 'H',
        label: 'Heizestrich',
        description: 'Für Fußbodenheizung geeignet'
      })
    }
    
    return { parts }
  }
  
  private getTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'CT': 'Zementestrich',
      'CA': 'Calciumsulfatestrich (Anhydrit)',
      'MA': 'Magnesiaestrich',
      'AS': 'Gussasphaltestrich',
      'SR': 'Kunstharzestrich'
    }
    return descriptions[type] || type
  }
  
  private getWearResistanceMethod(wearClass: string): {
    method: string
    norm: string
    description: string
  } {
    if (wearClass.startsWith('A')) {
      return {
        method: 'Böhme',
        norm: 'EN 13892-3',
        description: `Abrieb ${wearClass.replace('A', '')} cm³/50cm²`
      }
    } else if (wearClass.startsWith('AR')) {
      return {
        method: 'BCA',
        norm: 'EN 13892-4',
        description: `Verschleißtiefe max. ${wearClass.replace('AR', '')} µm`
      }
    } else if (wearClass.startsWith('RWA')) {
      return {
        method: 'Rollrad',
        norm: 'EN 13892-5',
        description: `Verschleißtiefe max. ${wearClass.replace('RWA', '')} µm`
      }
    }
    return {
      method: 'Unbekannt',
      norm: '',
      description: wearClass
    }
  }
  
  private getIndentationDescription(indentationClass: string): string {
    const descriptions: Record<string, string> = {
      'IC10': 'Industrie - schwere Belastung',
      'IC15': 'Industrie - mittlere Belastung',
      'IC40': 'Industrie - leichte Belastung',
      'IC100': 'Wohnbereich',
      'IP10': 'Punktlast - schwere Belastung',
      'IP15': 'Punktlast - mittlere Belastung',
      'IP40': 'Punktlast - leichte Belastung'
    }
    return descriptions[indentationClass] || indentationClass
  }
}