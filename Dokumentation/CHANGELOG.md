# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Vollständige EN 13813 Konformitätsprüfung
- DoP-Generator mit CPR 305/2011 Compliance
- FPC (Factory Production Control) Integration
- Chargenrückverfolgung und Statistik
- Multi-Tenant Unterstützung
- Laborwerte-Management
- Kalibrierungsverwaltung

## [1.0.0] - 2025-01-02

### Added
- Initiale Version des EN 13813 Compliance Systems
- Rezepturverwaltung mit automatischer Normbezeichnung
- ITT (Initial Type Testing) Prüfplanverwaltung
- Leistungserklärung (DoP) Generator
- CE-Kennzeichnung Generator
- Benutzer- und Rollenverwaltung
- Supabase Integration mit RLS
- PDF-Export für alle Dokumente

### Changed
- Migration von lokaler SQLite zu Supabase PostgreSQL
- Upgrade auf Next.js 14 mit App Router
- Implementierung von React Server Components

### Security
- Row Level Security (RLS) für alle Tabellen
- JWT-basierte Authentifizierung
- Verschlüsselte Datenspeicherung

## [0.9.0] - 2024-12-15

### Added
- Beta-Version mit Grundfunktionalität
- Einfache Rezepturverwaltung
- Basis DoP-Generierung
- Prototyp UI mit shadcn/ui

### Changed
- Wechsel von Material-UI zu shadcn/ui
- Vereinfachte Datenstruktur

### Fixed
- Berechnungsfehler bei Normbezeichnungen
- UI-Responsiveness auf mobilen Geräten

## [0.8.0] - 2024-11-01

### Added
- Proof of Concept
- Grundlegende CRUD-Operationen
- Erste EN 13813 Berechnungen

### Known Issues
- Performance-Probleme bei großen Datenmengen
- Fehlende Validierung für einige Eingabefelder

---

## Upgrade-Notizen

### Von 0.9.0 auf 1.0.0

#### Datenbank-Migration erforderlich
```bash
# Backup erstellen
pg_dump old_database > backup.sql

# Neue Migrationen ausführen
npx supabase migration up

# Demo-Daten importieren (optional)
NODE_PATH=apps/web/node_modules node scripts/create-demo-data.js
```

#### Breaking Changes
- API-Endpunkte haben sich geändert (v1 -> v2)
- Authentifizierung nutzt jetzt Supabase Auth
- Neue Umgebungsvariablen erforderlich (siehe .env.example)

#### Neue Dependencies
```bash
pnpm install
```

### Von 0.8.0 auf 0.9.0

#### UI-Migration
- Alle Material-UI Komponenten wurden durch shadcn/ui ersetzt
- CSS-Klassen haben sich geändert
- Theme-Konfiguration in tailwind.config.js

---

## Release-Prozess

1. Version in package.json aktualisieren
2. CHANGELOG.md aktualisieren
3. Commit mit Tag erstellen:
   ```bash
   git commit -m "chore: Release v1.0.0"
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin main --tags
   ```
4. GitHub Release erstellen
5. Deployment auf Production triggern

## Support

Für Migrations-Unterstützung siehe [SETUP.md](./SETUP.md) oder kontaktieren Sie das Development-Team.