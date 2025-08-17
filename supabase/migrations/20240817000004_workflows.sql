-- Workflow Engine Schema
-- Implements state machine pattern for compliance processes

-- Workflow status enum
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE workflow_instance_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');
CREATE TYPE workflow_step_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped', 'failed');
CREATE TYPE workflow_step_action AS ENUM ('approve', 'reject', 'request_changes', 'delegate', 'comment');

-- Workflow templates
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'approval', 'review', 'compliance_check', 'audit'
  category TEXT, -- 'document', 'task', 'compliance', 'general'
  config JSONB NOT NULL DEFAULT '{}', -- Workflow definition (steps, conditions, etc.)
  status workflow_status DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  is_template BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workflow_name_per_tenant UNIQUE(tenant_id, name, version)
);

-- Workflow instances (actual running workflows)
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- What is this workflow processing?
  resource_type TEXT NOT NULL, -- 'document', 'task', 'compliance_item'
  resource_id UUID NOT NULL,
  
  -- Instance metadata
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Current state
  current_step_id UUID,
  status workflow_instance_status DEFAULT 'pending',
  
  -- Data and context
  data JSONB DEFAULT '{}', -- Instance-specific data
  context JSONB DEFAULT '{}', -- Additional context (form data, etc.)
  
  -- Timing
  started_by UUID REFERENCES profiles(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual workflow steps within an instance
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Step definition
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL, -- 'approval', 'review', 'notification', 'condition', 'parallel'
  step_order INTEGER NOT NULL,
  
  -- Assignment
  assigned_to UUID REFERENCES profiles(id),
  assigned_role TEXT, -- 'owner', 'admin', 'reviewer', etc.
  assigned_group TEXT, -- department, team, etc.
  
  -- State
  status workflow_step_status DEFAULT 'pending',
  
  -- Configuration
  config JSONB DEFAULT '{}', -- Step-specific config (auto-approve conditions, etc.)
  requirements JSONB DEFAULT '{}', -- What's needed to complete this step
  
  -- Results
  action_taken workflow_step_action,
  decision TEXT, -- 'approved', 'rejected', 'changes_requested'
  comments TEXT,
  attachments JSONB DEFAULT '[]', -- File attachments
  
  -- Timing
  due_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow step history (for audit trail)
CREATE TABLE workflow_step_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Action details
  action workflow_step_action NOT NULL,
  from_status workflow_step_status,
  to_status workflow_step_status,
  
  -- Actor
  actor_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  
  -- Details
  comments TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow comments/notes
CREATE TABLE workflow_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'general', -- 'general', 'approval', 'rejection', 'question'
  is_internal BOOLEAN DEFAULT false, -- Internal comments not visible to requestor
  
  -- Mentions and notifications
  mentions UUID[], -- Array of user IDs mentioned
  attachments JSONB DEFAULT '[]',
  
  -- Author
  author_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices for performance
CREATE INDEX idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX idx_workflows_type_status ON workflows(type, status);
CREATE INDEX idx_workflow_instances_tenant_id ON workflow_instances(tenant_id);
CREATE INDEX idx_workflow_instances_resource ON workflow_instances(resource_type, resource_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_due_date ON workflow_instances(due_date);
CREATE INDEX idx_workflow_instances_assigned ON workflow_instances(started_by);
CREATE INDEX idx_workflow_steps_instance_id ON workflow_steps(instance_id);
CREATE INDEX idx_workflow_steps_assigned_to ON workflow_steps(assigned_to);
CREATE INDEX idx_workflow_steps_status ON workflow_steps(status);
CREATE INDEX idx_workflow_steps_due_date ON workflow_steps(due_date);
CREATE INDEX idx_workflow_step_history_step_id ON workflow_step_history(step_id);
CREATE INDEX idx_workflow_comments_instance_id ON workflow_comments(instance_id);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflows
CREATE POLICY "Users can view workflows in their tenant" ON workflows
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workflows" ON workflows
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for workflow instances
CREATE POLICY "Users can view workflow instances in their tenant" ON workflow_instances
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create workflow instances" ON workflow_instances
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Workflow participants can update instances" ON workflow_instances
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) AND (
      started_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM workflow_steps ws 
        WHERE ws.instance_id = workflow_instances.id 
        AND ws.assigned_to = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() 
        AND p.role IN ('owner', 'admin')
        AND p.tenant_id = workflow_instances.tenant_id
      )
    )
  );

-- RLS Policies for workflow steps
CREATE POLICY "Users can view workflow steps in their tenant" ON workflow_steps
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Assigned users can update their steps" ON workflow_steps
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) AND (
      assigned_to = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() 
        AND p.role IN ('owner', 'admin')
        AND p.tenant_id = workflow_steps.tenant_id
      )
    )
  );

-- RLS Policies for workflow history
CREATE POLICY "Users can view workflow history in their tenant" ON workflow_step_history
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can create workflow history" ON workflow_step_history
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for workflow comments
CREATE POLICY "Users can view workflow comments in their tenant" ON workflow_comments
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create workflow comments" ON workflow_comments
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) AND author_id = auth.uid()
  );

CREATE POLICY "Comment authors can update their comments" ON workflow_comments
  FOR UPDATE USING (
    author_id = auth.uid() AND
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Service role bypass policies
CREATE POLICY "Service role bypass" ON workflows
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON workflow_instances
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON workflow_steps
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON workflow_step_history
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role bypass" ON workflow_comments
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Update triggers
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_comments_updated_at BEFORE UPDATE ON workflow_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers
CREATE TRIGGER audit_workflows_changes
  AFTER INSERT OR UPDATE OR DELETE ON workflows
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_workflow_instances_changes
  AFTER INSERT OR UPDATE OR DELETE ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_workflow_steps_changes
  AFTER INSERT OR UPDATE OR DELETE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Function to automatically create workflow step history
CREATE OR REPLACE FUNCTION create_workflow_step_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create history for actual changes (not initial creation)
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO workflow_step_history (
      step_id,
      instance_id,
      tenant_id,
      action,
      from_status,
      to_status,
      actor_id,
      comments,
      metadata
    ) VALUES (
      NEW.id,
      NEW.instance_id,
      NEW.tenant_id,
      NEW.action_taken,
      OLD.status,
      NEW.status,
      auth.uid(),
      NEW.comments,
      jsonb_build_object(
        'step_name', NEW.step_name,
        'completed_at', NEW.completed_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER workflow_step_history_trigger
  AFTER UPDATE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION create_workflow_step_history();

-- Function to auto-progress workflow when step is completed
CREATE OR REPLACE FUNCTION progress_workflow_on_step_completion()
RETURNS TRIGGER AS $$
DECLARE
  next_step_id UUID;
  instance_complete BOOLEAN := false;
BEGIN
  -- Only process when step is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Check if there are any remaining pending/in_progress steps
    IF NOT EXISTS (
      SELECT 1 FROM workflow_steps 
      WHERE instance_id = NEW.instance_id 
      AND status IN ('pending', 'in_progress')
      AND id != NEW.id
    ) THEN
      -- All steps completed, mark instance as completed
      UPDATE workflow_instances 
      SET 
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = NEW.instance_id;
      
      instance_complete := true;
    ELSE
      -- Find next step to activate
      SELECT id INTO next_step_id
      FROM workflow_steps
      WHERE instance_id = NEW.instance_id
      AND status = 'pending'
      AND step_order > NEW.step_order
      ORDER BY step_order
      LIMIT 1;
      
      -- Activate next step
      IF next_step_id IS NOT NULL THEN
        UPDATE workflow_steps
        SET 
          status = 'in_progress',
          started_at = NOW(),
          updated_at = NOW()
        WHERE id = next_step_id;
      END IF;
      
      -- Update instance status to in_progress if not already
      UPDATE workflow_instances 
      SET 
        status = 'in_progress',
        current_step_id = next_step_id,
        updated_at = NOW()
      WHERE id = NEW.instance_id AND status = 'pending';
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER workflow_progress_trigger
  AFTER UPDATE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION progress_workflow_on_step_completion();