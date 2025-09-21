# EN 13813 Compliance Management System

## Kurzbeschreibung
Webbasierte Plattform zur vollständigen Digitalisierung der EN 13813-Konformitätsprozesse für Industrieböden und Estrichmörtel. Automatisierte Verwaltung von Rezepturen, Prüfberichten, Leistungserklärungen (DoP) und Werkseigenen Produktionskontrollen (FPC).

**Problem:** Manuelle, papierbasierte Konformitätsprozesse führen zu Ineffizienzen, Fehlerrisiken und erschweren die Nachverfolgbarkeit

**Zielgruppe:** Estrichhersteller, QS-Manager, Prüflabore, Notified Bodies

**Scope:** EN 13813 Compliance, Rezepturverwaltung, DoP/CE-Generierung, FPC-Dokumentation, Chargenrückverfolgung

## Tech-Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, TypeScript 5, Tailwind CSS, shadcn/ui
- **State:** React Query (TanStack Query), Zustand
- **Forms:** React Hook Form, Zod Validation

### Backend
- **Database:** Supabase (PostgreSQL 15)
- **Auth:** Supabase Auth (JWT-basiert)
- **API:** Next.js API Routes + Supabase Client
- **Storage:** Supabase Storage
- **RLS:** Row Level Security für Multi-Tenant

### Infrastructure
- **Hosting:** Vercel (Edge Functions)
- **Monitoring:** Vercel Analytics
- **Package Manager:** pnpm (Workspaces)
- **Monorepo:** Turborepo
- **PDF Generation:** jsPDF, pdfmake

## Quickstart

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase CLI
- PostgreSQL (lokal oder via Docker)

### Installation

```bash
# Repository klonen
git clone https://github.com/your-org/en13813.git
cd en13813

# Dependencies installieren
pnpm install

# Umgebungsvariablen konfigurieren
cp apps/web/.env.example apps/web/.env.local
# .env.local mit Supabase-Credentials befüllen

# Datenbank aufsetzen
cd apps/web
npx supabase start
npx supabase db reset

# Demo-Daten laden
NODE_PATH=./node_modules node ../../scripts/create-demo-data.js
```

### Entwicklung

```bash
# Development Server starten
pnpm dev

# Build erstellen
pnpm build

# Tests ausführen
pnpm test

# Linting
pnpm lint

# Type Checking
pnpm typecheck
```

## Standard-Logins / Demo-Daten

- **Admin:** admin@example.com / admin123
- **QS-Manager:** qs@example.com / qs123
- **Labor:** labor@example.com / labor123

Demo-Daten enthalten:
- 3 Beispielrezepturen (CT-C25-F4, CA-C30-F6, CAF-C16-F3)
- Prüfpläne mit Testdaten
- Beispiel-DoPs

## Wichtige Links

- **Staging:** https://en13813-staging.vercel.app
- **Production:** https://en13813.vercel.app
- **API Dokumentation:** `/Dokumentation/docs/api/`
- **Supabase Dashboard:** http://localhost:54323
- **Monitoring:** Vercel Analytics Dashboard