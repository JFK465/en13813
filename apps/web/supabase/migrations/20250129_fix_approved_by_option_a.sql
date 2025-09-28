-- ============================================================
-- Option A: Foreign Key entfernen für maximale Flexibilität
-- Entfernt FK-Constraint und ändert approved_by zu VARCHAR
-- ============================================================

-- Schritt 1: Entferne die Foreign Key Constraint
ALTER TABLE en13813_recipes
DROP CONSTRAINT en13813_recipes_approved_by_fkey;

-- Schritt 2: Ändere den Spaltentyp zu VARCHAR
ALTER TABLE en13813_recipes
ALTER COLUMN approved_by TYPE VARCHAR(255) USING approved_by::text;

-- Schritt 3: Stelle sicher, dass approved_at korrekt ist
ALTER TABLE en13813_recipes
ALTER COLUMN approved_at TYPE TIMESTAMPTZ USING approved_at::timestamptz;

-- Schritt 4: Füge hilfreiche Kommentare hinzu
COMMENT ON COLUMN en13813_recipes.approved_by IS 'Name des Genehmigers als Text (keine User-Referenz mehr)';
COMMENT ON COLUMN en13813_recipes.approved_at IS 'Zeitstempel der Genehmigung';

-- ============================================================
-- FERTIG!
-- approved_by akzeptiert jetzt beliebige Text-Eingaben
-- z.B. "Max Mustermann", "QM Abteilung", "Externe Prüfstelle"
-- ============================================================