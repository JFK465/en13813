-- ================================================
-- VERIFIZIERUNG DER EN 13813 TABELLEN UND FELDER
-- ================================================

-- 1. Prüfe ob alle EN13813 Tabellen existieren
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.tables t
LEFT JOIN information_schema.columns c USING (table_name)
WHERE table_name LIKE 'en13813_%'
    AND table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- 2. Zeige alle Spalten der Haupttabelle en13813_recipes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'en13813_recipes'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Zeige alle Check Constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'en13813_recipes'::regclass
    AND contype = 'c'
ORDER BY conname;

-- 4. Zeige alle Indizes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'en13813_recipes'
ORDER BY indexname;

-- 5. Prüfe RLS Status
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    COUNT(*) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.tablename LIKE 'en13813_%'
    AND t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- 6. Zusammenfassung
SELECT 'Zusammenfassung:' as info
UNION ALL
SELECT CONCAT('✅ ', COUNT(*), ' EN13813 Tabellen gefunden')
FROM information_schema.tables 
WHERE table_name LIKE 'en13813_%' AND table_schema = 'public'
UNION ALL
SELECT CONCAT('✅ ', COUNT(*), ' Spalten in en13813_recipes')
FROM information_schema.columns 
WHERE table_name = 'en13813_recipes' AND table_schema = 'public'
UNION ALL
SELECT CONCAT('✅ ', COUNT(*), ' Check Constraints definiert')
FROM pg_constraint 
WHERE conrelid = 'en13813_recipes'::regclass AND contype = 'c'
UNION ALL
SELECT CONCAT('✅ ', COUNT(*), ' Indizes erstellt')
FROM pg_indexes 
WHERE tablename = 'en13813_recipes';