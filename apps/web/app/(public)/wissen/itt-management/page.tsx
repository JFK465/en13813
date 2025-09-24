"use client"

import { useState } from "react"
import { Metadata } from "next"
import Link from "next/link"
import {
  FlaskConical,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  ChevronRight,
  ArrowRight,
  Euro,
  Download,
  BookOpen,
  Users,
  Calendar,
  Shield,
  AlertTriangle,
  Info,
  CheckSquare,
  X,
  Lightbulb,
  HelpCircle,
  Building,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  FileCheck,
  Calculator,
  ClipboardCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"

// export const metadata: Metadata = {
//   title: "ITT (Erstprüfung) für Estrich nach EN 13813 - Komplettanleitung 2025 | EstrichManager",
//   description: "ITT Erstprüfung für Estrich: Detaillierte Anleitung ✓ Alle Prüfparameter ✓ Akkreditierte Labore ✓ Kosten-Kalkulator ✓ Checklisten ✓ Praxistipps. Der umfassendste ITT-Guide für Estrichwerke.",
//   keywords: ["ITT", "Erstprüfung", "Initial Type Testing", "ITT Estrich", "ITT EN 13813", "Erstprüfung Estrich", "ITT Kosten", "ITT Labor", "ITT Prüfbericht", "ITT Durchführung", "ITT Checkliste", "Estrich Prüflabor", "Akkreditierung", "ITT Anleitung"],
//   openGraph: {
//     title: "ITT Erstprüfung für Estrich - Der komplette Leitfaden 2025",
//     description: "Alles was Sie über die ITT-Erstprüfung nach EN 13813 wissen müssen. Mit Prüflaboren, Kostenrechner und Praxistipps.",
//     type: "article",
//   },
//   alternates: {
//     canonical: "https://estrichmanager.de/wissen/itt-management",
//   },
// }

export default function ITTManagementPage() {
  const [selectedEstrichType, setSelectedEstrichType] = useState("CT")

  // Umfassende Prüfparameter nach Estrichtyp
  const pruefparameter = {
    CT: [
      { eigenschaft: "Druckfestigkeit", norm: "EN 13892-2", pflicht: true, kosten: "180-250€", dauer: "28 Tage", einheit: "N/mm²" },
      { eigenschaft: "Biegezugfestigkeit", norm: "EN 13892-2", pflicht: true, kosten: "180-250€", dauer: "28 Tage", einheit: "N/mm²" },
      { eigenschaft: "Verschleißwiderstand BCA", norm: "EN 13892-3", pflicht: false, kosten: "350-450€", dauer: "7 Tage", einheit: "cm³/50cm²" },
      { eigenschaft: "Oberflächenhärte", norm: "EN 13892-6", pflicht: false, kosten: "150-200€", dauer: "28 Tage", einheit: "N/mm²" },
      { eigenschaft: "Brandverhalten", norm: "EN 13501-1", pflicht: true, kosten: "600-900€", dauer: "14 Tage", einheit: "Klasse" },
      { eigenschaft: "Wärmeleitfähigkeit", norm: "EN 12664", pflicht: false, kosten: "400-500€", dauer: "7 Tage", einheit: "W/(m·K)" },
      { eigenschaft: "Elektrischer Widerstand", norm: "EN 13892-10", pflicht: false, kosten: "250-350€", dauer: "3 Tage", einheit: "Ω" },
      { eigenschaft: "Wasserdampfdurchlässigkeit", norm: "EN 12086", pflicht: false, kosten: "300-400€", dauer: "14 Tage", einheit: "μ" },
      { eigenschaft: "Schwindmaß", norm: "EN 13892-9", pflicht: false, kosten: "200-300€", dauer: "56 Tage", einheit: "mm/m" },
      { eigenschaft: "pH-Wert", norm: "EN 13454-2", pflicht: false, kosten: "80-120€", dauer: "1 Tag", einheit: "-" },
    ],
    CA: [
      { eigenschaft: "Druckfestigkeit", norm: "EN 13892-2", pflicht: true, kosten: "180-250€", dauer: "28 Tage", einheit: "N/mm²" },
      { eigenschaft: "Biegezugfestigkeit", norm: "EN 13892-2", pflicht: true, kosten: "180-250€", dauer: "28 Tage", einheit: "N/mm²" },
      { eigenschaft: "Oberflächenhärte", norm: "EN 13892-6", pflicht: false, kosten: "150-200€", dauer: "28 Tage", einheit: "N/mm²" },
      { eigenschaft: "Brandverhalten", norm: "EN 13501-1", pflicht: true, kosten: "600-900€", dauer: "14 Tage", einheit: "Klasse" },
      { eigenschaft: "pH-Wert", norm: "EN 13454-2", pflicht: true, kosten: "80-120€", dauer: "1 Tag", einheit: "-" },
      { eigenschaft: "Wasserempfindlichkeit", norm: "EN 13454-2", pflicht: true, kosten: "250-350€", dauer: "28 Tage", einheit: "-" },
    ],
    MA: [
      { eigenschaft: "Druckfestigkeit", norm: "EN 13892-2", pflicht: true, kosten: "180-250€", dauer: "28 Tage", einheit: "N/mm²" },
      { eigenschaft: "Biegezugfestigkeit", norm: "EN 13892-2", pflicht: true, kosten: "180-250€", dauer: "28 Tage", einheit: "N/mm²" },
      { eigenschaft: "Verschleißwiderstand", norm: "EN 13892-3", pflicht: false, kosten: "350-450€", dauer: "7 Tage", einheit: "cm³/50cm²" },
      { eigenschaft: "Brandverhalten", norm: "EN 13501-1", pflicht: true, kosten: "600-900€", dauer: "14 Tage", einheit: "Klasse" },
      { eigenschaft: "Wasserbeständigkeit", norm: "EN 13892-5", pflicht: true, kosten: "300-400€", dauer: "28 Tage", einheit: "-" },
    ],
    AS: [
      { eigenschaft: "Eindringtiefe", norm: "EN 13892-4", pflicht: true, kosten: "200-300€", dauer: "1 Tag", einheit: "mm" },
      { eigenschaft: "Brandverhalten", norm: "EN 13501-1", pflicht: true, kosten: "600-900€", dauer: "14 Tage", einheit: "Klasse" },
      { eigenschaft: "Rückstellvermögen", norm: "EN 13892-5", pflicht: false, kosten: "250-350€", dauer: "7 Tage", einheit: "%" },
    ],
    SR: [
      { eigenschaft: "Druckfestigkeit", norm: "EN 13892-2", pflicht: true, kosten: "180-250€", dauer: "7 Tage", einheit: "N/mm²" },
      { eigenschaft: "Biegezugfestigkeit", norm: "EN 13892-2", pflicht: true, kosten: "180-250€", dauer: "7 Tage", einheit: "N/mm²" },
      { eigenschaft: "Verschleißwiderstand", norm: "EN 13892-4", pflicht: true, kosten: "350-450€", dauer: "3 Tage", einheit: "AR" },
      { eigenschaft: "Haftzugfestigkeit", norm: "EN 13892-8", pflicht: false, kosten: "200-300€", dauer: "7 Tage", einheit: "N/mm²" },
      { eigenschaft: "Schlagfestigkeit", norm: "EN ISO 6272-1", pflicht: false, kosten: "150-200€", dauer: "3 Tage", einheit: "Nm" },
      { eigenschaft: "Chemikalienbeständigkeit", norm: "EN 13529", pflicht: false, kosten: "500-700€", dauer: "28 Tage", einheit: "-" },
    ],
  }

  // Akkreditierte Prüflabore in Deutschland
  const prueflabore = [
    {
      name: "Kiwa GmbH - TBU Greven",
      standort: "48268 Greven",
      akkreditierung: "DAkkS D-PL-11141-01-00",
      schwerpunkt: "Alle Estricharten, Brandverhalten",
      kontakt: {
        telefon: "+49 2571 9872-0",
        email: "info.de@kiwa.com",
        web: "www.kiwa.de"
      },
      besonderheiten: ["Schnelle Bearbeitung", "Online-Tracking", "Vor-Ort-Probenahme möglich"]
    },
    {
      name: "MPA NRW",
      standort: "44227 Dortmund",
      akkreditierung: "DAkkS D-PL-14162-01-00",
      schwerpunkt: "Zement- und Calciumsulfatestriche",
      kontakt: {
        telefon: "+49 231 4502-0",
        email: "info@mpanrw.de",
        web: "www.mpanrw.de"
      },
      besonderheiten: ["Umfassende Beratung", "Seminare", "FPC-Unterstützung"]
    },
    {
      name: "PÜZ-Bau Friedrichshafen",
      standort: "88046 Friedrichshafen",
      akkreditierung: "DAkkS D-PL-11140-01-00",
      schwerpunkt: "Alle Estricharten, Sonderestriche",
      kontakt: {
        telefon: "+49 7541 3706-0",
        email: "info@puez-bau.de",
        web: "www.puez-bau.de"
      },
      besonderheiten: ["Süddeutschland", "Kurze Wege", "Persönliche Betreuung"]
    },
    {
      name: "ift Rosenheim",
      standort: "83026 Rosenheim",
      akkreditierung: "DAkkS D-PL-14010-01-00",
      schwerpunkt: "Brandverhalten, Wärmeschutz",
      kontakt: {
        telefon: "+49 8031 261-0",
        email: "info@ift-rosenheim.de",
        web: "www.ift-rosenheim.de"
      },
      besonderheiten: ["Spezialist Brandschutz", "Thermische Eigenschaften", "Schallschutz"]
    },
    {
      name: "LGA Bautechnik GmbH",
      standort: "90431 Nürnberg",
      akkreditierung: "DAkkS D-PL-14550-01-00",
      schwerpunkt: "Industrieestriche, Kunstharzestriche",
      kontakt: {
        telefon: "+49 911 655-5225",
        email: "bautechnik@lga.de",
        web: "www.lga.de"
      },
      besonderheiten: ["TÜV-Gruppe", "International", "Zertifizierungen"]
    }
  ]

  // Detaillierter Zeitplan
  const zeitplan = [
    { woche: "Woche 0", phase: "Vorbereitung", aktivitaeten: ["Laborauswahl", "Angebotseinholung", "Rezepturdokumentation"], status: "planning" },
    { woche: "Woche 1", phase: "Beauftragung", aktivitaeten: ["Auftragserteilung", "Terminabstimmung", "Materialbestellung"], status: "preparation" },
    { woche: "Woche 2", phase: "Probenherstellung", aktivitaeten: ["Rohstoffprüfung", "Mischung", "Prüfkörperherstellung"], status: "production" },
    { woche: "Woche 3-4", phase: "Lagerung", aktivitaeten: ["Normklima-Lagerung", "7-Tage-Festigkeit (optional)", "Dokumentation"], status: "waiting" },
    { woche: "Woche 5-6", phase: "Hauptprüfungen", aktivitaeten: ["28-Tage-Festigkeiten", "Brandverhalten", "Sonderprüfungen"], status: "testing" },
    { woche: "Woche 7", phase: "Auswertung", aktivitaeten: ["Datenanalyse", "Berichtserstellung", "Qualitätssicherung"], status: "analysis" },
    { woche: "Woche 8", phase: "Abschluss", aktivitaeten: ["Prüfbericht", "Zertifikat", "Archivierung"], status: "complete" },
  ]

  // Checkliste für ITT-Vorbereitung
  const checkliste = [
    { kategorie: "Dokumentation", items: [
      "Rezeptur vollständig dokumentiert",
      "Rohstoff-Datenblätter vorhanden",
      "Sicherheitsdatenblätter aktuell",
      "Produktbeschreibung erstellt",
      "Verwendungszweck definiert"
    ]},
    { kategorie: "Technische Vorbereitung", items: [
      "Produktionsverfahren beschrieben",
      "Mischzeiten festgelegt",
      "Qualitätskontrollplan erstellt",
      "Prüfmittel kalibriert",
      "Personal geschult"
    ]},
    { kategorie: "Rechtliche Anforderungen", items: [
      "EN 13813 Anforderungen geprüft",
      "Zusätzliche nationale Normen beachtet",
      "Brandschutzklasse festgelegt",
      "Umweltanforderungen geklärt",
      "CE-Konformität vorbereitet"
    ]},
    { kategorie: "Laborauswahl", items: [
      "Akkreditierung geprüft (EN ISO/IEC 17025)",
      "Prüfumfang abgestimmt",
      "Kosten kalkuliert",
      "Zeitplan vereinbart",
      "Probenahme geklärt"
    ]}
  ]

  // Häufige Fehler
  const haeufigeFehler = [
    {
      fehler: "Unvollständige Rezepturdokumentation",
      folgen: "ITT-Verzögerung, Nachforderungen des Labors",
      vermeidung: "Alle Rohstoffe mit genauer Bezeichnung und Hersteller dokumentieren, inkl. Zusatzmittel",
      kosten: "500-1000€ Mehrkosten"
    },
    {
      fehler: "Falsche Probenahme",
      folgen: "Ungültige Prüfergebnisse, Wiederholung nötig",
      vermeidung: "Probenahme nach EN 13892-1, am besten durch Laborpersonal",
      kosten: "Komplette ITT-Wiederholung"
    },
    {
      fehler: "Zu optimistische Leistungswerte",
      folgen: "FPC-Probleme, ständige Abweichungen",
      vermeidung: "Realistische Werte deklarieren, Sicherheitsmarge einplanen",
      kosten: "Dauerhafte Qualitätsprobleme"
    },
    {
      fehler: "Fehlende Brandschutzprüfung",
      folgen: "Keine CE-Kennzeichnung möglich",
      vermeidung: "Brandverhalten ist Pflicht, auch bei Klasse A1fl",
      kosten: "800€ Nachprüfung"
    },
    {
      fehler: "Ungeeignetes Prüflabor",
      folgen: "Nicht anerkannte Prüfberichte",
      vermeidung: "Nur DAkkS-akkreditierte Labore beauftragen",
      kosten: "Komplette Neuprüfung"
    }
  ]

  // FAQ
  const faqItems = [
    {
      frage: "Wie lange ist ein ITT-Bericht gültig?",
      antwort: "Ein ITT-Bericht hat keine Ablaufzeit, solange sich die Rezeptur nicht ändert. Bei wesentlichen Änderungen (neue Rohstoffe, geänderte Mischungsverhältnisse) ist eine neue ITT erforderlich."
    },
    {
      frage: "Kann ich die ITT selbst durchführen?",
      antwort: "Nein, die ITT muss von einem akkreditierten, unabhängigen Prüflabor nach EN ISO/IEC 17025 durchgeführt werden. Eigene Prüfungen gelten nur für die werkseigene Produktionskontrolle (FPC)."
    },
    {
      frage: "Was kostet eine ITT für mehrere Rezepturen?",
      antwort: "Viele Labore bieten Paketpreise an. Bei 3-5 Rezepturen können Sie mit 20-30% Rabatt rechnen. Die Grundprüfungen müssen aber für jede Rezeptur separat durchgeführt werden."
    },
    {
      frage: "Muss ich alle möglichen Eigenschaften prüfen lassen?",
      antwort: "Nein, Sie müssen nur die Eigenschaften prüfen lassen, die Sie in der Leistungserklärung (DoP) deklarieren möchten. Pflicht sind aber mindestens Druck- und Biegezugfestigkeit sowie Brandverhalten."
    },
    {
      frage: "Was passiert bei Nicht-Bestehen der ITT?",
      antwort: "Bei Nicht-Erreichen der angestrebten Werte können Sie entweder die Rezeptur anpassen und neu prüfen lassen, oder niedrigere Werte deklarieren, sofern diese noch marktfähig sind."
    },
    {
      frage: "Kann ich ausländische ITT-Berichte verwenden?",
      antwort: "Ja, ITT-Berichte von akkreditierten Laboren aus anderen EU-Ländern werden anerkannt. Die Akkreditierung muss aber gleichwertig sein (EA-MLA Abkommen)."
    },
    {
      frage: "Wie detailliert muss die Rezeptur angegeben werden?",
      antwort: "Die Rezeptur muss so genau sein, dass das Produkt reproduzierbar ist. Genaue Mengenangaben, Rohstoffbezeichnungen und Hersteller müssen dokumentiert sein."
    },
    {
      frage: "Was ist der Unterschied zwischen ITT und Zertifizierung?",
      antwort: "ITT ist eine einmalige Typprüfung für die CE-Kennzeichnung. Eine Zertifizierung (z.B. nach ISO 9001) ist eine regelmäßig überwachte Systemprüfung."
    }
  ]

  // Kostenrechner
  const berechneGesamtkosten = (estrichTyp: string) => {
    const params = pruefparameter[estrichTyp as keyof typeof pruefparameter] || []
    const pflichtkosten = params
      .filter(p => p.pflicht)
      .reduce((sum, p) => {
        const avgCost = parseInt(p.kosten.split('-')[1]) || 0
        return sum + avgCost
      }, 0)

    const optionalkosten = params
      .filter(p => !p.pflicht)
      .reduce((sum, p) => {
        const avgCost = parseInt(p.kosten.split('-')[1]) || 0
        return sum + avgCost
      }, 0)

    return {
      pflicht: pflichtkosten,
      optional: optionalkosten,
      gesamt: pflichtkosten + optionalkosten,
      minimal: pflichtkosten,
      nebenkosten: 200 // Probenahme, Versand, etc.
    }
  }

  const kosten = berechneGesamtkosten(selectedEstrichType)

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li><Link href="/wissen" className="text-gray-500 hover:text-gray-700">Wissen</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">ITT Management</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 lg:px-8 border-b bg-gradient-to-b from-white to-red-50">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-red-100 text-red-800">Erstprüfung • Pflicht vor CE • EN 13813</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            ITT - Initial Type Testing für Estrich
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Der komplette Leitfaden zur Erstprüfung nach EN 13813. Mit Prüflaboren,
            Kostenrechner, Checklisten und Praxistipps für eine erfolgreiche ITT.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="#kostenrechner">
                <Calculator className="mr-2 h-5 w-5" />
                Kosten berechnen
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#labore">
                <Building className="mr-2 h-5 w-5" />
                Prüflabore finden
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <article className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Was ist ITT - Erweitert */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Was ist ITT und warum ist sie so wichtig?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700">
                  Die <strong>Initial Type Testing (ITT)</strong> oder Erstprüfung ist das Fundament
                  jeder CE-Kennzeichnung für Estrichprodukte. Sie ist eine einmalige, umfassende
                  Prüfung aller relevanten Produkteigenschaften durch ein akkreditiertes,
                  unabhängiges Prüflabor.
                </p>
                <p className="text-gray-700">
                  Ohne gültige ITT-Prüfung dürfen Sie Ihre Estrichprodukte nicht mit CE-Kennzeichnung
                  in Verkehr bringen – das ist EU-weit gesetzlich vorgeschrieben.
                </p>
              </div>
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Rechtliche Grundlage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm"><strong>EU-Bauprodukteverordnung 305/2011</strong></p>
                  <p className="text-sm">Harmonisierte Norm: <strong>EN 13813:2002</strong></p>
                  <p className="text-sm">System: <strong>AVCP 4</strong> (Eigenverantwortung)</p>
                  <p className="text-sm text-gray-600 mt-3">
                    Die ITT bildet zusammen mit der werkseigenen Produktionskontrolle (FPC)
                    die Basis für Ihre Leistungserklärung (DoP).
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wichtig für Estrichwerke</AlertTitle>
              <AlertDescription>
                Die ITT muss VOR dem erstmaligen Inverkehrbringen durchgeführt werden.
                Planen Sie mindestens 8 Wochen ein, um Verzögerungen zu vermeiden.
              </AlertDescription>
            </Alert>
          </section>

          {/* Interaktiver Kostenrechner */}
          <section id="kostenrechner" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">ITT-Kostenrechner nach Estrichtyp</h2>

            <Tabs value={selectedEstrichType} onValueChange={setSelectedEstrichType}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="CT">CT - Zementestrich</TabsTrigger>
                <TabsTrigger value="CA">CA - Calciumsulfat</TabsTrigger>
                <TabsTrigger value="MA">MA - Magnesia</TabsTrigger>
                <TabsTrigger value="AS">AS - Gussasphalt</TabsTrigger>
                <TabsTrigger value="SR">SR - Kunstharz</TabsTrigger>
              </TabsList>

              {Object.entries(pruefparameter).map(([type, params]) => (
                <TabsContent key={type} value={type}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Prüfparameter für {type}-Estrich</CardTitle>
                      <CardDescription>
                        Pflichtprüfungen und optionale Zusatzprüfungen nach EN 13813
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="border px-4 py-2 text-left">Eigenschaft</th>
                              <th className="border px-4 py-2 text-left">Norm</th>
                              <th className="border px-4 py-2 text-center">Pflicht</th>
                              <th className="border px-4 py-2 text-left">Kosten</th>
                              <th className="border px-4 py-2 text-left">Dauer</th>
                              <th className="border px-4 py-2 text-left">Einheit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {params.map((item) => (
                              <tr key={item.eigenschaft} className={item.pflicht ? "bg-red-50" : ""}>
                                <td className="border px-4 py-2 font-medium">{item.eigenschaft}</td>
                                <td className="border px-4 py-2 text-sm text-gray-600">{item.norm}</td>
                                <td className="border px-4 py-2 text-center">
                                  {item.pflicht ? (
                                    <Badge variant="destructive" className="text-xs">Pflicht</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                                  )}
                                </td>
                                <td className="border px-4 py-2 font-medium text-blue-600">{item.kosten}</td>
                                <td className="border px-4 py-2 text-sm">{item.dauer}</td>
                                <td className="border px-4 py-2 text-sm text-gray-600">{item.einheit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Kostenübersicht */}
                      <div className="mt-6 grid md:grid-cols-3 gap-4">
                        <Card className="bg-red-50 border-red-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Pflichtprüfungen
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-red-600">
                              {kosten.pflicht.toLocaleString('de-DE')} €
                            </p>
                            <p className="text-sm text-gray-600">Minimum für CE</p>
                          </CardContent>
                        </Card>

                        <Card className="bg-blue-50 border-blue-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              Optionale Prüfungen
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-blue-600">
                              {kosten.optional.toLocaleString('de-DE')} €
                            </p>
                            <p className="text-sm text-gray-600">Zusatzleistungen</p>
                          </CardContent>
                        </Card>

                        <Card className="bg-green-50 border-green-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Euro className="h-4 w-4" />
                              Gesamtkosten
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                              {kosten.minimal.toLocaleString('de-DE')} - {kosten.gesamt.toLocaleString('de-DE')} €
                            </p>
                            <p className="text-sm text-gray-600">+ {kosten.nebenkosten}€ Nebenkosten</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Alert className="mt-4">
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Spartipp:</strong> Bei mehreren Rezepturen gleichzeitig können Sie
                          20-30% sparen. Brandverhalten muss nur einmal pro Bindemitteltyp geprüft werden.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* Akkreditierte Prüflabore */}
          <section id="labore" className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Akkreditierte Prüflabore in Deutschland</h2>
            <p className="text-lg text-gray-600 mb-8">
              Nur DAkkS-akkreditierte Labore nach EN ISO/IEC 17025 sind für ITT-Prüfungen zugelassen.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prueflabore.map((labor) => (
                <Card key={labor.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start justify-between">
                      <span>{labor.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        DAkkS
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {labor.standort}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">Akkreditierung:</p>
                      <p className="text-gray-600">{labor.akkreditierung}</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">Schwerpunkt:</p>
                      <p className="text-gray-600">{labor.schwerpunkt}</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{labor.kontakt.telefon}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{labor.kontakt.email}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3" />
                        <a href={`https://${labor.kontakt.web}`} className="text-blue-600 hover:underline">
                          {labor.kontakt.web}
                        </a>
                      </p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-gray-700 mb-1">Besonderheiten:</p>
                      <div className="flex flex-wrap gap-1">
                        {labor.besonderheiten.map((item) => (
                          <Badge key={item} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Detaillierter Zeitplan */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">ITT-Zeitplan: Von der Planung zum Prüfbericht</h2>
            <Card>
              <CardHeader>
                <CardTitle>8-Wochen-Plan für erfolgreiche ITT</CardTitle>
                <CardDescription>
                  Durchschnittliche Zeitplanung für eine Standard-ITT-Prüfung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {zeitplan.map((phase, index) => (
                    <div key={phase.woche} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-24">
                        <Badge variant={
                          phase.status === "complete" ? "default" :
                          phase.status === "testing" ? "destructive" :
                          "secondary"
                        }>
                          {phase.woche}
                        </Badge>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold">{phase.phase}</h4>
                        <ul className="mt-1 space-y-1">
                          {phase.aktivitaeten.map((aktivitaet) => (
                            <li key={aktivitaet} className="text-sm text-gray-600 flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {aktivitaet}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {index < zeitplan.length - 1 && (
                        <div className="flex-shrink-0">
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Alert className="mt-6">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Zeitspar-Tipp:</strong> Viele Prüfungen können parallel durchgeführt werden.
                    Express-Service verkürzt die Gesamtdauer auf 4-5 Wochen (Aufpreis 30-50%).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </section>

          {/* Umfassende Checkliste */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">ITT-Checkliste: Nichts vergessen!</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {checkliste.map((kategorie) => (
                <Card key={kategorie.kategorie}>
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg">{kategorie.kategorie}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {kategorie.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckSquare className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Button size="lg" variant="outline">
                <Download className="mr-2 h-5 w-5" />
                Checkliste als PDF herunterladen
              </Button>
            </div>
          </section>

          {/* Häufige Fehler vermeiden */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Die 5 häufigsten ITT-Fehler und wie Sie sie vermeiden</h2>
            <div className="space-y-6">
              {haeufigeFehler.map((item, index) => (
                <Card key={index} className="border-l-4 border-red-500">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Fehler #{index + 1}: {item.fehler}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium text-sm text-gray-700 mb-1">Folgen:</p>
                        <p className="text-sm text-gray-600">{item.folgen}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-700 mb-1">So vermeiden Sie es:</p>
                        <p className="text-sm text-green-600">{item.vermeidung}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-700 mb-1">Kostenrisiko:</p>
                        <Badge variant="destructive">{item.kosten}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Praxistipps vom Experten */}
          <section className="mb-16">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                  Praxistipps vom Experten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Vor der ITT:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>Führen Sie interne Vorprüfungen durch - so erleben Sie keine bösen Überraschungen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>Dokumentieren Sie die Rezeptur fotografisch - jeder Rohstoffsack, jedes Etikett</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>Planen Sie Puffer ein - deklarieren Sie 10-15% unter Ihren besten Werten</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">4.</span>
                        <span>Besprechen Sie Sonderanforderungen vorher mit dem Labor</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Nach der ITT:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">1.</span>
                        <span>Archivieren Sie alle Dokumente digital und physisch - mindestens 10 Jahre</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">2.</span>
                        <span>Erstellen Sie sofort Ihre DoP - verzögern Sie nicht</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">3.</span>
                        <span>Richten Sie Ihre FPC auf die ITT-Werte aus</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">4.</span>
                        <span>Informieren Sie Ihr Vertriebsteam über die neuen Leistungswerte</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Sektion */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Häufig gestellte Fragen zur ITT</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span>{item.frage}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700 pl-7">{item.antwort}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Download-Bereich */}
          <section className="mb-16">
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Hilfreiche Downloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    ITT-Checkliste (PDF)
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Muster-Rezepturdokumentation
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Kostenkalkulationstabelle (Excel)
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Labor-Vergleichstabelle
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    ITT-Zeitplan-Vorlage
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Prüfparameter-Übersicht
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Zusammenfassung */}
          <section className="mb-16">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-2xl">ITT-Erfolg in 10 Schritten</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    "Rezeptur vollständig dokumentieren",
                    "Akkreditiertes Labor auswählen",
                    "Prüfumfang festlegen (Pflicht + Optional)",
                    "Kosten kalkulieren und Budget freigeben",
                    "Zeitplan mit Puffer erstellen",
                    "Probenahme koordinieren",
                    "Prüfung begleiten und überwachen",
                    "Prüfbericht kritisch prüfen",
                    "DoP erstellen und veröffentlichen",
                    "FPC auf ITT-Werte ausrichten"
                  ].map((schritt, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm">{schritt}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Rechtliche Hinweise */}
          <Alert className="mb-16">
            <Shield className="h-4 w-4" />
            <AlertTitle>Rechtlicher Hinweis</AlertTitle>
            <AlertDescription>
              Diese Informationen dienen zur Orientierung und ersetzen keine Rechtsberatung.
              Die Anforderungen können je nach Produkttyp und Verwendungszweck variieren.
              Im Zweifelsfall konsultieren Sie die EN 13813 direkt oder ziehen Sie einen
              Fachberater hinzu.
            </AlertDescription>
          </Alert>
        </div>
      </article>

      {/* CTA Section */}
      <section className="px-6 py-16 lg:px-8 bg-gradient-to-r from-red-600 to-pink-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">ITT-Management digitalisieren</h2>
          <p className="text-lg text-red-100 mb-8">
            Mit EstrichManager verwalten Sie alle ITT-Prüfungen digital. Automatische Erinnerungen
            bei Rezepturänderungen, lückenlose Archivierung aller Berichte und direkte
            DoP-Generierung aus ITT-Daten.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">
                Kostenlose Demo anfordern
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-red-600">
              <Link href="/kontakt">
                Beratungsgespräch vereinbaren
                <Phone className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="px-6 py-12 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h3 className="text-xl font-bold mb-6">Weiterführende Themen</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/wissen/fpc-dokumentation" className="group">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <ClipboardCheck className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    FPC nach ITT aufbauen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Wie Sie Ihre werkseigene Produktionskontrolle auf ITT-Werte ausrichten
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/wissen/dop-erstellung" className="group">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FileText className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                    DoP aus ITT erstellen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Von ITT-Prüfbericht zur fertigen Leistungserklärung
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/wissen/ce-kennzeichnung" className="group">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Shield className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                    CE-Kennzeichnung anbringen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Nach erfolgreicher ITT zur rechtssicheren CE-Kennzeichnung
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}