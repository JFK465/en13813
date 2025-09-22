Mega—hier ist eine **konkrete Navigationsstruktur** für euer EN-13813-SaaS (CT, **AVCP-System 4**) inkl. **was jede Seite genau abdecken muss**, **Validierungen**, **Outputs** und **woher die Pflicht stammt**.

---

# Navigation (empfohlen)

1. **Dashboard**
2. **Rezepturen**
3. **Prüfberichte** (ITT & FPC)
4. **Qualitätskontrolle (FPC)**
5. **Chargen & Rückverfolgbarkeit**
6. **Kalibrierung / Prüfmittel**
7. **Leistungserklärungen (DoP) & CE**
8. **Marking & Lieferschein**
9. **Abweichungen / CAPA (Light)**
10. **Compliance & Berichte**
11. **Audit-Log**
12. **Einstellungen / Stammdaten**

> Damit seid ihr **vollständig** für System 4: ITT + FPC beim Hersteller, CE ohne NB-Nummer, Marking/Label & Pflicht-Records.&#x20;

---

## 1) Dashboard

**Zweck:** Tagesübersicht & Risiken.

**Inhalte**

* Kacheln: **Fällige Kalibrierungen** (OK/Due/Overdue), **ausstehende FPC-Prüfungen**, **offene Abweichungen**, **DoP-Zähler**.
* „Zuletzt geändert“: Rezepturen, Chargen, Prüfberichte (mit Autoren).

**Aktionen**

* Quick-Links: „Neue Rezeptur“, „Prüfbericht erfassen“, „DoP erzeugen“.

**Warum:** Sofortsicht auf FPC-Plan & Kalibrierstatus (beides **Pflicht** in 6.3).&#x20;

---

## 2) Rezepturen

**Zweck:** Produkt-Stammdaten + EN-Bezeichnung.

**Muss-Felder**

* **Typ** (CT), **C-Klasse**, **F-Klasse** (Prüfmethode prEN 13892-2), **Bezeichnung** autogeneriert: z. B. *EN 13813 CT-C25-F4*. &#x20;
* Optional **Verschleißmethode** (nur wenn „Nutzschicht ohne Belag“): **A** (cm³/50 cm²), **AR** (×10⁻² mm), **RWA** (cm³), exakt **eine** Methode. &#x20;
* Metadaten: Version, Status, Verwendungszweck.

**Validierungen**

* Wenn „Nutzschicht ohne Belag“ ⇒ **eine** Verschleißmethode **erforderlich**; Einheiten strikt prüfen.&#x20;
* Bezeichnung folgt **Klausel 7** (Type + Klassen + ggf. optionale Merkmale).&#x20;

**Output**

* Rezeptur-Snapshot-ID (für Chargen & ITT-Bindung).

---

## 3) Prüfberichte (ITT & FPC)

**Zweck:** Nachweise zu deklarierten Eigenschaften.

**Sektionen**

* **ITT** (Initial Type Testing): Anlass, Probenahme nach prEN 13892-1, Methode prEN 13892-2 (C/F), ggf. Verschleißprüfung, Labor, Datum, Ergebnisse. ITT ist nötig **vor Markteinführung** und **bei Änderungen** (Rezeptur/Rohstoff/Prozess).&#x20;
* **FPC-Prüfungen** (laufende Produktion): identische Merkmale, aber stichprobenbasiert je Prüfplan (siehe Modul 4).&#x20;

**Validierungen**

* **Konformitäts-Check**: Gegen deklarierte Klassen, je nach Modus (Einzelwert/Statistik). Für MVP: **Einzelwert** = jeder 28-Tage-Wert ≥ Klassenwert (z. B. C25 ⇒ ≥ 25).&#x20;

**Uploads**

* PDF-Berichte, Kalibrierscheine verknüpfen.

---

## 4) Qualitätskontrolle (FPC)

**Zweck:** Prüfplan, Durchführung, Bewertung nach § 9.

**Funktionen**

* **Prüfplan-Editor**: Merkmal, Frequenz, n, Methode, Grenz/Klassen; berücksichtigt Produkt, Verfahren, Bedeutungsgrad, Historie.&#x20;
* **Aufgaben/Fälligkeiten** + Erinnerungen.
* **Ergebniserfassung** mit Geräte-Link.
* **Bewertung**:

  * **Modus A – Einzelwerte** (MVP) → alle Ergebnisse ≥ Klasse ⇒ PASS.&#x20;
  * **Modus B – Statistik** (optional) → CA-Tabelle/CR-Werte.&#x20;

**Pflicht-Records**

* Ergebnisse, Datum, Produkt-ID, Prüfer, Geräte; **alles freigabe-pflichtig** (autorisierte Personen).&#x20;

---

## 5) Chargen & Rückverfolgbarkeit

**Zweck:** Vollständige Traceability & Freigabe.

**Muss-Felder**

* Rezeptur-**Snapshot-ID**, Chargennummer, Produktionsdatum, Mengen/BATCH-Gewichte je Komponente, Lieferant & **Rohstoff-Charge/Lieferschein**, Abweichungsnotiz.&#x20;
* Verknüpfte **FPC-Prüfungen** (Frisch- & Festmörtel).

**Pflicht-Records**

* **Batch-Gewichte & Batch-IDs**; Ergebnisse **zum Produkt rückverfolgbar**.&#x20;

**Freigabe-Logik**

* Automatisch **PASS/FAIL** je Charge (siehe Modul 4) + Sperr-/Freigabe-Button mit Begründung.

---

## 6) Kalibrierung / Prüfmittel

**Zweck:** Kalibrieren/Verifizieren von Wäge-, Mess-, Prüfgeräten.

**Felder**

* Gerät (Typ, SN, Standort), Intervall, **letzte Kalibrierung**, **nächste Fälligkeit** (Auto), Zertifikat-Upload, Verantwortlicher.&#x20;

**Funktionen**

* Status (OK/Due/Overdue), **Sperrhinweis**, wenn abgelaufen.
* „Verwendungsbaum“: Welche Prüfungen/Ergebnisse hängen an diesem Gerät (Impact-Analyse).

**Warum:** 6.3 verlangt **Plan + Aufzeichnungen** zur Kalibrierung/Verifikation; auch prüfrelevante Geräte.&#x20;

---

## 7) Leistungserklärungen (DoP) & CE

**Zweck:** DoP/Erklärung und CE-Begleitinfo erstellen.

**Systemwahl**

* **AVCP System 4** (CT, A1fl ohne Prüfung/CWFT): **Hersteller** macht ITT + FPC; **keine** NB-Nummer am CE. &#x20;

**DoP/Erklärung – Inhalte (System 4)**

* Hersteller (Adresse/Ort Prod.), Produktbeschreibung (nach **Klausel 7/8**), Verweis **Annex ZA**, Besondere Einsatzbedingungen (falls), Name/Funktion Unterzeichner; **Amtssprache** des Ziellands. &#x20;

**CE-Begleitinfo (ZA.3)**

* CE-Symbol, **EN 13813-Referenz**, **Produktbeschreibung nach § 7/8**, deklarierte **wesentliche Merkmale** (C/F, ggf. Verschleiß), **NPD** nur wo zulässig; NB-ID **nur** bei System 1. **Figure ZA.1** als Vorlage.&#x20;

**Funktionen**

* **One-Click-DoP** aus validierter Rezeptur + verknüpften Prüfberichten.
* **Mehrsprach-Export (PDF)** + **QR-Link**.

---

## 8) Marking & Lieferschein

**Zweck:** Pflichtangaben nach **Klausel 8** „Marking, labelling and packaging“.
**Muss-Angaben** auf Verpackung/Lieferschein/Beipack:

1. **Bezeichnung (Designation)**, 2) Produktname, 3) **Menge**, 4) **Herstell-Datum & Haltbarkeit** (falls relevant), 5) **Batch-/Produktion-Nr.**, 6) **max. Größtkorn** *oder* **Dickenbereich**, 7) **Misch-/Verarbeitungshinweise**, 8) **H\&S-Hinweise**, 9) **Hersteller/Adresse**.&#x20;

**Output**

* **Etikett/Lieferschein-PDF** (druckfertig) mit QR zur DoP/Erklärung.

---

## 9) Abweichungen / CAPA (Light)

**Zweck:** Pflichthandling, wenn Kriterien **nicht erfüllt**.

**Funktionen**

* Ticket mit Ursache, Sofortmaßnahme (Sperrung), Korrekturmaßnahme, Verantwortlicher, Wirksamkeitsprüfung.
* Verknüpft mit Charge/Prüfung/Gerät.
* **Sperr-/Freigabe-Logik** integriert.

**Warum:** 6.3.2.2 verlangt Aktionen, wenn Prozess-Kriterien **nicht erreicht** werden; auch Umgang mit **Non-conforming products** (6.3.4).&#x20;

---

## 10) Compliance & Berichte

**Zweck:** Audit-Bündel & Management-Reports.

**Berichte (PDF/CSV)**

* **FPC-Plan** & Erfüllung, **Kalibrierliste** mit Status, **Chargenliste** (Batch-Gewichte, IDs), **Konformitätsberichte § 9** (Modus, Entscheide), **CE/DoP-Register**. &#x20;

**Export**

* **WORM/ZIP-Export** (unveränderbar) für 10-Jahre-Archiv.

---

## 11) Audit-Log

**Zweck:** Revisionssichere Nachvollziehbarkeit.

**Mindestumfang**

* Wer/Was/Wann, vor/nach-Wert, Grund, Referenz (Rezeptur/Charge/Prüfung), **Sign-off**.
* Alle **Records** autorisiert von benannten Personen (6.3.6).&#x20;

---

## 12) Einstellungen / Stammdaten

**Zweck:** Norm-Sauberkeit ohne Over-Engineering.

**Inhalte**

* **Rollen & Rechte** (Erfasser/Prüfer/Freigeber).
* **Norm-Versionen** (z. B. „EN 13892-2:2002“) für Prüfberichte.
* **Klassenkataloge** (C/F, A/AR/RWA, E/B/SH etc.). &#x20;
* **NPD-Regeln** pro Zielland (ZA.1/ZA.3). &#x20;

---

# Kleine, aber wichtige Validierungen (sofort umsetzbar)

* **Rezeptur**: Wenn „Nutzschicht ohne Belag“ ⇒ Verschleißmethode **pflicht**; genau **eine**; Einheiten A/AR/RWA wie in Tabellen 4–6.&#x20;
* **Prüfbericht**: C/F nur mit prEN 13892-2; Probenahme prEN 13892-1 vermerken.&#x20;
* **Konformität**: Standard-Modus „Einzelwert“ (§ 9.2.3) ⇒ jeder 28-Tage-Wert ≥ Klasse.&#x20;
* **CE**: Bei System 4 **keine** NB-Nummer auf CE; NPD nur zulässig, wenn **kein Schwellenwert**.&#x20;
* **Kalibrierung**: Prüf- & Wägetechnik braucht hinterlegte Intervalle + Sperrhinweise (6.3.2.2/6.3.3.3).&#x20;

---

# Was ihr NICHT extra braucht (für CT / System 4)

* **NB-Handling, NB-Nummer, Zertifikate** (nur System 1/3).&#x20;
* **Brandprüfberichte** bei **A1fl ohne Prüfung/CWFT** (nur Hinweis im CE-Text).&#x20;

---

Wenn ihr wollt, bau’ ich euch daraus direkt eine **Seiten-/Feldliste (JSON)** und **Zod-Schemas** mit den obigen Checks (inkl. „Einzelwert-Konformität“ und NPD-Regeln).
