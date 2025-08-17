-- Notification system tables

-- Notification types
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms', 'webhook');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');

-- Notification templates
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  channel notification_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '{}', -- Available template variables
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_template_name_per_tenant UNIQUE(tenant_id, name)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_templates(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type notification_type DEFAULT 'info',
  channel notification_channel DEFAULT 'in_app',
  status notification_status DEFAULT 'pending',
  subject TEXT,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional data for the notification
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  categories JSONB DEFAULT '{}', -- Category-specific preferences
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_preference_per_user_channel UNIQUE(user_id, channel)
);

-- Notification queue for async processing
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  priority INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  locked_until TIMESTAMPTZ,
  locked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notification_templates_tenant_id ON notification_templates(tenant_id);
CREATE INDEX idx_notification_templates_channel ON notification_templates(channel);

CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for) WHERE locked_until IS NULL;
CREATE INDEX idx_notification_queue_channel ON notification_queue(channel);

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_templates
CREATE POLICY "tenant_isolation" ON notification_templates
  FOR ALL USING (tenant_id = auth.tenant_id());

CREATE POLICY "service_role_bypass" ON notification_templates
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for notifications
CREATE POLICY "users_view_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "service_role_bypass" ON notifications
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for notification_preferences
CREATE POLICY "users_manage_own_preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "service_role_bypass" ON notification_preferences
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for notification_queue
CREATE POLICY "service_role_only" ON notification_queue
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Triggers
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_type notification_type,
  p_subject TEXT,
  p_body TEXT,
  p_channel notification_channel DEFAULT 'in_app',
  p_template_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_tenant_id UUID;
  v_is_enabled BOOLEAN;
BEGIN
  -- Get tenant_id from user
  SELECT tenant_id INTO v_tenant_id
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if notifications are enabled for this channel
  SELECT COALESCE(is_enabled, true) INTO v_is_enabled
  FROM notification_preferences
  WHERE user_id = p_user_id AND channel = p_channel;
  
  IF NOT v_is_enabled THEN
    RETURN NULL;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (
    tenant_id,
    template_id,
    user_id,
    type,
    channel,
    subject,
    body,
    data,
    status
  ) VALUES (
    v_tenant_id,
    p_template_id,
    p_user_id,
    p_type,
    p_channel,
    p_subject,
    p_body,
    p_data,
    CASE WHEN p_channel = 'in_app' THEN 'delivered'::notification_status ELSE 'pending'::notification_status END
  ) RETURNING id INTO v_notification_id;
  
  -- Add to queue for non-in-app notifications
  IF p_channel != 'in_app' THEN
    INSERT INTO notification_queue (
      tenant_id,
      notification_id,
      channel
    ) VALUES (
      v_tenant_id,
      v_notification_id,
      p_channel
    );
  END IF;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read_at = NOW(), status = 'read'
  WHERE id = p_notification_id AND user_id = auth.uid() AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN COUNT(*)
  FROM notifications
  WHERE user_id = auth.uid() AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process notification from template
CREATE OR REPLACE FUNCTION send_templated_notification(
  p_user_id UUID,
  p_template_name TEXT,
  p_variables JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_template RECORD;
  v_rendered_subject TEXT;
  v_rendered_body TEXT;
  v_key TEXT;
  v_value TEXT;
BEGIN
  -- Get template
  SELECT * INTO v_template
  FROM notification_templates
  WHERE name = p_template_name 
  AND tenant_id = (SELECT tenant_id FROM profiles WHERE id = p_user_id)
  AND is_active = true;
  
  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_name;
  END IF;
  
  -- Simple variable replacement
  v_rendered_subject := v_template.subject;
  v_rendered_body := v_template.body;
  
  FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    v_rendered_subject := REPLACE(v_rendered_subject, '{{' || v_key || '}}', v_value);
    v_rendered_body := REPLACE(v_rendered_body, '{{' || v_key || '}}', v_value);
  END LOOP;
  
  -- Send notification
  RETURN send_notification(
    p_user_id,
    'info'::notification_type,
    v_rendered_subject,
    v_rendered_body,
    v_template.channel,
    v_template.id,
    p_variables
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;