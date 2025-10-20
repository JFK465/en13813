import { Metadata } from "next"
import Link from "next/link"
import {
  CheckCircle,
  Flame,
  ArrowRight,
  ChevronRight,
  Shield,
  AlertTriangle,
  Info
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "EN 13501-1 Brandverhalten Estrich - A1fl bis Efl erklärt | 2025",
  description: "EN 13501-1 Brandklassifizierung für Estrich komplett erklärt. A1fl, A2fl bis Efl Klassen, Prüfung und Anforderungen. Welche Brandklasse braucht mein Estrich?",
  keywords: [
    "EN 13501-1",
    "Brandverhalten Estrich",
    "Brandklasse A1fl",
    "A2fl Estrich",
    "Brandschutz Estrich",
    "Feuerwiderstand Estrich",
    "EN 13501-1 Klassifizierung"
  ],
  openGraph: {
    title: "EN 13501-1: Brandverhalten von Estrichen - Klassifizierung erklärt",
    description: "Alles zu EN 13501-1 Brandklassen für Estrich: Von A1fl (nicht brennbar) bis Efl. Mit Prüfanforderungen und Praxistipps.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/en-13501-1-brandverhalten-estrich",
  },
}

export default function EN13501BrandverhaltenPage() {
  // Brandklassen Übersicht
  const brandklassen = [
    {
      klasse: "A1fl",
      bezeichnung: "Nicht brennbar",
      beschreibung: "Kein Beitrag zum Brand, keine Rauchentwicklung",
      typisch: ["Zementestrich (CT)", "Calciumsulfatestrich (CA)", "Magnesiaestrich (MA)", "Gussasphalt (AS)"],
      pruefung: "Keine Prüfung erforderlich",
      color: "bg-green-50 border-green-500",
      emoji: "✅"
    },
    {
      klasse: "A2fl-s1",
      bezeichnung: "Kaum brennbar",
      beschreibung: "Sehr geringer Beitrag zum Brand, kaum Rauch",
      typisch: ["Modifizierte Kunstharzestriche", "Mineralische Estriche mit Zusätzen"],
      pruefung: "EN ISO 1716 + EN 13823 erforderlich",
      color: "bg-blue-50 border-blue-500",
      emoji: "🟢"
    },
    {
      klasse: "Bfl-s1",
      bezeichnung: "Schwer entflammbar",
      beschreibung: "Begrenzter Beitrag zum Brand",
      typisch: ["Einige Kunstharzestriche (SR)"],
      pruefung: "EN 13823 + EN ISO 11925-2",
      color: "bg-yellow-50 border-yellow-500",
      emoji: "🟡"
    },
    {
      klasse: "Cfl-s1",
      bezeichnung: "Normal entflammbar",
      beschreibung: "Mittlerer Beitrag zum Brand",
      typisch: ["Standard Kunstharzestriche"],
      pruefung: "EN 13823 + EN ISO 11925-2",
      color: "bg-orange-50 border-orange-500",
      emoji: "🟠"
    },
    {
      klasse: "Dfl / Efl",
      bezeichnung: "Leicht entflammbar",
      beschreibung: "Erheblicher Beitrag zum Brand",
      typisch: ["Selten bei Estrichen"],
      pruefung: "EN ISO 11925-2",
      color: "bg-red-50 border-red-500",
      emoji: "🔴"
    }
  ]

  // Rauchklassen
  const rauchklassen = [
    { klasse: "s1", bedeutung: "Kaum Rauch", beschreibung: "Sehr geringe Rauchentwicklung" },
    { klasse: "s2", bedeutung: "Mäßig Rauch", beschreibung: "Mittlere Rauchentwicklung" },
    { klasse: "s3", bedeutung: "Starker Rauch", beschreibung: "Hohe Rauchentwicklung" }
  ]

  // Brennendes Abtropfen
  const abtropfklassen = [
    { klasse: "d0", bedeutung: "Kein Abtropfen", beschreibung: "Keine brennenden Tropfen/Teile" },
    { klasse: "d1", bedeutung: "Geringes Abtropfen", beschreibung: "Begrenzt brennende Tropfen" },
    { klasse: "d2", bedeutung: "Starkes Abtropfen", beschreibung: "Erheblich brennende Tropfen" }
  ]

  // Estrichtyp-Matrix
  const estrichBrandklassen = [
    {
      typ: "CT",
      name: "Zementestrich",
      standardKlasse: "A1fl",
      grund: "Rein mineralisch, nicht brennbar",
      pruefungErforderlich: false
    },
    {
      typ: "CA",
      name: "Calciumsulfatestrich",
      standardKlasse: "A1fl",
      grund: "Rein mineralisch, nicht brennbar",
      pruefungErforderlich: false
    },
    {
      typ: "MA",
      name: "Magnesiaestrich",
      standardKlasse: "A1fl",
      grund: "Rein mineralisch, nicht brennbar",
      pruefungErforderlich: false
    },
    {
      typ: "AS",
      name: "Gussasphaltestrich",
      standardKlasse: "A1fl oder A2fl",
      grund: "Je nach Bitumenanteil",
      pruefungErforderlich: true
    },
    {
      typ: "SR",
      name: "Kunstharzestrich",
      standardKlasse: "Bfl-s1 bis Cfl-s1",
      grund: "Organisches Bindemittel, brennbar",
      pruefungErforderlich: true
    }
  ]

  // FAQs
  const faqs = [
    {
      frage: "Muss ich mein Zementestrich-Rezept auf Brandverhalten prüfen lassen?",
      antwort: "Nein. Rein mineralische Estriche wie Zementestrich (CT), Calciumsulfatestrich (CA) und Magnesiaestrich (MA) werden automatisch als A1fl klassifiziert, da sie nicht brennbar sind. Eine Prüfung nach EN 13501-1 ist nicht erforderlich, Sie können A1fl direkt in der DoP deklarieren."
    },
    {
      frage: "Was bedeutet 'fl' in A1fl?",
      antwort: "Das 'fl' steht für 'floor' (Bodenbelag). EN 13501-1 unterscheidet zwischen Bauprodukten (ohne Suffix) und Bodenbelägen (mit 'fl'). Estrich wird als Bodenbelag klassifiziert, daher A1fl, A2fl, Bfl usw."
    },
    {
      frage: "Welche Brandklasse brauche ich für Wohngebäude?",
      antwort: "In Deutschland gibt es keine einheitliche Mindestanforderung für Estriche in Wohngebäuden. Mineralische Estriche (A1fl) erfüllen alle Anforderungen. Bei Kunstharzestrichen sollten Sie die Landesbauordnung Ihres Bundeslandes prüfen - meist wird mindestens Bfl-s1 gefordert."
    },
    {
      frage: "Was ist der Unterschied zwischen A1 und A1fl?",
      antwort: "A1 ist die Klassifizierung für allgemeine Bauprodukte nach EN 13501-1. A1fl ist die spezifische Klassifizierung für Bodenbeläge (floor). Inhaltlich sind beide 'nicht brennbar', aber Estrich wird immer als A1fl klassifiziert, nie als A1."
    },
    {
      frage: "Wie weise ich A1fl nach ohne Prüfung?",
      antwort: "Bei rein mineralischen Estrichen (CT, CA, MA) genügt die Rezepturangabe in der DoP. Wenn alle Bestandteile anorganisch sind, ist keine separate Brandprüfung erforderlich. Dokumentieren Sie die Zusammensetzung und deklarieren Sie A1fl in der Leistungserklärung."
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
            <li><Link href="/wissen/en-13813" className="text-gray-500 hover:text-gray-700">EN 13813</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">EN 13501-1 Brandverhalten</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-red-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
              <Flame className="mr-1.5 h-3.5 w-3.5" />
              Brandschutz
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            EN 13501-1: Brandverhalten von Estrichen - Klassifizierung erklärt
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            EN 13501-1 regelt die Klassifizierung des Brandverhaltens von Bauprodukten.
            Für Estrich sind vor allem die Klassen A1fl (nicht brennbar) bis Efl relevant.
            Dieser Guide erklärt alle Brandklassen und wann welche Prüfung erforderlich ist.
          </p>
        </div>
      </section>

      {/* TL;DR */}
      <section className="px-6 py-8 lg:px-8 bg-red-50 border-b border-red-100">
        <div className="mx-auto max-w-4xl">
          <Alert className="bg-white border-red-200">
            <Shield className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-lg font-semibold text-red-900">
              Das Wichtigste in Kürze
            </AlertTitle>
            <AlertDescription className="mt-3 text-gray-700 space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>Mineralische Estriche (CT, CA, MA):</strong> Automatisch A1fl - keine Prüfung nötig</li>
                <li><strong>Kunstharzestriche (SR):</strong> Meist Bfl-s1 bis Cfl-s1 - Prüfung erforderlich</li>
                <li><strong>'fl' steht für floor</strong> (Bodenbelag) - Estrich wird immer mit fl klassifiziert</li>
                <li><strong>A1fl = nicht brennbar:</strong> Beste Brandklasse, kein Beitrag zum Brand</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Brandklassen Übersicht */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Brandklassen nach EN 13501-1 für Bodenbeläge
          </h2>

          <div className="space-y-4">
            {brandklassen.map((klasse) => (
              <Card key={klasse.klasse} className={`border-l-4 ${klasse.color}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="text-lg px-4 py-1.5 bg-gray-900">
                          {klasse.klasse}
                        </Badge>
                        <span className="text-2xl">{klasse.emoji}</span>
                      </div>
                      <CardTitle className="text-xl mb-2">{klasse.bezeichnung}</CardTitle>
                      <CardDescription className="text-base">
                        {klasse.beschreibung}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                      Typische Estriche:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {klasse.typisch.map((typ) => (
                        <Badge key={typ} variant="outline">
                          {typ}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Prüfanforderung:</strong> {klasse.pruefung}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Zusatzklassifizierungen */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Zusatzklassifizierungen: Rauch & Abtropfen
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Rauchklassen */}
            <Card>
              <CardHeader className="bg-gray-900 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Rauchentwicklung (s)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {rauchklassen.map((rauch) => (
                    <div key={rauch.klasse} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="text-base">{rauch.klasse}</Badge>
                        <span className="font-semibold text-gray-900">{rauch.bedeutung}</span>
                      </div>
                      <p className="text-sm text-gray-600">{rauch.beschreibung}</p>
                    </div>
                  ))}
                </div>
                <Alert className="mt-6 bg-blue-50 border-blue-200">
                  <AlertDescription className="text-sm">
                    Bei Estrichen ist <strong>s1</strong> (kaum Rauch) die übliche und empfohlene Klasse.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Abtropfklassen */}
            <Card>
              <CardHeader className="bg-gray-900 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Brennendes Abtropfen (d)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {abtropfklassen.map((abtropf) => (
                    <div key={abtropf.klasse} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="text-base">{abtropf.klasse}</Badge>
                        <span className="font-semibold text-gray-900">{abtropf.bedeutung}</span>
                      </div>
                      <p className="text-sm text-gray-600">{abtropf.beschreibung}</p>
                    </div>
                  ))}
                </div>
                <Alert className="mt-6 bg-blue-50 border-blue-200">
                  <AlertDescription className="text-sm">
                    Bei Estrichen ist <strong>d0</strong> (kein Abtropfen) Standard, da Estriche fest sind.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-900">Vollständige Klassifizierung</AlertTitle>
              <AlertDescription className="text-gray-700 mt-2">
                Eine vollständige Brandklassifizierung setzt sich zusammen aus: <strong>Hauptklasse-Rauch-Abtropfen</strong>
                <br />Beispiele: A1fl (ohne Zusätze), Bfl-s1-d0 (schwer entflammbar, kaum Rauch, kein Abtropfen)
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Estrichtyp-Matrix */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Typische Brandklassen nach Estrichtyp
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {estrichBrandklassen.map((estrich) => (
              <Card key={estrich.typ} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2 text-base px-3 py-1">
                    {estrich.typ}
                  </Badge>
                  <CardTitle className="text-xl">{estrich.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Standard-Brandklasse:
                    </div>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {estrich.standardKlasse}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Begründung:
                    </div>
                    <p className="text-sm text-gray-700">{estrich.grund}</p>
                  </div>
                  <div className="pt-4 border-t">
                    {estrich.pruefungErforderlich ? (
                      <div className="flex items-center gap-2 text-orange-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Prüfung erforderlich</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Keine Prüfung nötig</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Praxistipps */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Praxistipps für die Deklaration
          </h2>

          <div className="space-y-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Mineralische Estriche: A1fl direkt deklarieren
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                Wenn Ihr Estrich ausschließlich aus nicht brennbaren mineralischen Bestandteilen besteht
                (Zement, Sand, Kies, Calciumsulfat, Magnesit), können Sie A1fl ohne Prüfung in der
                Leistungserklärung angeben. Dokumentieren Sie die Rezeptur als Nachweis.
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  Kunstharzestriche: Prüfung einplanen
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                Kunstharzestriche müssen nach EN 13501-1 geprüft werden. Beauftragen Sie ein akkreditiertes
                Prüflabor bereits in der ITT-Phase. Die Prüfung dauert 2-4 Wochen und kostet ca. 1.500-3.000€.
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  Baurechtliche Anforderungen prüfen
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                Prüfen Sie die Landesbauordnung Ihres Bundeslandes für gebäudespezifische Mindestanforderungen.
                Hochhäuser und Sonderbauten haben oft strengere Brandschutzanforderungen als Wohngebäude.
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

            <Link href="/wissen/dop-erstellung">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">DoP</Badge>
                  <CardTitle className="text-lg">
                    Leistungserklärung erstellen
                  </CardTitle>
                  <CardDescription>
                    Brandverhalten in der DoP richtig deklarieren
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/ce-kennzeichnung">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">CE</Badge>
                  <CardTitle className="text-lg">
                    CE-Kennzeichnung für Estrich
                  </CardTitle>
                  <CardDescription>
                    Rechtssichere CE-Kennzeichnung
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Shield className="h-12 w-12 mx-auto mb-4 text-red-100" />
          <h2 className="text-3xl font-bold mb-4">
            Brandklasse automatisch in DoP übernehmen
          </h2>
          <p className="text-lg text-red-100 mb-8">
            EstrichManager wählt basierend auf Ihrer Rezeptur automatisch die korrekte
            Brandklasse und übernimmt sie in die Leistungserklärung. Normkonform und fehlerfrei.
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
            "headline": "EN 13501-1: Brandverhalten von Estrichen - Klassifizierung erklärt",
            "description": "Alle EN 13501-1 Brandklassen für Estrich von A1fl bis Efl erklärt.",
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
