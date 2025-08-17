-- Document types enum
CREATE TYPE document_status AS ENUM ('draft', 'pending_approval', 'approved', 'archived', 'expired');
CREATE TYPE document_type AS ENUM ('policy', 'certificate', 'report', 'evidence', 'audit', 'other');

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type document_type NOT NULL,
  category TEXT,
  current_version_id UUID,
  status document_status DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  retention_until TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_title_per_tenant UNIQUE(tenant_id, title)
);

-- Document versions table
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  checksum TEXT NOT NULL,
  changelog TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_version_per_document UNIQUE(document_id, version_number)
);

-- Document access logs
CREATE TABLE document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES document_versions(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'view', 'download', 'print'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document approvals
CREATE TABLE document_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL, -- 'approved', 'rejected', 'requested_changes'
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_access_logs_document_id ON document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_accessed_by ON document_access_logs(accessed_by);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_approvals ENABLE ROW LEVEL SECURITY;

-- Document policies
CREATE POLICY "Users can view documents in their tenant" ON documents
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) AND deleted_at IS NULL
  );

CREATE POLICY "Users can create documents in their tenant" ON documents
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Document creators and admins can update" ON documents
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) AND (
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('owner', 'admin')
        AND tenant_id = documents.tenant_id
      )
    )
  );

CREATE POLICY "Admins can delete documents" ON documents
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Document version policies
CREATE POLICY "Users can view versions in their tenant" ON document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
      AND d.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create versions for their documents" ON document_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
      AND d.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Access log policies
CREATE POLICY "Users can view their own access logs" ON document_access_logs
  FOR SELECT USING (accessed_by = auth.uid());

CREATE POLICY "Admins can view all access logs in tenant" ON document_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN profiles p ON p.tenant_id = d.tenant_id
      WHERE d.id = document_access_logs.document_id
      AND p.id = auth.uid()
      AND p.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can create access logs" ON document_access_logs
  FOR INSERT WITH CHECK (true);

-- Approval policies
CREATE POLICY "Users can view approvals for documents in their tenant" ON document_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_approvals.document_id
      AND d.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Authorized users can create approvals" ON document_approvals
  FOR INSERT WITH CHECK (
    approver_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_approvals.document_id
      AND d.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON documents
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON document_versions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON document_access_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON document_approvals
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Triggers
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers
CREATE TRIGGER audit_documents_changes
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_document_versions_changes
  AFTER INSERT OR UPDATE OR DELETE ON document_versions
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Function to update document status based on approvals
CREATE OR REPLACE FUNCTION update_document_status_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE documents 
    SET status = 'approved'
    WHERE id = NEW.document_id;
    
    UPDATE document_versions
    SET approved_by = NEW.approver_id,
        approved_at = NEW.created_at
    WHERE id = NEW.version_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_on_approval
  AFTER INSERT ON document_approvals
  FOR EACH ROW EXECUTE FUNCTION update_document_status_on_approval();