#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Vollständige Test-Daten für ALLE Felder
const completeTestData = {
  // === GRUNDDATEN ===
  recipe_code: `FIELD_TEST_${Date.now()}`,
  name: 'Vollständiger Feldtest',
  description: 'Test aller Rezepturfelder für Datenbank-Mapping',
  type: 'CT',

  // === HERSTELLERANGABEN ===
  manufacturer_name: 'Test Hersteller GmbH',
  manufacturer_address: 'Musterstraße 123, 12345 Musterstadt',
  product_name: 'SuperEstrich Pro 2000',

  // === KONFORMITÄTSBEWERTUNG ===
  avcp_system: '4',
  notified_body_number: '1234',

  // === VERSIONIERUNG ===
  version: '1.0.0',
  status: 'draft',
  approved_by: 'Test Manager',
  approved_at: new Date().toISOString(),

  // === MECHANISCHE EIGENSCHAFTEN ===
  compressive_strength_class: 'C25',
  flexural_strength_class: 'F4',
  test_age_days: 28,
  early_strength: true,

  // === VERSCHLEISSWIDERSTAND ===
  wear_resistance_method: 'bohme',
  wear_resistance_class: 'A22',

  // === ROLLWIDERSTAND ===
  rwfc_class: 'RWFC350',

  // === VERFORMUNG ===
  indentation_class: 'IC10',
  heated_indicator: true,

  // === HAFTZUGFESTIGKEIT & SCHLAGFESTIGKEIT ===
  bond_strength_class: 'B1.5',
  impact_resistance_class: 'IR4',
  impact_resistance_nm: 10,

  // === OBERFLÄCHENHÄRTE ===
  surface_hardness_class: 'SH50',

  // === BRANDVERHALTEN ===
  fire_class: 'A1fl',
  smoke_class: 's1',

  // === VERWENDUNGSZWECK (JSONB) ===
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

  // === MATERIALZUSAMMENSETZUNG (JSONB) ===
  materials: {
    // Bindemittel
    binder_type: 'CT',
    binder_designation: 'CEM I 42,5 R nach EN 197-1',
    binder_amount_kg_m3: 320,
    binder_supplier: 'HeidelbergCement AG',
    binder_certificate: 'CE-1234-2025',

    // Lagerung
    batch_size_kg: 25,
    production_date: '2025-01-01',
    shelf_life_months: 12,
    storage_conditions: 'Trocken und kühl lagern',

    // Zuschläge
    aggregate_type: 'natural',
    aggregate_designation: 'Quarzsand 0/4 mm',
    aggregate_amount_kg_m3: 1800,
    aggregate_grading_curve: '0/4',
    aggregate_density_kg_m3: 2650,
    aggregate_moisture_percent: 2.5,

    // Zusatzmittel
    additives: [
      {
        type: 'plasticizer',
        designation: 'Superplasticizer XY',
        amount_percent: 1.2,
        supplier: 'BASF',
        function: 'Fließmittel'
      },
      {
        type: 'retarder',
        designation: 'Retarder Z',
        amount_percent: 0.3,
        supplier: 'Sika',
        function: 'Verzögerer'
      }
    ],

    // Fasern
    fibers: {
      type: 'synthetic',
      designation: 'PP-Fasern 6mm',
      amount_kg_m3: 0.9,
      length_mm: 6,
      supplier: 'FiberTech'
    },

    // Wasser
    water_cement_ratio: 0.45,
    water_amount_l_m3: 160,
    water_quality: 'Trinkwasserqualität',

    // Mischprozess
    mixing_time_min: 3,
    mixing_speed_rpm: 45,
    mixing_temperature_celsius: 20,
    consistency_class: 'F3',
    flow_diameter_mm: 180,

    // Zusätzliche Eigenschaften
    air_content_percent: 2.5,
    fresh_density_kg_m3: 2300,
    setting_time_initial_min: 180,
    setting_time_final_min: 360,
    workability_time_min: 30
  },

  // === ZUSÄTZLICHE EIGENSCHAFTEN (JSONB) ===
  additional_properties: {
    // Elastizität & Verformung
    elastic_modulus_class: 'E10',
    shrinkage_mm_m: 0.5,
    swelling_mm_m: 0.1,
    creep_coefficient: 2.0,

    // Thermische Eigenschaften
    thermal_conductivity_w_mk: 1.2,
    thermal_expansion_coefficient: 0.00001,
    specific_heat_capacity: 1000,

    // Elektrische Eigenschaften
    electrical_resistance_ohm_m: 100000,

    // Chemische Beständigkeit
    chemical_resistance: ['oil', 'acid', 'alkali'],

    // Umwelt & Gesundheit
    radioactivity_index: 0.5,
    dangerous_substances: ['Chromat-reduziert'],
    tvoc_emission: 250,
    formaldehyde_emission: 'E1'
  },

  // === QUALITÄTSKONTROLLE (JSONB) ===
  quality_control: {
    // Prüfhäufigkeiten
    test_frequency_fresh: 'per_batch',
    test_frequency_hardened: 'weekly',

    // Probenahme
    sample_size: '3 Würfel 150x150x150 mm',
    sample_location: 'Mischanlage Ausgang',
    retention_samples_months: 6,

    // Kalibrierung
    calibration_scales: 'monthly',
    calibration_mixers: 'quarterly',
    calibration_testing: 'jährlich nach DIN EN ISO/IEC 17025',

    // Toleranzen
    tolerance_binder_percent: 2,
    tolerance_water_percent: 3,
    tolerance_temperature_celsius: 2,
    tolerance_consistency_percent: 5,

    // Abweichungsmanagement
    deviation_minor: 'Nachjustierung und Dokumentation',
    deviation_major: 'Produktion stoppen, Charge prüfen',
    deviation_critical: 'Sofortiger Rückruf, Kundeninformation',

    // Annahmekriterien
    acceptance_criteria: 'Alle Werte innerhalb der deklarierten Klassen ±5%'
  },

  // === RÜCKVERFOLGBARKEIT (JSONB) ===
  traceability: {
    batch_linking_enabled: true,
    supplier_certificates: [
      {
        supplier: 'HeidelbergCement',
        material: 'CEM I 42,5 R',
        certificate_number: 'HC-2025-001',
        valid_until: '2025-12-31',
        file_url: '/certificates/cement-2025.pdf'
      }
    ],
    customer_deliveries_tracked: true
  },

  // === ITT PRÜFPLAN (JSONB) ===
  itt_test_plan: {
    required_tests: [
      {
        property: 'Druckfestigkeit',
        norm: 'EN 13892-2',
        test_age_days: 28,
        target_value: '≥ 25 N/mm²'
      },
      {
        property: 'Biegezugfestigkeit',
        norm: 'EN 13892-2',
        test_age_days: 28,
        target_value: '≥ 4 N/mm²'
      }
    ],
    test_laboratory: 'MPA Stuttgart',
    test_report_number: 'MPA-2025-ITT-001',
    test_report_date: '2025-01-15',
    test_report_file: '/reports/itt-2025.pdf'
  },

  // === ÄNDERUNGSHISTORIE (JSONB) ===
  change_log: [
    {
      version: '1.0.0',
      date: '2025-01-01',
      changes: ['Initiale Rezeptur erstellt'],
      requires_retest: false,
      approved_by: 'QM Manager'
    }
  ],

  // === NOTIZEN ===
  notes: 'Öffentliche Notizen für DoP',
  internal_notes: 'Interne Notizen - nicht für DoP'
}

async function testFieldMapping() {
  console.log('🧪 Testing Complete Recipe Field Mapping\n')
  console.log('=' .repeat(60))

  try {
    // 1. Insert complete test data
    console.log('\n📝 Inserting test recipe with all fields...')
    const { data: insertedRecipe, error: insertError } = await supabase
      .from('en13813_recipes')
      .insert(completeTestData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Insert failed:', insertError)
      return
    }

    console.log('✅ Recipe inserted successfully')
    console.log(`   ID: ${insertedRecipe.id}`)
    console.log(`   Code: ${insertedRecipe.recipe_code}`)

    // 2. Read back and verify each field
    console.log('\n🔍 Verifying field persistence...')
    const { data: readRecipe, error: readError } = await supabase
      .from('en13813_recipes')
      .select('*')
      .eq('id', insertedRecipe.id)
      .single()

    if (readError) {
      console.error('❌ Read failed:', readError)
      return
    }

    // 3. Compare fields
    console.log('\n📊 Field-by-field comparison:')
    console.log('-'.repeat(60))

    const results = {
      perfect: [],
      mismatch: [],
      missing: [],
      error: []
    }

    // Check each field
    for (const [key, expectedValue] of Object.entries(completeTestData)) {
      const actualValue = readRecipe[key]

      // Skip system fields
      if (['id', 'tenant_id', 'created_at', 'updated_at'].includes(key)) {
        continue
      }

      try {
        if (actualValue === undefined || actualValue === null) {
          results.missing.push(key)
          console.log(`❌ ${key}: NOT SAVED (field missing in response)`)
        } else if (typeof expectedValue === 'object') {
          // For objects/arrays, compare JSON
          const match = JSON.stringify(expectedValue) === JSON.stringify(actualValue)
          if (match) {
            results.perfect.push(key)
            console.log(`✅ ${key}: OK (complex field)`)
          } else {
            results.mismatch.push(key)
            console.log(`⚠️ ${key}: MISMATCH`)
            console.log(`   Expected: ${JSON.stringify(expectedValue).substring(0, 100)}`)
            console.log(`   Actual:   ${JSON.stringify(actualValue).substring(0, 100)}`)
          }
        } else {
          // For simple values
          if (expectedValue === actualValue) {
            results.perfect.push(key)
            console.log(`✅ ${key}: OK`)
          } else {
            results.mismatch.push(key)
            console.log(`⚠️ ${key}: MISMATCH`)
            console.log(`   Expected: ${expectedValue}`)
            console.log(`   Actual:   ${actualValue}`)
          }
        }
      } catch (err) {
        results.error.push(key)
        console.log(`❌ ${key}: ERROR - ${err.message}`)
      }
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📈 SUMMARY REPORT:')
    console.log('-'.repeat(60))
    console.log(`✅ Perfect matches:    ${results.perfect.length} fields`)
    console.log(`⚠️ Value mismatches:   ${results.mismatch.length} fields`)
    console.log(`❌ Missing fields:     ${results.missing.length} fields`)
    console.log(`🔥 Errors:            ${results.error.length} fields`)

    const totalFields = Object.keys(completeTestData).length
    const successRate = (results.perfect.length / totalFields * 100).toFixed(1)
    console.log(`\n📊 Success Rate: ${successRate}% (${results.perfect.length}/${totalFields})`)

    if (results.missing.length > 0) {
      console.log('\n❌ Missing fields (need database migration):')
      results.missing.forEach(f => console.log(`   - ${f}`))
    }

    if (results.mismatch.length > 0) {
      console.log('\n⚠️ Mismatched fields (check type conversion):')
      results.mismatch.forEach(f => console.log(`   - ${f}`))
    }

    // 5. Cleanup
    console.log('\n🧹 Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('en13813_recipes')
      .delete()
      .eq('id', insertedRecipe.id)

    if (deleteError) {
      console.error('⚠️ Cleanup failed:', deleteError)
    } else {
      console.log('✅ Test data cleaned up')
    }

    // 6. Final verdict
    console.log('\n' + '='.repeat(60))
    if (results.perfect.length === totalFields) {
      console.log('🎉 PERFECT! All fields are correctly mapped and saved!')
    } else if (successRate >= 90) {
      console.log('👍 GOOD! Most fields work correctly, minor issues to fix.')
    } else if (successRate >= 70) {
      console.log('⚠️ NEEDS WORK! Several fields have issues.')
    } else {
      console.log('❌ CRITICAL! Major field mapping problems detected.')
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Execute test
console.log('🚀 Starting Complete Field Mapping Test...\n')
testFieldMapping()
  .then(() => {
    console.log('\n✨ Test completed!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Test crashed:', err)
    process.exit(1)
  })