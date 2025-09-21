// Automatische Klassenbestimmung für EN 13813

export function getCompressiveStrengthClass(value: number): string {
  // EN 13813 Druckfestigkeitsklassen C5 bis C80
  const classes = [80, 70, 60, 50, 40, 35, 30, 25, 20, 16, 12, 7, 5]
  for (const c of classes) {
    if (value >= c) return `C${c}`
  }
  return 'unter Klasse'
}

export function getFlexuralStrengthClass(value: number): string {
  // EN 13813 Biegezugfestigkeitsklassen F1 bis F50
  const classes = [50, 40, 30, 22, 20, 17, 15, 13, 10, 7, 5, 4, 3, 2, 1]
  for (const f of classes) {
    if (value >= f) return `F${f}`
  }
  return 'unter Klasse'
}

export function getWearResistanceClass(type: string, value: number): string {
  switch (type) {
    case 'bohme':
      // Böhme Klassen A22 bis A1.5 (kleinere Werte = besser)
      if (value <= 1.5) return 'A1.5'
      if (value <= 3) return 'A3'
      if (value <= 6) return 'A6'
      if (value <= 9) return 'A9'
      if (value <= 12) return 'A12'
      if (value <= 15) return 'A15'
      if (value <= 22) return 'A22'
      return 'über A22'

    case 'bca':
      // BCA Klassen AR6 bis AR0.5 (kleinere Werte = besser)
      if (value <= 50) return 'AR0.5'
      if (value <= 100) return 'AR1'
      if (value <= 200) return 'AR2'
      if (value <= 400) return 'AR4'
      if (value <= 600) return 'AR6'
      return 'über AR6'

    case 'rwa':
      // Rolling Wheel Klassen RWA300 bis RWA1 (kleinere Werte = besser)
      if (value <= 1) return 'RWA1'
      if (value <= 10) return 'RWA10'
      if (value <= 20) return 'RWA20'
      if (value <= 100) return 'RWA100'
      if (value <= 300) return 'RWA300'
      return 'über RWA300'

    default:
      return ''
  }
}

export function getRWFCClass(value: number): string {
  // RWFC Klassen in Newton
  if (value >= 550) return 'RWFC550'
  if (value >= 450) return 'RWFC450'
  if (value >= 350) return 'RWFC350'
  if (value >= 250) return 'RWFC250'
  if (value >= 150) return 'RWFC150'
  return 'unter RWFC150'
}

export function getSurfaceHardnessClass(value: number): string {
  // SH Klassen in N/mm²
  if (value >= 200) return 'SH200'
  if (value >= 150) return 'SH150'
  if (value >= 100) return 'SH100'
  if (value >= 70) return 'SH70'
  if (value >= 50) return 'SH50'
  if (value >= 40) return 'SH40'
  if (value >= 30) return 'SH30'
  return 'unter Klasse'
}

export function getBondStrengthClass(value: number): string {
  // B Klassen in N/mm²
  if (value >= 2.0) return 'B2.0'
  if (value >= 1.5) return 'B1.5'
  if (value >= 1.0) return 'B1.0'
  if (value >= 0.5) return 'B0.5'
  if (value >= 0.2) return 'B0.2'
  return 'unter Klasse'
}

// Konformitätsprüfung gegen deklarierte Klasse
export function checkConformity(measuredValue: number, declaredClass: string, testType: string): {
  passed: boolean
  message: string
} {
  let requiredValue: number | null = null
  let isLowerBetter = false

  // Extrahiere numerischen Wert aus Klasse
  if (testType === 'compressive_strength' && declaredClass.startsWith('C')) {
    requiredValue = parseFloat(declaredClass.substring(1))
  } else if (testType === 'flexural_strength' && declaredClass.startsWith('F')) {
    requiredValue = parseFloat(declaredClass.substring(1))
  } else if (testType === 'surface_hardness' && declaredClass.startsWith('SH')) {
    requiredValue = parseFloat(declaredClass.substring(2))
  } else if (testType === 'bond_strength' && declaredClass.startsWith('B')) {
    requiredValue = parseFloat(declaredClass.substring(1))
  } else if (testType === 'rwfc' && declaredClass.startsWith('RWFC')) {
    requiredValue = parseFloat(declaredClass.substring(4))
  } else if (testType === 'wear_bohme' && declaredClass.startsWith('A')) {
    requiredValue = parseFloat(declaredClass.substring(1))
    isLowerBetter = true
  } else if (testType === 'wear_bca' && declaredClass.startsWith('AR')) {
    requiredValue = parseFloat(declaredClass.substring(2)) * 100 // AR-Werte sind in 100µm
    isLowerBetter = true
  } else if (testType === 'wear_rwa' && declaredClass.startsWith('RWA')) {
    requiredValue = parseFloat(declaredClass.substring(3))
    isLowerBetter = true
  }

  if (requiredValue === null) {
    return {
      passed: false,
      message: `Unbekannte Klasse: ${declaredClass}`
    }
  }

  const passed = isLowerBetter ?
    measuredValue <= requiredValue :
    measuredValue >= requiredValue

  const message = passed ?
    `Konform: ${measuredValue} ${isLowerBetter ? '≤' : '≥'} ${requiredValue} (${declaredClass})` :
    `Nicht konform: ${measuredValue} ${isLowerBetter ? '>' : '<'} ${requiredValue} (${declaredClass})`

  return { passed, message }
}

// Berechne Statistik für Festigkeitswerte
export function calculateStatistics(values: number[]): {
  mean: number
  stdDev: number
  min: number
  max: number
  cv: number // Variationskoeffizient
} {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0, min: 0, max: 0, cv: 0 }
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)

  const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  const stdDev = Math.sqrt(variance)
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0

  return {
    mean: Math.round(mean * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    cv: Math.round(cv * 10) / 10
  }
}