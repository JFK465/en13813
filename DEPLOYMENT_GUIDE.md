# 🚀 EN13813 - DEPLOYMENT GUIDE

**Vollständige Anleitung zur Veröffentlichung der EN13813 Compliance Management Software**

---

## 📋 Übersicht: Was wird benötigt?

| Service | Zweck | Kosten | Dringlichkeit |
|---------|-------|--------|---------------|
| **Vercel** | Hosting & Deployment | Kostenlos (Hobby) | ⚠️ KRITISCH |
| **Supabase** | Datenbank & Auth | ✅ Bereits vorhanden | ✅ FERTIG |
| **Resend** | Email-Versand | Kostenlos (100/Tag) | ⚠️ KRITISCH |
| **Sentry** | Error Tracking | Kostenlos (5k/Monat) | 📊 WICHTIG |
| **Upstash** | Rate Limiting | Kostenlos (10k/Tag) | 🔒 OPTIONAL |
| **Domain** | Eigene URL | ~15€/Jahr | 💡 EMPFOHLEN |

---

## 🔥 SCHRITT 1: Vercel Deployment (15 Min) - KRITISCH

### 1.1 Vercel Account erstellen
1. **Gehe zu:** https://vercel.com/signup
2. **Registriere mit:** GitHub (empfohlen) oder Email
3. **Plan wählen:** Hobby (kostenlos)

### 1.2 Projekt importieren
1. **Klicke:** "Add New..." → "Project"
2. **Wähle:** "Import Git Repository"
3. **Repository:** `en13813` auswählen
4. **Framework Preset:** Next.js (wird automatisch erkannt)

### 1.3 Build Settings konfigurieren
```yaml
Framework Preset: Next.js
Root Directory: apps/web  # WICHTIG: Monorepo!
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

### 1.4 Environment Variables hinzufügen
**Klicke auf "Environment Variables" und füge ALLE diese ein:**

```bash
# ✅ BEREITS VORHANDEN (aus .env.local kopieren)
NEXT_PUBLIC_SUPABASE_URL=https://fhftgdffhkhmbwqbwiyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 🔴 NEUE - MÜSSEN ERSTELLT WERDEN
RESEND_API_KEY=                    # Von Resend (siehe unten)
NEXT_PUBLIC_SENTRY_DSN=            # Von Sentry (siehe unten)
UPSTASH_REDIS_REST_URL=           # Optional (siehe unten)
UPSTASH_REDIS_REST_TOKEN=         # Optional (siehe unten)

# 📝 APP CONFIGURATION
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://en13813.vercel.app  # Oder deine Domain
EMAIL_FROM=EN13813 System <noreply@en13813.app>
LOG_LEVEL=info
DISABLE_RATE_LIMIT=false
```

### 1.5 Deploy!
- **Klicke:** "Deploy"
- **Warte:** 2-5 Minuten
- **Ergebnis:** https://en13813-[username].vercel.app

---

## 📧 SCHRITT 2: Resend Email Service (5 Min) - KRITISCH

### 2.1 Account erstellen
1. **Gehe zu:** https://resend.com/signup
2. **Registriere mit:** Email oder GitHub
3. **Verify:** Email-Adresse bestätigen

### 2.2 API Key generieren
1. **Dashboard:** → "API Keys"
2. **Create API Key:**
   - Name: `Production`
   - Permission: `Full Access`
3. **⚠️ KOPIERE:** `re_AbCdEfGhIjKlMnOpQrStUvWxYz`

### 2.3 Domain Setup (Optional aber empfohlen)
1. **Add Domain:** → "Domains" → "Add Domain"
2. **Domain:** `en13813.app` (oder deine Domain)
3. **DNS Records hinzufügen:**
   ```
   TXT  resend._domainkey  p=MIGfMA0GCS...
   TXT  _dmarc            v=DMARC1; p=none;
   MX   10                feedback-smtp.eu.resend.com
   ```
4. **Verify:** Klick "Verify DNS Records"

### 2.4 In Vercel eintragen
```bash
RESEND_API_KEY=re_AbCdEfGhIjKlMnOpQrStUvWxYz
EMAIL_FROM=EN13813 System <noreply@en13813.app>  # Oder @resend.dev für Tests
```

---

## 🚨 SCHRITT 3: Sentry Error Tracking (10 Min) - WICHTIG

### 3.1 Account & Projekt
1. **Gehe zu:** https://sentry.io/signup
2. **Registriere:** Mit GitHub (empfohlen)
3. **Create Project:**
   - Platform: `Next.js`
   - Project Name: `en13813-web`
   - Team: Default

### 3.2 DSN kopieren
**Nach Projekt-Erstellung siehst du:**
```
https://1234567890abcdef@o123456.ingest.sentry.io/1234567
```
**⚠️ KOPIERE diese komplette URL!**

### 3.3 Auth Token für Source Maps (Optional)
1. **Settings** → **Account** → **API** → **Auth Tokens**
2. **Create New Token:**
   - Name: `Vercel Deploy`
   - Scopes: `project:releases`
3. **⚠️ KOPIERE:** `sntrys_<YOUR-SENTRY-AUTH-TOKEN>`

### 3.4 In Vercel eintragen
```bash
NEXT_PUBLIC_SENTRY_DSN=https://1234567890abcdef@o123456.ingest.sentry.io/1234567
SENTRY_DSN=https://1234567890abcdef@o123456.ingest.sentry.io/1234567
SENTRY_ORG=jonas-kruger            # Dein Sentry Org Name
SENTRY_PROJECT=en13813-web
SENTRY_AUTH_TOKEN=sntrys_<YOUR-TOKEN>  # Optional für Source Maps
```

---

## 🔒 SCHRITT 4: Upstash Redis für Rate Limiting (5 Min) - OPTIONAL

### 4.1 Account erstellen
1. **Gehe zu:** https://upstash.com
2. **Sign up:** Mit GitHub
3. **Create Database:**
   - Name: `en13813-ratelimit`
   - Region: `eu-west-1` (Frankfurt)
   - Type: `Regional`

### 4.2 Credentials kopieren
**Dashboard zeigt:**
```
REST URL: https://eu1-example-12345.upstash.io
REST Token: AX4AAIjcDE2OTU0Nz...
```

### 4.3 In Vercel eintragen
```bash
UPSTASH_REDIS_REST_URL=https://eu1-example-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX4AAIjcDE2OTU0Nz...
```

---

## 🌐 SCHRITT 5: Custom Domain (Optional aber empfohlen)

### 5.1 Domain kaufen
**Empfohlene Anbieter:**
- Namecheap (~12€/Jahr)
- Google Domains (~15€/Jahr)
- Cloudflare (~10€/Jahr)

**Vorschläge:**
- `en13813.app`
- `estrich-compliance.de`
- `floor-quality.eu`

### 5.2 In Vercel verbinden
1. **Vercel Dashboard** → **Settings** → **Domains**
2. **Add Domain:** `en13813.app`
3. **DNS konfigurieren:**
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

### 5.3 SSL automatisch
- Vercel stellt automatisch SSL-Zertifikate aus
- HTTPS ist sofort aktiv

---

## ✅ SCHRITT 6: Finale Checkliste vor Go-Live

### 6.1 Environment Variables in Vercel prüfen
```bash
# PFLICHT - Ohne diese läuft nichts!
✅ NEXT_PUBLIC_SUPABASE_URL        # Bereits vorhanden
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY   # Bereits vorhanden
✅ SUPABASE_SERVICE_ROLE_KEY       # Bereits vorhanden
⚠️ RESEND_API_KEY                  # MUSS eingetragen werden
⚠️ NEXT_PUBLIC_SENTRY_DSN          # SOLLTE eingetragen werden

# OPTIONAL - Verbessern die App
○ UPSTASH_REDIS_REST_URL          # Für Rate Limiting
○ UPSTASH_REDIS_REST_TOKEN        # Für Rate Limiting
○ SENTRY_AUTH_TOKEN                # Für bessere Error Details
```

### 6.2 Deployment triggern
```bash
# Nach Environment Variables Update:
Vercel Dashboard → Deployments → Redeploy
```

### 6.3 Test-Checkliste
- [ ] Homepage lädt
- [ ] Login funktioniert
- [ ] Rezeptur kann erstellt werden
- [ ] PDF-Export funktioniert
- [ ] Email-Versand testen (Password Reset)
- [ ] Error in Sentry sichtbar (Test-Error werfen)

---

## 📊 Winston Logging - Automatisch aktiv!

**Winston ist bereits vollständig konfiguriert und benötigt KEINE weiteren Schritte!**

In Production werden Logs automatisch:
- In Vercel Functions Logs gespeichert
- Als strukturierte JSON ausgegeben
- Nach Level gefiltert (nur info, warn, error)

**Logs ansehen:**
```
Vercel Dashboard → Functions → Logs
```

---

## 🔐 Sicherheits-Checkliste

### Bereits implementiert ✅
- [x] Rate Limiting vorbereitet
- [x] SQL Injection Protection (Supabase RLS)
- [x] XSS Protection (React)
- [x] CSRF Protection (SameSite Cookies)
- [x] Secure Headers (next.config.js)
- [x] Sensitive Data Filtering (Sentry)

### Nach Deployment prüfen ⚠️
- [ ] HTTPS aktiv (automatisch via Vercel)
- [ ] Environment Variables nicht im Code
- [ ] Supabase RLS Policies aktiv
- [ ] Rate Limiting aktiv (wenn Upstash konfiguriert)

---

## 📱 Monitoring nach Launch

### Vercel Dashboard
- **Analytics:** Besucher, Performance
- **Functions:** API Logs, Errors
- **Deployments:** Build Status

### Sentry Dashboard
- **Issues:** Alle Errors
- **Performance:** Langsame Requests
- **Releases:** Welche Version hat Bugs

### Supabase Dashboard
- **Database:** Queries, Performance
- **Auth:** User Registrierungen
- **Storage:** Datei-Uploads

---

## 🆘 Troubleshooting

### "500 Error" nach Deploy
```bash
# Check:
1. Alle Environment Variables in Vercel?
2. Vercel Dashboard → Functions → Logs
3. Sentry Dashboard für Error Details
```

### "Database Connection Failed"
```bash
# Check:
1. SUPABASE_SERVICE_ROLE_KEY korrekt?
2. Supabase Projekt läuft?
3. IP Whitelist in Supabase (wenn aktiviert)
```

### "Emails werden nicht gesendet"
```bash
# Check:
1. RESEND_API_KEY eingetragen?
2. EMAIL_FROM Domain verifiziert?
3. Resend Dashboard → Logs
```

---

## 💰 Kostenübersicht

### Monatliche Kosten (bei Start)
- **Vercel:** 0€ (Hobby Plan)
- **Supabase:** 0€ (Free Tier)
- **Resend:** 0€ (100 Emails/Tag)
- **Sentry:** 0€ (5k Events)
- **Upstash:** 0€ (10k Requests/Tag)
- **Domain:** ~1,25€/Monat

**TOTAL:** ~1,25€/Monat 🎉

### Wann upgraden?
- **Vercel Pro:** Bei >100GB Bandwidth/Monat (20$/Monat)
- **Supabase Pro:** Bei >500MB Database (25$/Monat)
- **Resend Pro:** Bei >100 Emails/Tag (20$/Monat)

---

## 🎯 Quick Start - Minimal Setup (30 Min)

**Absolute Mindestanforderungen für Launch:**

1. **Vercel Account** → Deploy
2. **Resend API Key** → Emails funktionieren
3. **Environment Variables** kopieren

**Das war's! Die App läuft!**

Sentry und Domain können später hinzugefügt werden.

---

## 📞 Support & Hilfe

**Bei Problemen:**
1. Check diese Dokumentation
2. Vercel Dashboard → Support
3. GitHub Issues erstellen
4. Stack Overflow: Tag `nextjs` + `vercel`

**Dokumentation:**
- [Vercel Docs](https://vercel.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Supabase Docs](https://supabase.com/docs)

---

**Letzte Aktualisierung:** 2025-01-22
**Geschätzte Setup-Zeit:** 30-60 Minuten
**Schwierigkeit:** ⭐⭐☆☆☆ (Einfach-Mittel)