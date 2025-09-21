-- EN13813 Complete Schema for Fresh Database
-- Fully compliant with EN 13813:2002 Standard
-- Date: 2025-01-22

-- ==================== EXTENSIONS ====================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== CUSTOM TYPES ====================

-- Create tenant status enum
CREATE TYPE tenant_status AS ENUM ('trial', 'active', 'suspended', 'canceled');

-- ==================== CORE TABLES ====================

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status tenant_status DEFAULT 'trial',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== EN13813 RECIPE MANAGEMENT ====================

CREATE TABLE en13813_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Basic Identification
    recipe_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
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
    compressive_strength_class VARCHAR(10) NOT NULL,
    flexural_strength_class VARCHAR(10) NOT NULL,

    -- Wear Resistance (one method required for wearing surfaces)
    wear_resistance_bohme_class VARCHAR(10),
    wear_resistance_bca_class VARCHAR(10),
    wear_resistance_rollrad_class VARCHAR(10),

    -- Surface Properties
    surface_hardness_class VARCHAR(10),
    rwfc_class VARCHAR(10), -- Rolling Wheel Floor Covering

    -- Mastic Asphalt Specific
    indentation_class_cube VARCHAR(10),
    indentation_class_plate VARCHAR(10),

    -- Bond & Impact
    bond_strength_class VARCHAR(10),
    impact_resistance_class VARCHAR(10),

    -- Reaction to Fire (Required)
    fire_class VARCHAR(10) NOT NULL,

    -- Special Characteristics
    electrical_resistance_class VARCHAR(20),
    chemical_resistance TEXT,

    -- Material Composition
    cement_type VARCHAR(50),
    cement_content DECIMAL(10,2),
    aggregate_type VARCHAR(100),
    max_aggregate_size DECIMAL(10,2),
    water_cement_ratio DECIMAL(5,3),

    -- pH Value (Required for CA >= 7)
    ph_value DECIMAL(4,2),

    -- Processing Parameters
    mixing_time_seconds INTEGER,
    pot_life_minutes INTEGER,
    application_thickness_min DECIMAL(10,2),
    application_thickness_max DECIMAL(10,2),
    coverage_kg_m2 DECIMAL(10,2),

    -- Compliance
    ce_marking_date DATE,
    declaration_of_performance_number VARCHAR(100),

    -- Audit Trail
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_ca_ph CHECK (
        (binder_type != 'CA') OR (ph_value >= 7)
    )
);

-- ==================== BATCH MANAGEMENT ====================

CREATE TABLE en13813_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES en13813_recipes(id),

    batch_number VARCHAR(100) UNIQUE NOT NULL,
    production_date DATE NOT NULL,
    quantity_kg DECIMAL(10,2),

    raw_material_lots JSONB,
    fpc_status VARCHAR(20) DEFAULT 'pending',
    conformity_status VARCHAR(20) DEFAULT 'pending',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== FPC SYSTEM (Factory Production Control) ====================

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

-- ==================== DOP (Declaration of Performance) ====================

CREATE TABLE en13813_dops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    recipe_id UUID REFERENCES en13813_recipes(id),
    dop_number VARCHAR(100) UNIQUE NOT NULL,
    version INTEGER DEFAULT 1,

    issue_date DATE NOT NULL,
    valid_until DATE,
    language VARCHAR(10) DEFAULT 'de',

    manufacturer_data JSONB,
    signatory JSONB,

    public_url TEXT,
    qr_code_data TEXT,

    status VARCHAR(20) DEFAULT 'draft',

    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TEST REPORTS ====================

CREATE TABLE en13813_test_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    recipe_id UUID REFERENCES en13813_recipes(id),
    batch_id UUID REFERENCES en13813_batches(id),

    report_type VARCHAR(50), -- 'itt', 'fpc', 'external', 'audit'
    report_number VARCHAR(100),
    test_date DATE,

    test_standard VARCHAR(50),
    test_results JSONB,
    compliant BOOLEAN,

    document_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== COMPLIANCE TASKS ====================

CREATE TABLE en13813_compliance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    task_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    due_date DATE NOT NULL,
    assigned_to UUID REFERENCES profiles(id),

    status VARCHAR(20) DEFAULT 'pending',
    completed_at TIMESTAMP,
    completed_by UUID REFERENCES profiles(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== AUDIT TRAIL ====================

CREATE TABLE en13813_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Entity Reference
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,

    -- Action Details
    action VARCHAR(50) NOT NULL,
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
CREATE INDEX idx_batches_recipe ON en13813_batches(recipe_id);
CREATE INDEX idx_fpc_plans_tenant ON en13813_fpc_control_plans(tenant_id);
CREATE INDEX idx_fpc_results_date ON en13813_fpc_test_results(test_date);
CREATE INDEX idx_itt_recipe ON en13813_itt_tests(recipe_id);
CREATE INDEX idx_dops_recipe ON en13813_dops(recipe_id);
CREATE INDEX idx_audit_entity ON en13813_audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_date ON en13813_audit_trail(performed_at);

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_control_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_itt_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_dops ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_compliance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_audit_trail ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Tenant-based policies for EN13813 tables
CREATE POLICY "Users can view their tenant recipes" ON en13813_recipes
    FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their tenant recipes" ON en13813_recipes
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Similar policies for other tables
CREATE POLICY "Users can view their tenant batches" ON en13813_batches
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their tenant FPC plans" ON en13813_fpc_control_plans
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their tenant FPC results" ON en13813_fpc_test_results
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their tenant ITT tests" ON en13813_itt_tests
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their tenant DoPs" ON en13813_dops
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- Public access for published DoPs
CREATE POLICY "Public can view published DoPs" ON en13813_dops
    FOR SELECT USING (status = 'published');

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
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON en13813_recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON en13813_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fpc_plans_updated_at BEFORE UPDATE ON en13813_fpc_control_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dops_updated_at BEFORE UPDATE ON en13813_dops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== GRANT PERMISSIONS ====================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ==================== SUCCESS MESSAGE ====================

DO $$
BEGIN
    RAISE NOTICE 'EN13813 complete schema has been successfully created!';
END$$;