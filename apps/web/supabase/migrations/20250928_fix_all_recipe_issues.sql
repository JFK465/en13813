-- Comprehensive fix for EN13813 recipes table
-- This migration fixes all constraints and adds missing columns

-- First, make existing columns that should be optional actually optional
ALTER TABLE en13813_recipes
ALTER COLUMN manufacturer_name DROP NOT NULL,
ALTER COLUMN manufacturer_address DROP NOT NULL,
ALTER COLUMN product_name DROP NOT NULL,
ALTER COLUMN description DROP NOT NULL;

-- Ensure fire_class has a default and is optional
ALTER TABLE en13813_recipes
ALTER COLUMN fire_class DROP NOT NULL,
ALTER COLUMN fire_class SET DEFAULT 'A1fl';

-- Add all missing EN13813 norm-relevant columns
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS avcp_system VARCHAR(10) DEFAULT '4';

-- Add wear resistance fields (optional)
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS wear_resistance_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS wear_resistance_class VARCHAR(50);

-- Add additional strength classes (all optional)
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS surface_hardness_class VARCHAR(50),
ADD COLUMN IF NOT EXISTS bond_strength_class VARCHAR(50),
ADD COLUMN IF NOT EXISTS impact_resistance_class VARCHAR(50),
ADD COLUMN IF NOT EXISTS indentation_class VARCHAR(50),
ADD COLUMN IF NOT EXISTS rwfc_class VARCHAR(50);

-- Add notified body number for CE marking (optional)
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS notified_body_number VARCHAR(50);

-- Add intended use as JSONB (optional with default)
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS intended_use JSONB DEFAULT '{}'::jsonb;

-- Add status column (optional with default)
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';

-- Add comments for documentation
COMMENT ON COLUMN en13813_recipes.avcp_system IS 'Assessment and Verification of Constancy of Performance system (1, 1+, 2+, 3, 4)';
COMMENT ON COLUMN en13813_recipes.manufacturer_name IS 'Manufacturer name for CE marking and DoP (optional)';
COMMENT ON COLUMN en13813_recipes.manufacturer_address IS 'Manufacturer address for CE marking and DoP (optional)';
COMMENT ON COLUMN en13813_recipes.product_name IS 'Commercial product name - can differ from recipe name (optional)';
COMMENT ON COLUMN en13813_recipes.description IS 'Detailed description of the screed material (optional)';
COMMENT ON COLUMN en13813_recipes.intended_use IS 'Intended use specifications as JSON (optional)';
COMMENT ON COLUMN en13813_recipes.wear_resistance_method IS 'Test method: bohme, bca, rolling_wheel, none (optional)';
COMMENT ON COLUMN en13813_recipes.wear_resistance_class IS 'Wear resistance classification (optional)';
COMMENT ON COLUMN en13813_recipes.fire_class IS 'Fire classification according to EN 13501-1 (optional with default A1fl)';
COMMENT ON COLUMN en13813_recipes.status IS 'Recipe status: draft, active, archived (optional with default draft)';

-- Ensure the table is ready for use
COMMENT ON TABLE en13813_recipes IS 'EN 13813 compliant screed material recipes with full norm support';