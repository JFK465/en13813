-- Migration: Complete FPC-DOP Integration and CE Label Support
-- Date: 2025-01-02
-- Description: Add missing fields for FPC integration, CE labels, and notified body validation

-- Add FPC fields to DoP table
ALTER TABLE en13813_dops
ADD COLUMN IF NOT EXISTS fpc_compliant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fpc_audit_id UUID REFERENCES en13813_fpc_audits(id),
ADD COLUMN IF NOT EXISTS fpc_audit_date DATE,
ADD COLUMN IF NOT EXISTS fpc_next_audit_date DATE,
ADD COLUMN IF NOT EXISTS ce_label_document_id UUID,
ADD COLUMN IF NOT EXISTS batch_label_document_id UUID,
ADD COLUMN IF NOT EXISTS notified_body_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notified_body_validation_date TIMESTAMP;

-- Create FPC Audits table if not exists
CREATE TABLE IF NOT EXISTS en13813_fpc_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  dop_id UUID REFERENCES en13813_dops(id) ON DELETE SET NULL,
  
  -- Audit information
  audit_date DATE NOT NULL,
  audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN ('internal', 'external', 'notified_body')),
  auditor_name VARCHAR(255) NOT NULL,
  auditor_organization VARCHAR(255),
  
  -- Compliance areas
  incoming_materials_compliant BOOLEAN NOT NULL DEFAULT false,
  production_control_compliant BOOLEAN NOT NULL DEFAULT false,
  testing_compliant BOOLEAN NOT NULL DEFAULT false,
  calibration_compliant BOOLEAN NOT NULL DEFAULT false,
  documentation_compliant BOOLEAN NOT NULL DEFAULT false,
  
  -- Results
  overall_compliant BOOLEAN NOT NULL DEFAULT false,
  non_conformities TEXT[],
  corrective_actions TEXT[],
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  
  -- Certification (for System 1+)
  certificate_number VARCHAR(100),
  certificate_issued_date DATE,
  valid_until DATE,
  
  -- Documents
  audit_report_id UUID,
  certificate_document_id UUID,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  CONSTRAINT unique_audit_date_recipe UNIQUE(recipe_id, audit_date)
);

-- Create FPC Test Results table for ongoing monitoring
CREATE TABLE IF NOT EXISTS en13813_fpc_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES en13813_batches(id) ON DELETE CASCADE,
  control_plan_id UUID REFERENCES en13813_fpc_control_plans(id),
  
  -- Test information
  test_date DATE NOT NULL,
  test_type VARCHAR(100) NOT NULL,
  test_method VARCHAR(100),
  test_norm VARCHAR(50),
  
  -- Results
  test_value NUMERIC,
  test_unit VARCHAR(20),
  test_result TEXT,
  pass_fail VARCHAR(10) CHECK (pass_fail IN ('pass', 'fail', 'warning')),
  
  -- Limits
  lower_limit NUMERIC,
  upper_limit NUMERIC,
  warning_limit NUMERIC,
  action_limit NUMERIC,
  
  -- Documentation
  test_report_number VARCHAR(100),
  tested_by VARCHAR(255),
  laboratory VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  
  INDEX idx_fpc_test_recipe_date (recipe_id, test_date),
  INDEX idx_fpc_test_type (test_type)
);

-- Create Notified Bodies reference table
CREATE TABLE IF NOT EXISTS notified_bodies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(4) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(2) NOT NULL,
  
  -- Scope and authorization
  scope TEXT[],
  standards TEXT[],
  authorized_tasks TEXT[],
  
  -- Contact information
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Validity
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  
  -- EU NANDO database reference
  nando_id VARCHAR(50),
  last_nando_sync TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_notified_body_number (number),
  INDEX idx_notified_body_active (is_active)
);

-- Insert common notified bodies for EN 13813
INSERT INTO notified_bodies (number, name, country, scope, standards, website, is_active)
VALUES 
  ('0672', 'MFPA Leipzig GmbH', 'DE', 
   ARRAY['Fire classification', 'System 1+', 'Factory production control'],
   ARRAY['EN 13813:2002'],
   'www.mfpa.de', true),
  ('0769', 'Kiwa GmbH', 'DE',
   ARRAY['Fire classification', 'System 1+', 'Factory production control'],
   ARRAY['EN 13813:2002'],
   'www.kiwa.de', true),
  ('1020', 'VDE Testing and Certification Institute', 'DE',
   ARRAY['Fire classification', 'Electrical properties'],
   ARRAY['EN 13813:2002'],
   'www.vde.com', true),
  ('0099', 'BM TRADA Certification Ltd', 'UK',
   ARRAY['Fire classification', 'System 1+'],
   ARRAY['EN 13813:2002'],
   'www.bmtrada.com', true),
  ('0432', 'BRE Global Ltd', 'UK',
   ARRAY['Fire classification', 'System 1+'],
   ARRAY['EN 13813:2002'],
   'www.bregroup.com', true),
  ('2451', 'TÜV Rheinland', 'DE',
   ARRAY['System 1+', 'Factory production control'],
   ARRAY['EN 13813:2002'],
   'www.tuv.com', true)
ON CONFLICT (number) DO UPDATE
SET 
  name = EXCLUDED.name,
  scope = EXCLUDED.scope,
  standards = EXCLUDED.standards,
  website = EXCLUDED.website,
  updated_at = NOW();

-- Create CE Label Generation Log
CREATE TABLE IF NOT EXISTS en13813_ce_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dop_id UUID REFERENCES en13813_dops(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES en13813_batches(id),
  
  -- Label type
  label_type VARCHAR(50) NOT NULL CHECK (label_type IN ('ce_marking', 'batch_label', 'product_label')),
  
  -- Generated documents
  document_id UUID,
  document_url TEXT,
  
  -- Label data
  label_data JSONB,
  language VARCHAR(2) DEFAULT 'de',
  
  -- Metadata
  generated_at TIMESTAMP DEFAULT NOW(),
  generated_by UUID,
  
  INDEX idx_ce_label_dop (dop_id),
  INDEX idx_ce_label_batch (batch_id)
);

-- Add FPC compliance check function
CREATE OR REPLACE FUNCTION check_fpc_compliance(p_recipe_id UUID)
RETURNS TABLE (
  compliant BOOLEAN,
  last_audit_date DATE,
  next_audit_date DATE,
  days_until_audit INTEGER,
  compliance_score INTEGER,
  missing_tests TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_audit AS (
    SELECT 
      a.*,
      a.audit_date + INTERVAL '1 year' AS next_audit
    FROM en13813_fpc_audits a
    WHERE a.recipe_id = p_recipe_id
    ORDER BY a.audit_date DESC
    LIMIT 1
  ),
  missing_tests AS (
    SELECT 
      array_agg(DISTINCT test_type) AS tests
    FROM (
      SELECT 'compressive_strength' AS test_type
      UNION SELECT 'flexural_strength'
      UNION SELECT 'consistency'
      UNION SELECT 'density'
    ) required_tests
    WHERE NOT EXISTS (
      SELECT 1 
      FROM en13813_fpc_test_results t
      WHERE t.recipe_id = p_recipe_id
      AND t.test_type = required_tests.test_type
      AND t.test_date >= CURRENT_DATE - INTERVAL '7 days'
    )
  )
  SELECT 
    COALESCE(la.overall_compliant, false) AS compliant,
    la.audit_date AS last_audit_date,
    la.next_audit::DATE AS next_audit_date,
    EXTRACT(DAY FROM (la.next_audit - CURRENT_DATE))::INTEGER AS days_until_audit,
    la.compliance_score,
    mt.tests AS missing_tests
  FROM latest_audit la
  CROSS JOIN missing_tests mt;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate notified body on DoP update
CREATE OR REPLACE FUNCTION validate_notified_body_on_dop()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate if System 1+ and notified body is set
  IF NEW.avcp_system = 1 AND NEW.notified_body IS NOT NULL THEN
    -- Check if notified body number exists and is valid
    IF NOT EXISTS (
      SELECT 1 FROM notified_bodies 
      WHERE number = (NEW.notified_body->>'number')::VARCHAR
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Invalid or inactive notified body number: %', 
        NEW.notified_body->>'number';
    END IF;
    
    -- Set validation flag
    NEW.notified_body_validated = true;
    NEW.notified_body_validation_date = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_notified_body_trigger
BEFORE INSERT OR UPDATE ON en13813_dops
FOR EACH ROW
EXECUTE FUNCTION validate_notified_body_on_dop();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dops_fpc_audit ON en13813_dops(fpc_audit_id);
CREATE INDEX IF NOT EXISTS idx_dops_fpc_compliance ON en13813_dops(fpc_compliant);
CREATE INDEX IF NOT EXISTS idx_fpc_audits_recipe ON en13813_fpc_audits(recipe_id);
CREATE INDEX IF NOT EXISTS idx_fpc_audits_date ON en13813_fpc_audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_fpc_audits_compliant ON en13813_fpc_audits(overall_compliant);

-- Add RLS policies
ALTER TABLE en13813_fpc_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notified_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_ce_labels ENABLE ROW LEVEL SECURITY;

-- FPC Audits policies
CREATE POLICY "Users can view own tenant FPC audits" ON en13813_fpc_audits
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create FPC audits for own tenant" ON en13813_fpc_audits
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update own tenant FPC audits" ON en13813_fpc_audits
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- FPC Test Results policies
CREATE POLICY "Users can view own tenant FPC test results" ON en13813_fpc_test_results
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create FPC test results for own tenant" ON en13813_fpc_test_results
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE id = auth.uid()
  ));

-- Notified Bodies policies (read-only for all authenticated users)
CREATE POLICY "All users can view notified bodies" ON notified_bodies
  FOR SELECT USING (true);

-- CE Labels policies
CREATE POLICY "Users can view own CE labels" ON en13813_ce_labels
  FOR SELECT USING (
    dop_id IN (
      SELECT id FROM en13813_dops 
      WHERE tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create CE labels for own DoPs" ON en13813_ce_labels
  FOR INSERT WITH CHECK (
    dop_id IN (
      SELECT id FROM en13813_dops 
      WHERE tenant_id IN (
        SELECT tenant_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Grant permissions
GRANT SELECT ON notified_bodies TO authenticated;
GRANT ALL ON en13813_fpc_audits TO authenticated;
GRANT ALL ON en13813_fpc_test_results TO authenticated;
GRANT ALL ON en13813_ce_labels TO authenticated;

COMMENT ON TABLE en13813_fpc_audits IS 'Factory Production Control audit records for EN 13813 compliance';
COMMENT ON TABLE en13813_fpc_test_results IS 'Ongoing FPC test results for quality control';
COMMENT ON TABLE notified_bodies IS 'EU notified bodies authorized for EN 13813 certification';
COMMENT ON TABLE en13813_ce_labels IS 'Generated CE marking labels and batch labels';
COMMENT ON COLUMN en13813_dops.fpc_compliant IS 'Indicates if FPC requirements are met';
COMMENT ON COLUMN en13813_dops.ce_label_document_id IS 'Reference to generated CE marking label document';
COMMENT ON COLUMN en13813_dops.batch_label_document_id IS 'Reference to generated batch label document';