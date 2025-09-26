# 🚨 DRINGEND: Sicherheitslücke - Secrets Rotation erforderlich

## Problem
Es wurden Secrets (API Keys, Tokens) in der Git-History gefunden:
- **apps/web/.env.production** (JWT Tokens)
- **vercel-env-import.txt** (JWT Tokens)

Diese sind öffentlich in der Git-History sichtbar und müssen **SOFORT** rotiert werden.

## Sofortmaßnahmen

### 1. Secrets rotieren (HÖCHSTE PRIORITÄT)

#### Supabase
1. Gehe zu [Supabase Dashboard](https://app.supabase.com)
2. Projekt auswählen: `fhftgdffhkhmbwqbwiyt`
3. Settings → API
4. Regeneriere:
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)
   - **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

#### Resend
1. Gehe zu [Resend Dashboard](https://resend.com/api-keys)
2. Lösche alten API Key
3. Erstelle neuen API Key
4. Notiere: RESEND_API_KEY

#### Sentry (falls betroffen)
1. Gehe zu [Sentry Settings](https://sentry.io/settings/)
2. Regeneriere Auth Token

### 2. Vercel Environment Variables aktualisieren
1. Gehe zu [Vercel Dashboard](https://vercel.com)
2. Projekt → Settings → Environment Variables
3. Aktualisiere ALLE rotierten Keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `SENTRY_AUTH_TOKEN` (falls vorhanden)

### 3. Git History bereinigen
```bash
# Script ausführen (bereits erstellt)
./remove-secrets-from-history.sh

# Nach Bestätigung: Force Push
git push origin --force --all
git push origin --force --tags
```

### 4. Team informieren
Alle Entwickler müssen:
```bash
# Option 1: Neu klonen
rm -rf en13813
git clone [repository-url]

# Option 2: Reset auf Remote
git fetch origin
git reset --hard origin/main
```

### 5. Lokale .env.local aktualisieren
Alle Entwickler müssen ihre lokalen `.env.local` Dateien mit den neuen Keys aktualisieren.

## Prävention

### ✅ Bereits implementiert:
- `.gitignore` enthält bereits alle sensitiven Dateien
- `.env.production`, `vercel-env-import.txt` sind gelistet

### Zusätzliche Maßnahmen:
1. **Pre-commit Hook** installieren:
   ```bash
   npm install --save-dev husky
   npx husky add .husky/pre-commit "git diff --cached --name-only | grep -E '\\.env|secret|key|token' && echo '⚠️  WARNING: Possible secret file!' && exit 1 || exit 0"
   ```

2. **GitHub Secret Scanning** aktivieren:
   - Repository → Settings → Security → Code security
   - Enable "Secret scanning"
   - Enable "Push protection"

3. **Verwende Umgebungsvariablen**:
   - Niemals Secrets direkt im Code
   - Immer über Vercel Environment Variables
   - Nutze `.env.local` nur lokal (nie committen)

## Status-Checkliste

- [ ] Supabase Service Role Key rotiert
- [ ] Supabase Anon Key rotiert
- [ ] Resend API Key rotiert
- [ ] Sentry Auth Token rotiert (falls vorhanden)
- [ ] Vercel Environment Variables aktualisiert
- [ ] Git History bereinigt
- [ ] Force Push durchgeführt
- [ ] Team informiert
- [ ] Alle Entwickler haben geupdated
- [ ] CI/CD Pipeline läuft mit neuen Keys

## Kontakt bei Problemen
Bei Fragen oder Problemen sofort melden!

---
**Zeitstempel:** $(date)
**Priorität:** KRITISCH - Sofort handeln!