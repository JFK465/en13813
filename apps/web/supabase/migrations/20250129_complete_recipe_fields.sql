-- ============================================================
-- Complete Recipe Fields Migration
-- Adds ALL missing fields from RecipeFormUltimate.tsx
-- ============================================================

-- Add basic type column if missing
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'CT';

-- Add test_age_days if missing
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS test_age_days INTEGER DEFAULT 28;

-- Add early_strength if missing
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS early_strength BOOLEAN DEFAULT false;

-- Add version if missing
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS version VARCHAR(50) DEFAULT '1.0.0';

-- Add approved fields
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Add smoke_class
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS smoke_class VARCHAR(10);

-- Add heated_indicator
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS heated_indicator BOOLEAN DEFAULT false;

-- Add impact_resistance_nm (numeric value in Newton-meters)
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS impact_resistance_nm NUMERIC;

-- Add JSONB fields for complex nested data
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS additional_properties JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS quality_control JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS traceability JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS itt_test_plan JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS change_log JSONB DEFAULT '[]'::jsonb;

-- Add notes fields
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Ensure all columns have proper comments
COMMENT ON COLUMN en13813_recipes.type IS 'Screed type: CT (Cementitious), CA (Calcium sulfate), MA (Magnesite), SR (Synthetic resin), AS (Asphalt)';
COMMENT ON COLUMN en13813_recipes.test_age_days IS 'Test age in days (typically 28)';
COMMENT ON COLUMN en13813_recipes.early_strength IS 'Early strength indicator';
COMMENT ON COLUMN en13813_recipes.version IS 'Recipe version number';
COMMENT ON COLUMN en13813_recipes.approved_by IS 'Name of approver';
COMMENT ON COLUMN en13813_recipes.approved_at IS 'Approval timestamp';
COMMENT ON COLUMN en13813_recipes.smoke_class IS 'Smoke emission class (s1, s2)';
COMMENT ON COLUMN en13813_recipes.heated_indicator IS 'Heated screed indicator (H marking)';
COMMENT ON COLUMN en13813_recipes.impact_resistance_nm IS 'Impact resistance in Newton-meters';
COMMENT ON COLUMN en13813_recipes.materials IS 'Material composition (binder, aggregates, additives, etc.)';
COMMENT ON COLUMN en13813_recipes.additional_properties IS 'Additional properties (thermal, electrical, chemical, etc.)';
COMMENT ON COLUMN en13813_recipes.quality_control IS 'Quality control parameters and tolerances';
COMMENT ON COLUMN en13813_recipes.traceability IS 'Traceability and certificate information';
COMMENT ON COLUMN en13813_recipes.itt_test_plan IS 'Initial Type Testing plan';
COMMENT ON COLUMN en13813_recipes.change_log IS 'Recipe change history';
COMMENT ON COLUMN en13813_recipes.notes IS 'Public notes (visible in DoP)';
COMMENT ON COLUMN en13813_recipes.internal_notes IS 'Internal notes (not visible in DoP)';

-- Create index on frequently queried fields
CREATE INDEX IF NOT EXISTS idx_en13813_recipes_type ON en13813_recipes(type);
CREATE INDEX IF NOT EXISTS idx_en13813_recipes_status ON en13813_recipes(status);
CREATE INDEX IF NOT EXISTS idx_en13813_recipes_recipe_code ON en13813_recipes(recipe_code);

-- Update table comment
COMMENT ON TABLE en13813_recipes IS 'Complete EN 13813 compliant screed material recipes with all form fields';