-- EN 13813 DoP Generator - Database Schema

-- Rezepturen (Estrich-Mischungen)
CREATE TABLE en13813_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_code TEXT NOT NULL, -- z.B. "CT-C25-F4"
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('CT', 'CA', 'MA', 'SR', 'AS')) NOT NULL, -- Estrichtypen
  
  -- Technische Eigenschaften
  compressive_strength_class TEXT NOT NULL, -- C5, C7, C12...C80
  flexural_strength_class TEXT NOT NULL, -- F1...F50
  wear_resistance_class TEXT, -- A1...A22, AR0.5...AR6
  fire_class TEXT NOT NULL DEFAULT 'A1fl', -- A1fl, A2fl, Bfl...
  
  -- Zusatzstoffe & Eigenschaften
  additives JSONB DEFAULT '[]',
  special_properties JSONB DEFAULT '{}',
  
  -- Status & Validity
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  valid_from DATE,
  valid_until DATE,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_recipe_code_per_tenant UNIQUE(tenant_id, recipe_code)
);

-- Prüfberichte
CREATE TABLE en13813_test_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  
  report_number TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('initial_type_test', 'factory_control', 'audit')),
  test_date DATE NOT NULL,
  testing_body TEXT NOT NULL,
  notified_body_number TEXT, -- z.B. "0757"
  
  -- Prüfergebnisse
  test_results JSONB NOT NULL,
  /*
  {
    "compressive_strength": { "value": 28.5, "unit": "N/mm²", "test_method": "EN 13892-2" },
    "flexural_strength": { "value": 5.2, "unit": "N/mm²", "test_method": "EN 13892-2" },
    "fire_behavior": { "class": "A1fl", "test_method": "EN 13501-1" },
    "emissions": { "TVOC": "<1000 µg/m³", "formaldehyde": "E1" }
  }
  */
  
  document_id UUID REFERENCES documents(id), -- Verknüpfung zum PDF
  valid_until DATE,
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'revoked')),
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_report_number_per_tenant UNIQUE(tenant_id, report_number)
);

-- Chargen/Batches
CREATE TABLE en13813_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  
  batch_number TEXT NOT NULL,
  production_date DATE NOT NULL,
  quantity_tons DECIMAL(10,2),
  production_site TEXT,
  
  -- Qualitätsdaten
  qc_data JSONB DEFAULT '{}',
  /*
  {
    "compressive_strength_28d": 27.8,
    "flexural_strength_28d": 5.1,
    "flow_diameter": 180,
    "density": 2250,
    "temperature": 20,
    "humidity": 65,
    "test_date": "2024-01-15",
    "tested_by": "Labor Meyer"
  }
  */
  deviation_notes TEXT,
  
  status TEXT DEFAULT 'produced' CHECK (status IN ('produced', 'released', 'blocked', 'consumed')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_batch_number_per_tenant UNIQUE(tenant_id, batch_number)
);

-- Generierte DoPs
CREATE TABLE en13813_dops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES en13813_batches(id),
  
  dop_number TEXT NOT NULL, -- z.B. "2024-CT25-001"
  version INTEGER DEFAULT 1,
  
  -- DoP Inhalte
  product_name TEXT NOT NULL,
  intended_use TEXT DEFAULT 'Estrichmörtel für die Verwendung in Gebäuden gemäß EN 13813',
  manufacturer_info JSONB NOT NULL,
  /*
  {
    "company_name": "Mustermann Estrich GmbH",
    "address": "Industriestraße 1",
    "postal_code": "12345",
    "city": "Musterstadt",
    "country": "Deutschland",
    "phone": "+49 123 456789",
    "email": "info@mustermann-estrich.de",
    "website": "www.mustermann-estrich.de",
    "authorized_person": "Max Mustermann",
    "authorized_person_role": "Geschäftsführer"
  }
  */
  declared_performance JSONB NOT NULL,
  /*
  {
    "essential_characteristics": [
      {"characteristic": "Druckfestigkeit", "performance": "C25", "standard": "EN 13813"},
      {"characteristic": "Biegezugfestigkeit", "performance": "F4", "standard": "EN 13813"},
      ...
    ],
    "system": "System 4",
    "notified_body": "0757"
  }
  */
  
  -- Freigabe
  prepared_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approval_date TIMESTAMPTZ,
  
  -- Dokumente
  pdf_document_id UUID REFERENCES documents(id),
  ce_label_document_id UUID REFERENCES documents(id),
  qr_code TEXT,
  public_url TEXT,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'revoked')),
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_dop_number_version UNIQUE(tenant_id, dop_number, version)
);

-- DoP-Pakete für Händler/Projekte
CREATE TABLE en13813_dop_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  recipient_type TEXT CHECK (recipient_type IN ('dealer', 'project', 'customer')) NOT NULL,
  recipient_info JSONB NOT NULL,
  
  dop_ids UUID[] NOT NULL,
  package_document_id UUID REFERENCES documents(id),
  
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance-Kalender für EN 13813
CREATE TABLE en13813_compliance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  task_type TEXT NOT NULL CHECK (task_type IN ('fpc_audit', 'test_renewal', 'cert_renewal', 'calibration')),
  related_recipe_id UUID REFERENCES en13813_recipes(id),
  related_test_id UUID REFERENCES en13813_test_reports(id),
  
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  reminder_days INTEGER[] DEFAULT '{60,30,7}',
  
  assigned_to UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_en13813_recipes_tenant_id ON en13813_recipes(tenant_id);
CREATE INDEX idx_en13813_recipes_status ON en13813_recipes(status) WHERE status = 'active';
CREATE INDEX idx_en13813_recipes_type ON en13813_recipes(type);

CREATE INDEX idx_en13813_test_reports_recipe_id ON en13813_test_reports(recipe_id);
CREATE INDEX idx_en13813_test_reports_valid_until ON en13813_test_reports(valid_until) WHERE valid_until IS NOT NULL;

CREATE INDEX idx_en13813_batches_recipe_id ON en13813_batches(recipe_id);
CREATE INDEX idx_en13813_batches_production_date ON en13813_batches(production_date DESC);

CREATE INDEX idx_en13813_dops_recipe_id ON en13813_dops(recipe_id);
CREATE INDEX idx_en13813_dops_status ON en13813_dops(status);
CREATE INDEX idx_en13813_dops_issued_at ON en13813_dops(issued_at DESC);

CREATE INDEX idx_en13813_compliance_tasks_due_date ON en13813_compliance_tasks(due_date) WHERE status != 'completed';

-- Enable RLS
ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_dops ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_dop_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_compliance_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (tenant isolation)
CREATE POLICY "tenant_isolation" ON en13813_recipes
  FOR ALL USING (tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::uuid);

CREATE POLICY "service_role_bypass" ON en13813_recipes
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Same policies for all tables
CREATE POLICY "tenant_isolation" ON en13813_test_reports
  FOR ALL USING (tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::uuid);

CREATE POLICY "service_role_bypass" ON en13813_test_reports
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "tenant_isolation" ON en13813_batches
  FOR ALL USING (tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::uuid);

CREATE POLICY "service_role_bypass" ON en13813_batches
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "tenant_isolation" ON en13813_dops
  FOR ALL USING (tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::uuid);

CREATE POLICY "service_role_bypass" ON en13813_dops
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "tenant_isolation" ON en13813_dop_packages
  FOR ALL USING (tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::uuid);

CREATE POLICY "service_role_bypass" ON en13813_dop_packages
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "tenant_isolation" ON en13813_compliance_tasks
  FOR ALL USING (tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::uuid);

CREATE POLICY "service_role_bypass" ON en13813_compliance_tasks
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Triggers
CREATE TRIGGER update_en13813_recipes_updated_at BEFORE UPDATE ON en13813_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_en13813_dops_updated_at BEFORE UPDATE ON en13813_dops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers
CREATE TRIGGER audit_en13813_recipes_changes
  AFTER INSERT OR UPDATE OR DELETE ON en13813_recipes
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_en13813_dops_changes
  AFTER INSERT OR UPDATE OR DELETE ON en13813_dops
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Helper function to generate DoP number
CREATE OR REPLACE FUNCTION generate_dop_number(recipe_type TEXT, recipe_code TEXT)
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_number INTEGER;
  dop_number TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get next sequence number for this year and type
  SELECT COUNT(*) + 1 INTO sequence_number
  FROM en13813_dops
  WHERE tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::uuid
  AND dop_number LIKE year_part || '-%'
  AND recipe_id IN (
    SELECT id FROM en13813_recipes 
    WHERE type = recipe_type
    AND tenant_id = auth.jwt() -> 'user_metadata' ->> 'tenant_id'::uuid
  );
  
  dop_number := year_part || '-' || recipe_type || '-' || LPAD(sequence_number::TEXT, 3, '0');
  
  RETURN dop_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check test report validity
CREATE OR REPLACE FUNCTION check_test_reports_validity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update test report status if expired
  UPDATE en13813_test_reports
  SET status = 'expired'
  WHERE valid_until < CURRENT_DATE
  AND status = 'valid';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Daily job to check test report validity
CREATE TRIGGER check_test_validity_daily
  AFTER INSERT ON en13813_test_reports
  FOR EACH STATEMENT EXECUTE FUNCTION check_test_reports_validity();