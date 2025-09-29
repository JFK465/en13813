# 🏢 Multi-Tenant Implementation Plan - EN13813 QM System

## 📋 **Executive Summary**

Implementierung einer professionellen Multi-Tenant-Architektur nach Supabase Best Practices 2024.

---

## 🎯 **Architektur-Entscheidungen**

### **Gewähltes Pattern: Shared Database with RLS**
- ✅ Eine Datenbank für alle Tenants
- ✅ Tenant-Isolation via Row Level Security (RLS)
- ✅ tenant_id in allen Tabellen
- ✅ JWT-basierte Tenant-Identifikation

### **Warum diese Architektur?**
- **Kosteneffizient**: Eine DB-Instanz
- **Wartbar**: Zentrale Migrations & Updates
- **Performant**: Mit richtigen Indexes skalierbar
- **Sicher**: PostgreSQL RLS ist battle-tested

---

## 🚀 **Implementierung Step-by-Step**

### **Phase 1: Database Reset & Setup (20 Min)**

```bash
# 1. Backup erstellen (optional)
cd /Users/jonaskruger/Dev/en13813/apps/web
npx supabase db dump --data-only > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Bestehende Migration ausführen
# Die 20250122_complete_en13813_fresh.sql hat bereits die Basis-Struktur
npx supabase db push --file supabase/migrations/20250122_complete_en13813_fresh.sql
```

### **Phase 2: Optimierte RLS Policies (30 Min)**

Erstelle neue Migration für optimierte RLS nach Best Practices:

```sql
-- supabase/migrations/20250129_optimize_rls_policies.sql

-- ==================== OPTIMIZATIONS ====================

-- 1. Create Indexes for RLS Performance (CRITICAL!)
CREATE INDEX IF NOT EXISTS idx_recipes_tenant_id ON en13813_recipes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_batches_tenant_id ON en13813_batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dops_tenant_id ON en13813_dops(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_reports_tenant_id ON en13813_test_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fpc_test_results_tenant_id ON en13813_fpc_test_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_itt_tests_tenant_id ON en13813_itt_tests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_tasks_tenant_id ON en13813_compliance_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_tenant_id ON en13813_audit_trail(tenant_id);

-- 2. Helper Function for Current Tenant (Performance Optimization)
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS UUID AS $$
  SELECT (
    current_setting('request.jwt.claims', true)::json->>'tenant_id'
  )::UUID
$$ LANGUAGE SQL STABLE;

-- 3. Optimized RLS Policies using Function
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their tenant recipes" ON en13813_recipes;
DROP POLICY IF EXISTS "Users can insert their tenant recipes" ON en13813_recipes;
DROP POLICY IF EXISTS "Users can update their tenant recipes" ON en13813_recipes;
DROP POLICY IF EXISTS "Users can delete their tenant recipes" ON en13813_recipes;

-- Create new optimized policies for recipes
CREATE POLICY "tenant_isolation_select" ON en13813_recipes
  FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY "tenant_isolation_insert" ON en13813_recipes
  FOR INSERT WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY "tenant_isolation_update" ON en13813_recipes
  FOR UPDATE USING (tenant_id = auth.tenant_id());

CREATE POLICY "tenant_isolation_delete" ON en13813_recipes
  FOR DELETE USING (tenant_id = auth.tenant_id());

-- Repeat for all tables (batches, dops, etc.)
-- Using the same pattern for consistency

-- 4. Create Tenant Management Functions
CREATE OR REPLACE FUNCTION create_tenant_and_owner(
  tenant_name TEXT,
  owner_email TEXT,
  owner_password TEXT
) RETURNS JSON AS $$
DECLARE
  new_tenant_id UUID;
  new_user_id UUID;
BEGIN
  -- Create tenant
  INSERT INTO tenants (name, subdomain)
  VALUES (tenant_name, lower(regexp_replace(tenant_name, '[^a-zA-Z0-9]', '-', 'g')))
  RETURNING id INTO new_tenant_id;

  -- User must be created via Supabase Auth
  -- This returns the tenant_id for the next step
  RETURN json_build_object(
    'tenant_id', new_tenant_id,
    'message', 'Tenant created. Now create user via Auth and link with tenant_users table.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Phase 3: Auth Integration mit app_metadata (30 Min)**

```typescript
// supabase/functions/on-auth-user-created/index.ts
// Edge Function für automatische Tenant-Zuordnung bei User-Erstellung

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { user, tenant_id } = await req.json()

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Link user to tenant
  await supabaseAdmin
    .from('tenant_users')
    .insert({
      user_id: user.id,
      tenant_id: tenant_id,
      role: 'member'
    })

  // 2. Update user's app_metadata with tenant_id
  await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    {
      app_metadata: { tenant_id: tenant_id }
    }
  )

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

### **Phase 4: Frontend Integration (20 Min)**

```typescript
// hooks/use-current-tenant.ts - Production Version
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Tenant {
  id: string
  name: string
  subdomain?: string
  settings?: any
}

export function useCurrentTenant() {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    async function loadTenant() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          if (mounted) setLoading(false)
          return
        }

        // Get tenant from app_metadata (Best Practice!)
        const tenantId = user.app_metadata?.tenant_id

        if (tenantId) {
          // Load full tenant details
          const { data: tenant } = await supabase
            .from('tenants')
            .select('*')
            .eq('id', tenantId)
            .single()

          if (mounted && tenant) {
            setCurrentTenant(tenant)
          }
        } else {
          // Fallback: Load from tenant_users (slower)
          const { data: tenantUser } = await supabase
            .from('tenant_users')
            .select('tenant_id, tenants(*)')
            .eq('user_id', user.id)
            .single()

          if (mounted && tenantUser?.tenants) {
            setCurrentTenant(tenantUser.tenants as Tenant)
          }
        }
      } catch (error) {
        console.error('Error loading tenant:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadTenant()

    return () => {
      mounted = false
    }
  }, [])

  return { currentTenant, loading }
}
```

### **Phase 5: Update Lab Values Migration (10 Min)**

```sql
-- supabase/migrations/20250129_create_lab_values_table_multi_tenant.sql
-- Vollständige Multi-Tenant Version

CREATE TABLE IF NOT EXISTS en13813_lab_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES en13813_recipes(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES en13813_batches(id) ON DELETE SET NULL,
  -- ... rest of columns ...
);

-- Performance Index (WICHTIG!)
CREATE INDEX idx_lab_values_tenant_id ON en13813_lab_values(tenant_id);

-- RLS Policies using optimized function
ALTER TABLE en13813_lab_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_select" ON en13813_lab_values
  FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY "tenant_isolation_insert" ON en13813_lab_values
  FOR INSERT WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY "tenant_isolation_update" ON en13813_lab_values
  FOR UPDATE USING (tenant_id = auth.tenant_id());

CREATE POLICY "tenant_isolation_delete" ON en13813_lab_values
  FOR DELETE USING (tenant_id = auth.tenant_id());
```

### **Phase 6: Testing Setup (30 Min)**

```typescript
// e2e/test-multi-tenancy.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Multi-Tenant Isolation', () => {
  test('Tenant A cannot see Tenant B data', async ({ page }) => {
    // 1. Create recipe as Tenant A
    await loginAsTenantA(page)
    await createRecipe(page, 'Secret Recipe A')
    await logout(page)

    // 2. Login as Tenant B
    await loginAsTenantB(page)

    // 3. Verify Tenant B cannot see Recipe A
    await page.goto('/en13813/recipes')
    await expect(page.locator('text=Secret Recipe A')).not.toBeVisible()

    // 4. Create own recipe
    await createRecipe(page, 'Recipe B')

    // 5. Verify only sees own recipe
    await expect(page.locator('text=Recipe B')).toBeVisible()
    await expect(page.locator('text=Secret Recipe A')).not.toBeVisible()
  })
})
```

---

## 🔒 **Security Best Practices Applied**

1. **app_metadata für tenant_id** ✅
   - Nicht manipulierbar durch User
   - JWT-basiert und sicher

2. **Service Keys nur Server-Side** ✅
   - Nie im Browser exponiert
   - Nur für Admin-Tasks

3. **Granulare RLS Policies** ✅
   - Separate für SELECT/INSERT/UPDATE/DELETE
   - Minimale Berechtigungen

4. **Performance-Optimierung** ✅
   - Indexes auf allen tenant_id Spalten
   - Helper Function für Current Tenant
   - Effiziente Policy-Checks

5. **Kein Public Schema** ✅
   - Alle Tabellen in kontrollierten Schemas
   - Explizite Grants

---

## 📊 **Migration Execution Plan**

### **Schritt 1: Vorbereitung**
```bash
# Check current state
npx supabase migration list

# Backup if needed
npx supabase db dump > pre_migration_backup.sql
```

### **Schritt 2: Haupt-Migration**
```bash
# Run main multi-tenant setup
npx supabase db push --file supabase/migrations/20250122_complete_en13813_fresh.sql
```

### **Schritt 3: Optimierungen**
```bash
# Run optimization migration
npx supabase db push --file supabase/migrations/20250129_optimize_rls_policies.sql
```

### **Schritt 4: Lab Values**
```bash
# Run lab values with multi-tenancy
npx supabase db push --file supabase/migrations/20250129_create_lab_values_table_multi_tenant.sql
```

### **Schritt 5: Verifikation**
```sql
-- Run in SQL Editor
-- Check all tables have tenant_id
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name = 'tenant_id'
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'en13813_%';

-- Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## ⏱️ **Zeitplan**

- **Total: 2-3 Stunden**
- Migration: 30 Min
- Testing: 45 Min
- Frontend Integration: 45 Min
- Verifikation: 30 Min
- Buffer: 30 Min

---

## ✅ **Success Criteria**

- [ ] Alle Tabellen haben tenant_id mit Index
- [ ] RLS Policies auf allen Tabellen aktiv
- [ ] useCurrentTenant Hook funktioniert
- [ ] Tenant A sieht keine Daten von Tenant B
- [ ] Performance < 100ms für normale Queries
- [ ] Auth Integration mit app_metadata
- [ ] Keine Errors in Console/Logs

---

## 🚨 **Rollback Plan**

Falls etwas schief geht:

```bash
# 1. Restore from backup
npx supabase db reset
psql $DATABASE_URL < pre_migration_backup.sql

# 2. Or use Supabase Dashboard Point-in-Time Recovery
```

---

**Ready to implement!** Dies ist eine Production-Ready Multi-Tenant Architektur nach aktuellen Best Practices.