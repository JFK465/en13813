import { Metadata } from "next"
import Link from "next/link"
import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Layers,
  FlaskConical,
  Info,
  Target,
  ListChecks
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Welche EN 13892 Prüfung für Estrich? - Entscheidungshilfe 2025",
  description: "Finden Sie die richtige EN 13892 Prüfung für Ihren Estrich. Interaktive Entscheidungshilfe nach Bindemitteltyp, Anwendung und Anforderungen. Inkl. Prüfpflicht-Matrix.",
  keywords: [
    "EN 13892 Prüfung auswählen",
    "welche Estrichprüfung",
    "EN 13892 Entscheidungshilfe",
    "Prüfung Estrich Pflicht",
    "EN 13892-2 erforderlich",
    "Verschleißprüfung wann",
    "Estrich Prüfauswahl"
  ],
  openGraph: {
    title: "Welche EN 13892 Prüfung brauche ich für meinen Estrich?",
    description: "Schritt-für-Schritt Entscheidungshilfe für die richtige EN 13892 Prüfauswahl. Basierend auf Estrichtyp und Anwendung.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/welche-en-13892-pruefung",
  },
}

export default function WelcheEN13892PruefungPage() {
  // Entscheidungsbaum nach Bindemitteltyp
  const bindemittelEntscheidungen = [
    {
      type: "CT",
      name: "Zementestrich",
      pflicht: [
        { norm: "EN 13892-1", name: "Probenahme und Lagerung", grund: "Basis für alle Prüfungen" },
        { norm: "EN 13892-2", name: "Biege- und Druckfestigkeit", grund: "Normative Eigenschaft" }
      ],
      bedingt: [
        { norm: "EN 13892-3", name: "Verschleiß Böhme", bedingung: "Nutzschicht ohne Bodenbelag" },
        { norm: "EN 13892-4", name: "Verschleiß BCA", bedingung: "Hohe mechanische Belastung" },
        { norm: "EN 13892-5", name: "Rollprüfung", bedingung: "Staplerverkehr" },
        { norm: "EN 13892-9", name: "Dimensionsstabilität", bedingung: "Großflächige Anwendung" }
      ],
      link: "zementestrich-en-13813-pruefpflichten"
    },
    {
      type: "CA",
      name: "Calciumsulfatestrich (Anhydrit)",
      pflicht: [
        { norm: "EN 13892-1", name: "Probenahme und Lagerung", grund: "Basis für alle Prüfungen" },
        { norm: "EN 13892-2", name: "Biege- und Druckfestigkeit", grund: "Normative Eigenschaft" }
      ],
      bedingt: [
        { norm: "EN 13892-3", name: "Verschleiß Böhme", bedingung: "Nutzschicht ohne Bodenbelag" },
        { norm: "EN 13892-9", name: "Dimensionsstabilität", bedingung: "Heizestrich oder große Flächen" }
      ],
      link: "calciumsulfat-fliessestrich-pruefnormen"
    },
    {
      type: "MA",
      name: "Magnesiaestrich (Steinholz)",
      pflicht: [
        { norm: "EN 13892-1", name: "Probenahme und Lagerung", grund: "Basis für alle Prüfungen" },
        { norm: "EN 13892-2", name: "Biege- und Druckfestigkeit", grund: "Normative Eigenschaft" },
        { norm: "EN 13892-6", name: "Oberflächenhärte", grund: "Spezifische MA-Eigenschaft" }
      ],
      bedingt: [
        { norm: "EN 13892-3", name: "Verschleiß Böhme", bedingung: "Nutzschicht ohne Bodenbelag" },
        { norm: "EN 13892-4", name: "Verschleiß BCA", bedingung: "Industrielle Nutzung" }
      ],
      link: "magnesiaestrich-en-13892-6-oberflaechenhaerte"
    },
    {
      type: "SR",
      name: "Kunstharzestrich (Reaktionsharz)",
      pflicht: [
        { norm: "EN 13892-1", name: "Probenahme und Lagerung", grund: "Basis für alle Prüfungen" },
        { norm: "EN 13892-2", name: "Biege- und Druckfestigkeit", grund: "Normative Eigenschaft" },
        { norm: "EN 13892-8", name: "Haftzugfestigkeit", grund: "Kritisch für SR-Estrich" }
      ],
      bedingt: [
        { norm: "EN 13892-4", name: "Verschleiß BCA", bedingung: "Nutzschicht ohne Bodenbelag" },
        { norm: "EN 13892-6", name: "Oberflächenhärte", bedingung: "Deklarierte Eigenschaft" },
        { norm: "EN ISO 6272-1", name: "Schlagfestigkeit", bedingung: "Besondere Anforderungen" }
      ],
      link: "kunstharzestrich-en-13892-8-haftzugfestigkeit"
    },
    {
      type: "AS",
      name: "Gussasphaltestrich",
      pflicht: [
        { norm: "EN 13892-1", name: "Probenahme und Lagerung", grund: "Basis für alle Prüfungen" }
      ],
      bedingt: [
        { norm: "EN 13892-5", name: "Rollprüfung", bedingung: "Verkehrsflächen" },
        { norm: "EN 12697-20", name: "Stempeleindringversuch", bedingung: "Spezifische AS-Prüfung" }
      ],
      link: "gussasphaltestrich-en-12697-20-stempeleindringversuch"
    }
  ]

  // Anwendungsbasierte Entscheidungshilfe
  const anwendungsFaelle = [
    {
      anwendung: "Wohnbereich mit Bodenbelag",
      icon: "🏠",
      beschreibung: "Fliesen, Parkett oder Teppich auf dem Estrich",
      pruefungen: [
        { norm: "EN 13892-1", pflicht: true },
        { norm: "EN 13892-2", pflicht: true }
      ],
      hinweis: "Verschleißprüfungen nicht erforderlich, da der Estrich nicht als Nutzschicht dient."
    },
    {
      anwendung: "Nutzschicht ohne Bodenbelag (Industrie)",
      icon: "🏭",
      beschreibung: "Estrich als finale Oberfläche in Lagerhallen, Werkstätten",
      pruefungen: [
        { norm: "EN 13892-1", pflicht: true },
        { norm: "EN 13892-2", pflicht: true },
        { norm: "EN 13892-3 oder -4", pflicht: true, info: "Verschleißprüfung erforderlich" }
      ],
      hinweis: "Mindestens eine Verschleißprüfung ist verpflichtend. Wählen Sie basierend auf Estrichtyp."
    },
    {
      anwendung: "Heizestrich (Fußbodenheizung)",
      icon: "♨️",
      beschreibung: "Estrich mit integrierter Fußbodenheizung",
      pruefungen: [
        { norm: "EN 13892-1", pflicht: true },
        { norm: "EN 13892-2", pflicht: true },
        { norm: "EN 13892-9", pflicht: false, info: "Schwindverhalten empfohlen" }
      ],
      hinweis: "Dimensionsstabilitätsprüfung wird empfohlen, um Rissbildung zu vermeiden."
    },
    {
      anwendung: "Staplerverkehr / Logistik",
      icon: "🚛",
      beschreibung: "Flächen mit Gabelstapler- oder Hubwagenverkehr",
      pruefungen: [
        { norm: "EN 13892-1", pflicht: true },
        { norm: "EN 13892-2", pflicht: true },
        { norm: "EN 13892-5", pflicht: true, info: "Rollprüfung" }
      ],
      hinweis: "EN 13892-5 (Rollprüfung) ist bei Staplerverkehr zwingend erforderlich."
    },
    {
      anwendung: "Verbundestrich auf Beton",
      icon: "🔗",
      beschreibung: "Estrich vollflächig auf Betonuntergrund verklebt",
      pruefungen: [
        { norm: "EN 13892-1", pflicht: true },
        { norm: "EN 13892-2", pflicht: true },
        { norm: "EN 13892-8", pflicht: false, info: "Bei SR-Estrich Pflicht" }
      ],
      hinweis: "Haftzugfestigkeit ist nur bei Kunstharzestrich (SR) verpflichtend zu prüfen."
    },
    {
      anwendung: "Großflächige Hallen (>500m²)",
      icon: "📐",
      beschreibung: "Große zusammenhängende Flächen ohne Fugen",
      pruefungen: [
        { norm: "EN 13892-1", pflicht: true },
        { norm: "EN 13892-2", pflicht: true },
        { norm: "EN 13892-9", pflicht: false, info: "Dimensionsstabilität empfohlen" }
      ],
      hinweis: "Prüfung des Schwindverhaltens zur Vermeidung von Schwindrissen empfohlen."
    }
  ]

  // FAQs
  const faqs = [
    {
      frage: "Kann ich EN 13892-3 und EN 13892-4 beide durchführen?",
      antwort: "Ja, das ist möglich, aber normalerweise nicht notwendig. Wählen Sie die Prüfmethode, die am besten zu Ihrem Estrichtyp passt: Böhme (EN 13892-3) für Zement- und Calciumsulfatestrich, BCA (EN 13892-4) für Kunstharz- und Magnesiaestrich."
    },
    {
      frage: "Muss ich bei jeder Charge alle Prüfungen wiederholen?",
      antwort: "Nein. Die Erstprüfung (ITT) erfordert alle relevanten Prüfungen. Bei der werkseigenen Produktionskontrolle (FPC) sind reduzierte Prüfhäufigkeiten zulässig. Typischerweise wird nur die Druckfestigkeit regelmäßig geprüft."
    },
    {
      frage: "Was bedeutet 'Nutzschicht ohne Bodenbelag'?",
      antwort: "Der Estrich wird als finale Oberfläche verwendet, ohne dass ein zusätzlicher Bodenbelag (Fliesen, Parkett, etc.) aufgebracht wird. In diesem Fall ist eine Verschleißprüfung verpflichtend."
    },
    {
      frage: "Welche Prüfung bei Sichtestrich mit Versiegelung?",
      antwort: "Auch bei versiegeltem Sichtestrich zählt der Estrich als Nutzschicht. Eine Verschleißprüfung (EN 13892-3 oder -4) ist erforderlich. Die Versiegelung gilt nicht als Bodenbelag im Sinne der Norm."
    },
    {
      frage: "Wie entscheide ich zwischen Böhme und BCA?",
      antwort: "EN 13892-3 (Böhme) wird für mineralische Estriche (CT, CA) verwendet. EN 13892-4 (BCA) ist für Kunstharzestriche (SR) und teilweise für Magnesiaestrich (MA) vorgesehen. Bei Unsicherheit konsultieren Sie die technischen Merkblätter oder Ihren Normberater."
    }
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <nav className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li><Link href="/wissen" className="text-gray-500 hover:text-gray-700">Wissen</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li><Link href="/wissen/en-13892-reihe" className="text-gray-500 hover:text-gray-700">EN 13892</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">Prüfauswahl</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-green-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
              Entscheidungshilfe
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Welche EN 13892 Prüfung brauche ich für meinen Estrich?
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Nicht jede EN 13892 Prüfung ist bei jedem Estrich erforderlich. Diese Entscheidungshilfe
            zeigt Ihnen basierend auf Bindemitteltyp und Anwendung, welche Prüfungen verpflichtend
            sind und welche optional durchgeführt werden können.
          </p>
        </div>
      </section>

      {/* TL;DR */}
      <section className="px-6 py-8 lg:px-8 bg-green-50 border-b border-green-100">
        <div className="mx-auto max-w-4xl">
          <Alert className="bg-white border-green-200">
            <Target className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-lg font-semibold text-green-900">
              Schnellantwort
            </AlertTitle>
            <AlertDescription className="mt-3 text-gray-700 space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Immer erforderlich:</strong> EN 13892-1 (Probenahme) + EN 13892-2 (Festigkeit)</li>
                <li><strong>Bei Nutzschicht ohne Bodenbelag:</strong> + Verschleißprüfung (EN 13892-3, -4 oder -5)</li>
                <li><strong>Bei Magnesiaestrich (MA):</strong> + EN 13892-6 (Oberflächenhärte)</li>
                <li><strong>Bei Kunstharzestrich (SR):</strong> + EN 13892-8 (Haftzugfestigkeit)</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Entscheidung nach Bindemitteltyp */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prüfauswahl nach Bindemitteltyp
            </h2>
            <p className="text-lg text-gray-600">
              Wählen Sie Ihren Estrichtyp, um die erforderlichen Prüfungen zu sehen.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {bindemittelEntscheidungen.map((estrich) => (
              <Card key={estrich.type} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="text-lg px-4 py-1.5 bg-blue-600">
                      {estrich.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{estrich.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Pflichtprüfungen */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Pflichtprüfungen
                    </h4>
                    <div className="space-y-3">
                      {estrich.pflicht.map((pruefung) => (
                        <div
                          key={pruefung.norm}
                          className="bg-green-50 border border-green-200 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-green-900">
                                {pruefung.norm}
                              </div>
                              <div className="text-sm text-gray-700 mt-0.5">
                                {pruefung.name}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mt-2 flex items-start">
                            <Info className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                            {pruefung.grund}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bedingte Prüfungen */}
                  {estrich.bedingt.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                        Bedingt erforderlich
                      </h4>
                      <div className="space-y-3">
                        {estrich.bedingt.map((pruefung) => (
                          <div
                            key={pruefung.norm}
                            className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                          >
                            <div className="font-medium text-orange-900">
                              {pruefung.norm}
                            </div>
                            <div className="text-sm text-gray-700 mt-0.5">
                              {pruefung.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-2 flex items-start">
                              <Info className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                              <span><strong>Wenn:</strong> {pruefung.bedingung}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link href={`/wissen/${estrich.link}`}>
                    <Button className="w-full" variant="outline">
                      Detaillierte Infos zu {estrich.type}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Entscheidung nach Anwendung */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prüfauswahl nach Anwendungsfall
            </h2>
            <p className="text-lg text-gray-600">
              Die Anwendung des Estrichs bestimmt, welche zusätzlichen Prüfungen erforderlich sind.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {anwendungsFaelle.map((fall, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-3">{fall.icon}</div>
                  <CardTitle className="text-lg">{fall.anwendung}</CardTitle>
                  <CardDescription className="text-sm">
                    {fall.beschreibung}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">
                      Erforderliche Prüfungen:
                    </h5>
                    <ul className="space-y-2">
                      {fall.pruefungen.map((pruefung, i) => (
                        <li key={i} className="text-sm flex items-start">
                          {pruefung.pflicht ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <span className={pruefung.pflicht ? "text-gray-900" : "text-gray-700"}>
                              {pruefung.norm}
                            </span>
                            {pruefung.info && (
                              <div className="text-xs text-gray-600 mt-0.5">
                                {pruefung.info}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-xs text-gray-700">
                      {fall.hinweis}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Entscheidungsflussdiagramm */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Schnell-Check: 4 Fragen zur richtigen Prüfauswahl
          </h2>

          <div className="space-y-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                    1
                  </span>
                  Welches Bindemittel verwenden Sie?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">
                  CT (Zement), CA (Calciumsulfat), MA (Magnesia), SR (Kunstharz) oder AS (Gussasphalt)?
                </p>
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <strong>Ergebnis:</strong> Bestimmt Ihre Basispflichten (EN 13892-1, -2 immer + ggf. -6 bei MA, -8 bei SR)
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-start">
                  <span className="bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                    2
                  </span>
                  Wird der Estrich als Nutzschicht verwendet?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">
                  Bleibt der Estrich ohne zusätzlichen Bodenbelag (Sichtestrich, Industrieboden)?
                </p>
                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <strong>Ja:</strong> Verschleißprüfung erforderlich (EN 13892-3, -4 oder -5)<br />
                  <strong>Nein:</strong> Keine Verschleißprüfung nötig
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-start">
                  <span className="bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                    3
                  </span>
                  Gibt es Staplerverkehr oder Rolllasten?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">
                  Wird die Fläche mit Gabelstaplern, Hubwagen oder ähnlichen Fahrzeugen befahren?
                </p>
                <div className="bg-orange-50 p-3 rounded-lg text-sm">
                  <strong>Ja:</strong> EN 13892-5 (Rollprüfung) erforderlich<br />
                  <strong>Nein:</strong> EN 13892-3 oder -4 ausreichend
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-start">
                  <span className="bg-purple-500 text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 flex-shrink-0 text-sm">
                    4
                  </span>
                  Handelt es sich um eine großflächige Anwendung?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">
                  Fläche &gt; 500 m², Heizestrich oder fugenlose Ausführung?
                </p>
                <div className="bg-purple-50 p-3 rounded-lg text-sm">
                  <strong>Ja:</strong> EN 13892-9 (Dimensionsstabilität) empfohlen<br />
                  <strong>Nein:</strong> Optional, aber nicht zwingend
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-8 bg-blue-50 border-blue-200">
            <ListChecks className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-blue-900">Unsicher bei der Auswahl?</AlertTitle>
            <AlertDescription className="text-gray-700 mt-2">
              EstrichManager analysiert Ihr Rezept automatisch und schlägt die erforderlichen
              Prüfungen vor. Keine Fehler mehr bei der Prüfplanung.
              <Link href="/demo" className="text-blue-600 hover:underline ml-1">
                Jetzt Demo ansehen →
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Häufig gestellte Fragen
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <span className="text-blue-600 font-bold flex-shrink-0">Q:</span>
                    <span>{faq.frage}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 pl-6">{faq.antwort}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Verwandte Artikel */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Verwandte Artikel
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Link href="/wissen/en-13892-reihe">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Übersicht</Badge>
                  <CardTitle className="text-lg">
                    EN 13892 Prüfnormen komplett
                  </CardTitle>
                  <CardDescription>
                    Alle EN 13892 Normen im Detail erklärt
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/pruefhaeufigkeiten-en-13813">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Prüfplanung</Badge>
                  <CardTitle className="text-lg">
                    Prüfhäufigkeiten nach EN 13813
                  </CardTitle>
                  <CardDescription>
                    Wie oft muss geprüft werden?
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/verschleisspruefung-boehme-bca-vergleich">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Vergleich</Badge>
                  <CardTitle className="text-lg">
                    Böhme vs. BCA Verschleißprüfung
                  </CardTitle>
                  <CardDescription>
                    EN 13892-3 oder EN 13892-4?
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <FlaskConical className="h-12 w-12 mx-auto mb-4 text-green-100" />
          <h2 className="text-3xl font-bold mb-4">
            Automatische Prüfauswahl mit EstrichManager
          </h2>
          <p className="text-lg text-green-100 mb-8">
            Keine manuellen Entscheidungen mehr. Die Software wählt basierend auf Ihrem
            Rezept automatisch die erforderlichen EN 13892 Prüfungen aus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-12">
              <Link href="/demo">
                Live-Demo ansehen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 bg-white/10 border-white text-white hover:bg-white/20"
            >
              <Link href="/beta">
                Kostenlos testen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Welche EN 13892 Prüfung brauche ich für meinen Estrich?",
            "description": "Entscheidungshilfe für die richtige EN 13892 Prüfauswahl basierend auf Bindemitteltyp und Anwendung.",
            "author": {
              "@type": "Organization",
              "name": "EstrichManager"
            },
            "datePublished": "2025-01-14",
            "dateModified": "2025-01-14"
          })
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.frage,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.antwort
              }
            }))
          })
        }}
      />
    </main>
  )
}
