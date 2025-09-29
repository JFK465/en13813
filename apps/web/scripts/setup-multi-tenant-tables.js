const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

async function checkAndCreateTables() {
  console.log('🔍 Checking Multi-Tenant Tables Status...\n');

  // Check if tenants table exists
  const { data: tenantsCheck, error: tenantsError } = await supabase
    .from('tenants')
    .select('id')
    .limit(1);

  if (tenantsError && tenantsError.code === '42P01') {
    console.log('❌ Table "tenants" does not exist');
    console.log('⚠️  The multi-tenant migration has NOT been applied yet!\n');

    console.log('📋 Required actions:');
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/editor');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and execute the migration from: supabase/migrations/20250122_complete_en13813_fresh.sql');
    console.log('\nOr create the tables manually with the script below.\n');

    return false;
  } else if (!tenantsError) {
    console.log('✅ Table "tenants" exists');

    // Check tenant_users table
    const { error: tuError } = await supabase
      .from('tenant_users')
      .select('id')
      .limit(1);

    if (!tuError) {
      console.log('✅ Table "tenant_users" exists');
      console.log('\n✨ Multi-tenant tables are already set up!\n');
      return true;
    } else {
      console.log('❌ Table "tenant_users" does not exist');
    }
  }

  // Check if we need to update existing tables with tenant_id
  console.log('\n🔍 Checking existing tables for tenant_id column...\n');

  const tablesToCheck = [
    'en13813_recipes',
    'en13813_batches',
    'en13813_lab_values',
    'en13813_dops',
    'en13813_test_reports'
  ];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0);

    if (error) {
      console.log(`❌ Table '${table}': ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': exists`);
    }
  }

  return false;
}

async function createDemoTenant() {
  console.log('\n🏢 Creating demo tenant for testing...\n');

  try {
    // First create a demo tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .upsert({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Demo Company GmbH',
        subdomain: 'demo',
        settings: {
          locale: 'de',
          timezone: 'Europe/Berlin'
        }
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (tenantError) {
      console.log('❌ Could not create demo tenant:', tenantError.message);
      return null;
    }

    console.log('✅ Demo tenant created/updated:', tenant.name);
    return tenant.id;
  } catch (err) {
    console.error('Error creating demo tenant:', err);
    return null;
  }
}

async function main() {
  const tablesExist = await checkAndCreateTables();

  if (tablesExist) {
    const tenantId = await createDemoTenant();

    if (tenantId) {
      console.log('\n📝 Next Steps:');
      console.log('1. Update your authentication to include tenant_id in app_metadata');
      console.log('2. Test multi-tenant isolation with different users');
      console.log(`3. Demo tenant ID for testing: ${tenantId}`);
    }
  } else {
    console.log('\n⚠️  Manual intervention required!');
    console.log('Please execute the multi-tenant migration in Supabase Dashboard first.');
  }
}

main().catch(console.error);