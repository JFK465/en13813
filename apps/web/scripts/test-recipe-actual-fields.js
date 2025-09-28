#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Parse form fields from RecipeFormUltimate.tsx
function getFormFields() {
  const formPath = join(__dirname, '../components/en13813/RecipeFormUltimate.tsx')
  const content = readFileSync(formPath, 'utf-8')

  const fields = new Set()

  // Extract from schema
  const schemaMatches = content.matchAll(/(\w+):\s*z\.(string|number|boolean|enum|object|array)/gm)
  for (const match of schemaMatches) {
    fields.add(match[1])
  }

  // Extract from form field names
  const fieldNameMatches = content.matchAll(/name="([^"]+)"/gm)
  for (const match of fieldNameMatches) {
    const fieldName = match[1].split('.')[0] // Get root field name
    fields.add(fieldName)
  }

  return Array.from(fields)
}

async function testActualDatabase() {
  const results = {
    formFields: [],
    dbFields: [],
    working: [],
    notWorking: [],
    report: []
  }

  console.log('🔬 EN13813 Recipe Fields - Actual Database Test\n')
  console.log('=' .repeat(70))

  // 1. Get form fields
  console.log('\n📋 Extracting fields from RecipeFormUltimate.tsx...')
  results.formFields = getFormFields()
  console.log(`Found ${results.formFields.length} unique fields in form`)

  // 2. Test what actually works
  console.log('\n🧪 Testing field availability in database...')

  // Start with absolute minimum including required fields
  const baseData = {
    recipe_code: `TEST_${Date.now()}`,
    name: 'Field Test Recipe',
    binder_type: 'CT',  // Seems to be required
    compressive_strength_class: 'C16',  // Might be required
    flexural_strength_class: 'F3'  // Might be required
  }

  // Try to insert base record
  const { data: baseInsert, error: baseError } = await supabase
    .from('en13813_recipes')
    .insert(baseData)
    .select()
    .single()

  if (baseError) {
    console.log('❌ Could not create base record:', baseError.message)
    results.report.push({
      status: 'CRITICAL',
      message: 'Cannot insert even minimal data',
      error: baseError.message
    })
    return results
  }

  console.log('✅ Base record created successfully')
  results.dbFields = Object.keys(baseInsert)
  console.log(`Database returned ${results.dbFields.length} fields`)

  // 3. Test each form field
  console.log('\n📝 Testing individual field updates...')

  const testValues = {
    // Text fields
    description: 'Test description',
    manufacturer_name: 'Test GmbH',
    manufacturer_address: 'Test Street 123',
    product_name: 'Test Product',
    type: 'CT',
    version: '1.0.0',
    status: 'draft',
    approved_by: 'Test Manager',
    notes: 'Test notes',
    internal_notes: 'Internal test notes',

    // Enum/class fields
    compressive_strength_class: 'C25',
    flexural_strength_class: 'F4',
    wear_resistance_method: 'bohme',
    wear_resistance_class: 'A22',
    surface_hardness_class: 'SH50',
    bond_strength_class: 'B1.5',
    impact_resistance_class: 'IR4',
    indentation_class: 'IC10',
    rwfc_class: 'RWFC350',
    avcp_system: '4',
    fire_class: 'A1fl',
    smoke_class: 's1',
    notified_body_number: '1234',

    // Numeric fields
    test_age_days: 28,
    impact_resistance_nm: 10,

    // Boolean fields
    early_strength: true,
    heated_indicator: true,

    // Date fields
    approved_at: new Date().toISOString(),

    // JSONB fields
    intended_use: {
      wearing_surface: true,
      heated_screed: true,
      outdoor_use: true
    },
    materials: {
      binder_type: 'CT',
      binder_amount_kg_m3: 320,
      water_cement_ratio: 0.45
    },
    quality_control: {
      test_frequency_fresh: 'daily',
      retention_samples_months: 6
    },
    additional_properties: {
      elastic_modulus_class: 'E10',
      thermal_conductivity_w_mk: 1.2
    },
    traceability: {
      batch_linking_enabled: true
    },
    itt_test_plan: {
      test_laboratory: 'MPA Stuttgart'
    },
    change_log: [
      { version: '1.0.0', date: '2025-01-01', changes: ['Initial'] }
    ]
  }

  for (const [field, value] of Object.entries(testValues)) {
    try {
      const { error: updateError } = await supabase
        .from('en13813_recipes')
        .update({ [field]: value })
        .eq('id', baseInsert.id)

      if (updateError) {
        results.notWorking.push(field)
        console.log(`❌ ${field}: ${updateError.message.substring(0, 50)}`)
      } else {
        // Verify it was saved
        const { data: verify, error: verifyError } = await supabase
          .from('en13813_recipes')
          .select(field)
          .eq('id', baseInsert.id)
          .single()

        if (verifyError || !verify) {
          results.notWorking.push(field)
          console.log(`⚠️ ${field}: Update succeeded but cannot verify`)
        } else {
          const saved = JSON.stringify(verify[field]) === JSON.stringify(value)
          if (saved) {
            results.working.push(field)
            console.log(`✅ ${field}: Working`)
          } else {
            results.notWorking.push(field)
            console.log(`⚠️ ${field}: Saved but value mismatch`)
          }
        }
      }
    } catch (err) {
      results.notWorking.push(field)
      console.log(`❌ ${field}: Error - ${err.message}`)
    }
  }

  // Cleanup
  await supabase
    .from('en13813_recipes')
    .delete()
    .eq('id', baseInsert.id)

  // 4. Generate comprehensive report
  console.log('\n' + '=' .repeat(70))
  console.log('📊 COMPREHENSIVE TEST RESULTS')
  console.log('=' .repeat(70))

  const formOnlyFields = results.formFields.filter(f =>
    !results.working.includes(f) &&
    !results.notWorking.includes(f) &&
    !['id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(f)
  )

  results.report = {
    summary: {
      totalFormFields: results.formFields.length,
      totalDbFields: results.dbFields.length,
      workingFields: results.working.length,
      notWorkingFields: results.notWorking.length,
      untestedFields: formOnlyFields.length,
      successRate: ((results.working.length / Object.keys(testValues).length) * 100).toFixed(1)
    },
    details: {
      working: results.working.sort(),
      notWorking: results.notWorking.sort(),
      dbOnly: results.dbFields.filter(f => !results.formFields.includes(f)).sort(),
      formOnly: formOnlyFields.sort()
    }
  }

  console.log('\n📈 Summary:')
  console.log(`  Form fields: ${results.report.summary.totalFormFields}`)
  console.log(`  DB fields: ${results.report.summary.totalDbFields}`)
  console.log(`  Working: ${results.report.summary.workingFields}`)
  console.log(`  Not working: ${results.report.summary.notWorkingFields}`)
  console.log(`  Success rate: ${results.report.summary.successRate}%`)

  if (results.report.details.notWorking.length > 0) {
    console.log('\n❌ Fields NOT working (need database migration):')
    results.report.details.notWorking.forEach(f => console.log(`  - ${f}`))
  }

  if (results.report.details.formOnly.length > 0) {
    console.log('\n⚠️ Fields in form but not tested:')
    results.report.details.formOnly.slice(0, 10).forEach(f => console.log(`  - ${f}`))
    if (results.report.details.formOnly.length > 10) {
      console.log(`  ... and ${results.report.details.formOnly.length - 10} more`)
    }
  }

  return results.report
}

// Execute test
console.log('🚀 Starting Actual Database Field Test\n')
testActualDatabase()
  .then(async (report) => {
    // Save report to file
    const reportPath = join(__dirname, '../test-results/recipe-field-report.json')
    const fs = await import('fs')
    const dir = dirname(reportPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Full report saved to: ${reportPath}`)

    console.log('\n✨ Test completed!')
    process.exit(report.summary?.successRate === '100.0' ? 0 : 1)
  })
  .catch(err => {
    console.error('\n❌ Test crashed:', err)
    process.exit(1)
  })