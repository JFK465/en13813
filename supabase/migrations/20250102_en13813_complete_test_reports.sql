-- =====================================================
-- EN 13813-2002 Vollständige Prüfbericht-Implementierung
-- =====================================================

-- Drop existing tables if needed
DROP TABLE IF EXISTS en13813_test_reports CASCADE;
DROP TABLE IF EXISTS en13813_sampling_details CASCADE;
DROP TABLE IF EXISTS en13813_test_results CASCADE;
DROP TABLE IF EXISTS en13813_special_characteristics CASCADE;
DROP TABLE IF EXISTS en13813_statistical_evaluations CASCADE;
DROP TABLE IF EXISTS en13813_fpc_data CASCADE;
DROP TABLE IF EXISTS en13813_conformity_assessments CASCADE;
DROP TABLE IF EXISTS en13813_test_validation_rules CASCADE;

-- =====================================================
-- HAUPTTABELLE: Prüfberichte
-- =====================================================
CREATE TABLE en13813_test_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
    
    -- Prüfberichtstypen nach EN 13813
    report_type TEXT NOT NULL CHECK (report_type IN ('ITT', 'FPC', 'External', 'Audit')),
    
    -- AVCP System nach CPR
    avcp_system TEXT CHECK (avcp_system IN ('1', '1+', '3', '4')),
    
    -- Labor Information (Abschnitt 6.2 & ZA.2.1)
    test_lab TEXT NOT NULL,
    test_lab_address TEXT NOT NULL,
    test_lab_accreditation TEXT,
    notified_body_number TEXT,
    notified_body_name TEXT,
    
    -- Identifikation
    report_number TEXT NOT NULL UNIQUE,
    report_date DATE NOT NULL,
    test_date DATE NOT NULL,
    sampling_date DATE NOT NULL,
    
    -- Gültigkeit
    valid_from DATE NOT NULL,
    valid_until DATE,
    invalidation_reason TEXT,
    invalidated_at TIMESTAMPTZ,
    
    -- Dokumente
    pdf_url TEXT,
    
    -- Validierung
    validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'superseded')),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    CONSTRAINT valid_dates CHECK (test_date >= sampling_date),
    CONSTRAINT valid_period CHECK (valid_until IS NULL OR valid_until > valid_from)
);

-- =====================================================
-- PROBENAHME DETAILS
-- =====================================================
CREATE TABLE en13813_sampling_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_report_id UUID REFERENCES en13813_test_reports(id) ON DELETE CASCADE,
    
    -- Nach EN 13892-1
    sampling_method TEXT NOT NULL CHECK (sampling_method IN ('random', 'representative', 'targeted')),
    sampling_location TEXT NOT NULL,
    sampler_name TEXT NOT NULL,
    sampler_qualification TEXT,
    number_of_samples INTEGER NOT NULL CHECK (number_of_samples > 0),
    sample_size_kg DECIMAL(10,2) NOT NULL CHECK (sample_size_kg > 0),
    sample_preparation TEXT NOT NULL,
    storage_conditions TEXT NOT NULL,
    transport_conditions TEXT,
    chain_of_custody JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HAUPTEIGENSCHAFTEN TESTERGEBNISSE
-- =====================================================
CREATE TABLE en13813_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_report_id UUID REFERENCES en13813_test_reports(id) ON DELETE CASCADE,
    property_name TEXT NOT NULL,
    
    -- Allgemeine Testergebnisse
    test_method TEXT NOT NULL,
    norm TEXT NOT NULL,
    individual_values DECIMAL[] NOT NULL,
    mean_value DECIMAL NOT NULL,
    std_dev DECIMAL,
    characteristic_value DECIMAL,
    unit TEXT NOT NULL,
    
    -- Klassen
    declared_class TEXT,
    actual_class TEXT,
    
    -- Spezifische Parameter
    age_days INTEGER,
    temperature_celsius DECIMAL,
    humidity_percent DECIMAL,
    curing_conditions TEXT,
    specimen_dimensions TEXT,
    
    -- Bewertung
    passed BOOLEAN NOT NULL DEFAULT false,
    
    -- Spezielle Felder für verschiedene Tests
    test_specific_data JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_property_per_report UNIQUE(test_report_id, property_name)
);

-- =====================================================
-- SPEZIALEIGENSCHAFTEN (Abschnitt 5.3)
-- =====================================================
CREATE TABLE en13813_special_characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_report_id UUID REFERENCES en13813_test_reports(id) ON DELETE CASCADE,
    
    -- Elektrischer Widerstand (EN 1081)
    electrical_resistance_ohm DECIMAL,
    electrical_test_voltage_v DECIMAL,
    electrical_designation TEXT,
    
    -- Chemische Beständigkeit (EN 13529)
    chemical_resistance JSONB,
    chemical_designation TEXT,
    
    -- Brandverhalten (EN 13501-1)
    fire_euroclassification TEXT,
    fire_smoke_class TEXT CHECK (fire_smoke_class IN ('s1', 's2')),
    fire_droplets_class TEXT CHECK (fire_droplets_class IN ('d0', 'd1', 'd2')),
    fire_test_report_number TEXT,
    fire_notified_body TEXT,
    
    -- Wasserdampfdurchlässigkeit (EN 12086)
    water_vapour_sd_value_m DECIMAL,
    water_vapour_mu_value DECIMAL,
    
    -- Wärmeleitfähigkeit (EN 12664 oder EN 12524)
    thermal_conductivity_lambda DECIMAL,
    thermal_test_method TEXT CHECK (thermal_test_method IN ('EN 12664', 'EN 12524')),
    thermal_moisture_percent DECIMAL,
    
    -- Wasserdurchlässigkeit (EN 1062-3)
    water_permeability_kg_m2_h DECIMAL,
    water_test_pressure_bar DECIMAL,
    
    -- Trittschalldämmung (EN ISO 140-6)
    impact_sound_delta_lw_db DECIMAL,
    impact_sound_frequency_data JSONB,
    
    -- Schallabsorption (EN ISO 354)
    sound_absorption_data JSONB,
    sound_nrc_value DECIMAL,
    
    -- Gefährliche Substanzen
    dangerous_substances JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STATISTISCHE AUSWERTUNG (Abschnitt 9.2.2)
-- =====================================================
CREATE TABLE en13813_statistical_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
    property_name TEXT NOT NULL,
    
    -- Kontrollzeitraum
    control_period_start DATE NOT NULL,
    control_period_end DATE NOT NULL,
    evaluation_method TEXT NOT NULL CHECK (evaluation_method IN ('variables', 'attributes')),
    number_of_samples INTEGER NOT NULL CHECK (number_of_samples > 0),
    
    -- Variables-Methode
    individual_results DECIMAL[],
    mean_value DECIMAL,
    standard_deviation DECIMAL,
    characteristic_value DECIMAL,
    acceptability_constant_ka DECIMAL,
    lower_limit DECIMAL,
    upper_limit DECIMAL,
    
    -- Attributes-Methode
    number_of_tests INTEGER,
    number_outside_limits INTEGER,
    acceptable_number_ca INTEGER,
    
    -- Gemeinsame Felder
    pk_percentile DECIMAL DEFAULT 10,
    cr_probability DECIMAL DEFAULT 5,
    conformity BOOLEAN NOT NULL,
    calculation_formula TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_by UUID REFERENCES users(id),
    
    CONSTRAINT valid_control_period CHECK (control_period_end > control_period_start)
);

-- =====================================================
-- FACTORY PRODUCTION CONTROL (Abschnitt 6.3)
-- =====================================================
CREATE TABLE en13813_fpc_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_report_id UUID REFERENCES en13813_test_reports(id) ON DELETE CASCADE,
    
    -- Qualitätsmanagement
    quality_manual_reference TEXT NOT NULL,
    iso_9001_certified BOOLEAN DEFAULT false,
    certification_number TEXT,
    last_audit_date DATE,
    
    -- Produktionskontrolle
    production_control_procedures JSONB NOT NULL,
    responsible_person TEXT NOT NULL,
    
    -- Prozesskontrolle
    mixing_control JSONB,
    production_parameters JSONB,
    in_process_testing JSONB,
    
    -- Eingangsmaterialien
    incoming_materials_control JSONB,
    
    -- Prüffrequenzen
    testing_frequency JSONB NOT NULL,
    
    -- Kalibrierung
    equipment_calibration JSONB,
    
    -- Rückverfolgbarkeit
    traceability_data JSONB,
    
    -- Fehlerhafte Produkte
    non_conforming_products JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- KONFORMITÄTSBEWERTUNG (Abschnitt 9)
-- =====================================================
CREATE TABLE en13813_conformity_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_report_id UUID REFERENCES en13813_test_reports(id) ON DELETE CASCADE,
    
    assessment_type TEXT NOT NULL CHECK (assessment_type IN (
        'initial_type_testing', 
        'factory_production_control', 
        'continuous_surveillance'
    )),
    
    -- Konformitätskriterien
    conformity_criteria JSONB NOT NULL,
    
    -- Gesamtbewertung
    overall_conformity BOOLEAN NOT NULL,
    ce_marking_authorized BOOLEAN NOT NULL,
    declaration_of_performance_valid BOOLEAN NOT NULL,
    
    -- Validierungsfehler
    validation_errors JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    assessed_by UUID REFERENCES users(id)
);

-- =====================================================
-- PRÜFVALIDIERUNGSREGELN (Tabelle 1)
-- =====================================================
CREATE TABLE en13813_test_validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estrich_type TEXT NOT NULL,
    property TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL,
    conditions JSONB,
    test_norm TEXT NOT NULL,
    test_age_days INTEGER,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_rule UNIQUE(estrich_type, property)
);

-- Füge Standardregeln nach Tabelle 1 ein
INSERT INTO en13813_test_validation_rules (estrich_type, property, is_mandatory, test_norm, test_age_days, notes) VALUES
-- CT (Zement)
('CT', 'compressive_strength', true, 'EN 13892-2', 28, 'Normativ für alle CT'),
('CT', 'flexural_strength', true, 'EN 13892-2', 28, 'Normativ für alle CT'),
('CT', 'wear_resistance', false, 'EN 13892-3/4/5', 28, 'Nur für Nutzschicht ohne Belag'),
('CT', 'rwfc', false, 'EN 13892-7', 28, 'Optional für Estriche mit Belag'),
('CT', 'shrinkage', false, 'EN 13454-2', 28, 'Optional'),
('CT', 'consistency', false, 'EN 13454-2', NULL, 'Optional'),
('CT', 'ph_value', false, 'EN 13454-2', NULL, 'Optional'),

-- CA (Calciumsulfat)
('CA', 'compressive_strength', true, 'EN 13892-2', 28, 'Normativ für alle CA'),
('CA', 'flexural_strength', true, 'EN 13892-2', 28, 'Normativ für alle CA'),
('CA', 'ph_value', true, 'EN 13454-2', NULL, 'Muss ≥ 7 sein'),
('CA', 'setting_time', false, 'EN 13454-2', NULL, 'Optional'),
('CA', 'shrinkage', false, 'EN 13454-2', 28, 'Optional'),

-- MA (Magnesia)
('MA', 'compressive_strength', true, 'EN 13892-2', 28, 'Normativ für alle MA'),
('MA', 'flexural_strength', true, 'EN 13892-2', 28, 'Normativ für alle MA'),
('MA', 'surface_hardness', false, 'EN 13892-6', 28, 'Für Nutzschicht'),
('MA', 'ph_value', false, 'EN 13454-2', NULL, 'Optional'),

-- AS (Gussasphalt)
('AS', 'resistance_to_indentation', true, 'EN 12697-20/21', NULL, 'Normativ für alle AS'),

-- SR (Kunstharz)
('SR', 'flexural_strength', false, 'EN ISO 178 oder EN 13892-2', 7, 'Optional'),
('SR', 'wear_resistance', false, 'EN 13892-4/5', 7, 'Für Nutzschicht'),
('SR', 'bond_strength', true, 'EN 13892-8', 7, 'Normativ für alle SR'),
('SR', 'impact_resistance', false, 'EN ISO 6272', 7, 'Für Nutzschicht');

-- =====================================================
-- INDIZES FÜR PERFORMANCE
-- =====================================================
CREATE INDEX idx_test_reports_recipe ON en13813_test_reports(recipe_id);
CREATE INDEX idx_test_reports_type ON en13813_test_reports(report_type);
CREATE INDEX idx_test_reports_status ON en13813_test_reports(validation_status);
CREATE INDEX idx_test_reports_dates ON en13813_test_reports(test_date, report_date);
CREATE INDEX idx_test_results_report ON en13813_test_results(test_report_id);
CREATE INDEX idx_statistical_eval_recipe ON en13813_statistical_evaluations(recipe_id);
CREATE INDEX idx_statistical_eval_period ON en13813_statistical_evaluations(control_period_start, control_period_end);

-- =====================================================
-- TRIGGER FÜR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_reports_updated_at 
    BEFORE UPDATE ON en13813_test_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNKTIONEN FÜR STATISTISCHE AUSWERTUNG
-- =====================================================

-- Funktion zur Berechnung des charakteristischen Wertes (5% Fraktil)
CREATE OR REPLACE FUNCTION calculate_characteristic_value(
    values DECIMAL[],
    k_factor DECIMAL DEFAULT 1.64  -- Standard für 5% Fraktil
) RETURNS DECIMAL AS $$
DECLARE
    n INTEGER;
    mean_val DECIMAL;
    std_dev DECIMAL;
BEGIN
    n := array_length(values, 1);
    IF n < 3 THEN
        RETURN (SELECT MIN(v) FROM unnest(values) v);
    END IF;
    
    -- Berechne Mittelwert
    mean_val := (SELECT AVG(v) FROM unnest(values) v);
    
    -- Berechne Standardabweichung
    std_dev := (SELECT STDDEV_SAMP(v) FROM unnest(values) v);
    
    -- Charakteristischer Wert = Mittelwert - k * Standardabweichung
    RETURN mean_val - (k_factor * std_dev);
END;
$$ LANGUAGE plpgsql;

-- Funktion zur Überprüfung der ITT-Vollständigkeit
CREATE OR REPLACE FUNCTION check_itt_completeness(
    recipe_uuid UUID
) RETURNS TABLE(
    complete BOOLEAN,
    missing_tests TEXT[],
    can_generate_dop BOOLEAN
) AS $$
DECLARE
    estrich_type TEXT;
    intended_use JSONB;
    required_tests TEXT[];
    existing_tests TEXT[];
    missing TEXT[];
BEGIN
    -- Hole Rezepturdaten
    SELECT r.estrich_type, r.intended_use 
    INTO estrich_type, intended_use
    FROM en13813_recipes r
    WHERE r.id = recipe_uuid;
    
    -- Bestimme erforderliche Tests
    SELECT array_agg(property) 
    INTO required_tests
    FROM en13813_test_validation_rules
    WHERE estrich_type = estrich_type
    AND is_mandatory = true;
    
    -- Hole vorhandene Tests
    SELECT array_agg(DISTINCT tr.property_name)
    INTO existing_tests
    FROM en13813_test_reports rep
    JOIN en13813_test_results tr ON tr.test_report_id = rep.id
    WHERE rep.recipe_id = recipe_uuid
    AND rep.report_type = 'ITT'
    AND rep.validation_status = 'valid'
    AND tr.passed = true;
    
    -- Bestimme fehlende Tests
    missing := ARRAY(
        SELECT unnest(required_tests)
        EXCEPT
        SELECT unnest(existing_tests)
    );
    
    RETURN QUERY
    SELECT 
        (array_length(missing, 1) IS NULL OR array_length(missing, 1) = 0),
        missing,
        (array_length(missing, 1) IS NULL OR array_length(missing, 1) = 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE en13813_test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_sampling_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_special_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_statistical_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_conformity_assessments ENABLE ROW LEVEL SECURITY;

-- Policies für Tenant-Isolation
CREATE POLICY tenant_isolation_test_reports ON en13813_test_reports
    FOR ALL USING (tenant_id = current_setting('app.tenant_id')::UUID);

CREATE POLICY tenant_isolation_sampling ON en13813_sampling_details
    FOR ALL USING (
        test_report_id IN (
            SELECT id FROM en13813_test_reports 
            WHERE tenant_id = current_setting('app.tenant_id')::UUID
        )
    );

-- Weitere Policies analog...

-- =====================================================
-- GRANTS
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;