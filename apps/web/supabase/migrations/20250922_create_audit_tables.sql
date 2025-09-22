-- Create audit tables for EN13813 compliance
CREATE TABLE IF NOT EXISTS en13813_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  audit_number VARCHAR(50) NOT NULL,
  audit_type VARCHAR(50) NOT NULL, -- 'internal', 'external', 'certification'
  audit_date DATE NOT NULL,
  auditor_name VARCHAR(255) NOT NULL,
  audit_scope TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'closed'

  -- Product-specific information
  binder_types TEXT[], -- Array of binder types: CT, CA, MA, AS, SR
  intended_use VARCHAR(50), -- 'wearing_layer' or 'non_wearing_layer'

  -- AVCP-System Berechnung
  rf_regulated BOOLEAN DEFAULT FALSE,
  rf_improvement_stage BOOLEAN DEFAULT FALSE,
  dangerous_substances_regulated BOOLEAN DEFAULT FALSE,
  avcp_system VARCHAR(10) DEFAULT '4', -- '4', '3', or '1'

  -- ITT & Änderungen
  itt_available BOOLEAN DEFAULT FALSE,
  itt_after_change BOOLEAN DEFAULT FALSE,

  -- Konformitätsbewertung
  conformity_method VARCHAR(20), -- 'variables' or 'attributes'
  sample_size INTEGER,
  mean_value NUMERIC,
  standard_deviation NUMERIC,
  ka_value NUMERIC,

  -- Audit results
  findings_summary TEXT,
  nonconformities_count INTEGER DEFAULT 0,
  observations_count INTEGER DEFAULT 0,
  opportunities_count INTEGER DEFAULT 0,

  -- Follow-up
  next_audit_date DATE,
  corrective_actions_required BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(tenant_id, audit_number)
);

-- Audit checklist items based on EN13813 §6.3
CREATE TABLE IF NOT EXISTS en13813_audit_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES en13813_audits(id) ON DELETE CASCADE,

  -- Checklist details
  section VARCHAR(50) NOT NULL, -- '6.3.2', '6.3.3', etc.
  category VARCHAR(100) NOT NULL, -- 'raw_material_control', 'process_control', etc.
  requirement TEXT NOT NULL,
  reference VARCHAR(255), -- EN13813 clause reference

  -- Assessment
  status VARCHAR(50) NOT NULL, -- 'conform', 'nonconform', 'not_applicable', 'observation'
  evidence TEXT,
  finding TEXT,
  severity VARCHAR(50), -- 'critical', 'major', 'minor'

  -- Corrective action if nonconform
  corrective_action_required BOOLEAN DEFAULT FALSE,
  corrective_action_description TEXT,
  responsible_person VARCHAR(255),
  due_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit findings tracking
CREATE TABLE IF NOT EXISTS en13813_audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES en13813_audits(id) ON DELETE CASCADE,
  finding_number VARCHAR(50) NOT NULL,

  -- Finding details
  finding_type VARCHAR(50) NOT NULL, -- 'nonconformity', 'observation', 'opportunity'
  severity VARCHAR(50), -- 'critical', 'major', 'minor'
  description TEXT NOT NULL,
  evidence TEXT,
  affected_process VARCHAR(255),

  -- Root cause analysis
  root_cause TEXT,

  -- Corrective/Preventive actions
  corrective_action_required BOOLEAN DEFAULT TRUE,
  corrective_action_description TEXT,
  preventive_action_description TEXT,
  responsible_person VARCHAR(255),
  target_date DATE,

  -- Verification
  verification_date DATE,
  verification_result VARCHAR(50), -- 'effective', 'not_effective', 'pending'
  verified_by VARCHAR(255),

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'closed', 'overdue'
  closure_date DATE,
  closure_comments TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(audit_id, finding_number)
);

-- Audit report attachments
CREATE TABLE IF NOT EXISTS en13813_audit_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES en13813_audits(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audits_tenant_id ON en13813_audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON en13813_audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_audit_date ON en13813_audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_audit_findings_status ON en13813_audit_findings(status);
CREATE INDEX IF NOT EXISTS idx_audit_checklist_audit_id ON en13813_audit_checklist_items(audit_id);

-- Enable RLS
ALTER TABLE en13813_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_audit_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_audit_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view audits for their tenant"
  ON en13813_audits FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create audits for their tenant"
  ON en13813_audits FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update audits for their tenant"
  ON en13813_audits FOR UPDATE
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete audits for their tenant"
  ON en13813_audits FOR DELETE
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
  ));

-- Similar policies for checklist items (through audit relationship)
CREATE POLICY "Users can view checklist items"
  ON en13813_audit_checklist_items FOR SELECT
  USING (audit_id IN (
    SELECT id FROM en13813_audits WHERE tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage checklist items"
  ON en13813_audit_checklist_items FOR ALL
  USING (audit_id IN (
    SELECT id FROM en13813_audits WHERE tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  ));

-- Similar policies for findings
CREATE POLICY "Users can view findings"
  ON en13813_audit_findings FOR SELECT
  USING (audit_id IN (
    SELECT id FROM en13813_audits WHERE tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage findings"
  ON en13813_audit_findings FOR ALL
  USING (audit_id IN (
    SELECT id FROM en13813_audits WHERE tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  ));

-- Similar policies for attachments
CREATE POLICY "Users can view attachments"
  ON en13813_audit_attachments FOR SELECT
  USING (audit_id IN (
    SELECT id FROM en13813_audits WHERE tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage attachments"
  ON en13813_audit_attachments FOR ALL
  USING (audit_id IN (
    SELECT id FROM en13813_audits WHERE tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid()
    )
  ));