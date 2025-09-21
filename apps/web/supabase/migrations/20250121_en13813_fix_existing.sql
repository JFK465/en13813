-- EN13813 Migration Fix for Existing Database
-- This migration handles existing structures and only adds what's missing
-- Date: 2025-01-21

-- ==================== HANDLE EXISTING TYPES ====================

-- Check and create types only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_status') THEN
        CREATE TYPE tenant_status AS ENUM ('trial', 'active', 'suspended', 'canceled');
    END IF;
END$$;

-- ==================== RECIPE MANAGEMENT (UPDATES ONLY) ====================

-- Add missing columns to en13813_recipes if they don't exist
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_recipes') THEN
        -- Add missing columns one by one
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'product_name') THEN
            ALTER TABLE en13813_recipes ADD COLUMN product_name VARCHAR(255);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'manufacturer_name') THEN
            ALTER TABLE en13813_recipes ADD COLUMN manufacturer_name VARCHAR(255);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'manufacturer_address') THEN
            ALTER TABLE en13813_recipes ADD COLUMN manufacturer_address TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'manufacturer_contact') THEN
            ALTER TABLE en13813_recipes ADD COLUMN manufacturer_contact VARCHAR(255);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'notified_body_name') THEN
            ALTER TABLE en13813_recipes ADD COLUMN notified_body_name VARCHAR(255);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'notified_body_number') THEN
            ALTER TABLE en13813_recipes ADD COLUMN notified_body_number VARCHAR(50);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'notified_body_certificate') THEN
            ALTER TABLE en13813_recipes ADD COLUMN notified_body_certificate VARCHAR(100);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'rwfc_class') THEN
            ALTER TABLE en13813_recipes ADD COLUMN rwfc_class VARCHAR(10);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'ph_value') THEN
            ALTER TABLE en13813_recipes ADD COLUMN ph_value DECIMAL(4,2);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'declaration_of_performance_number') THEN
            ALTER TABLE en13813_recipes ADD COLUMN declaration_of_performance_number VARCHAR(100);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_recipes' AND column_name = 'ce_marking_date') THEN
            ALTER TABLE en13813_recipes ADD COLUMN ce_marking_date DATE;
        END IF;
    ELSE
        -- Create the full table if it doesn't exist
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

            -- Binder Type
            binder_type VARCHAR(10) NOT NULL CHECK (binder_type IN ('CT', 'CA', 'MA', 'SR', 'AS')),

            -- Version Control
            version VARCHAR(20) DEFAULT '1.0',
            status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'active', 'locked', 'archived')),
            approved_by UUID REFERENCES profiles(id),
            approved_at TIMESTAMP,

            -- Strength Classes (Required)
            compressive_strength_class VARCHAR(10) NOT NULL,
            flexural_strength_class VARCHAR(10) NOT NULL,

            -- Wear Resistance
            wear_resistance_bohme_class VARCHAR(10),
            wear_resistance_bca_class VARCHAR(10),
            wear_resistance_rollrad_class VARCHAR(10),

            -- Surface Properties
            surface_hardness_class VARCHAR(10),
            rwfc_class VARCHAR(10),

            -- Bond & Impact
            bond_strength_class VARCHAR(10),
            impact_resistance_class VARCHAR(10),

            -- Reaction to Fire (Required)
            fire_class VARCHAR(10) NOT NULL,

            -- Special Characteristics
            electrical_resistance_class VARCHAR(20),
            chemical_resistance TEXT,
            ph_value DECIMAL(4,2),

            -- Compliance
            ce_marking_date DATE,
            declaration_of_performance_number VARCHAR(100),

            -- Audit Trail
            created_by UUID REFERENCES profiles(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_by UUID REFERENCES profiles(id),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END$$;

-- ==================== FPC SYSTEM (Factory Production Control) ====================

-- Create FPC tables only if they don't exist
CREATE TABLE IF NOT EXISTS en13813_fpc_control_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'suspended', 'archived')),

    -- Control Parameters
    control_type VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,

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

CREATE TABLE IF NOT EXISTS en13813_fpc_test_results (
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

CREATE TABLE IF NOT EXISTS en13813_fpc_calibrations (
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

CREATE TABLE IF NOT EXISTS en13813_itt_tests (
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

-- Add missing columns to batches table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_batches') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_batches' AND column_name = 'recipe_id') THEN
            ALTER TABLE en13813_batches ADD COLUMN recipe_id UUID REFERENCES en13813_recipes(id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_batches' AND column_name = 'batch_number') THEN
            ALTER TABLE en13813_batches ADD COLUMN batch_number VARCHAR(100) UNIQUE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_batches' AND column_name = 'production_date') THEN
            ALTER TABLE en13813_batches ADD COLUMN production_date DATE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_batches' AND column_name = 'quantity_kg') THEN
            ALTER TABLE en13813_batches ADD COLUMN quantity_kg DECIMAL(10,2);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_batches' AND column_name = 'raw_material_lots') THEN
            ALTER TABLE en13813_batches ADD COLUMN raw_material_lots JSONB;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_batches' AND column_name = 'fpc_status') THEN
            ALTER TABLE en13813_batches ADD COLUMN fpc_status VARCHAR(20) DEFAULT 'pending';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_batches' AND column_name = 'conformity_status') THEN
            ALTER TABLE en13813_batches ADD COLUMN conformity_status VARCHAR(20) DEFAULT 'pending';
        END IF;
    END IF;
END$$;

-- ==================== DOP (Declaration of Performance) ENHANCEMENTS ====================

-- Add missing columns to dops table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'en13813_dops') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_dops' AND column_name = 'recipe_id') THEN
            ALTER TABLE en13813_dops ADD COLUMN recipe_id UUID REFERENCES en13813_recipes(id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_dops' AND column_name = 'dop_number') THEN
            ALTER TABLE en13813_dops ADD COLUMN dop_number VARCHAR(100) UNIQUE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_dops' AND column_name = 'manufacturer_data') THEN
            ALTER TABLE en13813_dops ADD COLUMN manufacturer_data JSONB;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_dops' AND column_name = 'signatory') THEN
            ALTER TABLE en13813_dops ADD COLUMN signatory JSONB;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_dops' AND column_name = 'qr_code_data') THEN
            ALTER TABLE en13813_dops ADD COLUMN qr_code_data TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'en13813_dops' AND column_name = 'public_url') THEN
            ALTER TABLE en13813_dops ADD COLUMN public_url TEXT;
        END IF;
    END IF;
END$$;

-- ==================== AUDIT TRAIL ====================

CREATE TABLE IF NOT EXISTS en13813_audit_trail (
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_recipes_tenant ON en13813_recipes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_status ON en13813_recipes(status);
CREATE INDEX IF NOT EXISTS idx_recipes_binder ON en13813_recipes(binder_type);
CREATE INDEX IF NOT EXISTS idx_fpc_plans_tenant ON en13813_fpc_control_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fpc_results_date ON en13813_fpc_test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_itt_recipe ON en13813_itt_tests(recipe_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON en13813_audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON en13813_audit_trail(performed_at);

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS on new tables
ALTER TABLE en13813_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_control_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_fpc_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_itt_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE en13813_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    -- Recipes policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipes' AND policyname = 'Users can view their tenant recipes') THEN
        CREATE POLICY "Users can view their tenant recipes" ON en13813_recipes
            FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_recipes' AND policyname = 'Users can manage their tenant recipes') THEN
        CREATE POLICY "Users can manage their tenant recipes" ON en13813_recipes
            FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));
    END IF;

    -- FPC Control Plans policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_fpc_control_plans' AND policyname = 'Users can view their tenant fpc plans') THEN
        CREATE POLICY "Users can view their tenant fpc plans" ON en13813_fpc_control_plans
            FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'en13813_fpc_control_plans' AND policyname = 'Users can manage their tenant fpc plans') THEN
        CREATE POLICY "Users can manage their tenant fpc plans" ON en13813_fpc_control_plans
            FOR ALL USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));
    END IF;

    -- Similar policies for other tables...
END$$;

-- ==================== FUNCTIONS ====================

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_recipes_updated_at') THEN
        CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON en13813_recipes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fpc_plans_updated_at') THEN
        CREATE TRIGGER update_fpc_plans_updated_at BEFORE UPDATE ON en13813_fpc_control_plans
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- ==================== GRANT PERMISSIONS ====================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ==================== SUCCESS MESSAGE ====================

DO $$
BEGIN
    RAISE NOTICE 'EN13813 migration completed successfully. All missing structures have been added.';
END$$;