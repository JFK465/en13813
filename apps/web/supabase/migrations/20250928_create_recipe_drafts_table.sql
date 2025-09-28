-- ============================================================
-- Migration: Create EN13813 Recipe Drafts Table
-- Date: 2025-09-28
-- Description: Creates table for storing recipe drafts in the cloud
-- ============================================================

-- Create table for recipe drafts
CREATE TABLE IF NOT EXISTS en13813_recipe_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL, -- Using VARCHAR for dev compatibility
  draft_name VARCHAR(255) NOT NULL,
  draft_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique draft names per user
  UNIQUE(user_id, draft_name)
);

-- Enable RLS
ALTER TABLE en13813_recipe_drafts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Users can view own drafts" ON en13813_recipe_drafts;
DROP POLICY IF EXISTS "Users can create own drafts" ON en13813_recipe_drafts;
DROP POLICY IF EXISTS "Users can update own drafts" ON en13813_recipe_drafts;
DROP POLICY IF EXISTS "Users can delete own drafts" ON en13813_recipe_drafts;
DROP POLICY IF EXISTS "Service role bypasses RLS" ON en13813_recipe_drafts;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Policy: Users can view their own drafts
CREATE POLICY "Users can view own drafts" ON en13813_recipe_drafts
  FOR SELECT
  USING (
    (auth.uid()::text = user_id) OR
    (user_id LIKE 'dev-user-%')  -- Allow dev users for testing
  );

-- Policy: Users can create their own drafts
CREATE POLICY "Users can create own drafts" ON en13813_recipe_drafts
  FOR INSERT
  WITH CHECK (
    (auth.uid()::text = user_id) OR
    (user_id LIKE 'dev-user-%')  -- Allow dev users for testing
  );

-- Policy: Users can update their own drafts
CREATE POLICY "Users can update own drafts" ON en13813_recipe_drafts
  FOR UPDATE
  USING (
    (auth.uid()::text = user_id) OR
    (user_id LIKE 'dev-user-%')  -- Allow dev users for testing
  )
  WITH CHECK (
    (auth.uid()::text = user_id) OR
    (user_id LIKE 'dev-user-%')  -- Allow dev users for testing
  );

-- Policy: Users can delete their own drafts
CREATE POLICY "Users can delete own drafts" ON en13813_recipe_drafts
  FOR DELETE
  USING (
    (auth.uid()::text = user_id) OR
    (user_id LIKE 'dev-user-%')  -- Allow dev users for testing
  );

-- Policy: Service role bypasses RLS
CREATE POLICY "Service role bypasses RLS" ON en13813_recipe_drafts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Indexes for performance
-- ============================================================

-- Index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_recipe_drafts_user_id
  ON en13813_recipe_drafts(user_id);

-- Index for sorting by update time
CREATE INDEX IF NOT EXISTS idx_recipe_drafts_updated_at
  ON en13813_recipe_drafts(updated_at DESC);

-- ============================================================
-- Documentation
-- ============================================================

-- Add table comment
COMMENT ON TABLE en13813_recipe_drafts IS 'Cloud storage for EN13813 recipe drafts with user isolation';

-- Add column comments
COMMENT ON COLUMN en13813_recipe_drafts.id IS 'Unique identifier for the draft';
COMMENT ON COLUMN en13813_recipe_drafts.user_id IS 'User ID (can be auth.uid or dev-user-* for development)';
COMMENT ON COLUMN en13813_recipe_drafts.draft_name IS 'Unique name for the draft per user (typically recipe_code)';
COMMENT ON COLUMN en13813_recipe_drafts.draft_data IS 'Complete recipe form data as JSON';
COMMENT ON COLUMN en13813_recipe_drafts.created_at IS 'Timestamp when draft was first created';
COMMENT ON COLUMN en13813_recipe_drafts.updated_at IS 'Timestamp when draft was last updated';

-- ============================================================
-- Success message
-- ============================================================
-- After running this migration, you should be able to:
-- 1. Save recipe drafts to the cloud
-- 2. Access drafts from any device
-- 3. Auto-save functionality will work
-- 4. Drafts will be isolated per user
-- ============================================================