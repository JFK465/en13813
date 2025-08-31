# RezepturFunk - EN 13813 Rezeptur-Implementierung

## Übersicht
Dieser Ordner enthält alle relevanten Dateien für die Rezepturerstellung nach EN 13813.

## Ordnerstruktur

```
RezepturFunk/
├── frontend/
│   ├── pages/
│   │   ├── recipes-list.tsx      # Rezeptur-Übersicht
│   │   └── recipes-new.tsx       # Neue Rezeptur anlegen
│   └── components/
│       └── RecipeForm.tsx        # Rezeptur-Formular Komponente
├── backend/
│   ├── api/
│   │   ├── recipes-route.ts      # API Route (GET, POST)
│   │   └── recipes-id-route.ts   # API Route (GET, PUT, DELETE by ID)
│   ├── services/
│   │   ├── recipe.service.ts     # Business Logic
│   │   └── index.ts              # Service Factory
│   └── types/
│       └── index.ts              # TypeScript Definitionen
├── database/
│   └── 20250830_en13813_complete.sql  # Datenbank Schema
├── StatusRezept.md               # Analyse der Defizite
└── REZEPTUR_STRUKTUR.md          # Dateistruktur Dokumentation
```

## Wichtige Dateien

### Frontend
- **RecipeForm.tsx**: Hauptformular mit Tabs für Grunddaten, Eigenschaften und zusätzliche Infos
- **recipes-list.tsx**: Verwaltungsseite mit Filter und Aktionen
- **recipes-new.tsx**: Seite zum Anlegen neuer Rezepturen

### Backend
- **recipe.service.ts**: Enthält alle CRUD-Operationen und Validierungslogik
- **types/index.ts**: TypeScript Interfaces für Recipe, TestReport, etc.

### Datenbank
- **20250830_en13813_complete.sql**: Komplettes Schema mit Tabellen, Indizes und RLS Policies

## Datenfluss
```
UI (React) → API Routes → RecipeService → Supabase → PostgreSQL
```

## Hauptfunktionen
- Rezeptur erstellen/bearbeiten/löschen
- EN 13813 Code-Generierung (CT-C25-F4)
- Validierung der Festigkeitsklassen
- Status-Management (draft/active/archived)
- Tenant-basierte Datenisolation

## Identifizierte Defizite (siehe StatusRezept.md)
- Fehlende Materialzusammensetzung
- Unvollständige Verschleißwiderstand-Methoden
- Keine Frischmörtel-Eigenschaften
- Fehlende Prüfnachweise (ITT)
- Keine WPK/FPC Implementation