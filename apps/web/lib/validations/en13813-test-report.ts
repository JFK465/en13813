export interface TestReportValidation {
  reportType: 'ITT' | 'System1' | 'System3' | 'System4' | 'FPC' | 'External'
  estrichType?: 'CT' | 'CA' | 'CAF' | 'MA' | 'AS' | 'SR'
  hasWearLayer?: boolean
  hasFlooring?: boolean
  fireClass?: string
  errors: string[]
  warnings: string[]
}

export function validateTestReport(data: any): TestReportValidation {
  const validation: TestReportValidation = {
    reportType: data.report_type,
    estrichType: data.estrich_type,
    hasWearLayer: data.has_wear_layer,
    hasFlooring: data.has_flooring,
    fireClass: data.fire_class,
    errors: [],
    warnings: []
  }

  // AVCP System Validierung
  if (data.fire_class && data.fire_class !== 'A1fl') {
    if (data.report_type === 'System4') {
      validation.errors.push('System 4 ist nur für A1fl ohne Prüfung oder andere Verwendungen zulässig')
    }
    if (!data.notified_body_number && (data.report_type === 'System1' || data.report_type === 'System3')) {
      validation.errors.push('Notified Body Nummer erforderlich für System 1 und 3')
    }
  }

  // Nutzschicht Validierung
  if (validation.hasWearLayer) {
    if (!data.wear_resistance_type || !data.wear_resistance_value) {
      validation.errors.push('Verschleißwiderstand (A/AR/RWA) ist für Nutzschichten zwingend erforderlich')
    }
  }

  // Mit Bodenbelag Validierung
  if (validation.hasFlooring) {
    if (!data.rwfc_value) {
      validation.warnings.push('RWFC sollte für Estriche mit Bodenbelag angegeben werden')
    }
  }

  // SR Nutzschicht Validierung
  if (validation.estrichType === 'SR' && validation.hasWearLayer) {
    if (!data.impact_resistance_value) {
      validation.warnings.push('Impact Resistance (IR) ist für SR-Nutzschichten empfohlen')
    }
  }

  // FPC Checkboxen Validierung
  if (data.report_type === 'FPC') {
    if (!data.fpc_calibrations || !data.fpc_sampling_plan || !data.fpc_traceability || !data.fpc_records) {
      validation.warnings.push('Alle FPC Kontrollpunkte sollten für einen vollständigen FPC-Bericht abgehakt sein')
    }
  }

  // Brandklasse A1fl Validierung
  if (data.fire_class === 'A1fl' && data.fire_test_report) {
    validation.warnings.push('Bei A1fl ohne Prüfung ist kein Prüfbericht erforderlich (Verweis auf 96/603/EG)')
  }

  return validation
}

export function getAVCPSystemDescription(system: string, fireClass?: string): string {
  switch(system) {
    case 'System1':
      return 'System 1: Produktzertifizierung mit NB-Überwachung (NB-Nummer neben CE-Zeichen)'
    case 'System3':
      return 'System 3: NB-Prüfung ohne Überwachung (keine NB-Nummer neben CE-Zeichen)'
    case 'System4':
      return fireClass === 'A1fl' ?
        'System 4: A1fl ohne Prüfung gemäß 96/603/EG' :
        'System 4: Herstellererklärung ohne NB'
    default:
      return system
  }
}

export function getWearResistanceUnit(type: string): string {
  switch(type) {
    case 'bohme':
      return 'cm³/50cm²'
    case 'bca':
      return 'µm'
    case 'rwa':
      return 'cm³'
    default:
      return ''
  }
}

export function getWearResistanceClasses(type: string): string[] {
  switch(type) {
    case 'bohme':
      return ['A22', 'A15', 'A12', 'A9', 'A6', 'A3', 'A1.5']
    case 'bca':
      return ['AR6', 'AR4', 'AR2', 'AR1', 'AR0.5']
    case 'rwa':
      return ['RWA300', 'RWA100', 'RWA20', 'RWA10', 'RWA1']
    default:
      return []
  }
}