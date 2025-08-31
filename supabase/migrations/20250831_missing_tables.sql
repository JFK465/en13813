-- Create missing tables for EN13813 module

-- 1. Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create tenants table if not exists
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create documents table if not exists
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  mime_type TEXT,
  storage_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create audit_logs table if not exists
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for tenants (simplified)
CREATE POLICY "Users can view their tenant" ON tenants
  FOR ALL USING (true);

-- Create policies for documents
CREATE POLICY "Users can manage documents" ON documents
  FOR ALL USING (true);

-- Create policies for audit_logs
CREATE POLICY "Users can view audit logs" ON audit_logs
  FOR SELECT USING (true);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Create a new tenant for the user if none exists
  INSERT INTO public.tenants (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    gen_random_uuid()::TEXT
  )
  RETURNING id INTO new_tenant_id;

  -- Create profile
  INSERT INTO public.profiles (id, tenant_id, email, full_name)
  VALUES (
    NEW.id,
    new_tenant_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON tenants TO authenticated;
GRANT ALL ON documents TO authenticated;
GRANT ALL ON audit_logs TO authenticated;