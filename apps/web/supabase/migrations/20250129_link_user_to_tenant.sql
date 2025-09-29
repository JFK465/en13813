-- ==========================================
-- LINK USER TO DEMO TENANT
-- ==========================================
-- Führe dieses Script aus, um deinen User mit dem Demo Tenant zu verknüpfen

-- Schritt 1: Finde deine User ID und Email
-- ==========================================
SELECT id, email
FROM auth.users
LIMIT 5;

-- Kopiere die ID des Users, den du verknüpfen möchtest
-- Notiere dir die User ID (z.B. 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')

-- ==========================================
-- Schritt 2: Verknüpfe User mit Demo Tenant
-- ==========================================
-- WICHTIG: Ersetze 'YOUR_USER_ID_HERE' mit der tatsächlichen User ID aus Schritt 1

/*
INSERT INTO tenant_users (user_id, tenant_id, role)
VALUES (
  'YOUR_USER_ID_HERE',  -- <-- HIER die User ID einfügen!
  '123e4567-e89b-12d3-a456-426614174000',  -- Demo Tenant ID
  'owner'  -- Rolle: owner, admin, member oder viewer
)
ON CONFLICT (user_id) DO UPDATE
SET
  tenant_id = EXCLUDED.tenant_id,
  role = EXCLUDED.role,
  updated_at = NOW();
*/

-- ==========================================
-- Alternative: Automatisch den ersten User verknüpfen
-- ==========================================
-- Wenn du einfach den ersten User automatisch verknüpfen willst,
-- kommentiere den Block oben aus und nutze diesen:

DO $$
DECLARE
  first_user_id UUID;
  first_user_email TEXT;
BEGIN
  -- Hole den ersten User
  SELECT id, email INTO first_user_id, first_user_email
  FROM auth.users
  LIMIT 1;

  IF first_user_id IS NOT NULL THEN
    -- Verknüpfe mit Demo Tenant
    INSERT INTO tenant_users (user_id, tenant_id, role)
    VALUES (
      first_user_id,
      '123e4567-e89b-12d3-a456-426614174000',
      'owner'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      updated_at = NOW();

    RAISE NOTICE 'User % wurde erfolgreich mit Demo Tenant verknüpft als owner', first_user_email;
  ELSE
    RAISE NOTICE 'Keine User in der Datenbank gefunden!';
  END IF;
END $$;

-- ==========================================
-- Schritt 3: Verifiziere die Verknüpfung
-- ==========================================
-- Führe diese Query aus um zu prüfen ob alles funktioniert hat:

SELECT
  u.email,
  tu.role,
  t.name as tenant_name,
  t.slug as tenant_slug,
  t.status as tenant_status
FROM tenant_users tu
JOIN auth.users u ON u.id = tu.user_id
JOIN tenants t ON t.id = tu.tenant_id
WHERE tu.tenant_id = '123e4567-e89b-12d3-a456-426614174000';

-- ==========================================
-- Optional: Prüfe ob die Funktion get_current_tenant() funktioniert
-- ==========================================
-- Dies zeigt den aktuellen Tenant für den eingeloggten User:

SELECT * FROM get_current_tenant();

-- Wenn diese Query einen Fehler wirft, bist du nicht eingeloggt
-- oder der User ist noch nicht mit einem Tenant verknüpft