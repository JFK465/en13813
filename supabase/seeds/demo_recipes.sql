-- ================================================
-- DEMO REZEPTUREN FÜR EN 13813
-- Für Benutzer: demo@example.com
-- ================================================

-- Erst den Tenant und User finden/erstellen
DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_recipe_id UUID;
BEGIN
    -- Tenant für Demo-User finden oder erstellen
    SELECT id INTO v_tenant_id FROM tenants WHERE name = 'Demo Company' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        INSERT INTO tenants (name, slug, settings) 
        VALUES ('Demo Company', 'demo-company', '{"industry": "construction"}')
        RETURNING id INTO v_tenant_id;
    END IF;

    -- User-Profile finden oder erstellen
    SELECT id INTO v_user_id FROM profiles WHERE email = 'demo@example.com' LIMIT 1;
    IF v_user_id IS NULL THEN
        -- Hinweis: In echten Umgebungen wird der User über Supabase Auth erstellt
        INSERT INTO profiles (id, email, full_name, tenant_id)
        VALUES (gen_random_uuid(), 'demo@example.com', 'Demo User', v_tenant_id)
        RETURNING id INTO v_user_id;
    END IF;

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
        created_by
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
        v_user_id
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
        wear_resistance_class,
        fire_class,
        rwfc_class,
        thermal_conductivity_w_mk,
        intended_use,
        extended_properties,
        status,
        created_by
    ) VALUES (
        v_tenant_id,
        'CA-002-2025',
        'Fließestrich CAF für Fußbodenheizung',
        'CA',
        'C25',
        'F4',
        'none',
        NULL,
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
        v_user_id
    ) RETURNING id INTO v_recipe_id;

    -- Materialzusammensetzung für CA-002
    INSERT INTO en13813_recipe_materials (
        tenant_id,
        recipe_id,
        binder_type,
        binder_name,
        binder_amount_kg_m3,
        water_content,
        water_binder_ratio,
        aggregates,
        fresh_mortar_properties,
        created_by
    ) VALUES (
        v_tenant_id,
        v_recipe_id,
        'CAB 30',
        'Calciumsulfat-Fließestrichbinder',
        300,
        180,
        0.60,
        '[
            {"name": "Quarzsand 0-4mm", "amount_kg_m3": 1520, "percentage": 100}
        ]'::jsonb,
        '{
            "consistency_class": "F5",
            "flow_diameter_mm": 520,
            "air_content_percent": 1.5,
            "density_fresh_kg_m3": 2000,
            "temperature_c": 18,
            "ph_value": 7.0,
            "processing_time_min": 30
        }'::jsonb,
        v_user_id
    );

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
        status,
        created_by
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
        'active',
        v_user_id
    ) RETURNING id INTO v_recipe_id;

    -- Notified Body für Brandklasse
    UPDATE en13813_recipes 
    SET notified_body = '{
        "number": "1234",
        "name": "MPA Stuttgart",
        "test_report": "PB-2025-AS-001",
        "test_date": "2025-01-15"
    }'::jsonb
    WHERE id = v_recipe_id;

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
        status,
        created_by
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
        'active',
        v_user_id
    ) RETURNING id INTO v_recipe_id;

    -- Materialzusammensetzung für SR-004
    INSERT INTO en13813_recipe_materials (
        tenant_id,
        recipe_id,
        binder_type,
        binder_name,
        binder_amount_kg_m3,
        water_content,
        water_binder_ratio,
        aggregates,
        mixing_instructions,
        created_by
    ) VALUES (
        v_tenant_id,
        v_recipe_id,
        'EP',
        'Epoxidharz 2K System',
        400,
        0,
        0,
        '[
            {"name": "Quarzsand 0.1-0.3mm", "amount_kg_m3": 800, "percentage": 40},
            {"name": "Quarzsand 0.3-0.8mm", "amount_kg_m3": 600, "percentage": 30},
            {"name": "Farbchips", "amount_kg_m3": 20, "percentage": 1}
        ]'::jsonb,
        '{
            "mixing_ratio_a_b": "100:25",
            "mixing_time_seconds": 120,
            "mixer_type": "Langsam laufender Rührer",
            "pot_life_at_20c_min": 20,
            "application_method": "Rakel und Rolle"
        }'::jsonb,
        v_user_id
    );

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
        created_by
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
        v_user_id
    ) RETURNING id INTO v_recipe_id;

    -- Materialzusammensetzung für MA-005
    INSERT INTO en13813_recipe_materials (
        tenant_id,
        recipe_id,
        binder_type,
        binder_name,
        binder_amount_kg_m3,
        water_content,
        water_binder_ratio,
        aggregates,
        fresh_mortar_properties,
        created_by
    ) VALUES (
        v_tenant_id,
        v_recipe_id,
        'Magnesit',
        'Kaustisch gebrannter Magnesit',
        450,
        250,
        0.56,
        '[
            {"name": "Dolomitsplitt 0-1mm", "amount_kg_m3": 400, "percentage": 20},
            {"name": "Dolomitsplitt 1-3mm", "amount_kg_m3": 600, "percentage": 30},
            {"name": "Dolomitsplitt 3-5mm", "amount_kg_m3": 500, "percentage": 25},
            {"name": "Holzmehl", "amount_kg_m3": 100, "percentage": 5}
        ]'::jsonb,
        '{
            "mixing_solution": "MgCl2-Lösung 20°Bé",
            "consistency": "erdfeucht",
            "processing_time_min": 60,
            "temperature_c": 18,
            "initial_setting_hours": 4,
            "final_setting_hours": 8
        }'::jsonb,
        v_user_id
    );

    -- ================================================
    -- 6. CT-C20-F3 - Verbundestrich (Außenbereich)
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
        intended_use,
        extended_properties,
        special_properties,
        status,
        created_by
    ) VALUES (
        v_tenant_id,
        'CT-006-2025',
        'Verbundestrich für Balkon/Terrasse',
        'CT',
        'C20',
        'F3',
        'bohme',
        'A22',
        'A1fl',
        '{
            "wearing_surface": true,
            "with_flooring": true,
            "outdoor_use": true,
            "indoor_only": false,
            "wet_areas": true
        }'::jsonb,
        '{
            "frost_resistant": true,
            "water_impermeability_class": "W8",
            "bond_strength_n_mm2": 1.5,
            "min_layer_thickness_mm": 25,
            "max_layer_thickness_mm": 50,
            "gradient_percent": 2.0
        }'::jsonb,
        '{
            "surface_treatment": "besenstrich",
            "joint_distance_m": 3.0,
            "reinforcement": "Glasfasern 12mm, 0.9 kg/m³"
        }'::jsonb,
        'active',
        v_user_id
    );

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

    RAISE NOTICE 'Demo-Rezepturen erfolgreich erstellt!';
    RAISE NOTICE 'Benutzer: demo@example.com';
    RAISE NOTICE 'Erstellt: 6 vollständige Rezepturen (CT, CA, AS, SR, MA)';
    RAISE NOTICE 'Jede Rezeptur enthält:';
    RAISE NOTICE '- Vollständige Materialzusammensetzung';
    RAISE NOTICE '- ITT-Prüfpläne mit Ergebnissen';
    RAISE NOTICE '- FPC-Kontrollpläne';
    RAISE NOTICE '- Alle typ-spezifischen Eigenschaften';

END $$;