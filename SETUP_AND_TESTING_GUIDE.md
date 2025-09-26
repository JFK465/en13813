# EN13813 Compliance-SaaS Setup & Testing Guide

Diese Anleitung führt Sie Schritt für Schritt durch die Einrichtung und das Testen der EN13813 Compliance-SaaS Anwendung.

## Voraussetzungen

Stellen Sie sicher, dass folgende Software installiert ist:

- **Node.js** 18.0.0 oder höher
- **pnpm** 8.0.0 oder höher
- **Docker Desktop** (für lokale Supabase-Instanz)
- **Supabase CLI**

### Installation der Voraussetzungen

```bash
# Node.js installieren (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# pnpm installieren
npm install -g pnpm@8.14.0

# Supabase CLI installieren
brew install supabase/tap/supabase

# Docker Desktop
# Download von: https://www.docker.com/products/docker-desktop/
```

## 1. Projekt Setup

### 1.1 Repository klonen und Dependencies installieren

```bash
# Falls noch nicht geklont
git clone [repository-url]
cd compliance-saas

# Dependencies installieren
pnpm install
```

### 1.2 Umgebungsvariablen konfigurieren

```bash
# Hauptkonfiguration kopieren
cp .env.example .env.local

# Web-App Konfiguration kopieren
cp apps/web/.env.example apps/web/.env.local
```

### 1.3 .env.local anpassen

Bearbeiten Sie die `.env.local` Datei mit Ihren lokalen Supabase-Werten:

```env
# Die Werte erhalten Sie nach dem Start von Supabase (siehe Schritt 2)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Für lokale Entwicklung
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional für E-Mail-Tests (Resend API)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Redis für Rate Limiting (optional für lokale Entwicklung)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## 2. Datenbank Setup (Supabase)

### 2.1 Supabase lokal starten

```bash
# Docker muss laufen!
pnpm db:start

# Oder direkt:
supabase start
```

Nach erfolgreichem Start erhalten Sie die lokalen Zugangsdaten:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: <YOUR-ANON-KEY-WILL-BE-DISPLAYED-HERE>
service_role key: <YOUR-SERVICE-ROLE-KEY-WILL-BE-DISPLAYED-HERE>
```

**Kopieren Sie diese Werte in Ihre .env.local Datei!**

### 2.2 Datenbank-Migrationen ausführen

```bash
# Alle Migrationen ausführen
pnpm db:push

# Oder einzeln:
supabase db push

# Status prüfen
supabase migration list
```

### 2.3 Seed-Daten laden (optional)

```bash
# Testdaten laden
supabase db seed

# Oder manuell:
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/seed.sql
```

### 2.4 Datenbank-Typen generieren

```bash
# TypeScript-Typen aus der Datenbank generieren
pnpm gen:types
```

## 3. Anwendung starten

### 3.1 Entwicklungsserver starten

```bash
# Im Hauptverzeichnis
pnpm dev

# Die Anwendung läuft dann auf:
# - Web App: http://localhost:3000
# - Supabase Studio: http://localhost:54323
# - Inbucket (Email Testing): http://localhost:54324
```

### 3.2 Erste Anmeldung

1. Öffnen Sie http://localhost:3000
2. Klicken Sie auf "Registrieren"
3. Erstellen Sie einen neuen Account
4. Bestätigen Sie die E-Mail (siehe Inbucket unter http://localhost:54324)

## 4. Features testen

### 4.1 EN13813 Modul testen

```bash
# 1. Als Admin einloggen
# 2. Navigieren Sie zu: http://localhost:3000/en13813

# Testen Sie folgende Features:
- Rezepturen erstellen
- CSV-Import von Rezepturen
- Prüfberichte generieren
- DoP (Declaration of Performance) erstellen
```

### 4.2 Core Features testen

**Dokumenten-Management:**
```bash
# Navigieren zu: http://localhost:3000/documents
- PDF hochladen
- Dokumente kategorisieren
- Versionierung testen
```

**Workflow-System:**
```bash
# Navigieren zu: http://localhost:3000/workflows
- Neuen Workflow erstellen
- Schritte hinzufügen
- Workflow ausführen
```

**Kalender & Deadlines:**
```bash
# Navigieren zu: http://localhost:3000/calendar
- Termin erstellen
- Deadline setzen
- Erinnerungen konfigurieren
```

**Benachrichtigungen:**
```bash
# Navigieren zu: http://localhost:3000/notifications
- Einstellungen anpassen
- Test-Benachrichtigung senden
```

## 5. Automatisierte Tests ausführen

### 5.1 Unit Tests

```bash
# Alle Unit Tests
pnpm test

# Mit Coverage
pnpm test:coverage

# Im Watch-Modus
pnpm test:watch

# Spezifische Tests
pnpm test -- --testNamePattern="CalendarService"
```

### 5.2 Integration Tests

```bash
# API Integration Tests
cd apps/web
npm run test:integration

# Oder spezifisch:
npm run test -- --selectProjects=server
```

### 5.3 E2E Tests

```bash
# Playwright installieren (einmalig)
cd apps/web
npx playwright install

# E2E Tests ausführen
npm run test:e2e

# Mit UI (empfohlen für Debugging)
npm run test:e2e:ui

# Nur spezifische Tests
npm run test:e2e -- --grep "EN13813"
```

### 5.4 Test Runner verwenden

```bash
cd apps/web

# Unit Tests mit Test Runner
node scripts/test-runner.js unit

# E2E Tests mit UI
node scripts/test-runner.js e2e --ui

# Coverage Report
node scripts/test-runner.js coverage

# Spezifisches Pattern
node scripts/test-runner.js unit --pattern "calendar"
```

## 6. API testen

### 6.1 Swagger UI

```bash
# Öffnen Sie: http://localhost:3000/api/docs/swagger
# Hier können Sie alle API-Endpoints interaktiv testen
```

### 6.2 cURL Beispiele

```bash
# Health Check
curl http://localhost:3000/api/v1/health

# Dokumente abrufen (mit Auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/documents

# EN13813 Rezepturen
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/en13813/recipes
```

### 6.3 Postman Collection

Eine Postman Collection ist verfügbar unter: `docs/postman/compliance-saas.json`

## 7. Debugging & Troubleshooting

### 7.1 Logs prüfen

```bash
# Supabase Logs
supabase logs

# Next.js Server Logs
# Werden direkt im Terminal angezeigt

# Browser Console für Frontend-Fehler
# F12 → Console
```

### 7.2 Datenbank inspizieren

```bash
# Supabase Studio öffnen
open http://localhost:54323

# Oder direkt per SQL
psql postgresql://postgres:postgres@localhost:54322/postgres
```

### 7.3 Häufige Probleme

**Problem: "NEXT_PUBLIC_SUPABASE_URL is not defined"**
```bash
# Lösung: .env.local prüfen und Server neu starten
pnpm dev
```

**Problem: "Cannot connect to Supabase"**
```bash
# Lösung: Docker und Supabase prüfen
docker ps
supabase status
supabase start
```

**Problem: "Type errors after database changes"**
```bash
# Lösung: Typen neu generieren
pnpm gen:types
```

**Problem: "Tests schlagen fehl"**
```bash
# Lösung: Test-Datenbank zurücksetzen
cd apps/web
npm run test -- --clearCache
```

## 8. Entwicklungs-Workflow

### 8.1 Neue Features entwickeln

```bash
# 1. Feature Branch erstellen
git checkout -b feature/neue-funktion

# 2. Migration erstellen (falls DB-Änderungen)
pnpm db:migrate neue_funktion

# 3. Code entwickeln
# 4. Tests schreiben
# 5. Typen generieren
pnpm gen:types

# 6. Tests ausführen
pnpm test
pnpm test:e2e

# 7. Commit & Push
git add .
git commit -m "feat: Neue Funktion implementiert"
git push origin feature/neue-funktion
```

### 8.2 Code-Qualität sicherstellen

```bash
# Linting
pnpm lint

# Type Checking
pnpm typecheck

# Formatierung
pnpm format

# Alles auf einmal
pnpm lint && pnpm typecheck && pnpm test
```

## 9. Performance Testing

### 9.1 Lighthouse

```bash
# Next.js Build erstellen
pnpm build
pnpm start

# Chrome DevTools → Lighthouse
# Oder CLI:
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

### 9.2 Bundle-Analyse

```bash
cd apps/web
npm run build
npm run analyze
```

## 10. Deployment Vorbereitung

### 10.1 Production Build testen

```bash
# Build erstellen
pnpm build

# Production Server starten
pnpm start

# Auf http://localhost:3000 testen
```

### 10.2 Environment Check

```bash
# Alle notwendigen Umgebungsvariablen prüfen
node -e "
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];
required.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing: ${key}`);
  } else {
    console.log(`✅ Found: ${key}`);
  }
});
"
```

## Nützliche Befehle - Übersicht

```bash
# Entwicklung
pnpm dev                    # Entwicklungsserver starten
pnpm build                  # Production Build
pnpm start                  # Production Server

# Datenbank
pnpm db:start              # Supabase starten
pnpm db:stop               # Supabase stoppen
pnpm db:reset              # Datenbank zurücksetzen
pnpm db:push               # Migrationen ausführen
pnpm gen:types             # TypeScript-Typen generieren

# Testing
pnpm test                  # Unit Tests
pnpm test:e2e              # E2E Tests
pnpm test:coverage         # Coverage Report
pnpm test:all              # Alle Tests

# Code-Qualität
pnpm lint                  # ESLint
pnpm typecheck            # TypeScript Check
pnpm format               # Prettier

# Supabase CLI
supabase status           # Status prüfen
supabase logs            # Logs anzeigen
supabase migration list   # Migrationen anzeigen
```

## Support & Weitere Ressourcen

- **Projekt-Dokumentation**: `/docs/`
- **API-Dokumentation**: http://localhost:3000/api/docs/swagger
- **Supabase Studio**: http://localhost:54323
- **Email Testing**: http://localhost:54324

Bei Problemen:
1. Logs prüfen (Browser Console, Terminal, Supabase Logs)
2. Docker und alle Services neu starten
3. Datenbank-Typen neu generieren
4. Test-Cache leeren