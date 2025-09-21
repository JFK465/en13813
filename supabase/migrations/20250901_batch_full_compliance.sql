-- ================================================
-- ERWEITERE EN13813_BATCHES FÜR VOLLE NORMKONFORMITÄT
-- ================================================

-- Füge neue Spalten für vollständige EN 13813 Konformität hinzu
ALTER TABLE en13813_batches 
-- Rohstoff-Rückverfolgbarkeit
ADD COLUMN IF NOT EXISTS raw_materials JSONB DEFAULT '{}',
-- Struktur: {
--   zement_charge: string,
--   zement_lieferdatum: date,
--   zement_lieferant: string,
--   zuschlag_charge: string,
--   zuschlag_lieferdatum: date,
--   zuschlag_lieferant: string,
--   zusatzmittel_charges: [{produkt, charge, lieferant}]
-- }

-- Prüfkörper-Management
ADD COLUMN IF NOT EXISTS test_specimens JSONB DEFAULT '{}',
-- Struktur: {
--   anzahl_hergestellt: number,
--   kennzeichnung: string,
--   lagerung: string,
--   pruefplan: {7_tage: 3, 28_tage: 3, reserve: 3}
-- }

-- Verschleißprüfung (wenn relevant)
ADD COLUMN IF NOT EXISTS wear_test JSONB DEFAULT '{}',
-- Struktur: {
--   methode: 'bohme' | 'bca' | 'rollrad',
--   ergebnis: string,
--   pruefnorm: string,
--   datum: date
-- }

-- Rückstellmuster
ADD COLUMN IF NOT EXISTS retention_sample JSONB DEFAULT '{}',
-- Struktur: {
--   entnommen: boolean,
--   menge: string,
--   lagerort: string,
--   aufbewahrung_bis: date,
--   entnahme_datum: date
-- }

-- Konformitätsprüfung
ADD COLUMN IF NOT EXISTS conformity_check JSONB DEFAULT '{}',
-- Struktur: {
--   druckfestigkeit: {soll, ist, toleranz, status},
--   biegezug: {soll, ist, toleranz, status},
--   andere_parameter: [{parameter, soll, ist, status}]
-- }

-- Verwendungsnachweis
ADD COLUMN IF NOT EXISTS usage_tracking JSONB DEFAULT '{}',
-- Struktur: {
--   lieferscheine: [string],
--   kunden: [string],
--   projekte: [string],
--   dop_nummern: [string],
--   menge_ausgeliefert: number
-- }

-- Produktions-Umgebungsbedingungen
ADD COLUMN IF NOT EXISTS production_conditions JSONB DEFAULT '{}',
-- Struktur: {
--   mischer_id: string,
--   mischer_kalibrierung: date,
--   aussentemperatur: number,
--   materialtemperatur: number,
--   luftfeuchtigkeit: number
-- }

-- Erweiterte Freigabe
ADD COLUMN IF NOT EXISTS release_workflow JSONB DEFAULT '{}',
-- Struktur: {
--   qc_status: 'pending' | 'passed' | 'failed',
--   freigegeben_von: string,
--   freigabe_datum: date,
--   sperr_grund: string,
--   itt_referenz: string
-- }

-- Zusätzliche Metadaten
ADD COLUMN IF NOT EXISTS mixer_id TEXT,
ADD COLUMN IF NOT EXISTS itt_reference TEXT,
ADD COLUMN IF NOT EXISTS external_temperature DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS material_temperature DECIMAL(5,2);

-- Erstelle Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_batches_raw_materials ON en13813_batches USING GIN (raw_materials);
CREATE INDEX IF NOT EXISTS idx_batches_usage ON en13813_batches USING GIN (usage_tracking);
CREATE INDEX IF NOT EXISTS idx_batches_conformity ON en13813_batches USING GIN (conformity_check);

-- Kommentar zur Tabelle
COMMENT ON TABLE en13813_batches IS 'Vollständige Chargenverwaltung nach EN 13813 mit Rückverfolgbarkeit und WPK-Konformität';

-- Beispiel-Trigger für automatische Aufbewahrungsfrist
CREATE OR REPLACE FUNCTION set_retention_sample_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Wenn Rückstellmuster entnommen wird, setze automatisch Aufbewahrungsfrist auf +2 Jahre
  IF NEW.retention_sample->>'entnommen' = 'true' AND 
     (NEW.retention_sample->>'aufbewahrung_bis') IS NULL THEN
    NEW.retention_sample = jsonb_set(
      NEW.retention_sample,
      '{aufbewahrung_bis}',
      to_jsonb((CURRENT_DATE + INTERVAL '2 years')::text)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_retention_date
  BEFORE INSERT OR UPDATE ON en13813_batches
  FOR EACH ROW
  EXECUTE FUNCTION set_retention_sample_date();

-- Funktion zur automatischen Konformitätsprüfung
CREATE OR REPLACE FUNCTION check_batch_conformity(
  batch_id UUID
) RETURNS JSONB AS $$
DECLARE
  batch_record RECORD;
  recipe_record RECORD;
  conformity_result JSONB;
BEGIN
  -- Hole Charge und Rezeptur
  SELECT b.*, r.*
  INTO batch_record
  FROM en13813_batches b
  JOIN en13813_recipes r ON b.recipe_id = r.id
  WHERE b.id = batch_id;

  -- Prüfe Druckfestigkeit
  conformity_result = jsonb_build_object(
    'druckfestigkeit', jsonb_build_object(
      'soll', CAST(REPLACE(recipe_record.compressive_strength_class, 'C', '') AS INTEGER),
      'ist', batch_record.qc_data->>'compressive_strength_28d',
      'toleranz', '≥ deklariert',
      'status', CASE 
        WHEN (batch_record.qc_data->>'compressive_strength_28d')::NUMERIC >= 
             CAST(REPLACE(recipe_record.compressive_strength_class, 'C', '') AS INTEGER)
        THEN 'PASS'
        ELSE 'FAIL'
      END
    ),
    'biegezug', jsonb_build_object(
      'soll', CAST(REPLACE(recipe_record.flexural_strength_class, 'F', '') AS INTEGER),
      'ist', batch_record.qc_data->>'flexural_strength_28d',
      'toleranz', '≥ deklariert',
      'status', CASE 
        WHEN (batch_record.qc_data->>'flexural_strength_28d')::NUMERIC >= 
             CAST(REPLACE(recipe_record.flexural_strength_class, 'F', '') AS INTEGER)
        THEN 'PASS'
        ELSE 'FAIL'
      END
    ),
    'gesamt_status', CASE
      WHEN (batch_record.qc_data->>'compressive_strength_28d')::NUMERIC >= 
           CAST(REPLACE(recipe_record.compressive_strength_class, 'C', '') AS INTEGER)
           AND
           (batch_record.qc_data->>'flexural_strength_28d')::NUMERIC >= 
           CAST(REPLACE(recipe_record.flexural_strength_class, 'F', '') AS INTEGER)
      THEN 'KONFORM'
      ELSE 'NICHT KONFORM'
    END,
    'pruef_datum', CURRENT_TIMESTAMP
  );

  RETURN conformity_result;
END;
$$ LANGUAGE plpgsql;