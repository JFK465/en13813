"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { BookOpen, Search, ChevronRight, ArrowRight, AlertCircle, Info, ExternalLink, Filter, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function GlossarPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("alle")
  const [selectedLetter, setSelectedLetter] = useState("")

  const categories = [
    { value: "alle", label: "Alle Begriffe", count: 156 },
    { value: "normen", label: "Normen & Standards", count: 42 },
    { value: "materialien", label: "Materialien & Bindemittel", count: 38 },
    { value: "verarbeitung", label: "Verarbeitung & Technik", count: 45 },
    { value: "pruefung", label: "Prüfung & Qualität", count: 31 },
  ]

  const glossarTerms = {
    A: [
      {
        term: "Abbindezeit",
        definition: "Zeitraum vom Anmachen des Estrichmörtels bis zur beginnenden Erhärtung. Bei Zementestrich typisch 2-4 Stunden, bei Calciumsulfatestrich 3-5 Stunden.",
        category: "verarbeitung",
        related: ["Erhärtungszeit", "Verarbeitungszeit", "Erstarrungsbeginn"],
        norm: "DIN EN 196-3",
        example: "Ein CT-C25-F4 hat bei 20°C eine Abbindezeit von ca. 3 Stunden."
      },
      {
        term: "Abriebwiderstand",
        definition: "Widerstandsfähigkeit der Estrichoberfläche gegen mechanischen Verschleiß. Klassifiziert in A-Klassen nach EN 13813 (A1 bis A22).",
        category: "pruefung",
        related: ["Verschleißwiderstand", "Oberflächenfestigkeit", "BCA-Prüfung"],
        norm: "EN 13892-3"
      },
      {
        term: "Abstreifer",
        definition: "Spezialwerkzeug zum Glätten und Verdichten der frischen Estrichoberfläche. Meist aus Aluminium oder Edelstahl, Länge 1,5-3m.",
        category: "verarbeitung",
        related: ["Reibebrett", "Glättkelle", "Flügelglätter"]
      },
      {
        term: "Adhäsion",
        definition: "Haftvermögen zwischen Estrich und Untergrund, besonders wichtig bei Verbundestrich. Mindesthaftfestigkeit 1,5 N/mm².",
        category: "materialien",
        related: ["Verbundestrich", "Haftzugfestigkeit", "Haftbrücke"],
        norm: "DIN 18560-3"
      },
      {
        term: "Anhydrit",
        definition: "Wasserfreies Calciumsulfat (CaSO₄), Hauptbindemittel in CA-Estrich. Reagiert mit Wasser zu Gips und erhärtet dabei.",
        category: "materialien",
        related: ["CA-Estrich", "Calciumsulfat", "Gips"],
        example: "Natürlicher Anhydrit wird gemahlen und als Bindemittel verwendet."
      },
      {
        term: "Anmachwasser",
        definition: "Wassermenge zum Anmischen des Estrichmörtels. Der w/z-Wert (Wasser-Zement-Wert) ist entscheidend für die Festigkeit.",
        category: "verarbeitung",
        related: ["w/z-Wert", "Konsistenz", "Wasserbedarf"],
        norm: "DIN EN 1015-3"
      },
      {
        term: "Armierung",
        definition: "Bewehrung des Estrichs mit Stahlfasern, Glasfasern oder Bewehrungsmatten zur Erhöhung der Biegezugfestigkeit und Rissüberbrückung.",
        category: "materialien",
        related: ["Faserbewehrung", "Bewehrungsmatte", "Stahlfasern"],
        example: "Bei Heizestrich wird oft eine Bewehrungsmatte Q131 eingelegt."
      },
      {
        term: "AS",
        definition: "Kurzzeichen für Gussasphaltestrich (Mastic asphalt screed) nach EN 13813. Heißverarbeitbarer Estrich aus Bitumen und Gesteinskörnungen.",
        category: "normen",
        related: ["Gussasphalt", "Bitumen", "IC-Klassen"],
        norm: "EN 13813"
      },
      {
        term: "Aufheizprotokoll",
        definition: "Dokumentation des Aufheizvorgangs bei Heizestrich. Stufenweise Temperaturerhöhung über 3 Wochen nach DIN EN 1264-4.",
        category: "verarbeitung",
        related: ["Belegreifheizen", "Heizestrich", "Funktionsheizen"],
        norm: "DIN EN 1264-4",
        example: "Tag 1-3: 25°C, Tag 4-7: max. Vorlauftemperatur, dann abkühlen."
      },
      {
        term: "Ausblühungen",
        definition: "Weiße Salzablagerungen auf der Estrichoberfläche durch kapillaren Wassertransport und Verdunstung. Meist Calciumcarbonat oder Sulfate.",
        category: "pruefung",
        related: ["Effloreszenz", "Salzausblühung", "Kalkausblühung"],
        example: "Ausblühungen können mechanisch entfernt oder mit Säure behandelt werden."
      },
      {
        term: "Ausgleichsfeuchte",
        definition: "Feuchtigkeitsgehalt des Estrichs im Gleichgewicht mit der Umgebungsluft. Wichtig für die Beurteilung der Belegreife.",
        category: "pruefung",
        related: ["Gleichgewichtsfeuchte", "CM-Messung", "Restfeuchte"],
        norm: "DIN 18560-1"
      },
      {
        term: "AVCP",
        definition: "Assessment and Verification of Constancy of Performance - EU-System zur Bewertung und Überprüfung der Leistungsbeständigkeit von Bauprodukten. Für Estriche gilt System 4.",
        category: "normen",
        related: ["CE-Kennzeichnung", "System 4", "Konformitätsbewertung"],
        norm: "EU-BauPVO 305/2011",
        example: "AVCP System 4 bedeutet Eigenverantwortung des Herstellers ohne externe Überwachung."
      },
    ],
    B: [
      {
        term: "BauPVO",
        definition: "Bauproduktverordnung - EU-Verordnung 305/2011 zur Harmonisierung der Vermarktungsbedingungen für Bauprodukte. Ersetzt die Bauproduktenrichtlinie seit 2013.",
        category: "normen",
        related: ["CE-Kennzeichnung", "DoP", "Harmonisierte Norm"],
        norm: "EU 305/2011",
        example: "Alle Estriche müssen seit 2013 nach BauPVO CE-gekennzeichnet werden."
      },
      {
        term: "BCA-Prüfung",
        definition: "Böhme-Prüfung zur Bestimmung des Verschleißwiderstands. Schleifscheibe mit definierter Belastung, Messung des Volumenverlust in cm³/50cm².",
        category: "pruefung",
        related: ["Verschleißwiderstand", "A-Klassen", "Abrieb"],
        norm: "EN 13892-3"
      },
      {
        term: "Belegreife",
        definition: "Zustand des Estrichs mit ausreichend niedriger Restfeuchte für Bodenbelag. Grenzwerte: Zementestrich ≤ 2,0 CM-%, Calciumsulfatestrich ≤ 0,5 CM-%.",
        category: "pruefung",
        related: ["CM-Messung", "Restfeuchte", "Trocknungszeit"],
        norm: "DIN 18560-1",
        example: "Heizestrich: CT ≤ 1,8 CM-%, CA ≤ 0,3 CM-% für Parkett."
      },
      {
        term: "Belegreifheizen",
        definition: "Kontrolliertes Aufheizen von Heizestrich zur Trocknung. Protokollpflichtig mit stufenweiser Temperaturerhöhung und Abkühlung.",
        category: "verarbeitung",
        related: ["Aufheizprotokoll", "Funktionsheizen", "Heizestrich"],
        norm: "DIN EN 1264-4",
        example: "Start frühestens 21 Tage nach Estricheinbau bei Zementestrich."
      },
      {
        term: "Beschleuniger",
        definition: "Zusatzmittel zur Verkürzung der Abbinde- und Erhärtungszeit. Bei Zementestrich z.B. Calciumchlorid, bei CA-Estrich Kaliumsulfat.",
        category: "materialien",
        related: ["Zusatzmittel", "Erstarrungsbeschleuniger", "Frühfestigkeit"],
        norm: "EN 934-2",
        example: "Dosierung 1-3% vom Zementgewicht, Vorsicht bei Bewehrung (Korrosion)."
      },
      {
        term: "Bewehrung",
        definition: "Einlagen zur Erhöhung der Zugfestigkeit. Stahlmatten (z.B. Q131), Glasfasergewebe oder Kunststofffasern.",
        category: "materialien",
        related: ["Armierung", "Faserbewehrung", "Bewehrungsmatte"],
        norm: "DIN 18560-2",
        example: "Bewehrung in oberer Estrichhälfte, Betondeckung min. 15mm."
      },
      {
        term: "Bewegungsfuge",
        definition: "Durchgehende Fuge zur Aufnahme von Bewegungen zwischen Bauteilen. Breite 8-20mm, mit elastischem Material gefüllt.",
        category: "verarbeitung",
        related: ["Dehnungsfuge", "Randfuge", "Feldbegrenzungsfuge"],
        norm: "DIN 18560-2",
        example: "Bewegungsfugen müssen vom Estrich bis zum Belag durchgehen."
      },
      {
        term: "Biegezugfestigkeit",
        definition: "Widerstand des Estrichs gegen Biegung, gemessen in N/mm². Klassifizierung in F-Klassen (F1 bis F50) nach EN 13813.",
        category: "pruefung",
        related: ["F-Klasse", "Zugfestigkeit", "Biegeprüfung"],
        norm: "EN 13892-2",
        example: "F4 = 4 N/mm² Biegezugfestigkeit, Standard für Wohnbereich."
      },
      {
        term: "Bindemittel",
        definition: "Stoff, der Zuschlagskörner verklebt und erhärtet. Haupttypen: Zement (CT), Calciumsulfat (CA), Magnesit (MA), Kunstharz (SR), Bitumen (AS).",
        category: "materialien",
        related: ["Zement", "Anhydrit", "Kunstharz", "Bitumen"],
        norm: "EN 13813",
        example: "Bindemittelgehalt bei Zementestrich typisch 280-350 kg/m³."
      },
      {
        term: "Bitumen",
        definition: "Teerähnliches Bindemittel für Gussasphaltestrich. Thermoplastisch, bei 220-250°C verarbeitbar.",
        category: "materialien",
        related: ["Gussasphalt", "AS-Estrich", "Thermoplastisch"],
        norm: "EN 12591"
      },
    ],
    C: [
      {
        term: "CA",
        definition: "Calcium sulphate screed - Calciumsulfatestrich nach EN 13813. Bindemittel ist Anhydrit oder Alpha-Halbhydrat, selbstnivellierend möglich.",
        category: "normen",
        related: ["Anhydritestrich", "Fließestrich", "Calciumsulfat"],
        norm: "EN 13813",
        example: "CA-C30-F6 = Calciumsulfatestrich mit 30 N/mm² Druck- und 6 N/mm² Biegezugfestigkeit."
      },
      {
        term: "Calciumsulfat",
        definition: "Sammelbegriff für Anhydrit (CaSO₄) und Gips (CaSO₄ · 2H₂O). Bindemittel für CA-Estrich, feuchteempfindlich.",
        category: "materialien",
        related: ["Anhydrit", "Gips", "CA-Estrich"],
        example: "Natürlicher oder synthetischer (REA-Gips) Rohstoff."
      },
      {
        term: "CE-Kennzeichnung",
        definition: "Conformité Européenne - Pflichtzeichen für Bauprodukte in der EU. Bestätigt Konformität mit harmonisierten Normen und Leistungserklärung.",
        category: "normen",
        related: ["DoP", "BauPVO", "Konformität"],
        norm: "EU 305/2011",
        example: "CE-Zeichen mit vierstelliger Nummer der notifizierten Stelle."
      },
      {
        term: "CEM",
        definition: "Europäische Zementbezeichnung. CEM I = Portlandzement, CEM II = Portlandkompositzement, CEM III = Hüttenzement.",
        category: "materialien",
        related: ["Zement", "Portlandzement", "Bindemittel"],
        norm: "EN 197-1",
        example: "CEM II/B-S 32,5 R = Portlandhüttenzement mit hoher Frühfestigkeit."
      },
      {
        term: "CM-Messung",
        definition: "Calcium-Carbid-Methode zur Feuchtigkeitsmessung. Estrichprobe reagiert mit Calciumcarbid, entstehender Gasdruck zeigt Feuchtegehalt.",
        category: "pruefung",
        related: ["Restfeuchte", "Belegreife", "CM-Gerät"],
        norm: "DIN 18560-4",
        example: "Probe aus gesamter Estrichdicke, Messung in CM-% (Gewichtsprozent)."
      },
      {
        term: "CT",
        definition: "Cement screed - Zementestrich nach EN 13813. Häufigster Estrichtyp, universell einsetzbar, feuchteunempfindlich.",
        category: "normen",
        related: ["Zementestrich", "CEM", "Portlandzement"],
        norm: "EN 13813",
        example: "CT-C25-F4 = Standardqualität für Wohnungsbau."
      },
      {
        term: "C-Klasse",
        definition: "Druckfestigkeitsklasse nach EN 13813. C5 bis C80, Zahl gibt Mindestdruckfestigkeit in N/mm² an.",
        category: "pruefung",
        related: ["Druckfestigkeit", "Festigkeitsklasse", "Würfeldruckfestigkeit"],
        norm: "EN 13892-2",
        example: "C25 = mindestens 25 N/mm² Druckfestigkeit."
      },
    ],
    D: [
      {
        term: "Dämmschicht",
        definition: "Trittschall- oder Wärmedämmung unter schwimmendem Estrich. Mindestdicke 20mm bei Trittschalldämmung, Zusammendrückbarkeit max. 3-5mm.",
        category: "materialien",
        related: ["Schwimmender Estrich", "Trittschalldämmung", "DEO"],
        norm: "DIN 18560-2",
        example: "EPS DEO 150 = Polystyrol mit 150 kPa Druckspannung."
      },
      {
        term: "Darrmethode",
        definition: "Gravimetrische Feuchtemessung durch Trocknung bei 105°C bis zur Gewichtskonstanz. Referenzmethode für CM-Messung.",
        category: "pruefung",
        related: ["CM-Messung", "Feuchtemessung", "Trocknung"],
        norm: "DIN EN 12664"
      },
      {
        term: "Dehnungsfuge",
        definition: "Fuge zur Aufnahme von Längenänderungen durch Temperatur und Schwinden. Bei Heizestrich alle 40m², max. 8m Kantenlänge.",
        category: "verarbeitung",
        related: ["Bewegungsfuge", "Scheinfuge", "Feldbegrenzungsfuge"],
        norm: "DIN 18560-2",
        example: "Türbereich immer mit Dehnungsfuge trennen."
      },
      {
        term: "DEO",
        definition: "Druckbelastbarkeit von Dämmstoffen. Angabe der Druckspannung bei 10% Stauchung in kPa.",
        category: "materialien",
        related: ["Dämmschicht", "Druckspannung", "Zusammendrückbarkeit"],
        norm: "DIN EN 13162",
        example: "DEO ds = druckbelastbar, schallgedämmt."
      },
      {
        term: "DIN",
        definition: "Deutsches Institut für Normung - Nationale Normungsorganisation. DIN-Normen ergänzen europäische EN-Normen.",
        category: "normen",
        related: ["EN", "ISO", "Normung"],
        example: "DIN 18560 Serie für Estriche im Bauwesen."
      },
      {
        term: "DoP",
        definition: "Declaration of Performance - Leistungserklärung nach BauPVO. Pflichtdokument mit deklarierten Eigenschaften, Grundlage für CE-Zeichen.",
        category: "normen",
        related: ["CE-Kennzeichnung", "Leistungserklärung", "BauPVO"],
        norm: "EU 305/2011",
        example: "DoP-Nummer eindeutig, 10 Jahre aufbewahren."
      },
      {
        term: "Druckfestigkeit",
        definition: "Widerstand gegen Druckbelastung in N/mm². Prüfung an Würfeln oder Prismen, Klassifizierung in C-Klassen (C5-C80).",
        category: "pruefung",
        related: ["C-Klasse", "Würfeldruckfestigkeit", "Festigkeit"],
        norm: "EN 13892-2",
        example: "Mindestens 3 Prüfkörper, Mittelwert bilden."
      },
      {
        term: "Dünnschichtestrich",
        definition: "Estrich mit Nenndicke < 35mm. Meist kunstharzgebunden oder zementgebunden mit Faserbewehrung.",
        category: "verarbeitung",
        related: ["Kunstharzestrich", "Verbundestrich", "Sanierung"],
        example: "Renovierung mit 10-20mm Dünnschichtestrich."
      },
    ],
    E: [
      {
        term: "Effloreszenz",
        definition: "Ausblühungen durch kristallisierende Salze an der Oberfläche. Meist Calciumhydroxid, das zu Calciumcarbonat reagiert.",
        category: "pruefung",
        related: ["Ausblühungen", "Salzausblühung", "Weißschleier"],
        example: "Mechanisch entfernen oder mit verdünnter Säure behandeln."
      },
      {
        term: "Einbaufeuchte",
        definition: "Feuchtigkeitsgehalt des frischen Estrichmörtels. Bei Zementestrich ca. 8-12%, bei CA-Estrich 5-7%.",
        category: "verarbeitung",
        related: ["Anmachwasser", "w/z-Wert", "Konsistenz"],
        example: "Zu hohe Einbaufeuchte verlängert Trocknungszeit erheblich."
      },
      {
        term: "EN",
        definition: "Europäische Norm - In allen EU-Ländern gültige harmonisierte Standards. Ersetzt nationale Normen.",
        category: "normen",
        related: ["DIN EN", "Harmonisierte Norm", "CE-Kennzeichnung"],
        example: "EN 13813 ist die zentrale Norm für Estriche."
      },
      {
        term: "EN 13813",
        definition: "Europäische Produktnorm für Estrichmörtel und Estrichmassen. Regelt Anforderungen, Prüfverfahren und CE-Kennzeichnung seit 2004.",
        category: "normen",
        related: ["CE-Kennzeichnung", "Harmonisierte Norm", "DoP"],
        norm: "EN 13813:2002",
        example: "Bezeichnung: CT-C25-F4 nach EN 13813."
      },
      {
        term: "EN 13892",
        definition: "Normenreihe für Prüfverfahren von Estrichmörteln. Teil 1-8 regeln verschiedene Prüfungen.",
        category: "normen",
        related: ["Prüfverfahren", "Druckfestigkeit", "Biegezugfestigkeit"],
        example: "EN 13892-2: Druck- und Biegezugfestigkeit."
      },
      {
        term: "Epoxidharz",
        definition: "Zweikomponentiges Kunstharz für hochbelastbare Estriche. Chemisch beständig, wasserdicht, schnell erhärtend.",
        category: "materialien",
        related: ["SR-Estrich", "Kunstharzestrich", "Reaktionsharz"],
        example: "Industrieböden mit 5-10mm Epoxidharzestrich."
      },
      {
        term: "Erhärtungszeit",
        definition: "Zeit bis zum Erreichen der Nennfestigkeit. Bei Zementestrich 28 Tage, bei CA-Estrich 14-21 Tage.",
        category: "verarbeitung",
        related: ["Abbindezeit", "Festigkeitsentwicklung", "Nachbehandlung"],
        norm: "EN 13892-2",
        example: "Frühfestigkeit nach 7 Tagen ca. 70% der Endfestigkeit."
      },
      {
        term: "Erstarrungsbeginn",
        definition: "Zeitpunkt des beginnenden Abbindens. Bei Zement nach Vicat-Nadel bestimmt, typisch 2-4 Stunden.",
        category: "verarbeitung",
        related: ["Abbindezeit", "Verarbeitungszeit", "Vicat-Prüfung"],
        norm: "EN 196-3"
      },
      {
        term: "Estrich",
        definition: "Bauteil aus Estrichmörtel zur Lastverteilung, Niveauregulierung oder als Nutzschicht. Schichtdicke 10-80mm.",
        category: "materialien",
        related: ["Estrichmörtel", "Estrichkonstruktion", "Unterböden"],
        norm: "DIN 18560-1",
        example: "Schwimmender Estrich auf Dämmschicht im Wohnungsbau."
      },
      {
        term: "Estrichmörtel",
        definition: "Gemisch aus Bindemittel, Zuschlag, Wasser und ggf. Zusatzstoffen. Frischmörtel vor dem Einbau.",
        category: "materialien",
        related: ["Mörtel", "Frischmörtel", "Mischungsverhältnis"],
        example: "Werkfrischmörtel oder baustellengemischt."
      },
      {
        term: "Erstprüfung",
        definition: "ITT (Initial Type Testing) - Einmalige Prüfung vor erstmaligem Inverkehrbringen. Grundlage für CE-Kennzeichnung.",
        category: "pruefung",
        related: ["ITT", "CE-Kennzeichnung", "Typprüfung"],
        norm: "EN 13813",
        example: "ITT durch akkreditiertes Prüflabor, Kosten 1000-2000€."
      },
    ],
    F: [
      {
        term: "Faserbewehrung",
        definition: "Zugabe von Stahl-, Glas- oder Kunststofffasern zur Erhöhung der Biegezugfestigkeit und Rissverteilung. Dosierung 0,5-2 Vol-%.",
        category: "materialien",
        related: ["Stahlfasern", "Glasfasern", "Bewehrung"],
        example: "25 kg/m³ Stahlfasern erhöhen F-Klasse um 1-2 Stufen."
      },
      {
        term: "Feldbegrenzungsfuge",
        definition: "Scheinfuge zur Begrenzung von Estrichfeldern. Bei Heizestrich max. 40m², Seitenverhältnis max. 1:2.",
        category: "verarbeitung",
        related: ["Scheinfuge", "Dehnungsfuge", "Feldgröße"],
        norm: "DIN 18560-2",
        example: "Schnitttiefe 1/3 bis 1/2 der Estrichdicke."
      },
      {
        term: "Festigkeitsklasse",
        definition: "Einstufung nach Druck- (C) und Biegezugfestigkeit (F). Kombination z.B. C25-F4 gibt beide Werte an.",
        category: "pruefung",
        related: ["C-Klasse", "F-Klasse", "Nennfestigkeit"],
        norm: "EN 13813",
        example: "CT-C25-F4 = Zementestrich mit 25 N/mm² Druck-, 4 N/mm² Biegezugfestigkeit."
      },
      {
        term: "F-Klasse",
        definition: "Biegezugfestigkeitsklasse nach EN 13813. F1 bis F50, Zahl gibt Mindestbiegezugfestigkeit in N/mm² an.",
        category: "pruefung",
        related: ["Biegezugfestigkeit", "Festigkeitsklasse", "Zugfestigkeit"],
        norm: "EN 13892-2",
        example: "F4 = Standard für Wohnbereich, F7 = erhöhte Anforderung."
      },
      {
        term: "Fließestrich",
        definition: "Selbstnivellierender Estrich mit fließfähiger Konsistenz. Meist CA-basiert, Ausbreitmass > 22cm.",
        category: "verarbeitung",
        related: ["Selbstnivellierend", "CA-Estrich", "Pumpestrich"],
        example: "Verarbeitung mit Schlauchpumpe, selbstnivellierend ab 20mm."
      },
      {
        term: "Fließmittel",
        definition: "Zusatzmittel zur Verflüssigung ohne Wasserzugabe. PCE-basiert (Polycarboxylatether), Dosierung 0,5-2%.",
        category: "materialien",
        related: ["Zusatzmittel", "Verflüssiger", "PCE"],
        norm: "EN 934-2",
        example: "Ermöglicht Pumpförderung ohne Festigkeitsverlust."
      },
      {
        term: "FPC",
        definition: "Factory Production Control - Werkseigene Produktionskontrolle zur Qualitätssicherung. Pflicht für CE-Kennzeichnung.",
        category: "normen",
        related: ["Qualitätskontrolle", "WPK", "CE-Kennzeichnung"],
        norm: "EN 13813 Anhang ZA",
        example: "Tägliche Konsistenzprüfung, wöchentliche Festigkeitsprüfung."
      },
      {
        term: "Frühfestigkeit",
        definition: "Festigkeit nach kurzer Erhärtungszeit. 1-Tag-, 3-Tage- oder 7-Tage-Festigkeit.",
        category: "pruefung",
        related: ["Festigkeitsentwicklung", "Schnellzement", "Beschleuniger"],
        example: "Schnellestrich erreicht 50% Endfestigkeit nach 24h."
      },
      {
        term: "Fugen",
        definition: "Unterbrechungen im Estrich. Arten: Bewegungsfuge, Scheinfuge, Randfuge, Arbeitsfuge.",
        category: "verarbeitung",
        related: ["Dehnungsfuge", "Randfuge", "Scheinfuge"],
        norm: "DIN 18560-2",
        example: "Fugenplan vor Estricheinbau festlegen."
      },
      {
        term: "Funktionsheizen",
        definition: "Erstes Aufheizen der Fußbodenheizung zur Funktionsprüfung. Nach 7 Tagen (CA) bzw. 21 Tagen (CT).",
        category: "verarbeitung",
        related: ["Belegreifheizen", "Aufheizprotokoll", "Heizestrich"],
        norm: "DIN EN 1264-4",
        example: "Start mit 25°C, täglich +5°C bis Maximaltemperatur."
      },
    ],
    G: [
      {
        term: "Gesteinskörnung",
        definition: "Zuschlagstoffe wie Sand und Kies. Korngruppen 0/4, 0/8 oder 0/16mm. Anteil 75-85% des Estrichvolumens.",
        category: "materialien",
        related: ["Zuschlag", "Korngruppe", "Sieblinie"],
        norm: "EN 13139",
        example: "Sieblinie B8 für Estrich 0/8mm optimal."
      },
      {
        term: "Gips",
        definition: "Calciumsulfat-Dihydrat (CaSO₄ · 2H₂O). Entsteht aus Anhydrit durch Wasseraufnahme beim Abbinden.",
        category: "materialien",
        related: ["Anhydrit", "Calciumsulfat", "REA-Gips"],
        example: "Alpha-Halbhydrat für hochfeste CA-Estriche."
      },
      {
        term: "Glasfasern",
        definition: "Alkaliresistente Fasern zur Bewehrung. Länge 6-24mm, Dosierung 0,5-2 kg/m³. Verbessert Rissverhaltung.",
        category: "materialien",
        related: ["Faserbewehrung", "AR-Glas", "Bewehrung"],
        example: "AR-Glasfasern mit Zirkonoxid-Beschichtung."
      },
      {
        term: "Glättung",
        definition: "Mechanische Oberflächenbearbeitung zur Erzielung einer glatten, porenarmen Oberfläche. Maschinell oder manuell.",
        category: "verarbeitung",
        related: ["Glätten", "Flügelglätter", "Oberflächengüte"],
        example: "Maschinenglättung mit Flügelglätter bei hartem Estrich."
      },
      {
        term: "Gleichgewichtsfeuchte",
        definition: "Feuchtegehalt im hygroskopischen Gleichgewicht mit Umgebungsklima. Bei 20°C/65% r.F.: CT ca. 1,5%, CA ca. 0,3%.",
        category: "pruefung",
        related: ["Ausgleichsfeuchte", "Restfeuchte", "Sorptionsisotherme"],
        example: "Dauerhafte Feuchte nach vollständiger Trocknung."
      },
      {
        term: "Gradierung",
        definition: "Temperaturabstufung bei Fußbodenheizung. Vorlauf-/Rücklauftemperatur und Spreizung.",
        category: "verarbeitung",
        related: ["Heizestrich", "Vorlauftemperatur", "Spreizung"],
        example: "35/28°C bei Niedertemperaturheizung."
      },
      {
        term: "Grenzabmaße",
        definition: "Zulässige Toleranzen für Ebenheit und Höhenlage. Nach DIN 18202 Tabelle 3.",
        category: "pruefung",
        related: ["Ebenheitstoleranzen", "DIN 18202", "Höhentoleranzen"],
        norm: "DIN 18202",
        example: "4mm auf 4m Messstrecke bei erhöhten Anforderungen."
      },
      {
        term: "Grundierung",
        definition: "Vorbehandlung des Untergrunds zur Verbesserung der Haftung. Epoxidharz- oder Dispersionsbasis.",
        category: "verarbeitung",
        related: ["Haftbrücke", "Primer", "Haftvermittler"],
        example: "Tiefengrund bei saugenden Untergründen."
      },
      {
        term: "Gussasphalt",
        definition: "Estrich aus Bitumen und Gesteinskörnungen (AS). Heißverarbeitung bei 220-250°C, sofort begehbar nach Abkühlung.",
        category: "materialien",
        related: ["AS-Estrich", "Bitumen", "Mastixasphalt"],
        norm: "EN 13813",
        example: "AS-IC10 für Industrieböden, AS-IC15 für Parkdecks."
      },
    ],
    H: [
      {
        term: "Haftbrücke",
        definition: "Verbindungsschicht zwischen Untergrund und Estrich bei Verbundestrichen. Zementschlämme, Epoxidharz oder spezielle Haftmittel.",
        category: "verarbeitung",
        related: ["Verbundestrich", "Grundierung", "Haftvermittler"],
        norm: "DIN 18560-3",
        example: "Frisch-in-frisch-Verarbeitung für optimale Haftung."
      },
      {
        term: "Haftzugfestigkeit",
        definition: "Zugfestigkeit senkrecht zur Verbundfläche. Mindestwert 1,5 N/mm² für Verbundestrich.",
        category: "pruefung",
        related: ["Adhäsion", "Abreissfestigkeit", "Verbundfestigkeit"],
        norm: "EN 13892-8",
        example: "Prüfung mit Haftzugprüfgerät, 5 Messstellen/100m²."
      },
      {
        term: "Halbhydrat",
        definition: "Calciumsulfat-Halbhydrat (CaSO₄ · 0,5H₂O). Zwischenprodukt beim Brennen von Gips, Bindemittel für CA-Estrich.",
        category: "materialien",
        related: ["Alpha-Halbhydrat", "Beta-Halbhydrat", "Gips"],
        example: "Alpha-Halbhydrat für hochfeste Estriche."
      },
      {
        term: "Harmonisierte Norm",
        definition: "EU-weit gültige Norm mit CE-Kennzeichnungspflicht. Veröffentlicht im EU-Amtsblatt, ersetzt nationale Normen.",
        category: "normen",
        related: ["EN-Norm", "CE-Kennzeichnung", "hEN"],
        norm: "EU 305/2011",
        example: "EN 13813 ist harmonisierte Norm für Estriche."
      },
      {
        term: "Hartstoffestrich",
        definition: "Estrich mit verschleißfesten Zuschlägen wie Korund, Siliciumcarbid oder Quarz. Oberfläche eingestreut oder eingemischt.",
        category: "materialien",
        related: ["Industrieestrich", "Hartstoffschicht", "Monolithischer Estrich"],
        example: "8-10 kg/m² Hartstoffeinstreuung für Industrieböden."
      },
      {
        term: "Heizestrich",
        definition: "Estrich mit integrierter Fußbodenheizung/-kühlung. Rohre im Estrich verlegt, Überdeckung min. 45mm bei CT.",
        category: "verarbeitung",
        related: ["Fußbodenheizung", "Systemheizestrich", "Thermoaktive Bauteile"],
        norm: "DIN EN 1264",
        example: "Rohrverlegung auf Noppenplatte oder Tackersystem."
      },
      {
        term: "Höhenlage",
        definition: "Absolute Höhe der Estrichoberfläche. Toleranzen nach DIN 18202, Prüfung mit Nivelliergerät.",
        category: "pruefung",
        related: ["Höhentoleranz", "Nivellement", "DIN 18202"],
        norm: "DIN 18202",
        example: "±15mm bei Nennmaß bis 10m Raumlänge."
      },
      {
        term: "Hydratation",
        definition: "Chemische Reaktion von Zement mit Wasser. Bildet Calciumsilikathydrate (CSH) als Bindemittel.",
        category: "materialien",
        related: ["Zementhydratation", "Erhärtung", "CSH-Phasen"],
        example: "Vollständige Hydratation benötigt w/z-Wert > 0,4."
      },
    ],
    I: [
      {
        term: "IC-Klasse",
        definition: "Eindringtiefe-Klasse für Gussasphalt. IC10 = max. 10mm, IC15 = max. 15mm, IC40 = max. 40mm Eindringtiefe.",
        category: "pruefung",
        related: ["Gussasphalt", "AS-Estrich", "Eindringtiefe"],
        norm: "EN 13813",
        example: "IC10 für hohe Belastung, IC40 für Wohnbereich."
      },
      {
        term: "Industrieestrich",
        definition: "Hochbelastbarer Estrich für gewerbliche Nutzung. Druckfestigkeit > C40, oft mit Hartstoffeinstreuung.",
        category: "materialien",
        related: ["Hartstoffestrich", "Schwerlastestrich", "Nutzeestrich"],
        example: "CT-C50-F10-A12 mit 8mm Hartstoffschicht."
      },
      {
        term: "Innenrüttler",
        definition: "Gerät zur Verdichtung von Estrich. Tauchrüttler mit Frequenz 12.000-18.000/min.",
        category: "verarbeitung",
        related: ["Verdichtung", "Rüttelflasche", "Vibrator"],
        example: "Systematisches Rütteln im 50cm-Raster."
      },
      {
        term: "ISO",
        definition: "International Organization for Standardization - Weltweite Normungsorganisation. ISO 9001 für Qualitätsmanagement.",
        category: "normen",
        related: ["Normung", "Qualitätsmanagement", "Zertifizierung"],
        example: "ISO 9001:2015 Zertifizierung für QM-System."
      },
      {
        term: "ITT",
        definition: "Initial Type Testing - Erstprüfung vor CE-Kennzeichnung. Umfasst alle deklarierten Eigenschaften, gültig 5 Jahre.",
        category: "pruefung",
        related: ["Erstprüfung", "Typprüfung", "CE-Kennzeichnung"],
        norm: "EN 13813",
        example: "ITT-Bericht von akkreditiertem Labor, Kosten 1000-2000€."
      },
    ],
    K: [
      {
        term: "Kalibrierung",
        definition: "Regelmäßige Überprüfung und Justierung von Prüf- und Messgeräten. Jährlich für Waagen, Thermometer, CM-Geräte.",
        category: "pruefung",
        related: ["Prüfmittelüberwachung", "Messgenauigkeit", "QM-System"],
        norm: "DIN EN ISO 9001",
        example: "Kalibrierzertifikat von akkreditiertem Labor."
      },
      {
        term: "Karbonatisierung",
        definition: "Reaktion von Calciumhydroxid mit CO₂ zu Calciumcarbonat. Senkt pH-Wert, schützt Bewehrung nicht mehr.",
        category: "materialien",
        related: ["Carbonatisierung", "pH-Wert", "Korrosionsschutz"],
        example: "Karbonatisierungstiefe nach 50 Jahren ca. 20mm."
      },
      {
        term: "Kerndämmung",
        definition: "Wärmedämmung zwischen zwei Estrichschichten. Bei Doppelböden oder zweischaligen Konstruktionen.",
        category: "materialien",
        related: ["Dämmung", "Doppelboden", "Zweischaliger Estrich"],
        example: "10cm Kerndämmung zwischen Roh- und Nutzestrich."
      },
      {
        term: "Knetmischer",
        definition: "Zwangsmischer für Estrichmörtel. Mischwerkzeuge rotieren planetär, Mischzeit 2-3 Minuten.",
        category: "verarbeitung",
        related: ["Zwangsmischer", "Mischer", "Mischzeit"],
        example: "250-500 Liter Mischvolumen für Baustellenmischer."
      },
      {
        term: "Konformität",
        definition: "Erfüllung der festgelegten Anforderungen. Basis für CE-Kennzeichnung und Leistungserklärung.",
        category: "normen",
        related: ["CE-Kennzeichnung", "Konformitätserklärung", "DoP"],
        norm: "EU 305/2011",
        example: "Konformitätsbewertung nach AVCP System 4."
      },
      {
        term: "Konsistenz",
        definition: "Verarbeitbarkeit des Frischmörtels. Klassen: erdfeucht (F1), plastisch (F2), weich (F3), fließfähig (F4), sehr fließfähig (F5).",
        category: "verarbeitung",
        related: ["Verarbeitbarkeit", "Ausbreitmass", "Konsistenzklasse"],
        norm: "EN 13813",
        example: "F3 = Ausbreitmass 14-20cm für konventionellen Estrich."
      },
      {
        term: "Korngruppe",
        definition: "Bezeichnung der Gesteinskörnung nach Siebgrößen. 0/4, 0/8, 0/16 = Größtkorn 4, 8 oder 16mm.",
        category: "materialien",
        related: ["Gesteinskörnung", "Sieblinie", "Größtkorn"],
        norm: "EN 13139",
        example: "0/8mm Standardkorngruppe für Estrich."
      },
      {
        term: "Korrosionsschutz",
        definition: "Schutz von Bewehrung vor Rost. Alkalischer pH-Wert > 12,5 passiviert Stahl.",
        category: "materialien",
        related: ["Passivierung", "pH-Wert", "Bewehrung"],
        example: "Betondeckung min. 15mm für Korrosionsschutz."
      },
      {
        term: "Kriechen",
        definition: "Zeitabhängige Verformung unter Dauerlast. Besonders bei Kunststoffdämmstoffen relevant.",
        category: "pruefung",
        related: ["Langzeitverformung", "Kriechzahl", "Dauerstandfestigkeit"],
        norm: "EN 1606",
        example: "Kriechverformung < 2% nach 10 Jahren."
      },
      {
        term: "Kunstharzestrich",
        definition: "Estrich mit Reaktionsharz als Bindemittel (SR). Epoxid-, PU- oder Methacrylatharz. Chemikalienbeständig, schnell erhärtend.",
        category: "materialien",
        related: ["SR-Estrich", "Epoxidharzestrich", "Reaktionsharz"],
        norm: "EN 13813",
        example: "SR-C40-F10 für hochbelastete Industrieböden."
      },
    ],
    L: [
      {
        term: "Lastverteilungsschicht",
        definition: "Estrichfunktion zur gleichmäßigen Verteilung von Punktlasten auf den Untergrund.",
        category: "verarbeitung",
        related: ["Lastverteilung", "Druckverteilung", "Estrichfunktion"],
        example: "Schwimmender Estrich als Lastverteilungsschicht."
      },
      {
        term: "Leistungserklärung",
        definition: "DoP (Declaration of Performance) - Herstellererklärung über Produktleistungen. Grundlage für CE-Kennzeichnung.",
        category: "normen",
        related: ["DoP", "CE-Kennzeichnung", "Produktleistung"],
        norm: "EU 305/2011",
        example: "DoP online verfügbar, 10 Jahre aufbewahren."
      },
      {
        term: "Ließmaß",
        definition: "Maß für die Fließfähigkeit von Fließestrich. Prüfung mit Ließkegelgerät, Angabe in cm.",
        category: "pruefung",
        related: ["Fließfähigkeit", "Ausbreitmass", "Konsistenz"],
        norm: "EN 13454-2",
        example: "Ließmaß > 22cm für selbstnivellierenden Estrich."
      },
      {
        term: "Luftporen",
        definition: "Eingeschlossene Luftblasen im Estrich. Reduzieren Festigkeit, erhöhen Dämmwirkung.",
        category: "materialien",
        related: ["Porosität", "Luftporenbildner", "Verdichtung"],
        example: "Luftporengehalt < 5% für Normalestriche."
      },
    ],
    M: [
      {
        term: "MA",
        definition: "Magnesite screed - Magnesiaestrich nach EN 13813. Bindemittel Magnesiumoxid mit Magnesiumchlorid-Lösung.",
        category: "normen",
        related: ["Steinholzestrich", "Magnesitestrich", "Sorelzement"],
        norm: "EN 13813",
        example: "MA-C40-F7 für Industrieböden ohne Feuchtebelastung."
      },
      {
        term: "Magnesiabinder",
        definition: "Magnesiumoxid (MgO) als Bindemittel. Reagiert mit Magnesiumchlorid-Lösung zu Sorelzement.",
        category: "materialien",
        related: ["Sorelzement", "MA-Estrich", "Magnesiumoxid"],
        example: "Kaustisch gebrannte Magnesia, Mahlfeinheit 5000 cm²/g."
      },
      {
        term: "Mahlfeinheit",
        definition: "Spezifische Oberfläche des gemahlenen Bindemittels. Angabe in cm²/g nach Blaine.",
        category: "materialien",
        related: ["Blaine-Wert", "Zementfeinheit", "Kornfeinheit"],
        norm: "EN 196-6",
        example: "Zement CEM I: 3500 cm²/g, CEM II: 4000 cm²/g."
      },
      {
        term: "Messstrecke",
        definition: "Prüflänge zur Ebenheitsmessung. 0,1m, 1m, 4m oder 10m nach DIN 18202.",
        category: "pruefung",
        related: ["Ebenheit", "Messverfahren", "DIN 18202"],
        norm: "DIN 18202",
        example: "4m-Latte für Standardmessung."
      },
      {
        term: "Mischungsverhältnis",
        definition: "Gewichtsverhältnis Bindemittel zu Zuschlag. Bei Zementestrich typisch 1:4 bis 1:6.",
        category: "materialien",
        related: ["Rezeptur", "Bindemittelgehalt", "Mischung"],
        example: "1:5 = 300 kg Zement auf 1500 kg Sand."
      },
      {
        term: "Mischzeit",
        definition: "Dauer des Mischvorgangs. Zwangsmischer 2-3 min, Freifallmischer 3-5 min.",
        category: "verarbeitung",
        related: ["Mischer", "Homogenität", "Mischgüte"],
        example: "Verlängerte Mischzeit bei Faserzugabe."
      },
      {
        term: "Monolithischer Estrich",
        definition: "Einschichtiger Estrich direkt auf tragfähigem Untergrund. Oft mit Hartstoffeinstreuung.",
        category: "verarbeitung",
        related: ["Verbundestrich", "Einschichtestrich", "Hartstoffestrich"],
        example: "Betonplatte mit monolithischem Hartstoffestrich."
      },
    ],
    N: [
      {
        term: "Nachbehandlung",
        definition: "Maßnahmen zum Schutz des jungen Estrichs. Abdecken mit Folie, Feuchthalten, Temperaturkontrolle.",
        category: "verarbeitung",
        related: ["Nachpflege", "Schutzmaßnahmen", "Austrocknung"],
        norm: "DIN 18560-1",
        example: "7 Tage Folie bei Zementestrich, 2 Tage bei CA."
      },
      {
        term: "Nenndicke",
        definition: "Planmäßige Solldicke des Estrichs. Mindestdicke nach DIN 18560 je nach Konstruktion.",
        category: "verarbeitung",
        related: ["Estrichdicke", "Mindestdicke", "Sollmaß"],
        norm: "DIN 18560",
        example: "Schwimmend: CT min. 45mm, CA min. 35mm."
      },
      {
        term: "Nennfestigkeit",
        definition: "Deklarierte charakteristische Festigkeit. Basis für Klassifizierung nach EN 13813.",
        category: "pruefung",
        related: ["Festigkeitsklasse", "Charakteristische Festigkeit", "5%-Fraktile"],
        norm: "EN 13813",
        example: "C25 = 25 N/mm² Nenndruckfestigkeit."
      },
      {
        term: "Nivellement",
        definition: "Höhenmessung zur Bestimmung der Estrichhöhenlage. Mit Nivelliergerät oder Rotationslaser.",
        category: "pruefung",
        related: ["Höhenmessung", "Höhenlage", "Nivelliergerät"],
        example: "Höhenpunkte im 10m-Raster setzen."
      },
      {
        term: "Normprüfung",
        definition: "Standardisierte Prüfverfahren nach EN 13892. Sichert Vergleichbarkeit der Ergebnisse.",
        category: "pruefung",
        related: ["Prüfnorm", "EN 13892", "Prüfverfahren"],
        example: "Druckprüfung nach EN 13892-2."
      },
      {
        term: "Notifizierte Stelle",
        definition: "Von EU benanntes akkreditiertes Prüflabor. Für bestimmte Konformitätsnachweise erforderlich.",
        category: "normen",
        related: ["Prüfstelle", "Akkreditierung", "Benannte Stelle"],
        norm: "EU 305/2011",
        example: "Vierstellige Kennnummer, z.B. 0769."
      },
      {
        term: "NPD",
        definition: "No Performance Determined - Keine Leistung festgelegt. Verwendung in DoP für nicht deklarierte Eigenschaften.",
        category: "normen",
        related: ["Leistungserklärung", "DoP", "Deklaration"],
        norm: "EU 305/2011",
        example: "Brandverhalten: NPD bei nicht geprüfter Eigenschaft."
      },
      {
        term: "Nutzestrich",
        definition: "Estrich ohne Belag als Nutzschicht. Mit verschleißfester Oberfläche, oft Hartstoffeinstreuung.",
        category: "verarbeitung",
        related: ["Industrieestrich", "Sichtestrich", "Hartstoffestrich"],
        example: "Geschliffener Sichtestrich in Loftwohnungen."
      },
    ],
    O: [
      {
        term: "Oberflächenfestigkeit",
        definition: "Widerstand der Estrichoberfläche gegen mechanische Beanspruchung. Prüfung mit Ritzgerät oder Kugelschlagprüfung.",
        category: "pruefung",
        related: ["Ritzhärte", "Abriebfestigkeit", "Oberflächenzugfestigkeit"],
        norm: "EN 13892-6",
        example: "Mindest-Oberflächenzugfestigkeit 1,5 N/mm²."
      },
      {
        term: "Oberflächenzugfestigkeit",
        definition: "Zugfestigkeit der obersten Estrichschicht. Prüfung mit Haftzugprüfgerät, wichtig für Beschichtungen.",
        category: "pruefung",
        related: ["Haftzugfestigkeit", "Oberflächengüte", "Zugfestigkeit"],
        norm: "EN 13892-8",
        example: "Min. 1,5 N/mm² für Epoxidbeschichtungen."
      },
    ],
    P: [
      {
        term: "Passivierung",
        definition: "Korrosionsschutz von Stahl durch alkalisches Milieu (pH > 12,5). Bildet schützende Oxidschicht.",
        category: "materialien",
        related: ["Korrosionsschutz", "pH-Wert", "Bewehrung"],
        example: "Passivierungsschicht bei Stahlbewehrung im Zementestrich."
      },
      {
        term: "PCE",
        definition: "Polycarboxylatether - Moderne Fließmittel für Beton und Estrich. Hohe Wasserreduktion bis 40%.",
        category: "materialien",
        related: ["Fließmittel", "Zusatzmittel", "Verflüssiger"],
        norm: "EN 934-2",
        example: "0,5-1,5% PCE für selbstverdichtenden Estrich."
      },
      {
        term: "pH-Wert",
        definition: "Maß für sauren/basischen Charakter. Zementestrich pH 12-13, Gipsestrich pH 7-8.",
        category: "materialien",
        related: ["Alkalität", "Säuregrad", "Korrosionsschutz"],
        example: "pH > 12,5 für Passivierung von Stahl."
      },
      {
        term: "Portlandzement",
        definition: "CEM I nach EN 197-1. Hauptbestandteil Portlandzementklinker (> 95%). Häufigstes Bindemittel für CT-Estrich.",
        category: "materialien",
        related: ["CEM I", "Zement", "Klinker"],
        norm: "EN 197-1",
        example: "CEM I 42,5 R = Portlandzement mit hoher Frühfestigkeit."
      },
      {
        term: "Primer",
        definition: "Grundierung zur Haftvermittlung und Porenverschluss. Epoxid-, PU- oder Dispersionsbasis.",
        category: "verarbeitung",
        related: ["Grundierung", "Haftvermittler", "Voranstrich"],
        example: "2K-Epoxy-Primer für Kunstharzbeschichtungen."
      },
      {
        term: "Prüfkörper",
        definition: "Genormte Proben für Materialprüfungen. Prismen 40x40x160mm oder Würfel 150x150x150mm.",
        category: "pruefung",
        related: ["Probenkörper", "Prüfprismen", "Prüfwürfel"],
        norm: "EN 13892-2",
        example: "3 Prismen pro Prüfung, 28 Tage Lagerung."
      },
      {
        term: "Pumpestrich",
        definition: "Mit Betonpumpe förderbarer Estrich. Konsistenz F4/F5, oft CA-Fließestrich.",
        category: "verarbeitung",
        related: ["Fließestrich", "Pumpmörtel", "Förderung"],
        example: "Förderleistung 20-40 m³/h, Reichweite bis 200m."
      },
    ],
    Q: [
      {
        term: "QM-System",
        definition: "Qualitätsmanagementsystem nach ISO 9001. Dokumentierte Verfahren zur Qualitätssicherung.",
        category: "normen",
        related: ["ISO 9001", "Qualitätsmanagement", "Zertifizierung"],
        example: "Jährliches Überwachungsaudit, Rezertifizierung alle 3 Jahre."
      },
      {
        term: "Qualitätskontrolle",
        definition: "Laufende Überwachung der Produktqualität. Teil der werkseigenen Produktionskontrolle (FPC).",
        category: "pruefung",
        related: ["FPC", "WPK", "Qualitätssicherung"],
        norm: "EN 13813",
        example: "Täglich Konsistenz, wöchentlich Festigkeit prüfen."
      },
      {
        term: "Quellen",
        definition: "Volumenveränderung durch Wasseraufnahme. Bei Holzdämmstoffen und Anhydrit kritisch.",
        category: "materialien",
        related: ["Schwinden", "Quellung", "Volumenänderung"],
        example: "Anhydrit quillt bei Feuchtigkeit bis 0,5%."
      },
      {
        term: "Querdehnungszahl",
        definition: "Poisson-Zahl - Verhältnis Querdehnung zu Längsdehnung. Für Estrich 0,15-0,25.",
        category: "materialien",
        related: ["Poisson-Zahl", "Elastizität", "Verformung"],
        example: "Zementestrich: 0,20, Gipsestrich: 0,25."
      },
    ],
    R: [
      {
        term: "Randdämmstreifen",
        definition: "Elastische Dämmung zwischen Estrich und aufgehenden Bauteilen. Verhindert Schallübertragung und Rissbildung. Dicke 8-10mm.",
        category: "materialien",
        related: ["Randfuge", "Bewegungsfuge", "Schallentkopplung"],
        norm: "DIN 18560-2",
        example: "PE-Schaum 10mm, überstand nach Belag abschneiden."
      },
      {
        term: "Reaktionsharz",
        definition: "Zweikomponentige Kunstharze (Harz + Härter). Epoxid, Polyurethan oder Methacrylat für SR-Estrich.",
        category: "materialien",
        related: ["Kunstharz", "Epoxidharz", "SR-Estrich"],
        example: "Mischverhältnis A:B genau einhalten, Topfzeit beachten."
      },
      {
        term: "REA-Gips",
        definition: "Rauchgasentschwefelungsanlagen-Gips. Synthetischer Gips aus Kraftwerken, Rohstoff für CA-Estrich.",
        category: "materialien",
        related: ["Gips", "Calciumsulfat", "Synthetischer Gips"],
        example: "Gleiche Qualität wie Naturgips, oft reiner."
      },
      {
        term: "Reibebrett",
        definition: "Handwerkzeug zum Glätten der Estrichoberfläche. Holz, Kunststoff oder Schwammgummi.",
        category: "verarbeitung",
        related: ["Glättkelle", "Abstreifer", "Oberflächenbearbeitung"],
        example: "Holzreibebrett für raue, Stahlglätter für glatte Oberfläche."
      },
      {
        term: "Restfeuchte",
        definition: "Verbleibende Feuchtigkeit im Estrich, gemessen in CM-% oder Masse-%. Kriterium für Belegreife.",
        category: "pruefung",
        related: ["CM-Messung", "Belegreife", "Ausgleichsfeuchte"],
        norm: "DIN 18560-1",
        example: "CT ≤ 2,0 CM-%, CA ≤ 0,5 CM-% für Parkett."
      },
      {
        term: "Rezeptur",
        definition: "Genaue Zusammensetzung des Estrichs. Bindemittel, Zuschlag, Wasser, Zusatzstoffe mit Mengenangaben.",
        category: "materialien",
        related: ["Mischungsverhältnis", "Mischrezept", "Zusammensetzung"],
        example: "CT-C25-F4: 320 kg/m³ CEM II/A-S 42,5 R."
      },
      {
        term: "Rissbildung",
        definition: "Trennungen im Estrichgefüge durch Schwinden, Temperatur oder Belastung. Vermeidung durch Fugen und Bewehrung.",
        category: "pruefung",
        related: ["Schwindrisse", "Spannungsrisse", "Risssanierung"],
        example: "Schwindrisse in ersten 28 Tagen, später Spannungsrisse."
      },
      {
        term: "Rohdichte",
        definition: "Masse pro Volumeneinheit inkl. Poren. Zementestrich 1800-2200 kg/m³, Gipsestrich 1600-2000 kg/m³.",
        category: "materialien",
        related: ["Dichte", "Raumgewicht", "Trockendichte"],
        norm: "EN 12390-7",
        example: "Leichtestrich < 1400 kg/m³, Normalestrich > 2000 kg/m³."
      },
      {
        term: "Rücklauftemperatur",
        definition: "Temperatur des Heizwassers nach Durchlauf durch Fußbodenheizung. Typisch 5-10K unter Vorlauf.",
        category: "verarbeitung",
        related: ["Vorlauftemperatur", "Spreizung", "Heizkreislauf"],
        example: "Vorlauf 35°C, Rücklauf 28°C = 7K Spreizung."
      },
    ],
    S: [
      {
        term: "Sanierung",
        definition: "Instandsetzung schadhafter Estriche. Risse verpressen, Abplatzungen reprofilieren, Oberfläche versiegeln.",
        category: "verarbeitung",
        related: ["Instandsetzung", "Reprofilierung", "Risssanierung"],
        example: "Rissinjektion mit EP-Harz, Überspachtelung."
      },
      {
        term: "Scheinfuge",
        definition: "Sollbruchstelle zur kontrollierten Rissbildung. Schnitttiefe 1/3 bis 1/2 der Estrichdicke.",
        category: "verarbeitung",
        related: ["Sollrissfuge", "Feldbegrenzungsfuge", "Dehnfuge"],
        norm: "DIN 18560-2",
        example: "Einschneiden nach 1-2 Tagen mit Fugenschneider."
      },
      {
        term: "Schichtdicke",
        definition: "Dicke der Estrichschicht. Mindestdicken nach DIN 18560 abhängig von Konstruktionsart.",
        category: "verarbeitung",
        related: ["Estrichdicke", "Nenndicke", "Aufbauhöhe"],
        norm: "DIN 18560",
        example: "Verbund min. 10mm, schwimmend min. 35-45mm."
      },
      {
        term: "Schnellestrich",
        definition: "Schnell erhärtender und trocknender Estrich. Belegreif nach 1-7 Tagen statt 28 Tagen.",
        category: "materialien",
        related: ["Schnellzement", "Frühfestigkeit", "Schnellbinder"],
        example: "CAF-Estrich belegreif nach 24-48h."
      },
      {
        term: "Schwimmender Estrich",
        definition: "Estrich auf Dämmschicht ohne Verbund zu angrenzenden Bauteilen. Standard im Wohnungsbau.",
        category: "verarbeitung",
        related: ["Schwimmkonstruktion", "Dämmschicht", "Trittschalldämmung"],
        norm: "DIN 18560-2",
        example: "CT-F4 auf 30mm Trittschalldämmung."
      },
      {
        term: "Schwinden",
        definition: "Volumenverminderung durch Wasserverlust. Zementestrich 0,3-0,6 mm/m, Gipsestrich 0,1-0,2 mm/m.",
        category: "materialien",
        related: ["Schwindmaß", "Trocknungsschwinden", "Volumenänderung"],
        norm: "EN 13892-9",
        example: "90% des Schwindens in ersten 28 Tagen."
      },
      {
        term: "Sieblinie",
        definition: "Kornzusammensetzung der Gesteinskörnung. Grafische Darstellung der Kornverteilung.",
        category: "materialien",
        related: ["Korngruppe", "Kornverteilung", "Fuller-Kurve"],
        norm: "EN 13139",
        example: "Sieblinie A/B oder C nach DIN 1045."
      },
      {
        term: "Sorelzement",
        definition: "Bindemittel aus Magnesiumoxid und Magnesiumchlorid. Basis für Magnesiaestrich (MA).",
        category: "materialien",
        related: ["Magnesiabinder", "MA-Estrich", "Steinholz"],
        example: "MgO + MgCl₂-Lösung = Sorelzement."
      },
      {
        term: "Spreizung",
        definition: "Temperaturdifferenz zwischen Vor- und Rücklauf der Fußbodenheizung. Typisch 5-10K.",
        category: "verarbeitung",
        related: ["Vorlauftemperatur", "Rücklauftemperatur", "Heizkreis"],
        example: "35/28°C = 7K Spreizung optimal."
      },
      {
        term: "SR",
        definition: "Synthetic resin screed - Kunstharzestrich nach EN 13813. Epoxid-, PU- oder MMA-basiert.",
        category: "normen",
        related: ["Kunstharzestrich", "Reaktionsharzestrich", "Epoxidestrich"],
        norm: "EN 13813",
        example: "SR-C40-F10-AR1 für Industrieböden."
      },
      {
        term: "Stahlfasern",
        definition: "Drahtfasern zur Bewehrung. Länge 25-60mm, Durchmesser 0,5-1,0mm, Dosierung 15-40 kg/m³.",
        category: "materialien",
        related: ["Faserbewehrung", "Drahtfasern", "Bewehrung"],
        example: "Hakenfasern für bessere Verankerung."
      },
      {
        term: "Steinholzestrich",
        definition: "Alter Begriff für Magnesiaestrich. Holzspäne als Zuschlag möglich.",
        category: "materialien",
        related: ["MA-Estrich", "Magnesitestrich", "Sorelzement"],
        example: "Historische Bezeichnung, heute MA nach EN 13813."
      },
      {
        term: "System 4",
        definition: "AVCP-System für Estriche. Hersteller erklärt Konformität eigenverantwortlich ohne externe Stelle.",
        category: "normen",
        related: ["AVCP", "Konformitätssystem", "CE-Kennzeichnung"],
        norm: "EU 305/2011",
        example: "ITT und FPC in Eigenverantwortung."
      },
    ],
    T: [
      {
        term: "Temperaturdehnfuge",
        definition: "Bewegungsfuge zur Aufnahme temperaturbedingter Längenänderungen. Bei Heizestrich zwingend erforderlich.",
        category: "verarbeitung",
        related: ["Dehnungsfuge", "Bewegungsfuge", "Wärmedehnung"],
        norm: "DIN 18560-2",
        example: "An Türöffnungen und bei Feldgrößen > 40m²."
      },
      {
        term: "Topfzeit",
        definition: "Verarbeitungszeit von Reaktionsharzen nach dem Mischen. Bei 20°C typisch 20-40 Minuten.",
        category: "verarbeitung",
        related: ["Verarbeitungszeit", "Reaktionsharz", "Gelierzeit"],
        example: "Epoxidharz: 30 min bei 20°C, 15 min bei 30°C."
      },
      {
        term: "Trennschicht",
        definition: "Folie (PE 0,2mm) zwischen Estrich und Untergrund. Verhindert Verbund und Feuchtigkeitsübertragung.",
        category: "materialien",
        related: ["PE-Folie", "Gleitschicht", "Estrich auf Trennschicht"],
        norm: "DIN 18560-4",
        example: "2-lagig mit 10cm Überlappung verlegen."
      },
      {
        term: "Trittschalldämmung",
        definition: "Dämmschicht zur Reduzierung der Trittschallübertragung. Dynamische Steifigkeit < 30 MN/m³.",
        category: "materialien",
        related: ["Schalldämmung", "Dämmschicht", "DEO"],
        norm: "DIN 4109",
        example: "20-30mm Mineralwolle oder EPS DEO."
      },
      {
        term: "Trocknungszeit",
        definition: "Zeit bis zum Erreichen der Belegreife. CT ca. 4 Wochen/cm, CA ca. 1 Woche/cm Dicke.",
        category: "verarbeitung",
        related: ["Belegreife", "Austrocknung", "Restfeuchte"],
        example: "5cm CT-Estrich: ca. 6-8 Wochen bis Belegreife."
      },
      {
        term: "Typprüfung",
        definition: "ITT (Initial Type Testing) - Erstmalige Prüfung eines neuen Produkttyps für CE-Kennzeichnung.",
        category: "pruefung",
        related: ["ITT", "Erstprüfung", "CE-Kennzeichnung"],
        norm: "EN 13813",
        example: "Bei Rezepturänderung neue Typprüfung erforderlich."
      },
    ],
    U: [
      {
        term: "Überdeckung",
        definition: "Estrichdicke über Heizrohren oder Bewehrung. Min. 45mm bei CT, 40mm bei CA über Heizrohren.",
        category: "verarbeitung",
        related: ["Heizrohrüberdeckung", "Mindestüberdeckung", "Estrichdicke"],
        norm: "DIN EN 1264-4",
        example: "Nenndicke = Rohraußendurchmesser + 45mm."
      },
      {
        term: "Unterbeton",
        definition: "Betonschicht als tragfähiger Untergrund für Estrich. Meist C8/10 oder C12/15.",
        category: "materialien",
        related: ["Sauberkeitsschicht", "Untergrund", "Tragschicht"],
        example: "5cm Unterbeton auf Erdreich, darauf Verbundestrich."
      },
      {
        term: "Untergrundvorbereitung",
        definition: "Vorbereitung der Fläche vor Estricheinbau. Reinigen, Grundieren, Nivellieren, Abdichten.",
        category: "verarbeitung",
        related: ["Grundierung", "Haftbrücke", "Untergrund"],
        example: "Kugelstrahlen bei Verbundestrich für optimale Haftung."
      },
    ],
    V: [
      {
        term: "Vakuumestrich",
        definition: "Estrich mit Wasserentzug durch Vakuum direkt nach Einbau. Verkürzt Trocknungszeit erheblich.",
        category: "verarbeitung",
        related: ["Vakuumverfahren", "Schnelltrocknung", "Wasserentzug"],
        example: "Belegreif nach 7-14 Tagen statt 28 Tagen."
      },
      {
        term: "Verbundestrich",
        definition: "Estrich mit kraftschlüssigem Verbund zum Untergrund. Haftzugfestigkeit min. 1,5 N/mm².",
        category: "verarbeitung",
        related: ["Haftverbund", "Monolithisch", "Verbundsystem"],
        norm: "DIN 18560-3",
        example: "10-50mm dick auf rauem Beton mit Haftbrücke."
      },
      {
        term: "Verdichtung",
        definition: "Entlüftung und Komprimierung des frischen Estrichs. Manuell, mit Rüttelflasche oder Rüttelböcken.",
        category: "verarbeitung",
        related: ["Rütteln", "Kompaktierung", "Entlüftung"],
        example: "Rüttelflasche alle 50cm einsetzen."
      },
      {
        term: "Verflüssiger",
        definition: "Zusatzmittel zur Verbesserung der Verarbeitbarkeit ohne Wasserzugabe. PCE oder Naphthalinsulfonat.",
        category: "materialien",
        related: ["Fließmittel", "PCE", "Zusatzmittel"],
        norm: "EN 934-2",
        example: "0,5-2% vom Zementgewicht dosieren."
      },
      {
        term: "Verschleißwiderstand",
        definition: "Widerstand gegen Abrieb nach Böhme. A-Klassen: A22 (22cm³/50cm²) bis A1,5 (1,5cm³/50cm²).",
        category: "pruefung",
        related: ["Abriebwiderstand", "A-Klasse", "BCA-Prüfung"],
        norm: "EN 13892-3",
        example: "A12 = Standard für normale Belastung."
      },
      {
        term: "Verzögerer",
        definition: "Zusatzmittel zur Verlängerung der Verarbeitungszeit. Bei hohen Temperaturen oder langen Transportwegen.",
        category: "materialien",
        related: ["Erstarrungsverzögerer", "Zusatzmittel", "Abbindeverzögerer"],
        norm: "EN 934-2",
        example: "0,2-0,5% Zitronensäure oder Weinsäure."
      },
      {
        term: "Vicat-Prüfung",
        definition: "Bestimmung von Erstarrungsbeginn und -ende mit Vicat-Nadel. Eindringwiderstand definiert Zeitpunkte.",
        category: "pruefung",
        related: ["Erstarrungsbeginn", "Abbindezeit", "Vicat-Nadel"],
        norm: "EN 196-3",
        example: "Erstarrungsbeginn wenn Nadel 6mm über Boden stoppt."
      },
      {
        term: "Vorlauftemperatur",
        definition: "Temperatur des Heizwassers beim Eintritt in Fußbodenheizung. Max. 55°C, meist 35-45°C.",
        category: "verarbeitung",
        related: ["Rücklauftemperatur", "Heizkreis", "Spreizung"],
        norm: "DIN EN 1264",
        example: "35°C bei Niedertemperatursystemen."
      },
    ],
    W: [
      {
        term: "Wartezeit",
        definition: "Zeit zwischen Estricheinbau und Belastung. Begehbar nach 2-3 Tagen, voll belastbar nach 7-28 Tagen.",
        category: "verarbeitung",
        related: ["Erhärtungszeit", "Belastbarkeit", "Festigkeitsentwicklung"],
        example: "CT begehbar nach 3 Tagen, CA nach 24h."
      },
      {
        term: "Wasserzementwert",
        definition: "w/z-Wert - Massenverhältnis Wasser zu Zement. Optimal 0,45-0,60 für Estrich.",
        category: "materialien",
        related: ["w/z-Wert", "Wasserbedarf", "Konsistenz"],
        example: "w/z = 0,50 bedeutet 50kg Wasser auf 100kg Zement."
      },
      {
        term: "Weißschleier",
        definition: "Kalkausblühungen auf der Estrichoberfläche. Calciumhydroxid reagiert mit CO₂ zu Calciumcarbonat.",
        category: "pruefung",
        related: ["Ausblühungen", "Effloreszenz", "Kalkausblühung"],
        example: "Mechanisch oder mit verdünnter Säure entfernen."
      },
      {
        term: "Werkfrischmörtel",
        definition: "Werkseitig hergestellter, transportfertig gemischter Estrichmörtel. Qualitätskonstant, zeitsparend.",
        category: "materialien",
        related: ["Transportestrich", "Werksmörtel", "Frischmörtel"],
        example: "Lieferung im Fahrmischer, Verarbeitung binnen 90min."
      },
      {
        term: "Werkseigene Produktionskontrolle",
        definition: "FPC - Kontinuierliche Überwachung der Produktion durch Hersteller. Pflicht für CE-Kennzeichnung.",
        category: "normen",
        related: ["FPC", "WPK", "Qualitätskontrolle"],
        norm: "EN 13813",
        example: "Prüfpläne, Protokolle, Korrekturmaßnahmen dokumentieren."
      },
      {
        term: "WPK",
        definition: "Werkseigene Produktionskontrolle - Deutsche Bezeichnung für FPC (Factory Production Control).",
        category: "normen",
        related: ["FPC", "Produktionskontrolle", "Qualitätssicherung"],
        norm: "EN 13813",
        example: "Teil des QM-Systems nach ISO 9001."
      },
      {
        term: "w/z-Wert",
        definition: "Wasser-Zement-Wert - Massenverhältnis. Bestimmt Festigkeit, Dichtigkeit und Dauerhaftigkeit.",
        category: "materialien",
        related: ["Wasserzementwert", "Festigkeit", "Konsistenz"],
        example: "w/z < 0,50 für hohe Festigkeit, > 0,60 für gute Verarbeitbarkeit."
      },
    ],
    Z: [
      {
        term: "Zement",
        definition: "Hydraulisches Bindemittel aus Kalkstein und Ton. Erhärtet mit Wasser zu festem Zementstein.",
        category: "materialien",
        related: ["Portlandzement", "CEM", "Bindemittel"],
        norm: "EN 197-1",
        example: "CEM I 42,5 R = Portlandzement mit hoher Frühfestigkeit."
      },
      {
        term: "Zementestrich",
        definition: "CT - Häufigster Estrichtyp mit Zement als Bindemittel. Universal einsetzbar, feuchteunempfindlich.",
        category: "materialien",
        related: ["CT-Estrich", "Cement screed", "Zementmörtel"],
        norm: "EN 13813",
        example: "CT-C25-F4 Standardqualität für Wohnungsbau."
      },
      {
        term: "Zementleim",
        definition: "Mischung aus Zement und Wasser ohne Zuschlag. Bindet die Zuschlagskörner im Estrich.",
        category: "materialien",
        related: ["Zementpaste", "Bindemittelleim", "Matrix"],
        example: "Zementleim füllt Zwischenräume der Körnung."
      },
      {
        term: "Zementschlämme",
        definition: "Dünnflüssige Zement-Wasser-Mischung als Haftbrücke. w/z-Wert 0,6-0,8.",
        category: "verarbeitung",
        related: ["Haftschlämme", "Haftbrücke", "Kontaktschlämme"],
        example: "Frisch-in-frisch einbürsten für Verbundestrich."
      },
      {
        term: "Zugfestigkeit",
        definition: "Widerstand gegen Zugbeanspruchung. Biegezugfestigkeit oder Spaltzugfestigkeit.",
        category: "pruefung",
        related: ["Biegezugfestigkeit", "Haftzugfestigkeit", "F-Klasse"],
        norm: "EN 13892-2",
        example: "Biegezugfestigkeit F4 = 4 N/mm²."
      },
      {
        term: "Zusammendrückbarkeit",
        definition: "Dickenänderung der Dämmschicht unter Last. Max. 3mm bei Trittschalldämmung, 5mm bei Wärmedämmung.",
        category: "materialien",
        related: ["Dämmschicht", "Kompressibilität", "DEO"],
        norm: "DIN 18560-2",
        example: "c ≤ 3mm für schwimmenden Estrich."
      },
      {
        term: "Zuschlag",
        definition: "Gesteinskörnung (Sand, Kies, Splitt) als Hauptvolumenanteil (75-85%) des Estrichs.",
        category: "materialien",
        related: ["Gesteinskörnung", "Korngruppe", "Sand"],
        norm: "EN 13139",
        example: "Quarzsand 0/8mm für Normalestrich."
      },
      {
        term: "Zusatzmittel",
        definition: "Chemische Zusätze zur Eigenschaftsverbesserung. Fließmittel, Beschleuniger, Verzögerer, Luftporenbildner.",
        category: "materialien",
        related: ["Additiv", "Fließmittel", "Beschleuniger"],
        norm: "EN 934-2",
        example: "Dosierung 0,2-5% vom Bindemittelgewicht."
      },
      {
        term: "Zusatzstoffe",
        definition: "Fein gemahlene mineralische Stoffe. Flugasche, Silikastaub, Kalksteinmehl zur Verbesserung der Eigenschaften.",
        category: "materialien",
        related: ["Flugasche", "Microsilica", "Füller"],
        norm: "EN 206",
        example: "Flugasche bis 33% als Zementersatz."
      },
      {
        term: "Zwangsmischer",
        definition: "Mischer mit rotierenden Mischwerkzeugen. Knet- oder Tellermischer für homogene Mischung.",
        category: "verarbeitung",
        related: ["Knetmischer", "Tellermischer", "Mischgerät"],
        example: "250-1000 Liter Nutzinhalt, 2-3 min Mischzeit."
      },
    ],
  }

  // Filter terms based on search and category
  const filteredTerms = useMemo(() => {
    const filtered: Record<string, typeof glossarTerms.A> = {}

    Object.entries(glossarTerms).forEach(([letter, terms]) => {
      const letterFiltered = terms.filter(term => {
        // Search filter
        if (searchTerm && !term.term.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !term.definition.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false
        }
        // Category filter
        if (selectedCategory !== "alle" && term.category !== selectedCategory) {
          return false
        }
        return true
      })

      if (letterFiltered.length > 0) {
        filtered[letter as keyof typeof glossarTerms] = letterFiltered
      }
    })

    return filtered
  }, [searchTerm, selectedCategory])

  const totalTerms = useMemo(() => {
    return Object.values(glossarTerms).reduce((sum, terms) => sum + terms.length, 0)
  }, [])

  const filteredCount = useMemo(() => {
    return Object.values(filteredTerms).reduce((sum, terms) => sum + terms.length, 0)
  }, [filteredTerms])

  const alphabet = Object.keys(glossarTerms).sort()

  // Get important terms for featured section
  const featuredTerms = [
    glossarTerms.E?.find(t => t.term === "EN 13813"),
    glossarTerms.D?.find(t => t.term === "DoP"),
    glossarTerms.F?.find(t => t.term === "FPC"),
    glossarTerms.I?.find(t => t.term === "ITT"),
    glossarTerms.C?.find(t => t.term === "CE-Kennzeichnung"),
    glossarTerms.C?.find(t => t.term === "CT"),
  ].filter(Boolean)

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li><Link href="/wissen" className="text-gray-500 hover:text-gray-700">Wissen</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">Glossar</li>
          </ol>
        </div>
      </nav>

      <section className="px-6 py-16 lg:px-8 border-b">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-gray-100 text-gray-800">Nachschlagewerk • {totalTerms} Fachbegriffe</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Estrich-Glossar von A bis Z
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Das umfassendste deutsche Nachschlagewerk für Estrich-Fachbegriffe.
            Über 150 Begriffe aus EN 13813, Qualitätsmanagement und Produktion verständlich erklärt.
          </p>

          <div className="mt-8 space-y-4">
            {/* Suchfeld */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  className="pl-10 h-12"
                  placeholder="Begriff oder Stichwort suchen..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Kategoriefilter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="text-sm"
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-2">
                    {category.value === "alle" ? totalTerms : category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Ergebniszähler */}
            {(searchTerm || selectedCategory !== "alle") && (
              <p className="text-sm text-gray-600">
                {filteredCount} {filteredCount === 1 ? "Begriff" : "Begriffe"} gefunden
              </p>
            )}
          </div>
        </div>
      </section>

      <article className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Wichtige Begriffe hervorgehoben */}
          {!searchTerm && selectedCategory === "alle" && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Die wichtigsten Begriffe für Estrichwerke</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {featuredTerms.map((term: any) => term && (
                  <Card key={term.term} className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{term.term}</CardTitle>
                        {term.norm && (
                          <Badge variant="secondary" className="text-xs">
                            {term.norm}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm">{term.definition}</p>
                      {term.example && (
                        <p className="text-xs text-gray-600 mt-2 italic">Beispiel: {term.example}</p>
                      )}
                      {term.related && term.related.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-600">Verwandte Begriffe:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {term.related.slice(0, 3).map((rel: string) => (
                              <Badge key={rel} variant="outline" className="text-xs">
                                {rel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Schnellnavigation */}
          {Object.keys(filteredTerms).length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg sticky top-4 z-10">
              <p className="font-semibold mb-3">Schnellnavigation:</p>
              <div className="flex flex-wrap gap-2">
                {alphabet.map((letter) => {
                  const hasTerms = letter in filteredTerms
                  return (
                    <a
                      key={letter}
                      href={hasTerms ? `#${letter}` : undefined}
                      className={`w-10 h-10 flex items-center justify-center border rounded transition-colors font-medium ${
                        hasTerms
                          ? "bg-white hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={hasTerms ? () => setSelectedLetter(letter) : (e) => e.preventDefault()}
                    >
                      {letter}
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Glossar-Einträge */}
          {Object.keys(filteredTerms).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(filteredTerms).map(([letter, terms]) => (
                <section key={letter} id={letter}>
                  <h2 className="text-2xl font-bold mb-4 pb-2 border-b flex items-center gap-3">
                    <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                      {letter}
                    </span>
                    <span>Buchstabe {letter}</span>
                    <Badge variant="secondary">{terms.length} {terms.length === 1 ? "Begriff" : "Begriffe"}</Badge>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {terms.map((item) => (
                      <Card key={item.term} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{item.term}</CardTitle>
                            <div className="flex gap-2">
                              {item.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category === "normen" && "Norm"}
                                  {item.category === "materialien" && "Material"}
                                  {item.category === "verarbeitung" && "Verarbeitung"}
                                  {item.category === "pruefung" && "Prüfung"}
                                </Badge>
                              )}
                              {item.norm && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.norm}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{item.definition}</p>

                          {item.example && (
                            <div className="mt-3 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold">Beispiel:</span> {item.example}
                              </p>
                            </div>
                          )}

                          {item.related && item.related.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Siehe auch:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.related.map((rel) => (
                                  <Badge
                                    key={rel}
                                    variant="outline"
                                    className="text-xs cursor-pointer hover:bg-gray-100"
                                    onClick={() => setSearchTerm(rel)}
                                  >
                                    {rel}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Keine Begriffe gefunden. Versuchen Sie eine andere Suche oder Kategorie.</p>
            </div>
          )}


          {/* Statistische Informationen */}
          <section className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Glossar-Statistik</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{totalTerms}</p>
                <p className="text-sm text-gray-600">Fachbegriffe</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">26</p>
                <p className="text-sm text-gray-600">Buchstaben</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">5</p>
                <p className="text-sm text-gray-600">Kategorien</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">15+</p>
                <p className="text-sm text-gray-600">Normen</p>
              </div>
            </div>
          </section>

          {/* Hinweise zur Nutzung */}
          <section className="mt-8">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Tipp zur Nutzung</AlertTitle>
              <AlertDescription>
                Nutzen Sie die Suchfunktion für schnelles Auffinden von Begriffen.
                Klicken Sie auf verwandte Begriffe, um thematisch ähnliche Einträge zu entdecken.
                Die Kategoriefilter helfen bei der gezielten Suche nach Normen, Materialien oder Prüfverfahren.
              </AlertDescription>
            </Alert>
          </section>
        </div>
      </article>

      <section className="px-6 py-16 lg:px-8 bg-gradient-to-r from-gray-700 to-gray-900">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Alle Fachbegriffe digital im Griff</h2>
          <p className="text-lg text-gray-300 mb-8">
            EstrichManager integriert alle relevanten Normen und Fachbegriffe direkt in Ihre Arbeitsabläufe.
            Automatische Normprüfung, integrierte Hilfe und rechtssichere Dokumentation.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">Kostenlose Demo<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-gray-900">
              <Link href="/wissen">Weitere Guides<BookOpen className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
