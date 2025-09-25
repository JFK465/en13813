# Secret Rotation Guide - SOFORT HANDELN!

## 🚨 KRITISCH: Kompromittierte Secrets wurden in Git-History gefunden

Die folgenden Secrets wurden in der Git-History exponiert und müssen **SOFORT** rotiert werden:

### 1. Supabase Secrets (HÖCHSTE PRIORITÄT)

#### a) Supabase Dashboard öffnen
1. Gehe zu https://app.supabase.com
2. Wähle dein Projekt: `fhftgdffhkhmbwqbwiyt`
3. Navigiere zu Settings → API

#### b) Neue Keys generieren
1. **Service Role Key rotieren:**
   - Klicke auf "Generate new service_role key"
   - Kopiere den neuen Key
   - Aktualisiere in Vercel: `SUPABASE_SERVICE_ROLE_KEY`

2. **Anon Key rotieren:**
   - Klicke auf "Generate new anon key"
   - Kopiere den neuen Key
   - Aktualisiere in Vercel: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **JWT Secret rotieren:**
   - Unter Settings → API → JWT Settings
   - Generiere ein neues JWT Secret
   - Dies invalidiert alle existierenden Tokens!

### 2. Vercel Environment Variables aktualisieren

1. Gehe zu https://vercel.com/your-team/en13813/settings/environment-variables
2. Aktualisiere folgende Variablen:
   - `NEXT_PUBLIC_SUPABASE_URL` (bleibt gleich)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (neuer Wert)
   - `SUPABASE_SERVICE_ROLE_KEY` (neuer Wert)
   - `RESEND_API_KEY` (falls kompromittiert)

3. Redeploy die Anwendung nach dem Update

### 3. Lokale .env.local aktualisieren

```bash
# Erstelle neue .env.local mit den neuen Werten
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://fhftgdffhkhmbwqbwiyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<NEUER_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<NEUER_SERVICE_ROLE_KEY>
RESEND_API_KEY=<DEIN_RESEND_KEY>
EOF
```

### 4. Git History bereinigen

```bash
# Führe das Cleanup-Script aus
./scripts/remove-secrets-from-history.sh

# Nach erfolgreichem Cleanup:
git push --force --all
git push --force --tags
```

### 5. Team informieren

Sende folgende Nachricht an alle Entwickler:

```
WICHTIG: Security Update - Sofortige Aktion erforderlich!

1. Löscht eure lokale Repository-Kopie
2. Clont das Repository neu: git clone [repo-url]
3. Holt euch die neuen Environment Variables aus Vercel/1Password
4. Erstellt eine neue .env.local mit den aktualisierten Werten

Grund: Secrets wurden aus Git-History entfernt und alle API-Keys wurden rotiert.
```

### 6. Monitoring aktivieren

1. **Supabase Logs überprüfen:**
   - Dashboard → Logs → API Logs
   - Achte auf unauthorisierte Zugriffe mit alten Keys

2. **Vercel Logs überprüfen:**
   - Vercel Dashboard → Functions → Logs
   - Überprüfe auf 401/403 Fehler

### 7. Zusätzliche Sicherheitsmaßnahmen

#### a) 1Password / Secrets Manager einrichten
```bash
# Beispiel für 1Password CLI
op item create \
  --category=server \
  --title="EN13813 Production Secrets" \
  --vault="Development" \
  SUPABASE_SERVICE_ROLE_KEY="<value>" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="<value>"
```

#### b) Pre-commit Hook installieren
```bash
# Installiere detect-secrets
pip install detect-secrets

# Erstelle Baseline
detect-secrets scan > .secrets.baseline

# Füge pre-commit hook hinzu
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
EOF
```

## ⏰ Timeline

- **SOFORT**: Secrets in Supabase rotieren
- **In 30 Min**: Vercel Environment Variables aktualisieren
- **In 1 Stunde**: Git History bereinigen
- **In 2 Stunden**: Team informieren und neue Deploys durchführen
- **In 24 Stunden**: Logs auf verdächtige Aktivitäten überprüfen

## 📞 Notfall-Kontakte

- Supabase Support: support@supabase.io
- Vercel Support: support@vercel.com
- Security Team Lead: [Deine Kontaktdaten]

## ✅ Checkliste

- [ ] Supabase Service Role Key rotiert
- [ ] Supabase Anon Key rotiert
- [ ] JWT Secret rotiert (optional, aber empfohlen)
- [ ] Vercel Environment Variables aktualisiert
- [ ] Lokale .env.local aktualisiert
- [ ] Git History bereinigt
- [ ] Team informiert
- [ ] Monitoring aktiviert
- [ ] Pre-commit Hooks installiert
- [ ] Secrets Manager konfiguriert

---

**WICHTIG**: Dokumentiere alle durchgeführten Aktionen mit Zeitstempel für Audit-Zwecke.