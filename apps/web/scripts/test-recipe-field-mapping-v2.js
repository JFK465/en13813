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

// Test data based on actual database columns
const testData = {
  // === REQUIRED FIELDS ===
  recipe_code: `TEST_${Date.now()}`,
  name: 'Complete Field Test Recipe',
  type: 'CT',
  compressive_strength_class: 'C25',
  flexural_strength_class: 'F4',
  test_age_days: 28,
  version: '1.0.0',

  // === OPTIONAL TEXT FIELDS ===
  description: 'Test description for all fields',
  manufacturer_name: 'Test Manufacturer GmbH',
  manufacturer_address: 'Test Street 123, 12345 Test City',
  product_name: 'Test Product Pro 2000',

  // === COMPLIANCE FIELDS ===
  avcp_system: '4',
  notified_body_number: '1234',
  status: 'draft',
  fire_class: 'A1fl',

  // === STRENGTH & RESISTANCE CLASSES ===
  wear_resistance_method: 'bohme',
  wear_resistance_class: 'A22',
  surface_hardness_class: 'SH50',
  bond_strength_class: 'B1.5',
  impact_resistance_class: 'IR4',
  indentation_class: 'IC10',
  rwfc_class: 'RWFC350',

  // === JSONB FIELD ===
  intended_use: {
    wearing_surface: true,
    with_flooring: false,
    heated_screed: true,
    indoor_only: false,
    outdoor_use: true,
    wet_areas: true,
    industrial_use: true,
    chemical_resistance: true
  }
}

// Fields that might be JSONB (need to check)
const possibleJsonbFields = [
  'materials',
  'quality_control',
  'traceability',
  'itt_test_plan',
  'change_log',
  'additional_properties'
]

const extendedTestData = {
  materials: {
    binder_type: 'CT',
    binder_designation: 'CEM I 42,5 R',
    binder_amount_kg_m3: 320,
    aggregate_type: 'natural',
    water_cement_ratio: 0.45
  },
  quality_control: {
    test_frequency_fresh: 'daily',
    test_frequency_hardened: 'weekly',
    retention_samples_months: 6
  }
}

async function getTableColumns() {
  try {
    // Query to get column information
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'en13813_recipes'
        ORDER BY ordinal_position;
      `
    })

    if (error) {
      // Fallback: Try direct query
      const { data: fallback } = await supabase
        .from('en13813_recipes')
        .select()
        .limit(0)

      if (fallback !== null) {
        return Object.keys(fallback[0] || {})
      }
    }

    return data ? data.map(col => col.column_name) : []
  } catch (err) {
    console.log('⚠️ Could not fetch table structure directly')
    return null
  }
}

async function testFieldMapping() {
  const startTime = Date.now()
  const results = {
    tested: [],
    successful: [],
    failed: [],
    missing: [],
    warnings: []
  }

  console.log('🧪 Recipe Field Mapping Test v2.0\n')
  console.log('=' .repeat(70))

  // 1. Get actual database columns
  console.log('\n📋 Fetching database schema...')
  const dbColumns = await getTableColumns()

  if (dbColumns) {
    console.log(`✅ Found ${dbColumns.length} columns in database`)
  } else {
    console.log('⚠️ Could not fetch schema, will test dynamically')
  }

  // 2. Test basic required fields first
  console.log('\n🔬 Testing basic field insertion...')

  try {
    const { data: basicInsert, error: basicError } = await supabase
      .from('en13813_recipes')
      .insert(testData)
      .select()
      .single()

    if (basicError) {
      console.error('❌ Basic insertion failed:', basicError.message)

      // Try with minimal required fields only
      const minimalData = {
        recipe_code: testData.recipe_code,
        name: testData.name,
        type: testData.type,
        compressive_strength_class: testData.compressive_strength_class,
        flexural_strength_class: testData.flexural_strength_class,
        test_age_days: testData.test_age_days,
        version: testData.version,
        status: 'draft',
        fire_class: 'A1fl'
      }

      console.log('\n🔧 Retrying with minimal required fields...')
      const { data: minimalInsert, error: minimalError } = await supabase
        .from('en13813_recipes')
        .insert(minimalData)
        .select()
        .single()

      if (minimalError) {
        console.error('❌ Even minimal insertion failed:', minimalError.message)
        return
      }

      console.log('✅ Minimal insertion successful')

      // Now test updating with additional fields
      console.log('\n📝 Testing field updates...')

      for (const [field, value] of Object.entries(testData)) {
        if (minimalData[field]) continue // Skip already tested fields

        results.tested.push(field)

        try {
          const { error: updateError } = await supabase
            .from('en13813_recipes')
            .update({ [field]: value })
            .eq('id', minimalInsert.id)

          if (updateError) {
            if (updateError.message.includes('column')) {
              results.missing.push(field)
              console.log(`❌ ${field}: Column does not exist`)
            } else {
              results.failed.push(field)
              console.log(`⚠️ ${field}: Update failed - ${updateError.message}`)
            }
          } else {
            // Verify the value was saved
            const { data: verify } = await supabase
              .from('en13813_recipes')
              .select(field)
              .eq('id', minimalInsert.id)
              .single()

            if (JSON.stringify(verify[field]) === JSON.stringify(value)) {
              results.successful.push(field)
              console.log(`✅ ${field}: Saved successfully`)
            } else {
              results.warnings.push(field)
              console.log(`⚠️ ${field}: Saved but value mismatch`)
            }
          }
        } catch (err) {
          results.failed.push(field)
          console.log(`❌ ${field}: Error - ${err.message}`)
        }
      }

      // Test extended JSONB fields
      console.log('\n🔍 Testing potential JSONB fields...')

      for (const [field, value] of Object.entries(extendedTestData)) {
        results.tested.push(field)

        try {
          const { error } = await supabase
            .from('en13813_recipes')
            .update({ [field]: value })
            .eq('id', minimalInsert.id)

          if (error) {
            if (error.message.includes('column')) {
              results.missing.push(field)
              console.log(`❌ ${field}: Column does not exist`)
            } else {
              results.failed.push(field)
              console.log(`⚠️ ${field}: Failed - ${error.message}`)
            }
          } else {
            results.successful.push(field)
            console.log(`✅ ${field}: JSONB field works`)
          }
        } catch (err) {
          results.failed.push(field)
          console.log(`❌ ${field}: Error - ${err.message}`)
        }
      }

      // Cleanup
      await supabase
        .from('en13813_recipes')
        .delete()
        .eq('id', minimalInsert.id)

    } else {
      console.log('✅ Full insertion successful!')
      console.log(`   Recipe ID: ${basicInsert.id}`)

      // Verify all fields
      console.log('\n🔍 Verifying field persistence...')

      for (const [field, expectedValue] of Object.entries(testData)) {
        results.tested.push(field)
        const actualValue = basicInsert[field]

        if (actualValue === undefined) {
          results.missing.push(field)
          console.log(`❌ ${field}: Not returned from database`)
        } else if (JSON.stringify(actualValue) === JSON.stringify(expectedValue)) {
          results.successful.push(field)
          console.log(`✅ ${field}: Perfectly saved`)
        } else {
          results.warnings.push(field)
          console.log(`⚠️ ${field}: Value mismatch`)
          console.log(`   Expected: ${JSON.stringify(expectedValue)}`)
          console.log(`   Actual:   ${JSON.stringify(actualValue)}`)
        }
      }

      // Cleanup
      await supabase
        .from('en13813_recipes')
        .delete()
        .eq('id', basicInsert.id)
    }

  } catch (error) {
    console.error('❌ Critical error:', error.message)
  }

  // Generate summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('\n' + '=' .repeat(70))
  console.log('📊 TEST SUMMARY')
  console.log('=' .repeat(70))
  console.log(`⏱️ Test Duration: ${duration} seconds`)
  console.log(`📝 Total Fields Tested: ${results.tested.length}`)
  console.log(`✅ Successfully Saved: ${results.successful.length}`)
  console.log(`⚠️ Warnings: ${results.warnings.length}`)
  console.log(`❌ Failed: ${results.failed.length}`)
  console.log(`🚫 Missing Columns: ${results.missing.length}`)

  const successRate = ((results.successful.length / results.tested.length) * 100).toFixed(1)
  console.log(`\n📈 Success Rate: ${successRate}%`)

  if (results.missing.length > 0) {
    console.log('\n🚫 Missing Database Columns:')
    results.missing.forEach(field => console.log(`   - ${field}`))
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Fields:')
    results.failed.forEach(field => console.log(`   - ${field}`))
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️ Fields with Warnings:')
    results.warnings.forEach(field => console.log(`   - ${field}`))
  }

  // Final verdict
  console.log('\n' + '=' .repeat(70))
  if (successRate === '100.0') {
    console.log('🎉 PERFECT! All fields are working correctly!')
  } else if (parseFloat(successRate) >= 80) {
    console.log('👍 GOOD! Most fields are working, minor issues to fix.')
  } else if (parseFloat(successRate) >= 60) {
    console.log('⚠️ NEEDS ATTENTION! Several fields need to be fixed.')
  } else {
    console.log('❌ CRITICAL! Major database schema issues detected.')
  }

  return results
}

// Execute test
console.log('🚀 Starting Recipe Field Mapping Test v2.0\n')
testFieldMapping()
  .then((results) => {
    console.log('\n✨ Test completed!')
    process.exit(results.failed.length > 0 ? 1 : 0)
  })
  .catch(err => {
    console.error('\n❌ Test crashed:', err)
    process.exit(1)
  })