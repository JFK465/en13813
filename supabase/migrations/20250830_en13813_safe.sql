-- EN 13813 Safe Migration (Checks for existing objects)
-- This migration can be run multiple times safely

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. REZEPTUREN (Recipes) - Check if table exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_recipes') THEN
    CREATE TABLE en13813_recipes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      
      -- Identifikation
      recipe_code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      
      -- EN 13813 Klassifizierung
      estrich_type TEXT NOT NULL CHECK (estrich_type IN ('CT', 'CA', 'MA', 'AS', 'SR')),
      
      -- Pflicht-Eigenschaften
      compressive_strength TEXT NOT NULL,
      flexural_strength TEXT NOT NULL,
      
      -- Optionale Eigenschaften
      wear_resistance TEXT,
      hardness TEXT,
      rolling_wheel TEXT,
      impact_resistance TEXT,
      
      -- Brand & Emissionen
      fire_class TEXT DEFAULT 'A1fl',
      emissions JSONB DEFAULT '{}',
      
      -- Zusätzliche Daten
      additives JSONB DEFAULT '[]',
      mixing_ratio JSONB,
      application_thickness_min INTEGER,
      application_thickness_max INTEGER,
      
      -- Status & Validierung
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
      validation_errors JSONB DEFAULT '[]',
      is_validated BOOLEAN DEFAULT false,
      
      -- Metadata
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID REFERENCES profiles(id),
      updated_by UUID REFERENCES profiles(id),
      
      CONSTRAINT unique_recipe_code_per_tenant UNIQUE(tenant_id, recipe_code)
    );
  END IF;
END $$;

-- 2. PRÜFBERICHTE (Test Reports)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_test_reports') THEN
    CREATE TABLE en13813_test_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
      
      -- Report Details
      report_number TEXT NOT NULL,
      report_type TEXT NOT NULL CHECK (report_type IN (
        'initial_type_testing',
        'factory_production_control',
        'external_monitoring'
      )),
      
      -- Prüfstelle
      testing_institute TEXT NOT NULL,
      notified_body_number TEXT,
      
      -- Prüfdaten
      test_date DATE NOT NULL,
      sample_date DATE,
      
      -- Prüfergebnisse
      test_results JSONB NOT NULL,
      
      -- Dokument
      document_id UUID REFERENCES documents(id),
      document_url TEXT,
      
      -- Gültigkeit
      valid_from DATE DEFAULT CURRENT_DATE,
      valid_until DATE NOT NULL,
      is_expired BOOLEAN GENERATED ALWAYS AS (valid_until < CURRENT_DATE) STORED,
      
      -- Status
      status TEXT DEFAULT 'valid' CHECK (status IN ('draft', 'valid', 'expired', 'revoked')),
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID REFERENCES profiles(id)
    );
  END IF;
END $$;

-- 3. CHARGEN (Batches)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_batches') THEN
    CREATE TABLE en13813_batches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      recipe_id UUID NOT NULL REFERENCES en13813_recipes(id),
      
      -- Chargen-Info
      batch_number TEXT NOT NULL,
      production_date DATE NOT NULL,
      production_site TEXT,
      mixer_number TEXT,
      
      -- Mengen
      quantity_tons DECIMAL(10,2),
      quantity_m3 DECIMAL(10,2),
      
      -- QC Daten
      qc_test_results JSONB,
      qc_passed BOOLEAN DEFAULT true,
      deviation_notes TEXT,
      
      -- Verwendung
      customer_name TEXT,
      project_name TEXT,
      delivery_note_numbers TEXT[],
      
      status TEXT DEFAULT 'produced',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      
      CONSTRAINT unique_batch_per_tenant UNIQUE(tenant_id, batch_number)
    );
  END IF;
END $$;

-- 4. LEISTUNGSERKLÄRUNGEN (DoPs)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_dops') THEN
    CREATE TABLE en13813_dops (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      
      -- Verknüpfungen
      recipe_id UUID NOT NULL REFERENCES en13813_recipes(id),
      batch_id UUID REFERENCES en13813_batches(id),
      test_report_ids UUID[] DEFAULT '{}',
      
      -- DoP Identifikation
      dop_number TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      revision_of UUID REFERENCES en13813_dops(id),
      
      -- Hersteller-Daten
      manufacturer_data JSONB NOT NULL,
      
      -- Deklarierte Leistung
      declared_performance JSONB NOT NULL,
      
      -- Generierte Dokumente
      pdf_document_id UUID REFERENCES documents(id),
      ce_label_document_id UUID REFERENCES documents(id),
      
      -- QR Code & Public Access
      qr_code_data TEXT,
      public_uuid UUID DEFAULT gen_random_uuid(),
      public_url TEXT GENERATED ALWAYS AS (
        'https://dop.estrichwerke.de/view/' || public_uuid
      ) STORED,
      
      -- Workflow
      workflow_status TEXT DEFAULT 'draft' CHECK (workflow_status IN (
        'draft', 'submitted', 'reviewed', 'approved', 'published', 'revoked'
      )),
      submitted_at TIMESTAMPTZ,
      submitted_by UUID REFERENCES profiles(id),
      reviewed_at TIMESTAMPTZ,
      reviewed_by UUID REFERENCES profiles(id),
      approved_at TIMESTAMPTZ,
      approved_by UUID REFERENCES profiles(id),
      published_at TIMESTAMPTZ,
      
      -- Gültigkeit
      issue_date DATE,
      expiry_date DATE,
      is_active BOOLEAN DEFAULT false,
      
      -- Audit
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      CONSTRAINT unique_dop_number UNIQUE(tenant_id, dop_number, version)
    );
  END IF;
END $$;

-- 5. DOP PAKETE
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_dop_packages') THEN
    CREATE TABLE en13813_dop_packages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      
      name TEXT NOT NULL,
      description TEXT,
      recipient_type TEXT CHECK (recipient_type IN ('dealer', 'project', 'authority', 'customer')),
      recipient_data JSONB,
      
      -- Enthaltene DoPs
      dop_ids UUID[] NOT NULL,
      
      -- Generiertes Paket
      package_document_id UUID REFERENCES documents(id),
      download_url TEXT,
      download_count INTEGER DEFAULT 0,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID REFERENCES profiles(id)
    );
  END IF;
END $$;

-- 6. COMPLIANCE AUFGABEN
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_compliance_tasks') THEN
    CREATE TABLE en13813_compliance_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
      
      task_type TEXT NOT NULL CHECK (task_type IN (
        'test_report_renewal',
        'fpc_audit',
        'external_audit',
        'ce_renewal',
        'recipe_validation'
      )),
      
      -- Verknüpfungen
      recipe_id UUID REFERENCES en13813_recipes(id),
      test_report_id UUID REFERENCES en13813_test_reports(id),
      
      -- Task Details
      title TEXT NOT NULL,
      description TEXT,
      due_date DATE NOT NULL,
      reminder_days INTEGER[] DEFAULT '{60,30,14,7,1}',
      
      -- Assignment
      assigned_to UUID REFERENCES profiles(id),
      assigned_role TEXT,
      
      -- Status
      status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'cancelled'
      )),
      completed_at TIMESTAMPTZ,
      completed_by UUID REFERENCES profiles(id),
      completion_notes TEXT,
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- INDICES (Create if not exists)
CREATE INDEX IF NOT EXISTS idx_recipes_tenant_status ON en13813_recipes(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_test_reports_recipe ON en13813_test_reports(recipe_id);
CREATE INDEX IF NOT EXISTS idx_test_reports_expiry ON en13813_test_reports(valid_until) WHERE status = 'valid';
CREATE INDEX IF NOT EXISTS idx_dops_tenant_status ON en13813_dops(tenant_id, workflow_status);
CREATE INDEX IF NOT EXISTS idx_dops_public_uuid ON en13813_dops(public_uuid);
CREATE INDEX IF NOT EXISTS idx_compliance_due ON en13813_compliance_tasks(due_date) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_batches_recipe ON en13813_batches(recipe_id);

-- Enable RLS (safe to run multiple times)
ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_dops ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_dop_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_compliance_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DO $$ 
BEGIN
  -- Recipes policies
  DROP POLICY IF EXISTS "Users can view recipes in their tenant" ON en13813_recipes;
  DROP POLICY IF EXISTS "Users can create recipes in their tenant" ON en13813_recipes;
  DROP POLICY IF EXISTS "Users can update recipes in their tenant" ON en13813_recipes;
  DROP POLICY IF EXISTS "Users can delete recipes in their tenant" ON en13813_recipes;
  
  CREATE POLICY "Users can view recipes in their tenant"
    ON en13813_recipes FOR SELECT
    USING (
      tenant_id IS NULL OR 
      tenant_id = COALESCE(
        (SELECT tenant_id FROM profiles WHERE id = auth.uid()),
        '00000000-0000-0000-0000-000000000000'::uuid
      )
    );

  CREATE POLICY "Users can create recipes in their tenant"
    ON en13813_recipes FOR INSERT
    WITH CHECK (
      tenant_id IS NULL OR
      tenant_id = COALESCE(
        (SELECT tenant_id FROM profiles WHERE id = auth.uid()),
        '00000000-0000-0000-0000-000000000000'::uuid
      )
    );

  CREATE POLICY "Users can update recipes in their tenant"
    ON en13813_recipes FOR UPDATE
    USING (
      tenant_id IS NULL OR
      tenant_id = COALESCE(
        (SELECT tenant_id FROM profiles WHERE id = auth.uid()),
        '00000000-0000-0000-0000-000000000000'::uuid
      )
    );

  CREATE POLICY "Users can delete recipes in their tenant"
    ON en13813_recipes FOR DELETE
    USING (
      tenant_id IS NULL OR
      tenant_id = COALESCE(
        (SELECT tenant_id FROM profiles WHERE id = auth.uid()),
        '00000000-0000-0000-0000-000000000000'::uuid
      )
    );
END $$;

-- Similar policies for other tables (simplified for now)
DO $$ 
BEGIN
  -- Test Reports
  DROP POLICY IF EXISTS "Users can manage test reports" ON en13813_test_reports;
  CREATE POLICY "Users can manage test reports"
    ON en13813_test_reports FOR ALL
    USING (true)
    WITH CHECK (true);

  -- Batches
  DROP POLICY IF EXISTS "Users can manage batches" ON en13813_batches;
  CREATE POLICY "Users can manage batches"
    ON en13813_batches FOR ALL
    USING (true)
    WITH CHECK (true);

  -- DoPs
  DROP POLICY IF EXISTS "Users can manage dops" ON en13813_dops;
  CREATE POLICY "Users can manage dops"
    ON en13813_dops FOR ALL
    USING (true)
    WITH CHECK (true);

  -- DoP Packages
  DROP POLICY IF EXISTS "Users can manage packages" ON en13813_dop_packages;
  CREATE POLICY "Users can manage packages"
    ON en13813_dop_packages FOR ALL
    USING (true)
    WITH CHECK (true);

  -- Compliance Tasks
  DROP POLICY IF EXISTS "Users can manage tasks" ON en13813_compliance_tasks;
  CREATE POLICY "Users can manage tasks"
    ON en13813_compliance_tasks FOR ALL
    USING (true)
    WITH CHECK (true);
END $$;

-- Create update trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (safe to run multiple times)
DROP TRIGGER IF EXISTS update_en13813_recipes_updated_at ON en13813_recipes;
CREATE TRIGGER update_en13813_recipes_updated_at
  BEFORE UPDATE ON en13813_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_en13813_dops_updated_at ON en13813_dops;
CREATE TRIGGER update_en13813_dops_updated_at
  BEFORE UPDATE ON en13813_dops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert test data for development
DO $$
BEGIN
  -- Check if we have any recipes, if not, insert test data
  IF NOT EXISTS (SELECT 1 FROM en13813_recipes LIMIT 1) THEN
    -- Get first tenant or create a test one
    DECLARE
      v_tenant_id UUID;
    BEGIN
      -- Try to get existing tenant
      SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
      
      -- If no tenant exists, skip test data (will be created via app)
      IF v_tenant_id IS NOT NULL THEN
        -- Insert test recipes
        INSERT INTO en13813_recipes (
          tenant_id, recipe_code, name, description,
          estrich_type, compressive_strength, flexural_strength,
          wear_resistance, fire_class, status, is_validated
        ) VALUES 
        (
          v_tenant_id,
          'CT-C25-F4',
          'Standard Zementestrich',
          'Standardrezeptur für Zementestrich mit normaler Belastung',
          'CT', 'C25', 'F4', 'A12', 'A1fl',
          'active', true
        ),
        (
          v_tenant_id,
          'CA-C30-F5',
          'Premium Calciumsulfatestrich',
          'Hochwertige Rezeptur für Calciumsulfatestrich',
          'CA', 'C30', 'F5', 'A9', 'A1fl',
          'active', true
        ),
        (
          v_tenant_id,
          'CT-C35-F6',
          'Hochfester Zementestrich',
          'Spezialrezeptur für hohe Belastungen',
          'CT', 'C35', 'F6', 'A6', 'A1fl',
          'draft', false
        );
        
        RAISE NOTICE 'Test recipes created successfully';
      END IF;
    END;
  END IF;
END $$;

-- Create a view for statistics (if not exists)
CREATE OR REPLACE VIEW en13813_statistics AS
SELECT 
  COUNT(DISTINCT r.id) as total_recipes,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'active') as active_recipes,
  COUNT(DISTINCT d.id) as total_dops,
  COUNT(DISTINCT d.id) FILTER (WHERE d.workflow_status = 'published') as published_dops,
  COUNT(DISTINCT b.id) as total_batches,
  COUNT(DISTINCT t.id) as total_test_reports,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'valid' AND (t.valid_until IS NULL OR t.valid_until > CURRENT_DATE)) as valid_test_reports
FROM 
  en13813_recipes r
  LEFT JOIN en13813_dops d ON d.recipe_id = r.id
  LEFT JOIN en13813_batches b ON b.recipe_id = r.id
  LEFT JOIN en13813_test_reports t ON t.recipe_id = r.id;

-- Grant permissions (safe to run multiple times)
GRANT ALL ON en13813_recipes TO authenticated;
GRANT ALL ON en13813_test_reports TO authenticated;
GRANT ALL ON en13813_batches TO authenticated;
GRANT ALL ON en13813_dops TO authenticated;
GRANT ALL ON en13813_dop_packages TO authenticated;
GRANT ALL ON en13813_compliance_tasks TO authenticated;
GRANT SELECT ON en13813_statistics TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'EN13813 migration completed successfully!';
  RAISE NOTICE 'Tables created/verified: recipes, test_reports, batches, dops, packages, compliance_tasks';
  RAISE NOTICE 'You can now use the EN13813 module.';
END $$;