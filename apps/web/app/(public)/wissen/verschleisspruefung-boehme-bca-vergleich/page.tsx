import { Metadata } from "next"
import Link from "next/link"
import {
  CheckCircle,
  X,
  ArrowRight,
  ChevronRight,
  Scale,
  CircleDot,
  AlertCircle,
  Info
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Böhme vs BCA Verschleißprüfung - EN 13892-3 oder -4? Vergleich",
  description: "EN 13892-3 (Böhme) vs EN 13892-4 (BCA) Verschleißprüfung im direkten Vergleich. Welche Prüfmethode für welchen Estrich? A-Klassen vs AR-Klassen erklärt.",
  keywords: [
    "Böhme Verschleißprüfung",
    "BCA Verschleißprüfung",
    "EN 13892-3 vs 13892-4",
    "Verschleißwiderstand Estrich",
    "A-Klassen Estrich",
    "AR-Klassen Kunstharz",
    "Verschleißprüfung Vergleich"
  ],
  openGraph: {
    title: "Böhme vs. BCA: Welche Verschleißprüfung für Estrich?",
    description: "Der direkte Vergleich der zwei wichtigsten Verschleißprüfungen nach EN 13892-3 und EN 13892-4.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/verschleisspruefung-boehme-bca-vergleich",
  },
}

export default function VerschleisspruefungVergleichPage() {
  // Direkter Vergleich
  const vergleichKriterien = [
    {
      kriterium: "Norm",
      boehme: "EN 13892-3",
      bca: "EN 13892-4",
      neutral: true
    },
    {
      kriterium: "Hauptanwendung",
      boehme: "Mineralische Estriche (CT, CA)",
      bca: "Kunstharzestriche (SR), teilw. MA"
    },
    {
      kriterium: "Prüfprinzip",
      boehme: "Rollende Stahlkugeln mit Schleifmittel",
      bca: "Rotierender Schleifkörper (Bredt-Costet-Agrawal)"
    },
    {
      kriterium: "Messgröße",
      boehme: "Volumenverlust in cm³/50cm²",
      bca: "Abtragsmenge in µm"
    },
    {
      kriterium: "Klassifizierung",
      boehme: "A-Klassen (A22, A15, A12, A9, A6, A3, A1.5)",
      bca: "AR-Klassen (AR6, AR4, AR2, AR1, AR0.5)"
    },
    {
      kriterium: "Prüfdauer",
      boehme: "Ca. 2-3 Stunden",
      bca: "Ca. 1-2 Stunden"
    },
    {
      kriterium: "Genauigkeit",
      boehme: "Gut für mittlere Belastungen",
      bca: "Sehr präzise bei hohen Anforderungen"
    },
    {
      kriterium: "Kosten",
      boehme: "€€ (moderat)",
      bca: "€€€ (höher)"
    }
  ]

  // Entscheidungsmatrix
  const entscheidungen = [
    {
      estrichTyp: "Zementestrich (CT)",
      empfehlung: "Böhme",
      norm: "EN 13892-3",
      grund: "Standardverfahren für mineralische Estriche",
      klassen: "A15, A12, A9 typisch",
      color: "border-blue-500"
    },
    {
      estrichTyp: "Calciumsulfatestrich (CA)",
      empfehlung: "Böhme",
      norm: "EN 13892-3",
      grund: "Speziell für CA-Estriche entwickelt",
      klassen: "A22, A15 typisch",
      color: "border-blue-500"
    },
    {
      estrichTyp: "Kunstharzestrich (SR)",
      empfehlung: "BCA",
      norm: "EN 13892-4",
      grund: "Präzisere Messung bei hoher Härte",
      klassen: "AR2, AR1, AR0.5 typisch",
      color: "border-green-500"
    },
    {
      estrichTyp: "Magnesiaestrich (MA)",
      empfehlung: "Beide möglich",
      norm: "EN 13892-3 oder -4",
      grund: "Je nach Anwendung und Anforderung",
      klassen: "A9-A3 oder AR4-AR2",
      color: "border-orange-500"
    },
    {
      estrichTyp: "Gussasphalt (AS)",
      empfehlung: "Keine",
      norm: "EN 13892-5 (Rollprüfung)",
      grund: "Spezielle Prüfung für AS erforderlich",
      klassen: "RWA-Klassen",
      color: "border-gray-500"
    }
  ]

  // Klassenübersicht
  const aKlassen = [
    { klasse: "A22", wert: "≤ 22", anwendung: "Geringe Belastung" },
    { klasse: "A15", wert: "≤ 15", anwendung: "Normale Belastung" },
    { klasse: "A12", wert: "≤ 12", anwendung: "Erhöhte Belastung" },
    { klasse: "A9", wert: "≤ 9", anwendung: "Gewerbliche Nutzung" },
    { klasse: "A6", wert: "≤ 6", anwendung: "Industrielle Nutzung" },
    { klasse: "A3", wert: "≤ 3", anwendung: "Hohe Beanspruchung" },
    { klasse: "A1.5", wert: "≤ 1.5", anwendung: "Sehr hohe Belastung" }
  ]

  const arKlassen = [
    { klasse: "AR6", wert: "≤ 6", anwendung: "Standard Kunstharz" },
    { klasse: "AR4", wert: "≤ 4", anwendung: "Erhöhte Anforderungen" },
    { klasse: "AR2", wert: "≤ 2", anwendung: "Industrieböden" },
    { klasse: "AR1", wert: "≤ 1", anwendung: "Hohe Beanspruchung" },
    { klasse: "AR0.5", wert: "≤ 0.5", anwendung: "Sehr hohe Belastung" }
  ]

  // FAQs
  const faqs = [
    {
      frage: "Kann ich bei Zementestrich auch BCA statt Böhme verwenden?",
      antwort: "Technisch ist das möglich, aber nicht üblich. EN 13892-3 (Böhme) ist das Standardverfahren für mineralische Estriche und in der Praxis etabliert. Die BCA-Prüfung (EN 13892-4) ist primär für Kunstharzestriche vorgesehen. Prüflabore und Zertifizierer erwarten bei CT-Estrich in der Regel Böhme-Ergebnisse."
    },
    {
      frage: "Was ist besser: A15 oder AR2?",
      antwort: "Die Klassen sind nicht direkt vergleichbar, da sie unterschiedliche Prüfverfahren verwenden. A15 (Böhme) ist typisch für gute Zementestriche, AR2 (BCA) für hochwertige Kunstharzestriche. Beide stehen für gute Verschleißbeständigkeit in ihrem jeweiligen Anwendungsbereich."
    },
    {
      frage: "Ist die BCA-Prüfung genauer als Böhme?",
      antwort: "Die BCA-Prüfung misst den Abtrag in Mikrometern (µm) und ist präziser bei sehr harten Oberflächen wie Kunstharzestrich. Böhme misst Volumenverlust und ist für die Streuung mineralischer Estriche besser geeignet. 'Genauer' hängt vom Estrichtyp ab."
    },
    {
      frage: "Muss ich beide Prüfungen durchführen?",
      antwort: "Nein. Sie benötigen nur eine Verschleißprüfung, und zwar diejenige, die für Ihren Estrichtyp normativ vorgesehen ist. Bei CT/CA: Böhme. Bei SR: BCA. Eine doppelte Prüfung ist weder erforderlich noch sinnvoll."
    },
    {
      frage: "Was kostet eine Verschleißprüfung?",
      antwort: "Böhme-Prüfungen kosten je nach Prüflabor zwischen 150-300€ pro Prüfkörper. BCA-Prüfungen sind mit 250-400€ etwas teurer. Die genauen Preise variieren je nach Labor und Auftragsgröße."
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
            <li className="text-gray-900 font-medium">Verschleißprüfung Vergleich</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-orange-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              <Scale className="mr-1.5 h-3.5 w-3.5" />
              Vergleich
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Verschleißprüfung: Böhme (EN 13892-3) vs. BCA (EN 13892-4) - Was ist der Unterschied?
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Böhme oder BCA? Diese Frage stellen sich viele Estrichwerke. Beide Normen prüfen den
            Verschleißwiderstand, aber mit unterschiedlichen Methoden und für verschiedene Estrichtypen.
            Dieser Vergleich hilft Ihnen bei der richtigen Wahl.
          </p>
        </div>
      </section>

      {/* TL;DR */}
      <section className="px-6 py-8 lg:px-8 bg-orange-50 border-b border-orange-100">
        <div className="mx-auto max-w-4xl">
          <Alert className="bg-white border-orange-200">
            <CircleDot className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-lg font-semibold text-orange-900">
              Kurz & knapp
            </AlertTitle>
            <AlertDescription className="mt-3 text-gray-700 space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Böhme (EN 13892-3):</strong> Für mineralische Estriche (CT, CA) - liefert A-Klassen</li>
                <li><strong>BCA (EN 13892-4):</strong> Für Kunstharzestriche (SR) - liefert AR-Klassen</li>
                <li><strong>Prüfprinzip:</strong> Böhme = rollende Kugeln, BCA = rotierender Schleifkörper</li>
                <li><strong>Nicht vergleichbar:</strong> A-Klassen und AR-Klassen basieren auf unterschiedlichen Verfahren</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Direkter Vergleich Tabelle */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Direkter Vergleich: Böhme vs. BCA
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Kriterium</th>
                  <th className="px-4 py-3 text-left bg-blue-700">
                    <div className="flex items-center gap-2">
                      <CircleDot className="h-4 w-4" />
                      Böhme (EN 13892-3)
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left bg-green-700">
                    <div className="flex items-center gap-2">
                      <CircleDot className="h-4 w-4" />
                      BCA (EN 13892-4)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {vergleichKriterien.map((zeile, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {zeile.kriterium}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {zeile.boehme}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {zeile.bca}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Entscheidungsmatrix */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Welche Prüfung für welchen Estrich?
          </h2>

          <div className="grid gap-6 lg:grid-cols-2">
            {entscheidungen.map((entscheidung, index) => (
              <Card key={index} className={`border-l-4 ${entscheidung.color}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{entscheidung.estrichTyp}</CardTitle>
                    <Badge className={
                      entscheidung.empfehlung === "Böhme" ? "bg-blue-600" :
                      entscheidung.empfehlung === "BCA" ? "bg-green-600" :
                      entscheidung.empfehlung === "Beide möglich" ? "bg-orange-600" :
                      "bg-gray-600"
                    }>
                      {entscheidung.empfehlung}
                    </Badge>
                  </div>
                  <CardDescription className="text-base font-medium text-gray-900">
                    {entscheidung.norm}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Begründung:</div>
                    <p className="text-sm text-gray-700">{entscheidung.grund}</p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Typische Klassen:</div>
                    <Badge variant="outline" className="text-sm">{entscheidung.klassen}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Klassenübersicht */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Klassenübersicht: A-Klassen vs. AR-Klassen
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* A-Klassen */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <CircleDot className="h-5 w-5 text-blue-600" />
                  A-Klassen (Böhme - EN 13892-3)
                </CardTitle>
                <CardDescription>
                  Volumenverlust in cm³/50cm² - <strong>Niedriger ist besser</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {aKlassen.map((klasse) => (
                    <div
                      key={klasse.klasse}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <div className="font-bold text-blue-900">{klasse.klasse}</div>
                        <div className="text-xs text-gray-600">{klasse.anwendung}</div>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {klasse.wert} cm³
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AR-Klassen */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2">
                  <CircleDot className="h-5 w-5 text-green-600" />
                  AR-Klassen (BCA - EN 13892-4)
                </CardTitle>
                <CardDescription>
                  Abrieb in µm - <strong>Niedriger ist besser</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {arKlassen.map((klasse) => (
                    <div
                      key={klasse.klasse}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div>
                        <div className="font-bold text-green-900">{klasse.klasse}</div>
                        <div className="text-xs text-gray-600">{klasse.anwendung}</div>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {klasse.wert} µm
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-8 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <AlertTitle className="text-yellow-900">Wichtig</AlertTitle>
            <AlertDescription className="text-gray-700 mt-2">
              A-Klassen und AR-Klassen sind <strong>nicht direkt vergleichbar</strong>, da sie auf
              unterschiedlichen Prüfverfahren basieren. Ein A15-Zementestrich ist nicht "besser" oder
              "schlechter" als ein AR2-Kunstharzestrich - sie erfüllen verschiedene Anforderungen.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Prüfverfahren erklärt */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Die Prüfverfahren im Detail
          </h2>

          <div className="space-y-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CircleDot className="h-5 w-5 text-blue-600 mr-2" />
                  Böhme-Verfahren (EN 13892-3)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Funktionsweise:</h4>
                  <p className="text-gray-700">
                    Auf der Prüffläche rotiert eine Scheibe mit eingelassenen Stahlkugeln.
                    Zwischen Prüffläche und Scheibe wird Korund-Schleifmittel (Körnung 60-80) eingebracht.
                    Nach definierten Umdrehungen wird der Volumenverlust gemessen.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Typische Werte:</h4>
                  <p className="text-gray-700">
                    <strong>Zementestrich CT:</strong> 12-15 cm³/50cm² (A15, A12)<br />
                    <strong>Calciumsulfatestrich CA:</strong> 15-22 cm³/50cm² (A22, A15)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Vorteile:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Etabliertes Verfahren für mineralische Estriche</li>
                    <li>Gute Reproduzierbarkeit</li>
                    <li>Moderate Kosten</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CircleDot className="h-5 w-5 text-green-600 mr-2" />
                  BCA-Verfahren (EN 13892-4)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Funktionsweise:</h4>
                  <p className="text-gray-700">
                    Ein rotierender Schleifkörper (nach Bredt-Costet-Agrawal) bewegt sich über die Prüffläche.
                    Der Abtrag wird präzise in Mikrometern (µm) gemessen. Besonders geeignet für harte,
                    homogene Oberflächen.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Typische Werte:</h4>
                  <p className="text-gray-700">
                    <strong>Kunstharzestrich SR:</strong> 0.5-4 µm (AR4, AR2, AR1, AR0.5)<br />
                    <strong>Hochwertige Beschichtungen:</strong> &lt;1 µm (AR0.5)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Vorteile:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Sehr präzise Messung</li>
                    <li>Ideal für harte Oberflächen (SR, MA)</li>
                    <li>Geringe Streuung der Ergebnisse</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 lg:px-8">
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
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
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
                    Alle Prüfverfahren im Überblick
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/welche-en-13892-pruefung">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Entscheidung</Badge>
                  <CardTitle className="text-lg">
                    Welche EN 13892 Prüfung?
                  </CardTitle>
                  <CardDescription>
                    Prüfauswahl-Hilfe nach Estrichtyp
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/zementestrich-en-13813-pruefpflichten">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">CT-Estrich</Badge>
                  <CardTitle className="text-lg">
                    Zementestrich Prüfpflichten
                  </CardTitle>
                  <CardDescription>
                    Alle Anforderungen für CT
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Scale className="h-12 w-12 mx-auto mb-4 text-orange-100" />
          <h2 className="text-3xl font-bold mb-4">
            Die richtige Verschleißprüfung automatisch auswählen
          </h2>
          <p className="text-lg text-orange-100 mb-8">
            EstrichManager wählt basierend auf Ihrem Estrichtyp automatisch die korrekte
            Verschleißprüfung (Böhme oder BCA) aus. Keine Fehler mehr bei der Prüfplanung.
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
            "headline": "Verschleißprüfung: Böhme vs. BCA - Der Vergleich",
            "description": "EN 13892-3 (Böhme) vs EN 13892-4 (BCA) im direkten Vergleich.",
            "author": { "@type": "Organization", "name": "EstrichManager" },
            "datePublished": "2025-01-14"
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.frage,
              "acceptedAnswer": { "@type": "Answer", "text": faq.antwort }
            }))
          })
        }}
      />
    </main>
  )
}
