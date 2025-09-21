-- ================================================
-- FÜGE FEHLENDE SPALTEN ZU EN13813_RECIPES HINZU
-- Führen Sie dies in Ihrem Supabase SQL Editor aus
-- ================================================

-- Füge alle fehlenden Spalten hinzu (falls nicht vorhanden)
ALTER TABLE en13813_recipes 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS production_site TEXT,
ADD COLUMN IF NOT EXISTS product_designation TEXT,
ADD COLUMN IF NOT EXISTS ce_marking_year INTEGER,
ADD COLUMN IF NOT EXISTS standard_reference TEXT DEFAULT 'EN 13813:2002',
ADD COLUMN IF NOT EXISTS avcp_system TEXT,
ADD COLUMN IF NOT EXISTS release_of_corrosive_substances TEXT DEFAULT 'CA',
ADD COLUMN IF NOT EXISTS water_permeability TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS water_vapour_permeability TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS impact_resistance TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS sound_insulation TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS sound_absorption TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS thermal_resistance TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS chemical_resistance TEXT DEFAULT 'NPD',
ADD COLUMN IF NOT EXISTS wear_resistance_bohme_class TEXT,
ADD COLUMN IF NOT EXISTS wear_resistance_bca_class TEXT,
ADD COLUMN IF NOT EXISTS wear_resistance_rwa_class TEXT,
ADD COLUMN IF NOT EXISTS wear_resistance_method TEXT CHECK (wear_resistance_method IN ('none', 'bohme', 'bca', 'rolling_wheel')),
ADD COLUMN IF NOT EXISTS rwfc_class TEXT,
ADD COLUMN IF NOT EXISTS thermal_conductivity_w_mk DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS indentation_class TEXT,
ADD COLUMN IF NOT EXISTS bond_strength_class TEXT,
ADD COLUMN IF NOT EXISTS impact_resistance_class TEXT,
ADD COLUMN IF NOT EXISTS surface_hardness_class TEXT,
ADD COLUMN IF NOT EXISTS intended_use JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dop_number TEXT,
ADD COLUMN IF NOT EXISTS notified_body JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS extended_properties JSONB DEFAULT '{}';

-- Füge auch fehlende Spalten zu recipe_materials hinzu
ALTER TABLE en13813_recipe_materials
ADD COLUMN IF NOT EXISTS binder_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS aggregates JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS grain_size_distribution JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mixing_instructions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fresh_mortar_properties JSONB DEFAULT '{}';

-- Füge erweiterte Felder zu ITT Test Plans hinzu
ALTER TABLE en13813_itt_test_plans
ADD COLUMN IF NOT EXISTS test_laboratory TEXT,
ADD COLUMN IF NOT EXISTS notified_body_number TEXT,
ADD COLUMN IF NOT EXISTS report_number TEXT,
ADD COLUMN IF NOT EXISTS report_file_url TEXT;

-- Füge erweiterte Felder zu FPC Control Plans hinzu
ALTER TABLE en13813_fpc_control_plans
ADD COLUMN IF NOT EXISTS control_points JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sampling_plan JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deviation_procedures JSONB DEFAULT '{}';

-- Erfolg
DO $$
BEGIN
  RAISE NOTICE 'Alle fehlenden Spalten wurden hinzugefügt!';
  RAISE NOTICE 'Sie können jetzt die Demo-Daten erstellen.';
END $$;