# Compliance Management Platform

Eine modulare Multi-Tenant SaaS-Platform für Compliance-Management, entwickelt mit Next.js, Supabase und Vercel.

## 🚀 Features

- **Multi-Tenant-Architektur** mit strikter Datenisolation
- **Dokumenten-Management** mit Versionierung und Audit-Trail
- **Workflow-Engine** für Compliance-Prozesse
- **Reporting-System** mit PDF-Export
- **Notification-System** (Email, In-App)
- **Compliance-Kalender** mit Deadline-Management
- **REST API** für Integrationen

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deployment:** Vercel
- **Email:** Resend
- **Monitoring:** Sentry, PostHog

## 📁 Projekt-Struktur

```
compliance-saas/
├── apps/
│   └── web/                 # Next.js Frontend
├── packages/
│   ├── database/           # Supabase Migrations
│   └── shared/             # Shared Utilities
├── modules/                # Feature Modules
└── supabase/              # Edge Functions
```

## 🚀 Schnellstart

### Voraussetzungen

- Node.js 18+
- pnpm
- Docker (für lokale Supabase)
- Supabase CLI

### Installation

```bash
# Repository klonen
git clone [repo-url]
cd compliance-saas

# Dependencies installieren
pnpm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local

# Supabase lokal starten
pnpm supabase start

# Datenbank-Migrationen ausführen
pnpm db:migrate

# Entwicklungsserver starten
pnpm dev
```

### Supabase Setup

1. Erstelle ein neues Supabase-Projekt auf [supabase.com](https://supabase.com)
2. Kopiere die Projekt-URL und Anon-Key in `.env.local`
3. Führe die Migrationen aus: `pnpm db:push`

## 📝 Entwicklung

### Neue Features hinzufügen

1. **Migration erstellen:**
   ```bash
   pnpm supabase migration new feature_name
   ```

2. **Types generieren:**
   ```bash
   pnpm gen:types
   ```

3. **Tests ausführen:**
   ```bash
   pnpm test
   ```

### Code-Qualität

- **Linting:** `pnpm lint`
- **Type-Checking:** `pnpm typecheck`
- **Formatierung:** `pnpm format`

## 🚀 Deployment

### Vercel

1. Verbinde das Repository mit Vercel
2. Setze die Umgebungsvariablen
3. Deploy mit: `pnpm deploy`

### Supabase

1. Verbinde das lokale Projekt mit Supabase
2. Push Migrationen: `pnpm db:push`
3. Deploy Edge Functions: `pnpm functions:deploy`

## 📊 Monitoring

- **Fehler-Tracking:** Sentry Dashboard
- **Analytics:** PostHog Dashboard
- **Performance:** Vercel Analytics

## 🔐 Sicherheit

- Row-Level Security (RLS) für alle Tabellen
- Tenant-Isolation durch Supabase RLS
- Rate Limiting mit Upstash Redis
- Input-Validierung mit Zod

## 📖 Dokumentation

Weitere Dokumentation findest du in:
- [Architektur](./docs/architecture.md)
- [API-Dokumentation](./docs/api.md)
- [Deployment-Guide](./docs/deployment.md)

## 📄 Lizenz

Proprietär - Alle Rechte vorbehalten