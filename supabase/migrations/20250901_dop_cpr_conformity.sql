-- ================================================
-- Migration: DoP CPR + EN 13813 Konformität
-- Datum: 2025-09-01
-- Beschreibung: Erweitert DoP-Tabelle für vollständige CPR-Konformität
-- ================================================

-- 1. Erweitere en13813_dops Tabelle
ALTER TABLE en13813_dops 
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'de',
ADD COLUMN IF NOT EXISTS avcp_system INTEGER CHECK (avcp_system IN (3, 4)) DEFAULT 4,
ADD COLUMN IF NOT EXISTS harmonized_specification JSONB DEFAULT jsonb_build_object(
  'standard', 'EN 13813:2002',
  'title', 'Estrichmörtel und Estrichmassen - Estrichmörtel - Eigenschaften und Anforderungen'
),
ADD COLUMN IF NOT EXISTS authorized_representative JSONB,
ADD COLUMN IF NOT EXISTS notified_body JSONB,
ADD COLUMN IF NOT EXISTS signatory JSONB,
ADD COLUMN IF NOT EXISTS digital_availability_url TEXT,
ADD COLUMN IF NOT EXISTS retention_period VARCHAR(50) DEFAULT '10 years',
ADD COLUMN IF NOT EXISTS retention_location TEXT DEFAULT 'Digital and physical archive';

-- 2. Migriere declared_performance zu neuer Struktur
-- Erstelle temporäre Funktion für Migration
CREATE OR REPLACE FUNCTION migrate_declared_performance() 
RETURNS void AS $$
DECLARE
  rec RECORD;
  new_performance JSONB;
BEGIN
  FOR rec IN SELECT id, recipe_id, declared_performance FROM en13813_dops
  LOOP
    -- Hole Recipe-Daten
    SELECT 
      jsonb_build_object(
        'release_of_corrosive_substances', r.estrich_type,
        'compressive_strength_class', r.compressive_strength,
        'flexural_strength_class', r.flexural_strength,
        'wear_resistance_bohme_class', 
          CASE WHEN r.wear_resistance_method = 'bohme' THEN r.wear_resistance_class ELSE NULL END,
        'wear_resistance_bca_class',
          CASE WHEN r.wear_resistance_method = 'bca' THEN r.wear_resistance_class ELSE NULL END,
        'wear_resistance_rwfc_class',
          CASE WHEN r.wear_resistance_method = 'rolling_wheel' THEN r.wear_resistance_class ELSE NULL END,
        'surface_hardness_class', r.surface_hardness_class,
        'bond_strength_class', r.bond_strength_class,
        'impact_resistance_class', r.impact_resistance_class,
        'fire_class', COALESCE(r.fire_class, 'NPD'),
        'water_permeability', 'NPD',
        'water_vapour_permeability', 'NPD',
        'sound_insulation', 'NPD',
        'sound_absorption', 'NPD',
        'thermal_resistance', 'NPD',
        'chemical_resistance', 'NPD',
        'electrical_resistance', CASE WHEN r.estrich_type = 'AS' THEN 'NPD' ELSE NULL END,
        'release_of_dangerous_substances', 'Siehe SDS'
      ) INTO new_performance
    FROM en13813_recipes r
    WHERE r.id = rec.recipe_id;
    
    -- Update DoP
    UPDATE en13813_dops 
    SET declared_performance = COALESCE(new_performance, rec.declared_performance)
    WHERE id = rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Führe Migration aus
SELECT migrate_declared_performance();

-- Lösche temporäre Funktion
DROP FUNCTION migrate_declared_performance();

-- 3. Update AVCP System basierend auf Brandklasse
UPDATE en13813_dops d
SET avcp_system = 3
FROM en13813_recipes r
WHERE d.recipe_id = r.id
  AND r.fire_class IS NOT NULL 
  AND r.fire_class != 'NPD' 
  AND r.fire_class != 'A1fl';

-- 4. Erstelle Index für Performance
CREATE INDEX IF NOT EXISTS idx_dops_workflow_status ON en13813_dops(workflow_status);
CREATE INDEX IF NOT EXISTS idx_dops_language ON en13813_dops(language);
CREATE INDEX IF NOT EXISTS idx_dops_avcp_system ON en13813_dops(avcp_system);

-- 5. Erstelle View für aktive DoPs
CREATE OR REPLACE VIEW active_dops AS
SELECT 
  d.*,
  r.name as recipe_name,
  r.recipe_code,
  r.estrich_type,
  r.compressive_strength,
  r.flexural_strength,
  r.wear_resistance_class,
  r.fire_class
FROM en13813_dops d
JOIN en13813_recipes r ON d.recipe_id = r.id
WHERE d.is_active = true
  AND d.workflow_status = 'published';

-- 6. Funktion zur DoP-Validierung
CREATE OR REPLACE FUNCTION validate_dop(dop_id UUID)
RETURNS TABLE(
  valid BOOLEAN,
  errors TEXT[],
  warnings TEXT[]
) AS $$
DECLARE
  v_dop RECORD;
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_warnings TEXT[] := ARRAY[]::TEXT[];
  v_valid BOOLEAN := true;
BEGIN
  -- Hole DoP
  SELECT * INTO v_dop FROM en13813_dops WHERE id = dop_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, ARRAY['DoP nicht gefunden']::TEXT[], ARRAY[]::TEXT[];
    RETURN;
  END IF;
  
  -- CPR Pflichtfelder
  IF v_dop.dop_number IS NULL OR v_dop.dop_number = '' THEN
    v_errors := array_append(v_errors, 'DoP-Nummer fehlt');
  END IF;
  
  IF v_dop.manufacturer_data->>'name' IS NULL THEN
    v_errors := array_append(v_errors, 'Herstellername fehlt');
  END IF;
  
  IF v_dop.manufacturer_data->>'address' IS NULL THEN
    v_errors := array_append(v_errors, 'Herstelleradresse fehlt');
  END IF;
  
  -- EN 13813 spezifisch
  IF v_dop.declared_performance->>'release_of_corrosive_substances' IS NULL THEN
    v_errors := array_append(v_errors, 'Freisetzung korrosiver Stoffe fehlt');
  END IF;
  
  IF v_dop.declared_performance->>'compressive_strength_class' IS NULL THEN
    v_errors := array_append(v_errors, 'Druckfestigkeitsklasse fehlt');
  END IF;
  
  IF v_dop.declared_performance->>'flexural_strength_class' IS NULL THEN
    v_errors := array_append(v_errors, 'Biegezugfestigkeitsklasse fehlt');
  END IF;
  
  -- System 3 Prüfung
  IF v_dop.avcp_system = 3 THEN
    IF v_dop.notified_body IS NULL OR v_dop.notified_body->>'number' IS NULL THEN
      v_errors := array_append(v_errors, 'Notifizierte Stelle fehlt für System 3');
    END IF;
  END IF;
  
  -- Warnungen
  IF v_dop.batch_id IS NULL THEN
    v_warnings := array_append(v_warnings, 'Keine Charge zugeordnet');
  END IF;
  
  IF v_dop.test_report_ids IS NULL OR array_length(v_dop.test_report_ids, 1) = 0 THEN
    v_warnings := array_append(v_warnings, 'Keine Prüfberichte zugeordnet');
  END IF;
  
  -- Setze Validitätsstatus
  IF array_length(v_errors, 1) > 0 THEN
    v_valid := false;
  END IF;
  
  RETURN QUERY SELECT v_valid, v_errors, v_warnings;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger für automatische AVCP-System-Bestimmung
CREATE OR REPLACE FUNCTION set_avcp_system()
RETURNS TRIGGER AS $$
DECLARE
  v_fire_class TEXT;
BEGIN
  -- Hole Brandklasse aus Recipe
  SELECT fire_class INTO v_fire_class
  FROM en13813_recipes
  WHERE id = NEW.recipe_id;
  
  -- Bestimme AVCP System
  IF v_fire_class IS NOT NULL 
     AND v_fire_class != 'NPD' 
     AND v_fire_class != 'A1fl' THEN
    NEW.avcp_system := 3;
  ELSE
    NEW.avcp_system := 4;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_avcp_system
BEFORE INSERT OR UPDATE OF recipe_id ON en13813_dops
FOR EACH ROW
EXECUTE FUNCTION set_avcp_system();

-- 8. Kommentare hinzufügen
COMMENT ON COLUMN en13813_dops.language IS 'Sprache der DoP (de, en, fr, etc.)';
COMMENT ON COLUMN en13813_dops.avcp_system IS 'AVCP System (3 oder 4) gemäß CPR';
COMMENT ON COLUMN en13813_dops.harmonized_specification IS 'Harmonisierte technische Spezifikation';
COMMENT ON COLUMN en13813_dops.authorized_representative IS 'Bevollmächtigter (optional)';
COMMENT ON COLUMN en13813_dops.notified_body IS 'Notifizierte Stelle (bei System 3)';
COMMENT ON COLUMN en13813_dops.signatory IS 'Unterzeichner der DoP';
COMMENT ON COLUMN en13813_dops.digital_availability_url IS 'URL zur digitalen Bereitstellung';
COMMENT ON COLUMN en13813_dops.retention_period IS 'Aufbewahrungsfrist';
COMMENT ON COLUMN en13813_dops.retention_location IS 'Aufbewahrungsort';