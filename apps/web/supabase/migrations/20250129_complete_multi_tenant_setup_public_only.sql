-- ==========================================
-- COMPLETE MULTI-TENANT SETUP FOR EN13813
-- ==========================================
-- Execute this entire script in Supabase SQL Editor
-- https://supabase.com/dashboard/project/fhftgdffhkhmbwqbwiyt/editor

-- 1. CREATE TENANT_USERS TABLE (Missing Link Table)
-- ==========================================

CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Ensure a user can only belong to one tenant
  CONSTRAINT unique_user_tenant UNIQUE(user_id),
  -- Index for faster lookups
  CONSTRAINT unique_tenant_user UNIQUE(tenant_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);

-- Enable RLS
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant_users
DROP POLICY IF EXISTS "Users can view their tenant members" ON tenant_users;
CREATE POLICY "Users can view their tenant members"
  ON tenant_users FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can add tenant members" ON tenant_users;
CREATE POLICY "Admins can add tenant members"
  ON tenant_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE user_id = auth.uid()
        AND tenant_id = tenant_users.tenant_id
        AND role IN ('owner', 'admin')
    )
    OR NOT EXISTS (SELECT 1 FROM tenant_users) -- Allow first user
  );

DROP POLICY IF EXISTS "Admins can update tenant members" ON tenant_users;
CREATE POLICY "Admins can update tenant members"
  ON tenant_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
        AND tu.tenant_id = tenant_users.tenant_id
        AND tu.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Owners can delete tenant members" ON tenant_users;
CREATE POLICY "Owners can delete tenant members"
  ON tenant_users FOR DELETE
  USING (
    user_id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.user_id = auth.uid()
        AND tu.tenant_id = tenant_users.tenant_id
        AND tu.role = 'owner'
    )
  );

-- 2. CREATE HELPER FUNCTION FOR CURRENT TENANT (Public Schema Version)
-- ==========================================

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() LIMIT 1
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_tenant_id() TO authenticated;

-- 3. UPDATE EXISTING TABLES WITH OPTIMIZED RLS
-- ==========================================

-- For en13813_recipes
ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_select" ON en13813_recipes;
CREATE POLICY "tenant_isolation_select" ON en13813_recipes
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tenant_isolation_insert" ON en13813_recipes;
CREATE POLICY "tenant_isolation_insert" ON en13813_recipes
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id()
    OR get_current_tenant_id() IS NULL
  );

DROP POLICY IF EXISTS "tenant_isolation_update" ON en13813_recipes;
CREATE POLICY "tenant_isolation_update" ON en13813_recipes
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tenant_isolation_delete" ON en13813_recipes;
CREATE POLICY "tenant_isolation_delete" ON en13813_recipes
  FOR DELETE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

-- For en13813_batches
ALTER TABLE en13813_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_select" ON en13813_batches;
CREATE POLICY "tenant_isolation_select" ON en13813_batches
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tenant_isolation_insert" ON en13813_batches;
CREATE POLICY "tenant_isolation_insert" ON en13813_batches
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id()
    OR get_current_tenant_id() IS NULL
  );

DROP POLICY IF EXISTS "tenant_isolation_update" ON en13813_batches;
CREATE POLICY "tenant_isolation_update" ON en13813_batches
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tenant_isolation_delete" ON en13813_batches;
CREATE POLICY "tenant_isolation_delete" ON en13813_batches
  FOR DELETE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

-- 4. CREATE LAB VALUES TABLE WITH MULTI-TENANCY
-- ==========================================

CREATE TABLE IF NOT EXISTS en13813_lab_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES en13813_batches(id) ON DELETE SET NULL,

  -- Sample information
  sample_id VARCHAR(100) NOT NULL,
  sample_datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  sample_location VARCHAR(255),
  sampled_by VARCHAR(255),

  -- Test parameters
  test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('fresh', 'hardened', 'both')),
  test_age_days INTEGER,
  test_date TIMESTAMP WITH TIME ZONE,
  tested_by VARCHAR(255),

  -- Fresh concrete properties (JSONB)
  fresh_properties JSONB DEFAULT '{}',

  -- Hardened concrete properties (JSONB)
  hardened_properties JSONB DEFAULT '{}',

  -- Evaluation
  evaluation JSONB DEFAULT '{}',

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,

  -- Comments
  notes TEXT,
  internal_notes TEXT,

  -- Documents
  test_report_url TEXT,
  attachments JSONB DEFAULT '[]',

  -- Quality control
  released BOOLEAN DEFAULT false,
  release_date TIMESTAMP WITH TIME ZONE,
  released_by VARCHAR(255),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT unique_sample_id_per_tenant UNIQUE (tenant_id, sample_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lab_values_tenant ON en13813_lab_values(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_values_recipe ON en13813_lab_values(recipe_id);
CREATE INDEX IF NOT EXISTS idx_lab_values_batch ON en13813_lab_values(batch_id);
CREATE INDEX IF NOT EXISTS idx_lab_values_sample_date ON en13813_lab_values(sample_datetime);
CREATE INDEX IF NOT EXISTS idx_lab_values_status ON en13813_lab_values(status);
CREATE INDEX IF NOT EXISTS idx_lab_values_test_type ON en13813_lab_values(test_type);

-- Enable RLS
ALTER TABLE en13813_lab_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "tenant_isolation_select" ON en13813_lab_values;
CREATE POLICY "tenant_isolation_select" ON en13813_lab_values
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tenant_isolation_insert" ON en13813_lab_values;
CREATE POLICY "tenant_isolation_insert" ON en13813_lab_values
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id()
    OR get_current_tenant_id() IS NULL
  );

DROP POLICY IF EXISTS "tenant_isolation_update" ON en13813_lab_values;
CREATE POLICY "tenant_isolation_update" ON en13813_lab_values
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tenant_isolation_delete" ON en13813_lab_values;
CREATE POLICY "tenant_isolation_delete" ON en13813_lab_values
  FOR DELETE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

-- 5. CREATE LAB MEASUREMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS en13813_lab_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  lab_value_id UUID REFERENCES en13813_lab_values(id) ON DELETE CASCADE,

  parameter_name VARCHAR(100) NOT NULL,
  parameter_value NUMERIC NOT NULL,
  parameter_unit VARCHAR(50),

  specification_min NUMERIC,
  specification_max NUMERIC,
  specification_text VARCHAR(255),

  test_method VARCHAR(100),
  equipment_id VARCHAR(100),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_lab_measurements_tenant ON en13813_lab_measurements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_measurements_lab_value ON en13813_lab_measurements(lab_value_id);

-- Enable RLS
ALTER TABLE en13813_lab_measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "tenant_isolation_select" ON en13813_lab_measurements;
CREATE POLICY "tenant_isolation_select" ON en13813_lab_measurements
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tenant_isolation_insert" ON en13813_lab_measurements;
CREATE POLICY "tenant_isolation_insert" ON en13813_lab_measurements
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id()
    OR get_current_tenant_id() IS NULL
  );

DROP POLICY IF EXISTS "tenant_isolation_update" ON en13813_lab_measurements;
CREATE POLICY "tenant_isolation_update" ON en13813_lab_measurements
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "tenant_isolation_delete" ON en13813_lab_measurements;
CREATE POLICY "tenant_isolation_delete" ON en13813_lab_measurements
  FOR DELETE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
  );

-- 6. CREATE/UPDATE DEMO TENANT
-- ==========================================

-- Insert demo tenant if not exists
INSERT INTO tenants (id, name, subdomain, settings)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Demo Company GmbH',
  'demo',
  '{"locale": "de", "timezone": "Europe/Berlin"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 7. HELPER FUNCTION TO LINK USER TO TENANT (Public Schema)
-- ==========================================

CREATE OR REPLACE FUNCTION link_user_to_tenant(
  p_user_id UUID,
  p_tenant_id UUID,
  p_role VARCHAR(50) DEFAULT 'member'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO tenant_users (user_id, tenant_id, role)
  VALUES (p_user_id, p_tenant_id, p_role)
  ON CONFLICT (user_id) DO UPDATE
  SET tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION link_user_to_tenant(UUID, UUID, VARCHAR) TO authenticated;

-- 8. FUNCTION TO GET USER'S CURRENT TENANT (Public Schema)
-- ==========================================

CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS TABLE (
  id UUID,
  name TEXT,
  subdomain TEXT,
  settings JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.subdomain, t.settings
  FROM tenants t
  INNER JOIN tenant_users tu ON t.id = tu.tenant_id
  WHERE tu.user_id = auth.uid()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_tenant() TO authenticated;

-- 9. CREATE TRIGGER FOR UPDATED_AT (if not exists)
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tenant_users
DROP TRIGGER IF EXISTS update_tenant_users_updated_at ON tenant_users;
CREATE TRIGGER update_tenant_users_updated_at
  BEFORE UPDATE ON tenant_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to lab_values
DROP TRIGGER IF EXISTS update_en13813_lab_values_updated_at ON en13813_lab_values;
CREATE TRIGGER update_en13813_lab_values_updated_at
  BEFORE UPDATE ON en13813_lab_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- VERIFICATION QUERIES (Run these after setup)
-- ==========================================

-- Check all tables exist:
SELECT 'Tables Check:' as check_type, COUNT(*) as found_count, 4 as expected_count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tenants', 'tenant_users', 'en13813_lab_values', 'en13813_lab_measurements');

-- Check RLS is enabled:
SELECT 'RLS Enabled Check:' as check_type, COUNT(*) as enabled_count
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
AND tablename LIKE 'en13813_%';

-- Check if demo tenant exists:
SELECT 'Demo Tenant:' as check_type, name, subdomain
FROM tenants
WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- ==========================================
-- MANUAL STEP: Link your user to demo tenant
-- ==========================================
-- After running this script, you need to:
-- 1. Get your user ID from auth.users
-- 2. Link it to the demo tenant

-- To link the first user automatically (run separately):
/*
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get first user
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;

  IF first_user_id IS NOT NULL THEN
    -- Link to demo tenant
    INSERT INTO tenant_users (user_id, tenant_id, role)
    VALUES (first_user_id, '123e4567-e89b-12d3-a456-426614174000', 'owner')
    ON CONFLICT (user_id) DO UPDATE
    SET tenant_id = EXCLUDED.tenant_id,
        role = EXCLUDED.role,
        updated_at = NOW();

    RAISE NOTICE 'User linked to demo tenant successfully';
  ELSE
    RAISE NOTICE 'No users found';
  END IF;
END $$;
*/