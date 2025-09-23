# Environment Variables Setup für estrichmanager.de

## Erforderliche Umgebungsvariablen für Vercel Production

### 1. Supabase (Pflicht)

```bash
# Supabase Projekt URL und Keys
NEXT_PUBLIC_SUPABASE_URL=https://fhftgdffhkhmbwqbwiyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[aus Supabase Dashboard: Settings > API]
SUPABASE_SERVICE_ROLE_KEY=[aus Supabase Dashboard: Settings > API - GEHEIM HALTEN!]
```

### 2. Domain/URL (Pflicht)

```bash
# Production URL für die Anwendung
NEXT_PUBLIC_APP_URL=https://estrichmanager.de
```

### 3. Email Service - Resend (Pflicht für Email-Funktionen)

```bash
# Resend API Key für Email-Versand (Abweichungen, Berichte)
RESEND_API_KEY=[aus resend.com Dashboard nach Registrierung]
EMAIL_FROM=EN13813 System <noreply@estrichmanager.de>
```

### 4. Sentry Error Tracking (Empfohlen für Production)

```bash
# Sentry für Error Tracking und Performance Monitoring
SENTRY_DSN=[aus Sentry Dashboard: Settings > Projects > Client Keys]
NEXT_PUBLIC_SENTRY_DSN=[gleicher Wert wie SENTRY_DSN]
SENTRY_ORG=[deine Sentry Organisation]
SENTRY_PROJECT=[dein Sentry Projekt Name]
SENTRY_AUTH_TOKEN=[für Source Maps Upload - aus Sentry: Settings > Account > API > Auth Tokens]
```

### 5. Optionale Variablen (Nicht zwingend erforderlich)

#### App Version (wird automatisch gesetzt)

```bash
NEXT_PUBLIC_APP_VERSION=1.0.0  # Wird aus package.json übernommen
```

#### Node Environment (wird von Vercel automatisch gesetzt)

```bash
NODE_ENV=production  # Automatisch von Vercel
```

## Setup-Schritte in Vercel

1. **Vercel Dashboard** öffnen
2. Zu **Settings** → **Environment Variables** navigieren
3. Alle oben genannten Pflicht-Variablen für **Production** Environment hinzufügen
4. Domain unter **Settings** → **Domains** hinzufügen: `estrichmanager.de`

## Wichtige Hinweise

### Was ihr NICHT braucht:

- ❌ **Upstash Redis** - Nicht erforderlich, da Caching über TanStack Query läuft
- ❌ **Rate Limiting Variablen** - Optional, funktioniert auch ohne Redis
- ❌ **Security Keys** (API_SECRET_KEY, JWT_SECRET, etc.) - Werden nicht im Code verwendet
- ❌ **CSP/HSTS Variablen** - Werden über next.config.mjs gehandhabt
- ❌ **File Upload Limits** - Haben Default-Werte im Code
- ❌ **Multi-Tenancy Variablen** - Nur für Development relevant

### Wo die Keys zu finden sind:

1. **Supabase Keys**:
   - Login bei [supabase.com](https://supabase.com)
   - Projekt auswählen: `fhftgdffhkhmbwqbwiyt`
   - Settings → API
   - `anon public` und `service_role` Keys kopieren

2. **Resend API Key**:
   - Registrierung bei [resend.com](https://resend.com)
   - API Keys → Create API Key
   - Domain verifizieren für `estrichmanager.de`

3. **Sentry DSN**:
   - Registrierung/Login bei [sentry.io](https://sentry.io)
   - Create Project → Next.js
   - DSN aus Settings → Projects → Client Keys (DSN)

## Deployment Checkliste

- [ ] Alle Pflicht-Variablen in Vercel eingetragen
- [ ] Domain `estrichmanager.de` in Vercel hinzugefügt
- [ ] DNS Records bei Cloudflare konfiguriert
- [ ] Supabase Production Keys verwendet (nicht Development!)
- [ ] Resend Domain verifiziert
- [ ] Sentry Projekt erstellt und konfiguriert
- [ ] Build in Vercel erfolgreich durchgelaufen
