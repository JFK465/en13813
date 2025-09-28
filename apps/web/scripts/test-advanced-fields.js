const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAdvancedFields() {
  console.log('🧪 Testing Advanced EN13813 Fields...\n')

  const results = {
    basic: false,
    withDescription: false,
    withWearResistance: false,
    withAVCP: false,
    withIntendedUse: false,
    withAllFields: false
  }

  try {
    // Test 1: Basic recipe (confirmed working)
    console.log('1. Creating basic recipe (should work)...')
    const basicRecipe = {
      recipe_code: 'BASIC-' + Date.now(),
      name: 'Basic Recipe',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      product_name: 'Basic Product',
      manufacturer_name: 'Basic Manufacturer',
      manufacturer_address: 'Basic Address',
      fire_class: 'A1fl'
    }

    const { data: basic, error: basicError } = await supabase
      .from('en13813_recipes')
      .insert(basicRecipe)
      .select()
      .single()

    if (!basicError) {
      results.basic = true
      console.log('✅ Basic recipe works')
      await supabase.from('en13813_recipes').delete().eq('id', basic.id)
    } else {
      console.error('❌ Basic recipe failed:', basicError.message)
    }

    // Test 2: With description field
    console.log('\n2. Testing with description field...')
    const withDesc = { ...basicRecipe,
      recipe_code: 'DESC-' + Date.now(),
      description: 'EN13813 compliant screed material'
    }

    const { data: desc, error: descError } = await supabase
      .from('en13813_recipes')
      .insert(withDesc)
      .select()
      .single()

    if (!descError) {
      results.withDescription = true
      console.log('✅ Description field works')
      await supabase.from('en13813_recipes').delete().eq('id', desc.id)
    } else {
      console.error('❌ Description field not working:', descError.message)
    }

    // Test 3: With wear resistance fields
    console.log('\n3. Testing wear resistance fields...')
    const withWear = { ...basicRecipe,
      recipe_code: 'WEAR-' + Date.now(),
      wear_resistance_method: 'bohme',
      wear_resistance_class: 'A22'
    }

    const { data: wear, error: wearError } = await supabase
      .from('en13813_recipes')
      .insert(withWear)
      .select()
      .single()

    if (!wearError) {
      results.withWearResistance = true
      console.log('✅ Wear resistance fields work')
      await supabase.from('en13813_recipes').delete().eq('id', wear.id)
    } else {
      if (wearError.message.includes('Could not find')) {
        console.error('❌ Wear resistance columns missing')
      } else {
        console.error('❌ Wear resistance error:', wearError.message)
      }
    }

    // Test 4: With AVCP system
    console.log('\n4. Testing AVCP system field...')
    const withAVCP = { ...basicRecipe,
      recipe_code: 'AVCP-' + Date.now(),
      avcp_system: '4'
    }

    const { data: avcp, error: avcpError } = await supabase
      .from('en13813_recipes')
      .insert(withAVCP)
      .select()
      .single()

    if (!avcpError) {
      results.withAVCP = true
      console.log('✅ AVCP system field works')
      await supabase.from('en13813_recipes').delete().eq('id', avcp.id)
    } else {
      if (avcpError.message.includes('Could not find')) {
        console.error('❌ AVCP system column missing')
      } else {
        console.error('❌ AVCP system error:', avcpError.message)
      }
    }

    // Test 5: With intended use JSONB
    console.log('\n5. Testing intended use field...')
    const withIntended = { ...basicRecipe,
      recipe_code: 'INTENDED-' + Date.now(),
      intended_use: {
        wearing_surface: true,
        with_flooring: false,
        heated_screed: false,
        indoor_only: true
      }
    }

    const { data: intended, error: intendedError } = await supabase
      .from('en13813_recipes')
      .insert(withIntended)
      .select()
      .single()

    if (!intendedError) {
      results.withIntendedUse = true
      console.log('✅ Intended use field works')
      await supabase.from('en13813_recipes').delete().eq('id', intended.id)
    } else {
      if (intendedError.message.includes('Could not find')) {
        console.error('❌ Intended use column missing')
      } else {
        console.error('❌ Intended use error:', intendedError.message)
      }
    }

    // Test 6: Complete recipe with all fields
    console.log('\n6. Testing complete EN13813 recipe...')
    const completeRecipe = {
      recipe_code: 'COMPLETE-' + Date.now(),
      name: 'Complete EN13813 Recipe',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      product_name: 'EstrichPro 2000',
      manufacturer_name: 'Deutsche Estrichwerke GmbH',
      manufacturer_address: 'Industriestraße 42, 80331 München',
      description: 'Hochwertiger Zementestrich für industrielle Anwendungen',
      fire_class: 'A1fl',
      wear_resistance_method: 'bohme',
      wear_resistance_class: 'A22',
      surface_hardness_class: 'SH30',
      avcp_system: '4',
      status: 'draft',
      intended_use: {
        wearing_surface: true,
        with_flooring: false
      }
    }

    const { data: complete, error: completeError } = await supabase
      .from('en13813_recipes')
      .insert(completeRecipe)
      .select()
      .single()

    if (!completeError) {
      results.withAllFields = true
      console.log('✅ Complete EN13813 recipe works!')
      console.log('   All norm-relevant fields are functional')
      await supabase.from('en13813_recipes').delete().eq('id', complete.id)
    } else {
      console.error('❌ Complete recipe failed:', completeError.message)
    }

    // Summary
    console.log('\n📊 Test Results Summary:')
    console.log('✅ Basic fields:', results.basic ? 'Working' : 'Failed')
    console.log(results.withDescription ? '✅' : '❌', 'Description field:', results.withDescription ? 'Working' : 'Missing/Failed')
    console.log(results.withWearResistance ? '✅' : '❌', 'Wear resistance:', results.withWearResistance ? 'Working' : 'Missing')
    console.log(results.withAVCP ? '✅' : '❌', 'AVCP system:', results.withAVCP ? 'Working' : 'Missing')
    console.log(results.withIntendedUse ? '✅' : '❌', 'Intended use:', results.withIntendedUse ? 'Working' : 'Missing')
    console.log(results.withAllFields ? '✅' : '❌', 'Complete recipe:', results.withAllFields ? 'Working' : 'Failed')

    const missingFeatures = []
    if (!results.withWearResistance) missingFeatures.push('wear resistance')
    if (!results.withAVCP) missingFeatures.push('AVCP system')
    if (!results.withIntendedUse) missingFeatures.push('intended use')

    if (missingFeatures.length > 0) {
      console.log('\n⚠️ Missing EN13813 features:', missingFeatures.join(', '))
      console.log('\n📝 To add missing features, run this SQL in Supabase Dashboard:')
      console.log('https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/sql/new')
      console.log('\nUse: supabase/migrations/20250928_fix_all_recipe_issues.sql')
    } else {
      console.log('\n🎉 All EN13813 features are working correctly!')
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testAdvancedFields()