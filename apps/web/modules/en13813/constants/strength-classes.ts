/**
 * EN 13813 Festigkeitsklassen-Konstanten
 * Definiert alle gültigen Klassen nach EN 13813
 */

// Druckfestigkeitsklassen nach EN 13813 Tabelle 1
export const COMPRESSIVE_STRENGTH_CLASSES = [
  { value: 'C5', label: 'C5', strength: 5 },
  { value: 'C7', label: 'C7', strength: 7 },
  { value: 'C12', label: 'C12', strength: 12 },
  { value: 'C16', label: 'C16', strength: 16 },
  { value: 'C20', label: 'C20', strength: 20 },
  { value: 'C25', label: 'C25', strength: 25 },
  { value: 'C30', label: 'C30', strength: 30 },
  { value: 'C35', label: 'C35', strength: 35 },
  { value: 'C40', label: 'C40', strength: 40 },
  { value: 'C50', label: 'C50', strength: 50 },
  { value: 'C60', label: 'C60', strength: 60 },
  { value: 'C70', label: 'C70', strength: 70 },
  { value: 'C80', label: 'C80', strength: 80 }
] as const

// Biegezugfestigkeitsklassen nach EN 13813 Tabelle 2
export const FLEXURAL_STRENGTH_CLASSES = [
  { value: 'F1', label: 'F1', strength: 1 },
  { value: 'F2', label: 'F2', strength: 2 },
  { value: 'F3', label: 'F3', strength: 3 },
  { value: 'F4', label: 'F4', strength: 4 },
  { value: 'F5', label: 'F5', strength: 5 },
  { value: 'F6', label: 'F6', strength: 6 },
  { value: 'F7', label: 'F7', strength: 7 },
  { value: 'F10', label: 'F10', strength: 10 },
  { value: 'F15', label: 'F15', strength: 15 },
  { value: 'F20', label: 'F20', strength: 20 },
  { value: 'F30', label: 'F30', strength: 30 },
  { value: 'F40', label: 'F40', strength: 40 },
  { value: 'F50', label: 'F50', strength: 50 }
] as const

// Verschleißwiderstandsklassen (Böhme) nach EN 13813 Tabelle 3
export const WEAR_RESISTANCE_CLASSES_BOHME = [
  { value: 'A1', label: 'A1', maxAbrasion: 1 },
  { value: 'A3', label: 'A3', maxAbrasion: 3 },
  { value: 'A6', label: 'A6', maxAbrasion: 6 },
  { value: 'A9', label: 'A9', maxAbrasion: 9 },
  { value: 'A12', label: 'A12', maxAbrasion: 12 },
  { value: 'A15', label: 'A15', maxAbrasion: 15 },
  { value: 'A22', label: 'A22', maxAbrasion: 22 }
] as const

// Verschleißwiderstandsklassen (BCA) nach EN 13813 Tabelle 4
export const WEAR_RESISTANCE_CLASSES_BCA = [
  { value: 'AR0.5', label: 'AR0,5', maxDepth: 0.5 },
  { value: 'AR1', label: 'AR1', maxDepth: 1 },
  { value: 'AR2', label: 'AR2', maxDepth: 2 },
  { value: 'AR4', label: 'AR4', maxDepth: 4 },
  { value: 'AR6', label: 'AR6', maxDepth: 6 }
] as const

// Verschleißwiderstandsklassen (Rollrad) nach EN 13813 Tabelle 5
export const WEAR_RESISTANCE_CLASSES_ROLLRAD = [
  { value: 'RWA100', label: 'RWA100', maxAbrasion: 100 },
  { value: 'RWA200', label: 'RWA200', maxAbrasion: 200 },
  { value: 'RWA300', label: 'RWA300', maxAbrasion: 300 },
  { value: 'RWA450', label: 'RWA450', maxAbrasion: 450 },
  { value: 'RWA600', label: 'RWA600', maxAbrasion: 600 },
  { value: 'RWA800', label: 'RWA800', maxAbrasion: 800 },
  { value: 'RWA1000', label: 'RWA1000', maxAbrasion: 1000 },
  { value: 'RWA1500', label: 'RWA1500', maxAbrasion: 1500 },
  { value: 'RWA2000', label: 'RWA2000', maxAbrasion: 2000 },
  { value: 'RWA3000', label: 'RWA3000', maxAbrasion: 3000 },
  { value: 'RWA4000', label: 'RWA4000', maxAbrasion: 4000 },
  { value: 'RWA6000', label: 'RWA6000', maxAbrasion: 6000 },
  { value: 'RWA8000', label: 'RWA8000', maxAbrasion: 8000 },
  { value: 'RWA10000', label: 'RWA10000', maxAbrasion: 10000 },
  { value: 'RWA15000', label: 'RWA15000', maxAbrasion: 15000 }
] as const

// Oberflächenhärteklassen nach EN 13813 Tabelle 6
export const SURFACE_HARDNESS_CLASSES = [
  { value: 'SH30', label: 'SH30', hardness: 30 },
  { value: 'SH40', label: 'SH40', hardness: 40 },
  { value: 'SH50', label: 'SH50', hardness: 50 },
  { value: 'SH70', label: 'SH70', hardness: 70 },
  { value: 'SH100', label: 'SH100', hardness: 100 },
  { value: 'SH150', label: 'SH150', hardness: 150 },
  { value: 'SH200', label: 'SH200', hardness: 200 }
] as const

// Haftzugfestigkeitsklassen nach EN 13813 Tabelle 7
export const BOND_STRENGTH_CLASSES = [
  { value: 'B0.2', label: 'B0,2', strength: 0.2 },
  { value: 'B0.5', label: 'B0,5', strength: 0.5 },
  { value: 'B1.0', label: 'B1,0', strength: 1.0 },
  { value: 'B1.5', label: 'B1,5', strength: 1.5 },
  { value: 'B2.0', label: 'B2,0', strength: 2.0 }
] as const

// Schlagfestigkeitsklassen nach EN 13813 Tabelle 8
export const IMPACT_RESISTANCE_CLASSES = [
  { value: 'IR1', label: 'IR1', resistance: 1 },
  { value: 'IR2', label: 'IR2', resistance: 2 },
  { value: 'IR4', label: 'IR4', resistance: 4 },
  { value: 'IR10', label: 'IR10', resistance: 10 },
  { value: 'IR20', label: 'IR20', resistance: 20 }
] as const

// Brandverhaltensklassen nach EN 13501-1
export const FIRE_CLASSES = [
  { value: 'A1fl', label: 'A1fl - Nicht brennbar', system: 4 },
  { value: 'A2fl', label: 'A2fl - Nicht brennbar', system: 1 },
  { value: 'Bfl', label: 'Bfl - Schwer entflammbar', system: 1 },
  { value: 'Cfl', label: 'Cfl - Normal entflammbar', system: 1 },
  { value: 'Dfl', label: 'Dfl - Normal entflammbar', system: 1 },
  { value: 'Efl', label: 'Efl - Normal entflammbar', system: 1 },
  { value: 'Ffl', label: 'Ffl - Leicht entflammbar', system: 1 },
  { value: 'NPD', label: 'NPD - Keine Leistung erklärt', system: 4 }
] as const

// Rauchentwicklungsklassen (zusätzlich zu Brandklasse)
export const SMOKE_CLASSES = [
  { value: 's1', label: 's1 - Geringe Rauchentwicklung' },
  { value: 's2', label: 's2 - Mittlere Rauchentwicklung' },
  { value: 's3', label: 's3 - Starke Rauchentwicklung' }
] as const

// Bindemitteltypen nach EN 13813
export const BINDER_TYPES = [
  { value: 'CT', label: 'CT - Zementestrich', description: 'Cement screed' },
  { value: 'CA', label: 'CA - Calciumsulfatestrich', description: 'Calcium sulfate screed' },
  { value: 'MA', label: 'MA - Magnesiaestrich', description: 'Magnesite screed' },
  { value: 'AS', label: 'AS - Gussasphaltestrich', description: 'Mastic asphalt screed' },
  { value: 'SR', label: 'SR - Kunstharzestrich', description: 'Synthetic resin screed' }
] as const

// RWFC Klassen (Rollstuhlbefahrbarkeit mit Belag)
export const RWFC_CLASSES = [
  { value: 'RWFC150', label: 'RWFC150', load: 150 },
  { value: 'RWFC250', label: 'RWFC250', load: 250 },
  { value: 'RWFC350', label: 'RWFC350', load: 350 },
  { value: 'RWFC450', label: 'RWFC450', load: 450 },
  { value: 'RWFC550', label: 'RWFC550', load: 550 }
] as const

// Elektrischer Widerstand Klassen
export const ELECTRICAL_RESISTANCE_CLASSES = [
  { value: 'E1', label: 'E1 - < 10⁶ Ω', maxResistance: 1e6 },
  { value: 'E2', label: 'E2 - < 10⁸ Ω', maxResistance: 1e8 },
  { value: 'E3', label: 'E3 - < 10¹⁰ Ω', maxResistance: 1e10 }
] as const

// Spezielle Anwendungsklassen
export const SPECIAL_APPLICATION_CLASSES = [
  { value: 'IC10', label: 'IC10 - Industrie schwer', description: 'Heavy industrial use' },
  { value: 'IC15', label: 'IC15 - Industrie mittel', description: 'Medium industrial use' },
  { value: 'IC20', label: 'IC20 - Industrie leicht', description: 'Light industrial use' }
] as const

// Helper Funktionen
export function getCompressiveStrengthFromClass(className: string): number | null {
  const cls = COMPRESSIVE_STRENGTH_CLASSES.find(c => c.value === className)
  return cls ? cls.strength : null
}

export function getFlexuralStrengthFromClass(className: string): number | null {
  const cls = FLEXURAL_STRENGTH_CLASSES.find(c => c.value === className)
  return cls ? cls.strength : null
}

export function getRequiredAVCPSystem(fireClass?: string): 1 | 4 {
  if (!fireClass || fireClass === 'NPD' || fireClass === 'A1fl') {
    return 4
  }
  return 1 // System 1+ für alle anderen Brandklassen
}

// Validierungs-Helper
export function validateStrengthCombination(
  binderType: string,
  compressiveClass?: string,
  flexuralClass?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // CT und CA benötigen beide Festigkeitsklassen
  if (binderType === 'CT' || binderType === 'CA') {
    if (!compressiveClass) {
      errors.push(`Druckfestigkeitsklasse erforderlich für ${binderType}`)
    }
    if (!flexuralClass) {
      errors.push(`Biegezugfestigkeitsklasse erforderlich für ${binderType}`)
    }
  }
  
  // MA benötigt mindestens Druckfestigkeit
  if (binderType === 'MA' && !compressiveClass) {
    errors.push('Druckfestigkeitsklasse erforderlich für MA')
  }
  
  // SR kann verschiedene Kombinationen haben
  if (binderType === 'SR' && !compressiveClass && !flexuralClass) {
    errors.push('Mindestens eine Festigkeitsklasse erforderlich für SR')
  }
  
  return { valid: errors.length === 0, errors }
}