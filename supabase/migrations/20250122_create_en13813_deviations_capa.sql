-- EN 13813:2002 CAPA & Deviation Management System
-- Compliance with § 6.3.2.2 (Corrective Actions), § 6.3.4 (Non-conforming Products), § 6.3.6 (Records)

-- Drop existing tables if needed
DROP TABLE IF EXISTS en13813_effectiveness_checks CASCADE;
DROP TABLE IF EXISTS en13813_preventive_actions CASCADE;
DROP TABLE IF EXISTS en13813_corrective_actions CASCADE;
DROP TABLE IF EXISTS en13813_deviation_attachments CASCADE;
DROP TABLE IF EXISTS en13813_deviations CASCADE;

-- Main Deviations Table (CAPA)
CREATE TABLE en13813_deviations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identification (Pflichtfelder)
    deviation_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    -- EN13813 Specific Fields (NORM-PFLICHT)
    affected_characteristic VARCHAR(50) NOT NULL, -- e.g., 'C25', 'F4', 'A22'
    target_class VARCHAR(50) NOT NULL, -- Target class/value
    test_standard VARCHAR(50) NOT NULL, -- e.g., 'EN 13892-2'
    conformity_mode VARCHAR(20) NOT NULL CHECK (conformity_mode IN ('single_value', 'statistics')),

    -- Test Results
    test_results JSONB NOT NULL, -- Array of test values
    mean_value NUMERIC(10,3),
    std_deviation NUMERIC(10,3),
    min_value NUMERIC(10,3),
    max_value NUMERIC(10,3),

    -- Conformity Evaluation (§ 9.2)
    conformity_passed BOOLEAN NOT NULL DEFAULT FALSE,
    conformity_details TEXT, -- Explanation of pass/fail criteria

    -- Type & Severity (erweitert)
    deviation_type VARCHAR(30) NOT NULL CHECK (deviation_type IN ('product', 'process', 'incoming_material', 'device', 'documentation')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'major', 'minor', 'observation')),
    source VARCHAR(30) NOT NULL CHECK (source IN ('internal_audit', 'external_audit', 'customer_complaint', 'quality_control', 'production', 'fpc_test', 'itt_test')),

    -- References (Pflicht für Rückverfolgung)
    recipe_id UUID REFERENCES en13813_recipes(id),
    recipe_version INTEGER,
    batch_id UUID REFERENCES en13813_batches(id),
    test_id UUID REFERENCES en13813_tests(id),
    device_id UUID REFERENCES en13813_devices(id),
    raw_material_batch VARCHAR(255),
    affected_process_step VARCHAR(100),

    -- Discovery
    discovered_date DATE NOT NULL,
    discovered_by VARCHAR(255) NOT NULL,
    detection_method VARCHAR(100),
    affected_quantity NUMERIC(10,3),
    affected_unit VARCHAR(20),

    -- Status & Workflow
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigation', 'corrective_action', 'effectiveness_check', 'closed', 'rejected')),

    -- Immediate Actions (Sofortmaßnahmen - PFLICHT)
    immediate_action_required BOOLEAN NOT NULL DEFAULT TRUE,
    immediate_action_description TEXT,
    immediate_action_taken_by VARCHAR(255),
    immediate_action_taken_at TIMESTAMPTZ,
    batch_blocked BOOLEAN DEFAULT FALSE,
    marking_blocked BOOLEAN DEFAULT FALSE, -- Block CE marking/DoP
    customer_informed BOOLEAN DEFAULT FALSE,
    product_recalled BOOLEAN DEFAULT FALSE,

    -- Disposition (PFLICHT nach § 6.3.4)
    disposition VARCHAR(30) CHECK (disposition IN ('quarantine', 'rework', 'downgrade', 'scrap', 'release_with_concession', 'pending')),
    disposition_note TEXT,
    disposition_decided_by VARCHAR(255),
    disposition_decided_at TIMESTAMPTZ,

    -- Root Cause Analysis
    root_cause_method VARCHAR(20) CHECK (root_cause_method IN ('5why', 'fishbone', 'fault_tree', '8d', 'other')),
    root_cause_analysis JSONB,
    root_cause_conclusion TEXT,
    root_cause_performed_by VARCHAR(255),
    root_cause_performed_at TIMESTAMPTZ,

    -- Risk Assessment
    risk_probability VARCHAR(10) CHECK (risk_probability IN ('low', 'medium', 'high')),
    risk_impact VARCHAR(10) CHECK (risk_impact IN ('low', 'medium', 'high')),
    risk_level VARCHAR(20) CHECK (risk_level IN ('acceptable', 'tolerable', 'unacceptable')),

    -- ITT Required Flag (PFLICHT bei Rezeptur-/Prozessänderung)
    itt_required BOOLEAN DEFAULT FALSE,
    itt_task_created BOOLEAN DEFAULT FALSE,

    -- Sampling Plan Adjustment
    sampling_frequency_adjustment VARCHAR(20) CHECK (sampling_frequency_adjustment IN ('increase', 'maintain', 'decrease')),
    new_sampling_frequency VARCHAR(100),

    -- Sign-off Workflow (PFLICHT für Records)
    created_by VARCHAR(255) NOT NULL,
    created_by_role VARCHAR(50),
    reviewed_by VARCHAR(255),
    reviewed_by_role VARCHAR(50),
    reviewed_at TIMESTAMPTZ,
    approved_by VARCHAR(255),
    approved_by_role VARCHAR(50),
    approved_at TIMESTAMPTZ,

    -- Closure
    closed_by VARCHAR(255),
    closed_at TIMESTAMPTZ,
    closure_notes TEXT,
    final_status VARCHAR(30) CHECK (final_status IN ('resolved', 'not_reproducible', 'accepted_risk', 'rejected')),

    -- Timestamps & Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_disposition_required CHECK (
        status != 'closed' OR disposition IS NOT NULL
    ),
    CONSTRAINT chk_sign_off_sequence CHECK (
        (reviewed_at IS NULL OR created_at <= reviewed_at) AND
        (approved_at IS NULL OR reviewed_at IS NULL OR reviewed_at <= approved_at)
    )
);

-- Corrective Actions Table
CREATE TABLE en13813_corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deviation_id UUID NOT NULL REFERENCES en13813_deviations(id) ON DELETE CASCADE,

    action_number VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    action_type VARCHAR(20) NOT NULL DEFAULT 'corrective' CHECK (action_type IN ('corrective', 'preventive')),

    -- Responsibility
    responsible_person VARCHAR(255) NOT NULL,
    department VARCHAR(100),

    -- Planning
    planned_start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'verified', 'cancelled')),

    -- Resources
    estimated_cost NUMERIC(10,2),
    actual_cost NUMERIC(10,2),
    resources_required TEXT[],

    -- Documentation
    implementation_notes TEXT,

    -- Verification
    verification_required BOOLEAN DEFAULT TRUE,
    verified_by VARCHAR(255),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    verification_result VARCHAR(20) CHECK (verification_result IN ('effective', 'partially_effective', 'not_effective')),

    -- Links
    related_documents TEXT[],
    training_required BOOLEAN DEFAULT FALSE,
    procedure_update_required BOOLEAN DEFAULT FALSE,

    -- For Preventive Actions
    affects_other_products BOOLEAN DEFAULT FALSE,
    affects_other_processes BOOLEAN DEFAULT FALSE,
    system_wide_change BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(deviation_id, action_number)
);

-- Effectiveness Checks Table (KRITISCH für EN13813)
CREATE TABLE en13813_effectiveness_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deviation_id UUID NOT NULL REFERENCES en13813_deviations(id) ON DELETE CASCADE,

    check_number VARCHAR(50) NOT NULL,
    check_type VARCHAR(20) NOT NULL CHECK (check_type IN ('immediate', 'short_term', 'long_term')),
    check_method VARCHAR(30) NOT NULL CHECK (check_method IN ('audit', 'test', 'measurement', 'observation', 'document_review', 'customer_feedback', 'trend_analysis')),

    -- Planning
    planned_date DATE NOT NULL,
    performed_date DATE,
    performed_by VARCHAR(255),

    -- Success Criteria (PFLICHT)
    success_criteria JSONB NOT NULL, -- Array of {description, target, tolerance}

    -- For Conformity Checks (EN13813 specific)
    conformity_check_samples INTEGER,
    conformity_check_mode VARCHAR(20) CHECK (conformity_check_mode IN ('single_value', 'statistics')),

    -- Results
    results JSONB, -- {criteria_met, actual_values, evidence, observations}
    test_values NUMERIC(10,3)[],
    mean_result NUMERIC(10,3),
    std_result NUMERIC(10,3),
    conformity_evaluation TEXT,

    -- Rating
    effectiveness_rating VARCHAR(20) CHECK (effectiveness_rating IN ('effective', 'partially_effective', 'not_effective')),

    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_actions JSONB, -- Array of {description, responsible, due_date}

    -- Documentation
    test_reports TEXT[],
    measurements JSONB, -- Array of {parameter, value, unit, specification, pass}
    attachments TEXT[],
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(deviation_id, check_number)
);

-- Attachments Table
CREATE TABLE en13813_deviation_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deviation_id UUID NOT NULL REFERENCES en13813_deviations(id) ON DELETE CASCADE,

    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_url TEXT NOT NULL,

    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    description TEXT,
    category VARCHAR(20) CHECK (category IN ('evidence', 'report', 'photo', 'document', 'test_result', 'certificate', 'other'))
);

-- Indexes for Performance
CREATE INDEX idx_deviations_tenant ON en13813_deviations(tenant_id);
CREATE INDEX idx_deviations_status ON en13813_deviations(status);
CREATE INDEX idx_deviations_recipe ON en13813_deviations(recipe_id);
CREATE INDEX idx_deviations_batch ON en13813_deviations(batch_id);
CREATE INDEX idx_deviations_test ON en13813_deviations(test_id);
CREATE INDEX idx_deviations_device ON en13813_deviations(device_id);
CREATE INDEX idx_deviations_discovered_date ON en13813_deviations(discovered_date);
CREATE INDEX idx_deviations_severity ON en13813_deviations(severity);

CREATE INDEX idx_corrective_actions_deviation ON en13813_corrective_actions(deviation_id);
CREATE INDEX idx_corrective_actions_status ON en13813_corrective_actions(status);
CREATE INDEX idx_corrective_actions_responsible ON en13813_corrective_actions(responsible_person);

CREATE INDEX idx_effectiveness_checks_deviation ON en13813_effectiveness_checks(deviation_id);
CREATE INDEX idx_effectiveness_checks_planned_date ON en13813_effectiveness_checks(planned_date);
CREATE INDEX idx_effectiveness_checks_rating ON en13813_effectiveness_checks(effectiveness_rating);

-- Row-Level Security
ALTER TABLE en13813_deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_effectiveness_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_deviation_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view deviations in their tenant"
    ON en13813_deviations FOR SELECT
    USING (tenant_id = auth.jwt()->>'tenant_id'::uuid);

CREATE POLICY "Users can create deviations in their tenant"
    ON en13813_deviations FOR INSERT
    WITH CHECK (tenant_id = auth.jwt()->>'tenant_id'::uuid);

CREATE POLICY "Users can update deviations in their tenant"
    ON en13813_deviations FOR UPDATE
    USING (tenant_id = auth.jwt()->>'tenant_id'::uuid);

CREATE POLICY "Users can delete deviations in their tenant"
    ON en13813_deviations FOR DELETE
    USING (tenant_id = auth.jwt()->>'tenant_id'::uuid);

-- Same for corrective actions
CREATE POLICY "Users can view corrective actions"
    ON en13813_corrective_actions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM en13813_deviations d
        WHERE d.id = deviation_id
        AND d.tenant_id = auth.jwt()->>'tenant_id'::uuid
    ));

CREATE POLICY "Users can manage corrective actions"
    ON en13813_corrective_actions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM en13813_deviations d
        WHERE d.id = deviation_id
        AND d.tenant_id = auth.jwt()->>'tenant_id'::uuid
    ));

-- Same for effectiveness checks
CREATE POLICY "Users can view effectiveness checks"
    ON en13813_effectiveness_checks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM en13813_deviations d
        WHERE d.id = deviation_id
        AND d.tenant_id = auth.jwt()->>'tenant_id'::uuid
    ));

CREATE POLICY "Users can manage effectiveness checks"
    ON en13813_effectiveness_checks FOR ALL
    USING (EXISTS (
        SELECT 1 FROM en13813_deviations d
        WHERE d.id = deviation_id
        AND d.tenant_id = auth.jwt()->>'tenant_id'::uuid
    ));

-- Same for attachments
CREATE POLICY "Users can view attachments"
    ON en13813_deviation_attachments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM en13813_deviations d
        WHERE d.id = deviation_id
        AND d.tenant_id = auth.jwt()->>'tenant_id'::uuid
    ));

CREATE POLICY "Users can manage attachments"
    ON en13813_deviation_attachments FOR ALL
    USING (EXISTS (
        SELECT 1 FROM en13813_deviations d
        WHERE d.id = deviation_id
        AND d.tenant_id = auth.jwt()->>'tenant_id'::uuid
    ));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deviations_updated_at
    BEFORE UPDATE ON en13813_deviations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corrective_actions_updated_at
    BEFORE UPDATE ON en13813_corrective_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_effectiveness_checks_updated_at
    BEFORE UPDATE ON en13813_effectiveness_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for automatic deviation number generation
CREATE OR REPLACE FUNCTION generate_deviation_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year TEXT;
    v_count INTEGER;
    v_number TEXT;
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');

    SELECT COUNT(*) + 1 INTO v_count
    FROM en13813_deviations
    WHERE tenant_id = NEW.tenant_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

    v_number := 'DEV-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
    NEW.deviation_number := v_number;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_deviation_number
    BEFORE INSERT ON en13813_deviations
    FOR EACH ROW
    WHEN (NEW.deviation_number IS NULL OR NEW.deviation_number = '')
    EXECUTE FUNCTION generate_deviation_number();

-- Trigger for batch quarantine on test failure
CREATE OR REPLACE FUNCTION quarantine_batch_on_failure()
RETURNS TRIGGER AS $$
BEGIN
    -- If conformity failed and batch is linked, quarantine it
    IF NEW.conformity_passed = FALSE AND NEW.batch_id IS NOT NULL THEN
        UPDATE en13813_batches
        SET status = 'quarantined',
            notes = COALESCE(notes, '') || E'\n[AUTO] Quarantined due to deviation ' || NEW.deviation_number
        WHERE id = NEW.batch_id;

        -- Also set immediate action flags
        NEW.immediate_action_required := TRUE;
        NEW.batch_blocked := TRUE;
        NEW.marking_blocked := TRUE;
        NEW.disposition := 'quarantine';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_quarantine_on_deviation
    BEFORE INSERT OR UPDATE ON en13813_deviations
    FOR EACH ROW
    WHEN (NEW.conformity_passed = FALSE)
    EXECUTE FUNCTION quarantine_batch_on_failure();

-- Trigger to check if ITT is required on recipe/process changes
CREATE OR REPLACE FUNCTION check_itt_requirement()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if corrective actions affect recipe or process
    IF EXISTS (
        SELECT 1 FROM en13813_corrective_actions
        WHERE deviation_id = NEW.id
        AND (procedure_update_required = TRUE OR system_wide_change = TRUE)
        AND status = 'completed'
    ) THEN
        NEW.itt_required := TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_itt_on_action_complete
    BEFORE UPDATE ON en13813_deviations
    FOR EACH ROW
    EXECUTE FUNCTION check_itt_requirement();

-- Function to evaluate conformity (§ 9.2)
CREATE OR REPLACE FUNCTION evaluate_conformity(
    p_mode VARCHAR(20),
    p_values NUMERIC[],
    p_target_value NUMERIC,
    p_sample_size INTEGER DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_mean NUMERIC;
    v_std NUMERIC;
    v_min NUMERIC;
    v_max NUMERIC;
    v_k_factor NUMERIC;
    v_lower_limit NUMERIC;
    v_passed BOOLEAN;
    v_details TEXT;
BEGIN
    -- Calculate statistics
    SELECT
        AVG(val),
        STDDEV(val),
        MIN(val),
        MAX(val)
    INTO v_mean, v_std, v_min, v_max
    FROM UNNEST(p_values) AS val;

    IF p_mode = 'single_value' THEN
        -- § 9.2.3: Every single value must be ≥ target
        v_passed := v_min >= p_target_value;
        v_details := FORMAT('Single value mode: Min=%s, Target=%s, Pass=%s',
                           v_min, p_target_value, v_passed);

    ELSIF p_mode = 'statistics' THEN
        -- § 9.2.2: Statistical evaluation
        -- Get k-factor based on sample size (Table 12)
        v_k_factor := CASE
            WHEN p_sample_size >= 3 AND p_sample_size <= 4 THEN 2.63
            WHEN p_sample_size = 5 THEN 2.33
            WHEN p_sample_size = 6 THEN 2.18
            WHEN p_sample_size >= 7 AND p_sample_size <= 9 THEN 2.00
            WHEN p_sample_size >= 10 AND p_sample_size <= 14 THEN 1.93
            WHEN p_sample_size >= 15 AND p_sample_size <= 19 THEN 1.87
            WHEN p_sample_size >= 20 AND p_sample_size <= 29 THEN 1.83
            WHEN p_sample_size >= 30 AND p_sample_size <= 39 THEN 1.80
            WHEN p_sample_size >= 40 AND p_sample_size <= 59 THEN 1.77
            WHEN p_sample_size >= 60 AND p_sample_size <= 99 THEN 1.75
            WHEN p_sample_size >= 100 THEN 1.72
            ELSE 2.63 -- Default for small samples
        END;

        v_lower_limit := v_mean - (v_k_factor * v_std);

        -- Check both conditions:
        -- 1. x - k*s ≥ target
        -- 2. No value < target - 10%
        v_passed := v_lower_limit >= p_target_value AND v_min >= (p_target_value * 0.9);

        v_details := FORMAT('Statistical mode: Mean=%s, StdDev=%s, k=%s, Lower limit=%s, Target=%s, Min=%s (90%% of target=%s), Pass=%s',
                           ROUND(v_mean, 2), ROUND(v_std, 2), v_k_factor,
                           ROUND(v_lower_limit, 2), p_target_value, v_min,
                           ROUND(p_target_value * 0.9, 2), v_passed);
    END IF;

    RETURN jsonb_build_object(
        'passed', v_passed,
        'mean', v_mean,
        'std_deviation', v_std,
        'min_value', v_min,
        'max_value', v_max,
        'details', v_details,
        'k_factor', v_k_factor,
        'lower_limit', v_lower_limit
    );
END;
$$ LANGUAGE plpgsql;

-- View for CAPA Dashboard Statistics
CREATE OR REPLACE VIEW en13813_capa_statistics AS
WITH deviation_stats AS (
    SELECT
        tenant_id,
        COUNT(*) AS total_deviations,
        COUNT(*) FILTER (WHERE status != 'closed') AS open_deviations,
        COUNT(*) FILTER (WHERE severity = 'critical') AS critical_count,
        COUNT(*) FILTER (WHERE severity = 'major') AS major_count,
        COUNT(*) FILTER (WHERE severity = 'minor') AS minor_count,
        COUNT(*) FILTER (WHERE severity = 'observation') AS observation_count,
        AVG(CASE
            WHEN status = 'closed' THEN
                EXTRACT(EPOCH FROM (closed_at - created_at))/86400
            ELSE NULL
        END) AS avg_closure_days
    FROM en13813_deviations
    GROUP BY tenant_id
),
action_stats AS (
    SELECT
        d.tenant_id,
        COUNT(*) FILTER (WHERE ca.status IN ('planned', 'in_progress')
                        AND ca.planned_end_date < CURRENT_DATE) AS overdue_actions
    FROM en13813_deviations d
    LEFT JOIN en13813_corrective_actions ca ON ca.deviation_id = d.id
    GROUP BY d.tenant_id
),
effectiveness_stats AS (
    SELECT
        d.tenant_id,
        COUNT(*) FILTER (WHERE ec.performed_date IS NULL
                        AND ec.planned_date < CURRENT_DATE) AS pending_checks,
        COUNT(*) FILTER (WHERE ec.effectiveness_rating = 'effective') AS effective_count,
        COUNT(*) FILTER (WHERE ec.effectiveness_rating = 'partially_effective') AS partially_effective_count,
        COUNT(*) FILTER (WHERE ec.effectiveness_rating = 'not_effective') AS not_effective_count
    FROM en13813_deviations d
    LEFT JOIN en13813_effectiveness_checks ec ON ec.deviation_id = d.id
    GROUP BY d.tenant_id
)
SELECT
    ds.tenant_id,
    ds.total_deviations,
    ds.open_deviations,
    COALESCE(acts.overdue_actions, 0) AS overdue_actions,
    COALESCE(es.pending_checks, 0) AS pending_effectiveness_checks,
    jsonb_build_object(
        'critical', ds.critical_count,
        'major', ds.major_count,
        'minor', ds.minor_count,
        'observation', ds.observation_count
    ) AS by_severity,
    jsonb_build_object(
        'effective', COALESCE(es.effective_count, 0),
        'partially_effective', COALESCE(es.partially_effective_count, 0),
        'not_effective', COALESCE(es.not_effective_count, 0),
        'pending', COALESCE(es.pending_checks, 0)
    ) AS effectiveness_rate,
    ROUND(ds.avg_closure_days, 1) AS avg_closure_time_days
FROM deviation_stats ds
LEFT JOIN action_stats acts ON acts.tenant_id = ds.tenant_id
LEFT JOIN effectiveness_stats es ON es.tenant_id = ds.tenant_id;