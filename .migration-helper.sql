-- Test connection and check existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'en13813_%'
ORDER BY table_name;
