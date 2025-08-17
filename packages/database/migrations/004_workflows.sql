-- Workflow management tables

-- Workflow status types
CREATE TYPE workflow_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'failed');
CREATE TYPE workflow_step_status AS ENUM ('pending', 'active', 'completed', 'skipped', 'failed');
CREATE TYPE workflow_trigger_type AS ENUM ('manual', 'scheduled', 'event', 'api');

-- Workflow definitions
CREATE TABLE workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  steps JSONB NOT NULL, -- Array of step definitions
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workflow_name_per_tenant UNIQUE(tenant_id, name)
);

-- Workflow instances
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  definition_id UUID NOT NULL REFERENCES workflow_definitions(id),
  status workflow_status DEFAULT 'pending',
  context JSONB DEFAULT '{}', -- Runtime context/variables
  trigger_type workflow_trigger_type DEFAULT 'manual',
  triggered_by UUID REFERENCES profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow steps
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- approval, notification, action, condition
  status workflow_step_status DEFAULT 'pending',
  config JSONB DEFAULT '{}',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_step_per_instance UNIQUE(instance_id, step_number)
);

-- Workflow schedules
CREATE TABLE workflow_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  definition_id UUID NOT NULL REFERENCES workflow_definitions(id),
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow triggers
CREATE TABLE workflow_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  definition_id UUID NOT NULL REFERENCES workflow_definitions(id),
  event_type TEXT NOT NULL, -- document_created, document_approved, etc.
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_workflow_definitions_tenant_id ON workflow_definitions(tenant_id);
CREATE INDEX idx_workflow_definitions_is_active ON workflow_definitions(is_active);

CREATE INDEX idx_workflow_instances_tenant_id ON workflow_instances(tenant_id);
CREATE INDEX idx_workflow_instances_definition_id ON workflow_instances(definition_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX idx_workflow_instances_created_at ON workflow_instances(created_at DESC);

CREATE INDEX idx_workflow_steps_instance_id ON workflow_steps(instance_id);
CREATE INDEX idx_workflow_steps_assigned_to ON workflow_steps(assigned_to);
CREATE INDEX idx_workflow_steps_status ON workflow_steps(status);

CREATE INDEX idx_workflow_schedules_definition_id ON workflow_schedules(definition_id);
CREATE INDEX idx_workflow_schedules_next_run_at ON workflow_schedules(next_run_at) WHERE is_active = true;

CREATE INDEX idx_workflow_triggers_definition_id ON workflow_triggers(definition_id);
CREATE INDEX idx_workflow_triggers_event_type ON workflow_triggers(event_type);

-- Enable RLS
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "tenant_isolation" ON workflow_definitions
  FOR ALL USING (tenant_id = auth.tenant_id());

CREATE POLICY "service_role_bypass" ON workflow_definitions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "tenant_isolation" ON workflow_instances
  FOR ALL USING (tenant_id = auth.tenant_id());

CREATE POLICY "service_role_bypass" ON workflow_instances
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "tenant_isolation" ON workflow_steps
  FOR ALL USING (tenant_id = auth.tenant_id());

CREATE POLICY "service_role_bypass" ON workflow_steps
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "tenant_isolation" ON workflow_schedules
  FOR ALL USING (tenant_id = auth.tenant_id());

CREATE POLICY "service_role_bypass" ON workflow_schedules
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "tenant_isolation" ON workflow_triggers
  FOR ALL USING (tenant_id = auth.tenant_id());

CREATE POLICY "service_role_bypass" ON workflow_triggers
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Triggers
CREATE TRIGGER update_workflow_definitions_updated_at BEFORE UPDATE ON workflow_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_schedules_updated_at BEFORE UPDATE ON workflow_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_workflow_instances_changes
  AFTER INSERT OR UPDATE OR DELETE ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_workflow_steps_changes
  AFTER UPDATE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Function to create workflow instance
CREATE OR REPLACE FUNCTION create_workflow_instance(
  p_definition_id UUID,
  p_trigger_type workflow_trigger_type DEFAULT 'manual',
  p_context JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_instance_id UUID;
  v_tenant_id UUID;
  v_steps JSONB;
  v_step JSONB;
  v_step_number INTEGER := 1;
BEGIN
  -- Get tenant_id and steps from definition
  SELECT tenant_id, steps INTO v_tenant_id, v_steps
  FROM workflow_definitions
  WHERE id = p_definition_id AND is_active = true;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Workflow definition not found or inactive';
  END IF;
  
  -- Create instance
  INSERT INTO workflow_instances (
    tenant_id,
    definition_id,
    trigger_type,
    triggered_by,
    context,
    status
  ) VALUES (
    v_tenant_id,
    p_definition_id,
    p_trigger_type,
    auth.uid(),
    p_context,
    'pending'
  ) RETURNING id INTO v_instance_id;
  
  -- Create steps
  FOR v_step IN SELECT * FROM jsonb_array_elements(v_steps)
  LOOP
    INSERT INTO workflow_steps (
      tenant_id,
      instance_id,
      step_number,
      name,
      type,
      config,
      status
    ) VALUES (
      v_tenant_id,
      v_instance_id,
      v_step_number,
      v_step->>'name',
      v_step->>'type',
      COALESCE(v_step->'config', '{}'),
      CASE WHEN v_step_number = 1 THEN 'active'::workflow_step_status ELSE 'pending'::workflow_step_status END
    );
    
    v_step_number := v_step_number + 1;
  END LOOP;
  
  -- Update instance status
  UPDATE workflow_instances
  SET status = 'in_progress', started_at = NOW()
  WHERE id = v_instance_id;
  
  RETURN v_instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete workflow step
CREATE OR REPLACE FUNCTION complete_workflow_step(
  p_step_id UUID,
  p_output_data JSONB DEFAULT '{}',
  p_error TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_instance_id UUID;
  v_next_step_number INTEGER;
  v_is_last_step BOOLEAN;
BEGIN
  -- Get instance_id and current step number
  SELECT instance_id, step_number INTO v_instance_id, v_next_step_number
  FROM workflow_steps
  WHERE id = p_step_id;
  
  -- Update current step
  UPDATE workflow_steps
  SET 
    status = CASE WHEN p_error IS NULL THEN 'completed'::workflow_step_status ELSE 'failed'::workflow_step_status END,
    completed_at = NOW(),
    completed_by = auth.uid(),
    output_data = p_output_data,
    error = p_error
  WHERE id = p_step_id;
  
  -- Check if this was the last step
  SELECT NOT EXISTS (
    SELECT 1 FROM workflow_steps
    WHERE instance_id = v_instance_id
    AND step_number > v_next_step_number
  ) INTO v_is_last_step;
  
  IF p_error IS NOT NULL THEN
    -- Mark workflow as failed
    UPDATE workflow_instances
    SET status = 'failed', completed_at = NOW(), error = p_error
    WHERE id = v_instance_id;
  ELSIF v_is_last_step THEN
    -- Mark workflow as completed
    UPDATE workflow_instances
    SET status = 'completed', completed_at = NOW()
    WHERE id = v_instance_id;
  ELSE
    -- Activate next step
    UPDATE workflow_steps
    SET status = 'active', started_at = NOW()
    WHERE instance_id = v_instance_id
    AND step_number = v_next_step_number + 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;