const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
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

async function applyMigration() {
  console.log('📋 Applying tenant_users table migration...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250129_create_tenant_users_table.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('Migration content loaded, executing...\n');
  console.log('⚠️  NOTE: This script will log the SQL but cannot directly execute DDL statements.');
  console.log('Please copy and run the following SQL in Supabase Dashboard:\n');
  console.log('='.repeat(60));
  console.log(migrationSQL);
  console.log('='.repeat(60));

  // Check if table was created
  console.log('\n🔍 Checking if tenant_users table exists...\n');

  const { data, error } = await supabase
    .from('tenant_users')
    .select('*')
    .limit(0);

  if (error && error.code === '42P01') {
    console.log('❌ Table "tenant_users" does not exist yet');
    console.log('\n📋 Please execute the SQL above in:');
    console.log('https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/editor\n');
  } else if (!error) {
    console.log('✅ Table "tenant_users" exists!');

    // Create a demo tenant user link
    await createDemoTenantUser();
  } else {
    console.log('⚠️  Unexpected error:', error.message);
  }
}

async function createDemoTenantUser() {
  console.log('\n🔗 Creating demo tenant-user link...\n');

  try {
    // Get the first user
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError || !users || users.length === 0) {
      console.log('❌ No users found to link with tenant');
      return;
    }

    const firstUser = users[0];
    console.log(`Found user: ${firstUser.email}`);

    // Check if demo tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', 'demo')
      .single();

    if (tenantError || !tenant) {
      // Create demo tenant
      const { data: newTenant, error: createError } = await supabase
        .from('tenants')
        .insert({
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Demo Company GmbH',
          subdomain: 'demo',
          settings: {
            locale: 'de',
            timezone: 'Europe/Berlin'
          }
        })
        .select()
        .single();

      if (createError) {
        console.log('❌ Could not create demo tenant:', createError.message);
        return;
      }

      console.log('✅ Created demo tenant:', newTenant.name);

      // Link user to tenant
      const { error: linkError } = await supabase
        .from('tenant_users')
        .upsert({
          tenant_id: newTenant.id,
          user_id: firstUser.id,
          role: 'owner'
        }, {
          onConflict: 'user_id'
        });

      if (linkError) {
        console.log('❌ Could not link user to tenant:', linkError.message);
      } else {
        console.log(`✅ Linked ${firstUser.email} as owner of ${newTenant.name}`);

        // Update user's app_metadata with tenant_id
        const { error: metadataError } = await supabase.auth.admin.updateUserById(
          firstUser.id,
          {
            app_metadata: { tenant_id: newTenant.id }
          }
        );

        if (metadataError) {
          console.log('❌ Could not update user metadata:', metadataError.message);
        } else {
          console.log('✅ Updated user app_metadata with tenant_id');
        }
      }
    } else {
      console.log('✅ Demo tenant already exists:', tenant.name);

      // Check if user is already linked
      const { data: existingLink, error: linkCheckError } = await supabase
        .from('tenant_users')
        .select('*')
        .eq('user_id', firstUser.id)
        .single();

      if (!existingLink) {
        // Link user to tenant
        const { error: linkError } = await supabase
          .from('tenant_users')
          .insert({
            tenant_id: tenant.id,
            user_id: firstUser.id,
            role: 'owner'
          });

        if (!linkError) {
          console.log(`✅ Linked ${firstUser.email} to ${tenant.name}`);

          // Update metadata
          await supabase.auth.admin.updateUserById(
            firstUser.id,
            {
              app_metadata: { tenant_id: tenant.id }
            }
          );
        }
      } else {
        console.log('✅ User already linked to tenant');
      }
    }

  } catch (err) {
    console.error('Error in createDemoTenantUser:', err);
  }
}

applyMigration().catch(console.error);