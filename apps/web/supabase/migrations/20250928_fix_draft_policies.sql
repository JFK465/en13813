-- ============================================================
-- Fix RLS Policies for Recipe Drafts
-- This fixes the timeout issues by allowing dev-user access
-- ============================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own drafts" ON en13813_recipe_drafts;
DROP POLICY IF EXISTS "Users can create own drafts" ON en13813_recipe_drafts;
DROP POLICY IF EXISTS "Users can update own drafts" ON en13813_recipe_drafts;
DROP POLICY IF EXISTS "Users can delete own drafts" ON en13813_recipe_drafts;
DROP POLICY IF EXISTS "Service role bypasses RLS" ON en13813_recipe_drafts;

-- Create new, more permissive policies for development

-- SELECT: Allow authenticated users and dev-users
CREATE POLICY "Allow select for users and dev" ON en13813_recipe_drafts
  FOR SELECT
  USING (
    -- Authenticated users can see their own drafts
    (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
    OR
    -- Dev users can see their drafts (no auth required)
    (user_id LIKE 'dev-user-%')
  );

-- INSERT: Allow authenticated users and dev-users
CREATE POLICY "Allow insert for users and dev" ON en13813_recipe_drafts
  FOR INSERT
  WITH CHECK (
    -- Authenticated users can create their own drafts
    (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
    OR
    -- Dev users can create drafts (no auth required)
    (user_id LIKE 'dev-user-%')
  );

-- UPDATE: Allow authenticated users and dev-users
CREATE POLICY "Allow update for users and dev" ON en13813_recipe_drafts
  FOR UPDATE
  USING (
    -- Authenticated users can update their own drafts
    (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
    OR
    -- Dev users can update their drafts
    (user_id LIKE 'dev-user-%')
  )
  WITH CHECK (
    -- Same conditions for the updated row
    (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
    OR
    (user_id LIKE 'dev-user-%')
  );

-- DELETE: Allow authenticated users and dev-users
CREATE POLICY "Allow delete for users and dev" ON en13813_recipe_drafts
  FOR DELETE
  USING (
    -- Authenticated users can delete their own drafts
    (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
    OR
    -- Dev users can delete their drafts
    (user_id LIKE 'dev-user-%')
  );

-- Service role bypasses all RLS (for admin operations)
CREATE POLICY "Service role full access" ON en13813_recipe_drafts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- After running this, the draft system should work properly
-- ============================================================