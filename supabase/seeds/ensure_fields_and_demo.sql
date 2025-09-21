-- ================================================
-- STELLE SICHER DASS ALLE FELDER EXISTIEREN UND ERSTELLE DEMO-DATEN
-- ================================================

-- 1. Füge fehlende Felder hinzu (falls nicht vorhanden)
ALTER TABLE en13813_recipes 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS production_site TEXT,
ADD COLUMN IF NOT EXISTS product_designation TEXT,
ADD COLUMN IF NOT EXISTS ce_marking_year INTEGER,
ADD COLUMN IF NOT EXISTS standard_reference TEXT DEFAULT 'EN 13813:2002',
ADD COLUMN IF NOT EXISTS avcp_system TEXT,
ADD COLUMN IF NOT EXISTS release_of_corrosive_substances TEXT DEFAULT 'CA',
ADD COLUMN IF NOT EXISTS water_permeability TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS water_vapour_permeability TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS impact_resistance TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS sound_insulation TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS sound_absorption TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS thermal_resistance TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS chemical_resistance TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS wear_resistance_bohme_class TEXT,
ADD COLUMN IF NOT EXISTS wear_resistance_bca_class TEXT,
ADD COLUMN IF NOT EXISTS wear_resistance_rwa_class TEXT,
ADD COLUMN IF NOT EXISTS wear_resistance_method TEXT,
ADD COLUMN IF NOT EXISTS rwfc_class TEXT,
ADD COLUMN IF NOT EXISTS thermal_conductivity_w_mk DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS indentation_class TEXT,
ADD COLUMN IF NOT EXISTS bond_strength_class TEXT,
ADD COLUMN IF NOT EXISTS impact_resistance_class TEXT,
ADD COLUMN IF NOT EXISTS surface_hardness_class TEXT,
ADD COLUMN IF NOT EXISTS intended_use JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dop_number TEXT,
ADD COLUMN IF NOT EXISTS notified_body JSONB DEFAULT '{}';

-- 2. Füge fehlende Spalten zu recipe_materials hinzu
ALTER TABLE en13813_recipe_materials
ADD COLUMN IF NOT EXISTS binder_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS aggregates JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS grain_size_distribution JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mixing_instructions JSONB DEFAULT '{}';

-- 3. Bereinigung vorheriger Demo-Daten
DELETE FROM en13813_recipes WHERE tenant_id IN (
  SELECT id FROM tenants WHERE slug = 'demo'
);

-- 4. Erstelle Demo-Rezepturen
WITH demo_tenant AS (
  SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1
),
demo_user AS (
  SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1
)
-- CT-Rezeptur
INSERT INTO en13813_recipes (
  tenant_id, created_by, recipe_code, name, type,
  description, manufacturer, production_site, product_designation,
  ce_marking_year, avcp_system,
  compressive_strength_class, flexural_strength_class,
  wear_resistance_bohme_class, wear_resistance_method,
  fire_class, release_of_corrosive_substances,
  rwfc_class, intended_use, dop_number, status
)
SELECT 
  dt.id, du.id, 'CT-DEMO-001', 'Premium Zementestrich CT-C30-F5', 'CT',
  'Hochbelastbarer Zementestrich für Industrieböden', 'Demo Estrich GmbH',
  'Werk Berlin', 'CT-C30-F5-A15', 2024, 'System 4',
  'C30', 'F5', 'A15', 'bohme', 'A1fl', 'CA', 'RWFC350',
  '{"wearing_surface": true, "with_flooring": false}'::jsonb,
  '2024-CT-001', 'active'
FROM demo_tenant dt, demo_user du;

-- CA-Rezeptur
INSERT INTO en13813_recipes (
  tenant_id, created_by, recipe_code, name, type,
  description, manufacturer, production_site, product_designation,
  ce_marking_year, avcp_system,
  compressive_strength_class, flexural_strength_class,
  fire_class, thermal_conductivity_w_mk,
  intended_use, dop_number, status
)
SELECT 
  dt.id, du.id, 'CA-DEMO-002', 'Fließestrich CAF Heizestrich', 'CA',
  'Calciumsulfat-Fließestrich für Fußbodenheizung', 'Demo Estrich GmbH',
  'Werk München', 'CA-C35-F7-H', 2024, 'System 4',
  'C35', 'F7', 'A1fl', 1.4,
  '{"wearing_surface": false, "with_flooring": true, "heated_screed": true}'::jsonb,
  '2024-CA-002', 'active'
FROM demo_tenant dt, demo_user du;

-- AS-Rezeptur
INSERT INTO en13813_recipes (
  tenant_id, created_by, recipe_code, name, type,
  description, manufacturer, production_site, product_designation,
  ce_marking_year, avcp_system,
  compressive_strength_class, flexural_strength_class,
  indentation_class, fire_class, chemical_resistance,
  intended_use, dop_number, status
)
SELECT 
  dt.id, du.id, 'AS-DEMO-003', 'Gussasphalt AS Industrie', 'AS',
  'Gussasphaltestrich für Industrieflächen', 'Demo Estrich GmbH',
  'Werk Hamburg', 'AS-IC40', 2024, 'System 4',
  'IC40', 'IP10', 'IC40', 'Bfl-s1', 'CR',
  '{"wearing_surface": true, "with_flooring": false}'::jsonb,
  '2024-AS-003', 'active'
FROM demo_tenant dt, demo_user du;

-- SR-Rezeptur
INSERT INTO en13813_recipes (
  tenant_id, created_by, recipe_code, name, type,
  description, manufacturer, production_site, product_designation,
  ce_marking_year, avcp_system,
  compressive_strength_class, flexural_strength_class,
  bond_strength_class, impact_resistance_class,
  wear_resistance_bca_class, wear_resistance_method,
  fire_class, chemical_resistance,
  intended_use, dop_number, notified_body, status
)
SELECT 
  dt.id, du.id, 'SR-DEMO-004', 'Epoxidharz SR Heavy Duty', 'SR',
  'Epoxidharzbeschichtung für Produktionshallen', 'Demo Estrich GmbH',
  'Werk Frankfurt', 'SR-B2.0-IR20-AR0.5', 2024, 'System 3',
  'B2.0', 'IR20', 'B2.0', 'IR20', 'AR0.5', 'bca',
  'Bfl-s1', 'CR',
  '{"wearing_surface": true, "with_flooring": false}'::jsonb,
  '2024-SR-004', '{"number": "0756", "name": "KIWA"}'::jsonb, 'active'
FROM demo_tenant dt, demo_user du;

-- MA-Rezeptur
INSERT INTO en13813_recipes (
  tenant_id, created_by, recipe_code, name, type,
  description, manufacturer, production_site, product_designation,
  ce_marking_year, avcp_system,
  compressive_strength_class, flexural_strength_class,
  surface_hardness_class, fire_class,
  intended_use, dop_number, status
)
SELECT 
  dt.id, du.id, 'MA-DEMO-005', 'Steinholzestrich MA Klassik', 'MA',
  'Magnesiaestrich für historische Gebäude', 'Demo Estrich GmbH',
  'Werk Leipzig', 'MA-C40-F7-SH100', 2024, 'System 4',
  'C40', 'F7', 'SH100', 'A1fl',
  '{"wearing_surface": false, "with_flooring": true}'::jsonb,
  '2024-MA-005', 'active'
FROM demo_tenant dt, demo_user du;

-- 5. Materialzusammensetzungen
INSERT INTO en13813_recipe_materials (
  recipe_id, tenant_id,
  binder_type, binder_designation, binder_amount_kg_m3,
  binder_percentage, water_binder_ratio,
  aggregates, additives
)
SELECT 
  r.id, r.tenant_id,
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
    WHEN 'CT' THEN 15.5
    WHEN 'CA' THEN 18.0
    WHEN 'MA' THEN 12.0
    WHEN 'SR' THEN 22.0
    WHEN 'AS' THEN 7.5
  END,
  CASE r.type
    WHEN 'CT' THEN 0.55
    WHEN 'CA' THEN 0.38
    WHEN 'MA' THEN 2.5
    WHEN 'SR' THEN 0
    WHEN 'AS' THEN 0
  END,
  CASE r.type
    WHEN 'CT' THEN '[{"material": "Quarzsand 0-2mm", "percentage": 35}, {"material": "Quarzsand 2-4mm", "percentage": 25}]'::jsonb
    WHEN 'CA' THEN '[{"material": "Quarzsand 0-4mm", "percentage": 60}]'::jsonb
    WHEN 'MA' THEN '[{"material": "Quarzsand 0-2mm", "percentage": 40}, {"material": "Holzspäne", "percentage": 32}]'::jsonb
    WHEN 'SR' THEN '[{"material": "Quarzsand 0.1-0.3mm", "percentage": 30}]'::jsonb
    WHEN 'AS' THEN '[{"material": "Basalt 0-2mm", "percentage": 20}, {"material": "Basalt 2-5mm", "percentage": 24.5}]'::jsonb
  END,
  CASE r.type
    WHEN 'CT' THEN '[{"type": "Fließmittel", "dosage": 0.8}]'::jsonb
    WHEN 'CA' THEN '[{"type": "Verflüssiger", "dosage": 0.5}]'::jsonb
    WHEN 'MA' THEN '[{"type": "MgCl2-Lösung", "concentration": "22°Bé"}]'::jsonb
    WHEN 'SR' THEN '[{"type": "Härter", "ratio": "2:1"}]'::jsonb
    WHEN 'AS' THEN '[{"type": "Polymer", "dosage": 3.0}]'::jsonb
  END
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');

-- 6. ITT Test Plans
INSERT INTO en13813_itt_test_plans (
  recipe_id, tenant_id, required_tests, test_status
)
SELECT 
  r.id, r.tenant_id,
  CASE r.type
    WHEN 'CT' THEN '[{"test": "Druckfestigkeit", "standard": "EN 13892-2", "result": "32.5 N/mm²"}, {"test": "Biegezugfestigkeit", "standard": "EN 13892-2", "result": "5.8 N/mm²"}, {"test": "Verschleiß Böhme", "standard": "EN 13892-3", "result": "14.2 cm³/50cm²"}]'::jsonb
    WHEN 'CA' THEN '[{"test": "Druckfestigkeit", "standard": "EN 13892-2", "result": "37.2 N/mm²"}, {"test": "Biegezugfestigkeit", "standard": "EN 13892-2", "result": "7.5 N/mm²"}]'::jsonb
    WHEN 'MA' THEN '[{"test": "Druckfestigkeit", "standard": "EN 13892-2", "result": "42.1 N/mm²"}, {"test": "Oberflächenhärte", "standard": "EN 13892-6", "result": "105 N/mm²"}]'::jsonb
    WHEN 'SR' THEN '[{"test": "Haftzugfestigkeit", "standard": "EN 13892-8", "result": "2.2 N/mm²"}, {"test": "Verschleiß BCA", "standard": "EN 13892-4", "result": "AR0.5"}]'::jsonb
    WHEN 'AS' THEN '[{"test": "Eindringtiefe", "standard": "EN 13892-5", "result": "IC40"}]'::jsonb
  END,
  'completed'
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');

-- 7. FPC Control Plans
INSERT INTO en13813_fpc_control_plans (
  recipe_id, tenant_id,
  control_frequency, control_parameters, acceptance_criteria
)
SELECT 
  r.id, r.tenant_id,
  '{"raw_materials": "Täglich", "fresh_mortar": "Je Charge", "hardened_properties": "Wöchentlich"}'::jsonb,
  '{"binder_quality": ["Zertifikat"], "consistency": ["Ausbreitmaß"], "strength": ["7d", "28d"]}'::jsonb,
  '{"strength_tolerance": "±10%", "consistency_range": "±20mm"}'::jsonb
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');

-- 8. Compliance Tasks
INSERT INTO en13813_compliance_tasks (
  recipe_id, tenant_id,
  task_type, description, due_date, status, priority
)
SELECT 
  r.id, r.tenant_id,
  'itt_review', 'Jährliche ITT-Überprüfung: ' || r.name,
  CURRENT_DATE + INTERVAL '365 days', 'pending', 'medium'
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo')
UNION ALL
SELECT 
  r.id, r.tenant_id,
  'fpc_audit', 'Vierteljährliches FPC-Audit: ' || r.name,
  CURRENT_DATE + INTERVAL '90 days', 'pending', 'high'
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');

-- Erfolgsmeldung
DO $$
DECLARE
  recipe_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recipe_count 
  FROM en13813_recipes 
  WHERE tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');
  
  RAISE NOTICE '==================================';
  RAISE NOTICE 'Erfolgreich % Demo-Rezepturen mit allen Details erstellt!', recipe_count;
  RAISE NOTICE '==================================';
END $$;