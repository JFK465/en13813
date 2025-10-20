import { Metadata } from "next"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  FileText,
  FlaskConical,
  ArrowRight,
  Download,
  Clock,
  ChevronRight,
  Hammer,
  Shield,
  Gauge,
  CircleDot,
  Zap,
  TrendingUp,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "EN 13892 Prüfnormen für Estrich - Der komplette Leitfaden 2025",
  description: "Alle EN 13892 Prüfverfahren für Estrich im Überblick: Druckfestigkeit, Verschleiß, Haftzugfestigkeit. Normkonforme Prüfung nach EN 13892-1 bis -9 einfach erklärt.",
  keywords: [
    "EN 13892",
    "EN 13892 Prüfnormen",
    "Estrich Prüfverfahren",
    "EN 13892-2 Druckfestigkeit",
    "EN 13892-3 Verschleißprüfung",
    "EN 13892-8 Haftzugfestigkeit",
    "Estrich Prüfung nach Norm",
    "EN 13892-1 bis 9",
    "Estrichmörtel Prüfung"
  ],
  openGraph: {
    title: "EN 13892 Prüfnormen komplett erklärt - Estrich-Prüfverfahren",
    description: "Der ultimative Leitfaden zu allen EN 13892 Prüfnormen. Von Druckfestigkeit bis Verschleißprüfung - alles was Estrichwerke wissen müssen.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/en-13892-reihe",
  },
}

export default function EN13892PillarPage() {
  // Übersicht aller EN 13892 Normen
  const normenUebersicht = [
    {
      nummer: "EN 13892-1",
      titel: "Probenahme, Herstellung und Lagerung",
      icon: FlaskConical,
      beschreibung: "Grundlagen für die Herstellung und Lagerung von Prüfkörpern unter Normbedingungen",
      anwendung: "Basis für alle Prüfverfahren",
      pflicht: true,
      color: "border-blue-500",
      slug: "en-13892-1-probenahme"
    },
    {
      nummer: "EN 13892-2",
      titel: "Bestimmung der Biege- und Druckfestigkeit",
      icon: Hammer,
      beschreibung: "Prüfung der mechanischen Festigkeitseigenschaften nach 28 Tagen",
      anwendung: "Alle Estrichtypen (CT, CA, MA, SR, AS)",
      pflicht: true,
      color: "border-red-500",
      slug: "en-13892-2-festigkeit"
    },
    {
      nummer: "EN 13892-3",
      titel: "Verschleißwiderstand nach Böhme",
      icon: CircleDot,
      beschreibung: "Prüfung des Verschleißwiderstands mit dem Böhme-Verfahren",
      anwendung: "Nutzschicht ohne Bodenbelag (A-Klassen)",
      pflicht: false,
      color: "border-orange-500",
      slug: "verschleisspruefung-boehme-bca-vergleich"
    },
    {
      nummer: "EN 13892-4",
      titel: "Verschleißwiderstand nach BCA",
      icon: CircleDot,
      beschreibung: "Prüfung des Verschleißwiderstands mit dem BCA-Verfahren (Bredt-Costet-Agrawal)",
      anwendung: "Kunstharzestrich, hohe Belastungen (AR-Klassen)",
      pflicht: false,
      color: "border-orange-500",
      slug: "verschleisspruefung-boehme-bca-vergleich"
    },
    {
      nummer: "EN 13892-5",
      titel: "Verschleißwiderstand - Rollprüfung",
      icon: TrendingUp,
      beschreibung: "Prüfung der Verschleißbeständigkeit durch Rollbelastung",
      anwendung: "Industrieböden mit Stapler-Verkehr (RWA-Klassen)",
      pflicht: false,
      color: "border-yellow-500",
      slug: null
    },
    {
      nummer: "EN 13892-6",
      titel: "Oberflächenhärte",
      icon: Shield,
      beschreibung: "Bestimmung der Oberflächenhärte nach Shore oder Brinell",
      anwendung: "Magnesiaestrich (MA), Kunstharzestrich (SR)",
      pflicht: false,
      color: "border-purple-500",
      slug: "magnesiaestrich-en-13892-6-oberflaechenhaerte"
    },
    {
      nummer: "EN 13892-7",
      titel: "Schlagbohrverschleiß",
      icon: Zap,
      beschreibung: "Prüfung der Beständigkeit gegen Schlagverschleiß",
      anwendung: "Selten verwendet, spezielle Anforderungen",
      pflicht: false,
      color: "border-gray-400",
      slug: null
    },
    {
      nummer: "EN 13892-8",
      titel: "Haftzugfestigkeit",
      icon: Gauge,
      beschreibung: "Bestimmung der Haftzugfestigkeit zum Untergrund",
      anwendung: "Kunstharzestrich (SR), Verbundestriche",
      pflicht: false,
      color: "border-green-500",
      slug: "kunstharzestrich-en-13892-8-haftzugfestigkeit"
    },
    {
      nummer: "EN 13892-9",
      titel: "Dimensionsstabilität",
      icon: TrendingUp,
      beschreibung: "Prüfung der Verformung und des Schwindens",
      anwendung: "Großflächige Anwendungen, Heizestriche",
      pflicht: false,
      color: "border-indigo-500",
      slug: null
    }
  ]

  // Prüfpflichten je Estrichtyp
  const pruefpflichtenMatrix = [
    {
      bindemittel: "CT",
      name: "Zementestrich",
      pflichtPruefungen: ["EN 13892-1", "EN 13892-2"],
      optionalPruefungen: ["EN 13892-3", "EN 13892-4", "EN 13892-5", "EN 13892-9"],
      link: "zementestrich-en-13813-pruefpflichten"
    },
    {
      bindemittel: "CA",
      name: "Calciumsulfatestrich",
      pflichtPruefungen: ["EN 13892-1", "EN 13892-2"],
      optionalPruefungen: ["EN 13892-3", "EN 13892-9"],
      link: "calciumsulfat-fliessestrich-pruefnormen"
    },
    {
      bindemittel: "MA",
      name: "Magnesiaestrich",
      pflichtPruefungen: ["EN 13892-1", "EN 13892-2", "EN 13892-6"],
      optionalPruefungen: ["EN 13892-3", "EN 13892-4"],
      link: "magnesiaestrich-en-13892-6-oberflaechenhaerte"
    },
    {
      bindemittel: "SR",
      name: "Kunstharzestrich",
      pflichtPruefungen: ["EN 13892-1", "EN 13892-2", "EN 13892-8"],
      optionalPruefungen: ["EN 13892-4", "EN 13892-6"],
      link: "kunstharzestrich-en-13892-8-haftzugfestigkeit"
    },
    {
      bindemittel: "AS",
      name: "Gussasphalt",
      pflichtPruefungen: ["EN 13892-1"],
      optionalPruefungen: ["EN 13892-5"],
      link: "gussasphaltestrich-en-12697-20-stempeleindringversuch"
    }
  ]

  // Häufige Fragen
  const faqs = [
    {
      frage: "Welche EN 13892 Prüfung ist bei meinem Estrich Pflicht?",
      antwort: "Für alle Estrichtypen sind EN 13892-1 (Probenahme) und EN 13892-2 (Festigkeit) verpflichtend. Zusätzliche Prüfungen hängen vom Bindemitteltyp und der Anwendung ab: Magnesiaestrich (MA) benötigt EN 13892-6 (Oberflächenhärte), Kunstharzestrich (SR) benötigt EN 13892-8 (Haftzugfestigkeit). Bei Nutzschicht ohne Bodenbelag ist eine Verschleißprüfung erforderlich."
    },
    {
      frage: "Was ist der Unterschied zwischen EN 13892-3 und EN 13892-4?",
      antwort: "Beide Normen prüfen den Verschleißwiderstand, aber mit unterschiedlichen Verfahren: EN 13892-3 (Böhme-Verfahren) wird für normale Estriche verwendet und liefert A-Klassen (z.B. A22, A15). EN 13892-4 (BCA-Verfahren) wird hauptsächlich für Kunstharzestriche verwendet und liefert AR-Klassen (z.B. AR6, AR2). Die Wahl hängt vom Estrichtyp und der erwarteten Belastung ab."
    },
    {
      frage: "Wie lange dauert eine komplette EN 13892 Prüfung?",
      antwort: "Die Mindestdauer beträgt 28 Tage für die Festigkeitsprüfung nach EN 13892-2. Dazu kommen 1-2 Tage für die Probenvorbereitung und je nach Umfang 2-5 Tage für zusätzliche Prüfungen (Verschleiß, Härte, Haftzug). Insgesamt sollten Sie mit 30-35 Tagen rechnen."
    },
    {
      frage: "Muss ich für jede Rezeptur alle EN 13892 Prüfungen durchführen?",
      antwort: "Nein. Für die Erstprüfung (ITT) müssen Sie nur die Prüfungen durchführen, die für Ihren Estrichtyp und die deklarierten Eigenschaften relevant sind. Bei der werkseigenen Produktionskontrolle (FPC) können die Prüfhäufigkeiten reduziert werden."
    },
    {
      frage: "Wo finde ich akkreditierte Prüflabore für EN 13892?",
      antwort: "Suchen Sie nach Prüflaboren mit DAkkS-Akkreditierung (Deutsche Akkreditierungsstelle) für die EN 13892-Reihe. Diese Labore sind berechtigt, normkonforme Prüfungen durchzuführen. Viele Materialprüfanstalten (MPA) und Technische Überwachungsvereine (TÜV) bieten diese Prüfungen an."
    }
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb für SEO */}
      <nav className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li><Link href="/wissen" className="text-gray-500 hover:text-gray-700">Wissen</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">EN 13892 Prüfnormen</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-blue-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
              Prüfnormen
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              15 Min Lesezeit
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            EN 13892 Prüfnormen für Estrich: Der komplette Leitfaden
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Die EN 13892-Reihe umfasst alle Prüfverfahren für Estrichmörtel nach EN 13813.
            Von der Probenahme über Festigkeitsprüfungen bis zu Verschleiß und Haftzugfestigkeit –
            dieser Guide erklärt alle 9 Normen verständlich und praxisnah.
          </p>
        </div>
      </section>

      {/* TL;DR Box */}
      <section className="px-6 py-8 lg:px-8 bg-blue-50 border-b border-blue-100">
        <div className="mx-auto max-w-4xl">
          <Alert className="bg-white border-blue-200">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-lg font-semibold text-blue-900">
              Das Wichtigste in Kürze
            </AlertTitle>
            <AlertDescription className="mt-3 text-gray-700 space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>EN 13892-1 & -2 sind Pflicht</strong> für alle Estrichtypen (Probenahme + Festigkeit)</li>
                <li><strong>EN 13892-3 bis -9 sind situativ erforderlich</strong> je nach Estrichtyp und Anwendung</li>
                <li><strong>Magnesiaestrich (MA)</strong> benötigt zusätzlich EN 13892-6 (Oberflächenhärte)</li>
                <li><strong>Kunstharzestrich (SR)</strong> benötigt zusätzlich EN 13892-8 (Haftzugfestigkeit)</li>
                <li><strong>Verschleißprüfungen</strong> (EN 13892-3/4/5) nur bei Nutzschicht ohne Bodenbelag</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Übersicht aller EN 13892 Normen */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Alle EN 13892 Prüfnormen im Überblick
            </h2>
            <p className="text-lg text-gray-600">
              Die EN 13892-Reihe besteht aus 9 Teilnormen, die alle Prüfverfahren für Estrichmörtel
              nach EN 13813 definieren. Hier finden Sie eine detaillierte Übersicht.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {normenUebersicht.map((norm) => {
              const Icon = norm.icon
              return (
                <Card
                  key={norm.nummer}
                  className={`hover:shadow-lg transition-all duration-200 border-l-4 ${norm.color} ${
                    norm.slug ? 'cursor-pointer' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 rounded-lg bg-gray-100">
                        <Icon className="h-6 w-6 text-gray-700" />
                      </div>
                      {norm.pflicht && (
                        <Badge variant="destructive" className="text-xs">
                          Pflicht
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mb-2">
                      {norm.nummer}
                    </CardTitle>
                    <CardDescription className="font-medium text-gray-900 text-base mb-3">
                      {norm.titel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {norm.beschreibung}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          <strong>Anwendung:</strong> {norm.anwendung}
                        </span>
                      </div>
                    </div>
                    {norm.slug && (
                      <Link href={`/wissen/${norm.slug}`}>
                        <Button variant="link" className="mt-4 p-0 h-auto text-blue-600">
                          Mehr erfahren
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Prüfpflichten-Matrix nach Estrichtyp */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welche Prüfungen sind für Ihren Estrichtyp erforderlich?
            </h2>
            <p className="text-lg text-gray-600">
              Je nach Bindemitteltyp gelten unterschiedliche Prüfpflichten. Diese Tabelle zeigt Ihnen,
              welche EN 13892 Normen für Ihren Estrich relevant sind.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pruefpflichtenMatrix.map((estrich) => (
              <Card key={estrich.bindemittel} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="text-base px-3 py-1 bg-blue-600">
                      {estrich.bindemittel}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {estrich.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Pflichtprüfungen
                    </h4>
                    <ul className="space-y-2">
                      {estrich.pflichtPruefungen.map((pruefung) => (
                        <li key={pruefung} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          {pruefung}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                      Optional (situativ)
                    </h4>
                    <ul className="space-y-2">
                      {estrich.optionalPruefungen.map((pruefung) => (
                        <li key={pruefung} className="text-sm text-gray-600 flex items-start">
                          <span className="text-orange-600 mr-2">○</span>
                          {pruefung}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={`/wissen/${estrich.link}`}>
                    <Button variant="outline" className="w-full">
                      Details zu {estrich.bindemittel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-900">Wichtiger Hinweis</AlertTitle>
              <AlertDescription className="text-gray-700 mt-2">
                Die optionalen Prüfungen werden erforderlich, wenn entsprechende Eigenschaften deklariert werden
                oder wenn der Estrich als Nutzschicht ohne Bodenbelag verwendet wird.
                <Link href="/wissen/welche-en-13892-pruefung" className="text-blue-600 hover:underline ml-1">
                  Mehr zur Prüfauswahl →
                </Link>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Praxistipps */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Praxistipps für normkonforme Prüfungen
          </h2>

          <div className="space-y-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  1. Normklima einhalten
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <p className="mb-3">
                  Alle Prüfungen müssen bei <strong>23±2°C und 50±5% relativer Luftfeuchte</strong> durchgeführt werden.
                  Abweichungen vom Normklima verfälschen die Ergebnisse erheblich.
                </p>
                <Link href="/wissen/normklima-23-grad-estrich-pruefung" className="text-blue-600 hover:underline">
                  Warum ist Normklima so wichtig? →
                </Link>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  2. Prüfalter beachten
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <p className="mb-3">
                  Die Festigkeitsprüfung nach EN 13892-2 erfolgt standardmäßig nach <strong>28 Tagen</strong>.
                  Frühere Prüfungen sind möglich, aber die 28-Tage-Festigkeit ist normativ.
                </p>
                <Link href="/wissen/prueffalter-28-tage-en-13892-2" className="text-blue-600 hover:underline">
                  28 Tage Prüfalter erklärt →
                </Link>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FlaskConical className="h-5 w-5 text-orange-600 mr-2" />
                  3. Probenahme nach EN 13892-1
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <p>
                  Die korrekte Probenahme ist entscheidend für aussagekräftige Ergebnisse.
                  Prüfkörper müssen repräsentativ sein und unter kontrollierten Bedingungen hergestellt werden.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 text-purple-600 mr-2" />
                  4. Dokumentation sicherstellen
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                <p className="mb-3">
                  Dokumentieren Sie alle Prüfbedingungen, Abweichungen und Messwerte lückenlos.
                  Dies ist für die Konformitätsbewertung nach EN 13813 unerlässlich.
                </p>
                <Alert className="mt-4 bg-purple-50 border-purple-200">
                  <AlertDescription className="text-sm">
                    <strong>Software-Tipp:</strong> EstrichManager dokumentiert alle EN 13892 Prüfungen
                    automatisch normkonform und generiert ITT-Berichte auf Knopfdruck.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Häufig gestellte Fragen zu EN 13892
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

          <div className="mt-8 text-center">
            <Link href="/wissen/glossar">
              <Button variant="outline" size="lg">
                Mehr Fragen im Glossar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Verwandte Artikel */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Verwandte Artikel
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/wissen/welche-en-13892-pruefung">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Problem-Lösung</Badge>
                  <CardTitle className="text-lg">
                    Welche EN 13892 Prüfung brauche ich?
                  </CardTitle>
                  <CardDescription>
                    Entscheidungshilfe für die richtige Prüfauswahl je nach Estrichtyp und Anwendung
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
                    Wie oft muss Estrich geprüft werden? ITT vs. FPC erklärt
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
                    EN 13892-3 oder EN 13892-4? Die Unterschiede im Detail
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/en-13813">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Hauptnorm</Badge>
                  <CardTitle className="text-lg">
                    EN 13813 komplett erklärt
                  </CardTitle>
                  <CardDescription>
                    Die europäische Estrichnorm im Überblick
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/itt-management">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Erstprüfung</Badge>
                  <CardTitle className="text-lg">
                    ITT Management nach EN 13813
                  </CardTitle>
                  <CardDescription>
                    Erstprüfungen (Initial Type Testing) planen und dokumentieren
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/fpc-dokumentation">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">FPC</Badge>
                  <CardTitle className="text-lg">
                    Werkseigene Produktionskontrolle
                  </CardTitle>
                  <CardDescription>
                    FPC normkonform dokumentieren und organisieren
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <FlaskConical className="h-12 w-12 mx-auto mb-4 text-blue-100" />
          <h2 className="text-3xl font-bold mb-4">
            EN 13892 Prüfungen automatisch dokumentieren
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            EstrichManager erstellt normkonforme Prüfpläne nach EN 13892, dokumentiert alle Ergebnisse
            und generiert ITT-Berichte automatisch. Sparen Sie 80% Zeit bei der Prüfdokumentation.
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

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "EN 13892 Prüfnormen für Estrich - Der komplette Leitfaden",
            "description": "Alle EN 13892 Prüfverfahren für Estrich im Überblick: Druckfestigkeit, Verschleiß, Haftzugfestigkeit. Normkonforme Prüfung nach EN 13892-1 bis -9 einfach erklärt.",
            "author": {
              "@type": "Organization",
              "name": "EstrichManager"
            },
            "publisher": {
              "@type": "Organization",
              "name": "EstrichManager",
              "logo": {
                "@type": "ImageObject",
                "url": "https://estrichmanager.de/logo.png"
              }
            },
            "datePublished": "2025-01-14",
            "dateModified": "2025-01-14",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://estrichmanager.de/wissen/en-13892-reihe"
            },
            "about": {
              "@type": "Thing",
              "name": "EN 13892 Prüfnormen",
              "description": "Europäische Prüfnormen für Estrichmörtel"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://estrichmanager.de"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Wissen",
                  "item": "https://estrichmanager.de/wissen"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "EN 13892 Prüfnormen",
                  "item": "https://estrichmanager.de/wissen/en-13892-reihe"
                }
              ]
            }
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
