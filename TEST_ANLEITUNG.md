# 🚀 EN13813 DoP-Generator - Test-Anleitung

## ✅ Was wurde implementiert

### Fertige Features:
1. **Datenbank-Schema** - Alle Tabellen für EN13813
2. **Services** - Recipe, DoP-Generator, Validation, PDF-Generator
3. **UI-Seiten**:
   - EN13813 Dashboard (`/en13813`)
   - Rezeptur-Liste (`/en13813/recipes`)
   - Neue Rezeptur (`/en13813/recipes/new`)
   - DoP-Liste (`/en13813/dops`)
   - Neue DoP (`/en13813/dops/new`)
4. **API-Routes**:
   - `/api/en13813/recipes` - GET, POST
   - `/api/en13813/recipes/[id]` - GET, PUT, DELETE
   - `/api/en13813/dops` - GET, POST
5. **Formulare**:
   - RecipeForm-Komponente
   - DoP-Wizard

---

## 📋 Test-Workflow

### 1. **Migration ausführen** ⚠️ WICHTIG!

1. Öffne Supabase SQL Editor: https://supabase.com/dashboard/project/ovcxtfsonjrtyiwdwqmc/sql
2. Die Migration ist in deiner **Zwischenablage** (wurde kopiert)
3. Füge sie ein (Cmd+V) und klicke "Run"
4. Du solltest die Meldung sehen: "EN13813 migration completed successfully!"

### 2. **App öffnen**

```bash
# Terminal 1 - Falls Server nicht läuft
cd ~/dev/en13813
pnpm dev
```

Öffne im Browser: **http://localhost:3001**

### 3. **Anmelden/Registrieren**

Falls noch kein Account:
1. Klicke auf "Sign Up"
2. Registriere dich mit E-Mail
3. Bestätige E-Mail (Check Inbox)

### 4. **EN13813-Modul testen**

#### A. Dashboard aufrufen
1. Navigiere zu: http://localhost:3001/en13813
2. Du siehst das EN13813 Compliance Center Dashboard
3. Statistiken sollten angezeigt werden (initial bei 0)

#### B. Erste Rezeptur erstellen
1. Klicke auf "Neue Rezeptur" Button
2. Fülle das Formular aus:
   ```
   Rezeptur-Code: CT-C25-F4
   Name: Standard Zementestrich
   Typ: CT - Zementestrich
   Druckfestigkeit: C25
   Biegezugfestigkeit: F4
   Status: Aktiv
   ```
3. Klicke "Rezeptur erstellen"

#### C. DoP generieren (nach Migration)
1. Gehe zu: http://localhost:3001/en13813/dops
2. Klicke "Neue DoP erstellen"
3. Wähle die erstellte Rezeptur
4. Klicke "DoP Generieren"

---

## 🔍 Was funktioniert bereits

### ✅ Funktioniert:
- Login/Registrierung
- EN13813 Dashboard
- Rezeptur-Liste anzeigen
- Neue Rezeptur erstellen (Form)
- DoP-Liste anzeigen
- DoP-Wizard öffnen

### ⚠️ Funktioniert nach Migration:
- Rezeptur speichern in DB
- DoP generieren
- PDF erstellen
- QR-Code generieren

### ❌ Noch nicht implementiert:
- Rezeptur-Detailseite
- DoP-Detailseite mit PDF-Download
- Batch-Management
- Test-Report Upload
- Email-Versand

---

## 🐛 Bekannte Probleme & Lösungen

### Problem 1: "Unauthorized" Fehler
**Lösung:** Neu anmelden unter http://localhost:3001/login

### Problem 2: Keine Rezepturen sichtbar
**Lösung:** 
1. Migration ausführen
2. Rezeptur über UI erstellen
3. Status auf "Aktiv" setzen

### Problem 3: DoP-Generierung schlägt fehl
**Lösung:**
1. Stelle sicher, dass die Rezeptur "active" und "is_validated = true" ist
2. Prüfe in Supabase ob tenant_id gesetzt ist

### Problem 4: Seite lädt nicht
**Lösung:**
1. Developer Tools öffnen (F12)
2. Console auf Fehler prüfen
3. Server neu starten: `Ctrl+C` dann `pnpm dev`

---

## 📊 Supabase Daten prüfen

1. Gehe zu: https://supabase.com/dashboard/project/ovcxtfsonjrtyiwdwqmc/editor
2. Prüfe folgende Tabellen:
   - `tenants` - Sollte mindestens 1 Eintrag haben
   - `profiles` - Dein User-Profil
   - `en13813_recipes` - Gespeicherte Rezepturen
   - `en13813_dops` - Generierte DoPs

---

## 🎯 Quick Test Checklist

- [ ] Migration in Supabase ausgeführt
- [ ] App läuft auf http://localhost:3001
- [ ] Login funktioniert
- [ ] EN13813 Dashboard lädt
- [ ] Rezeptur-Formular öffnet sich
- [ ] Rezeptur wird gespeichert
- [ ] DoP-Wizard öffnet sich
- [ ] Rezeptur erscheint im Dropdown

---

## 💡 Nächste Schritte

Nach erfolgreichem Test können wir implementieren:

1. **DoP-Detail-Seite** mit PDF-Viewer
2. **PDF-Download** Funktionalität  
3. **Batch-Management** UI
4. **Test-Report Upload**
5. **Compliance-Kalender** Integration

---

## 🆘 Support

Bei Problemen:
1. Screenshot des Fehlers machen
2. Browser Console (F12) auf Fehler prüfen
3. Supabase Logs prüfen: Dashboard → Logs → API

**Viel Erfolg beim Testen! 🚀**