const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRecipeComplete() {
  console.log('🧪 Testing Complete Recipe Creation...\n')

  try {
    // Create a complete recipe with all required and optional fields
    const completeRecipe = {
      // Required basic fields
      recipe_code: 'CT-C25-F4-A22',
      name: 'Zementestrich Standard EN13813',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',

      // Fields that might have NOT NULL constraints
      product_name: 'EstrichPro 2000',
      fire_class: 'A1fl',

      // Optional manufacturer fields (EN13813 norm-relevant)
      manufacturer_name: 'Deutsche Estrichwerke GmbH',
      manufacturer_address: 'Industriestraße 42, 80331 München',
      description: 'Hochwertiger Zementestrich für industrielle Anwendungen nach EN 13813',

      // Optional technical fields
      wear_resistance_method: 'bohme',
      wear_resistance_class: 'A22',
      surface_hardness_class: 'SH30',

      // AVCP and intended use (if columns exist)
      avcp_system: '4',
      status: 'draft',
      intended_use: {
        wearing_surface: true,
        with_flooring: false,
        heated_screed: false,
        indoor_only: true
      }
    }

    console.log('Creating complete recipe with all EN13813 fields...')
    console.log('Recipe code:', completeRecipe.recipe_code)
    console.log('Manufacturer:', completeRecipe.manufacturer_name)

    const { data: newRecipe, error: createError } = await supabase
      .from('en13813_recipes')
      .insert(completeRecipe)
      .select()
      .single()

    if (createError) {
      console.error('\n❌ Recipe creation failed!')
      console.error('Error details:', createError)

      // Analyze which fields are causing problems
      if (createError.message.includes('null value in column')) {
        console.log('\n⚠️ Some fields have NOT NULL constraints that need to be fixed')
      }

      if (createError.message.includes('Could not find')) {
        const missingColumn = createError.message.match(/'([^']+)'/)?.[1]
        console.log(`\n⚠️ Column '${missingColumn}' is missing from the table`)

        // Try without the missing field
        console.log('\nRetrying without advanced fields...')
        delete completeRecipe.avcp_system
        delete completeRecipe.status
        delete completeRecipe.intended_use
        delete completeRecipe.manufacturer_name
        delete completeRecipe.manufacturer_address
        delete completeRecipe.description
        delete completeRecipe.wear_resistance_method
        delete completeRecipe.wear_resistance_class
        delete completeRecipe.surface_hardness_class

        const { data: retryData, error: retryError } = await supabase
          .from('en13813_recipes')
          .insert(completeRecipe)
          .select()
          .single()

        if (retryError) {
          console.error('❌ Even basic recipe failed:', retryError.message)
        } else {
          console.log('✅ Basic recipe created successfully!')
          console.log('Recipe ID:', retryData.id)
          console.log('\n⚠️ But the EN13813 norm-relevant fields are missing!')
          console.log('Please apply the migration to add these fields.')

          // Clean up
          await supabase.from('en13813_recipes').delete().eq('id', retryData.id)
        }
      }
    } else {
      console.log('\n✅ Complete recipe created successfully!')
      console.log('Recipe ID:', newRecipe.id)
      console.log('Recipe code:', newRecipe.recipe_code)
      console.log('All EN13813 fields are working correctly!')

      // Verify we can fetch it
      const { data: fetchedRecipe, error: fetchError } = await supabase
        .from('en13813_recipes')
        .select('*')
        .eq('id', newRecipe.id)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching recipe:', fetchError)
      } else {
        console.log('✅ Recipe successfully fetched')
        console.log('   Manufacturer:', fetchedRecipe.manufacturer_name || 'N/A')
        console.log('   Product:', fetchedRecipe.product_name)
        console.log('   Description:', fetchedRecipe.description || 'N/A')
      }

      // Clean up test recipe
      const { error: deleteError } = await supabase
        .from('en13813_recipes')
        .delete()
        .eq('id', newRecipe.id)

      if (!deleteError) {
        console.log('✅ Test recipe cleaned up')
      }
    }

    // Check for existing recipes
    console.log('\n📋 Checking existing recipes...')
    const { data: recipes, error: listError } = await supabase
      .from('en13813_recipes')
      .select('id, name, recipe_code, product_name')
      .limit(5)

    if (listError) {
      console.error('❌ Error listing recipes:', listError)
    } else {
      console.log(`Found ${recipes?.length || 0} existing recipes`)
      if (recipes && recipes.length > 0) {
        recipes.forEach(r => {
          console.log(`   - ${r.recipe_code}: ${r.name}`)
        })
      }
    }

    console.log('\n📝 Summary:')
    console.log('If you see errors above, you need to:')
    console.log('1. Go to: https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/sql/new')
    console.log('2. Run the SQL from: supabase/migrations/20250928_fix_recipe_constraints.sql')
    console.log('3. Then from: supabase/migrations/20250928_add_missing_columns.sql')
    console.log('4. Re-run this script to verify')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testRecipeComplete()