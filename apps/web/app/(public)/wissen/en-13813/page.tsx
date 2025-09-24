import { Metadata } from "next"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  ArrowRight,
  Download,
  Clock,
  Star,
  ChevronRight,
  ClipboardCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "EN 13813 Norm für Estriche - Der komplette Leitfaden 2025 | EstrichManager",
  description: "Alles zur EN 13813: Estrichnorm einfach erklärt ✓ Anforderungen ✓ Prüfverfahren ✓ CE-Kennzeichnung ✓ Konformitätsbewertung. Der ultimative Guide für Estrichwerke.",
  keywords: ["EN 13813", "EN 13813 Norm", "Estrichnorm", "Estrich DIN EN 13813", "europäische Estrichnorm", "Estrichmörtel Norm", "Estrichmassen Norm", "EN 13813 Anforderungen", "EN 13813 Prüfverfahren"],
  openGraph: {
    title: "EN 13813: Die Estrichnorm komplett erklärt - EstrichManager Guide",
    description: "Verstehen Sie die EN 13813 in 15 Minuten. Praktischer Leitfaden mit Beispielen, Checklisten und Tipps für die Umsetzung im Estrichwerk.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/en-13813",
  },
}

export default function EN13813GuidePage() {
  // Inhaltsverzeichnis für bessere Navigation
  const tableOfContents = [
    { id: "was-ist", title: "Was ist EN 13813?", time: "2 Min" },
    { id: "geltungsbereich", title: "Geltungsbereich", time: "3 Min" },
    { id: "anforderungen", title: "Wesentliche Anforderungen", time: "5 Min" },
    { id: "bezeichnung", title: "Normbezeichnung verstehen", time: "3 Min" },
    { id: "pruefverfahren", title: "Prüfverfahren", time: "4 Min" },
    { id: "konformitaet", title: "Konformitätsbewertung", time: "3 Min" },
    { id: "praxis", title: "Praktische Umsetzung", time: "5 Min" },
    { id: "faq", title: "Häufige Fragen", time: "3 Min" },
  ]

  // Eigenschaften und Klassen für die Bezeichnung
  const eigenschaften = {
    bindemittel: [
      { code: "CT", name: "Zementestrich", description: "Cement screed" },
      { code: "CA", name: "Calciumsulfatestrich", description: "Calcium sulphate screed" },
      { code: "MA", name: "Magnesiaestrich", description: "Magnesite screed" },
      { code: "AS", name: "Gussasphaltestrich", description: "Mastic asphalt screed" },
      { code: "SR", name: "Kunstharzestrich", description: "Synthetic resin screed" },
    ],
    festigkeit: [
      { klasse: "C5", wert: "≥ 5 N/mm²", anwendung: "Leichte Belastung" },
      { klasse: "C12", wert: "≥ 12 N/mm²", anwendung: "Wohnbereich" },
      { klasse: "C20", wert: "≥ 20 N/mm²", anwendung: "Normal belastet" },
      { klasse: "C30", wert: "≥ 30 N/mm²", anwendung: "Gewerblich" },
      { klasse: "C40", wert: "≥ 40 N/mm²", anwendung: "Industrie" },
      { klasse: "C50", wert: "≥ 50 N/mm²", anwendung: "Schwerlast" },
      { klasse: "C60", wert: "≥ 60 N/mm²", anwendung: "Schwerlast+" },
      { klasse: "C70", wert: "≥ 70 N/mm²", anwendung: "Extrem" },
      { klasse: "C80", wert: "≥ 80 N/mm²", anwendung: "Speziell" },
    ],
    biegezug: [
      { klasse: "F1", wert: "≥ 1 N/mm²" },
      { klasse: "F2", wert: "≥ 2 N/mm²" },
      { klasse: "F3", wert: "≥ 3 N/mm²" },
      { klasse: "F4", wert: "≥ 4 N/mm²" },
      { klasse: "F5", wert: "≥ 5 N/mm²" },
      { klasse: "F7", wert: "≥ 7 N/mm²" },
      { klasse: "F10", wert: "≥ 10 N/mm²" },
      { klasse: "F15", wert: "≥ 15 N/mm²" },
      { klasse: "F20", wert: "≥ 20 N/mm²" },
      { klasse: "F30", wert: "≥ 30 N/mm²" },
      { klasse: "F40", wert: "≥ 40 N/mm²" },
      { klasse: "F50", wert: "≥ 50 N/mm²" },
    ]
  }

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
            <li className="text-gray-900 font-medium">EN 13813</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 lg:px-8 border-b">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              Norm-Guide • Aktualisiert Januar 2025
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              EN 13813: Die Estrichnorm vollständig erklärt
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600">
              Der umfassende Leitfaden zur europäischen Norm für Estrichmörtel und Estrichmassen.
              Von Grundlagen bis zur praktischen Umsetzung im Estrichwerk.
            </p>

            {/* Meta-Info */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                28 Min Lesezeit
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                4.9/5 (127 Bewertungen)
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                15.2k Aufrufe
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Download className="mr-2 h-4 w-4" />
                Als PDF herunterladen
              </Button>
              <Button size="lg" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Checkliste erhalten
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Inhaltsverzeichnis */}
      <section className="px-6 py-12 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Inhaltsverzeichnis</CardTitle>
              <CardDescription>Navigieren Sie direkt zu den relevanten Abschnitten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-700">{item.title}</span>
                    <span className="text-sm text-gray-500">{item.time}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Hauptinhalt */}
      <article className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl prose prose-lg">
          {/* Was ist EN 13813 */}
          <section id="was-ist" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Was ist EN 13813?</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Die <strong>EN 13813 "Estrichmörtel und Estrichmassen - Estrichmörtel - Eigenschaften und Anforderungen"</strong> ist
              die harmonisierte europäische Norm, die seit 2003 die Anforderungen an Estriche regelt.
              Sie ersetzt nationale Normen und schafft einheitliche Standards für den europäischen Binnenmarkt.
            </p>

            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wichtig für Estrichwerke</AlertTitle>
              <AlertDescription>
                Seit dem 1. Juli 2013 ist die CE-Kennzeichnung nach EN 13813 für alle Estriche verpflichtend,
                die in der EU in Verkehr gebracht werden. Dies betrifft alle Estrichwerke, unabhängig von der Größe.
              </AlertDescription>
            </Alert>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>Rechtsgrundlage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Bauproduktverordnung (EU) Nr. 305/2011 macht EN 13813 zur Pflicht für CE-Kennzeichnung</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <FileText className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle>Gültigkeit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Aktuelle Fassung: EN 13813:2002, letzte Änderung 2017. Gilt in allen EU-Mitgliedstaaten</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Geltungsbereich */}
          <section id="geltungsbereich" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Geltungsbereich der EN 13813</h2>
            <p className="text-lg text-gray-700">
              Die Norm gilt für alle Estrichmörtel und Estrichmassen zur Verwendung in Gebäuden:
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <strong>Verbundestriche:</strong> Direkt mit dem Untergrund verbunden
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <strong>Estriche auf Trennschicht:</strong> Vom Untergrund getrennt durch Folie oder Papier
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <strong>Schwimmende Estriche:</strong> Auf Dämmschicht verlegt (häufigste Bauart)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <strong>Heizestriche:</strong> Mit integrierter Fußbodenheizung
                </div>
              </div>
            </div>

            <Alert className="mt-6" variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Nicht in EN 13813 enthalten</AlertTitle>
              <AlertDescription>
                Industrieestriche mit besonderen Anforderungen (z.B. ESD-Schutz) und
                Nutzschichten werden durch andere Normen geregelt.
              </AlertDescription>
            </Alert>
          </section>

          {/* Wesentliche Anforderungen */}
          <section id="anforderungen" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Wesentliche Anforderungen nach EN 13813</h2>

            <Tabs defaultValue="mechanisch" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mechanisch">Mechanische Eigenschaften</TabsTrigger>
                <TabsTrigger value="brandschutz">Brandschutz</TabsTrigger>
                <TabsTrigger value="zusaetzlich">Zusätzliche</TabsTrigger>
              </TabsList>

              <TabsContent value="mechanisch" className="mt-6">
                <h3 className="text-xl font-bold mb-4">Mechanische und physikalische Eigenschaften</h3>

                <h4 className="text-lg font-semibold mt-6 mb-3">Druckfestigkeit (C-Klassen)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border px-4 py-2 text-left">Klasse</th>
                        <th className="border px-4 py-2 text-left">Mindestfestigkeit</th>
                        <th className="border px-4 py-2 text-left">Typische Anwendung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eigenschaften.festigkeit.map((item) => (
                        <tr key={item.klasse}>
                          <td className="border px-4 py-2 font-mono">{item.klasse}</td>
                          <td className="border px-4 py-2">{item.wert}</td>
                          <td className="border px-4 py-2">{item.anwendung}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4 className="text-lg font-semibold mt-6 mb-3">Biegezugfestigkeit (F-Klassen)</h4>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {eigenschaften.biegezug.map((item) => (
                    <div key={item.klasse} className="border rounded p-2 text-center">
                      <div className="font-mono font-bold">{item.klasse}</div>
                      <div className="text-sm text-gray-600">{item.wert}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="brandschutz" className="mt-6">
                <h3 className="text-xl font-bold mb-4">Brandschutzklassen</h3>
                <div className="space-y-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>A1<sub>fl</sub> / A2<sub>fl</sub></CardTitle>
                    </CardHeader>
                    <CardContent>
                      Nicht brennbar - Zement- und Calciumsulfatestriche ohne organische Zusätze
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>B<sub>fl</sub> bis E<sub>fl</sub></CardTitle>
                    </CardHeader>
                    <CardContent>
                      Verschiedene Brennbarkeitsgrade - abhängig vom organischen Anteil
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="zusaetzlich" className="mt-6">
                <h3 className="text-xl font-bold mb-4">Zusätzliche Eigenschaften (optional)</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verschleißwiderstand</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        <li>• A22: ≤ 22 cm³/50 cm²</li>
                        <li>• A15: ≤ 15 cm³/50 cm²</li>
                        <li>• A12: ≤ 12 cm³/50 cm²</li>
                        <li>• A9: ≤ 9 cm³/50 cm²</li>
                        <li>• A6: ≤ 6 cm³/50 cm²</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Weitere Eigenschaften</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        <li>• Oberflächenhärte (SH)</li>
                        <li>• Rollwiderstand (RWA)</li>
                        <li>• Schlagfestigkeit (IR)</li>
                        <li>• pH-Wert</li>
                        <li>• Elektrischer Widerstand</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </section>

          {/* Normbezeichnung */}
          <section id="bezeichnung" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Die EN 13813 Normbezeichnung verstehen</h2>
            <p className="text-lg text-gray-700">
              Die Bezeichnung nach EN 13813 folgt einem standardisierten Schema:
            </p>

            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="text-center text-2xl font-mono font-bold text-blue-900">
                EN 13813 - CT - C30 - F5 - A22
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-5 text-sm">
                <div className="text-center">
                  <div className="font-semibold">Norm</div>
                  <div className="text-gray-600">EN 13813</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Bindemittel</div>
                  <div className="text-gray-600">CT = Zement</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Druckfestigkeit</div>
                  <div className="text-gray-600">C30 = 30 N/mm²</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Biegezug</div>
                  <div className="text-gray-600">F5 = 5 N/mm²</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Verschleiß</div>
                  <div className="text-gray-600">A22 (optional)</div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Bindemittel-Codes</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {eigenschaften.bindemittel.map((item) => (
                <div key={item.code} className="flex items-center gap-3 p-3 border rounded">
                  <div className="font-mono font-bold text-lg text-blue-600">{item.code}</div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Prüfverfahren */}
          <section id="pruefverfahren" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Prüfverfahren nach EN 13813</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Erstprüfung (ITT - Initial Type Testing)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Die Erstprüfung muss vor dem ersten Inverkehrbringen durchgeführt werden:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Prüfung aller deklarierten Eigenschaften durch akkreditiertes Labor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Dokumentation der Rezeptur und Herstellverfahren</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Grundlage für die Leistungserklärung (DoP)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Werkseigene Produktionskontrolle (FPC)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Kontinuierliche Überwachung der Produktion:
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-2">Häufigkeit der Prüfungen</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Rohstoffe: Bei jeder Lieferung</li>
                        <li>• Druckfestigkeit: 1x pro Woche</li>
                        <li>• Biegezugfestigkeit: 1x pro Monat</li>
                        <li>• Konsistenz: Täglich</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Dokumentation</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Prüfprotokolle aufbewahren</li>
                        <li>• Abweichungen dokumentieren</li>
                        <li>• Korrekturmaßnahmen</li>
                        <li>• Mindestens 5 Jahre archivieren</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Konformitätsbewertung */}
          <section id="konformitaet" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Konformitätsbewertung & CE-Kennzeichnung</h2>

            <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertTitle>System 4 - Eigenverantwortung des Herstellers</AlertTitle>
              <AlertDescription>
                Estriche fallen unter System 4 der Konformitätsbewertung. Das bedeutet:
                Keine externe Überwachung erforderlich, aber volle Verantwortung beim Hersteller.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Schritte zur CE-Kennzeichnung:</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Erstprüfung (ITT) durchführen</h4>
                    <p className="text-gray-600">Alle relevanten Eigenschaften durch akkreditiertes Labor prüfen lassen</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">FPC-System etablieren</h4>
                    <p className="text-gray-600">Werkseigene Produktionskontrolle einrichten und dokumentieren</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Leistungserklärung (DoP) erstellen</h4>
                    <p className="text-gray-600">Deklaration der Leistungsmerkmale basierend auf ITT-Ergebnissen</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">CE-Kennzeichnung anbringen</h4>
                    <p className="text-gray-600">Auf Produkt, Verpackung oder Lieferschein</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold">Technische Dokumentation</h4>
                    <p className="text-gray-600">10 Jahre aufbewahren und Behörden zugänglich machen</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Praktische Umsetzung */}
          <section id="praxis" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Praktische Umsetzung im Estrichwerk</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle className="text-green-900">Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>✓ Standardrezepturen entwickeln und validieren</div>
                  <div>✓ Digitale Dokumentation einführen</div>
                  <div>✓ Mitarbeiter regelmäßig schulen</div>
                  <div>✓ Prüfmittel kalibrieren lassen</div>
                  <div>✓ QM-System nach ISO 9001 aufbauen</div>
                  <div>✓ Software für DoP-Erstellung nutzen</div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
                  <CardTitle className="text-red-900">Häufige Fehler vermeiden</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>✗ Veraltete ITT-Prüfungen verwenden</div>
                  <div>✗ FPC-Dokumentation vernachlässigen</div>
                  <div>✗ DoP nicht aktuell halten</div>
                  <div>✗ CE-Kennzeichnung vergessen</div>
                  <div>✗ Prüffrequenzen nicht einhalten</div>
                  <div>✗ Technische Dokumentation nicht archivieren</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Checkliste für die tägliche Praxis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Rohstoffzertifikate bei Lieferung prüfen</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Mischungsverhältnisse dokumentieren</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Prüfkörper nach Norm herstellen</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Prüfergebnisse in FPC-System eintragen</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>CE-Kennzeichnung auf Lieferschein prüfen</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>DoP-Nummer auf Lieferdokumenten angeben</span>
                  </label>
                </div>
                <Button className="mt-6 w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Vollständige Checkliste herunterladen
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Häufig gestellte Fragen zu EN 13813</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Muss jede Estrichlieferung einzeln geprüft werden?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Nein. Die EN 13813 schreibt Prüffrequenzen vor: Druckfestigkeit wöchentlich,
                    Biegezugfestigkeit monatlich. Die Prüfungen gelten für die Produktion des jeweiligen Zeitraums.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Gilt EN 13813 auch für Sonderestriche?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Die Grundanforderungen gelten für alle Estriche. Sonderestriche mit zusätzlichen
                    Eigenschaften (z.B. schnelle Trocknung, erhöhte Wärmeleitfähigkeit) müssen diese
                    zusätzlich deklarieren und prüfen.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Was passiert bei Nichtkonformität?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Bei Abweichungen von den deklarierten Werten müssen sofort Korrekturmaßnahmen ergriffen werden.
                    Die betroffenen Chargen dürfen nicht mit CE-Kennzeichnung in Verkehr gebracht werden.
                    Wiederholte Verstöße können zu Bußgeldern und Vertriebsverboten führen.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Wie oft muss die ITT wiederholt werden?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Die ITT muss nur bei wesentlichen Änderungen wiederholt werden: neue Rezeptur,
                    andere Rohstoffe, verändertes Herstellverfahren. Bei gleichbleibender Produktion
                    gilt die ursprüngliche ITT unbegrenzt.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </article>

      {/* CTA Section */}
      <section className="px-6 py-16 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            EN 13813 Compliance leicht gemacht
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Mit EstrichManager erfüllen Sie alle Anforderungen der EN 13813 automatisch.
            DoP-Erstellung in 5 Minuten, FPC-Dokumentation auf Knopfdruck.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">
                Live-Demo ansehen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white/20"
            >
              <Link href="/tools/normbezeichnung">
                Normbezeichnung generieren
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Weitere Artikel */}
      <section className="px-6 py-12 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Weiterführende Artikel</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/wissen/ce-kennzeichnung">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <Shield className="h-6 w-6 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">CE-Kennzeichnung</CardTitle>
                  <CardDescription>
                    Schritt für Schritt zur rechtssicheren CE-Kennzeichnung
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/wissen/dop-erstellung">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <FileText className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">DoP erstellen</CardTitle>
                  <CardDescription>
                    Leistungserklärungen korrekt erstellen und verwalten
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/wissen/fpc-dokumentation">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <ClipboardCheck className="h-6 w-6 text-purple-600 mb-2" />
                  <CardTitle className="text-lg">FPC-System</CardTitle>
                  <CardDescription>
                    Werkseigene Produktionskontrolle aufbauen
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Schema.org für SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "EN 13813 Norm für Estriche - Der komplette Leitfaden 2025",
            "description": "Alles zur EN 13813: Estrichnorm einfach erklärt mit Anforderungen, Prüfverfahren und praktischer Umsetzung",
            "author": {
              "@type": "Organization",
              "name": "EstrichManager"
            },
            "datePublished": "2025-01-15",
            "dateModified": "2025-01-15",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://estrichmanager.de/wissen/en-13813"
            },
            "publisher": {
              "@type": "Organization",
              "name": "EstrichManager",
              "logo": {
                "@type": "ImageObject",
                "url": "https://estrichmanager.de/logo.png"
              }
            },
            "articleSection": "Normen & Vorschriften",
            "wordCount": 2500,
            "articleBody": "Die EN 13813 ist die harmonisierte europäische Norm für Estrichmörtel und Estrichmassen...",
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
                  "name": "EN 13813",
                  "item": "https://estrichmanager.de/wissen/en-13813"
                }
              ]
            }
          })
        }}
      />
    </main>
  )
}