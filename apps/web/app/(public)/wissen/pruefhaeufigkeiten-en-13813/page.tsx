import { Metadata } from "next"
import Link from "next/link"
import {
  CheckCircle,
  Calendar,
  ArrowRight,
  ChevronRight,
  Clock,
  AlertTriangle,
  BarChart3,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Prüfhäufigkeiten EN 13813 - Wie oft Estrich prüfen? | Guide 2025",
  description: "Prüfhäufigkeiten nach EN 13813: ITT vs FPC erklärt. Wie oft muss Estrich geprüft werden? Druckfestigkeit, Verschleiß und mehr - mit Prüfplan-Tabellen.",
  keywords: [
    "Prüfhäufigkeit EN 13813",
    "wie oft Estrich prüfen",
    "ITT Erstprüfung",
    "FPC Prüfhäufigkeit",
    "werkseigene Produktionskontrolle",
    "Druckfestigkeit Prüfhäufigkeit",
    "Estrich Prüfplan"
  ],
  openGraph: {
    title: "Prüfhäufigkeiten nach EN 13813: Wie oft muss Estrich geprüft werden?",
    description: "ITT, FPC und laufende Kontrollen - alle Prüfhäufigkeiten nach EN 13813 im Überblick mit praktischen Prüfplan-Tabellen.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/pruefhaeufigkeiten-en-13813",
  },
}

export default function PruefhaeufigkeitenPage() {
  // ITT vs FPC Übersicht
  const pruefarten = [
    {
      typ: "ITT",
      name: "Erstprüfung (Initial Type Testing)",
      wann: "Vor Markteinführung eines neuen Rezepts",
      haeufigkeit: "Einmalig pro Rezeptur",
      umfang: "Alle relevanten EN 13892 Prüfungen",
      ziel: "Nachweis der Konformität",
      color: "bg-blue-50 border-blue-200"
    },
    {
      typ: "FPC",
      name: "Werkseigene Produktionskontrolle",
      wann: "Laufende Produktion",
      haeufigkeit: "Regelmäßig nach Prüfplan",
      umfang: "Reduzierte Prüfungen (meist nur Druckfestigkeit)",
      ziel: "Sicherstellung der Produktkonstanz",
      color: "bg-green-50 border-green-200"
    }
  ]

  // Prüfhäufigkeiten-Tabelle
  const pruefhaeufigkeitenTabelle = [
    {
      eigenschaft: "Druckfestigkeit",
      norm: "EN 13892-2",
      itt: "Ja (6 Prüfkörper)",
      fpc: "2x pro Monat oder alle 50 t",
      mindest: "1x pro Quartal",
      kritisch: true
    },
    {
      eigenschaft: "Biegezugfestigkeit",
      norm: "EN 13892-2",
      itt: "Ja (6 Prüfkörper)",
      fpc: "1x pro Monat oder alle 100 t",
      mindest: "1x halbjährlich"
    },
    {
      eigenschaft: "Verschleißwiderstand (Böhme)",
      norm: "EN 13892-3",
      itt: "Ja (bei Nutzschicht)",
      fpc: "1x jährlich",
      mindest: "1x alle 2 Jahre"
    },
    {
      eigenschaft: "Verschleißwiderstand (BCA)",
      norm: "EN 13892-4",
      itt: "Ja (bei Nutzschicht)",
      fpc: "1x jährlich",
      mindest: "1x alle 2 Jahre"
    },
    {
      eigenschaft: "Oberflächenhärte",
      norm: "EN 13892-6",
      itt: "Ja (bei MA)",
      fpc: "1x halbjährlich",
      mindest: "1x jährlich"
    },
    {
      eigenschaft: "Haftzugfestigkeit",
      norm: "EN 13892-8",
      itt: "Ja (bei SR)",
      fpc: "1x halbjährlich",
      mindest: "1x jährlich"
    },
    {
      eigenschaft: "Dimensionsstabilität",
      norm: "EN 13892-9",
      itt: "Bei Bedarf",
      fpc: "1x alle 2 Jahre",
      mindest: "Optional"
    }
  ]

  // Produktionsvolumen-basierte Hä ufigkeiten
  const volumenBasiert = [
    {
      volumen: "< 500 t/Jahr",
      kategorie: "Kleine Produktion",
      druckfestigkeit: "1x monatlich",
      biegezug: "1x quartalsweise",
      verschleiss: "1x jährlich"
    },
    {
      volumen: "500-2000 t/Jahr",
      kategorie: "Mittlere Produktion",
      druckfestigkeit: "2x monatlich",
      biegezug: "1x monatlich",
      verschleiss: "2x jährlich"
    },
    {
      volumen: "> 2000 t/Jahr",
      kategorie: "Große Produktion",
      druckfestigkeit: "Alle 50 t oder 2x/Woche",
      biegezug: "Alle 100 t oder 1x/Woche",
      verschleiss: "Quartalsweise"
    }
  ]

  // FAQs
  const faqs = [
    {
      frage: "Muss ich bei jeder Charge alle Prüfungen durchführen?",
      antwort: "Nein. Die Erstprüfung (ITT) erfordert alle relevanten Prüfungen. Bei der werkseigenen Produktionskontrolle (FPC) werden nur die kritischen Eigenschaften regelmäßig geprüft - typischerweise Druckfestigkeit und Biegezugfestigkeit. Andere Eigenschaften können seltener kontrolliert werden."
    },
    {
      frage: "Was passiert, wenn ich die Prüfhäufigkeiten nicht einhalte?",
      antwort: "Das kann zur Aberkennung der CE-Kennzeichnung führen. Die FPC ist verpflichtender Bestandteil der Konformitätsbewertung nach EN 13813. Bei Audits durch notifizierte Stellen werden die Prüfprotokolle kontrolliert. Fehlende Prüfungen sind ein schwerwiegender Mangel."
    },
    {
      frage: "Kann ich die Prüfhäufigkeit reduzieren?",
      antwort: "Ja, nach einer Bewährungsphase von mindestens 1 Jahr mit konstanten Ergebnissen kann die Prüfhäufigkeit in Absprache mit der notifizierten Stelle reduziert werden. Dies muss aber im FPC-Handbuch dokumentiert und begründet sein."
    },
    {
      frage: "Wie zähle ich die Produktionsmenge für '50 t'?",
      antwort: "Die Produktionsmenge bezieht sich auf die kumulative Gesamtproduktion einer spezifischen Rezeptur. Bei 50 Tonnen muss eine Druckfestigkeitsprüfung durchgeführt werden, unabhängig vom Zeitraum. Führen Sie ein Produktionsregister, um dies zu tracken."
    },
    {
      frage: "Was ist, wenn ich nur 1-2 Chargen pro Jahr produziere?",
      antwort: "Bei sehr geringer Produktionsmenge gelten Mindestprüfhäufigkeiten: Druckfestigkeit mindestens 1x pro Quartal. Bei längeren Produktionspausen kann die Prüfhäufigkeit ausgesetzt werden, aber vor Wiederaufnahme muss eine Kontrollprüfung erfolgen."
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
            <li className="text-gray-900 font-medium">Prüfhäufigkeiten</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-blue-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Prüfplanung
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              10 Min Lesezeit
            </Badge>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Prüfhäufigkeiten nach EN 13813: Wie oft muss Estrich geprüft werden?
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Die EN 13813 unterscheidet zwischen Erstprüfung (ITT) und werkseigener Produktionskontrolle (FPC).
            Dieser Guide zeigt Ihnen die genauen Prüfhäufigkeiten für alle Eigenschaften und
            wie Sie einen normkonformen Prüfplan erstellen.
          </p>
        </div>
      </section>

      {/* TL;DR */}
      <section className="px-6 py-8 lg:px-8 bg-blue-50 border-b border-blue-100">
        <div className="mx-auto max-w-4xl">
          <Alert className="bg-white border-blue-200">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-lg font-semibold text-blue-900">
              Das Wichtigste in Kürze
            </AlertTitle>
            <AlertDescription className="mt-3 text-gray-700 space-y-2">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong>ITT (Erstprüfung):</strong> Einmalig bei neuer Rezeptur mit allen relevanten Prüfungen</li>
                <li><strong>FPC (laufend):</strong> Druckfestigkeit 2x/Monat oder alle 50t (kritischste Eigenschaft)</li>
                <li><strong>Biegezugfestigkeit:</strong> Mindestens 1x monatlich bei FPC</li>
                <li><strong>Verschleißprüfungen:</strong> 1-2x jährlich ausreichend</li>
                <li><strong>Mindestanforderung:</strong> Auch bei geringer Produktion 1x/Quartal Druckfestigkeit</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* ITT vs FPC */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            ITT vs. FPC: Die zwei Prüfebenen
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {pruefarten.map((art) => (
              <Card key={art.typ} className={`border-2 ${art.color}`}>
                <CardHeader>
                  <Badge className="w-fit text-lg px-4 py-1.5">
                    {art.typ}
                  </Badge>
                  <CardTitle className="text-2xl mt-3">{art.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Wann?</div>
                    <div className="text-gray-900">{art.wann}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Häufigkeit</div>
                    <div className="text-gray-900">{art.haeufigkeit}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Prüfumfang</div>
                    <div className="text-gray-900">{art.umfang}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Ziel</div>
                    <div className="text-gray-900">{art.ziel}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert className="mt-8 bg-orange-50 border-orange-200">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900">Wichtig</AlertTitle>
            <AlertDescription className="text-gray-700 mt-2">
              Ohne ITT-Nachweis darf ein Rezept nicht mit CE-Kennzeichnung in Verkehr gebracht werden.
              Die FPC allein reicht nicht aus – sie setzt eine erfolgreiche ITT voraus.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Prüfhäufigkeiten-Tabelle */}
      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Prüfhäufigkeiten im Detail
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Eigenschaft</th>
                  <th className="px-4 py-3 text-left">Norm</th>
                  <th className="px-4 py-3 text-left">ITT</th>
                  <th className="px-4 py-3 text-left">FPC Empfohlen</th>
                  <th className="px-4 py-3 text-left">FPC Mindestens</th>
                </tr>
              </thead>
              <tbody>
                {pruefhaeufigkeitenTabelle.map((zeile, index) => (
                  <tr
                    key={index}
                    className={`border-b ${zeile.kritisch ? 'bg-red-50' : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {zeile.eigenschaft}
                      {zeile.kritisch && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Kritisch
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{zeile.norm}</td>
                    <td className="px-4 py-3 text-sm">{zeile.itt}</td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-900">{zeile.fpc}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{zeile.mindest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-sm">
                <strong className="text-red-900">Kritisch:</strong> Diese Eigenschaften müssen häufiger geprüft werden
              </AlertDescription>
            </Alert>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm">
                <strong className="text-blue-900">FPC Empfohlen:</strong> Best Practice für laufende Qualitätssicherung
              </AlertDescription>
            </Alert>
            <Alert className="bg-gray-100 border-gray-300">
              <AlertDescription className="text-sm">
                <strong className="text-gray-900">FPC Mindestens:</strong> Absolute Mindestanforderung
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* Produktionsvolumen-basiert */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Prüfhäufigkeiten nach Produktionsvolumen
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {volumenBasiert.map((vol, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
                  <Badge className="w-fit mb-2">{vol.volumen}</Badge>
                  <CardTitle>{vol.kategorie}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1.5 text-red-600" />
                      Druckfestigkeit
                    </div>
                    <div className="text-gray-900 font-medium">{vol.druckfestigkeit}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1.5 text-orange-600" />
                      Biegezugfestigkeit
                    </div>
                    <div className="text-gray-900">{vol.biegezug}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                      <RefreshCw className="h-4 w-4 mr-1.5 text-blue-600" />
                      Verschleißwiderstand
                    </div>
                    <div className="text-gray-900">{vol.verschleiss}</div>
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
            Praxistipps für Ihren Prüfplan
          </h2>

          <div className="space-y-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Produktionsregister führen
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                Dokumentieren Sie kontinuierlich Ihre Produktionsmengen pro Rezeptur.
                So wissen Sie genau, wann die nächste Prüfung fällig ist (z.B. bei 50 t Druckfestigkeit).
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  Jahresprüfplan erstellen
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                Legen Sie zu Jahresbeginn fest, in welchen Kalenderwochen welche Prüfungen durchgeführt werden.
                Planen Sie Prüflabor-Kapazitäten frühzeitig ein.
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  Erinnerungen einrichten
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700">
                Setzen Sie automatische Erinnerungen für wiederkehrende Prüfungen.
                Viele Estrichwerke verpassen Prüftermine, weil sie im Produktionsalltag untergehen.
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-8 bg-purple-50 border-purple-200">
            <AlertDescription className="text-sm">
              <strong className="text-purple-900">Software-Tipp:</strong> EstrichManager erstellt automatisch
              Prüfpläne basierend auf Ihrem Produktionsvolumen und sendet rechtzeitig Erinnerungen.
              <Link href="/demo" className="text-purple-600 hover:underline ml-1">
                Jetzt Demo ansehen →
              </Link>
            </AlertDescription>
          </Alert>
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
            <Link href="/wissen/welche-en-13892-pruefung">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">Prüfauswahl</Badge>
                  <CardTitle className="text-lg">
                    Welche EN 13892 Prüfung brauche ich?
                  </CardTitle>
                  <CardDescription>
                    Entscheidungshilfe für die richtige Prüfung
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/wissen/itt-management">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">ITT</Badge>
                  <CardTitle className="text-lg">
                    Erstprüfung nach EN 13813
                  </CardTitle>
                  <CardDescription>
                    ITT planen und dokumentieren
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
                    FPC normkonform aufbauen
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-blue-100" />
          <h2 className="text-3xl font-bold mb-4">
            Automatische Prüfplanung mit EstrichManager
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Nie wieder Prüftermine verpassen. Die Software erstellt automatisch Prüfpläne,
            trackt Produktionsmengen und erinnert Sie rechtzeitig an fällige Prüfungen.
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
            "headline": "Prüfhäufigkeiten nach EN 13813: Wie oft muss Estrich geprüft werden?",
            "description": "ITT vs FPC erklärt. Alle Prüfhäufigkeiten nach EN 13813 mit praktischen Tabellen.",
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
