-- Fix RLS policies for en13813_recipes table
-- Ensure proper security for multi-tenant environment

-- Enable RLS if not already enabled
ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them properly)
DROP POLICY IF EXISTS "Service role bypasses RLS" ON en13813_recipes;
DROP POLICY IF EXISTS "Users can view recipes in their organization" ON en13813_recipes;
DROP POLICY IF EXISTS "Users can create recipes in their organization" ON en13813_recipes;
DROP POLICY IF EXISTS "Users can update recipes in their organization" ON en13813_recipes;
DROP POLICY IF EXISTS "Users can delete recipes in their organization" ON en13813_recipes;

-- Service role bypasses all RLS (for migrations and admin tasks)
CREATE POLICY "Service role bypasses RLS" ON en13813_recipes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can view recipes
-- TODO: Add organization/tenant filtering once org_id column exists
CREATE POLICY "Authenticated users can view recipes" ON en13813_recipes
  FOR SELECT
  TO authenticated
  USING (true);  -- For now, all authenticated users can view
  -- Future: USING (auth.uid() IN (SELECT user_id FROM organization_users WHERE org_id = en13813_recipes.org_id))

-- Authenticated users can create recipes
CREATE POLICY "Authenticated users can create recipes" ON en13813_recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- For now, all authenticated users can create
  -- Future: WITH CHECK (auth.uid() IN (SELECT user_id FROM organization_users WHERE org_id = NEW.org_id))

-- Authenticated users can update their organization's recipes
CREATE POLICY "Authenticated users can update recipes" ON en13813_recipes
  FOR UPDATE
  TO authenticated
  USING (true)  -- For now, all authenticated users can update
  WITH CHECK (true);
  -- Future: USING/WITH CHECK (auth.uid() IN (SELECT user_id FROM organization_users WHERE org_id = en13813_recipes.org_id))

-- Authenticated users can delete their organization's recipes
CREATE POLICY "Authenticated users can delete recipes" ON en13813_recipes
  FOR DELETE
  TO authenticated
  USING (true);  -- For now, all authenticated users can delete
  -- Future: USING (auth.uid() IN (SELECT user_id FROM organization_users WHERE org_id = en13813_recipes.org_id))

-- IMPORTANT: Anonymous/public access should be completely blocked
-- No policies for 'anon' role means no access

-- Add comment about security model
COMMENT ON TABLE en13813_recipes IS 'EN13813 recipes with RLS enabled. Access restricted to authenticated users. Future: multi-tenant isolation by org_id.';