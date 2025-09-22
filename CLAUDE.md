# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Compliance Management SaaS platform built as a monorepo using Next.js, Supabase, and TypeScript. The main focus is the EN13813 compliance module for quality management in floor screed materials.

## Architecture

- **Monorepo Structure**: Uses pnpm workspaces with Turborepo for build orchestration
- **Frontend**: Next.js 14 with App Router (`apps/web`)
  - Port 3001 for development
  - Components organized by feature module (e.g., `components/en13813/`)
  - Modules contain services, types, and utilities (`modules/en13813/`)
- **Backend**: Supabase for database, auth, storage, and real-time features
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **State Management**: React Query (TanStack Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI with Tailwind CSS
- **PDF Generation**: pdf-lib and jsPDF for document generation
- **Email**: Resend for transactional emails

## Common Commands

```bash
# Development
pnpm dev                    # Start development server on port 3001
pnpm build                  # Build production bundle
pnpm lint                   # Run ESLint
pnpm typecheck             # Run TypeScript type checking
pnpm format                # Format code with Prettier

# Database
pnpm db:start              # Start local Supabase
pnpm db:stop               # Stop local Supabase
pnpm db:reset              # Reset database
pnpm db:migrate            # Create new migration
pnpm db:push               # Push migrations to remote
pnpm gen:types             # Generate TypeScript types from database schema

# Demo Data Scripts (run from root)
NODE_PATH=/Users/jonaskruger/Dev/en13813/apps/web/node_modules node scripts/create-demo-data.js
NODE_PATH=/Users/jonaskruger/Dev/en13813/apps/web/node_modules node scripts/create-demo-data-standalone.js
NODE_PATH=/Users/jonaskruger/Dev/en13813/apps/web/node_modules node scripts/create-demo-data-production.js
NODE_PATH=/Users/jonaskruger/Dev/en13813/apps/web/node_modules node scripts/setup-production-demo.js

# Start script
./start-en13813.command
```

## EN13813 Module Structure

The EN13813 module is the core compliance feature:
- **Components**: `apps/web/components/en13813/` - UI components for recipes, batches, testing, etc.
- **Services**: `apps/web/modules/en13813/services/` - Business logic and API interactions
- **Types**: `apps/web/modules/en13813/types/` - TypeScript type definitions
- **API Routes**: `apps/web/app/api/en13813/` - Next.js API endpoints
- **Pages**: `apps/web/app/(auth)/en13813/` - Protected pages

Key features:
- Recipe management (RecipeFormUltimate.tsx)
- Batch processing and statistics
- Test plans (ITT and FPC)
- Declaration of Performance (DoP) generation
- Delivery notes with PDF generation
- Marking and CE labeling
- Deviation/CAPA management

## Database Schema

Generated types are in `apps/web/types/database.types.ts`. Key tables:
- `en13813_recipes`: Recipe definitions
- `en13813_batches`: Production batches
- `en13813_tests`: Test results
- `en13813_deviations`: Quality deviations
- `en13813_marking`: CE marking information

## API Pattern

API routes follow this pattern:
```typescript
// apps/web/app/api/en13813/[resource]/route.ts
export async function GET/POST/PUT/DELETE(request: Request) {
  // Supabase client initialization
  // Input validation with Zod
  // Business logic
  // Return NextResponse.json()
}
```

## Testing

Currently no automated tests are configured for the EN13813 module (as noted in package.json).

## Important Conventions

1. **Authentication**: All routes under `/(auth)` require authentication
2. **Multi-tenancy**: Tenant isolation via Supabase RLS policies
3. **Error Handling**: Use try-catch blocks with proper error responses
4. **Type Safety**: Always use generated database types from `database.types.ts`
5. **State Management**: Use React Query for server state, avoid unnecessary client state
6. **Forms**: Use React Hook Form with Zod schemas for validation
7. **Styling**: Tailwind CSS with `cn()` utility for conditional classes

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- Additional variables for monitoring and rate limiting

## Deployment

- Frontend: Vercel
- Database: Supabase Cloud
- Edge Functions: Supabase Edge Runtime