const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDraftTable() {
  console.log('🔍 Testing en13813_recipe_drafts table...\n');

  // Test 1: Try a simple count query
  console.log('1. Testing table access with count...');
  const { count, error: countError } = await supabase
    .from('en13813_recipe_drafts')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Count query failed:', countError.message);
    console.error('   Error code:', countError.code);
    console.error('   Error hint:', countError.hint);

    if (countError.message.includes('relation') && countError.message.includes('does not exist')) {
      console.error('\n⚠️  Table does not exist in database!');
      console.error('Please run the migration SQL in Supabase.');
    }
  } else {
    console.log('✅ Table is accessible! Current row count:', count || 0);
  }

  // Test 2: Try to insert a test record using service role
  console.log('\n2. Testing insert with service role...');
  const testData = {
    user_id: 'dev-user-localhost',
    draft_name: 'test-draft-' + Date.now(),
    draft_data: { test: true, timestamp: new Date().toISOString() }
  };

  const { data: insertData, error: insertError } = await supabase
    .from('en13813_recipe_drafts')
    .insert(testData)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Insert failed:', insertError.message);
    console.error('   Error code:', insertError.code);
    console.error('   Error details:', insertError.details);
    console.error('   Error hint:', insertError.hint);

    if (insertError.code === '42P01') {
      console.error('\n⚠️  Table does not exist!');
    } else if (insertError.code === '42501') {
      console.error('\n⚠️  Permission denied - RLS policies may be blocking');
    }
  } else {
    console.log('✅ Insert successful!');
    console.log('   Created draft ID:', insertData.id);
    console.log('   Draft name:', insertData.draft_name);

    // Clean up
    const { error: deleteError } = await supabase
      .from('en13813_recipe_drafts')
      .delete()
      .eq('id', insertData.id);

    if (!deleteError) {
      console.log('   ✅ Test record cleaned up');
    }
  }

  // Test 3: Check if we can select with dev-user pattern
  console.log('\n3. Testing select with dev-user pattern...');
  const { data: drafts, error: selectError } = await supabase
    .from('en13813_recipe_drafts')
    .select('*')
    .like('user_id', 'dev-user-%')
    .limit(5);

  if (selectError) {
    console.error('❌ Select failed:', selectError.message);
  } else {
    console.log('✅ Select successful! Found', drafts?.length || 0, 'dev-user drafts');
  }

  // Test 4: List all tables to verify
  console.log('\n4. Verifying table existence in database...');
  const { data: tableCheck, error: tableError } = await supabase
    .from('en13813_recipe_drafts')
    .select('id')
    .limit(1);

  if (tableError && tableError.message.includes('does not exist')) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ CRITICAL: Table en13813_recipe_drafts does NOT exist!');
    console.error('='.repeat(60));
    console.error('\nPlease go to:');
    console.error('https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/sql/new');
    console.error('\nAnd run the migration SQL from:');
    console.error('supabase/migrations/20250928_create_recipe_drafts_table.sql');
  } else if (!tableError) {
    console.log('✅ Table definitely exists and is queryable');
  }
}

testDraftTable();