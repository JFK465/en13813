# 🚨 Sentry Setup - Manuelle Konfiguration

Da wir bereits alle Sentry-Dateien konfiguriert haben, brauchst du nur noch die DSN einzutragen!

## ✅ Was bereits erledigt ist:

1. **@sentry/nextjs** ist installiert ✓
2. **sentry.client.config.ts** erstellt ✓
3. **sentry.server.config.ts** erstellt ✓
4. **sentry.edge.config.ts** erstellt ✓
5. **next.config.mjs** mit Sentry konfiguriert ✓

## 📝 Was du noch machen musst:

### 1. Hole dir deine Sentry DSN:

1. Gehe zu https://sentry.io
2. Logge dich ein (oder registriere dich)
3. Gehe zu deinem Projekt: **en13813-web**
4. Klicke auf **Settings** → **Client Keys (DSN)**
5. Kopiere die **DSN** (sieht so aus):
   ```
   https://abc123xyz@o1234567.ingest.sentry.io/1234567890
   ```

### 2. Füge die DSN in `.env.local` ein:

```bash
cd apps/web
```

Dann öffne `.env.local` und füge hinzu:

```env
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://abc123xyz@o1234567.ingest.sentry.io/1234567890
SENTRY_DSN=https://abc123xyz@o1234567.ingest.sentry.io/1234567890

# Optional (für Source Maps)
SENTRY_ORG=jonas-kruger
SENTRY_PROJECT=en13813-web
SENTRY_AUTH_TOKEN=sntrys_xxx  # Von Settings → Account → API → Auth Tokens
```

### 3. Teste die Integration:

Starte die App:
```bash
pnpm dev
```

Füge temporär irgendwo im Code ein (z.B. in einer Page Component):
```tsx
// apps/web/app/(auth)/en13813/dashboard/page.tsx
import * as Sentry from '@sentry/nextjs'

// In der Component:
useEffect(() => {
  // Test Error - entferne das wieder nach dem Test!
  Sentry.captureException(new Error("Test Sentry Integration"))
}, [])
```

### 4. Prüfe im Sentry Dashboard:

1. Gehe zu https://sentry.io
2. Öffne dein Projekt **en13813-web**
3. Du solltest den Test-Error sehen!

## 🎯 Fertig!

Wenn du den Test-Error im Sentry Dashboard siehst, ist alles korrekt konfiguriert:

- ✅ Alle JavaScript Errors werden automatisch getrackt
- ✅ Performance Monitoring ist aktiv
- ✅ Session Replays bei Errors
- ✅ Sensitive Daten werden gefiltert

## 🔧 Troubleshooting:

**Error erscheint nicht in Sentry?**
- Prüfe ob die DSN korrekt ist (keine Leerzeichen!)
- Stelle sicher dass `NODE_ENV=production` oder teste mit `SENTRY_DEBUG=true`
- Check Browser Console für Sentry Logs

**Source Maps funktionieren nicht?**
- Du brauchst einen Auth Token (siehe oben)
- Bei Vercel Deploy werden sie automatisch hochgeladen

## 📊 Was Sentry jetzt automatisch trackt:

- **Uncaught Exceptions** - Alle unbehandelten Fehler
- **Promise Rejections** - Fehlgeschlagene Promises
- **Network Errors** - API Fehler
- **Performance** - Langsame API Calls & Seiten
- **User Context** - Welcher User hatte den Fehler
- **Breadcrumbs** - Was passierte vor dem Fehler
- **Session Replays** - Video-Replay bei Errors (10% Sample Rate)

## 🚀 Nächste Schritte:

1. **Alerts einrichten** - Email bei kritischen Errors
2. **Slack Integration** - Notifications im Team Channel
3. **Release Tracking** - Welche Version hat den Bug?
4. **Custom Events** - Business-relevante Events tracken

---

**Hinweis:** Der interaktive Wizard (`npx @sentry/wizard`) ist optional. Da wir alle Configs bereits haben, brauchst du nur die DSN!