const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

async function fixRecipeSchema() {
  console.log('🔧 Fixing EN13813 Recipe Schema...\n')

  try {
    // First, try to create a recipe with minimal fields that should work
    console.log('1. Testing minimal recipe creation...')
    const minimalRecipe = {
      recipe_code: 'TEST-MIN-' + Date.now(),
      name: 'Minimal Test Recipe',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4'
    }

    const { data: minData, error: minError } = await supabase
      .from('en13813_recipes')
      .insert(minimalRecipe)
      .select()
      .single()

    if (minError) {
      console.error('❌ Minimal recipe creation failed:', minError.message)

      // If even minimal recipe fails, there's a bigger problem
      if (minError.message.includes('Could not find')) {
        console.log('\n⚠️ The table is missing essential columns.')
      }
    } else {
      console.log('✅ Minimal recipe created:', minData.id)

      // Clean up
      await supabase.from('en13813_recipes').delete().eq('id', minData.id)
    }

    // Now test with the new fields
    console.log('\n2. Testing recipe with EN13813 norm fields...')
    const normRecipe = {
      recipe_code: 'TEST-NORM-' + Date.now(),
      name: 'Norm Test Recipe',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      // These are the fields we need to add
      description: 'Test description for EN13813 compliance',
      manufacturer_name: 'Test Manufacturer GmbH',
      manufacturer_address: 'Teststraße 123, 12345 Teststadt',
      product_name: 'TestProduct Pro 2000'
    }

    const { data: normData, error: normError } = await supabase
      .from('en13813_recipes')
      .insert(normRecipe)
      .select()
      .single()

    if (normError) {
      if (normError.message.includes('manufacturer_name')) {
        console.error('❌ Manufacturer fields are missing')
        console.log('\n📋 Required SQL to fix this:')
        console.log('------------------------------------')
        console.log(`
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS manufacturer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS manufacturer_address TEXT,
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT;
        `)
        console.log('------------------------------------')
      } else {
        console.error('❌ Recipe with norm fields failed:', normError.message)
      }
    } else {
      console.log('✅ Recipe with norm fields created:', normData.id)
      await supabase.from('en13813_recipes').delete().eq('id', normData.id)
    }

    // Test with advanced fields
    console.log('\n3. Testing recipe with advanced EN13813 fields...')
    const advancedRecipe = {
      recipe_code: 'TEST-ADV-' + Date.now(),
      name: 'Advanced Test Recipe',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      description: 'Advanced test',
      manufacturer_name: 'Test GmbH',
      manufacturer_address: 'Test Address',
      product_name: 'Test Product',
      // Advanced fields
      avcp_system: '4',
      wear_resistance_method: 'bohme',
      wear_resistance_class: 'A22',
      fire_class: 'A1fl',
      status: 'draft',
      intended_use: {
        wearing_surface: true,
        with_flooring: false
      }
    }

    const { data: advData, error: advError } = await supabase
      .from('en13813_recipes')
      .insert(advancedRecipe)
      .select()
      .single()

    if (advError) {
      if (advError.message.includes('avcp_system')) {
        console.error('❌ AVCP and advanced fields are missing')
        console.log('\n📋 You need to run the full migration from:')
        console.log('supabase/migrations/20250928_add_missing_columns.sql')
      } else {
        console.error('❌ Advanced recipe failed:', advError.message)
      }
    } else {
      console.log('✅ Advanced recipe created successfully!')
      console.log('   All EN13813 fields are working correctly.')
      await supabase.from('en13813_recipes').delete().eq('id', advData.id)
    }

    // Check existing recipes
    console.log('\n4. Checking existing recipes...')
    const { data: recipes, error: fetchError } = await supabase
      .from('en13813_recipes')
      .select('id, name, recipe_code, created_at')
      .limit(5)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching recipes:', fetchError)
    } else {
      console.log(`✅ Found ${recipes?.length || 0} existing recipes`)
      if (recipes && recipes.length > 0) {
        recipes.forEach(r => {
          console.log(`   - ${r.recipe_code}: ${r.name}`)
        })
      }
    }

    console.log('\n✨ Schema check complete!')
    console.log('\nNext steps:')
    console.log('1. If you see missing column errors above, apply the migration via Supabase Dashboard')
    console.log('2. Go to: https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/sql/new')
    console.log('3. Run the SQL from: supabase/migrations/20250928_add_missing_columns.sql')
    console.log('4. Then re-run this script to verify everything works')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

fixRecipeSchema()