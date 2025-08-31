-- EN 13813 Complete Schema Migration
-- Leistungserklärungen für Estrichmörtel

-- 1. REZEPTUREN (Recipes)
CREATE TABLE IF NOT EXISTS en13813_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
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

-- 2. PRÜFBERICHTE (Test Reports)
CREATE TABLE IF NOT EXISTS en13813_test_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- 3. CHARGEN (Batches)
CREATE TABLE IF NOT EXISTS en13813_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- 4. LEISTUNGSERKLÄRUNGEN (DoPs)
CREATE TABLE IF NOT EXISTS en13813_dops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Verknüpfungen
  recipe_id UUID NOT NULL REFERENCES en13813_recipes(id),
  batch_id UUID REFERENCES en13813_batches(id),
  test_report_ids UUID[] NOT NULL DEFAULT '{}',
  
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

-- 5. DOP PAKETE (für Händler/Projekte)
CREATE TABLE IF NOT EXISTS en13813_dop_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
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

-- 6. COMPLIANCE AUFGABEN
CREATE TABLE IF NOT EXISTS en13813_compliance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
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

-- INDICES für Performance
CREATE INDEX IF NOT EXISTS idx_recipes_tenant_status ON en13813_recipes(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_test_reports_recipe ON en13813_test_reports(recipe_id);
CREATE INDEX IF NOT EXISTS idx_test_reports_expiry ON en13813_test_reports(valid_until) WHERE status = 'valid';
CREATE INDEX IF NOT EXISTS idx_dops_tenant_status ON en13813_dops(tenant_id, workflow_status);
CREATE INDEX IF NOT EXISTS idx_dops_public_uuid ON en13813_dops(public_uuid);
CREATE INDEX IF NOT EXISTS idx_compliance_due ON en13813_compliance_tasks(due_date) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_batches_recipe ON en13813_batches(recipe_id);

-- RLS POLICIES
ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_dops ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_dop_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_compliance_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Recipes
CREATE POLICY "Users can view recipes in their tenant"
  ON en13813_recipes FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create recipes in their tenant"
  ON en13813_recipes FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update recipes in their tenant"
  ON en13813_recipes FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete recipes in their tenant"
  ON en13813_recipes FOR DELETE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies für Test Reports
CREATE POLICY "Users can view test reports in their tenant"
  ON en13813_test_reports FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create test reports in their tenant"
  ON en13813_test_reports FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update test reports in their tenant"
  ON en13813_test_reports FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies für Batches
CREATE POLICY "Users can view batches in their tenant"
  ON en13813_batches FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create batches in their tenant"
  ON en13813_batches FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update batches in their tenant"
  ON en13813_batches FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies für DoPs
CREATE POLICY "Users can view DoPs in their tenant"
  ON en13813_dops FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create DoPs in their tenant"
  ON en13813_dops FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update DoPs in their tenant"
  ON en13813_dops FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Public access for published DoPs
CREATE POLICY "Public can view published DoPs via UUID"
  ON en13813_dops FOR SELECT
  USING (
    workflow_status = 'published' AND 
    public_uuid IS NOT NULL
  );

-- RLS Policies für DoP Packages
CREATE POLICY "Users can view DoP packages in their tenant"
  ON en13813_dop_packages FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create DoP packages in their tenant"
  ON en13813_dop_packages FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies für Compliance Tasks
CREATE POLICY "Users can view compliance tasks in their tenant"
  ON en13813_compliance_tasks FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create compliance tasks in their tenant"
  ON en13813_compliance_tasks FOR INSERT
  WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update compliance tasks in their tenant"
  ON en13813_compliance_tasks FOR UPDATE
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- TRIGGER für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_en13813_recipes_updated_at
  BEFORE UPDATE ON en13813_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_en13813_dops_updated_at
  BEFORE UPDATE ON en13813_dops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCTION zum Generieren der DoP-Nummer
CREATE OR REPLACE FUNCTION generate_dop_number(
  p_tenant_id UUID,
  p_estrich_type TEXT,
  p_strength_class TEXT
) RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_dop_number TEXT;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');
  
  -- Zähle existierende DoPs für dieses Jahr und Typ
  SELECT COUNT(*) + 1 INTO v_count
  FROM en13813_dops
  WHERE tenant_id = p_tenant_id
    AND dop_number LIKE v_year || '-' || p_estrich_type || p_strength_class || '-%';
  
  -- Generiere DoP-Nummer
  v_dop_number := v_year || '-' || p_estrich_type || p_strength_class || '-' || LPAD(v_count::TEXT, 3, '0');
  
  RETURN v_dop_number;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION für Compliance-Task-Erstellung
CREATE OR REPLACE FUNCTION create_compliance_task_for_test_report()
RETURNS TRIGGER AS $$
BEGIN
  -- Erstelle Reminder für ablaufende Prüfberichte
  IF NEW.valid_until IS NOT NULL THEN
    INSERT INTO en13813_compliance_tasks (
      tenant_id,
      task_type,
      test_report_id,
      recipe_id,
      title,
      description,
      due_date,
      status
    ) VALUES (
      NEW.tenant_id,
      'test_report_renewal',
      NEW.id,
      NEW.recipe_id,
      'Prüfbericht erneuern: ' || NEW.report_number,
      'Der Prüfbericht ' || NEW.report_number || ' läuft am ' || NEW.valid_until || ' ab.',
      NEW.valid_until - INTERVAL '60 days',
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_compliance_task_on_test_report
  AFTER INSERT ON en13813_test_reports
  FOR EACH ROW EXECUTE FUNCTION create_compliance_task_for_test_report();

-- Beispiel-Daten für Entwicklung (optional)
-- INSERT INTO en13813_recipes (tenant_id, recipe_code, name, estrich_type, compressive_strength, flexural_strength)
-- VALUES 
--   ((SELECT id FROM tenants LIMIT 1), 'CT-C25-F4', 'Standard Zementestrich', 'CT', 'C25', 'F4'),
--   ((SELECT id FROM tenants LIMIT 1), 'CA-C30-F5', 'Premium Calciumsulfatestrich', 'CA', 'C30', 'F5');