Super Frage. Hier ist ein **kompletter, praxistauglicher Blueprint**, was euer SaaS enthalten muss, damit ihr **unter EN 13813:2002 (CT, AVCP-System 4)** sauber und audit-fest seid – inklusive **Datenfeldern, Validierungen, Workflows, Dokumenten** und **Exports**. Ich nenne jeweils die Normstelle, auf der die Anforderung beruht.

---

# 1) Produkt & ITT (Initial Type Testing)

## 1.1 Pflicht-Leistungsmerkmale (CT)

* **Druckfestigkeit (C-Klassen)**: Prüfung nach prEN 13892-2; Klassifizierung gemäß Tabelle 2 (z. B. C25). &#x20;
* **Biegezugfestigkeit (F-Klassen)**: Prüfung nach prEN 13892-2; Klassifizierung gemäß Tabelle 3 (z. B. F4).&#x20;
* **Verschleißwiderstand** nur, **wenn als Nutzschicht ohne Belag**: genau **eine** Methode wählen – Böhme (A in **cm³/50 cm²**), BCA (AR als **max. Abtrag**), Rollrad (RWA in **cm³**) mit jeweiligen Klassen (Tabellen 4–6). &#x20;
* **Bezeichnung/Designation**: Mindestens **Bindemitteltyp** + Klassen der **normativen** Merkmale in einer Zeile (z. B. **EN 13813 CT-C25-F4**).&#x20;

**SaaS-Pflichtfelder (Rezeptur):**

* Bindemitteltyp (CT), C-Klasse, F-Klasse, ggf. Verschleißmethode + Klasse bei „Nutzschicht“, Bezeichnung (auto), Kurzbeschreibung. (Basis: § 5.2, Tabelle 1; § 7) &#x20;

## 1.2 ITT-Regeln (Wann & Was)

* **ITT ist erforderlich** zum Nachweis der konformen Eigenschaften bei **neuen Produkten** sowie **vor Produktionsbeginn** und **bei Änderungen** an Grundstoffen/Verfahren. Ihr dürft vorhandene, gleichwertige Prüfungen anrechnen (gleiche Methode/System/Produkt).&#x20;
* **Zu prüfen sind** die **normativen** Merkmale aus Tabelle 1 und optional jene, die ihr deklarieren wollt. &#x20;

**SaaS-Muss: ITT-Modul**

* ITT-Datensatz (Rezeptur-Version, Prüfnorm-Version, Labor, Datum, Probenahme nach prEN 13892-1, Einzelwerte & Statistik).&#x20;
* Automatischer **Konformitäts-Check**: Jede deklarierte Klasse wird gegen ITT-Ergebnisse geprüft (siehe § 9.2, unten).&#x20;
* Änderungs-Trigger: Rezeptur-/Rohstoff-/Prozessänderung ⇒ „ITT prüfen/erneuern“ Hinweis (Ereignis-getrieben, nicht kalendarisch).&#x20;

---

# 2) FPC (Werkseigene Produktionskontrolle)

## 2.1 FPC-System & Qualitäts­handbuch

* Ihr braucht ein **dokumentiertes FPC-System** (Quality Manual), mit **Abläufen** für Eingangskontrolle, Prozesskontrolle und Endproduktprüfungen. Ein ISO 9001-basiertes System (spezifisch auf EN 13813) erfüllt die Anforderungen.&#x20;
* **Stichproben-/Prüfplan** mit Prüfintervallen unter Berücksichtigung von Produkt, Verfahren, Bedeutung des Merkmals, Historie.&#x20;

**SaaS-Muss: FPC-Modul**

* Konfigurierbarer **Prüfplan** (Merkmal, Frequenz, n, Methode, Toleranzen).
* **Aufgaben & Fälligkeiten** (z. B. tägliche Frischmörtel-Checks, wöchentliche Festigkeit, monatliche Sieblinie).
* **Ergebnisseingabe** mit Prüfprotokoll-Upload & Gerätebezug.
* **Auto-Bewertung** gegen Klassen/Toleranzen (PASS/FAIL) je Ergebnis.

## 2.2 Kalibrierung & Prüfgeräte

* **Wäge-/Mess-/Prüfgeräte** müssen nach Plan **regelmäßig kalibriert/verifiziert** werden; Ergebnisse sind **aufzuzeichnen**.&#x20;
* **Aufzeichnungen** über **alle** Kalibrierungen sind Pflicht.&#x20;

**SaaS-Muss: Kalibrier-Modul**

* Geräte-Stammdaten (Typ, SN, Standort, Intervall, letzte Kalibrierung, Zertifikat-Upload), **nächste Fälligkeit** & Status (OK/Due/Overdue), Verknüpfung zu Prüfungen, die das Gerät nutzten.&#x20;

## 2.3 Rückverfolgbarkeit & Bestandskontrolle

* **Traceability**: Systeme zur Rückverfolgung **eingehender Materialien** und ihrer **Verwendung**; **Lagerkontrolle** für Produkte mit **Haltbarkeit**; Umgang mit **Nichtkonformitäten**.&#x20;
* **Pflicht-Records**: Rohstoffprüfungen, Herstell-/Chargendaten (**Batch-gewichte, Batch-IDs**), **Prüfergebnisse** **produktbezogen** rückverfolgbar.&#x20;

**SaaS-Muss: Chargen-Modul**

* Charge ←→ Rezeptur-**Snapshot-ID**, Produktionsdatum, Menge, **Batch-Gewichte** je Komponente, Rohstoff-**Lieferant+Lieferschein/Charge**, Abweichungsprotokoll, zugehörige **QC-Prüfungen** (Frisch- & Fest-).&#x20;

---

# 3) Konformitätsbewertung (Bewertungslogik)

EN 13813 erlaubt **zwei Wege** (§ 9): **statistisch** oder **Einzelwert-basiert**. Für MVP ist **Einzelwert** praxisnah:

* **Einzelwert-Regel (§ 9.2.3)**: **Jedes** 28-Tage-Ergebnis muss **≥ deklarierter Klassenwert** sein (z. B. jeder Druckfestigkeitswert ≥ 25 N/mm² für C25).&#x20;
* **Statistischer Ansatz (§ 9.2.2)**: mit Annahmewahrscheinlichkeit u. Stichprobengröße (CA-Werte) – optional in einem „Pro-Modus“.&#x20;

**SaaS-Muss:**

* Pro Merkmal **Modus wählbar** (Einzelwert/Statistik).
* **Automatische Freigabeentscheidung** für Chargen & Periodenberichte (grün/rot), inkl. Begründung/Protokoll.

---

# 4) CE-Kennzeichnung & DoP-Inhalte (für System 4)

## 4.1 AVCP-Systemwahl

* **System 4** gilt u. a. für **A1fl ohne Prüfung (CWFT)** bzw. „alle übrigen Verwendungen“, **ohne** notifizierte Stelle.&#x20;
* In **System 4** macht der **Hersteller** ITT + FPC und stellt **Erklärung der Konformität/DoC** (bzw. später DoP) bereit; **NB-Nummer entfällt**.&#x20;

## 4.2 CE-Begleitinformationen (Annex ZA.3)

CE-Symbol plus folgende Angaben **auf Etikett/Verpackung/Lieferschein**:
**Hersteller** (Name/Anschrift), **Jahreszahl (letzte 2 Ziffern)**, **EN 13813-Referenz**, **Produktbeschreibung gemäß §§ 7/8**, **deklarierten Werte/Klassen** aller relevanten **wesentlichen Merkmale** (mit NPD nur, wenn zulässig), **NB-ID nur bei System 1**. Beispiel siehe **Figure ZA.1**. &#x20;

**SaaS-Muss: CE-/Label-Generator**

* Rendert CE-Label **ohne NB-Nummer** für System 4 mit: **EN-Bezeichnung (z. B. EN 13813 CT-C25-F4)**, **Reaktion auf Feuer: A1fl (falls relevant)**, **korrosive Stoffe: CT**, **C/F-Klassen**, ggf. **Verschleißklasse**, „NPD“ wo zulässig.&#x20;

## 4.3 Marking, Labelling & Verpackung (Klausel 8)

Auf **Verpackung/Lieferschein/Beipackzettel**:

1. **Designation**, 2) **Produktname**, 3) **Menge**, 4) **Herstell-Datum & Haltbarkeit/Verwendbar-bis**, 5) **Batch-/Chargen-Nr.**, 6) **max. Größtkorn** oder **vorgesehener Dickenbereich**, 7) **Misch-/Verarbeitungshinweise**, 8) **H\&S-Hinweise**, 9) **Hersteller/Adresse**.&#x20;

**SaaS-Muss: Marking/Lieferschein-Export**

* Ein Klick erzeugt **druckfertiges Label/Lieferschein-PDF** mit obigen Punkten + QR-Link zur Erklärung/DoP-Seite.&#x20;

---

# 5) „NPD“ & optionale Eigenschaften

* **NPD** („No performance determined“) dürft ihr **nur** nutzen, wenn **kein** Schwellenwert greift und **keine** regulatorische Pflicht im Zielmarkt besteht. **NPD** ist im CE-Begleittext explizit zu kennzeichnen.&#x20;
* **Optionale Merkmale** könnt ihr deklarieren (E, B, SH, IR, RWFC, Chemikalienbeständigkeit …), **müsst** dann aber die passende **Prüfmethode** nutzen (z. B. **EN ISO 178** in der Norm referenziert). &#x20;

**SaaS-Muss:**

* Pro Merkmal **„Deklariert: ja/nein“**; wenn **ja** ⇒ Methode, Messwert/Klasse, Prüfbericht.
* RWFC nur zeigen, wenn „mit Bodenbelag“ relevant (Methode prEN 13892-7 ist in EN 13813 referenziert).&#x20;

---

# 6) Records, Audit-Trail & Exporte

* **Pflicht-Aufzeichnungen (§ 6.3.6)**:
  a) Kalibrierung/Verifikation **aller** Prüfmittel,
  b) Rohstoff-Bewertung & Tests,
  c) Herstellprozess (**Batch-Gewichte, Batch-IDs**),
  d) **produktbezogene** Prüfresultate. **Freigaben** durch benannte Personen.&#x20;
* **Konformitätsberichte (§ 9)**: Ergebnisbewertungen je Merkmal nach gewähltem Verfahren (Einzelwert/Statistik).&#x20;

**SaaS-Muss:**

* **Unveränderbarer Audit-Log** (wer/was/wann), **Sign-Off/Rollen**, **WORM-Export** (ZIP mit PDFs/CSV).
* **Sprachumschaltung** für CE/Erklärung je Zielland (Annex ZA verlangt Amtssprache des Mitgliedstaats).&#x20;

---

# 7) Navigations-/Modul-Set (schlank & normtreu)

## MUSS-Module (für CT, System 4)

* **Rezepturen** (Bezeichnung, C/F, optional Verschleiß), **Prüfberichte (ITT/FPC)**, **Qualitätskontrolle (FPC/Prüfplan)**, **Chargen & Traceability**, **Kalibrierung**, **CE/Label-Generator**, **Marking/Lieferschein-Export**, **Audit-Log**, **Einstellungen (Rollen/Sign-Off)**.  &#x20;

## NICE-TO-HAVE (optional, aber hilfreich)

* **RWFC-Workflow** (nur „mit Bodenbelag“), **Chemikalienbeständigkeit**, **IR, B, SH, E** als deklarierbare Add-Ons.&#x20;
* **Abweichungen/CAPA-Light** (Ticketing, Ursachenanalyse, Sperrung/Rückruf – in § 6.3.2.2 wird Maßnahmenpflicht gefordert, wenn Kriterien nicht erreicht).&#x20;

---

# 8) Validierungslogik (Minimal-Regeln, sofort implementierbar)

**Rezeptur**

* `if use = "Nutzschicht ohne Belag" -> require wear_method in {A, AR, RWA}` (genau **eine** Methode).&#x20;
* `if wear_method = A -> unit = "cm³/50 cm²"` • `AR -> "×10⁻² mm"` • `RWA -> "cm³"`.&#x20;
* `designation = "EN 13813 " + type + "-C" + C + "-F" + F + (optional wear)` (Format aus § 7).&#x20;

**Prüfberichte**

* `method = prEN 13892-2` für C/F; Probenahme `prEN 13892-1`.&#x20;
* **Konformität (Einzelwert)**: `every result_28d >= declared_class_value` ⇒ PASS, sonst FAIL.&#x20;

**CE/Label**

* **System 4** ⇒ **keine NB-ID** am CE; Pflichttexte & Merkmalsliste gem. ZA.3.&#x20;
* **NPD** nur zulässig, wenn **kein Schwellenwert**/keine regulatorische Pflicht greift.&#x20;

**FPC**

* **Kalibrierintervalle** je Gerät; **nächste Fälligkeit** = letzte + Intervall; Blocker, wenn „overdue“.&#x20;
* **Sampling-Plan** muss Frequenzen pro Merkmal enthalten.&#x20;

---

# 9) Dokument-Templates (fertig zur Audit-Abgabe)

**a) Erklärung/DoC (System 4)**
Enthält mind. Hersteller (Adresse/Ort der Produktion), Produktbeschreibung, Verweis auf **Annex ZA** dieser EN, besondere Anwendungsbedingungen (falls zutreffend), Name/Funktion des Zeichnungsberechtigten. Sprache = Amtssprache des Einsatzlandes. &#x20;

**b) CE-Label/Beipack/Lieferschein**
Enthält die Punkte aus **Klausel 8** plus ZA.3-Angaben (inkl. Klassen/NPD). **Beispiel in Figure ZA.1** dient als Vorlage. &#x20;

**c) FPC-Reports**
Prüfplan, Ergebnisse, Bewertungen (PASS/FAIL), Gerätelisten mit Kalibrierstatus, Chargenliste mit Batch-Gewichten/IDs, Traceability-Matrix. (Alle § 6.3-Punkte abdeckend.) &#x20;

---

# 10) Rollen & Verantwortlichkeiten

* **Hersteller** ist in **System 4** allein verantwortlich für ITT & FPC sowie das Anbringen der CE-Kennzeichnung; keine NB-Einbindung.&#x20;
* SaaS sollte **Rollenrechte** (Erfasser/Prüfer/Freigeber), **Zwei-Augen-Prinzip** für Freigaben und **Audit-Trail** bieten.

---

# 11) Zusammengefasst – Checkliste für „Normkonform ready“

* [ ] **Rezepturmodul**: CT, C/F (prEN 13892-2), optionale Verschleißmethode mit richtigen Einheiten/Klassen; auto-Bezeichnung.  &#x20;
* [ ] **ITT-Modul**: Anlässe, Probenahme (prEN 13892-1), Prüfmethoden, Ergebnisse + Konformitätslogik. &#x20;
* [ ] **FPC/Qualitätskontrolle**: Prüfplan, Ergebniserfassung, PASS/FAIL nach § 9; statistischer Modus optional. &#x20;
* [ ] **Kalibrierung**: Geräte-Stamm, Intervalle, Zertifikate, Status.&#x20;
* [ ] **Chargen/Traceability**: Rohstoff-Charges, Batch-Gewichte/-IDs, Verknüpfung zu Prüfungen.&#x20;
* [ ] **CE/Label-Generator** (System 4, ohne NB), **NPD-Regeln** beachtet.&#x20;
* [ ] **Marking/Lieferschein** gemäß **Klausel 8** als PDF.&#x20;
* [ ] **Audit-Log & Exporte** (WORM), Mehrsprachigkeit für Zielländer (ZA).&#x20;

---

Wenn ihr wollt, gieße ich euch das sofort in **Datenmodelle + Validierungsregeln** (JSON/Zod) pro Modul – exakt entlang der oben genannten Pflichtfelder und §-Bezüge.
