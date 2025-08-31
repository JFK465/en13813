# 🔧 Migration ausführen - Schritt für Schritt

## Problem
Die alten Migrationen versuchen Objekte zu erstellen, die bereits existieren. Deshalb haben wir sie ins Archiv verschoben.

## Lösung 1: Via CLI (empfohlen)

```bash
# Die alten Migrationen wurden bereits archiviert nach:
# supabase/migrations/archive/

# Führe nur die neue sichere Migration aus:
npx supabase db push

# Gib dein Datenbank-Passwort ein wenn gefragt
# Das Passwort findest du unter:
# https://supabase.com/dashboard/project/ovcxtfsonjrtyiwdwqmc/settings/database
```

## Lösung 2: Via Supabase Dashboard (Alternative)

Falls die CLI weiterhin Probleme macht:

1. **Öffne Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/ovcxtfsonjrtyiwdwqmc/sql/new
   ```

2. **Kopiere den Inhalt von:**
   ```
   supabase/migrations/20250831_en13813_full_compliance_safe.sql
   ```

3. **Füge ihn in den SQL Editor ein und führe aus**

4. **Prüfe ob erfolgreich:**
   ```sql
   -- Prüfe ob neue Tabellen erstellt wurden
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'en13813_%'
   ORDER BY table_name;
   ```

## Lösung 3: Reset der Migration History (Notfall)

Falls die Migration immer noch fehlschlägt:

1. **Prüfe welche Migrationen bereits ausgeführt wurden:**
   ```sql
   SELECT name, executed_at 
   FROM supabase_migrations.schema_migrations 
   ORDER BY executed_at DESC;
   ```

2. **Markiere unsere Migration als ausgeführt (wenn sie teilweise erfolgreich war):**
   ```sql
   INSERT INTO supabase_migrations.schema_migrations (version, name, executed_at)
   VALUES (
     '20250831135100',
     '20250831_en13813_full_compliance_safe.sql',
     NOW()
   );
   ```

## Nach erfolgreicher Migration

### 1. Prüfe ob alle Tabellen existieren:

```sql
-- Sollte folgende Tabellen zeigen:
-- en13813_recipes (erweitert)
-- en13813_recipe_materials
-- en13813_itt_test_plans
-- en13813_fpc_control_plans
-- en13813_compliance_tasks
-- en13813_recipe_versions

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE 'en13813_%'
ORDER BY table_name;
```

### 2. Prüfe ob neue Spalten in en13813_recipes existieren:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'en13813_recipes' 
AND column_name IN (
  'wear_resistance_method',
  'wear_resistance_class',
  'intended_use',
  'surface_hardness_class',
  'bond_strength_class',
  'impact_resistance_class',
  'indentation_class',
  'heated_screed'
)
ORDER BY column_name;
```

### 3. Restauriere archivierte Migrationen (Optional)

Wenn du später die alten Migrationen für eine neue Umgebung brauchst:

```bash
# Kopiere zurück aus dem Archiv
cp supabase/migrations/archive/*.sql supabase/migrations/

# ABER: Bearbeite sie vorher und füge IF NOT EXISTS Checks hinzu!
```

## Erwartetes Ergebnis

Nach erfolgreicher Migration solltest du haben:

✅ 6 neue/erweiterte EN 13813 Tabellen
✅ 8+ neue Spalten in `en13813_recipes`
✅ RLS Policies für alle neuen Tabellen
✅ Indexes für Performance-Optimierung

## Troubleshooting

### Problem: "type already exists"
→ Die Migration versucht etwas zu erstellen, was schon da ist
→ Nutze die `_safe.sql` Version, die IF NOT EXISTS checks hat

### Problem: "permission denied"
→ Prüfe ob du die richtigen Credentials verwendest
→ Nutze das Dashboard als Alternative

### Problem: "relation does not exist"
→ Eine referenzierte Tabelle fehlt
→ Prüfe ob die Basis-Tabellen (tenants, profiles, en13813_recipes) existieren

## Status Check

```bash
# Zeige Migration Status
npx supabase migration list

# Zeige Datenbank Status
npx supabase db remote status
```

---

**Archivierte Migrationen:**
- `20240817000001_initial_schema.sql`
- `20240817000002_auth_setup_fixed.sql`
- `20240817000003_documents.sql`
- `20240817000004_workflows.sql`
- `20240817000005_reporting.sql`
- `20250117_en13813_base.sql`
- `20250830_en13813_complete.sql`
- `20250830_en13813_safe.sql`
- `20250831_missing_tables.sql`

**Aktive Migration:**
- `20250831_en13813_full_compliance_safe.sql` ✅