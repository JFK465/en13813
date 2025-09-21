-- ================================================
-- ERWEITERTE FELDER FÜR VOLLSTÄNDIGE EN 13813 KONFORMITÄT
-- Fügt alle fehlenden typ-spezifischen Felder hinzu
-- ================================================

-- 1. Erweiterte Felder für alle Estrichtypen
ALTER TABLE en13813_recipes 
ADD COLUMN IF NOT EXISTS indentation_class TEXT, -- AS: IC10, IC15, IC40, IC100, IP10, IP15, IP40
ADD COLUMN IF NOT EXISTS bond_strength_class TEXT, -- SR: B0.5, B1.0, B1.5, B2.0
ADD COLUMN IF NOT EXISTS impact_resistance_class TEXT, -- SR: IR1, IR2, IR4, IR10, IR20
ADD COLUMN IF NOT EXISTS surface_hardness_class TEXT, -- MA: SH30-SH200
ADD COLUMN IF NOT EXISTS wear_resistance_method TEXT CHECK (wear_resistance_method IN ('none', 'bohme', 'bca', 'rolling_wheel')),
ADD COLUMN IF NOT EXISTS rwfc_class TEXT, -- RWFC550, RWFC350, RWFC250, RWFC150
ADD COLUMN IF NOT EXISTS thermal_conductivity_w_mk DECIMAL(5,2), -- Heizestrich λ
ADD COLUMN IF NOT EXISTS heated_indicator BOOLEAN DEFAULT FALSE, -- AS mit H-Suffix
ADD COLUMN IF NOT EXISTS dop_number TEXT UNIQUE, -- Eindeutige DoP-Nummer
ADD COLUMN IF NOT EXISTS notified_body JSONB DEFAULT '{}', -- {number, name, test_report, test_date}
ADD COLUMN IF NOT EXISTS intended_use JSONB DEFAULT '{}', -- Verwendungszweck-Details
ADD COLUMN IF NOT EXISTS extended_properties JSONB DEFAULT '{}'; -- Erweiterte Eigenschaften

-- 2. Check Constraints für typ-spezifische Pflichtfelder
ALTER TABLE en13813_recipes DROP CONSTRAINT IF EXISTS check_type_specific_fields;
ALTER TABLE en13813_recipes ADD CONSTRAINT check_type_specific_fields CHECK (
  -- CT/CA/MA benötigen Druckfestigkeit und Biegezugfestigkeit
  (type NOT IN ('CT', 'CA', 'MA') OR (compressive_strength_class IS NOT NULL AND flexural_strength_class IS NOT NULL))
  AND
  -- AS benötigt Eindrückklasse
  (type != 'AS' OR indentation_class IS NOT NULL)
  AND
  -- SR benötigt Verbundfestigkeit
  (type != 'SR' OR bond_strength_class IS NOT NULL)
  AND
  -- MA benötigt Oberflächenhärte
  (type != 'MA' OR surface_hardness_class IS NOT NULL)
);

-- 3. Check Constraint für Verschleiß bei Nutzschicht
ALTER TABLE en13813_recipes DROP CONSTRAINT IF EXISTS check_wear_resistance;
ALTER TABLE en13813_recipes ADD CONSTRAINT check_wear_resistance CHECK (
  -- Wenn Nutzschicht ohne Bodenbelag, dann Verschleiß erforderlich
  NOT (
    intended_use->>'wearing_surface' = 'true' 
    AND intended_use->>'with_flooring' = 'false'
    AND (wear_resistance_method IS NULL OR wear_resistance_method = 'none')
  )
);

-- 4. Check Constraint für Wärmeleitfähigkeit bei Heizestrich
ALTER TABLE en13813_recipes DROP CONSTRAINT IF EXISTS check_heated_screed;
ALTER TABLE en13813_recipes ADD CONSTRAINT check_heated_screed CHECK (
  -- Wenn Heizestrich, dann λ erforderlich
  NOT (
    intended_use->>'heated_screed' = 'true'
    AND thermal_conductivity_w_mk IS NULL
  )
);

-- 5. Check Constraint für AVCP System 3 bei Brandklasse
ALTER TABLE en13813_recipes DROP CONSTRAINT IF EXISTS check_avcp_system;
ALTER TABLE en13813_recipes ADD CONSTRAINT check_avcp_system CHECK (
  -- Wenn Brandklasse != NPD, dann Notified Body erforderlich
  NOT (
    fire_class != 'NPD'
    AND fire_class != 'A1fl' -- A1fl ist Standardwert, oft ohne NB
    AND (notified_body IS NULL OR notified_body = '{}')
  )
);

-- 6. Trigger für automatische DoP-Nummer Generierung
CREATE OR REPLACE FUNCTION generate_dop_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dop_number IS NULL THEN
    NEW.dop_number := CONCAT(
      EXTRACT(YEAR FROM NOW()),
      '-',
      NEW.type,
      '-',
      COALESCE(NEW.compressive_strength_class, NEW.indentation_class, NEW.bond_strength_class, 'XX'),
      '-',
      LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_dop_number ON en13813_recipes;
CREATE TRIGGER set_dop_number
  BEFORE INSERT ON en13813_recipes
  FOR EACH ROW
  EXECUTE FUNCTION generate_dop_number();

-- 7. Index für Performance
CREATE INDEX IF NOT EXISTS idx_recipes_type ON en13813_recipes(type);
CREATE INDEX IF NOT EXISTS idx_recipes_dop_number ON en13813_recipes(dop_number);
CREATE INDEX IF NOT EXISTS idx_recipes_status ON en13813_recipes(status);
CREATE INDEX IF NOT EXISTS idx_recipes_tenant_id ON en13813_recipes(tenant_id);

-- 8. Erweiterte Felder für Materialzusammensetzung
ALTER TABLE en13813_recipe_materials
ADD COLUMN IF NOT EXISTS aggregates JSONB DEFAULT '[]', -- Detaillierte Zuschlagstoffe
ADD COLUMN IF NOT EXISTS grain_size_distribution JSONB DEFAULT '{}', -- Sieblinie
ADD COLUMN IF NOT EXISTS mixing_instructions JSONB DEFAULT '{}', -- Mischvorschrift
ADD COLUMN IF NOT EXISTS fresh_mortar_properties JSONB DEFAULT '{}'; -- Frischmörteleigenschaften

-- 9. Erweiterte Felder für ITT-Tests
ALTER TABLE en13813_itt_test_plans
ADD COLUMN IF NOT EXISTS test_laboratory TEXT,
ADD COLUMN IF NOT EXISTS notified_body_number TEXT,
ADD COLUMN IF NOT EXISTS report_number TEXT,
ADD COLUMN IF NOT EXISTS report_file_url TEXT,
ADD COLUMN IF NOT EXISTS test_results JSONB DEFAULT '{}';

-- 10. Update FPC Control Plans für erweiterte Kontrollen
ALTER TABLE en13813_fpc_control_plans
ADD COLUMN IF NOT EXISTS control_points JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sampling_plan JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deviation_procedures JSONB DEFAULT '{}';

-- Kommentar für Dokumentation
COMMENT ON TABLE en13813_recipes IS 'EN 13813 konforme Rezepturen mit allen typ-spezifischen Feldern';
COMMENT ON COLUMN en13813_recipes.indentation_class IS 'AS-spezifisch: IC10, IC15, IC40, IC100, IP10, IP15, IP40';
COMMENT ON COLUMN en13813_recipes.bond_strength_class IS 'SR-spezifisch: B0.5, B1.0, B1.5, B2.0';
COMMENT ON COLUMN en13813_recipes.surface_hardness_class IS 'MA-spezifisch: SH30, SH50, SH75, SH100, SH150, SH200';
COMMENT ON COLUMN en13813_recipes.thermal_conductivity_w_mk IS 'Pflicht bei Heizestrich: Wärmeleitfähigkeit λ in W/mK';

-- Erfolgs-Meldung
DO $$
BEGIN
  RAISE NOTICE 'Erweiterte EN 13813 Felder erfolgreich hinzugefügt!';
  RAISE NOTICE 'Die Datenbank unterstützt jetzt alle Estrichtypen (CT/CA/MA/SR/AS)';
  RAISE NOTICE 'Check Constraints für normkonforme Validierung sind aktiv';
END $$;