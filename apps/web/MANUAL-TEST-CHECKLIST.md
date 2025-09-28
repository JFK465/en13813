# ✅ Manuelle Test-Checkliste - EN13813 Recipe Management

**Ziel:** Einmal komplett durch die Anwendung als echter User
**Dauer:** ~15-20 Minuten
**Browser:** Chrome/Firefox/Safari (aktuelle Version)

---

## 🚀 Vorbereitung

1. **Server starten:**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Browser öffnen:**
   ```
   http://localhost:3001
   ```

3. **Test-Daten bereithalten:**
   - Rezept-Code: `TEST-2025-001`
   - Name: `Industrieestrich CT-C30-F5`

---

## 📝 Test 1: REZEPT ERSTELLEN

### Navigation
- [ ] Öffne `/en13813/recipes/new`
- [ ] Seite lädt ohne Fehler
- [ ] Formular wird angezeigt

### Grunddaten eingeben
- [ ] **Rezept-Code:** `TEST-2025-001`
- [ ] **Name:** `Industrieestrich CT-C30-F5`
- [ ] **Beschreibung:** `Hochbelastbarer Estrich für Industriehallen`
- [ ] **Typ:** `CT` auswählen

### Herstellerangaben
- [ ] **Hersteller:** `Musterfirma GmbH`
- [ ] **Adresse:** `Musterstraße 1, 12345 Musterstadt`
- [ ] **Produktname:** `PowerScreed 30`

### Mechanische Eigenschaften
- [ ] **Druckfestigkeit:** `C30`
- [ ] **Biegezugfestigkeit:** `F5`
- [ ] **Prüfalter:** `28` Tage
- [ ] **Frühfestigkeit:** ☐ (nicht ankreuzen)

### Verschleißwiderstand
- [ ] **Methode:** `Böhme`
- [ ] **Klasse:** `A15`

### Weitere Eigenschaften
- [ ] **Oberflächenhärte:** `SH100`
- [ ] **Haftzugfestigkeit:** `B2.0`
- [ ] **Rollwiderstand:** `RWFC350`

### Brandschutz
- [ ] **Brandklasse:** `A1fl`

### Konformität
- [ ] **AVCP-System:** `4`
- [ ] **Benannte Stelle:** `1234`

### Material (vereinfacht)
- [ ] **Bindemitteltyp:** `CT`
- [ ] **Bindemittel:** `CEM I 42,5 R`
- [ ] **Bindemittelmenge:** `350` kg/m³
- [ ] **w/z-Wert:** `0.45`

### Speichern
- [ ] **Speichern-Button** klicken
- [ ] Keine Fehlermeldung erscheint
- [ ] Weiterleitung erfolgt (oder Success-Message)
- [ ] **Rezept-ID notieren:** _________________

**✅ Test 1 erfolgreich?** ☐

---

## 📋 Test 2: REZEPT IN LISTE ANZEIGEN

### Navigation
- [ ] Öffne `/en13813/recipes`
- [ ] Liste lädt ohne Fehler

### Rezept suchen
- [ ] Rezept `TEST-2025-001` ist in der Liste
- [ ] Name wird korrekt angezeigt
- [ ] Druckfestigkeit `C30` wird angezeigt
- [ ] Status ist sichtbar

### Optional: Suche testen
- [ ] Suchfeld eingeben: `Industrieestrich`
- [ ] Enter drücken
- [ ] Nur relevante Ergebnisse werden angezeigt

**✅ Test 2 erfolgreich?** ☐

---

## 👁️ Test 3: REZEPT DETAILS ANSEHEN

### Rezept öffnen
- [ ] Klick auf `TEST-2025-001` in der Liste
- [ ] Detail-Seite öffnet sich

### Daten verifizieren
- [ ] Rezept-Code korrekt
- [ ] Name korrekt
- [ ] Hersteller wird angezeigt
- [ ] Alle Festigkeitsklassen sichtbar
- [ ] Material-Daten vorhanden

### Navigation
- [ ] "Zurück zur Liste" funktioniert
- [ ] "Bearbeiten" Button vorhanden

**✅ Test 3 erfolgreich?** ☐

---

## ✏️ Test 4: REZEPT BEARBEITEN

### Bearbeiten öffnen
- [ ] "Bearbeiten" Button klicken
- [ ] Formular lädt mit vorhandenen Daten

### Daten prüfen
- [ ] Alle Felder sind vorausgefüllt
- [ ] Werte stimmen mit Original überein

### Änderungen vornehmen
- [ ] **Name ändern:** `Industrieestrich CT-C30-F5 PLUS`
- [ ] **Druckfestigkeit:** auf `C35` ändern
- [ ] **Notizen hinzufügen:** `Verbesserte Rezeptur mit Fasern`

### Speichern
- [ ] "Speichern" klicken
- [ ] Keine Fehlermeldung
- [ ] Änderungen werden übernommen

### Verifizieren
- [ ] Neuer Name wird angezeigt
- [ ] Druckfestigkeit ist jetzt `C35`
- [ ] Notizen sind gespeichert

**✅ Test 4 erfolgreich?** ☐

---

## 🗑️ Test 5: REZEPT LÖSCHEN

### Lösch-Dialog
- [ ] "Löschen" Button klicken
- [ ] Bestätigungs-Dialog erscheint
- [ ] Warnung wird angezeigt

### Bestätigen
- [ ] "Ja, löschen" klicken
- [ ] Weiterleitung zur Liste

### Verifizieren
- [ ] Rezept ist NICHT mehr in der Liste
- [ ] Optional: Success-Message erscheint

**✅ Test 5 erfolgreich?** ☐

---

## 🏁 GESAMT-ERGEBNIS

### Erfolgreiche Tests:
- [ ] Test 1: Erstellen
- [ ] Test 2: Liste
- [ ] Test 3: Details
- [ ] Test 4: Bearbeiten
- [ ] Test 5: Löschen

### Gefundene Probleme:
1. _________________________________
2. _________________________________
3. _________________________________

### Performance:
- [ ] Ladezeiten akzeptabel (< 2 Sek)
- [ ] Keine spürbaren Verzögerungen
- [ ] Smooth User Experience

### UI/UX:
- [ ] Intuitive Navigation
- [ ] Klare Fehlermeldungen
- [ ] Responsive Design funktioniert

---

## 📊 BEWERTUNG

**Gesamtbewertung:** _____ / 5

**Ready for Production?**
- [ ] ✅ JA - Alles funktioniert
- [ ] ⚠️ MIT EINSCHRÄNKUNGEN - Kleine Bugs
- [ ] ❌ NEIN - Kritische Fehler

**Kommentare:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Getestet von:** _________________
**Datum:** _________________
**Browser:** _________________
**Betriebssystem:** _________________