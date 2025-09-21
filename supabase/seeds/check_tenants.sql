-- Prüfe ob tenants Tabelle existiert und welche Daten vorhanden sind
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'tenants'
) as tenants_exists;

-- Falls ja, zeige vorhandene Tenants
SELECT * FROM tenants LIMIT 5;

-- Zeige die Struktur
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tenants'
ORDER BY ordinal_position;

-- Prüfe ob es einen Demo-Tenant gibt
SELECT * FROM tenants WHERE slug LIKE '%demo%' OR id::text LIKE '%demo%';