# Rezeptur-Implementierung: Dateistruktur und Zusammenhänge

## Übersicht der Rezeptur-Dateien

### Frontend (UI/UX)

#### 1. **Seiten (Pages)**
- **`/apps/web/app/(auth)/en13813/recipes/page.tsx`**
  - Hauptseite mit Rezeptur-Liste
  - Filterung nach Typ, Status und Suche
  - Aktionen: Bearbeiten, Kopieren, Löschen, DoP erstellen
  
- **`/apps/web/app/(auth)/en13813/recipes/new/page.tsx`**
  - Formular für neue Rezeptur
  - Verwendet `recipeSchema` für Validierung
  - Direkte Integration mit RecipeService
  
- **`/apps/web/app/(auth)/en13813/recipes/import/page.tsx`**
  - Import-Seite (noch zu prüfen)

#### 2. **Komponenten**
- **`/apps/web/components/en13813/RecipeForm.tsx`**
  - Wiederverwendbares Rezeptur-Formular
  - Tabs: Grunddaten, Eigenschaften, Zusätzlich
  - Live-Preview des EN-13813-Codes
  - Validierung mit Zod-Schema

### Backend (API & Services)

#### 3. **API Routes**
- **`/apps/web/app/api/en13813/recipes/route.ts`**
  - GET: Liste aller Rezepturen mit Filterung
  - POST: Neue Rezeptur erstellen
  - Automatische Tenant-Zuordnung
  
- **`/apps/web/app/api/en13813/recipes/[id]/route.ts`**
  - GET: Einzelne Rezeptur abrufen
  - PUT: Rezeptur aktualisieren
  - DELETE: Rezeptur löschen
  - Automatische Code-Regenerierung bei Änderungen

#### 4. **Services**
- **`/apps/web/modules/en13813/services/recipe.service.ts`**
  - Hauptlogik für Rezeptur-Operationen
  - CRUD-Operationen
  - Validierung und Aktivierung
  - Duplikation von Rezepturen
  
- **`/apps/web/modules/en13813/services/index.ts`**
  - Service Factory
  - Erstellt alle EN13813 Services
  - Zentrale Instanziierung

#### 5. **Type Definitions**
- **`/apps/web/modules/en13813/types/index.ts`**
  - TypeScript Interfaces für alle Entitäten
  - Recipe, TestReport, Batch, DoP, etc.
  - Filter- und Parameter-Typen

### Datenbank

#### 6. **Migrations**
- **`/supabase/migrations/20250830_en13813_complete.sql`**
  - Haupt-Schema für EN13813
  - Tabelle: `en13813_recipes`
  - Indizes und RLS Policies
  - Trigger für updated_at

## Datenfluss

```
Benutzer-Aktion (UI)
        ↓
    Page/Component
        ↓
    API Route (/api/en13813/recipes)
        ↓
    RecipeService
        ↓
    Supabase Database
        ↓
    PostgreSQL (en13813_recipes)
```

## Tabellen-Schema: en13813_recipes

```sql
- id (UUID, Primary Key)
- tenant_id (UUID, Foreign Key)
- recipe_code (TEXT, Unique per tenant)
- name (TEXT)
- description (TEXT)
- estrich_type (CT/CA/MA/AS/SR)
- compressive_strength (TEXT, z.B. C25)
- flexural_strength (TEXT, z.B. F4)
- wear_resistance (TEXT, optional)
- hardness (TEXT, optional)
- fire_class (TEXT, default 'A1fl')
- additives (JSONB)
- mixing_ratio (JSONB)
- status (draft/active/archived)
- validation_errors (JSONB)
- is_validated (BOOLEAN)
- created_at/updated_at (TIMESTAMPTZ)
```

## Formulare und Validierung

### RecipeForm Felder:
1. **Grunddaten**
   - Name (Pflichtfeld)
   - Beschreibung (optional)
   - Estrichtyp (CT/CA/MA/AS/SR)
   - Status (draft/active/archived)

2. **Eigenschaften**
   - Druckfestigkeit (C5-C80)
   - Biegezugfestigkeit (F1-F50)
   - Verschleißwiderstand (A1-A22, optional)
   - Oberflächenhärte (Freitext, optional)
   - Brandklasse (A1fl-Ffl)

3. **Zusätzlich**
   - Min. Schichtdicke (mm)
   - Max. Schichtdicke (mm)

### Validierung:
- Frontend: Zod-Schema mit Regex-Patterns
- Backend: RecipeService.validate()
- Datenbank: CHECK Constraints

## Service-Funktionen

### RecipeService Methoden:
- `list(filter)` - Gefilterte Liste
- `getById(id)` - Einzelne Rezeptur
- `create(recipe)` - Neue Rezeptur
- `update(id, updates)` - Aktualisierung
- `delete(id)` - Löschen (prüft DoP-Verwendung)
- `validate(id)` - Normkonformität prüfen
- `activate(id)` - Status auf aktiv setzen
- `archive(id)` - Archivieren
- `duplicate(id, newName)` - Kopie erstellen

## Automatisierungen

1. **Recipe Code Generation**
   - Format: `{TYPE}-{COMPRESSIVE}-{FLEXURAL}[-{WEAR}]`
   - Beispiel: `CT-C25-F4-A12`

2. **Tenant-Zuordnung**
   - Automatisch bei Erstellung
   - RLS Policies für Datenisolation

3. **Validierung**
   - Pflichtfelder-Prüfung
   - Klassenwerte-Validierung
   - Status-Management

## Integration mit anderen Modulen

- **DoP-Erstellung**: Rezepturen werden in DoPs referenziert
- **Test Reports**: Verknüpfung über recipe_id
- **Batches**: Produktionschargen basieren auf Rezepturen
- **Compliance Tasks**: Automatische Erinnerungen für Rezeptur-Validierung

## Duplikate/Legacy-Dateien

Folgende Dateien scheinen Duplikate oder Legacy zu sein:
- `/DOPErstellung/backend/services/recipe.service.ts`
- `/modules/en13813/components/RecipeForm.tsx`
- `/modules/en13813/services/recipe.service.ts`

Diese sollten geprüft und ggf. entfernt werden.