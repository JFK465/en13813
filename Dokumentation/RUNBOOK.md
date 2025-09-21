# Runbook - Betriebshandbuch

## Start/Stop/Restart Procedures

### Lokale Entwicklungsumgebung

#### Start
```bash
# 1. Supabase starten
cd apps/web
npx supabase start

# 2. Development Server starten
cd ../..
pnpm dev

# Verify: http://localhost:3000 sollte erreichbar sein
```

#### Stop
```bash
# 1. Development Server stoppen
CTRL+C im Terminal mit pnpm dev

# 2. Supabase stoppen
cd apps/web
npx supabase stop
```

#### Restart
```bash
# Schneller Restart (nur Next.js)
pnpm dev

# Kompletter Restart (inkl. Datenbank)
cd apps/web
npx supabase stop
npx supabase start
cd ../..
pnpm dev
```

### Production (Vercel)

#### Deployment
```bash
# Automatisch via Git Push
git push origin main

# Manuelles Deployment
vercel --prod

# Rollback
vercel rollback
```

#### Restart
```bash
# Vercel Function Restart
vercel env pull
vercel dev --prod

# Supabase Services
# Via Supabase Dashboard > Settings > Restart Services
```

## Health Checks

### Application Health
```bash
# API Health Check
curl https://en13813.app/api/health

# Expected Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2025-01-02T10:00:00Z"
}
```

### Database Health
```sql
-- Verbindung testen
SELECT NOW();

-- Aktive Verbindungen
SELECT count(*) FROM pg_stat_activity;

-- Slow Queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Monitoring Endpoints
- **Application:** https://en13813.app/api/health
- **Database:** Supabase Dashboard > Database > Health
- **Logs:** Vercel Dashboard > Functions > Logs
- **Metrics:** Vercel Analytics Dashboard

## Logs/Tracing/Metrics

### Log-Zugriff

#### Vercel Logs
```bash
# CLI Zugriff
vercel logs --follow

# Filtern nach Funktion
vercel logs --filter api/recipes

# Zeitbereich
vercel logs --since 2h
```

#### Supabase Logs
```sql
-- Auth Logs
SELECT * FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Database Logs
SELECT * FROM postgres_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
AND level IN ('ERROR', 'WARNING');
```

### Strukturierte Logs
```typescript
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Verwendung
logger.info({ 
  action: 'recipe.created',
  recipeId: '123',
  userId: '456',
  duration: 234,
}, 'Recipe successfully created');

logger.error({
  action: 'dop.generation.failed',
  error: error.message,
  stack: error.stack,
}, 'DoP generation failed');
```

### Tracing
```typescript
// lib/tracing.ts
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('en13813-app', '1.0.0');

export async function withTracing<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const span = tracer.startSpan(name);
  
  try {
    const result = await fn();
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

## Häufige Störungen & Workarounds

### Problem: "Database Connection Lost"
**Symptome:** 
- 500 Errors
- "ECONNREFUSED" in Logs

**Lösung:**
```bash
# 1. Verbindungspool prüfen
SELECT count(*) FROM pg_stat_activity;

# 2. Wenn > 90% ausgelastet
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '10 minutes';

# 3. Connection Pool in Supabase Dashboard erhöhen
# Settings > Database > Connection Pooling > Pool Size
```

### Problem: "Rate Limit Exceeded"
**Symptome:**
- 429 Status Code
- "Too Many Requests" Error

**Lösung:**
```typescript
// Implementiere Exponential Backoff
async function retryWithBackoff(fn: Function, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      } else {
        throw error;
      }
    }
  }
}
```

### Problem: "PDF Generation Timeout"
**Symptome:**
- Timeout nach 10 Sekunden
- Große DoPs können nicht generiert werden

**Lösung:**
```typescript
// Async Job implementieren
async function generateDoPAsync(recipeId: string) {
  // 1. Job in Queue einreihen
  const job = await createJob('generate-dop', { recipeId });
  
  // 2. Status-Endpoint für Polling
  return { jobId: job.id, statusUrl: `/api/jobs/${job.id}` };
}

// Client-seitiges Polling
async function pollJobStatus(jobId: string) {
  const interval = setInterval(async () => {
    const status = await fetch(`/api/jobs/${jobId}`);
    if (status.completed) {
      clearInterval(interval);
      // Download PDF
    }
  }, 2000);
}
```

### Problem: "Memory Leak in Production"
**Symptome:**
- Langsam steigende Memory-Nutzung
- Eventual Crash/Restart

**Lösung:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

// Garbage Collection forcieren
if (global.gc) {
  setInterval(() => {
    global.gc();
  }, 60000); // Jede Minute
}
```

## Incident Response

### Severity Levels
- **P0 (Critical):** Komplettausfall, Datenverlust
- **P1 (High):** Kernfunktionen nicht verfügbar
- **P2 (Medium):** Teilfunktionen gestört
- **P3 (Low):** Kosmetische Fehler

### Incident Process

#### 1. Detection & Triage (0-15 Min)
```bash
# Status-Seite prüfen
curl https://status.en13813.app

# Monitoring Alerts prüfen
# - Vercel Dashboard
# - Supabase Dashboard
# - Error Tracking (Sentry)

# Severity bestimmen
```

#### 2. Communication (15-30 Min)
```markdown
# Status Page Update
**Incident:** [Titel]
**Status:** Investigating
**Impact:** [Betroffene Services]
**Start:** [Timestamp]

# Slack/Teams Notification
@channel Incident P[0-3]: [Beschreibung]
Incident Commander: [Name]
Status Page: [Link]
```

#### 3. Mitigation (30+ Min)
```bash
# Quick Fixes
- Feature Flag deaktivieren
- Rollback zu letzter Version
- Traffic umleiten
- Cache leeren

# Workarounds
- Maintenance Mode aktivieren
- Rate Limits erhöhen
- Fallback-Services aktivieren
```

#### 4. Resolution
```bash
# Fix verifizieren
- Health Checks grün
- Error Rate normal
- Performance Metrics OK

# Monitoring verstärken
- Zusätzliche Alerts
- Detailliertes Logging
```

#### 5. Post-Mortem
```markdown
## Post-Mortem: [Incident Title]

### Timeline
- [Zeit]: Erste Meldung
- [Zeit]: Ursache identifiziert
- [Zeit]: Fix deployed
- [Zeit]: Incident resolved

### Root Cause
[Detaillierte Ursachenanalyse]

### Impact
- Betroffene User: [Anzahl]
- Downtime: [Minuten]
- Data Loss: [Ja/Nein]

### Action Items
- [ ] [Owner]: [Action] - Due: [Date]
- [ ] [Owner]: [Action] - Due: [Date]

### Lessons Learned
[Was haben wir gelernt?]
```

## Escalation

### Level 1: On-Call Engineer
- **Verfügbarkeit:** 24/7
- **Response Time:** 15 Minuten
- **Kontakt:** on-call@en13813.app

### Level 2: Team Lead
- **Verfügbarkeit:** Business Hours + On-Call
- **Response Time:** 30 Minuten
- **Kontakt:** [Name] - [Telefon]

### Level 3: CTO
- **Verfügbarkeit:** Business Hours
- **Response Time:** 1 Stunde
- **Kontakt:** [Name] - [Telefon]

### External Support
- **Vercel Support:** enterprise@vercel.com
- **Supabase Support:** support@supabase.io
- **Security Team:** security@en13813.app

## Maintenance Procedures

### Planned Maintenance
```bash
# 1. Ankündigung (7 Tage vorher)
- Status Page Update
- E-Mail an Nutzer
- In-App Banner

# 2. Maintenance Mode (1 Stunde vorher)
vercel env add MAINTENANCE_MODE true

# 3. Durchführung
- Database Migrations
- Dependency Updates
- Infrastructure Changes

# 4. Verification
- Smoke Tests
- Health Checks
- Performance Tests

# 5. Maintenance Mode beenden
vercel env rm MAINTENANCE_MODE
```

### Database Maintenance
```sql
-- Vacuum & Analyze
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE en13813;

-- Update Statistics
ANALYZE;

-- Clear old logs
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Backup & Recovery
```bash
# Automated Backups (täglich)
- Supabase: Automatisch, 7 Tage Retention
- Vercel: Git-basiert, unbegrenzt

# Manual Backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Recovery
psql $DATABASE_URL < backup_20250102_100000.sql

# Point-in-Time Recovery
# Via Supabase Dashboard > Backups > Restore
```

## Monitoring Dashboard Links

### Primary Dashboards
- **Application:** https://vercel.com/dashboard/[project]/analytics
- **Database:** https://app.supabase.com/project/[id]/database/dashboard
- **Logs:** https://vercel.com/dashboard/[project]/functions
- **Errors:** https://sentry.io/organizations/[org]/issues/

### Key Metrics to Watch
- **Response Time:** p50 < 200ms, p95 < 1s
- **Error Rate:** < 0.1%
- **Database Connections:** < 80% of pool
- **CPU Usage:** < 70%
- **Memory Usage:** < 80%
- **Disk I/O:** < 60%