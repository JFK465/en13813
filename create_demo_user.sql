-- ================================================
-- ERSTELLE DEMO USER IN SUPABASE
-- Führen Sie dies im Supabase SQL Editor aus
-- ================================================

-- 1. Erstelle den Auth User (nur möglich mit Service Role oder direkt im Dashboard)
-- HINWEIS: Sie müssen den User manuell im Supabase Dashboard unter Authentication > Users erstellen:
-- Email: demo@example.com
-- Password: DemoPassword123!

-- 2. Nachdem der Auth User erstellt wurde, führen Sie dieses Script aus:

-- Hole die User ID (ersetzen Sie diese mit der tatsächlichen ID aus dem Dashboard)
DO $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
BEGIN
  -- Hole den Demo Tenant
  SELECT id INTO v_tenant_id 
  FROM tenants 
  WHERE slug = 'demo' 
  LIMIT 1;
  
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'Demo Tenant nicht gefunden!';
    RETURN;
  END IF;
  
  -- Hole die User ID aus auth.users (ersetzen Sie die Email mit der tatsächlichen)
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'demo@example.com' 
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User demo@example.com nicht in auth.users gefunden!';
    RAISE NOTICE 'Bitte erstellen Sie den User erst im Dashboard unter Authentication > Users';
    RETURN;
  END IF;
  
  -- Erstelle oder aktualisiere das Profile
  INSERT INTO profiles (
    id,
    email,
    full_name,
    tenant_id,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'demo@example.com',
    'Demo User',
    v_tenant_id,
    'admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    tenant_id = v_tenant_id,
    role = 'admin',
    updated_at = NOW();
  
  RAISE NOTICE 'Profile für demo@example.com erfolgreich erstellt/aktualisiert!';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Tenant ID: %', v_tenant_id;
END $$;

-- 3. Verifiziere die Rezepturen für den Demo Tenant
SELECT 
  r.recipe_code,
  r.name,
  r.type,
  r.status,
  t.company_name as tenant_name
FROM en13813_recipes r
JOIN tenants t ON r.tenant_id = t.id
WHERE t.slug = 'demo'
ORDER BY r.created_at DESC;

-- 4. Zeige Profile Info
SELECT 
  p.email,
  p.full_name,
  p.role,
  t.company_name as tenant_name,
  t.slug as tenant_slug
FROM profiles p
JOIN tenants t ON p.tenant_id = t.id
WHERE p.email = 'demo@example.com';