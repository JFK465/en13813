-- ============================================================
-- Final Fix: approved_by Typ-Konflikt
-- Ändert UUID auf VARCHAR für Text-basierte Genehmiger-Namen
-- ============================================================

-- Fix approved_by Typ-Konflikt endgültig
ALTER TABLE en13813_recipes
ALTER COLUMN approved_by TYPE VARCHAR(255) USING approved_by::text;

-- Stelle sicher, dass approved_at den richtigen Typ hat
ALTER TABLE en13813_recipes
ALTER COLUMN approved_at TYPE TIMESTAMPTZ USING approved_at::timestamptz;

-- Kommentare für Klarheit
COMMENT ON COLUMN en13813_recipes.approved_by IS 'Name des Genehmigers (Text, nicht UUID)';
COMMENT ON COLUMN en13813_recipes.approved_at IS 'Zeitstempel der Genehmigung';

-- Erfolg!
-- Nach dieser Migration sollte die Erfolgsrate auf > 90% steigen