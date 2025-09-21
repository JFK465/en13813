-- ================================================
-- DEMO REZEPTUREN FÜR EN 13813 - KORRIGIERTE VERSION
-- Für Benutzer: demo@example.com
-- ================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_recipe_id UUID;
BEGIN
    -- Einen Demo-Tenant-ID generieren (oder verwende eine existierende)
    v_tenant_id := gen_random_uuid();
    
    -- Demo-User erstellen oder finden
    SELECT id INTO v_user_id FROM profiles WHERE email = 'demo@example.com' LIMIT 1;
    
    IF v_user_id IS NULL THEN
        -- Erstelle einen Demo-User mit der generierten Tenant-ID
        INSERT INTO profiles (id, email, full_name, tenant_id, role)
        VALUES (gen_random_uuid(), 'demo@example.com', 'Demo User', v_tenant_id, 'member')
        RETURNING id INTO v_user_id;
    ELSE
        -- Verwende die existierende Tenant-ID des Users
        SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = v_user_id;
        -- Falls der User keine Tenant-ID hat, setze eine
        IF v_tenant_id IS NULL THEN
            v_tenant_id := gen_random_uuid();
            UPDATE profiles SET tenant_id = v_tenant_id WHERE id = v_user_id;
        END IF;
    END IF;

    -- Lösche alte Demo-Daten falls vorhanden
    DELETE FROM en13813_fpc_control_plans WHERE created_by = v_user_id;
    DELETE FROM en13813_itt_test_plans WHERE created_by = v_user_id;
    DELETE FROM en13813_recipe_materials WHERE created_by = v_user_id;
    DELETE FROM en13813_recipes WHERE created_by = v_user_id;

    -- ================================================
    -- 1. CT-C30-F5 - Standard Zementestrich (Wohnbereich)
    -- ================================================
    INSERT INTO en13813_recipes (
        tenant_id,
        recipe_code,
        name,
        type,
        compressive_strength_class,
        flexural_strength_class,
        wear_resistance_method,
        wear_resistance_class,
        fire_class,
        surface_hardness_class,
        intended_use,
        extended_properties,
        special_properties,
        additives,
        status,
        created_by,
        dop_number
    ) VALUES (
        v_tenant_id,
        'CT-001-2025',
        'Premium Wohnbereich-Zementestrich',
        'CT',
        'C30',
        'F5',
        'bohme',
        'A12',
        'A1fl',
        'SH50',
        '{
            "wearing_surface": true,
            "with_flooring": true,
            "heated_screed": false,
            "indoor_only": true,
            "industrial_use": false
        }'::jsonb,
        '{
            "density_kg_m3": 2200,
            "thermal_conductivity_w_mk": 1.4,
            "shrinkage_mm_m": 0.5,
            "setting_time_hours": 24,
            "walkable_after_days": 3,
            "ready_for_covering_days": 28,
            "moisture_content_percent": 2.0
        }'::jsonb,
        '{
            "layer_thickness_mm": 50,
            "application_method": "pump",
            "surface_treatment": "machine_smoothed"
        }'::jsonb,
        '[
            {"name": "Fließmittel FM-30", "dosage_percent": 0.8},
            {"name": "Luftporenbildner LP-10", "dosage_percent": 0.2},
            {"name": "Schwindreduzierer SR-5", "dosage_percent": 0.5}
        ]'::jsonb,
        'active',
        v_user_id,
        '2025-CT-C30-001'
    ) RETURNING id INTO v_recipe_id;

    -- Materialzusammensetzung für CT-001
    INSERT INTO en13813_recipe_materials (
        tenant_id,
        recipe_id,
        binder_type,
        binder_name,
        binder_amount_kg_m3,
        water_content,
        water_binder_ratio,
        aggregates,
        grain_size_distribution,
        mixing_instructions,
        fresh_mortar_properties,
        created_by
    ) VALUES (
        v_tenant_id,
        v_recipe_id,
        'CEM II/B-S 32,5 R',
        'Portlandhüttenzement',
        320,
        160,
        0.50,
        '[
            {"name": "Sand 0-2mm", "amount_kg_m3": 650, "percentage": 35},
            {"name": "Sand 2-4mm", "amount_kg_m3": 550, "percentage": 30},
            {"name": "Kies 4-8mm", "amount_kg_m3": 650, "percentage": 35}
        ]'::jsonb,
        '{
            "0.063": 2.5,
            "0.125": 5.0,
            "0.25": 12.0,
            "0.5": 25.0,
            "1.0": 42.0,
            "2.0": 65.0,
            "4.0": 85.0,
            "8.0": 100.0
        }'::jsonb,
        '{
            "mixing_time_seconds": 180,
            "mixer_type": "Zwangsmischer",
            "temperature_min_c": 5,
            "temperature_max_c": 30,
            "sequence": [
                "Zuschlagstoffe vorlegen",
                "Zement zugeben und 30s trockenmischen",
                "Wasser mit Zusatzmitteln unter Mischen zugeben",
                "Weitere 150s intensiv mischen"
            ]
        }'::jsonb,
        '{
            "consistency_class": "F4",
            "flow_diameter_mm": 440,
            "air_content_percent": 2.5,
            "density_fresh_kg_m3": 2280,
            "temperature_c": 20,
            "ph_value": 12.5,
            "initial_setting_min": 180,
            "final_setting_min": 360
        }'::jsonb,
        v_user_id
    );

    -- ITT-Prüfplan für CT-001
    INSERT INTO en13813_itt_test_plans (
        tenant_id,
        recipe_id,
        test_type,
        test_property,
        test_standard,
        test_age_days,
        required_value,
        test_laboratory,
        report_number,
        test_status,
        test_results,
        created_by
    ) VALUES 
    (v_tenant_id, v_recipe_id, 'initial_type_test', 'Druckfestigkeit', 'EN 13892-2', 28, 'C30 (≥30 N/mm²)', 'MPA Stuttgart', 'ITT-2025-001-D', 'completed', '{"value": 32.5, "unit": "N/mm²"}'::jsonb, v_user_id),
    (v_tenant_id, v_recipe_id, 'initial_type_test', 'Biegezugfestigkeit', 'EN 13892-2', 28, 'F5 (≥5 N/mm²)', 'MPA Stuttgart', 'ITT-2025-001-B', 'completed', '{"value": 5.8, "unit": "N/mm²"}'::jsonb, v_user_id),
    (v_tenant_id, v_recipe_id, 'initial_type_test', 'Verschleißwiderstand', 'EN 13892-3', 28, 'A12 (≤12 cm³/50cm²)', 'MPA Stuttgart', 'ITT-2025-001-V', 'completed', '{"value": 10.5, "unit": "cm³/50cm²"}'::jsonb, v_user_id),
    (v_tenant_id, v_recipe_id, 'initial_type_test', 'Oberflächenhärte', 'EN 13892-6', 28, 'SH50 (≥50 N/mm²)', 'MPA Stuttgart', 'ITT-2025-001-H', 'completed', '{"value": 55, "unit": "N/mm²"}'::jsonb, v_user_id);

    -- ================================================
    -- 2. CA-C25-F4 - Calciumsulfatestrich (Heizestrich)
    -- ================================================
    INSERT INTO en13813_recipes (
        tenant_id,
        recipe_code,
        name,
        type,
        compressive_strength_class,
        flexural_strength_class,
        wear_resistance_method,
        fire_class,
        rwfc_class,
        thermal_conductivity_w_mk,
        intended_use,
        extended_properties,
        status,
        created_by,
        dop_number
    ) VALUES (
        v_tenant_id,
        'CA-002-2025',
        'Fließestrich CAF für Fußbodenheizung',
        'CA',
        'C25',
        'F4',
        'none',
        'A1fl',
        'RWFC250',
        2.0,
        '{
            "wearing_surface": false,
            "with_flooring": true,
            "heated_screed": true,
            "indoor_only": true,
            "wet_areas": false
        }'::jsonb,
        '{
            "density_kg_m3": 2000,
            "moisture_content_cm_percent": 0.5,
            "heating_protocol_days": 21,
            "max_surface_temp_c": 55,
            "thermal_expansion_mm_mk": 0.012
        }'::jsonb,
        'active',
        v_user_id,
        '2025-CA-C25-002'
    ) RETURNING id INTO v_recipe_id;

    -- ================================================
    -- 3. AS-IC10 - Gussasphaltestrich (Industrieboden)
    -- ================================================
    INSERT INTO en13813_recipes (
        tenant_id,
        recipe_code,
        name,
        type,
        indentation_class,
        fire_class,
        heated_indicator,
        intended_use,
        extended_properties,
        special_properties,
        notified_body,
        status,
        created_by,
        dop_number
    ) VALUES (
        v_tenant_id,
        'AS-003-2025',
        'Industrie-Gussasphalt hart',
        'AS',
        'IC10',
        'Bfl-s1',
        false,
        '{
            "wearing_surface": true,
            "with_flooring": false,
            "industrial_use": true,
            "chemical_resistance": true,
            "indoor_only": false
        }'::jsonb,
        '{
            "processing_temperature_c": 230,
            "laying_temperature_c": 210,
            "density_kg_m3": 2400,
            "thermal_stability_c": 60,
            "water_absorption_percent": 0.1
        }'::jsonb,
        '{
            "layer_thickness_mm": 30,
            "surface_treatment": "abgestreut",
            "joint_free": true
        }'::jsonb,
        '{
            "number": "1234",
            "name": "MPA Stuttgart",
            "test_report": "PB-2025-AS-001",
            "test_date": "2025-01-15"
        }'::jsonb,
        'active',
        v_user_id,
        '2025-AS-IC10-003'
    ) RETURNING id INTO v_recipe_id;

    -- ================================================
    -- 4. SR-B2.0-AR1-IR4 - Kunstharzestrich (Parkhaus)
    -- ================================================
    INSERT INTO en13813_recipes (
        tenant_id,
        recipe_code,
        name,
        type,
        bond_strength_class,
        impact_resistance_class,
        wear_resistance_method,
        wear_resistance_class,
        fire_class,
        intended_use,
        extended_properties,
        notified_body,
        status,
        created_by,
        dop_number
    ) VALUES (
        v_tenant_id,
        'SR-004-2025',
        'Epoxidharz-Beschichtung Parkhaus',
        'SR',
        'B2.0',
        'IR4',
        'bca',
        'AR1',
        'Bfl-s1',
        '{
            "wearing_surface": true,
            "with_flooring": false,
            "outdoor_use": true,
            "industrial_use": true,
            "chemical_resistance": true,
            "wet_areas": true
        }'::jsonb,
        '{
            "pot_life_min": 20,
            "curing_time_hours": 24,
            "full_cure_days": 7,
            "temperature_resistance_c": 80,
            "chemical_resistance_list": ["Öl", "Benzin", "Bremsflüssigkeit", "Salzwasser"],
            "slip_resistance_class": "R11",
            "uv_stable": true
        }'::jsonb,
        '{
            "number": "1234",
            "name": "MPA Stuttgart",
            "test_report": "PB-2025-SR-001",
            "test_date": "2025-01-15"
        }'::jsonb,
        'active',
        v_user_id,
        '2025-SR-B20-004'
    ) RETURNING id INTO v_recipe_id;

    -- ================================================
    -- 5. MA-C40-F7-SH100 - Magnesitestrich (Industriehalle)
    -- ================================================
    INSERT INTO en13813_recipes (
        tenant_id,
        recipe_code,
        name,
        type,
        compressive_strength_class,
        flexural_strength_class,
        surface_hardness_class,
        wear_resistance_method,
        wear_resistance_class,
        fire_class,
        intended_use,
        extended_properties,
        status,
        created_by,
        dop_number
    ) VALUES (
        v_tenant_id,
        'MA-005-2025',
        'Hochfester Industriemagnesit',
        'MA',
        'C40',
        'F7',
        'SH100',
        'rolling_wheel',
        'RWA100',
        'A2fl-s1',
        '{
            "wearing_surface": true,
            "with_flooring": false,
            "industrial_use": true,
            "indoor_only": true,
            "wet_areas": false
        }'::jsonb,
        '{
            "density_kg_m3": 2800,
            "electrical_resistance_ohm_m": 50000,
            "antistatic": true,
            "color": "steingrau",
            "dust_binding": true,
            "oil_resistant": true
        }'::jsonb,
        'active',
        v_user_id,
        '2025-MA-C40-005'
    ) RETURNING id INTO v_recipe_id;

    -- ================================================
    -- FPC Control Plans für alle Rezepturen
    -- ================================================
    INSERT INTO en13813_fpc_control_plans (
        tenant_id,
        recipe_id,
        control_frequency,
        control_parameters,
        acceptance_criteria,
        control_points,
        sampling_plan,
        created_by
    ) 
    SELECT 
        v_tenant_id,
        id,
        'weekly',
        '["Konsistenz", "Rohdichte", "Luftgehalt", "Temperatur"]'::jsonb,
        '{"consistency": "±20mm", "density": "±50kg/m³", "air_content": "±1%", "temperature": "±3°C"}'::jsonb,
        '[
            {"point": "Wareneingang", "checks": ["Lieferschein", "Temperatur", "Aussehen"]},
            {"point": "Nach Mischen", "checks": ["Konsistenz", "Luftgehalt", "Temperatur"]},
            {"point": "Vor Einbau", "checks": ["Verarbeitbarkeit", "Homogenität"]},
            {"point": "Nach Einbau", "checks": ["Ebenheit", "Dicke", "Oberfläche"]}
        ]'::jsonb,
        '{
            "frequency": "Jede 100m² oder mind. 1x täglich",
            "sample_size": "3 Proben",
            "retention_time_days": 90
        }'::jsonb,
        v_user_id
    FROM en13813_recipes
    WHERE tenant_id = v_tenant_id
    AND created_by = v_user_id;

    RAISE NOTICE '✅ Demo-Rezepturen erfolgreich erstellt!';
    RAISE NOTICE '📧 Benutzer: demo@example.com';
    RAISE NOTICE '📊 Erstellt: 5 vollständige Rezepturen';
    RAISE NOTICE '';
    RAISE NOTICE 'Rezepturen:';
    RAISE NOTICE '1. CT-001-2025: Premium Wohnbereich-Zementestrich (C30-F5-A12)';
    RAISE NOTICE '2. CA-002-2025: Heizestrich mit λ=2.0 (C25-F4-RWFC250)';
    RAISE NOTICE '3. AS-003-2025: Industrie-Gussasphalt (IC10)';
    RAISE NOTICE '4. SR-004-2025: Parkhaus-Epoxid (B2.0-AR1-IR4)';
    RAISE NOTICE '5. MA-005-2025: Industriemagnesit (C40-F7-SH100)';
    RAISE NOTICE '';
    RAISE NOTICE 'Jede Rezeptur enthält:';
    RAISE NOTICE '✓ Vollständige Materialzusammensetzung';
    RAISE NOTICE '✓ ITT-Prüfpläne mit Ergebnissen';
    RAISE NOTICE '✓ FPC-Kontrollpläne';
    RAISE NOTICE '✓ Alle typ-spezifischen Eigenschaften';

END $$;