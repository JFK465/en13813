# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Compliance Management SaaS platform focused on EN13813 compliance for quality management in floor screed materials. Built as a pnpm monorepo with Next.js frontend and Supabase backend.

## Architecture

### Tech Stack
- **Monorepo**: pnpm workspaces (v8.14.0) with Turborepo
- **Frontend**: Next.js 14 App Router on port 3001
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State**: TanStack Query for server state
- **Forms**: React Hook Form + Zod validation
- **UI**: Radix UI + Tailwind CSS
- **PDF**: pdf-lib, jsPDF, puppeteer-core
- **Email**: Resend

### Directory Structure
```
/
├── apps/web/                         # Next.js application
│   ├── app/
│   │   ├── (auth)/en13813/          # Protected EN13813 pages
│   │   └── api/en13813/             # API routes
│   ├── components/en13813/          # UI components
│   ├── modules/en13813/             # Business logic
│   │   ├── services/                # Core services
│   │   ├── types/                   # TypeScript types
│   │   └── schemas/                 # Zod schemas
│   ├── types/database.types.ts      # Generated DB types
│   └── supabase/migrations/         # Database migrations
├── scripts/                          # Demo data scripts
└── start-en13813.command            # macOS start script
```

## Commands

### Development
```bash
pnpm dev                    # Start dev server (port 3001)
pnpm build                  # Build production
pnpm lint                   # Run ESLint
pnpm typecheck             # TypeScript type checking
pnpm format                # Prettier formatting

# Alternative start method
./start-en13813.command    # Interactive start with port conflict handling
```

### Database
```bash
pnpm db:start              # Start local Supabase
pnpm db:stop               # Stop local Supabase
pnpm db:reset              # Reset database
pnpm db:migrate            # Create new migration
pnpm db:push               # Push migrations to remote
pnpm gen:types             # Generate TypeScript types from database
```

### Demo Data (run from repository root)
```bash
NODE_PATH=/Users/jonaskruger/Dev/en13813/apps/web/node_modules node scripts/create-demo-data.js
NODE_PATH=/Users/jonaskruger/Dev/en13813/apps/web/node_modules node scripts/create-demo-data-standalone.js
NODE_PATH=/Users/jonaskruger/Dev/en13813/apps/web/node_modules node scripts/create-demo-data-production.js
NODE_PATH=/Users/jonaskruger/Dev/en13813/apps/web/node_modules node scripts/setup-production-demo.js
```

## EN13813 Module

### Core Features
- **Recipe Management**: Material recipes with compliance validation (RecipeFormUltimate.tsx)
- **Batch Processing**: Production batch tracking and statistics
- **Testing**: ITT (Initial Type Testing) and FPC (Factory Production Control)
- **Documentation**: DoP (Declaration of Performance) generation
- **Delivery**: Delivery notes with PDF export
- **Marking**: CE marking and labeling
- **Quality**: Deviation management and CAPA (Corrective/Preventive Actions)
- **Calibration**: Equipment calibration tracking

### Key Services
- `recipe.service.ts`: Recipe CRUD and validation
- `deviation.service.ts`: CAPA management per EN 13813 § 6.3
- `dop-generator.service.ts`: DoP PDF generation
- `marking-delivery-note.service.ts`: CE marking documents
- `conformity-assessment.service.ts`: Compliance evaluation
- `fpc.service.ts`: Factory production control
- `test-reports.service.ts`: Test result management

### Database Tables
- `en13813_recipes`: Recipe definitions with materials
- `en13813_batches`: Production batches
- `en13813_tests`: Test results (ITT/FPC)
- `en13813_deviations`: Quality deviations
- `en13813_marking`: CE marking information
- `en13813_calibrations`: Equipment calibration
- `en13813_dops`: Declaration of Performance

## API Routes Pattern

```typescript
// apps/web/app/api/en13813/[resource]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'

const schema = z.object({ /* validation */ })

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await request.json()
  const validated = schema.parse(body)

  // Business logic with proper error handling
  const { data, error } = await supabase
    .from('en13813_table')
    .insert(validated)

  if (error) return NextResponse.json({ error }, { status: 400 })
  return NextResponse.json(data)
}
```

## Conventions

### Authentication & Security
- Routes under `/(auth)` require authentication
- Multi-tenancy via Supabase RLS policies
- Never commit sensitive data (use `.env.local`)

### Code Quality
- Use generated types from `database.types.ts`
- Validate with Zod schemas before DB operations
- Handle errors with try-catch and proper HTTP status codes
- Use TanStack Query for data fetching (avoid useState for server data)

### UI Development
- Use Radix UI primitives with Tailwind styling
- Apply conditional classes with `cn()` utility from `lib/utils`
- Forms: React Hook Form with Zod resolver
- Keep components in feature folders (`components/en13813/`)

### Testing
No automated tests configured yet (`pnpm test` returns "No tests configured")

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

## Deployment

- **Frontend**: Vercel
- **Database**: Supabase Cloud (instance: fhftgdffhkhmbwqbwiyt)
- **Edge Functions**: Supabase Edge Runtime