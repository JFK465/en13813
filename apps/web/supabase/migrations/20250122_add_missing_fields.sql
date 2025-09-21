-- Add missing fields for complete EN13813 compliance
-- Date: 2025-01-22

-- Add AVCP System and CE marking fields to en13813_recipes
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS avcp_system VARCHAR(10) DEFAULT '4'
    CHECK (avcp_system IN ('1', '1+', '2+', '3', '4')),
ADD COLUMN IF NOT EXISTS setting_time_norm VARCHAR(20) DEFAULT 'EN 13454-2',
ADD COLUMN IF NOT EXISTS batch_size_kg DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS production_date DATE,
ADD COLUMN IF NOT EXISTS shelf_life_months INTEGER,
ADD COLUMN IF NOT EXISTS storage_conditions TEXT,
ADD COLUMN IF NOT EXISTS max_grain_size VARCHAR(20),
ADD COLUMN IF NOT EXISTS layer_thickness_range VARCHAR(50);

-- Add comment for clarity
COMMENT ON COLUMN en13813_recipes.avcp_system IS 'AVCP System according to EN 13813 Table ZA.2 - System 4 for standard CT/CA with A1fl';
COMMENT ON COLUMN en13813_recipes.rwfc_class IS 'Rolling Wheel Floor Covering class (RWFC150-550) for screeds with floor covering';
COMMENT ON COLUMN en13813_recipes.ph_value IS 'pH value of fresh mortar - mandatory for CA (must be >= 7)';
COMMENT ON COLUMN en13813_recipes.setting_time_norm IS 'Test standard for setting time - EN 13454-2 for EN 13813 declaration, EN 196-3 for info only';

-- Update constraint for pH value with better validation
ALTER TABLE en13813_recipes
DROP CONSTRAINT IF EXISTS valid_ca_ph,
ADD CONSTRAINT valid_ca_ph CHECK (
    (binder_type != 'CA') OR (ph_value IS NOT NULL AND ph_value >= 7)
);

-- Add AVCP validation constraint
ALTER TABLE en13813_recipes
ADD CONSTRAINT valid_avcp_notified_body CHECK (
    (avcp_system = '4') OR
    (avcp_system IN ('1', '1+', '2+', '3') AND notified_body_number IS NOT NULL)
);

-- Add wear resistance validation for wearing surfaces
ALTER TABLE en13813_recipes
ADD CONSTRAINT valid_wear_resistance CHECK (
    -- If not a wearing surface, no wear resistance needed
    -- This would need application logic to determine, so we keep it simple here
    (wear_resistance_bohme_class IS NOT NULL AND wear_resistance_bca_class IS NULL AND wear_resistance_rollrad_class IS NULL) OR
    (wear_resistance_bohme_class IS NULL AND wear_resistance_bca_class IS NOT NULL AND wear_resistance_rollrad_class IS NULL) OR
    (wear_resistance_bohme_class IS NULL AND wear_resistance_bca_class IS NULL AND wear_resistance_rollrad_class IS NOT NULL) OR
    (wear_resistance_bohme_class IS NULL AND wear_resistance_bca_class IS NULL AND wear_resistance_rollrad_class IS NULL)
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_en13813_recipes_avcp ON en13813_recipes(avcp_system);
CREATE INDEX IF NOT EXISTS idx_en13813_recipes_type ON en13813_recipes(binder_type);
CREATE INDEX IF NOT EXISTS idx_en13813_recipes_status ON en13813_recipes(status);

-- Add material composition table for detailed tracking
CREATE TABLE IF NOT EXISTS en13813_material_composition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,

    -- Binder details
    binder_type VARCHAR(100) NOT NULL,
    binder_designation VARCHAR(255) NOT NULL,
    binder_amount_kg_m3 DECIMAL(10,2) NOT NULL,
    binder_supplier VARCHAR(255),
    binder_certificate VARCHAR(255),

    -- Aggregate details
    aggregate_type VARCHAR(50),
    aggregate_designation VARCHAR(255),
    aggregate_max_size VARCHAR(20),
    aggregate_amount_kg_m3 DECIMAL(10,2),
    aggregate_bulk_density DECIMAL(10,2),
    aggregate_moisture_content DECIMAL(5,2),

    -- Sieve curve
    sieve_curve_data JSONB,

    -- Water
    water_content DECIMAL(10,2),
    water_binder_ratio DECIMAL(5,3) NOT NULL,
    water_quality VARCHAR(20) DEFAULT 'drinking',

    -- Additives
    additives JSONB,

    -- Fibers
    fiber_type VARCHAR(50),
    fiber_length_mm DECIMAL(10,2),
    fiber_diameter_mm DECIMAL(10,4),
    fiber_dosage_kg_m3 DECIMAL(10,2),

    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add fresh mortar properties table
CREATE TABLE IF NOT EXISTS en13813_fresh_mortar_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,

    -- Consistency
    consistency_method VARCHAR(50),
    consistency_value DECIMAL(10,2),
    consistency_unit VARCHAR(10),

    -- Setting time
    setting_time_initial_minutes INTEGER,
    setting_time_final_minutes INTEGER,
    setting_time_test_norm VARCHAR(20) DEFAULT 'EN 13454-2',

    -- Physical properties
    density_kg_m3 DECIMAL(10,2),
    air_content_percent DECIMAL(5,2),
    ph_value DECIMAL(4,2),

    -- Processing
    processing_time_minutes INTEGER,
    temperature_min_celsius DECIMAL(5,2) DEFAULT 5,
    temperature_max_celsius DECIMAL(5,2) DEFAULT 30,

    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing pH values if needed
UPDATE en13813_recipes r
SET ph_value = fm.ph_value
FROM en13813_fresh_mortar_properties fm
WHERE r.id = fm.recipe_id
AND r.ph_value IS NULL
AND fm.ph_value IS NOT NULL;