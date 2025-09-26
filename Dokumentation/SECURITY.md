# Security Documentation

## Threat Model (STRIDE)

### Spoofing (Identitätsfälschung)
**Bedrohungen:**
- Gefälschte Benutzeridentitäten
- Session-Hijacking
- CSRF-Angriffe

**Schutzmaßnahmen:**
- JWT-basierte Authentifizierung mit kurzen Laufzeiten (15 Min Access, 7 Tage Refresh)
- Secure & HttpOnly Cookies
- CSRF-Token für state-changing Operations
- Multi-Factor Authentication (TOTP)

### Tampering (Manipulation)
**Bedrohungen:**
- SQL Injection
- XSS (Cross-Site Scripting)
- Datenmanipulation in Transit

**Schutzmaßnahmen:**
- Parametrisierte Queries (Supabase Client)
- Input-Validierung mit Zod
- Content Security Policy (CSP)
- TLS 1.3 für alle Verbindungen

### Repudiation (Abstreitbarkeit)
**Bedrohungen:**
- Fehlende Nachvollziehbarkeit von Aktionen
- Unzureichende Audit-Logs

**Schutzmaßnahmen:**
- Umfassende Audit-Logs für kritische Operationen
- Unveränderliche Log-Speicherung
- Digitale Signaturen für DoPs

### Information Disclosure (Informationspreisgabe)
**Bedrohungen:**
- Datenlecks durch fehlerhafte RLS
- Sensitive Daten in Logs
- Unverschlüsselte Backups

**Schutzmaßnahmen:**
- Row Level Security (RLS) für Mandantentrennung
- Verschlüsselung at-rest (AES-256)
- Keine PII in Logs
- Verschlüsselte Backups

### Denial of Service (DoS)
**Bedrohungen:**
- API-Überlastung
- Resource Exhaustion
- Brute-Force-Angriffe

**Schutzmaßnahmen:**
- Rate Limiting (100 req/min pro IP)
- Query Complexity Limits
- Cloudflare DDoS Protection
- Account-Lockout nach 5 fehlgeschlagenen Logins

### Elevation of Privilege (Rechteausweitung)
**Bedrohungen:**
- Privilege Escalation
- Unsichere Default-Berechtigungen
- Fehlende Zugriffskontrolle

**Schutzmaßnahmen:**
- Principle of Least Privilege
- Rollenbasierte Zugriffskontrolle (RBAC)
- Regelmäßige Permission-Audits
- Keine Admin-Operationen im Frontend

## SAST/DAST/SCA

### Static Application Security Testing (SAST)
```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # ESLint Security Plugin
      - name: ESLint Security
        run: npx eslint --plugin security .
      
      # Semgrep
      - name: Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto
      
      # TypeScript Strict Mode
      - name: TypeScript Strict
        run: npx tsc --noEmit --strict
```

### Dynamic Application Security Testing (DAST)
```bash
# OWASP ZAP Scan (wöchentlich)
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.en13813.app \
  -r zap-report.html
```

### Software Composition Analysis (SCA)
```json
// package.json
{
  "scripts": {
    "audit": "pnpm audit --audit-level=moderate",
    "audit:fix": "pnpm audit --fix",
    "outdated": "pnpm outdated",
    "update:deps": "pnpm update --interactive"
  }
}
```

**Automatisierte Dependency-Updates:**
- Dependabot für GitHub
- Wöchentliche Security-Patches
- Monatliche Minor-Updates

## Secrets Management

### Umgebungsvariablen
```bash
# .env.local (NIEMALS committen!)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR-ANON-KEY>      # Public key (safe)
SUPABASE_SERVICE_ROLE_KEY=<YOUR-SERVICE-ROLE-KEY>  # GEHEIM! Nur Server-seitig
DATABASE_URL=postgresql://...         # GEHEIM!
JWT_SECRET=...                        # GEHEIM!
```

### Secrets Rotation
- **Access Tokens:** Alle 15 Minuten
- **Refresh Tokens:** Alle 7 Tage
- **API Keys:** Quartalsweise
- **Datenbank-Passwörter:** Halbjährlich

### Key Management
```typescript
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class SecretManager {
  private algorithm = 'aes-256-gcm';
  
  encrypt(text: string, key: Buffer): EncryptedData {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }
  
  decrypt(data: EncryptedData, key: Buffer): string {
    const decipher = createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(data.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## Sicherheitsheader

### Next.js Security Headers
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Content Security Policy (CSP)
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim();
  
  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Nonce', nonce);
  
  return response;
}
```

## Input-Validierung

### Schema-basierte Validierung
```typescript
// schemas/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML Input
const sanitizedString = z.string().transform((val) => 
  DOMPurify.sanitize(val, { ALLOWED_TAGS: [] })
);

// Email Validation
const emailSchema = z.string()
  .email()
  .max(255)
  .toLowerCase()
  .transform((email) => email.trim());

// SQL Injection Prevention
const safeIdentifier = z.string()
  .regex(/^[a-zA-Z0-9_]+$/, 'Nur alphanumerische Zeichen erlaubt')
  .max(64);

// File Upload Validation
const fileSchema = z.object({
  name: z.string().max(255),
  type: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
  size: z.number().max(10 * 1024 * 1024), // 10MB
});

// Numeric Input
const positiveNumber = z.number()
  .positive()
  .finite()
  .safe(); // Verhindert Infinity und sehr große Zahlen
```

### API Input Validation
```typescript
// app/api/recipes/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = recipeSchema.parse(body);
    
    // Additional business logic validation
    if (validatedData.aggregates.reduce((sum, a) => sum + a.percentage, 0) !== 100) {
      return NextResponse.json(
        { error: 'Aggregates must sum to 100%' },
        { status: 400 }
      );
    }
    
    // Process validated data
    const result = await createRecipe(validatedData);
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    // Log but don't expose internal errors
    console.error('Recipe creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Responsible Disclosure

### Security Contact
**E-Mail:** security@en13813.app  
**PGP Key:** [Public Key](https://en13813.app/.well-known/pgp-key.txt)

### Disclosure Policy
1. **Report einreichen** via security@en13813.app
2. **Bestätigung** innerhalb von 48 Stunden
3. **Erste Einschätzung** innerhalb von 7 Tagen
4. **Fix-Timeline** abhängig von Severity:
   - Critical: 24 Stunden
   - High: 7 Tage
   - Medium: 30 Tage
   - Low: 90 Tage
5. **Coordinated Disclosure** nach Fix
6. **Credit** in Security Hall of Fame (optional)

### Bug Bounty Scope
**In Scope:**
- en13813.app (Production)
- staging.en13813.app
- API Endpoints
- Authentication/Authorization
- Data Validation
- XSS, CSRF, SQL Injection

**Out of Scope:**
- Social Engineering
- Physical Attacks
- DoS/DDoS (bitte melden, nicht testen)
- Bereits bekannte Issues
- Third-Party Services

### Severity Levels
- **Critical:** RCE, Datenleck aller Nutzer, Auth Bypass
- **High:** Privilege Escalation, Stored XSS, SQL Injection
- **Medium:** CSRF, Reflected XSS, Information Disclosure
- **Low:** Missing Security Headers, Version Disclosure

## Security Checklist

### Pre-Deployment
- [ ] Alle Dependencies aktuell (`pnpm audit`)
- [ ] Security Headers konfiguriert
- [ ] CSP aktiviert und getestet
- [ ] Input-Validierung implementiert
- [ ] Rate Limiting aktiv
- [ ] Secrets rotiert
- [ ] RLS-Policies getestet
- [ ] Audit-Logs funktionsfähig

### Post-Deployment
- [ ] Security Scan durchgeführt
- [ ] Penetration Test (jährlich)
- [ ] Security Training Team (halbjährlich)
- [ ] Incident Response Plan aktualisiert
- [ ] Backup-Recovery getestet