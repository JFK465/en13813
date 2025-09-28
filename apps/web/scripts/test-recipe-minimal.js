const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testMinimalRecipe() {
  console.log('🧪 Testing Minimal Recipe Creation with Current Schema...\n')

  try {
    // First, let's see what we can fetch
    console.log('1. Testing if we can fetch recipes...')
    const { data: existingRecipes, error: fetchError } = await supabase
      .from('en13813_recipes')
      .select('*')
      .limit(1)

    if (fetchError) {
      console.error('❌ Cannot fetch from recipes table:', fetchError.message)
      console.log('\n⚠️ The table might not exist or has permission issues')
      return
    }

    console.log('✅ Can fetch from recipes table')

    if (existingRecipes && existingRecipes.length > 0) {
      const columns = Object.keys(existingRecipes[0])
      console.log('Available columns:', columns.filter(c => c !== 'id' && c !== 'created_at' && c !== 'updated_at').join(', '))
    } else {
      console.log('No existing recipes to analyze schema')
    }

    // Now try to create a recipe with all potentially required fields
    console.log('\n2. Creating recipe with all potentially required fields...')
    const testRecipe = {
      recipe_code: 'TEST-' + Date.now(),
      name: 'Test Recipe',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      // Fields that might be required (NOT NULL)
      product_name: 'Test Product',
      manufacturer_name: 'Test Manufacturer',
      manufacturer_address: 'Test Address',
      description: 'Test Description',
      fire_class: 'A1fl'
    }

    const { data: newRecipe, error: createError } = await supabase
      .from('en13813_recipes')
      .insert(testRecipe)
      .select()
      .single()

    if (createError) {
      console.error('❌ Recipe creation failed:', createError.message)

      // Try to identify which field is the problem
      if (createError.message.includes('null value in column')) {
        const field = createError.message.match(/column "([^"]+)"/)?.[1]
        console.log(`\n⚠️ Field '${field}' has a NOT NULL constraint but shouldn't`)
      } else if (createError.message.includes('Could not find')) {
        const field = createError.message.match(/'([^']+)'/)?.[1]
        console.log(`\n⚠️ Field '${field}' doesn't exist in the table`)

        // Try without the non-existent field
        console.log('\nRetrying without advanced fields...')
        const basicRecipe = {
          recipe_code: 'BASIC-' + Date.now(),
          name: 'Basic Test Recipe',
          binder_type: 'CT',
          compressive_strength_class: 'C25',
          flexural_strength_class: 'F4',
          product_name: 'Basic Product',
          manufacturer_name: 'Basic Manufacturer',
          manufacturer_address: 'Basic Address',
          fire_class: 'A1fl'
        }

        const { data: basicData, error: basicError } = await supabase
          .from('en13813_recipes')
          .insert(basicRecipe)
          .select()
          .single()

        if (basicError) {
          console.error('❌ Even basic recipe failed:', basicError.message)
        } else {
          console.log('✅ Basic recipe created successfully!')
          console.log('Recipe ID:', basicData.id)
          console.log('Recipe Code:', basicData.recipe_code)

          // Clean up
          await supabase.from('en13813_recipes').delete().eq('id', basicData.id)
          console.log('✅ Test recipe cleaned up')
        }
      }
    } else {
      console.log('✅ Recipe created successfully!')
      console.log('Recipe ID:', newRecipe.id)
      console.log('Recipe Code:', newRecipe.recipe_code)

      // Clean up
      await supabase.from('en13813_recipes').delete().eq('id', newRecipe.id)
      console.log('✅ Test recipe cleaned up')
    }

    console.log('\n📝 Migration Status:')
    console.log('If you see errors above, the database needs the following migrations:')
    console.log('1. supabase/migrations/20250928_fix_all_recipe_issues.sql')
    console.log('\nApply via Supabase Dashboard:')
    console.log('https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/sql/new')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testMinimalRecipe()