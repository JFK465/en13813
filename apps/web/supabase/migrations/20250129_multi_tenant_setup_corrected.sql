-- ==========================================
-- MULTI-TENANT SETUP FOR EN13813 - CORRECTED VERSION
-- ==========================================
-- Angepasst an die tatsächliche tenants Tabellen-Struktur mit 'slug' statt 'subdomain'

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

-- 2. CREATE HELPER FUNCTION FOR CURRENT TENANT
-- ==========================================

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() LIMIT 1
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_tenant_id() TO authenticated;

-- 3. UPDATE RLS POLICIES FOR EXISTING TABLES
-- ==========================================

-- Helper function to check if user has tenant
CREATE OR REPLACE FUNCTION user_has_tenant()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM tenant_users WHERE user_id = auth.uid())
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION user_has_tenant() TO authenticated;

-- Update RLS for en13813_recipes
ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_select" ON en13813_recipes;
CREATE POLICY "tenant_isolation_select" ON en13813_recipes
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT user_has_tenant()
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
    OR NOT user_has_tenant()
  );

DROP POLICY IF EXISTS "tenant_isolation_delete" ON en13813_recipes;
CREATE POLICY "tenant_isolation_delete" ON en13813_recipes
  FOR DELETE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT user_has_tenant()
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lab_values_tenant ON en13813_lab_values(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lab_values_recipe ON en13813_lab_values(recipe_id);
CREATE INDEX IF NOT EXISTS idx_lab_values_batch ON en13813_lab_values(batch_id);
CREATE INDEX IF NOT EXISTS idx_lab_values_sample_date ON en13813_lab_values(sample_datetime);
CREATE INDEX IF NOT EXISTS idx_lab_values_status ON en13813_lab_values(status);

-- Enable RLS
ALTER TABLE en13813_lab_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "tenant_isolation_select" ON en13813_lab_values;
CREATE POLICY "tenant_isolation_select" ON en13813_lab_values
  FOR SELECT USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT user_has_tenant()
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
    OR NOT user_has_tenant()
  );

DROP POLICY IF EXISTS "tenant_isolation_delete" ON en13813_lab_values;
CREATE POLICY "tenant_isolation_delete" ON en13813_lab_values
  FOR DELETE USING (
    tenant_id = get_current_tenant_id()
    OR tenant_id IS NULL
    OR NOT user_has_tenant()
  );

-- 5. CREATE/UPDATE DEMO TENANT
-- ==========================================

-- Insert demo tenant with correct columns (slug instead of subdomain)
INSERT INTO tenants (id, name, slug, status)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Demo Company GmbH',
  'demo-company',
  'active'
) ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    status = EXCLUDED.status;

-- 6. HELPER FUNCTIONS
-- ==========================================

-- Function to link user to tenant
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

GRANT EXECUTE ON FUNCTION link_user_to_tenant(UUID, UUID, VARCHAR) TO authenticated;

-- Function to get current tenant details
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  slug VARCHAR(255),
  status tenant_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.slug, t.status
  FROM tenants t
  INNER JOIN tenant_users tu ON t.id = tu.tenant_id
  WHERE tu.user_id = auth.uid()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_current_tenant() TO authenticated;

-- 7. CREATE TRIGGER FOR UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_tenant_users_updated_at ON tenant_users;
CREATE TRIGGER update_tenant_users_updated_at
  BEFORE UPDATE ON tenant_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_en13813_lab_values_updated_at ON en13813_lab_values;
CREATE TRIGGER update_en13813_lab_values_updated_at
  BEFORE UPDATE ON en13813_lab_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check tables
SELECT 'Tables Check' as info, COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tenants', 'tenant_users', 'en13813_lab_values');

-- Check demo tenant
SELECT 'Demo Tenant' as info, name, slug, status
FROM tenants
WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- ==========================================
-- MANUAL STEP: Link your user to demo tenant
-- ==========================================
-- Nach erfolgreicher Ausführung:
-- 1. Finde deine User ID: SELECT id, email FROM auth.users LIMIT 1;
-- 2. Führe aus (ersetze YOUR_USER_ID mit der tatsächlichen ID):
/*
INSERT INTO tenant_users (user_id, tenant_id, role)
VALUES ('YOUR_USER_ID', '123e4567-e89b-12d3-a456-426614174000', 'owner')
ON CONFLICT (user_id) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id, role = EXCLUDED.role;
*/