-- EN13813 Complete Schema Migration
-- Compliant with EN 13813:2002 Standard
-- Date: 2024-01-21

-- ==================== RECIPE MANAGEMENT ====================

-- Drop existing table if exists and recreate with complete schema
DROP TABLE IF EXISTS en13813_recipes CASCADE;

CREATE TABLE en13813_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Basic Identification
    recipe_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL, -- Missing field identified
    description TEXT,

    -- Manufacturer Information (Required by EN13813)
    manufacturer_name VARCHAR(255) NOT NULL,
    manufacturer_address TEXT NOT NULL,
    manufacturer_contact VARCHAR(255),

    -- Notified Body (Required for System 2+)
    notified_body_name VARCHAR(255),
    notified_body_number VARCHAR(50),
    notified_body_certificate VARCHAR(100),

    -- Binder Type (CT, CA, MA, SR, AS)
    binder_type VARCHAR(10) NOT NULL CHECK (binder_type IN ('CT', 'CA', 'MA', 'SR', 'AS')),

    -- Version Control
    version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'active', 'locked', 'archived')),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP,

    -- Strength Classes (Required)
    compressive_strength_class VARCHAR(10) NOT NULL, -- C5-C80
    flexural_strength_class VARCHAR(10) NOT NULL, -- F1-F50

    -- Wear Resistance (one method required for wearing surfaces)
    wear_resistance_bohme_class VARCHAR(10), -- A22-A1.5
    wear_resistance_bca_class VARCHAR(10), -- AR6-AR0.5
    wear_resistance_rollrad_class VARCHAR(10), -- RWA300-RWA1

    -- Surface Properties
    surface_hardness_class VARCHAR(10), -- SH30-SH200
    rwfc_class VARCHAR(10), -- RWFC150-RWFC550 (Rolling Wheel Floor Covering)

    -- Mastic Asphalt Specific
    indentation_class_cube VARCHAR(10), -- IC10-IC100
    indentation_class_plate VARCHAR(10), -- IP10-IP70

    -- Bond & Impact
    bond_strength_class VARCHAR(10), -- B0.2-B2.0
    impact_resistance_class VARCHAR(10), -- IR values

    -- Reaction to Fire (Required)
    fire_class VARCHAR(10) NOT NULL, -- A1fl-Ffl

    -- Special Characteristics
    electrical_resistance_class VARCHAR(20),
    chemical_resistance TEXT,

    -- Material Composition
    cement_type VARCHAR(50),
    cement_content DECIMAL(10,2),
    aggregate_type VARCHAR(100),
    max_aggregate_size DECIMAL(10,2),
    water_cement_ratio DECIMAL(5,3),

    -- Additives & Admixtures
    additives JSONB DEFAULT '[]',
    admixtures JSONB DEFAULT '[]',
    fibers JSONB DEFAULT '[]',
    polymer_content DECIMAL(10,2),

    -- Performance Properties
    test_age_days INTEGER DEFAULT 28,
    early_strength BOOLEAN DEFAULT FALSE,
    consistency_class VARCHAR(20),
    flow_value DECIMAL(10,2),
    ph_value DECIMAL(4,2),
    shrinkage_value DECIMAL(10,4),
    swelling_value DECIMAL(10,4),

    -- Thermal & Acoustic Properties
    thermal_resistance DECIMAL(10,4),
    water_vapor_permeability DECIMAL(10,4),
    water_permeability_class VARCHAR(20),
    sound_insulation_value DECIMAL(10,2),
    sound_absorption_coefficient DECIMAL(5,3),

    -- Processing Parameters
    mixing_time_seconds INTEGER,
    pot_life_minutes INTEGER,
    application_thickness_min DECIMAL(10,2),
    application_thickness_max DECIMAL(10,2),
    coverage_kg_m2 DECIMAL(10,2),
    drying_time_hours DECIMAL(10,2),
    full_cure_days INTEGER,

    -- Environmental Conditions
    application_temp_min DECIMAL(5,2),
    application_temp_max DECIMAL(5,2),
    substrate_temp_min DECIMAL(5,2),
    substrate_temp_max DECIMAL(5,2),
    relative_humidity_min DECIMAL(5,2),
    relative_humidity_max DECIMAL(5,2),

    -- Dangerous Substances Declaration
    dangerous_substances TEXT,
    voc_content DECIMAL(10,2),

    -- Quality Control
    sampling_frequency TEXT,
    test_methods JSONB DEFAULT '{}',
    acceptance_criteria JSONB DEFAULT '{}',

    -- Audit Trail
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Compliance
    ce_marking_date DATE,
    declaration_of_performance_number VARCHAR(100),

    CONSTRAINT valid_strength_combination CHECK (
        (binder_type IN ('CT', 'CA', 'MA') AND compressive_strength_class IS NOT NULL AND flexural_strength_class IS NOT NULL) OR
        (binder_type = 'AS' AND indentation_class_cube IS NOT NULL) OR
        (binder_type = 'SR' AND bond_strength_class IS NOT NULL)
    )
);

-- ==================== FPC SYSTEM (Factory Production Control) ====================

-- FPC Control Plans
CREATE TABLE en13813_fpc_control_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'suspended', 'archived')),

    -- Control Parameters
    control_type VARCHAR(50) NOT NULL, -- 'incoming_material', 'process', 'final_product'
    frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'batch', 'continuous'

    -- Test Requirements
    test_parameter VARCHAR(100) NOT NULL,
    test_method VARCHAR(100),
    test_standard VARCHAR(50),

    -- Acceptance Criteria
    min_value DECIMAL(20,4),
    max_value DECIMAL(20,4),
    target_value DECIMAL(20,4),
    tolerance DECIMAL(10,4),
    unit VARCHAR(20),

    -- Responsibilities
    responsible_role VARCHAR(100),
    responsible_person UUID REFERENCES profiles(id),

    -- Actions
    action_on_nonconformity TEXT,
    corrective_action_procedure TEXT,
    escalation_procedure TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FPC Test Results
CREATE TABLE en13813_fpc_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    control_plan_id UUID REFERENCES en13813_fpc_control_plans(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES en13813_batches(id),
    recipe_id UUID REFERENCES en13813_recipes(id),

    -- Test Details
    test_date DATE NOT NULL,
    test_time TIME,
    sample_id VARCHAR(100),

    -- Results
    measured_value DECIMAL(20,4),
    unit VARCHAR(20),
    pass BOOLEAN,

    -- Deviations
    deviation DECIMAL(20,4),
    deviation_percentage DECIMAL(10,4),

    -- Additional Data
    test_conditions JSONB,
    raw_data JSONB,

    -- Personnel
    tested_by UUID REFERENCES profiles(id),
    verified_by UUID REFERENCES profiles(id),

    -- Comments & Actions
    comments TEXT,
    corrective_action TEXT,
    action_taken BOOLEAN DEFAULT FALSE,
    action_date TIMESTAMP,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FPC Calibrations
CREATE TABLE en13813_fpc_calibrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Equipment Information
    equipment_name VARCHAR(255) NOT NULL,
    equipment_id VARCHAR(100) UNIQUE NOT NULL,
    equipment_type VARCHAR(100),
    manufacturer VARCHAR(255),
    model VARCHAR(100),
    serial_number VARCHAR(100),

    -- Calibration Details
    calibration_date DATE NOT NULL,
    next_calibration_date DATE NOT NULL,
    calibration_certificate VARCHAR(100),
    calibration_provider VARCHAR(255),

    -- Status
    status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'due', 'overdue', 'out_of_service')),

    -- Results
    calibration_results JSONB,
    uncertainty DECIMAL(10,4),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ITT (Initial Type Testing) ====================

CREATE TABLE en13813_itt_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,

    -- Test Identification
    test_number VARCHAR(100) UNIQUE NOT NULL,
    test_date DATE NOT NULL,

    -- Laboratory Information
    laboratory_name VARCHAR(255) NOT NULL,
    laboratory_accreditation VARCHAR(100),
    notified_body_number VARCHAR(50),

    -- Test Results
    compressive_strength_result DECIMAL(10,2),
    flexural_strength_result DECIMAL(10,2),
    wear_resistance_result DECIMAL(10,4),
    surface_hardness_result DECIMAL(10,2),
    bond_strength_result DECIMAL(10,2),

    -- Additional Tests
    fire_test_result VARCHAR(10),
    chemical_resistance_result TEXT,
    thermal_resistance_result DECIMAL(10,4),

    -- Compliance
    compliant BOOLEAN,
    deviations TEXT,

    -- Documentation
    test_report_number VARCHAR(100),
    test_report_url TEXT,
    certificate_number VARCHAR(100),

    -- Approval
    approved_by VARCHAR(255),
    approved_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ENHANCED BATCHES TABLE ====================

ALTER TABLE en13813_batches ADD COLUMN IF NOT EXISTS recipe_id UUID REFERENCES en13813_recipes(id);
ALTER TABLE en13813_batches ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100) UNIQUE NOT NULL;
ALTER TABLE en13813_batches ADD COLUMN IF NOT EXISTS production_date DATE NOT NULL;
ALTER TABLE en13813_batches ADD COLUMN IF NOT EXISTS quantity_kg DECIMAL(10,2);
ALTER TABLE en13813_batches ADD COLUMN IF NOT EXISTS raw_material_lots JSONB;
ALTER TABLE en13813_batches ADD COLUMN IF NOT EXISTS fpc_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE en13813_batches ADD COLUMN IF NOT EXISTS conformity_status VARCHAR(20) DEFAULT 'pending';

-- ==================== ENHANCED TEST REPORTS ====================

ALTER TABLE en13813_test_reports ADD COLUMN IF NOT EXISTS report_type VARCHAR(50); -- 'itt', 'fpc', 'external', 'audit'
ALTER TABLE en13813_test_reports ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES en13813_batches(id);
ALTER TABLE en13813_test_reports ADD COLUMN IF NOT EXISTS test_standard VARCHAR(50);
ALTER TABLE en13813_test_reports ADD COLUMN IF NOT EXISTS test_results JSONB;
ALTER TABLE en13813_test_reports ADD COLUMN IF NOT EXISTS compliant BOOLEAN;

-- ==================== DOP (Declaration of Performance) ENHANCEMENTS ====================

ALTER TABLE en13813_dops ADD COLUMN IF NOT EXISTS recipe_id UUID REFERENCES en13813_recipes(id);
ALTER TABLE en13813_dops ADD COLUMN IF NOT EXISTS dop_number VARCHAR(100) UNIQUE NOT NULL;
ALTER TABLE en13813_dops ADD COLUMN IF NOT EXISTS issue_date DATE NOT NULL;
ALTER TABLE en13813_dops ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE en13813_dops ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'de';
ALTER TABLE en13813_dops ADD COLUMN IF NOT EXISTS public_url TEXT;
ALTER TABLE en13813_dops ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE en13813_dops ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- ==================== AUDIT TRAIL ====================

CREATE TABLE en13813_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Entity Reference
    entity_type VARCHAR(50) NOT NULL, -- 'recipe', 'batch', 'test', 'dop', etc.
    entity_id UUID NOT NULL,

    -- Action Details
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'approve', 'lock', etc.
    changes JSONB,

    -- User & Time
    performed_by UUID REFERENCES profiles(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Additional Context
    ip_address INET,
    user_agent TEXT,
    comments TEXT
);

-- ==================== INDEXES ====================

CREATE INDEX idx_recipes_tenant ON en13813_recipes(tenant_id);
CREATE INDEX idx_recipes_status ON en13813_recipes(status);
CREATE INDEX idx_recipes_binder ON en13813_recipes(binder_type);
CREATE INDEX idx_fpc_plans_tenant ON en13813_fpc_control_plans(tenant_id);
CREATE INDEX idx_fpc_results_date ON en13813_fpc_test_results(test_date);
CREATE INDEX idx_itt_recipe ON en13813_itt_tests(recipe_id);
CREATE INDEX idx_audit_entity ON en13813_audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_date ON en13813_audit_trail(performed_at);

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_control_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_itt_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_audit_trail ENABLE ROW LEVEL SECURITY;

-- Add policies for authenticated users
CREATE POLICY "Users can view their tenant recipes" ON en13813_recipes
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their tenant recipes" ON en13813_recipes
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Repeat for other tables...

-- ==================== FUNCTIONS ====================

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON en13813_recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fpc_plans_updated_at BEFORE UPDATE ON en13813_fpc_control_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== GRANT PERMISSIONS ====================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;