-- ============================================================
-- Fix approved_by mit Foreign Key Constraint
-- Entfernt erst die FK-Constraint, dann ändert den Typ
-- ============================================================

-- 1. Entferne die Foreign Key Constraint
ALTER TABLE en13813_recipes
DROP CONSTRAINT IF EXISTS en13813_recipes_approved_by_fkey;

-- 2. Ändere den Spaltentyp zu VARCHAR
ALTER TABLE en13813_recipes
ALTER COLUMN approved_by TYPE VARCHAR(255) USING approved_by::text;

-- 3. Optional: Füge eine neue Spalte für die User-ID hinzu (falls benötigt)
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES auth.users(id);

-- 4. Stelle sicher, dass approved_at korrekt ist
ALTER TABLE en13813_recipes
ALTER COLUMN approved_at TYPE TIMESTAMPTZ USING approved_at::timestamptz;

-- 5. Kommentare für Klarheit
COMMENT ON COLUMN en13813_recipes.approved_by IS 'Name des Genehmigers (Text)';
COMMENT ON COLUMN en13813_recipes.approved_by_user_id IS 'User ID des Genehmigers (optional)';
COMMENT ON COLUMN en13813_recipes.approved_at IS 'Zeitstempel der Genehmigung';

-- Alternative Lösung: Behalte approved_by als UUID aber mache es optional
-- und füge approved_by_name als zusätzliches Feld hinzu:
/*
ALTER TABLE en13813_recipes
ADD COLUMN IF NOT EXISTS approved_by_name VARCHAR(255);

COMMENT ON COLUMN en13813_recipes.approved_by_name IS 'Name des Genehmigers (für Anzeige)';
COMMENT ON COLUMN en13813_recipes.approved_by IS 'User ID des Genehmigers (UUID)';
*/

-- Erfolg!
-- Nach dieser Migration sollte approved_by als Text funktionieren