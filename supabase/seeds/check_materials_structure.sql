-- Prüfe die Struktur der en13813_recipe_materials Tabelle
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'en13813_recipe_materials'
    AND table_schema = 'public'
ORDER BY ordinal_position;