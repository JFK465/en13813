const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDraftsTable() {
  console.log('🔄 Setting up en13813_recipe_drafts table...\n')

  // SQL to create the table
  const createTableSQL = `
    -- Create table for recipe drafts
    CREATE TABLE IF NOT EXISTS en13813_recipe_drafts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(255) NOT NULL,
      draft_name VARCHAR(255) NOT NULL,
      draft_data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, draft_name)
    );

    -- Enable RLS
    ALTER TABLE en13813_recipe_drafts ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own drafts" ON en13813_recipe_drafts;
    DROP POLICY IF EXISTS "Users can create own drafts" ON en13813_recipe_drafts;
    DROP POLICY IF EXISTS "Users can update own drafts" ON en13813_recipe_drafts;
    DROP POLICY IF EXISTS "Users can delete own drafts" ON en13813_recipe_drafts;
    DROP POLICY IF EXISTS "Service role bypasses RLS" ON en13813_recipe_drafts;

    -- RLS Policies
    CREATE POLICY "Users can view own drafts" ON en13813_recipe_drafts
      FOR SELECT
      USING (
        (auth.uid()::text = user_id) OR
        (user_id LIKE 'dev-user-%')
      );

    CREATE POLICY "Users can create own drafts" ON en13813_recipe_drafts
      FOR INSERT
      WITH CHECK (
        (auth.uid()::text = user_id) OR
        (user_id LIKE 'dev-user-%')
      );

    CREATE POLICY "Users can update own drafts" ON en13813_recipe_drafts
      FOR UPDATE
      USING (
        (auth.uid()::text = user_id) OR
        (user_id LIKE 'dev-user-%')
      )
      WITH CHECK (
        (auth.uid()::text = user_id) OR
        (user_id LIKE 'dev-user-%')
      );

    CREATE POLICY "Users can delete own drafts" ON en13813_recipe_drafts
      FOR DELETE
      USING (
        (auth.uid()::text = user_id) OR
        (user_id LIKE 'dev-user-%')
      );

    CREATE POLICY "Service role bypasses RLS" ON en13813_recipe_drafts
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_recipe_drafts_user_id ON en13813_recipe_drafts(user_id);
    CREATE INDEX IF NOT EXISTS idx_recipe_drafts_updated_at ON en13813_recipe_drafts(updated_at DESC);

    -- Add comment
    COMMENT ON TABLE en13813_recipe_drafts IS 'Cloud storage for EN13813 recipe drafts with user isolation';
  `

  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL }).catch(() => ({
      error: new Error('RPC not available, please run SQL manually')
    }))

    if (error) {
      console.log('⚠️  Could not execute SQL automatically.')
      console.log('\n📋 Please run this SQL manually in Supabase Dashboard:')
      console.log('🔗 https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/sql/new\n')
      console.log('=' .repeat(60))
      console.log(createTableSQL)
      console.log('=' .repeat(60))
      console.log('\n✅ After running the SQL, refresh your app and try again.')
      return
    }

    // Test if table was created
    const { data, error: testError } = await supabase
      .from('en13813_recipe_drafts')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Table creation might have failed:', testError.message)
    } else {
      console.log('✅ Table en13813_recipe_drafts created successfully!')
      console.log('🎉 You can now save drafts to the cloud!')
    }
  } catch (err) {
    console.error('Error:', err)
    console.log('\n📋 Please run the SQL manually (see above)')
  }
}

setupDraftsTable()