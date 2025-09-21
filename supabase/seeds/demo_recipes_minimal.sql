-- ================================================
-- DEMO REZEPTUREN FÜR EN 13813 - MINIMAL VERSION
-- Verwendet nur die tatsächlich vorhandenen Felder
-- ================================================

-- Bereinigung vorheriger Demo-Daten
DELETE FROM en13813_recipes WHERE tenant_id IN (
  SELECT id FROM tenants WHERE slug = 'demo'
);

-- Demo Rezepturen erstellen
INSERT INTO en13813_recipes (
  tenant_id,
  created_by,
  recipe_code,
  name,
  type,
  compressive_strength_class,
  flexural_strength_class,
  wear_resistance_class,
  fire_class,
  additives,
  special_properties,
  status
)
SELECT 
  t.id as tenant_id,
  p.id as created_by,
  vals.recipe_code,
  vals.name,
  vals.type,
  vals.compressive_strength_class,
  vals.flexural_strength_class,
  vals.wear_resistance_class,
  vals.fire_class,
  vals.additives::jsonb,
  vals.special_properties::jsonb,
  'active' as status
FROM 
  (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) t,
  (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1) p,
  (VALUES
    ('CT-001', 'Zementestrich CT-C30-F5', 'CT', 'C30', 'F5', 'A15', 'A1fl', 
     '["Fließmittel", "Verzögerer"]', 
     '{"application": "Industrieboden", "thickness": "50-80mm"}'),
    
    ('CA-002', 'Calciumsulfat-Fließestrich CA-C35-F7', 'CA', 'C35', 'F7', NULL, 'A1fl',
     '["Verflüssiger", "Entschäumer"]',
     '{"application": "Heizestrich", "pumpable": true}'),
    
    ('MA-003', 'Magnesiaestrich MA-C40-F7', 'MA', 'C40', 'F7', NULL, 'A1fl',
     '["MgCl2-Lösung", "Holzmehl"]',
     '{"application": "Historische Gebäude", "ecological": true}'),
    
    ('SR-004', 'Epoxidharz-Estrich SR', 'SR', 'B2.0', 'IR20', 'AR0.5', 'Bfl-s1',
     '["Härter", "Pigmente"]',
     '{"application": "Chemische Industrie", "chemical_resistant": true}'),
    
    ('AS-005', 'Gussasphalt AS', 'AS', 'IC40', 'IP10', NULL, 'Bfl-s1',
     '["Polymer-Modifier", "Füller"]',
     '{"application": "Parkhaus", "waterproof": true}')
  ) AS vals(recipe_code, name, type, compressive_strength_class, flexural_strength_class, 
            wear_resistance_class, fire_class, additives, special_properties);

-- Materialzusammensetzung hinzufügen (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_recipe_materials') THEN
    INSERT INTO en13813_recipe_materials (
      recipe_id,
      tenant_id,
      binder_type,
      binder_designation,
      binder_amount_kg_m3,
      water_binder_ratio
    )
    SELECT 
      r.id,
      r.tenant_id,
      CASE r.type
        WHEN 'CT' THEN 'Zement'
        WHEN 'CA' THEN 'Calciumsulfat'
        WHEN 'MA' THEN 'Magnesiumoxid'
        WHEN 'SR' THEN 'Epoxidharz'
        WHEN 'AS' THEN 'Bitumen'
      END,
      CASE r.type
        WHEN 'CT' THEN 'CEM II/B-S 32,5 R'
        WHEN 'CA' THEN 'Alpha-Halbhydrat CAB 30'
        WHEN 'MA' THEN 'MgO 90'
        WHEN 'SR' THEN 'EP-2K-100'
        WHEN 'AS' THEN 'B 20/30'
      END,
      CASE r.type
        WHEN 'CT' THEN 340
        WHEN 'CA' THEN 395
        WHEN 'MA' THEN 260
        WHEN 'SR' THEN 480
        WHEN 'AS' THEN 165
      END,
      CASE r.type
        WHEN 'CT' THEN 0.55
        WHEN 'CA' THEN 0.38
        WHEN 'MA' THEN 2.5
        WHEN 'SR' THEN 0
        WHEN 'AS' THEN 0
      END
    FROM en13813_recipes r
    WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  END IF;
END $$;

-- ITT Test Plans hinzufügen (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_itt_test_plans') THEN
    INSERT INTO en13813_itt_test_plans (
      recipe_id,
      tenant_id,
      required_tests,
      test_status
    )
    SELECT 
      r.id,
      r.tenant_id,
      CASE r.type
        WHEN 'CT' THEN '[{"test": "Druckfestigkeit", "standard": "EN 13892-2"}, {"test": "Biegezugfestigkeit", "standard": "EN 13892-2"}]'::jsonb
        WHEN 'CA' THEN '[{"test": "Druckfestigkeit", "standard": "EN 13892-2"}, {"test": "Biegezugfestigkeit", "standard": "EN 13892-2"}]'::jsonb
        WHEN 'MA' THEN '[{"test": "Druckfestigkeit", "standard": "EN 13892-2"}, {"test": "Oberflächenhärte", "standard": "EN 13892-6"}]'::jsonb
        WHEN 'SR' THEN '[{"test": "Haftzugfestigkeit", "standard": "EN 13892-8"}]'::jsonb
        WHEN 'AS' THEN '[{"test": "Eindringtiefe", "standard": "EN 13892-5"}]'::jsonb
      END,
      'completed'
    FROM en13813_recipes r
    WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  END IF;
END $$;

-- FPC Control Plans hinzufügen (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_fpc_control_plans') THEN
    INSERT INTO en13813_fpc_control_plans (
      recipe_id,
      tenant_id,
      control_frequency,
      control_parameters,
      acceptance_criteria
    )
    SELECT 
      r.id,
      r.tenant_id,
      '{"raw_materials": "Täglich", "fresh_mortar": "Je Charge"}'::jsonb,
      '{"binder_quality": ["Zertifikat"], "consistency": ["Ausbreitmaß"]}'::jsonb,
      '{"strength_tolerance": "±10%"}'::jsonb
    FROM en13813_recipes r
    WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  END IF;
END $$;

-- Compliance Tasks hinzufügen (falls Tabelle existiert)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_compliance_tasks') THEN
    INSERT INTO en13813_compliance_tasks (
      recipe_id,
      tenant_id,
      task_type,
      description,
      due_date,
      status,
      priority
    )
    SELECT 
      r.id,
      r.tenant_id,
      'itt_review',
      'Jährliche ITT-Überprüfung für ' || r.name,
      CURRENT_DATE + INTERVAL '365 days',
      'pending',
      'medium'
    FROM en13813_recipes r
    WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  END IF;
END $$;

-- Erfolgsmeldung
DO $$
DECLARE
  recipe_count INTEGER;
  material_count INTEGER;
  itt_count INTEGER;
  fpc_count INTEGER;
  task_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recipe_count 
  FROM en13813_recipes 
  WHERE tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  
  SELECT COUNT(*) INTO material_count
  FROM en13813_recipe_materials
  WHERE tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  
  SELECT COUNT(*) INTO itt_count
  FROM en13813_itt_test_plans
  WHERE tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  
  SELECT COUNT(*) INTO fpc_count
  FROM en13813_fpc_control_plans
  WHERE tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  
  SELECT COUNT(*) INTO task_count
  FROM en13813_compliance_tasks
  WHERE tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  
  RAISE NOTICE '==================================';
  RAISE NOTICE 'Demo-Daten erfolgreich erstellt:';
  RAISE NOTICE '- % Rezepturen', recipe_count;
  RAISE NOTICE '- % Materialzusammensetzungen', material_count;
  RAISE NOTICE '- % ITT Test Plans', itt_count;
  RAISE NOTICE '- % FPC Control Plans', fpc_count;
  RAISE NOTICE '- % Compliance Tasks', task_count;
  RAISE NOTICE '==================================';
END $$;