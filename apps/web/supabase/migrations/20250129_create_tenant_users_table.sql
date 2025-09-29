-- Create tenant_users table if it doesn't exist
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
-- Users can only see members of their own tenant
CREATE POLICY "Users can view their tenant members"
  ON tenant_users FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  );

-- Only tenant admins can insert new members
CREATE POLICY "Admins can add tenant members"
  ON tenant_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE user_id = auth.uid()
        AND tenant_id = tenant_users.tenant_id
        AND role IN ('owner', 'admin')
    )
  );

-- Only tenant admins can update members
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

-- Only tenant owners can delete members (but not themselves)
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

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenant_users_updated_at
  BEFORE UPDATE ON tenant_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();