-- Add missing columns to en13813_recipes table

-- Add AVCP system column
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS avcp_system VARCHAR(10) DEFAULT '4';

-- Add manufacturer fields (EN 13813 requirements)
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS manufacturer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS manufacturer_address TEXT,
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add wear resistance fields
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS wear_resistance_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS wear_resistance_class VARCHAR(50);

-- Add additional strength classes
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS surface_hardness_class VARCHAR(50),
ADD COLUMN IF NOT EXISTS bond_strength_class VARCHAR(50),
ADD COLUMN IF NOT EXISTS impact_resistance_class VARCHAR(50),
ADD COLUMN IF NOT EXISTS indentation_class VARCHAR(50),
ADD COLUMN IF NOT EXISTS rwfc_class VARCHAR(50);

-- Add fire class
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS fire_class VARCHAR(50) DEFAULT 'A1fl';

-- Add notified body number for CE marking
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS notified_body_number VARCHAR(50);

-- Add intended use as JSONB
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS intended_use JSONB DEFAULT '{}'::jsonb;

-- Add status column
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';

-- Add comments for documentation
COMMENT ON COLUMN en13813_recipes.avcp_system IS 'Assessment and Verification of Constancy of Performance system (1, 1+, 2+, 3, 4)';
COMMENT ON COLUMN en13813_recipes.manufacturer_name IS 'Manufacturer name for CE marking and DoP';
COMMENT ON COLUMN en13813_recipes.manufacturer_address IS 'Manufacturer address for CE marking and DoP';
COMMENT ON COLUMN en13813_recipes.product_name IS 'Commercial product name (can differ from recipe name)';
COMMENT ON COLUMN en13813_recipes.intended_use IS 'Intended use specifications as JSON';
COMMENT ON COLUMN en13813_recipes.wear_resistance_method IS 'Test method: bohme, bca, rolling_wheel, none';
COMMENT ON COLUMN en13813_recipes.fire_class IS 'Fire classification according to EN 13501-1';