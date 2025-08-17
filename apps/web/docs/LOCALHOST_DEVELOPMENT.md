# Localhost Development Guide

## Multi-Tenancy in der Entwicklung

Die Anwendung nutzt ein Multi-Tenancy-System basierend auf Subdomains. In der Produktion funktioniert das so:
- `tenant1.yourdomain.com` → Tenant "tenant1"
- `tenant2.yourdomain.com` → Tenant "tenant2"

### Problem bei Localhost

Bei der lokalen Entwicklung (`localhost:3000`) gibt es keine Subdomains, was zu Redirect-Loops führen kann.

### Lösung

Die Middleware wurde so angepasst, dass sie localhost-Entwicklung unterstützt:

1. **Automatische Erkennung**: Wenn die Anwendung auf `localhost` oder `127.0.0.1` läuft, wird die Tenant-Validierung übersprungen.

2. **Default Tenant**: In der Entwicklung wird automatisch der erste aktive Tenant aus der Datenbank verwendet.

3. **Konfiguration**: Sie können einen Standard-Tenant in der `.env.local` definieren:
   ```
   NEXT_PUBLIC_DEFAULT_TENANT_SLUG=default
   ```

### Fehlerbehandlung

- Ungültige Tenants werden nicht mehr auf `/invalid-tenant` umgeleitet (diese Route existiert nicht)
- Stattdessen erfolgt eine Umleitung auf `/login?error=invalid_tenant`
- Die Login-Seite zeigt eine entsprechende Fehlermeldung an

### Tenant Setup für Entwicklung

1. Erstellen Sie einen Test-Tenant in der Datenbank:
   ```sql
   INSERT INTO tenants (slug, company_name, status, plan) 
   VALUES ('default', 'Development Tenant', 'active', 'enterprise');
   ```

2. Oder nutzen Sie die Seed-Datei:
   ```bash
   npm run db:seed
   ```

### Produktions-Deployment

In der Produktion müssen Sie:
1. Subdomains für jeden Tenant konfigurieren
2. DNS-Einträge für `*.yourdomain.com` einrichten
3. SSL-Zertifikate für Wildcard-Domains verwenden

### Debugging

Falls Sie weiterhin Redirect-Probleme haben:
1. Prüfen Sie die Browser-Konsole auf Netzwerk-Requests
2. Schauen Sie in die Server-Logs
3. Stellen Sie sicher, dass ein aktiver Tenant in der Datenbank existiert
4. Löschen Sie Browser-Cache und Cookies