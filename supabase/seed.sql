-- Seed data for development

-- Insert test tenant
INSERT INTO tenants (id, slug, company_name, plan, status, trial_ends_at)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'acme-corp', 'ACME Corporation', 'professional', 'active', NOW() + INTERVAL '30 days'),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'test-company', 'Test Company', 'starter', 'trial', NOW() + INTERVAL '14 days');

-- Insert test users (password: password123)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES
  ('d1e2f3a4-b5c6-7890-abcd-ef1234567890', 'admin@acme-corp.com', crypt('password123', gen_salt('bf')), NOW(), 
   '{"full_name": "Admin User", "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "role": "owner"}'::jsonb),
  ('e2f3a4b5-c6d7-8901-bcde-f23456789012', 'user@acme-corp.com', crypt('password123', gen_salt('bf')), NOW(),
   '{"full_name": "Regular User", "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "role": "member"}'::jsonb),
  ('f3a4b5c6-d7e8-9012-cdef-345678901234', 'viewer@acme-corp.com', crypt('password123', gen_salt('bf')), NOW(),
   '{"full_name": "Viewer User", "tenant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "role": "viewer"}'::jsonb);

-- Insert notification templates
INSERT INTO notification_templates (tenant_id, name, channel, subject, body, variables)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'document_approved', 'email', 
   'Document "{{document_name}}" has been approved',
   'Hi {{user_name}},\n\nThe document "{{document_name}}" has been approved by {{approver_name}}.\n\nComments: {{comments}}\n\nBest regards,\nCompliance Team',
   '{"document_name": "string", "user_name": "string", "approver_name": "string", "comments": "string"}'::jsonb),
  
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'task_assigned', 'in_app',
   'New task assigned: {{task_name}}',
   'You have been assigned a new task: {{task_name}}. Due date: {{due_date}}',
   '{"task_name": "string", "due_date": "date"}'::jsonb),
  
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'workflow_completed', 'email',
   'Workflow "{{workflow_name}}" completed',
   'The workflow "{{workflow_name}}" has been completed successfully.\n\nDuration: {{duration}}\nCompleted by: {{completed_by}}',
   '{"workflow_name": "string", "duration": "string", "completed_by": "string"}'::jsonb);

-- Insert sample workflow definitions
INSERT INTO workflow_definitions (tenant_id, name, description, category, steps)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Document Approval', 
   'Standard document approval workflow', 'compliance',
   '[
     {"name": "Upload Document", "type": "action", "config": {"required": true}},
     {"name": "Manager Review", "type": "approval", "config": {"role": "admin"}},
     {"name": "Compliance Check", "type": "approval", "config": {"role": "admin"}},
     {"name": "Final Approval", "type": "approval", "config": {"role": "owner"}},
     {"name": "Publish Document", "type": "action", "config": {"auto": true}}
   ]'::jsonb),
  
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Incident Report',
   'Workflow for reporting and handling incidents', 'safety',
   '[
     {"name": "Report Incident", "type": "action", "config": {"form": "incident_form"}},
     {"name": "Initial Assessment", "type": "approval", "config": {"timeout": "2h"}},
     {"name": "Investigation", "type": "action", "config": {"assignee": "safety_officer"}},
     {"name": "Root Cause Analysis", "type": "action", "config": {"template": "rca_template"}},
     {"name": "Corrective Actions", "type": "action", "config": {"tracking": true}},
     {"name": "Close Incident", "type": "approval", "config": {"role": "admin"}}
   ]'::jsonb);

-- Insert sample documents
INSERT INTO documents (tenant_id, title, description, type, status, category, tags, created_by)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ISO 9001 Quality Manual', 
   'Company quality management system manual', 'policy', 'published', 'Quality',
   ARRAY['iso9001', 'quality', 'manual'], 'd1e2f3a4-b5c6-7890-abcd-ef1234567890'),
  
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Data Protection Policy',
   'GDPR compliant data protection policy', 'policy', 'draft', 'Privacy',
   ARRAY['gdpr', 'privacy', 'data-protection'], 'd1e2f3a4-b5c6-7890-abcd-ef1234567890'),
  
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ISO 14001 Certificate',
   'Environmental management certification', 'certificate', 'approved', 'Environment',
   ARRAY['iso14001', 'environment', 'certificate'], 'd1e2f3a4-b5c6-7890-abcd-ef1234567890');