-- Reporting Engine Schema
-- PDF-Generation, Templates, und Audit-Trail für Compliance Reports

-- Report template types and status enums
CREATE TYPE report_template_type AS ENUM (
  'compliance_dashboard',
  'audit_report', 
  'document_overview',
  'workflow_summary',
  'risk_assessment',
  'certification_status',
  'gdpr_report',
  'iso_report',
  'custom'
);

CREATE TYPE report_status AS ENUM ('draft', 'generating', 'completed', 'failed', 'archived');
CREATE TYPE report_format AS ENUM ('pdf', 'html', 'csv', 'json');

-- Report templates (reusable report configurations)
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for global templates
  
  -- Template metadata
  name TEXT NOT NULL,
  description TEXT,
  type report_template_type NOT NULL,
  category TEXT, -- 'compliance', 'audit', 'dashboard', 'custom'
  
  -- Template configuration
  config JSONB NOT NULL DEFAULT '{}', -- Template structure, fields, styling
  data_sources JSONB NOT NULL DEFAULT '[]', -- Which data to include
  layout JSONB NOT NULL DEFAULT '{}', -- PDF layout configuration
  styles JSONB NOT NULL DEFAULT '{}', -- Custom styling options
  
  -- Template settings
  is_public BOOLEAN DEFAULT false, -- Available to all tenants
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  
  -- Access control
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_template_name_per_tenant UNIQUE(tenant_id, name, version)
);

-- Generated reports (actual report instances)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  
  -- Report metadata
  title TEXT NOT NULL,
  description TEXT,
  type report_template_type NOT NULL,
  format report_format DEFAULT 'pdf',
  
  -- Report configuration (snapshot from template)
  config JSONB NOT NULL DEFAULT '{}',
  parameters JSONB NOT NULL DEFAULT '{}', -- Runtime parameters (date ranges, filters, etc.)
  
  -- Report data
  data JSONB DEFAULT '{}', -- Raw data used for generation
  content JSONB DEFAULT '{}', -- Processed report content
  
  -- File storage
  storage_path TEXT, -- Path to generated PDF/file in Supabase Storage
  file_size BIGINT,
  checksum TEXT,
  
  -- Report status and timing
  status report_status DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_details TEXT,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ, -- For scheduled reports
  recurring_config JSONB, -- Cron-like scheduling config
  parent_report_id UUID REFERENCES reports(id), -- For recurring reports
  
  -- Access and sharing
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE, -- For public sharing
  expires_at TIMESTAMPTZ, -- When shared link expires
  
  -- Audit
  generated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report sections (for complex multi-section reports)
CREATE TABLE report_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  template_id UUID REFERENCES report_templates(id),
  
  -- Section metadata
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  
  -- Section configuration
  type TEXT NOT NULL, -- 'chart', 'table', 'text', 'image', 'summary'
  config JSONB NOT NULL DEFAULT '{}',
  data_query TEXT, -- SQL query or data source reference
  
  -- Section content
  data JSONB DEFAULT '{}',
  content JSONB DEFAULT '{}',
  
  -- Section status
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_details TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report sharing and access logs
CREATE TABLE report_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Access details
  accessed_by UUID REFERENCES profiles(id), -- NULL for anonymous access
  access_method TEXT NOT NULL, -- 'download', 'view', 'share', 'email'
  ip_address INET,
  user_agent TEXT,
  
  -- Access metadata
  share_token TEXT, -- If accessed via share link
  metadata JSONB DEFAULT '{}',
  
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report comments and annotations
CREATE TABLE report_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general', -- 'general', 'annotation', 'feedback', 'approval'
  
  -- Position in report (for annotations)
  page_number INTEGER,
  position JSONB, -- x, y coordinates for PDF annotations
  
  -- Thread support
  parent_comment_id UUID REFERENCES report_comments(id),
  
  -- Mentions and notifications
  mentions UUID[], -- Array of mentioned user IDs
  attachments JSONB DEFAULT '[]',
  
  -- Author
  author_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predefined report data sources (for template configuration)
CREATE TABLE report_data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for system-wide sources
  
  -- Data source metadata
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'sql', 'api', 'function', 'static'
  category TEXT, -- 'documents', 'workflows', 'audit', 'compliance'
  
  -- Data source configuration
  config JSONB NOT NULL DEFAULT '{}',
  query_template TEXT, -- SQL template with parameters
  parameters JSONB DEFAULT '{}', -- Available parameters
  
  -- Data source settings
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false, -- Available to all tenants
  cache_duration INTEGER DEFAULT 300, -- Cache duration in seconds
  
  -- Access control
  required_permissions TEXT[], -- Required permissions to use this data source
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices for performance
CREATE INDEX idx_report_templates_tenant_id ON report_templates(tenant_id);
CREATE INDEX idx_report_templates_type ON report_templates(type);
CREATE INDEX idx_report_templates_active ON report_templates(is_active);

CREATE INDEX idx_reports_tenant_id ON reports(tenant_id);
CREATE INDEX idx_reports_template_id ON reports(template_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_reports_scheduled_for ON reports(scheduled_for);
CREATE INDEX idx_reports_generated_by ON reports(generated_by);
CREATE INDEX idx_reports_share_token ON reports(share_token);

CREATE INDEX idx_report_sections_report_id ON report_sections(report_id);
CREATE INDEX idx_report_sections_order ON report_sections(section_order);

CREATE INDEX idx_report_access_logs_report_id ON report_access_logs(report_id);
CREATE INDEX idx_report_access_logs_accessed_at ON report_access_logs(accessed_at);

CREATE INDEX idx_report_comments_report_id ON report_comments(report_id);
CREATE INDEX idx_report_comments_author_id ON report_comments(author_id);

CREATE INDEX idx_report_data_sources_tenant_id ON report_data_sources(tenant_id);
CREATE INDEX idx_report_data_sources_type ON report_data_sources(type);
CREATE INDEX idx_report_data_sources_active ON report_data_sources(is_active);

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_data_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report_templates
CREATE POLICY "Users can view report templates in their tenant" ON report_templates
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) OR is_public = true
  );

CREATE POLICY "Admins can manage report templates" ON report_templates
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for reports
CREATE POLICY "Users can view reports in their tenant" ON reports
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) OR is_public = true
  );

CREATE POLICY "Users can create reports in their tenant" ON reports
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Report creators and admins can update reports" ON reports
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) AND (
      generated_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() 
        AND p.role IN ('owner', 'admin')
        AND p.tenant_id = reports.tenant_id
      )
    )
  );

-- RLS Policies for report_sections
CREATE POLICY "Users can view report sections in their tenant" ON report_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_sections.report_id
      AND r.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage sections of their reports" ON report_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_sections.report_id
      AND r.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for report_access_logs
CREATE POLICY "Users can view access logs for their tenant reports" ON report_access_logs
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can create access logs" ON report_access_logs
  FOR INSERT WITH CHECK (true); -- Allow system to log all access

-- RLS Policies for report_comments
CREATE POLICY "Users can view comments on reports in their tenant" ON report_comments
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on reports in their tenant" ON report_comments
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) AND author_id = auth.uid()
  );

CREATE POLICY "Comment authors can update their comments" ON report_comments
  FOR UPDATE USING (
    author_id = auth.uid() AND
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for report_data_sources
CREATE POLICY "Users can view data sources in their tenant" ON report_data_sources
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) OR tenant_id IS NULL OR is_public = true
  );

CREATE POLICY "Admins can manage data sources" ON report_data_sources
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    ) OR tenant_id IS NULL
  );

-- Service role bypass policies
CREATE POLICY "Service role bypass" ON report_templates
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON reports
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON report_sections
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON report_access_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON report_comments
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON report_data_sources
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Update triggers
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_sections_updated_at BEFORE UPDATE ON report_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_comments_updated_at BEFORE UPDATE ON report_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_data_sources_updated_at BEFORE UPDATE ON report_data_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers
CREATE TRIGGER audit_report_templates_changes
  AFTER INSERT OR UPDATE OR DELETE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_reports_changes
  AFTER INSERT OR UPDATE OR DELETE ON reports
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_report_sections_changes
  AFTER INSERT OR UPDATE OR DELETE ON report_sections
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Function to clean up expired shared reports
CREATE OR REPLACE FUNCTION cleanup_expired_shared_reports()
RETURNS void AS $$
BEGIN
  UPDATE reports 
  SET 
    is_public = false,
    share_token = NULL,
    expires_at = NULL
  WHERE 
    is_public = true 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically archive old reports
CREATE OR REPLACE FUNCTION archive_old_reports()
RETURNS void AS $$
BEGIN
  UPDATE reports 
  SET status = 'archived'
  WHERE 
    status = 'completed'
    AND created_at < NOW() - INTERVAL '1 year'
    AND recurring_config IS NULL; -- Don't archive recurring report templates
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default report templates and data sources
INSERT INTO report_data_sources (name, description, type, category, config, query_template, is_public, is_active) VALUES
('Documents Overview', 'Overview of all documents by type and status', 'sql', 'documents', 
 '{"cacheable": true, "timeout": 300}',
 'SELECT type, status, COUNT(*) as count FROM documents WHERE tenant_id = $1 GROUP BY type, status',
 true, true),

('Workflow Summary', 'Summary of workflow instances by status', 'sql', 'workflows',
 '{"cacheable": true, "timeout": 180}',
 'SELECT status, priority, COUNT(*) as count FROM workflow_instances WHERE tenant_id = $1 GROUP BY status, priority',
 true, true),

('Audit Trail', 'Recent audit log entries', 'sql', 'audit',
 '{"cacheable": false, "timeout": 60}',
 'SELECT action, resource_type, COUNT(*) as count, DATE(created_at) as date FROM audit_logs WHERE tenant_id = $1 AND created_at >= $2 GROUP BY action, resource_type, DATE(created_at)',
 true, true),

('Compliance Dashboard', 'Key compliance metrics and KPIs', 'sql', 'compliance',
 '{"cacheable": true, "timeout": 600}',
 'SELECT 
    (SELECT COUNT(*) FROM documents WHERE tenant_id = $1 AND status = ''approved'') as approved_documents,
    (SELECT COUNT(*) FROM workflow_instances WHERE tenant_id = $1 AND status = ''completed'') as completed_workflows,
    (SELECT COUNT(*) FROM workflow_instances WHERE tenant_id = $1 AND status IN (''pending'', ''in_progress'')) as active_workflows',
 true, true);

INSERT INTO report_templates (tenant_id, name, description, type, category, config, data_sources, layout, is_public, is_active) VALUES
(NULL, 'Standard Compliance Report', 'Monatlicher Compliance-Überblick mit Dokumenten und Workflows', 'compliance_dashboard', 'compliance',
 '{"title": "Compliance Report", "subtitle": "Monatlicher Überblick", "sections": ["summary", "documents", "workflows", "audit"]}',
 '["Documents Overview", "Workflow Summary", "Audit Trail", "Compliance Dashboard"]',
 '{"format": "A4", "orientation": "portrait", "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20}}',
 true, true),

(NULL, 'Document Status Report', 'Detaillierter Bericht über alle Dokumente und deren Status', 'document_overview', 'documents',
 '{"title": "Document Status Report", "sections": ["overview", "by_type", "by_status", "recent_changes"]}',
 '["Documents Overview"]',
 '{"format": "A4", "orientation": "landscape", "margins": {"top": 15, "bottom": 15, "left": 15, "right": 15}}',
 true, true),

(NULL, 'Workflow Performance Report', 'Analyse der Workflow-Performance und Durchlaufzeiten', 'workflow_summary', 'workflows',
 '{"title": "Workflow Performance", "sections": ["summary", "performance_metrics", "bottlenecks", "recommendations"]}',
 '["Workflow Summary"]',
 '{"format": "A4", "orientation": "portrait", "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20}}',
 true, true);