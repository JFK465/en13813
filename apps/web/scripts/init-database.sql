-- Initialize EN13813 Database with Sample Data
-- Run this after the main migration

-- ==================== CREATE TEST TENANT ====================

INSERT INTO tenants (id, name, slug, status)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Demo Estrichwerke GmbH', 'demo-estrichwerke', 'active')
ON CONFLICT (id) DO NOTHING;

-- ==================== CREATE TEST USER PROFILE ====================

-- Note: You need to create a user first via Supabase Auth
-- Then update this with the actual user_id
-- For now, we'll create a placeholder that can be updated later

INSERT INTO profiles (id, user_id, tenant_id, full_name, role)
VALUES
    ('22222222-2222-2222-2222-222222222222',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Replace with actual user_id after signup
     '11111111-1111-1111-1111-111111111111',
     'Demo Administrator',
     'admin')
ON CONFLICT (id) DO NOTHING;

-- ==================== CREATE SAMPLE RECIPES ====================

INSERT INTO en13813_recipes (
    id,
    tenant_id,
    recipe_code,
    name,
    product_name,
    manufacturer_name,
    manufacturer_address,
    binder_type,
    compressive_strength_class,
    flexural_strength_class,
    fire_class,
    wear_resistance_bohme_class,
    status,
    created_by
) VALUES
    (
        '33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'CT-C25-F4-A22',
        'Standard Zement-Estrich',
        'FloorTech CT25 Premium',
        'Demo Estrichwerke GmbH',
        'Musterstraße 1, 12345 Musterstadt, Deutschland',
        'CT',
        'C25',
        'F4',
        'A1fl',
        'A22',
        'active',
        '22222222-2222-2222-2222-222222222222'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        '11111111-1111-1111-1111-111111111111',
        'CA-C16-F3',
        'Calciumsulfat-Estrich Standard',
        'FloorTech CA16 Eco',
        'Demo Estrichwerke GmbH',
        'Musterstraße 1, 12345 Musterstadt, Deutschland',
        'CA',
        'C16',
        'F3',
        'A1fl',
        NULL,
        'active',
        '22222222-2222-2222-2222-222222222222'
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'CT-C35-F5-AR2',
        'Hochfester Zement-Estrich',
        'FloorTech CT35 Industrial',
        'Demo Estrichwerke GmbH',
        'Musterstraße 1, 12345 Musterstadt, Deutschland',
        'CT',
        'C35',
        'F5',
        'A1fl',
        NULL,
        'active',
        '22222222-2222-2222-2222-222222222222'
    )
ON CONFLICT (id) DO NOTHING;

-- Update pH value for CA recipe (must be >= 7)
UPDATE en13813_recipes
SET ph_value = 7.5
WHERE binder_type = 'CA' AND ph_value IS NULL;

-- ==================== CREATE FPC CONTROL PLANS ====================

INSERT INTO en13813_fpc_control_plans (
    tenant_id,
    name,
    description,
    control_type,
    frequency,
    test_parameter,
    test_method,
    test_standard,
    min_value,
    max_value,
    target_value,
    unit,
    responsible_role
) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Druckfestigkeit - Tageskontrolle',
        'Tägliche Kontrolle der Druckfestigkeit für CT-Estriche',
        'final_product',
        'daily',
        'compressive_strength',
        'Würfeldruckprüfung',
        'EN 13892-2',
        25.0,
        35.0,
        30.0,
        'N/mm²',
        'Laborleiter'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'Biegezugfestigkeit - Wochenkontrolle',
        'Wöchentliche Kontrolle der Biegezugfestigkeit',
        'final_product',
        'weekly',
        'flexural_strength',
        'Biegezugprüfung',
        'EN 13892-2',
        4.0,
        6.0,
        5.0,
        'N/mm²',
        'Laborleiter'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'Zement - Eingangskontrolle',
        'Kontrolle der Zementqualität bei Anlieferung',
        'incoming_material',
        'batch',
        'cement_quality',
        'Sichtprüfung und Zertifikatskontrolle',
        'EN 197-1',
        NULL,
        NULL,
        NULL,
        NULL,
        'Wareneingangskontrolle'
    )
ON CONFLICT DO NOTHING;

-- ==================== CREATE SAMPLE BATCHES ====================

INSERT INTO en13813_batches (
    tenant_id,
    recipe_id,
    batch_number,
    production_date,
    quantity_kg,
    fpc_status,
    conformity_status
) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        'BATCH-2025-001',
        '2025-01-20',
        25000,
        'passed',
        'conforming'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        'BATCH-2025-002',
        '2025-01-21',
        30000,
        'passed',
        'conforming'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444444',
        'BATCH-2025-003',
        '2025-01-22',
        20000,
        'pending',
        'pending'
    )
ON CONFLICT (batch_number) DO NOTHING;

-- ==================== CREATE SAMPLE ITT TEST ====================

INSERT INTO en13813_itt_tests (
    tenant_id,
    recipe_id,
    test_number,
    test_date,
    laboratory_name,
    laboratory_accreditation,
    compressive_strength_result,
    flexural_strength_result,
    fire_test_result,
    compliant,
    test_report_number
) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        'ITT-2025-001',
        '2025-01-15',
        'Prüfinstitut München GmbH',
        'DAkkS D-PL-12345-01-00',
        26.8,
        4.3,
        'A1fl',
        true,
        'PIM-2025-0142'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444444',
        'ITT-2025-002',
        '2025-01-16',
        'Prüfinstitut München GmbH',
        'DAkkS D-PL-12345-01-00',
        17.2,
        3.4,
        'A1fl',
        true,
        'PIM-2025-0143'
    )
ON CONFLICT (test_number) DO NOTHING;

-- ==================== CREATE SAMPLE DOP ====================

INSERT INTO en13813_dops (
    tenant_id,
    recipe_id,
    dop_number,
    version,
    issue_date,
    valid_until,
    language,
    manufacturer_data,
    signatory,
    status
) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        'DoP-2025-001',
        1,
        '2025-01-20',
        '2035-01-20',
        'de',
        '{"name": "Demo Estrichwerke GmbH", "address": "Musterstraße 1", "postalCode": "12345", "city": "Musterstadt", "country": "Deutschland", "phone": "+49 123 456789", "email": "info@demo-estrichwerke.de"}',
        '{"name": "Max Mustermann", "position": "Technischer Leiter", "place": "Musterstadt"}',
        'published'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444444',
        'DoP-2025-002',
        1,
        '2025-01-21',
        '2035-01-21',
        'de',
        '{"name": "Demo Estrichwerke GmbH", "address": "Musterstraße 1", "postalCode": "12345", "city": "Musterstadt", "country": "Deutschland", "phone": "+49 123 456789", "email": "info@demo-estrichwerke.de"}',
        '{"name": "Max Mustermann", "position": "Technischer Leiter", "place": "Musterstadt"}',
        'published'
    )
ON CONFLICT (dop_number) DO NOTHING;

-- ==================== CREATE SAMPLE COMPLIANCE TASKS ====================

INSERT INTO en13813_compliance_tasks (
    tenant_id,
    task_type,
    title,
    description,
    due_date,
    status
) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'calibration',
        'Druckprüfmaschine Kalibrierung',
        'Jährliche Kalibrierung der Druckprüfmaschine DPM-01',
        '2025-02-15',
        'pending'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'audit',
        'Internes FPC Audit Q1/2025',
        'Quartalsweise Überprüfung des FPC-Systems',
        '2025-03-31',
        'pending'
    ),
    (
        '11111111-1111-1111-1111-111111111111',
        'test',
        'ITT Wiederholungsprüfung CT-C35-F5',
        'Jährliche Wiederholungsprüfung für Hochleistungsrezeptur',
        '2025-06-30',
        'pending'
    )
ON CONFLICT DO NOTHING;

-- ==================== SUCCESS MESSAGE ====================

DO $$
BEGIN
    RAISE NOTICE 'Sample data has been successfully created!';
    RAISE NOTICE '';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 1 Tenant: Demo Estrichwerke GmbH';
    RAISE NOTICE '- 3 Recipes (CT-C25-F4, CA-C16-F3, CT-C35-F5)';
    RAISE NOTICE '- 3 FPC Control Plans';
    RAISE NOTICE '- 3 Batches';
    RAISE NOTICE '- 2 ITT Tests';
    RAISE NOTICE '- 2 DoPs';
    RAISE NOTICE '- 3 Compliance Tasks';
    RAISE NOTICE '';
    RAISE NOTICE 'Note: Update the user_id in profiles table after creating your first user!';
END$$;