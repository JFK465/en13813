const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDraftTable() {
  console.log('📋 Recipe Draft Table Creation Instructions\n')
  console.log('============================================\n')

  console.log('The table "en13813_recipe_drafts" does not exist in your database.\n')

  console.log('Please follow these steps:\n')
  console.log('1. Go to Supabase Dashboard:')
  console.log('   https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/sql/new\n')

  console.log('2. Copy and paste this SQL:\n')
  console.log('----------------------------------------')
  console.log(`
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

-- RLS Policies
CREATE POLICY "Users can view own drafts" ON en13813_recipe_drafts
  FOR SELECT
  USING (
    (auth.uid()::text = user_id) OR
    (user_id = 'dev-user-123')
  );

CREATE POLICY "Users can create own drafts" ON en13813_recipe_drafts
  FOR INSERT
  WITH CHECK (
    (auth.uid()::text = user_id) OR
    (user_id = 'dev-user-123')
  );

CREATE POLICY "Users can update own drafts" ON en13813_recipe_drafts
  FOR UPDATE
  USING (
    (auth.uid()::text = user_id) OR
    (user_id = 'dev-user-123')
  )
  WITH CHECK (
    (auth.uid()::text = user_id) OR
    (user_id = 'dev-user-123')
  );

CREATE POLICY "Users can delete own drafts" ON en13813_recipe_drafts
  FOR DELETE
  USING (
    (auth.uid()::text = user_id) OR
    (user_id = 'dev-user-123')
  );

CREATE POLICY "Service role bypasses RLS" ON en13813_recipe_drafts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_recipe_drafts_user_id ON en13813_recipe_drafts(user_id);
CREATE INDEX idx_recipe_drafts_updated_at ON en13813_recipe_drafts(updated_at DESC);
  `)
  console.log('----------------------------------------\n')

  console.log('3. Click "Run" to execute the SQL\n')

  console.log('4. After creating the table, test the draft save functionality again\n')

  console.log('✨ Benefits of Cloud Drafts:')
  console.log('   - Access drafts from any device')
  console.log('   - Never lose your work')
  console.log('   - Team collaboration ready')
  console.log('   - Version history possible\n')

  console.log('⚠️ Note: Until you create this table, drafts will fall back to local storage.')
}

createDraftTable()