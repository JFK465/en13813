# DoP-Implementierungsplan für EN 13813 Konformität

## Aktueller Status: ~70% konform
Analysiert am: 2025-09-01

### Vorhandene Komponenten
- ✅ Grundlegende DoP-Generierung vorhanden
- ✅ PDF-Generierung implementiert
- ✅ Workflow-Status-Management
- ✅ Revisionsverwaltung
- ✅ QR-Code-Generierung
- ✅ Mehrsprachigkeit (DE/EN)

### Fehlende CPR/EN 13813 Anforderungen

## Implementierungsschritte für 100% Konformität

### 1. **Harmonisierte Spezifikation als eigener Abschnitt** ⚠️ FEHLT
**Problem:** Harmonisierte Norm wird nur als Zeile erwähnt, nicht als eigener Abschnitt
**Lösung:**
- Neuer Abschnitt zwischen Punkt 5 und 6 im PDF
- Expliziter Verweis auf EN 13813:2002
- Vollständiger Titel der Norm

### 2. **Notifizierte Stelle (System 3)** ⚠️ UNVOLLSTÄNDIG
**Problem:** 
- Aktuell nur System 4 implementiert
- Keine Unterstützung für notifizierte Stelle bei Brandschutzklasse
- Fehlende Felder: Zertifikatsnummer, Prüfbericht, Datum

**Lösung:**
- AVCP-System-Logik erweitern
- Wenn fire_class != 'NPD' → System 3
- Notified Body Datenstruktur erweitern
- PDF-Template für System 3 anpassen

### 3. **Leistungstabelle - Korrosive Stoffe** ⚠️ FEHLT
**Problem:** "Freisetzung korrosiver Stoffe" nicht explizit als erste Zeile
**Lösung:**
- IMMER als erste Zeile in Leistungstabelle
- Wert = Bindemitteltyp (CT/CA/MA/AS/SR)
- Harmonisierte Spezifikation-Spalte hinzufügen

### 4. **Standard-Konformitätserklärung** ⚠️ FEHLT
**Problem:** Standardtext nach CPR fehlt
**Lösung:**
- Vor Unterschriftsbereich einfügen
- Exakter CPR-konformer Text
- Referenz auf Abschnittsnummern

### 5. **Erweiterte Metadaten** ⚠️ TEILWEISE
**Problem:**
- Digitale URL vorhanden aber nicht im PDF
- Aufbewahrungsfrist nicht definiert
- Sprache nicht als Metadatum gespeichert

**Lösung:**
- DoP-Datenstruktur erweitern
- Metadaten im PDF-Footer
- Digitale Bereitstellungs-URL prominent

### 6. **DoP-Validierung** ⚠️ FEHLT
**Problem:** Keine Validierung vor Generierung
**Lösung:**
- Validierungsfunktion implementieren
- CPR-Pflichtfelder prüfen
- EN 13813 spezifische Anforderungen

## Dateistruktur-Änderungen

### 1. `types/index.ts`
- NotifiedBody Interface erweitern
- DoP Interface um fehlende Felder ergänzen
- Validierungs-Interfaces hinzufügen

### 2. `services/pdf-generator.service.ts`
- PDF-Template komplett überarbeiten
- Alle CPR-Abschnitte korrekt nummerieren
- System 3 Unterstützung
- Leistungstabelle mit 3 Spalten

### 3. `services/dop-generator.service.ts`
- AVCP-System-Logik implementieren
- Validierung vor Generierung
- Erweiterte Metadaten-Verwaltung

### 4. `database/migrations/`
- Neue Felder für notified_body
- Erweiterte Metadaten-Spalten

## Prioritäten

### Phase 1: Kritische CPR-Konformität (SOFORT)
1. Leistungstabelle mit korrosiven Stoffen
2. AVCP-System 3 Logik
3. Standard-Konformitätserklärung

### Phase 2: Vollständige EN 13813 Konformität
4. Harmonisierte Spezifikation als Abschnitt
5. Notifizierte Stelle vollständig
6. Validierung

### Phase 3: Optimierung
7. Erweiterte Metadaten
8. Digitale Bereitstellung
9. Mehrsprachige Vorlagen

## Geschätzter Aufwand
- Phase 1: 2-3 Stunden
- Phase 2: 3-4 Stunden  
- Phase 3: 2 Stunden
- **Gesamt: ~8-9 Stunden**

## Nächste Schritte
1. Types erweitern für notified_body und Metadaten
2. PDF-Generator komplett überarbeiten mit CPR-konformen Abschnitten
3. AVCP-System-Logik in dop-generator.service.ts
4. Validierung implementieren
5. Tests schreiben

## Fortschritt-Tracking
- [ ] Types erweitert
- [ ] PDF-Template CPR-konform
- [ ] AVCP-System 3 implementiert
- [ ] Leistungstabelle korrigiert
- [ ] Konformitätserklärung hinzugefügt
- [ ] Validierung implementiert
- [ ] Tests geschrieben
- [ ] Migration durchgeführt