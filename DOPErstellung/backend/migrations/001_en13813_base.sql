-- EN 13813 Module - Database Schema
-- This migration should be run after the core migrations

-- Include the main EN13813 schema
\i ../../supabase/migrations/20250117_en13813_base.sql

-- Additional module-specific configurations
-- These are specific to the EN13813 module when loaded

-- Create default EN13813 categories when module is activated
CREATE OR REPLACE FUNCTION en13813_initialize_tenant(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert default document categories for EN13813
  INSERT INTO document_categories (tenant_id, name, description, module)
  VALUES 
    (p_tenant_id, 'Prüfberichte', 'Prüfberichte nach EN 13813', 'en13813'),
    (p_tenant_id, 'Leistungserklärungen', 'DoPs für Estrichmörtel', 'en13813'),
    (p_tenant_id, 'CE-Etiketten', 'CE-Kennzeichnungen', 'en13813'),
    (p_tenant_id, 'Rezepturen', 'Technische Rezepturen', 'en13813')
  ON CONFLICT DO NOTHING;

  -- Insert default workflow templates
  INSERT INTO workflow_templates (tenant_id, name, description, module, steps)
  VALUES 
    (p_tenant_id, 'DoP Freigabe', 'Freigabeprozess für Leistungserklärungen', 'en13813', 
     '["draft", "technical_review", "quality_review", "approval", "published"]'::jsonb),
    (p_tenant_id, 'Rezeptur Validierung', 'Validierungsprozess für neue Rezepturen', 'en13813',
     '["development", "lab_testing", "validation", "approved"]'::jsonb)
  ON CONFLICT DO NOTHING;

  -- Create initial compliance tasks
  INSERT INTO en13813_compliance_tasks (tenant_id, task_type, description, due_date)
  VALUES 
    (p_tenant_id, 'fpc_audit', 'Jährliches FPC Audit', CURRENT_DATE + INTERVAL '1 year'),
    (p_tenant_id, 'calibration', 'Kalibrierung Prüfgeräte', CURRENT_DATE + INTERVAL '6 months')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Materialized view for EN13813 statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS en13813_statistics AS
SELECT 
  tenant_id,
  COUNT(DISTINCT r.id) as total_recipes,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'active') as active_recipes,
  COUNT(DISTINCT d.id) as total_dops,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'published') as published_dops,
  COUNT(DISTINCT b.id) as total_batches,
  COUNT(DISTINCT t.id) as total_test_reports,
  COUNT(DISTINCT t.id) FILTER (WHERE t.valid_until > CURRENT_DATE) as valid_test_reports
FROM en13813_recipes r
LEFT JOIN en13813_dops d ON r.id = d.recipe_id
LEFT JOIN en13813_batches b ON r.id = b.recipe_id
LEFT JOIN en13813_test_reports t ON r.id = t.recipe_id
GROUP BY tenant_id;

-- Create index for performance
CREATE UNIQUE INDEX idx_en13813_statistics_tenant ON en13813_statistics(tenant_id);

-- Function to refresh statistics (called by cron job)
CREATE OR REPLACE FUNCTION refresh_en13813_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY en13813_statistics;
END;
$$ LANGUAGE plpgsql;