-- Prüfe die Struktur der vorhandenen Tabellen
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tenants'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Prüfe profiles Struktur
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Zeige vorhandene Tenants
SELECT * FROM tenants LIMIT 5;

-- Zeige vorhandene Profiles
SELECT * FROM profiles LIMIT 5;