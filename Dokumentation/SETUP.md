# Entwicklungsumgebung Setup

## Prerequisites

### Erforderliche Software
- **Node.js:** v18.17.0 oder höher
- **pnpm:** v8.0.0 oder höher
- **Git:** v2.30 oder höher
- **Supabase CLI:** v1.100.0 oder höher
- **Docker:** v20.10 oder höher (für lokale Supabase)
- **VS Code:** Empfohlen mit Extensions

### VS Code Extensions (empfohlen)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript und JavaScript
- Prisma (optional)
- GitLens

## Installation Schritt für Schritt

### 1. Repository Setup

```bash
# Repository klonen
git clone https://github.com/your-org/en13813.git
cd en13813

# pnpm installieren (falls nicht vorhanden)
npm install -g pnpm

# Dependencies installieren
pnpm install
```

### 2. Supabase Setup

```bash
# Supabase CLI installieren
npm install -g supabase

# In das Web-App Verzeichnis wechseln
cd apps/web

# Lokale Supabase Instanz starten
supabase start

# Ausgabe notieren:
# - API URL
# - anon key
# - service_role key
# - DB URL
```

### 3. Umgebungsvariablen

```bash
# .env.local erstellen
cp .env.example .env.local

# .env.local mit Editor öffnen und Werte eintragen:
```

Inhalt für `.env.local`:
```env
# Supabase (Werte von 'supabase start' Ausgabe)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Datenbank-Migration

```bash
# Migrations ausführen
supabase db reset

# Verifizieren dass alle Tabellen erstellt wurden
supabase db dump --local | grep "CREATE TABLE"
```

### 5. Demo-Daten laden

```bash
# Demo-Daten Script ausführen
NODE_PATH=./node_modules node ../../scripts/create-demo-data.js

# Alternativ für Standalone-Daten
NODE_PATH=./node_modules node ../../scripts/create-demo-data-standalone.js
```

## Entwicklungs-Befehle

### Basis-Befehle

```bash
# Development Server starten (Port 3000)
pnpm dev

# Production Build erstellen
pnpm build

# Production Server starten
pnpm start

# Alle Tests ausführen
pnpm test

# Tests im Watch-Modus
pnpm test:watch

# E2E Tests
pnpm test:e2e
```

### Code-Qualität

```bash
# ESLint ausführen
pnpm lint

# ESLint mit Auto-Fix
pnpm lint:fix

# TypeScript Type-Check
pnpm typecheck

# Prettier Format Check
pnpm format:check

# Prettier Auto-Format
pnpm format
```

### Datenbank-Befehle

```bash
# Neue Migration erstellen
supabase migration new <migration_name>

# Migrations ausführen
supabase db push

# Datenbank-Status prüfen
supabase db diff

# Datenbank zurücksetzen
supabase db reset

# SQL direkt ausführen
supabase db execute --local -f path/to/script.sql
```

## Debugging

### VS Code Launch Configuration

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "runtimeArgs": [
        "test",
        "--runInBand"
      ],
      "runtimeExecutable": "pnpm",
      "console": "integratedTerminal"
    }
  ]
}
```

### Logging

```typescript
// Server-side Logging
console.log('Server:', data);

// Client-side Debug Logging
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug:', data);
}

// Supabase Query Logging
const { data, error } = await supabase
  .from('recipes')
  .select('*')
  .limit(10);
  
if (error) console.error('Query Error:', error);
```

## Troubleshooting

### Problem 1: Supabase startet nicht

**Fehler:** `Error: Docker is not running`

**Lösung:**
```bash
# Docker Desktop starten
# Auf macOS: open -a Docker
# Warten bis Docker läuft, dann:
supabase start
```

### Problem 2: Port bereits belegt

**Fehler:** `Error: Port 3000 is already in use`

**Lösung:**
```bash
# Prozess auf Port 3000 finden
lsof -i :3000

# Prozess beenden
kill -9 <PID>

# Oder anderen Port verwenden
PORT=3001 pnpm dev
```

### Problem 3: TypeScript Fehler

**Fehler:** `Type error: Property 'X' does not exist`

**Lösung:**
```bash
# TypeScript Cache löschen
rm -rf .next
rm -rf node_modules/.cache

# Dependencies neu installieren
pnpm install

# TypeScript neu generieren
pnpm typecheck
```

### Problem 4: Datenbank-Verbindung fehlgeschlagen

**Fehler:** `FATAL: password authentication failed`

**Lösung:**
```bash
# Supabase Status prüfen
supabase status

# Supabase neu starten
supabase stop
supabase start

# Neue Credentials in .env.local aktualisieren
```

### Problem 5: Migration fehlgeschlagen

**Fehler:** `migration failed: duplicate key value`

**Lösung:**
```bash
# Datenbank komplett zurücksetzen
supabase db reset --local

# Migrations-History prüfen
supabase migration list

# Einzelne Migration rückgängig machen
supabase migration repair <version> --status reverted
```

## Seed-Daten

### Test-Benutzer
```sql
-- Admin User
Email: admin@example.com
Password: admin123
Role: admin

-- QS Manager
Email: qs@example.com
Password: qs123
Role: qs_manager

-- Labor User
Email: labor@example.com
Password: labor123
Role: lab_user
```

### Test-Rezepturen
- CT-C25-F4 (Zementestrich)
- CA-C30-F6 (Calciumsulfatestrich)
- CAF-C16-F3 (Calciumsulfat-Fließestrich)

## Nützliche Aliase

Füge zu `~/.zshrc` oder `~/.bashrc` hinzu:

```bash
alias en13813="cd ~/Dev/en13813 && code ."
alias endev="cd ~/Dev/en13813/apps/web && pnpm dev"
alias endb="cd ~/Dev/en13813/apps/web && supabase db reset && NODE_PATH=./node_modules node ../../scripts/create-demo-data.js"
alias enlogs="cd ~/Dev/en13813/apps/web && supabase db logs"
```