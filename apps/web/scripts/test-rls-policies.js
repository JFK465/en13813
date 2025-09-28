const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

async function testRLSPolicies() {
  console.log('🔒 Testing RLS Policies for EN13813 Recipes...\n')

  // Create clients
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Test 1: Service role should bypass RLS
    console.log('1. Testing service role access (bypasses RLS)...')
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('en13813_recipes')
      .select('id, name, recipe_code')
      .limit(5)

    if (serviceError) {
      console.error('❌ Service role error:', serviceError.message)
    } else {
      console.log('✅ Service role can access:', serviceData?.length || 0, 'recipes')
    }

    // Test 2: Anonymous client (no auth)
    console.log('\n2. Testing anonymous access...')
    const { data: anonData, error: anonError } = await anonClient
      .from('en13813_recipes')
      .select('id, name, recipe_code')
      .limit(5)

    if (anonError) {
      if (anonError.message.includes('row-level security')) {
        console.log('✅ RLS is enabled - anonymous access blocked')
      } else {
        console.error('❌ Unexpected anonymous error:', anonError.message)
      }
    } else {
      console.log('⚠️ Anonymous user can see', anonData?.length || 0, 'recipes')
      if (anonData && anonData.length > 0) {
        console.log('   This might indicate missing or incorrect RLS policies')
      }
    }

    // Test 3: Create test recipe with service role
    console.log('\n3. Creating test recipe with service role...')
    const testRecipe = {
      recipe_code: 'RLS-TEST-' + Date.now(),
      name: 'RLS Test Recipe',
      binder_type: 'CT',
      compressive_strength_class: 'C25',
      flexural_strength_class: 'F4',
      product_name: 'RLS Test Product',
      manufacturer_name: 'RLS Test Manufacturer',
      manufacturer_address: 'RLS Test Address',
      fire_class: 'A1fl'
    }

    const { data: newRecipe, error: createError } = await serviceClient
      .from('en13813_recipes')
      .insert(testRecipe)
      .select()
      .single()

    if (createError) {
      console.error('❌ Cannot create recipe:', createError.message)
    } else {
      console.log('✅ Test recipe created:', newRecipe.recipe_code)

      // Test 4: Try to read it with anonymous client
      console.log('\n4. Testing if anonymous can read the test recipe...')
      const { data: anonRead, error: anonReadError } = await anonClient
        .from('en13813_recipes')
        .select('*')
        .eq('id', newRecipe.id)
        .single()

      if (anonReadError) {
        if (anonReadError.code === 'PGRST116') {
          console.log('✅ RLS blocks anonymous read - good!')
        } else {
          console.error('❌ Anonymous read error:', anonReadError.message)
        }
      } else {
        console.log('⚠️ Anonymous can read recipe - RLS might be misconfigured')
      }

      // Test 5: Try to update with anonymous client
      console.log('\n5. Testing if anonymous can update recipes...')
      const { error: anonUpdateError } = await anonClient
        .from('en13813_recipes')
        .update({ name: 'Hacked Recipe' })
        .eq('id', newRecipe.id)

      if (anonUpdateError) {
        console.log('✅ RLS blocks anonymous updates - good!')
      } else {
        console.log('⚠️ Anonymous can update recipes - SECURITY RISK!')
      }

      // Test 6: Try to delete with anonymous client
      console.log('\n6. Testing if anonymous can delete recipes...')
      const { error: anonDeleteError } = await anonClient
        .from('en13813_recipes')
        .delete()
        .eq('id', newRecipe.id)

      if (anonDeleteError) {
        console.log('✅ RLS blocks anonymous deletes - good!')
      } else {
        console.log('⚠️ Anonymous can delete recipes - SECURITY RISK!')
      }

      // Clean up with service role
      const { error: cleanupError } = await serviceClient
        .from('en13813_recipes')
        .delete()
        .eq('id', newRecipe.id)

      if (!cleanupError) {
        console.log('✅ Test recipe cleaned up')
      }
    }

    // Summary
    console.log('\n📊 RLS Policy Summary:')
    console.log('- RLS is', anonError?.message.includes('row-level security') ? 'ENABLED ✅' : 'UNCLEAR ⚠️')
    console.log('- Service role: Full access ✅')
    console.log('- Anonymous users: Should be blocked')
    console.log('- Authenticated users: Need proper policies')

    console.log('\n📝 Recommendations:')
    console.log('1. Ensure RLS is enabled on en13813_recipes table')
    console.log('2. Create policies for authenticated users based on organization/tenant')
    console.log('3. Consider these typical policies:')
    console.log('   - Users can view recipes in their organization')
    console.log('   - Users can create/edit based on role permissions')
    console.log('   - Service role bypasses all restrictions')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testRLSPolicies()