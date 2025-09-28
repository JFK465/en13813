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

// Extract fields from RecipeFormUltimate.tsx schema
const extractSchemaFields = () => {
  const formPath = join(__dirname, '../components/en13813/RecipeFormUltimate.tsx')
  const formContent = readFileSync(formPath, 'utf-8')

  // Extract all z.object fields
  const schemaMatch = formContent.match(/const ultimateRecipeSchema = z\.object\(\{([\s\S]*?)\}\)\.refine/m)
  if (!schemaMatch) {
    console.error('❌ Could not find schema in form file')
    return []
  }

  const schemaContent = schemaMatch[1]
  const fields = []

  // Extract field names
  const fieldMatches = schemaContent.matchAll(/^\s*(\w+):\s*z\./gm)
  for (const match of fieldMatches) {
    fields.push(match[1])
  }

  // Extract nested object fields
  const nestedMatches = schemaContent.matchAll(/(\w+):\s*z\.object\(\{([^}]+)\}/gm)
  for (const match of nestedMatches) {
    const parentField = match[1]
    const nestedContent = match[2]
    const nestedFieldMatches = nestedContent.matchAll(/(\w+):\s*z\./gm)
    for (const nestedMatch of nestedFieldMatches) {
      fields.push(`${parentField}.${nestedMatch[1]}`)
    }
  }

  return fields
}

// Get database table structure
const getDatabaseFields = async () => {
  try {
    // Get table info using raw SQL
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: 'en13813_recipes'
    })

    if (error) {
      // Fallback: query information_schema directly
      const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'en13813_recipes')

      if (colError) {
        console.error('❌ Could not fetch database schema:', colError)
        return []
      }
      return columns.map(c => c.column_name)
    }

    return data.map(c => c.column_name)
  } catch (err) {
    console.error('❌ Database connection error:', err)
    return []
  }
}

// Test field saving
const testFieldSaving = async (fieldName, testValue) => {
  const testId = `TEST_${Date.now()}`

  try {
    // Create test record
    const { data: created, error: createError } = await supabase
      .from('en13813_recipes')
      .insert({
        recipe_code: testId,
        name: 'Field Test',
        type: 'CT',
        compressive_strength_class: 'C16',
        flexural_strength_class: 'F3',
        test_age_days: 28,
        version: '1.0',
        status: 'draft',
        fire_class: 'A1fl',
        [fieldName]: testValue
      })
      .select()
      .single()

    if (createError) {
      return { field: fieldName, status: '❌ Insert failed', error: createError.message }
    }

    // Read back
    const { data: read, error: readError } = await supabase
      .from('en13813_recipes')
      .select(fieldName)
      .eq('recipe_code', testId)
      .single()

    if (readError) {
      return { field: fieldName, status: '❌ Read failed', error: readError.message }
    }

    // Cleanup
    await supabase
      .from('en13813_recipes')
      .delete()
      .eq('recipe_code', testId)

    const savedValue = read[fieldName]
    const matches = JSON.stringify(savedValue) === JSON.stringify(testValue)

    return {
      field: fieldName,
      status: matches ? '✅ OK' : '⚠️ Value mismatch',
      expected: testValue,
      received: savedValue
    }
  } catch (err) {
    return { field: fieldName, status: '❌ Error', error: err.message }
  }
}

// Main verification function
const verifyRecipeFields = async () => {
  console.log('🔍 Recipe Field Verification Report\n')
  console.log('=' .repeat(50))

  // 1. Extract fields from form schema
  console.log('\n📋 Extracting fields from RecipeFormUltimate.tsx...')
  const schemaFields = extractSchemaFields()
  console.log(`Found ${schemaFields.length} fields in form schema`)

  // 2. Get database fields
  console.log('\n🗄️ Fetching database schema...')
  const dbFields = await getDatabaseFields()
  console.log(`Found ${dbFields.length} columns in database`)

  // 3. Compare fields
  console.log('\n📊 Field Comparison:')
  console.log('-'.repeat(50))

  const missingInDb = schemaFields.filter(f => !dbFields.includes(f))
  const missingInForm = dbFields.filter(f =>
    !schemaFields.includes(f) &&
    !['id', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'].includes(f)
  )

  if (missingInDb.length > 0) {
    console.log('\n❌ Fields in form but NOT in database:')
    missingInDb.forEach(f => console.log(`  - ${f}`))
  }

  if (missingInForm.length > 0) {
    console.log('\n⚠️ Fields in database but NOT in form:')
    missingInForm.forEach(f => console.log(`  - ${f}`))
  }

  // 4. Test field saving (sample fields)
  console.log('\n🧪 Testing field persistence:')
  console.log('-'.repeat(50))

  const testFields = [
    { field: 'manufacturer_name', value: 'Test GmbH' },
    { field: 'wear_resistance_class', value: 'A22' },
    { field: 'rwfc_class', value: 'RWFC350' },
    { field: 'surface_hardness_class', value: 'SH50' },
    { field: 'bond_strength_class', value: 'B1.5' },
    { field: 'impact_resistance_nm', value: 10 },
    { field: 'materials', value: { binder_type: 'CT', binder_amount_kg_m3: 320 } },
    { field: 'intended_use', value: { wearing_surface: true, heated_screed: true } },
    { field: 'quality_control', value: { test_frequency_fresh: 'daily' } },
    { field: 'additional_properties', value: { elastic_modulus_class: 'E10' } }
  ]

  for (const test of testFields) {
    const result = await testFieldSaving(test.field, test.value)
    console.log(`${result.status} ${result.field}`)
    if (result.error) {
      console.log(`    Error: ${result.error}`)
    }
    if (result.expected && !result.error && result.status.includes('mismatch')) {
      console.log(`    Expected: ${JSON.stringify(result.expected)}`)
      console.log(`    Received: ${JSON.stringify(result.received)}`)
    }
  }

  // 5. Summary
  console.log('\n' + '='.repeat(50))
  console.log('📈 Summary:')
  console.log(`  Total form fields: ${schemaFields.length}`)
  console.log(`  Total DB columns: ${dbFields.length}`)
  console.log(`  Missing in DB: ${missingInDb.length}`)
  console.log(`  Missing in Form: ${missingInForm.length}`)

  if (missingInDb.length === 0 && missingInForm.length === 0) {
    console.log('\n✅ Perfect match! All fields are synchronized.')
  } else {
    console.log('\n⚠️ Discrepancies found. Review the report above.')
  }
}

// Create RPC function if it doesn't exist
const createHelperFunction = async () => {
  const functionSql = `
    CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
    RETURNS TABLE (
      column_name text,
      data_type text,
      is_nullable text
    )
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
      SELECT
        column_name::text,
        data_type::text,
        is_nullable::text
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position;
    $$;
  `

  try {
    await supabase.rpc('exec_sql', { sql: functionSql })
  } catch (err) {
    // Function might already exist or exec_sql might not be available
    console.log('Note: Could not create helper function (might already exist)')
  }
}

// Run verification
console.log('🚀 Starting Recipe Field Verification...\n')
await createHelperFunction()
await verifyRecipeFields()
  .then(() => {
    console.log('\n✨ Verification complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Verification failed:', err)
    process.exit(1)
  })