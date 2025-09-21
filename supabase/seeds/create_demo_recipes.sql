-- ================================================
-- DEMO REZEPTUREN FÜR EN 13813 - VOLLSTÄNDIG AUSGEFÜLLT
-- Erstellt realistische Beispielrezepturen für demo@example.com
-- ================================================

-- Bereinigung vorheriger Demo-Daten
DELETE FROM en13813_recipes WHERE tenant_id IN (
  SELECT id FROM tenants WHERE slug = 'demo'
);

-- 1. CT-Rezeptur: Zementestrich mit hohen Anforderungen
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
    description,
    manufacturer,
    production_site,
    product_designation,
    ce_marking_year,
    standard_reference,
    avcp_system,
    compressive_strength_class,
    flexural_strength_class,
    fire_class,
    release_of_corrosive_substances,
    water_permeability,
    water_vapour_permeability,
    impact_resistance,
    sound_insulation,
    sound_absorption,
    thermal_resistance,
    chemical_resistance,
    wear_resistance_bohme_class,
    wear_resistance_bca_class,
    wear_resistance_rwa_class,
    wear_resistance_method,
    rwfc_class,
    thermal_conductivity_w_mk,
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
    'Hochbelastbarer Zementestrich für Industrieböden mit erhöhten Anforderungen an Verschleißfestigkeit',
    'Estrich GmbH',
    'Werk Berlin, Industriestraße 10, 10115 Berlin',
    'CT-C30-F5-A15',
    2024,
    'EN 13813:2002',
    'System 4',
    'C30',
    'F5',
    'A1fl',
    'CA',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'A15',
    NULL,
    NULL,
    'bohme',
    'RWFC350',
    NULL,
    jsonb_build_object(
      'wearing_surface', true,
      'with_flooring', false,
      'location', 'Industriehalle',
      'load_class', 'Schwerlast',
      'special_requirements', ARRAY['Chemikalienbeständigkeit', 'Rutschfestigkeit']
    ),
    '2024-CT-C30-001',
    jsonb_build_object(
      'number', '0123',
      'name', 'TÜV Rheinland',
      'test_report', 'TR-2024-0456',
      'test_date', '2024-01-15'
    ),
    'published'
  FROM demo_tenant dt, demo_user du
  RETURNING id, tenant_id
)
-- Materialzusammensetzung für CT
INSERT INTO en13813_recipe_materials (
  recipe_id,
  tenant_id,
  binder_designation,
  binder_percentage,
  additives,
  aggregates,
  grain_size_distribution,
  mixing_instructions,
  fresh_mortar_properties
)
SELECT 
  r.id,
  r.tenant_id,
  'CEM II/B-S 32,5 R',
  15.5,
  jsonb_build_object(
    'plasticizer', jsonb_build_object('type', 'PCE', 'dosage', 0.8),
    'retarder', jsonb_build_object('type', 'Citrat', 'dosage', 0.2),
    'air_entrainer', jsonb_build_object('type', 'Tensid', 'dosage', 0.05)
  ),
  jsonb_build_array(
    jsonb_build_object('material', 'Quarzsand 0-2mm', 'percentage', 35),
    jsonb_build_object('material', 'Quarzsand 2-4mm', 'percentage', 25),
    jsonb_build_object('material', 'Kies 4-8mm', 'percentage', 24.5)
  ),
  jsonb_build_object(
    '0.063mm', 3,
    '0.125mm', 8,
    '0.25mm', 15,
    '0.5mm', 25,
    '1mm', 40,
    '2mm', 55,
    '4mm', 80,
    '8mm', 100
  ),
  jsonb_build_object(
    'water_cement_ratio', 0.55,
    'mixing_time', '3 Minuten',
    'mixing_speed', '60 U/min',
    'temperature', '15-25°C'
  ),
  jsonb_build_object(
    'consistency', 'F3',
    'air_content', '2.5%',
    'density', '2200 kg/m³',
    'workability_time', '45 Minuten'
  )
FROM ct_recipe r;

-- ITT Test Plan für CT
WITH ct_recipe AS (
  SELECT id, tenant_id FROM en13813_recipes 
  WHERE recipe_code = 'CT-PREM-001' AND tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo')
)
INSERT INTO en13813_itt_test_plans (
  recipe_id,
  tenant_id,
  required_tests,
  optional_tests,
  test_status,
  test_results,
  test_laboratory,
  notified_body_number,
  report_number,
  last_validated_at
)
SELECT 
  r.id,
  r.tenant_id,
  jsonb_build_array(
    jsonb_build_object(
      'test_name', 'Druckfestigkeit',
      'standard', 'EN 13892-2',
      'result', '32.5 N/mm²',
      'class', 'C30'
    ),
    jsonb_build_object(
      'test_name', 'Biegezugfestigkeit',
      'standard', 'EN 13892-2',
      'result', '5.8 N/mm²',
      'class', 'F5'
    ),
    jsonb_build_object(
      'test_name', 'Verschleißwiderstand nach Böhme',
      'standard', 'EN 13892-3',
      'result', '14.2 cm³/50cm²',
      'class', 'A15'
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'test_name', 'Oberflächenhärte',
      'standard', 'EN 13892-6',
      'result', '75 N/mm²'
    ),
    jsonb_build_object(
      'test_name', 'Schwindmaß',
      'standard', 'EN 13454-2',
      'result', '0.4 mm/m'
    )
  ),
  'completed',
  jsonb_build_object(
    'test_date', '2024-01-15',
    'temperature', '20°C',
    'humidity', '65%',
    'specimen_age', '28 Tage'
  ),
  'Materialprüfanstalt Berlin',
  '0123',
  'MPA-B-2024-0456',
  '2024-01-15'::timestamptz
FROM ct_recipe r;

-- 2. CA-Rezeptur: Calciumsulfatestrich für Fußbodenheizung
WITH ca_recipe AS (
  INSERT INTO en13813_recipes (
    tenant_id,
    created_by,
    name,
    recipe_code,
    type,
    description,
    manufacturer,
    production_site,
    product_designation,
    ce_marking_year,
    standard_reference,
    avcp_system,
    compressive_strength_class,
    flexural_strength_class,
    fire_class,
    release_of_corrosive_substances,
    water_permeability,
    water_vapour_permeability,
    impact_resistance,
    sound_insulation,
    sound_absorption,
    thermal_resistance,
    chemical_resistance,
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
    'Calciumsulfat-Fließestrich speziell für Fußbodenheizungen mit optimaler Wärmeleitfähigkeit',
    'Estrich GmbH',
    'Werk München, Baustoffweg 5, 80331 München',
    'CA-C35-F7-H',
    2024,
    'EN 13813:2002',
    'System 4',
    'C35',
    'F7',
    'A1fl',
    'CA',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    1.4,
    jsonb_build_object(
      'wearing_surface', false,
      'with_flooring', true,
      'heated_screed', true,
      'location', 'Wohnbereich',
      'special_requirements', ARRAY['Fußbodenheizung', 'Schnelltrocknend']
    ),
    '2024-CA-C35-002',
    'published'
  FROM 
    (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) dt,
    (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1) du
  RETURNING id, tenant_id
)
-- Materialzusammensetzung für CA
INSERT INTO en13813_recipe_materials (
  recipe_id,
  tenant_id,
  binder_designation,
  binder_percentage,
  additives,
  aggregates,
  grain_size_distribution,
  mixing_instructions,
  fresh_mortar_properties
)
SELECT 
  r.id,
  r.tenant_id,
  'Alpha-Halbhydrat CAB 30',
  18.0,
  jsonb_build_object(
    'liquifier', jsonb_build_object('type', 'Melamin', 'dosage', 0.5),
    'accelerator', jsonb_build_object('type', 'K2SO4', 'dosage', 0.1),
    'defoamer', jsonb_build_object('type', 'Silikon', 'dosage', 0.02)
  ),
  jsonb_build_array(
    jsonb_build_object('material', 'Quarzsand 0-4mm', 'percentage', 60),
    jsonb_build_object('material', 'Kalksteinmehl', 'percentage', 21.38)
  ),
  jsonb_build_object(
    '0.063mm', 5,
    '0.125mm', 10,
    '0.25mm', 20,
    '0.5mm', 35,
    '1mm', 55,
    '2mm', 80,
    '4mm', 100
  ),
  jsonb_build_object(
    'water_binder_ratio', 0.38,
    'mixing_time', '2 Minuten',
    'mixing_type', 'Zwangsmischer',
    'temperature', '10-30°C'
  ),
  jsonb_build_object(
    'flow_diameter', '240mm',
    'air_content', '1.5%',
    'density', '2150 kg/m³',
    'pot_life', '30 Minuten'
  )
FROM ca_recipe r;

-- 3. AS-Rezeptur: Gussasphaltestrich
WITH as_recipe AS (
  INSERT INTO en13813_recipes (
    tenant_id,
    created_by,
    name,
    recipe_code,
    type,
    description,
    manufacturer,
    production_site,
    product_designation,
    ce_marking_year,
    standard_reference,
    avcp_system,
    indentation_class,
    fire_class,
    release_of_corrosive_substances,
    water_permeability,
    water_vapour_permeability,
    impact_resistance,
    sound_insulation,
    sound_absorption,
    thermal_resistance,
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
    'Gussasphaltestrich für hochbelastete Industrieflächen',
    'Estrich GmbH',
    'Werk Hamburg, Hafenstraße 20, 20095 Hamburg',
    'AS-IC40',
    2024,
    'EN 13813:2002',
    'System 4',
    'IC40',
    'Bfl-s1',
    'CA',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'CR',
    jsonb_build_object(
      'wearing_surface', true,
      'with_flooring', false,
      'location', 'Industriehalle',
      'special_requirements', ARRAY['Chemikalienbeständig', 'Wasserdicht']
    ),
    '2024-AS-IC40-003',
    'published'
  FROM 
    (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) dt,
    (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1) du
  RETURNING id, tenant_id
)
-- Materialzusammensetzung für AS
INSERT INTO en13813_recipe_materials (
  recipe_id,
  tenant_id,
  binder_designation,
  binder_percentage,
  additives,
  aggregates,
  mixing_instructions,
  fresh_mortar_properties
)
SELECT 
  r.id,
  r.tenant_id,
  'Bitumen B 20/30',
  7.5,
  jsonb_build_object(
    'polymer_modifier', jsonb_build_object('type', 'SBS', 'dosage', 3.0),
    'filler', jsonb_build_object('type', 'Kalksteinmehl', 'dosage', 25)
  ),
  jsonb_build_array(
    jsonb_build_object('material', 'Basalt 0-2mm', 'percentage', 20),
    jsonb_build_object('material', 'Basalt 2-5mm', 'percentage', 24.5),
    jsonb_build_object('material', 'Basalt 5-8mm', 'percentage', 20)
  ),
  jsonb_build_object(
    'mixing_temperature', '230°C',
    'application_temperature', '220-250°C',
    'compaction', 'Selbstverdichtend'
  ),
  jsonb_build_object(
    'viscosity_230C', '15000 mPas',
    'application_thickness', '25-40mm'
  )
FROM as_recipe r;

-- 4. SR-Rezeptur: Kunstharzestrich
WITH sr_recipe AS (
  INSERT INTO en13813_recipes (
    tenant_id,
    created_by,
    name,
    recipe_code,
    type,
    description,
    manufacturer,
    production_site,
    product_designation,
    ce_marking_year,
    standard_reference,
    avcp_system,
    bond_strength_class,
    impact_resistance_class,
    fire_class,
    release_of_corrosive_substances,
    water_permeability,
    water_vapour_permeability,
    impact_resistance,
    sound_insulation,
    sound_absorption,
    thermal_resistance,
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
    'Epoxidharz-Beschichtung SR Heavy Duty',
    'SR-EP-004',
    'SR',
    'Hochbelastbare Epoxidharzbeschichtung für Produktionshallen',
    'Estrich GmbH',
    'Werk Frankfurt, Chemiepark 15, 60486 Frankfurt',
    'SR-B2.0-IR20-AR0.5',
    2024,
    'EN 13813:2002',
    'System 3',
    'B2.0',
    'IR20',
    'Bfl-s1',
    'CA',
    'NPD',
    'NPD',
    'IR20',
    'NPD',
    'NPD',
    'NPD',
    'CR',
    'AR0.5',
    'bca',
    jsonb_build_object(
      'wearing_surface', true,
      'with_flooring', false,
      'location', 'Produktionshalle',
      'special_requirements', ARRAY['Chemikalienbeständig', 'ESD-Schutz', 'Rutschhemmend']
    ),
    '2024-SR-B20-004',
    jsonb_build_object(
      'number', '0756',
      'name', 'KIWA',
      'test_report', 'K-2024-0789',
      'test_date', '2024-02-20'
    ),
    'published'
  FROM 
    (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) dt,
    (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1) du
  RETURNING id, tenant_id
)
-- Materialzusammensetzung für SR
INSERT INTO en13813_recipe_materials (
  recipe_id,
  tenant_id,
  binder_designation,
  binder_percentage,
  additives,
  aggregates,
  mixing_instructions,
  fresh_mortar_properties
)
SELECT 
  r.id,
  r.tenant_id,
  'Epoxidharz EP-2K-100',
  22.0,
  jsonb_build_object(
    'hardener', jsonb_build_object('type', 'Amin', 'ratio', '2:1'),
    'pigments', jsonb_build_object('type', 'Eisenoxid', 'dosage', 2.0),
    'thixotropic_agent', jsonb_build_object('type', 'Silica', 'dosage', 1.5)
  ),
  jsonb_build_array(
    jsonb_build_object('material', 'Quarzsand 0.1-0.3mm', 'percentage', 30),
    jsonb_build_object('material', 'Quarzsand 0.3-0.8mm', 'percentage', 44.5)
  ),
  jsonb_build_object(
    'mixing_ratio_A_B', '2:1',
    'mixing_time', '3 Minuten',
    'temperature', '15-25°C',
    'relative_humidity', 'max 75%'
  ),
  jsonb_build_object(
    'pot_life', '30 Minuten bei 20°C',
    'viscosity', '2500 mPas',
    'application_thickness', '3-5mm',
    'cure_time', '7 Tage bei 20°C'
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
    description,
    manufacturer,
    production_site,
    product_designation,
    ce_marking_year,
    standard_reference,
    avcp_system,
    compressive_strength_class,
    flexural_strength_class,
    surface_hardness_class,
    fire_class,
    release_of_corrosive_substances,
    water_permeability,
    water_vapour_permeability,
    impact_resistance,
    sound_insulation,
    sound_absorption,
    thermal_resistance,
    chemical_resistance,
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
    'Magnesiaestrich (Steinholz) für historische Gebäudesanierung',
    'Estrich GmbH',
    'Werk Leipzig, Traditionsweg 8, 04103 Leipzig',
    'MA-C40-F7-SH100',
    2024,
    'EN 13813:2002',
    'System 4',
    'C40',
    'F7',
    'SH100',
    'A1fl',
    'CA',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    'NPD',
    jsonb_build_object(
      'wearing_surface', false,
      'with_flooring', true,
      'location', 'Historisches Gebäude',
      'special_requirements', ARRAY['Diffusionsoffen', 'Ökologisch']
    ),
    '2024-MA-C40-005',
    'published'
  FROM 
    (SELECT id FROM tenants WHERE slug = 'demo' LIMIT 1) dt,
    (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1) du
  RETURNING id, tenant_id
)
-- Materialzusammensetzung für MA
INSERT INTO en13813_recipe_materials (
  recipe_id,
  tenant_id,
  binder_designation,
  binder_percentage,
  additives,
  aggregates,
  grain_size_distribution,
  mixing_instructions,
  fresh_mortar_properties
)
SELECT 
  r.id,
  r.tenant_id,
  'Magnesiumoxid MgO 90',
  12.0,
  jsonb_build_object(
    'solution', jsonb_build_object('type', 'MgCl2-Lösung', 'concentration', '22°Bé', 'ratio', 2.5),
    'organic_filler', jsonb_build_object('type', 'Holzmehl', 'dosage', 15),
    'pigments', jsonb_build_object('type', 'Eisenoxid', 'dosage', 1.0)
  ),
  jsonb_build_array(
    jsonb_build_object('material', 'Quarzsand 0-2mm', 'percentage', 40),
    jsonb_build_object('material', 'Holzspäne 2-4mm', 'percentage', 32)
  ),
  jsonb_build_object(
    '0.063mm', 2,
    '0.125mm', 5,
    '0.25mm', 12,
    '0.5mm', 25,
    '1mm', 45,
    '2mm', 70,
    '4mm', 100
  ),
  jsonb_build_object(
    'solution_temperature', '15-20°C',
    'mixing_time', '5 Minuten',
    'mixing_sequence', 'Trockenmischung, dann Lösung',
    'maturation_time', '5 Minuten'
  ),
  jsonb_build_object(
    'consistency', 'Erdfeucht',
    'density', '1950 kg/m³',
    'application_time', '60 Minuten',
    'initial_set', '3 Stunden'
  )
FROM ma_recipe r;

-- FPC Control Plans für alle Rezepturen
INSERT INTO en13813_fpc_control_plans (
  recipe_id,
  tenant_id,
  control_frequency,
  control_parameters,
  acceptance_criteria,
  control_points,
  sampling_plan,
  deviation_procedures
)
SELECT 
  r.id,
  r.tenant_id,
  jsonb_build_object(
    'raw_materials', 'Täglich',
    'mixture', 'Je Charge',
    'fresh_mortar', 'Je Charge',
    'hardened_properties', 'Wöchentlich'
  ),
  jsonb_build_object(
    'binder_quality', ARRAY['Zertifikat', 'Analyse'],
    'aggregate_grading', ARRAY['Siebanalyse'],
    'water_content', ARRAY['Darr-Methode'],
    'consistency', ARRAY['Ausbreitmaß', 'Fließmaß'],
    'strength_development', ARRAY['7d', '28d']
  ),
  jsonb_build_object(
    'strength_tolerance', '±10%',
    'consistency_range', '±20mm',
    'density_tolerance', '±50 kg/m³'
  ),
  jsonb_build_array(
    jsonb_build_object(
      'point', 'Wareneingang',
      'checks', ARRAY['Lieferschein', 'Zertifikat', 'Sichtprüfung']
    ),
    jsonb_build_object(
      'point', 'Dosierung',
      'checks', ARRAY['Waage kalibriert', 'Rezeptur eingehalten']
    ),
    jsonb_build_object(
      'point', 'Mischvorgang',
      'checks', ARRAY['Mischzeit', 'Homogenität']
    ),
    jsonb_build_object(
      'point', 'Einbau',
      'checks', ARRAY['Schichtdicke', 'Ebenheit', 'Temperatur']
    )
  ),
  jsonb_build_object(
    'frequency', 'Je 100m³',
    'sample_size', '3 Probekörper',
    'test_age', ARRAY['7 Tage', '28 Tage'],
    'storage', 'Normklima 20°C/65% r.F.'
  ),
  jsonb_build_object(
    'minor_deviation', 'Nachmischung oder Nachbehandlung',
    'major_deviation', 'Charge sperren, Ursachenanalyse',
    'critical_deviation', 'Produktion stoppen, Kunde informieren'
  )
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo');

-- Compliance Tasks für alle Rezepturen
INSERT INTO en13813_compliance_tasks (
  recipe_id,
  tenant_id,
  task_type,
  description,
  due_date,
  status,
  priority,
  assigned_to
)
SELECT 
  r.id,
  r.tenant_id,
  'itt_review',
  'Jährliche Überprüfung der ITT-Prüfungen',
  CURRENT_DATE + INTERVAL '365 days',
  'pending',
  'medium',
  (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1)
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo')
UNION ALL
SELECT 
  r.id,
  r.tenant_id,
  'fpc_audit',
  'Vierteljährliches internes FPC-Audit',
  CURRENT_DATE + INTERVAL '90 days',
  'pending',
  'high',
  (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1)
FROM en13813_recipes r
WHERE r.tenant_id IN (SELECT id FROM tenants WHERE slug = 'demo')
UNION ALL
SELECT 
  r.id,
  r.tenant_id,
  'document_update',
  'Aktualisierung der Leistungserklärung',
  CURRENT_DATE + INTERVAL '180 days',
  'pending',
  'low',
  (SELECT id FROM profiles WHERE email = 'demo@example.com' LIMIT 1)
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
  RAISE NOTICE 'Alle Rezepturen sind vollständig mit Materialien, ITT-Tests, FPC-Plänen und Compliance-Aufgaben ausgestattet.';
END $$;