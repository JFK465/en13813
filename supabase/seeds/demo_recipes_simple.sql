-- ================================================
-- DEMO REZEPTUREN FÜR EN 13813 - VEREINFACHT
-- Erstellt Beispielrezepturen mit vorhandenen Feldern
-- ================================================

-- Bereinigung vorheriger Demo-Daten
DELETE FROM en13813_recipes WHERE tenant_id IN (
  SELECT id FROM tenants WHERE slug = 'demo'
);

-- 1. CT-Rezeptur: Zementestrich
WITH demo_tenant AS (
  SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1
),
demo_user AS (
  SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1
),
ct_recipe AS (
  INSERT INTO en13813_recipes (
    tenant_id,
    created_by,
    name,
    recipe_code,
    type,
    compressive_strength_class,
    flexural_strength_class,
    wear_resistance_bohme_class,
    fire_class,
    release_of_corrosive_substances,
    water_permeability,
    water_vapour_permeability,
    impact_resistance,
    sound_insulation,
    sound_absorption,
    thermal_resistance,
    chemical_resistance,
    wear_resistance_method,
    rwfc_class,
    intended_use,
    dop_number,
    notified_body,
    status
  )
  SELECT 
    dt.id,
    du.id,
    'Premium Zementestrich CT-C30-F5',
    'CT-PREM-001',
    'CT',
    'C30',
    'F5',
    'A15',
    'A1fl',
    'CA',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'bohme',
    'RWFC350',
    jsonb_build_object(
      'wearing_surface', true,
      'with_flooring', false,
      'location', 'Industriehalle'
    ),
    '2024-CT-C30-001',
    jsonb_build_object(
      'number', '0123',
      'name', 'TÜV Rheinland'
    ),
    'published'
  FROM demo_tenant dt, demo_user du
  RETURNING id, tenant_id
)
-- Materialzusammensetzung für CT
INSERT INTO en13813_recipe_materials (
  recipe_id,
  tenant_id,
  binder_type,
  binder_designation,
  binder_amount_kg_m3,
  water_binder_ratio,
  additives
)
SELECT 
  r.id,
  r.tenant_id,
  'Zement',
  'CEM II/B-S 32,5 R',
  340,
  0.55,
  jsonb_build_array(
    jsonb_build_object('type', 'Fließmittel', 'dosage', 0.8),
    jsonb_build_object('type', 'Verzögerer', 'dosage', 0.2)
  )
FROM ct_recipe r;

-- 2. CA-Rezeptur: Calciumsulfatestrich
WITH ca_recipe AS (
  INSERT INTO en13813_recipes (
    tenant_id,
    created_by,
    name,
    recipe_code,
    type,
    compressive_strength_class,
    flexural_strength_class,
    fire_class,
    release_of_corrosive_substances,
    thermal_conductivity_w_mk,
    intended_use,
    dop_number,
    status
  )
  SELECT 
    dt.id,
    du.id,
    'Fließestrich CAF Heizestrich',
    'CA-HEAT-002',
    'CA',
    'C35',
    'F7',
    'A1fl',
    'CA',
    1.4,
    jsonb_build_object(
      'wearing_surface', false,
      'with_flooring', true,
      'heated_screed', true
    ),
    '2024-CA-C35-002',
    'published'
  FROM 
    (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) dt,
    (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1) du
  RETURNING id, tenant_id
)
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
  'Calciumsulfat',
  'Alpha-Halbhydrat CAB 30',
  395,
  0.38
FROM ca_recipe r;

-- 3. AS-Rezeptur: Gussasphaltestrich
WITH as_recipe AS (
  INSERT INTO en13813_recipes (
    tenant_id,
    created_by,
    name,
    recipe_code,
    type,
    indentation_class,
    fire_class,
    release_of_corrosive_substances,
    chemical_resistance,
    intended_use,
    dop_number,
    status
  )
  SELECT 
    dt.id,
    du.id,
    'Gussasphalt AS Industrie',
    'AS-IND-003',
    'AS',
    'IC40',
    'Bfl-s1',
    'CA',
    'CR',
    jsonb_build_object(
      'wearing_surface', true,
      'with_flooring', false
    ),
    '2024-AS-IC40-003',
    'published'
  FROM 
    (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) dt,
    (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1) du
  RETURNING id, tenant_id
)
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
  'Bitumen',
  'B 20/30',
  165,
  0 -- Kein Wasser bei Gussasphalt
FROM as_recipe r;

-- 4. SR-Rezeptur: Kunstharzestrich
WITH sr_recipe AS (
  INSERT INTO en13813_recipes (
    tenant_id,
    created_by,
    name,
    recipe_code,
    type,
    bond_strength_class,
    impact_resistance_class,
    fire_class,
    release_of_corrosive_substances,
    chemical_resistance,
    wear_resistance_bca_class,
    wear_resistance_method,
    intended_use,
    dop_number,
    notified_body,
    status
  )
  SELECT 
    dt.id,
    du.id,
    'Epoxidharz SR Heavy Duty',
    'SR-EP-004',
    'SR',
    'B2.0',
    'IR20',
    'Bfl-s1',
    'CA',
    'CR',
    'AR0.5',
    'bca',
    jsonb_build_object(
      'wearing_surface', true,
      'with_flooring', false
    ),
    '2024-SR-B20-004',
    jsonb_build_object(
      'number', '0756',
      'name', 'KIWA'
    ),
    'published'
  FROM 
    (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) dt,
    (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1) du
  RETURNING id, tenant_id
)
INSERT INTO en13813_recipe_materials (
  recipe_id,
  tenant_id,
  binder_type,
  binder_designation,
  binder_amount_kg_m3,
  water_binder_ratio,
  additives
)
SELECT 
  r.id,
  r.tenant_id,
  'Epoxidharz',
  'EP-2K-100',
  480,
  0, -- Kein Wasser bei Kunstharz
  jsonb_build_array(
    jsonb_build_object('type', 'Härter', 'ratio', '2:1')
  )
FROM sr_recipe r;

-- 5. MA-Rezeptur: Magnesiaestrich
WITH ma_recipe AS (
  INSERT INTO en13813_recipes (
    tenant_id,
    created_by,
    name,
    recipe_code,
    type,
    compressive_strength_class,
    flexural_strength_class,
    surface_hardness_class,
    fire_class,
    release_of_corrosive_substances,
    intended_use,
    dop_number,
    status
  )
  SELECT 
    dt.id,
    du.id,
    'Steinholzestrich MA Klassik',
    'MA-SH-005',
    'MA',
    'C40',
    'F7',
    'SH100',
    'A1fl',
    'CA',
    jsonb_build_object(
      'wearing_surface', false,
      'with_flooring', true
    ),
    '2024-MA-C40-005',
    'published'
  FROM 
    (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) dt,
    (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1) du
  RETURNING id, tenant_id
)
INSERT INTO en13813_recipe_materials (
  recipe_id,
  tenant_id,
  binder_type,
  binder_designation,
  binder_amount_kg_m3,
  water_binder_ratio,
  additives
)
SELECT 
  r.id,
  r.tenant_id,
  'Magnesiumoxid',
  'MgO 90',
  260,
  2.5, -- MgCl2-Lösung zu MgO Verhältnis
  jsonb_build_array(
    jsonb_build_object('type', 'MgCl2-Lösung', 'concentration', '22°Bé')
  )
FROM ma_recipe r;

-- ITT Test Plans
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
    WHEN 'CT' THEN jsonb_build_array(
      jsonb_build_object('test', 'Druckfestigkeit', 'standard', 'EN 13892-2'),
      jsonb_build_object('test', 'Biegezugfestigkeit', 'standard', 'EN 13892-2'),
      jsonb_build_object('test', 'Verschleiß Böhme', 'standard', 'EN 13892-3')
    )
    WHEN 'CA' THEN jsonb_build_array(
      jsonb_build_object('test', 'Druckfestigkeit', 'standard', 'EN 13892-2'),
      jsonb_build_object('test', 'Biegezugfestigkeit', 'standard', 'EN 13892-2')
    )
    WHEN 'AS' THEN jsonb_build_array(
      jsonb_build_object('test', 'Eindringtiefe', 'standard', 'EN 13892-5')
    )
    WHEN 'SR' THEN jsonb_build_array(
      jsonb_build_object('test', 'Haftzugfestigkeit', 'standard', 'EN 13892-8'),
      jsonb_build_object('test', 'Verschleiß BCA', 'standard', 'EN 13892-4')
    )
    WHEN 'MA' THEN jsonb_build_array(
      jsonb_build_object('test', 'Druckfestigkeit', 'standard', 'EN 13892-2'),
      jsonb_build_object('test', 'Biegezugfestigkeit', 'standard', 'EN 13892-2'),
      jsonb_build_object('test', 'Oberflächenhärte', 'standard', 'EN 13892-6')
    )
  END,
  'completed'
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');

-- FPC Control Plans
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
  jsonb_build_object(
    'raw_materials', 'Täglich',
    'fresh_mortar', 'Je Charge',
    'hardened_properties', 'Wöchentlich'
  ),
  jsonb_build_object(
    'binder_quality', ARRAY['Zertifikat'],
    'consistency', ARRAY['Ausbreitmaß'],
    'strength', ARRAY['7d', '28d']
  ),
  jsonb_build_object(
    'strength_tolerance', '±10%',
    'consistency_range', '±20mm'
  )
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');

-- Compliance Tasks
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
  'Jährliche ITT-Überprüfung',
  CURRENT_DATE + INTERVAL '365 days',
  'pending',
  'medium'
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
  
  RAISE NOTICE 'Erfolgreich % Demo-Rezepturen erstellt!', recipe_count;
END $$;