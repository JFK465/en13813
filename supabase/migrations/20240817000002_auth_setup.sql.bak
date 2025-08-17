-- Enable Row Level Security (RLS) on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only owners can update tenant" ON tenants
  FOR UPDATE USING (
    id IN (
      SELECT tenant_id FROM profiles 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Profile policies
CREATE POLICY "Users can view profiles in their tenant" ON profiles
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their tenant" ON profiles
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Audit log policies (read-only)
CREATE POLICY "Users can view audit logs in their tenant" ON audit_logs
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- API key policies
CREATE POLICY "Admins can manage API keys" ON api_keys
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Webhook policies
CREATE POLICY "Admins can manage webhooks" ON webhooks
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Service role bypass policies (for backend operations)
CREATE POLICY "Service role bypass" ON tenants
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON audit_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON api_keys
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON webhooks
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  tenant_id_from_metadata UUID;
BEGIN
  -- Check if user has tenant_id in metadata (invited user)
  tenant_id_from_metadata := (NEW.raw_user_meta_data->>'tenant_id')::UUID;
  
  IF tenant_id_from_metadata IS NOT NULL THEN
    -- User was invited to existing tenant
    INSERT INTO profiles (id, email, tenant_id, role)
    VALUES (
      NEW.id,
      NEW.email,
      tenant_id_from_metadata,
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member')
    );
  ELSE
    -- New signup - create tenant and profile
    WITH new_tenant AS (
      INSERT INTO tenants (
        slug,
        company_name,
        trial_ends_at
      ) VALUES (
        -- Generate unique slug from email
        LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '-', 'g')),
        COALESCE(NEW.raw_user_meta_data->>'company_name', SPLIT_PART(NEW.email, '@', 1)),
        NOW() + INTERVAL '14 days'
      )
      RETURNING id
    )
    INSERT INTO profiles (id, email, tenant_id, role)
    SELECT 
      NEW.id,
      NEW.email,
      new_tenant.id,
      'owner'
    FROM new_tenant;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to add tenant_id to JWT claims
CREATE OR REPLACE FUNCTION auth.jwt_claims()
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  tenant_id UUID;
  user_role TEXT;
BEGIN
  claims := auth.jwt();
  
  IF claims IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get tenant_id and role from profiles
  SELECT p.tenant_id, p.role::TEXT 
  INTO tenant_id, user_role
  FROM profiles p 
  WHERE p.id = (claims->>'sub')::UUID;
  
  -- Add custom claims
  claims := jsonb_set(claims, '{user_metadata,tenant_id}', to_jsonb(tenant_id));
  claims := jsonb_set(claims, '{user_metadata,role}', to_jsonb(user_role));
  
  RETURN claims;
END;
$$ LANGUAGE plpgsql STABLE;