import { Metadata } from "next"
import Link from "next/link"
import {
  CheckCircle,
  X,
  ArrowRight,
  ChevronRight,
  Hammer,
  AlertCircle,
  Info,
  ListChecks
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Zementestrich EN 13813 - Prüfpflichten für CT-Estrich | Guide 2025",
  description: "Alle Prüfpflichten für Zementestrich nach EN 13813. CT-C30-F5 Bezeichnung, EN 13892-2 Festigkeit, Verschleißprüfung und mehr. Kompletter Prüfplan für CT-Estrich.",
  keywords: [
    "Zementestrich Prüfpflichten",
    "CT-Estrich EN 13813",
    "Zementestrich Prüfung",
    "CT-C30-F5",
    "EN 13892-2 Zementestrich",
    "Zementestrich Bezeichnung",
    "CT Estrich Normen"
  ],
  openGraph: {
    title: "Zementestrich nach EN 13813: Prüfpflichten und Normen (CT-C30-F5)",
    description: "Kompletter Guide zu allen Prüfpflichten für Zementestrich. Von der Bezeichnung bis zur Verschleißprüfung.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/zementestrich-en-13813-pruefpflichten",
  },
}

export default function ZementestrichPruefpflichtenPage() {
  // Prüfpflichten Übersicht
  const pruefpflichten = [
    {
      eigenschaft: "Druckfestigkeit",
      norm: "EN 13892-2",
      pflicht: true,
      klassen: ["C12", "C20", "C25", "C30", "C35", "C40", "C50"],
      typisch: "C25-C40",
      info: "Kernmerkmal, immer erforderlich"
    },
    {
      eigenschaft: "Biegezugfestigkeit",
      norm: "EN 13892-2",
      pflicht: true,
      klassen: ["F3", "F4", "F5", "F7", "F10"],
      typisch: "F4-F7",
      info: "Kernmerkmal, immer erforderlich"
    },
    {
      eigenschaft: "Verschleiß Böhme",
      norm: "EN 13892-3",
      pflicht: false,
      klassen: ["A22", "A15", "A12", "A9", "A6"],
      typisch: "A15-A12",
      info: "Nur bei Nutzschicht ohne Bodenbelag"
    },
    {
      eigenschaft: "Brandverhalten",
      norm: "EN 13501-1",
      pflicht: true,
      klassen: ["A1fl"],
      typisch: "A1fl",
      info: "Ohne Prüfung deklarierbar (nicht brennbar)"
    },
    {
      eigenschaft: "Dimensionsstabilität",
      norm: "EN 13892-9",
      pflicht: false,
      klassen: ["-"],
      typisch: "-",
      info: "Optional bei großen Flächen"
    }
  ]

  // Typische Rezepturen
  const typischeRezepturen = [
    {
      anwendung: "Wohnbereich mit Bodenbelag",
      bezeichnung: "CT-C20-F4",
      druckfestigkeit: "≥ 20 N/mm²",
      biegezug: "≥ 4 N/mm²",
      verschleiss: "Nicht erforderlich",
      empfehlung: "Standard-Rezeptur für Wohngebäude"
    },
    {
      anwendung: "Gewerbe/Büro mit Bodenbelag",
      bezeichnung: "CT-C25-F5",
      druckfestigkeit: "≥ 25 N/mm²",
      biegezug: "≥ 5 N/mm²",
      verschleiss: "Nicht erforderlich",
      empfehlung: "Häufigste Rezeptur für gewerbliche Nutzung"
    },
    {
      anwendung: "Sichtestrich Wohnen",
      bezeichnung: "CT-C30-F5-A15",
      druckfestigkeit: "≥ 30 N/mm²",
      biegezug: "≥ 5 N/mm²",
      verschleiss: "≤ 15 cm³/50cm²",
      empfehlung: "Mit Verschleißprüfung, da Nutzschicht"
    },
    {
      anwendung: "Industrieboden ohne Belag",
      bezeichnung: "CT-C40-F7-A12",
      druckfestigkeit: "≥ 40 N/mm²",
      biegezug: "≥ 7 N/mm²",
      verschleiss: "≤ 12 cm³/50cm²",
      empfehlung: "Hochbelastbar mit guter Verschleißfestigkeit"
    }
  ]

  // Prüfplan
  const pruefplan = {
    itt: [
      { eigenschaft: "Probenahme & Lagerung", norm: "EN 13892-1", anzahl: "-", alter: "28 Tage Normklima" },
      { eigenschaft: "Druckfestigkeit", norm: "EN 13892-2", anzahl: "6 Prüfkörper", alter: "28 Tage" },
      { eigenschaft: "Biegezugfestigkeit", norm: "EN 13892-2", anzahl: "6 Prüfkörper", alter: "28 Tage" },
      { eigenschaft: "Verschleiß (falls Nutzschicht)", norm: "EN 13892-3", anzahl: "3 Prüfkörper", alter: "28 Tage" }
    ],
    fpc: [
      { eigenschaft: "Druckfestigkeit", haeufigkeit: "2x/Monat oder alle 50t", grund: "Kritische Eigenschaft" },
      { eigenschaft: "Biegezugfestigkeit", haeufigkeit: "1x/Monat oder alle 100t", grund: "Qualitätssicherung" },
      { eigenschaft: "Verschleiß", haeufigkeit: "1-2x/Jahr", grund: "Langzeitstabilität" }
    ]
  }

  // FAQs
  const faqs = [
    {
      frage: "Was bedeutet die Bezeichnung CT-C25-F4?",
      antwort: "CT = Cement screed (Zementestrich), C25 = Druckfestigkeit mindestens 25 N/mm², F4 = Biegezugfestigkeit mindestens 4 N/mm². Dies ist die normkonforme Kurzbezeichnung nach EN 13813."
    },
    {
      frage: "Brauche ich bei Zementestrich immer eine Verschleißprüfung?",
      antwort: "Nein. Nur wenn der Zementestrich als Nutzschicht ohne zusätzlichen Bodenbelag (Fliesen, Parkett, etc.) verwendet wird. Bei Fliesen oder anderen Belägen auf dem Estrich ist keine Verschleißprüfung erforderlich."
    },
    {
      frage: "Welche Druckfestigkeitsklasse ist für Wohnräume ausreichend?",
      antwort: "Für normale Wohnräume reicht C20 aus. In der Praxis werden aber meist C25 oder C30 verwendet, da diese Festigkeiten mit üblichen Zementestrich-Rezepturen problemlos erreicht werden und mehr Sicherheit bieten."
    },
    {
      frage: "Muss ich Zementestrich auf Brandverhalten prüfen lassen?",
      antwort: "Nein. Zementestrich ist rein mineralisch und nicht brennbar. Sie können A1fl ohne Prüfung in der Leistungserklärung deklarieren. Der Nachweis erfolgt über die Rezepturzusammensetzung."
    },
    {
      frage: "Wie lange muss ich warten, bis ich prüfen kann?",
      antwort: "Die normative Prüfung nach EN 13892-2 erfolgt nach 28 Tagen Lagerung bei Normklima (23°C, 50% r.F.). Frühere Prüfungen sind möglich, aber die 28-Tage-Festigkeit ist für die Klassifizierung maßgeblich."
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
            <li><Link href="/wissen/estrich-arten" className="text-gray-500 hover:text-gray-700">Estricharten</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">Zementestrich CT</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-blue-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              <Hammer className="mr-1.5 h-3.5 w-3.5" />
              Zementestrich (CT)
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Zementestrich nach EN 13813: Prüfpflichten und Normen (CT-C30-F5)
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Zementestrich (CT) ist der am häufigsten verwendete Estrichtyp in Deutschland.
            Dieser Guide zeigt Ihnen alle Prüfpflichten nach EN 13813, typische Festigkeitsklassen
            und wie Sie die normkonforme Bezeichnung richtig aufbauen.
          </p>
        </div>
      </section>

      {/* TL;DR */}
      <section className="px-6 py-8 lg:px-8 bg-blue-50 border-b border-blue-100">
        <div className="mx-auto max-w-4xl">
          <Alert className="bg-white border-blue-200">
            <ListChecks className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-lg font-semibold text-blue-900">
              Das Wichtigste in Kürze
            </AlertTitle>
            <AlertDescription className="mt-3 text-gray-700 space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Pflichtprüfungen:</strong> EN 13892-1 (Probenahme) + EN 13892-2 (Festigkeit)</li>
                <li><strong>Typische Klassen:</strong> CT-C25-F4 bis CT-C40-F7</li>
                <li><strong>Verschleißprüfung:</strong> Nur bei Nutzschicht ohne Bodenbelag (EN 13892-3 Böhme)</li>
                <li><strong>Brandverhalten:</strong> A1fl ohne Prüfung (rein mineralisch)</li>
                <li><strong>Prüfalter:</strong> 28 Tage bei 23°C und 50% r.F.</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Prüfpflichten Tabelle */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Prüfpflichten für Zementestrich im Überblick
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Eigenschaft</th>
                  <th className="px-4 py-3 text-left">Prüfnorm</th>
                  <th className="px-4 py-3 text-center">Pflicht</th>
                  <th className="px-4 py-3 text-left">Klassen</th>
                  <th className="px-4 py-3 text-left">Typisch</th>
                  <th className="px-4 py-3 text-left">Info</th>
                </tr>
              </thead>
              <tbody>
                {pruefpflichten.map((pruef, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-3 font-medium">{pruef.eigenschaft}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{pruef.norm}</td>
                    <td className="px-4 py-3 text-center">
                      {pruef.pflicht ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {pruef.klassen.map((klasse) => (
                          <Badge key={klasse} variant="outline" className="text-xs">
                            {klasse}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-blue-600">{pruef.typisch}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{pruef.info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Typische Rezepturen */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Typische Zementestrich-Rezepturen nach Anwendung
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {typischeRezepturen.map((rezept, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <CardTitle className="text-lg">{rezept.anwendung}</CardTitle>
                  <div className="mt-2">
                    <Badge className="text-lg px-4 py-1.5 bg-blue-600">
                      {rezept.bezeichnung}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        Druckfestigkeit
                      </div>
                      <div className="text-sm font-medium">{rezept.druckfestigkeit}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        Biegezugfestigkeit
                      </div>
                      <div className="text-sm font-medium">{rezept.biegezug}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Verschleißprüfung
                    </div>
                    <div className="text-sm font-medium">{rezept.verschleiss}</div>
                  </div>
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-xs">
                      {rezept.empfehlung}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prüfplan */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Prüfplan für Zementestrich
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* ITT */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Erstprüfung (ITT)
                </CardTitle>
                <CardDescription>
                  Einmalig bei neuer Rezeptur - vor Markteinführung
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {pruefplan.itt.map((pruef, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-green-900">{pruef.eigenschaft}</div>
                        <Badge variant="outline" className="text-xs">{pruef.norm}</Badge>
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong>Anzahl:</strong> {pruef.anzahl}<br />
                        <strong>Prüfalter:</strong> {pruef.alter}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FPC */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Produktionskontrolle (FPC)
                </CardTitle>
                <CardDescription>
                  Laufend während der Produktion
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {pruefplan.fpc.map((pruef, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg">
                      <div className="font-medium text-blue-900 mb-2">{pruef.eigenschaft}</div>
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Häufigkeit:</strong> {pruef.haeufigkeit}
                      </div>
                      <div className="text-xs text-gray-600">
                        <Info className="h-3.5 w-3.5 inline mr-1" />
                        {pruef.grund}
                      </div>
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
              Die FPC-Häufigkeiten können nach einer Bewährungsphase reduziert werden.
              Dokumentieren Sie alle Prüfungen lückenlos - bei Audits werden diese kontrolliert.
              <Link href="/wissen/pruefhaeufigkeiten-en-13813" className="text-yellow-700 hover:underline ml-1">
                Mehr zu Prüfhäufigkeiten →
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
            <Link href="/wissen/en-13892-2-zementestrich-festigkeit">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">CT Detail</Badge>
                  <CardTitle className="text-lg">
                    EN 13892-2 für Zementestrich
                  </CardTitle>
                  <CardDescription>
                    Festigkeitsprüfung Schritt-für-Schritt
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/welche-en-13892-pruefung">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Prüfauswahl</Badge>
                  <CardTitle className="text-lg">
                    Welche EN 13892 Prüfung?
                  </CardTitle>
                  <CardDescription>
                    Entscheidungshilfe für alle Estrichtypen
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/verschleisspruefung-boehme-bca-vergleich">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Verschleiß</Badge>
                  <CardTitle className="text-lg">
                    Böhme Verschleißprüfung
                  </CardTitle>
                  <CardDescription>
                    EN 13892-3 für Zementestrich
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Hammer className="h-12 w-12 mx-auto mb-4 text-blue-100" />
          <h2 className="text-3xl font-bold mb-4">
            Zementestrich-Rezepturen automatisch prüfen
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            EstrichManager validiert Ihre CT-Rezepturen automatisch gegen EN 13813,
            erstellt Prüfpläne und generiert normkonforme Leistungserklärungen.
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
            "headline": "Zementestrich nach EN 13813: Prüfpflichten und Normen",
            "description": "Alle Prüfpflichten für Zementestrich (CT) nach EN 13813 mit typischen Festigkeitsklassen.",
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
