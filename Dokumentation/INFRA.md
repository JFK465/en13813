# Infrastructure Documentation

## Hosting & Provisionierung

### Vercel (Frontend & API)
```yaml
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "regions": ["fra1"], # Frankfurt
  "functions": {
    "app/api/*": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Supabase (Backend)
```yaml
Instance:
  Plan: Pro
  Region: eu-central-1 (Frankfurt)
  Version: PostgreSQL 15
  
Resources:
  CPU: 2 vCPUs
  RAM: 8 GB
  Storage: 100 GB SSD
  Connections: 200 direct, 10000 pooled
  
Features:
  - Point-in-Time Recovery: 7 days
  - Read Replicas: 1 (optional)
  - Auto-scaling: Enabled
```

### Infrastructure as Code
```typescript
// infrastructure/terraform/main.tf
terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.11"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 0.2"
    }
  }
}

resource "vercel_project" "en13813" {
  name      = "en13813"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "org/en13813"
  }
  
  environment = [
    {
      key    = "NEXT_PUBLIC_SUPABASE_URL"
      value  = supabase_project.main.url
      target = ["production", "preview"]
    }
  ]
}

resource "supabase_project" "main" {
  name         = "en13813-prod"
  organization = "your-org"
  region       = "eu-central-1"
  pricing_tier = "pro"
  
  database_config = {
    postgres_version = "15"
    instance_size    = "medium"
  }
}
```

## DNS/Domains/TLS/HSTS

### DNS Configuration
```dns
# Vercel DNS Records
en13813.app.        A     76.76.21.21
en13813.app.        AAAA  2606:4700::6810:84e5
www.en13813.app.    CNAME en13813.app.
api.en13813.app.    CNAME en13813.vercel.app.

# MX Records (Email)
en13813.app.        MX    10 mx1.forwardemail.net.
en13813.app.        MX    20 mx2.forwardemail.net.

# SPF Record
en13813.app.        TXT   "v=spf1 include:_spf.forwardemail.net ~all"

# DMARC
_dmarc.en13813.app. TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@en13813.app"
```

### TLS Configuration
```nginx
# SSL/TLS Settings (Vercel managed)
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_stapling on;
ssl_stapling_verify on;
```

### HSTS Configuration
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  }
}
```

### Certificate Management
- **Provider:** Let's Encrypt (via Vercel)
- **Auto-Renewal:** Ja, 30 Tage vor Ablauf
- **Wildcard:** *.en13813.app
- **Monitoring:** Vercel Dashboard + Uptime Robot

## CDN/Caching-Strategien

### Vercel Edge Network
```javascript
// Cache Control Headers
export async function GET(request: Request) {
  const response = new Response(data);
  
  // Static Assets (1 Jahr)
  response.headers.set(
    'Cache-Control',
    'public, max-age=31536000, immutable'
  );
  
  // API Responses (5 Minuten)
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=60'
  );
  
  // Private Data (kein Cache)
  response.headers.set(
    'Cache-Control',
    'private, no-cache, no-store, must-revalidate'
  );
  
  return response;
}
```

### Caching Layers
```yaml
1. Browser Cache:
   - Static Assets: 1 Jahr
   - API Responses: 5 Minuten
   - HTML: no-cache

2. CDN Cache (Vercel Edge):
   - Static Files: Permanent
   - ISR Pages: 60 Sekunden
   - API Routes: 5-300 Sekunden

3. Application Cache (React Query):
   - List Data: 5 Minuten
   - Detail Data: 1 Minute
   - User Data: 30 Sekunden

4. Database Cache (PostgreSQL):
   - Query Plans: Session
   - Prepared Statements: 5 Minuten
   - Connection Pool: Persistent
```

### Cache Invalidation
```typescript
// lib/cache.ts
export class CacheManager {
  async invalidate(patterns: string[]) {
    // Vercel Cache API
    await fetch('https://api.vercel.com/v1/purge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
      body: JSON.stringify({ patterns }),
    });
    
    // React Query Cache
    queryClient.invalidateQueries(patterns);
    
    // Redis Cache (optional)
    await redis.del(patterns);
  }
}
```

## Jobs/Cron/Queues

### Cron Jobs (Vercel)
```typescript
// app/api/cron/daily-cleanup/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Cleanup old drafts
  await supabase
    .from('test_reports')
    .delete()
    .eq('status', 'draft')
    .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  
  // Generate statistics
  await generateMonthlyStatistics();
  
  return Response.json({ success: true });
}
```

### Queue System (Upstash)
```typescript
// lib/queue.ts
import { Queue } from '@upstash/qstash';

const queue = new Queue({
  token: process.env.QSTASH_TOKEN!,
});

// Job hinzufügen
await queue.publish({
  url: 'https://en13813.app/api/jobs/generate-dop',
  body: { recipeId: '123' },
  retries: 3,
  delay: '10s',
});

// Job Handler
export async function POST(request: Request) {
  const { recipeId } = await request.json();
  
  try {
    await generateDoP(recipeId);
    return Response.json({ success: true });
  } catch (error) {
    // Retry logic handled by QStash
    throw error;
  }
}
```

### Scheduled Tasks
```yaml
Daily (02:00 UTC):
  - Database Vacuum
  - Log Rotation
  - Draft Cleanup
  - Cache Warming

Weekly (Sunday 03:00 UTC):
  - Full Backup
  - Security Scan
  - Dependency Check
  - Performance Report

Monthly (1st, 04:00 UTC):
  - Statistics Aggregation
  - Usage Reports
  - Cost Analysis
  - Certificate Check
```

## Kosten-Budget & Alerts

### Monatliche Kostenstruktur
```yaml
Vercel Pro:
  Base: $20
  Bandwidth: ~$40 (100GB)
  Functions: ~$10 (1M executions)
  Total: ~$70

Supabase Pro:
  Base: $25
  Database: $0 (included)
  Storage: $0 (included <100GB)
  Bandwidth: ~$10
  Total: ~$35

Domains & Email:
  Domain: $15/year
  Email: $0 (ForwardEmail free)
  Total: ~$2

Monitoring & Tools:
  Sentry: $26 (Team plan)
  Uptime Robot: $0 (free)
  Total: ~$26

TOTAL: ~$133/month
```

### Cost Alerts
```javascript
// monitoring/cost-alerts.js
const budgets = {
  vercel: 100,
  supabase: 50,
  total: 200,
};

async function checkCosts() {
  const costs = await getCurrentCosts();
  
  if (costs.total > budgets.total * 0.8) {
    await sendAlert('Cost Warning', `80% of budget reached: $${costs.total}`);
  }
  
  if (costs.total > budgets.total) {
    await sendAlert('Cost Critical', `Budget exceeded: $${costs.total}`);
    await enableCostSavingMode();
  }
}
```

### Cost Optimization
```yaml
Strategies:
  1. Caching:
     - Aggressive CDN caching
     - Database query caching
     - Static generation where possible
  
  2. Database:
     - Connection pooling
     - Query optimization
     - Index usage
  
  3. Functions:
     - Code splitting
     - Lazy loading
     - Efficient algorithms
  
  4. Storage:
     - Image optimization
     - PDF compression
     - Old data archiving
```

## Kapazitätsplanung

### Current Capacity
```yaml
Users: 100 concurrent
Requests: 1000 req/min
Storage: 10GB used / 100GB available
Database: 20 connections / 200 available
```

### Growth Projections
```yaml
3 Months:
  Users: 500
  Storage: 25GB
  Requests: 5000 req/min
  Action: Monitor closely

6 Months:
  Users: 1000
  Storage: 50GB
  Requests: 10000 req/min
  Action: Upgrade Supabase to Team

12 Months:
  Users: 5000
  Storage: 200GB
  Requests: 50000 req/min
  Action: 
    - Multi-region deployment
    - Read replicas
    - Dedicated infrastructure
```

### Scaling Triggers
```yaml
Automatic Scaling:
  - Vercel: Automatic (serverless)
  - Supabase: Connection pooling

Manual Scaling Triggers:
  - CPU > 80% for 10 minutes
  - Memory > 85% sustained
  - Response time p95 > 2s
  - Error rate > 1%
  - Storage > 80% capacity
```

### Scaling Playbook
```bash
# 1. Immediate Actions (< 5 min)
- Enable read replicas
- Increase connection pool
- Clear caches
- Enable maintenance mode if critical

# 2. Short-term (< 1 hour)
- Upgrade instance size
- Add more workers
- Optimize slow queries
- Enable CDN for more routes

# 3. Long-term (< 1 week)
- Database sharding
- Microservices split
- Multi-region deployment
- Infrastructure overhaul
```

## Disaster Recovery

### Backup Strategy
```yaml
Database:
  Frequency: Daily at 02:00 UTC
  Retention: 30 days
  Type: Full backup + WAL
  Location: Supabase + S3

Application:
  Frequency: On every deployment
  Retention: Unlimited
  Type: Git + Docker images
  Location: GitHub + Registry

Files/Storage:
  Frequency: Weekly
  Retention: 90 days
  Type: Incremental
  Location: Supabase Storage + S3
```

### Recovery Procedures
```bash
# Database Recovery
# RTO: 1 hour, RPO: 24 hours
supabase db restore --backup-id xxx

# Application Recovery
# RTO: 15 minutes, RPO: 0
vercel rollback
# oder
git revert && git push

# Full Disaster Recovery
# RTO: 4 hours, RPO: 24 hours
1. Provision new infrastructure
2. Restore database from backup
3. Deploy application from Git
4. Restore file storage
5. Update DNS
6. Verify functionality
```

### DR Testing
```yaml
Monthly:
  - Backup verification
  - Restore test (staging)

Quarterly:
  - Full DR drill
  - Failover test
  - Documentation update

Annually:
  - Complete infrastructure rebuild
  - Cross-region failover
  - Third-party audit
```