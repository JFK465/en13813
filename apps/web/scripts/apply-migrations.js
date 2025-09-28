const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigrations() {
  try {
    console.log('Testing database schema and applying fixes...\n')

    // First, let's check what columns currently exist
    console.log('Checking current table structure...')
    const { data: existingRecipe, error: checkError } = await supabase
      .from('en13813_recipes')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('Error checking table:', checkError)
    } else if (existingRecipe && existingRecipe.length > 0) {
      const columns = Object.keys(existingRecipe[0])
      console.log('Current columns:', columns.join(', '))

      // Check for missing columns
      const requiredColumns = [
        'avcp_system', 'manufacturer_name', 'manufacturer_address',
        'product_name', 'description', 'wear_resistance_method',
        'wear_resistance_class', 'surface_hardness_class',
        'bond_strength_class', 'impact_resistance_class',
        'indentation_class', 'rwfc_class', 'fire_class',
        'notified_body_number', 'intended_use', 'status'
      ]

      const missingColumns = requiredColumns.filter(col => !columns.includes(col))
      if (missingColumns.length > 0) {
        console.log('\n⚠️ Missing columns:', missingColumns.join(', '))
        console.log('\n📝 The following SQL migration needs to be applied via Supabase Dashboard:')
        console.log('----------------------------------------')
        const migrationContent = fs.readFileSync(
          path.join(__dirname, '../supabase/migrations/20250928_add_missing_columns.sql'),
          'utf-8'
        )
        console.log(migrationContent)
        console.log('----------------------------------------')
        console.log('\n1. Go to: https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/sql/new')
        console.log('2. Paste the SQL above and run it')
        console.log('3. Then re-run this script to verify')
        return
      } else {
        console.log('✅ All required columns exist!')
      }
    }

    // Test if the columns were added by attempting to create a test recipe
    console.log('\nTesting if columns exist by creating test recipe...')

    const testRecipe = {
      recipe_code: 'MIGRATION-TEST-' + Date.now(),
      name: 'Migration Test Recipe',
      description: 'Test recipe to verify migrations',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      wear_resistance_method: 'bohme',
      wear_resistance_class: 'A22',
      fire_class: 'A1fl',
      avcp_system: '4',
      manufacturer_name: 'Test GmbH',
      manufacturer_address: 'Teststraße 1, 12345 Teststadt',
      product_name: 'TestProduct Pro',
      intended_use: {
        wearing_surface: true,
        with_flooring: false,
        heated_screed: false,
        indoor_only: true
      },
      status: 'draft'
    }

    const { data: newRecipe, error: createError } = await supabase
      .from('en13813_recipes')
      .insert(testRecipe)
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating test recipe:', createError)
      console.log('\nThis likely means the columns don\'t exist yet.')
      console.log('You may need to apply the migrations manually via Supabase Dashboard.')
    } else {
      console.log('✅ Successfully created test recipe with all new columns!')
      console.log('Recipe ID:', newRecipe.id)

      // Clean up test recipe
      const { error: deleteError } = await supabase
        .from('en13813_recipes')
        .delete()
        .eq('id', newRecipe.id)

      if (!deleteError) {
        console.log('✅ Test recipe cleaned up')
      }
    }

    // Test if recipes can be loaded
    console.log('\nTesting recipe loading...')
    const { data: recipes, error: loadError } = await supabase
      .from('en13813_recipes')
      .select('*')
      .limit(5)

    if (loadError) {
      console.error('❌ Error loading recipes:', loadError)
    } else {
      console.log('✅ Successfully loaded', recipes?.length || 0, 'recipes')
      if (recipes && recipes.length > 0) {
        console.log('First recipe:', recipes[0].name)
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

applyMigrations()