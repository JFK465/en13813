const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRecipeCreation() {
  try {
    // First check if table exists and is accessible
    const { data: existingRecipes, error: fetchError } = await supabase
      .from('en13813_recipes')
      .select('*')
      .limit(5)

    if (fetchError) {
      console.error('Error fetching recipes:', fetchError)
      return
    }

    console.log('Existing recipes:', existingRecipes?.length || 0)

    // Create a test recipe
    const testRecipe = {
      recipe_code: 'TEST-CT-C25-F4',
      name: 'Test Zementestrich Standard',
      description: 'Test Rezeptur für Entwicklung',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      wear_resistance_method: 'bohme',
      wear_resistance_class: 'A22',
      fire_class: 'A1fl',
      avcp_system: '4',
      intended_use: {
        wearing_surface: true,
        with_flooring: false,
        heated_screed: false,
        indoor_only: true
      },
      status: 'draft',
      manufacturer_name: 'Test GmbH',
      manufacturer_address: 'Teststraße 1, 12345 Teststadt',
      product_name: 'TestProduct Pro'
    }

    const { data: newRecipe, error: createError } = await supabase
      .from('en13813_recipes')
      .insert(testRecipe)
      .select()
      .single()

    if (createError) {
      console.error('Error creating recipe:', createError)
      return
    }

    console.log('✅ Successfully created test recipe:', newRecipe)

    // Verify it can be fetched
    const { data: verifyRecipe, error: verifyError } = await supabase
      .from('en13813_recipes')
      .select('*')
      .eq('recipe_code', 'TEST-CT-C25-F4')
      .single()

    if (verifyError) {
      console.error('Error verifying recipe:', verifyError)
    } else {
      console.log('✅ Recipe verified successfully:', verifyRecipe.name)
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testRecipeCreation()