# 🚀 MIGRATION JETZT AUSFÜHREN

## Dashboard-Link (direkt klicken):
👉 **[SQL Editor öffnen](https://supabase.com/dashboard/project/ovcxtfsonjrtyiwdwqmc/sql/new)**

## Schritt 1: SQL kopieren
Kopiere den **GESAMTEN** Inhalt der Datei:
```
supabase/migrations/20250831_en13813_full_compliance_safe.sql
```

## Schritt 2: Im Dashboard ausführen
1. Öffne den Link oben
2. Füge den kopierten SQL-Code ein
3. Klicke auf **"Run"** (grüner Button)

## Schritt 3: Erfolg prüfen
Nach der Ausführung, führe diese Prüfung aus:

```sql
-- PRÜFUNG 1: Neue Tabellen
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = t.table_name AND table_schema = 'public') as spalten_anzahl
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE 'en13813_%'
ORDER BY table_name;
```

Erwartete Tabellen:
- ✅ en13813_recipes (erweitert mit neuen Spalten)
- ✅ en13813_recipe_materials 
- ✅ en13813_itt_test_plans
- ✅ en13813_fpc_control_plans  
- ✅ en13813_compliance_tasks
- ✅ en13813_recipe_versions

```sql
-- PRÜFUNG 2: Neue Spalten in recipes
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

Sollte 8 neue Spalten zeigen!

## Bei Problemen:

### "relation already exists"
→ Ignorieren, die Migration hat IF NOT EXISTS checks

### "permission denied"  
→ Prüfe ob du als Admin eingeloggt bist

### Andere Fehler
→ Screenshot machen und mir zeigen

## Alternative: Supabase CLI Update

Falls du die CLI nutzen willst, update erst:
```bash
brew upgrade supabase/tap/supabase
# oder
npm update -g supabase
```

Dann nochmal versuchen:
```bash
npx supabase db push
```

---

**Status:** Die Migration ist sicher und kann mehrfach ausgeführt werden (idempotent).