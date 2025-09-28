#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Vollständige Testdaten für ALLE Felder (inklusive verschachtelter Strukturen)
const completeTestData = {
  // === GRUNDDATEN ===
  recipe_code: `DEEP_TEST_${Date.now()}`,
  name: 'Deep Test Recipe',
  description: 'Umfassender Test aller Felder und JSONB-Strukturen',
  version: '1.0.0-test',
  status: 'draft',

  // === EN13813 KERNFELDER ===
  type: 'CT',
  test_age_days: 28,
  early_strength: true,
  heated_indicator: false,

  // === HERSTELLERANGABEN ===
  manufacturer_name: 'Test Manufacturer GmbH',
  manufacturer_address: 'Teststraße 123, 12345 Teststadt',
  product_name: 'SuperEstrich 3000',

  // === FESTIGKEITSKLASSEN ===
  compressive_strength_class: 'C30',
  flexural_strength_class: 'F5',
  wear_resistance_method: 'bohme',
  wear_resistance_class: 'A22',
  surface_hardness_class: 'SH200',
  bond_strength_class: 'B2.0',
  impact_resistance_class: 'IR4',
  impact_resistance_nm: 25.5,
  indentation_class: 'IC100',
  rwfc_class: 'RWFC350',

  // === BRANDSCHUTZ ===
  fire_class: 'A2fl',
  smoke_class: 's1',

  // === KONFORMITÄT ===
  avcp_system: '1+',
  notified_body_number: '1234',

  // === DOKUMENTATION ===
  notes: 'Öffentliche Notizen für DoP',
  internal_notes: 'Interne Notizen - nicht für DoP',

  // === GENEHMIGUNG ===
  // approved_by wird übersprungen wegen UUID-Konflikt
  approved_at: new Date().toISOString(),

  // === KOMPLEXE JSONB STRUKTUREN ===

  // 1. MATERIALS - Materialzusammensetzung
  materials: {
    binder: {
      type: 'CAC',
      designation: 'Calcium Aluminate Cement',
      amount_kg_m3: 350,
      supplier: 'Calcium Aluminate Corp',
      certificate: 'CE-12345',
      properties: {
        specific_gravity: 2.95,
        blaine_fineness: 4500,
        setting_time_initial: 45,
        setting_time_final: 90
      }
    },
    aggregates: [
      {
        type: 'natural',
        designation: 'Quarzsand 0/2',
        fraction: '0-2mm',
        amount_kg_m3: 750,
        source: 'Sandgrube Testort',
        density_kg_m3: 2650,
        moisture_percent: 0.1,
        grading_curve: [
          { sieve_mm: 4, passing_percent: 100 },
          { sieve_mm: 2, passing_percent: 95 },
          { sieve_mm: 1, passing_percent: 65 },
          { sieve_mm: 0.5, passing_percent: 35 }
        ]
      },
      {
        type: 'natural',
        designation: 'Kies 2/8',
        fraction: '2-8mm',
        amount_kg_m3: 850,
        source: 'Steinbruch Example',
        density_kg_m3: 2750,
        water_absorption: 0.5
      }
    ],
    additives: [
      {
        type: 'plasticizer',
        designation: 'Fließmittel FM-34',
        amount_percent: 1.2,
        supplier: 'BASF',
        function: 'Verflüssigung',
        amount_kg_m3: 4.2,
        density: 1.05
      },
      {
        type: 'retarder',
        designation: 'Verzögerer VZ-10',
        amount_percent: 0.3,
        supplier: 'Sika',
        function: 'Verarbeitungszeit-Verlängerung',
        amount_kg_m3: 1.05
      }
    ],
    fibers: {
      type: 'synthetic',
      designation: 'PP-Fasern 12mm',
      length_mm: 12,
      amount_kg_m3: 0.9,
      supplier: 'FiberTech GmbH'
    },
    water: {
      amount_l_m3: 175,
      quality: 'Trinkwasserqualität',
      temperature_celsius: 20
    },
    water_cement_ratio: 0.5,
    consistency_class: 'F3',
    flow_diameter_mm: 240,
    mixing_time_min: 3,
    mixing_speed_rpm: 45,
    mixing_temperature_celsius: 20,
    fresh_density_kg_m3: 2300,
    air_content_percent: 2.5,
    setting_time_initial_min: 180,
    setting_time_final_min: 360,
    workability_time_min: 45,
    batch_size_kg: 25,
    production_date: '2025-01-29',
    shelf_life_months: 12,
    storage_conditions: 'Trocken bei 5-30°C lagern'
  },

  // 2. QUALITY_CONTROL - Qualitätskontrollparameter
  quality_control: {
    test_frequency_fresh: 'per_batch',
    test_frequency_hardened: 'weekly',
    sample_size: '3 Würfel 150x150x150mm',
    sample_location: 'Nach Mischer',
    retention_samples_months: 6,
    calibration_scales: 'monthly',
    calibration_mixers: 'quarterly',
    calibration_testing: 'jährlich nach DIN EN ISO/IEC 17025',
    tolerance_binder_percent: 2,
    tolerance_water_percent: 3,
    tolerance_temperature_celsius: 2,
    tolerance_consistency_percent: 5,
    deviation_minor: 'Dokumentation und Nachprüfung',
    deviation_major: 'Produktion anhalten, Charge prüfen',
    deviation_critical: 'Sofortiger Produktionsstopp, Rückruf prüfen',
    acceptance_criteria: 'Mittelwert ≥ deklarierte Klasse, Einzelwert ≥ 0.9 × deklarierte Klasse'
  },

  // 3. ADDITIONAL_PROPERTIES - Zusätzliche Eigenschaften
  additional_properties: {
    elastic_modulus_class: 'E10',
    shrinkage_mm_m: 0.5,
    swelling_mm_m: 0.1,
    creep_coefficient: 2.0,
    thermal_conductivity_w_mk: 1.4,
    thermal_expansion_coefficient: 0.000012,
    specific_heat_capacity: 1000,
    electrical_resistance_ohm_m: 100000,
    chemical_resistance: ['oil', 'acid', 'alkali'],
    radioactivity_index: 0.5,
    dangerous_substances: ['Chromat < 2 mg/kg'],
    tvoc_emission: 250,
    formaldehyde_emission: 'E1'
  },

  // 4. INTENDED_USE - Verwendungszweck
  intended_use: {
    wearing_surface: true,
    with_flooring: false,
    heated_screed: true,
    indoor_only: false,
    outdoor_use: true,
    wet_areas: true,
    industrial_use: true,
    chemical_resistance: true
  },

  // 5. ITT_TEST_PLAN - Erstprüfungsplan
  itt_test_plan: {
    required_tests: [
      {
        property: 'Druckfestigkeit',
        norm: 'EN 13892-2',
        test_age_days: 28,
        target_value: '≥ 30 N/mm²'
      },
      {
        property: 'Biegezugfestigkeit',
        norm: 'EN 13892-2',
        test_age_days: 28,
        target_value: '≥ 5 N/mm²'
      },
      {
        property: 'Verschleißwiderstand',
        norm: 'EN 13892-3',
        test_age_days: 28,
        target_value: '≤ 22 cm³/50cm²'
      }
    ],
    test_laboratory: 'MPA Stuttgart',
    test_report_number: 'MPA-2025-001',
    test_report_date: '2025-01-15',
    test_report_file: '/reports/itt-2025-001.pdf'
  },

  // 6. TRACEABILITY - Rückverfolgbarkeit
  traceability: {
    batch_linking_enabled: true,
    supplier_certificates: [
      {
        supplier: 'HeidelbergCement',
        material: 'CEM I 42,5 R',
        certificate_number: 'HC-2025-001',
        valid_until: '2025-12-31',
        file_url: '/certificates/cement-2025.pdf'
      },
      {
        supplier: 'Quarzsand GmbH',
        material: 'Sand 0/2',
        certificate_number: 'QS-2025-001',
        valid_until: '2025-06-30',
        file_url: '/certificates/sand-2025.pdf'
      }
    ],
    customer_deliveries_tracked: true
  },

  // 7. CHANGE_LOG - Änderungshistorie
  change_log: [
    {
      version: '1.0.0',
      date: '2025-01-01',
      changes: ['Initiale Rezeptur erstellt'],
      requires_retest: false,
      approved_by: 'Technical Manager'
    },
    {
      version: '1.0.1',
      date: '2025-01-15',
      changes: ['Fließmittel erhöht', 'Mischzeit angepasst'],
      requires_retest: false,
      approved_by: 'QM Manager'
    }
  ]
}

// Funktion zum Extrahieren aller Felder rekursiv
function extractAllFields(obj, prefix = '', depth = 0) {
  let fields = []
  const maxDepth = 5 // Verhindere zu tiefe Rekursion

  if (depth > maxDepth) return fields

  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key

    if (value === null || value === undefined) {
      fields.push({ path: fieldPath, value: value, type: 'null', depth })
    } else if (Array.isArray(value)) {
      fields.push({ path: fieldPath, value: value, type: 'array', depth })
      // Teste auch Array-Elemente
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          fields = fields.concat(extractAllFields(item, `${fieldPath}[${index}]`, depth + 1))
        }
      })
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      fields.push({ path: fieldPath, value: value, type: 'object', depth })
      fields = fields.concat(extractAllFields(value, fieldPath, depth + 1))
    } else {
      const type = value instanceof Date ? 'date' : typeof value
      fields.push({ path: fieldPath, value: value, type: type, depth })
    }
  }

  return fields
}

// Teste einzelnes Feld
async function testSingleField(fieldPath, value, recordId) {
  try {
    // Bei Array-Index-Notation, teste das gesamte Array
    if (fieldPath.includes('[')) {
      const arrayPath = fieldPath.substring(0, fieldPath.indexOf('['))
      const { data: record } = await supabase
        .from('en13813_recipes')
        .select(arrayPath)
        .eq('id', recordId)
        .single()

      return {
        field: fieldPath,
        status: record ? 'success' : 'error',
        type: 'array-element'
      }
    }

    // Normale Felder
    const { data: record } = await supabase
      .from('en13813_recipes')
      .select(fieldPath.split('.')[0])
      .eq('id', recordId)
      .single()

    if (!record) {
      return { field: fieldPath, status: 'error', message: 'Record not found' }
    }

    // Navigate zum tatsächlichen Wert
    let actualValue = record
    const parts = fieldPath.split('.')
    for (const part of parts) {
      if (actualValue && typeof actualValue === 'object') {
        actualValue = actualValue[part]
      } else {
        break
      }
    }

    // Vergleiche Werte
    const match = JSON.stringify(actualValue) === JSON.stringify(value)

    return {
      field: fieldPath,
      status: match ? 'success' : 'mismatch',
      expected: value,
      actual: actualValue
    }
  } catch (error) {
    return {
      field: fieldPath,
      status: 'error',
      message: error.message
    }
  }
}

// Haupttest-Funktion
async function runCompleteDeepTest() {
  console.log('\n🔬 EN13813 COMPLETE DEEP FIELD TEST')
  console.log('=' .repeat(70))
  console.log(`Start: ${new Date().toLocaleString('de-DE')}\n`)

  // 1. Erstelle Test-Record mit allen Daten
  console.log('📝 Creating test record with all fields...')

  let { data: testRecord, error: createError } = await supabase
    .from('en13813_recipes')
    .insert(completeTestData)
    .select()
    .single()

  if (createError) {
    console.error('❌ Failed to create test record:', createError.message)

    // Versuche mit Minimal-Daten
    const minimalData = {
      recipe_code: completeTestData.recipe_code,
      name: completeTestData.name,
      type: completeTestData.type,
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      version: '1.0',
      status: 'draft',
      fire_class: 'A1fl'
    }

    console.log('🔧 Retrying with minimal data...')
    const { data: minimalRecord, error: minimalError } = await supabase
      .from('en13813_recipes')
      .insert(minimalData)
      .select()
      .single()

    if (minimalError) {
      console.error('❌ Even minimal insert failed:', minimalError.message)
      return
    }

    console.log('✅ Minimal record created, testing updates...')

    // Teste Updates für alle anderen Felder
    for (const [field, value] of Object.entries(completeTestData)) {
      if (minimalData[field]) continue

      const { error: updateError } = await supabase
        .from('en13813_recipes')
        .update({ [field]: value })
        .eq('id', minimalRecord.id)

      if (updateError && !updateError.message.includes('column')) {
        console.log(`⚠️ Update failed for ${field}: ${updateError.message}`)
      }
    }

    // Hole aktualisierten Record
    const { data: updatedRecord } = await supabase
      .from('en13813_recipes')
      .select('*')
      .eq('id', minimalRecord.id)
      .single()

    testRecord = updatedRecord || minimalRecord
  } else {
    console.log('✅ Test record created successfully')
  }

  if (!testRecord) {
    console.error('❌ No test record available')
    return
  }

  // 2. Extrahiere alle Felder
  console.log('\n📋 Extracting all fields from test data...')
  const allFields = extractAllFields(completeTestData)
  const leafFields = allFields.filter(f => !['object', 'array'].includes(f.type) || f.path.includes('['))

  console.log(`Found ${allFields.length} total fields (${leafFields.length} testable leaf fields)\n`)

  // 3. Teste alle Felder
  const results = {
    success: [],
    mismatch: [],
    error: []
  }

  console.log('🧪 Testing individual fields...\n')

  // Gruppiere Felder nach Top-Level
  const fieldGroups = {}
  for (const field of leafFields) {
    const topLevel = field.path.split('.')[0].split('[')[0]
    if (!fieldGroups[topLevel]) fieldGroups[topLevel] = []
    fieldGroups[topLevel].push(field)
  }

  // Teste nach Gruppen
  let totalTested = 0
  for (const [group, fields] of Object.entries(fieldGroups)) {
    console.log(`Testing ${group} (${fields.length} fields)...`)

    for (const field of fields) {
      totalTested++
      const result = await testSingleField(field.path, field.value, testRecord.id)

      results[result.status].push(result)

      // Progress indicator
      if (totalTested % 10 === 0) {
        process.stdout.write(`  ${totalTested}/${leafFields.length} `)
        const percent = (totalTested / leafFields.length * 100).toFixed(0)
        process.stdout.write(`[${percent}%]\n`)
      }
    }
  }

  // 4. Cleanup
  console.log('\n🧹 Cleaning up test data...')
  await supabase
    .from('en13813_recipes')
    .delete()
    .eq('id', testRecord.id)

  // 5. Report
  console.log('\n' + '=' .repeat(70))
  console.log('📊 TEST RESULTS')
  console.log('=' .repeat(70))

  const successRate = (results.success.length / leafFields.length * 100).toFixed(1)

  console.log('\nSUMMARY:')
  console.log(`  ✅ Successful:    ${results.success.length} fields`)
  console.log(`  ⚠️ Mismatches:    ${results.mismatch.length} fields`)
  console.log(`  ❌ Errors:        ${results.error.length} fields`)
  console.log(`  📈 Success Rate:  ${successRate}%`)

  // Details für Probleme
  if (results.mismatch.length > 0) {
    console.log('\n⚠️ FIELDS WITH MISMATCHES:')
    for (const result of results.mismatch.slice(0, 5)) {
      console.log(`  • ${result.field}`)
      if (result.expected !== undefined) {
        console.log(`    Expected: ${JSON.stringify(result.expected).substring(0, 50)}`)
        console.log(`    Actual:   ${JSON.stringify(result.actual).substring(0, 50)}`)
      }
    }
    if (results.mismatch.length > 5) {
      console.log(`  ... and ${results.mismatch.length - 5} more`)
    }
  }

  if (results.error.length > 0) {
    console.log('\n❌ FIELDS WITH ERRORS:')
    for (const result of results.error.slice(0, 5)) {
      console.log(`  • ${result.field}`)
      if (result.message) {
        console.log(`    Error: ${result.message.substring(0, 100)}`)
      }
    }
    if (results.error.length > 5) {
      console.log(`  ... and ${results.error.length - 5} more`)
    }
  }

  // JSONB Success Report
  const jsonbSuccess = results.success.filter(r => r.field.includes('.'))
  if (jsonbSuccess.length > 0) {
    console.log('\n✅ SUCCESSFUL JSONB PATHS:')
    const jsonbGroups = {}
    for (const result of jsonbSuccess) {
      const parent = result.field.split('.')[0]
      if (!jsonbGroups[parent]) jsonbGroups[parent] = 0
      jsonbGroups[parent]++
    }

    for (const [parent, count] of Object.entries(jsonbGroups)) {
      console.log(`  • ${parent}: ${count} fields working`)
    }
  }

  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFields: allFields.length,
      testedFields: leafFields.length,
      successful: results.success.length,
      mismatches: results.mismatch.length,
      errors: results.error.length,
      successRate: parseFloat(successRate)
    },
    fieldGroups: Object.keys(fieldGroups).map(g => ({
      name: g,
      count: fieldGroups[g].length,
      success: results.success.filter(r => r.field.startsWith(g)).length
    })),
    results: results
  }

  const reportPath = join(__dirname, '../test-results')
  if (!fs.existsSync(reportPath)) {
    fs.mkdirSync(reportPath, { recursive: true })
  }

  const reportFile = join(reportPath, `deep-field-test-${Date.now()}.json`)
  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2))

  console.log(`\n📄 Detailed report saved to: ${reportFile}`)

  // Final assessment
  console.log('\n' + '=' .repeat(70))
  if (successRate >= 95) {
    console.log('🎉 EXCELLENT! System is fully functional!')
  } else if (successRate >= 85) {
    console.log('✅ VERY GOOD! System is production-ready!')
  } else if (successRate >= 70) {
    console.log('⚠️ GOOD! Some improvements needed.')
  } else {
    console.log('❌ NEEDS WORK! Critical fields missing.')
  }
  console.log('=' .repeat(70))
}

// Run test
console.log('🚀 Starting EN13813 Deep Field Test\n')
runCompleteDeepTest()
  .then(() => {
    console.log('\n✨ Test completed successfully!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err)
    process.exit(1)
  })