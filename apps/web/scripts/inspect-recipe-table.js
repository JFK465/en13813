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

async function inspectTable() {
  console.log('🔍 Inspecting en13813_recipes table structure\n')
  console.log('=' .repeat(60))

  // 1. Try to get a sample record
  console.log('\n📋 Attempting to fetch existing records...')
  const { data: samples, error: sampleError } = await supabase
    .from('en13813_recipes')
    .select('*')
    .limit(1)

  if (sampleError) {
    console.log('❌ Error fetching records:', sampleError.message)
  } else if (samples && samples.length > 0) {
    console.log('✅ Found sample record with columns:')
    const columns = Object.keys(samples[0])
    columns.forEach(col => {
      const value = samples[0][col]
      const type = value === null ? 'null' : typeof value === 'object' ? 'object/jsonb' : typeof value
      console.log(`   - ${col} (${type})`)
    })
  } else {
    console.log('ℹ️ Table exists but is empty')
  }

  // 2. Try minimal insert to see what's required
  console.log('\n🧪 Testing minimal insert requirements...')
  const minimalTest = {
    recipe_code: `INSPECT_${Date.now()}`,
    name: 'Inspection Test',
    type: 'CT',
    version: '1.0',
    compressive_strength_class: 'C25',
    flexural_strength_class: 'F4'
  }

  const { data: insertTest, error: insertError } = await supabase
    .from('en13813_recipes')
    .insert(minimalTest)
    .select()
    .single()

  if (insertError) {
    console.log('❌ Minimal insert failed:', insertError.message)

    // Try even more minimal
    const ultraMinimal = {
      recipe_code: `INSPECT2_${Date.now()}`,
      name: 'Test',
      type: 'CT'
    }

    const { data: ultraTest, error: ultraError } = await supabase
      .from('en13813_recipes')
      .insert(ultraMinimal)
      .select()
      .single()

    if (ultraError) {
      console.log('❌ Ultra-minimal insert also failed:', ultraError.message)
    } else {
      console.log('✅ Ultra-minimal insert worked!')
      console.log('   Available columns:', Object.keys(ultraTest))

      // Cleanup
      await supabase
        .from('en13813_recipes')
        .delete()
        .eq('id', ultraTest.id)
    }
  } else {
    console.log('✅ Minimal insert successful!')
    console.log('   Returned columns:', Object.keys(insertTest))

    // Cleanup
    await supabase
      .from('en13813_recipes')
      .delete()
      .eq('id', insertTest.id)
  }

  // 3. List all possible fields based on form
  console.log('\n📊 Fields expected from RecipeFormUltimate.tsx:')
  const expectedFields = [
    // Basic
    'recipe_code', 'name', 'description', 'type',
    // Manufacturer
    'manufacturer_name', 'manufacturer_address', 'product_name',
    // Compliance
    'avcp_system', 'notified_body_number',
    // Version
    'version', 'status', 'approved_by', 'approved_at',
    // Mechanical
    'compressive_strength_class', 'flexural_strength_class', 'test_age_days', 'early_strength',
    // Resistance
    'wear_resistance_method', 'wear_resistance_class',
    // Additional classes
    'rwfc_class', 'indentation_class', 'heated_indicator',
    'bond_strength_class', 'impact_resistance_class', 'impact_resistance_nm',
    'surface_hardness_class',
    // Fire
    'fire_class', 'smoke_class',
    // JSONB fields
    'intended_use', 'materials', 'additional_properties',
    'quality_control', 'traceability', 'itt_test_plan', 'change_log',
    // Notes
    'notes', 'internal_notes'
  ]

  console.log(`\nTotal expected fields: ${expectedFields.length}`)
  expectedFields.forEach(field => console.log(`   - ${field}`))
}

// Run inspection
console.log('🚀 Starting Recipe Table Inspection\n')
inspectTable()
  .then(() => {
    console.log('\n✨ Inspection complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Inspection failed:', err)
    process.exit(1)
  })