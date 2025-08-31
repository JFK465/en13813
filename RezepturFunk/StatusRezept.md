# EN 13813 Rezeptur-Implementierung: Status und Defizite

## Übersicht
Analyse der bestehenden Rezeptur-Implementierung im Vergleich zu den EN 13813 Anforderungen aus Rezeptur.txt.

## ✅ Bereits implementierte Anforderungen

### 1. Grundlegende Klassifizierung
- **Bindemittel-Typ**: Alle 5 Typen (CT, CA, MA, AS, SR) ✅
- **Druckfestigkeitsklassen**: C5-C80 vollständig ✅
- **Biegezugfestigkeitsklassen**: F1-F50 vollständig ✅
- **Verschleißwiderstand**: A-Klassen (Böhme) implementiert ✅
- **Oberflächenhärte**: Als Freitextfeld vorhanden ✅
- **Brandklasse**: A1fl-Ffl nach EN 13501-1 ✅
- **Automatische EN-13813-Bezeichnung**: Generierung implementiert ✅

### 2. Datenbank-Schema
- Tenant-basierte Mandantenfähigkeit ✅
- Recipe-Code Generierung ✅
- Status-Management (draft/active/archived) ✅
- Validierungssystem mit error tracking ✅
- RLS Policies für Datensicherheit ✅

### 3. UI/UX Features
- Formular mit Tabs (Grunddaten/Eigenschaften/Zusätzlich) ✅
- Live-Preview des Rezeptur-Codes ✅
- Validierung der Eingabeformate ✅
- Status-Verwaltung ✅

## ❌ Fehlende kritische Anforderungen

### 1. Materialzusammensetzung (KRITISCH)
**Komplett fehlend:**
- Bindemittel-Details (genaue Bezeichnung, Mengenangaben, Lieferantenspezifikation)
- Zuschlagstoffe (Korngrößenverteilung, Sieblinie, Art der Gesteinskörnung)
- Zusatzmittel Details (Fließmittel, Verzögerer, Beschleuniger mit genauer Dosierung)
- Fasern (Art, Länge, Dosierung)
- Wasserzugabe und W/B-Wert

### 2. Verschleißwiderstand-Methoden (WICHTIG)
**Nur teilweise implementiert:**
- ✅ A-Klassen (Böhme) vorhanden
- ❌ AR-Klassen (BCA) fehlen
- ❌ RWA-Klassen (Rollrad) fehlen
- ❌ Logik für "genau eine Methode bei Wearing Surface" fehlt

### 3. Frischmörtel-Eigenschaften (WICHTIG)
**Komplett fehlend:**
- Konsistenz (Messverfahren und Zielbereich)
- Erstarrungszeiten (Anfang/Ende)
- pH-Wert
- Verarbeitungszeit
- Temperaturbereich für Verarbeitung

### 4. Verarbeitungsparameter (WICHTIG)
**Komplett fehlend:**
- Mischvorschrift (Reihenfolge, Zeiten)
- Mischtechnik (Zwangsmischer, Freifallmischer)
- Einbaubedingungen detailliert
- Nachbehandlung (Folie, Nachbehandlungsmittel)
- Erhärtungszeiten (begehbar, belegreif)

### 5. Prüfnachweise & ITT (KRITISCH)
**Nur Basis implementiert:**
- ✅ Test Reports Tabelle existiert
- ❌ Keine Verknüpfung Leistungsklasse → Prüfnorm
- ❌ Kein ITT-Mapping (EN 13892-x Prüfungen)
- ❌ Keine automatische Prüfplan-Generierung
- ❌ Prüfalter nicht erfasst

### 6. Werkseigene Produktionskontrolle (WPK/FPC)
**Komplett fehlend:**
- Kontrollplan (Prüfhäufigkeiten, Toleranzen)
- Eingangskontrolle Rohstoffe
- Grenzwerte und Maßnahmen bei Abweichungen
- Kalibrierungsmanagement
- Routineprüfungen Definition

### 7. Spezielle Estrich-Eigenschaften
**Fehlend je nach Typ:**
- **AS (Gussasphalt)**: IC/IP Eindrückklassen fehlen
- **SR (Kunstharz)**: B-Klassen (Verbundfestigkeit), IR-Klassen (Schlagfestigkeit) fehlen
- **Heizestriche**: Wärmeleitfähigkeit λ fehlt
- Schwinden/Quellen nicht erfasst
- Elastizitätsmodul E nicht erfasst

### 8. Versionierung & Änderungsmanagement
**Nur rudimentär:**
- ✅ created_at/updated_at vorhanden
- ❌ Keine Versionsnummern
- ❌ Keine Änderungshistorie
- ❌ Kein Re-ITT Trigger bei Änderungen
- ❌ Keine Übergangsfristen

### 9. Rückverfolgbarkeit
**Teilweise implementiert:**
- ✅ Batches-Tabelle vorhanden
- ❌ Keine Rohstoff-Chargen Erfassung
- ❌ Keine Lieferantennachweise
- ❌ Keine Rückstellmuster-Verwaltung

### 10. Verwendungszweck-Logik
**Fehlend:**
- Keine Unterscheidung Wearing Surface / mit Belag
- Keine automatische Pflichtfeld-Steuerung basierend auf Use-Case
- Keine Heizestrich-Kennzeichnung

## 🔧 Prioritäre Handlungsempfehlungen

### Phase 1: Kritische Normkonformität
1. **Materialzusammensetzung** erweitern (neue Tabellen/JSONB)
2. **ITT-Prüfplan** Mapping implementieren
3. **Verschleißmethoden** AR/RWA ergänzen
4. **Verwendungszweck-Logik** einbauen

### Phase 2: Vollständige Konformität
1. **Frischmörtel-Eigenschaften** hinzufügen
2. **WPK/FPC** System aufbauen
3. **Spezielle Eigenschaften** je Estrichtyp
4. **Verarbeitungsparameter** erfassen

### Phase 3: Prozessoptimierung
1. **Versionierung** mit Änderungshistorie
2. **Rückverfolgbarkeit** komplett
3. **Automatische Validierung** gegen Norm
4. **Compliance-Tasks** automatisieren

## Geschätzter Aufwand
- **Phase 1**: 3-4 Tage (kritisch für Normkonformität)
- **Phase 2**: 4-5 Tage (vollständige Konformität)
- **Phase 3**: 2-3 Tage (Optimierung)

**Gesamt: ~10-12 Tage für vollständige EN 13813 Konformität**

## Risiken bei Nicht-Umsetzung
⚠️ **Ohne Phase 1**: Rezepturen sind NICHT normkonform, DoPs ungültig
⚠️ **Ohne Phase 2**: Eingeschränkte Normkonformität, mögliche Haftungsrisiken
⚠️ **Ohne Phase 3**: Manuelle Fehleranfälligkeit, ineffiziente Prozesse