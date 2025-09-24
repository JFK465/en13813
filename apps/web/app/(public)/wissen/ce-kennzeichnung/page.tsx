import { Metadata } from "next"
import Link from "next/link"
import { Shield, AlertCircle, CheckCircle, FileText, Download, ChevronRight, ArrowRight, Clock, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "CE-Kennzeichnung für Estrich nach EN 13813 - Schritt-für-Schritt Anleitung | EstrichManager",
  description: "CE-Kennzeichnung für Estrich rechtssicher umsetzen ✓ Bauproduktverordnung ✓ CE-Zeichen korrekt anbringen ✓ Pflichtangaben ✓ Praxisbeispiele. Komplettanleitung 2025.",
  keywords: ["CE-Kennzeichnung Estrich", "CE Zeichen Estrich", "CE Marking", "Bauproduktverordnung", "CE-Kennzeichnung EN 13813", "CE Pflicht Estrich", "CE-Konformität"],
  openGraph: {
    title: "CE-Kennzeichnung für Estrich - Rechtssicher umsetzen",
    description: "Schritt-für-Schritt zur CE-Kennzeichnung nach EN 13813. Mit Vorlagen, Checklisten und häufigen Fehlern.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/ce-kennzeichnung",
  },
}

export default function CEKennzeichnungPage() {
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
            <li className="text-gray-900 font-medium">CE-Kennzeichnung</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 lg:px-8 border-b">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-green-100 text-green-800">Pflichtthema • Aktuell 2025</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            CE-Kennzeichnung für Estrich rechtssicher umsetzen
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Der komplette Leitfaden zur CE-Kennzeichnung nach EN 13813 und Bauproduktverordnung.
            Mit Vorlagen, Beispielen und Checklisten für Ihr Estrichwerk.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />20 Min Lesezeit</span>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />8.7k Aufrufe</span>
          </div>
        </div>
      </section>

      {/* Hauptinhalt */}
      <article className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Einführung */}
          <section className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold mb-6">Was ist die CE-Kennzeichnung?</h2>
            <p className="text-lg text-gray-700">
              Die <strong>CE-Kennzeichnung</strong> (Conformité Européenne) ist eine verpflichtende Konformitätskennzeichnung
              für Bauprodukte, die in der EU in Verkehr gebracht werden. Seit dem 1. Juli 2013 müssen alle Estriche
              nach EN 13813 mit dem CE-Zeichen versehen werden.
            </p>

            <Alert className="my-6">
              <Shield className="h-4 w-4" />
              <AlertTitle>Rechtliche Pflicht</AlertTitle>
              <AlertDescription>
                Die CE-Kennzeichnung ist keine Qualitätsauszeichnung, sondern eine zwingende rechtliche Voraussetzung
                für das Inverkehrbringen von Estrichprodukten in der EU. Verstöße können mit Bußgeldern bis 100.000 €
                und Vertriebsverboten geahndet werden.
              </AlertDescription>
            </Alert>

            <h2 className="text-3xl font-bold mb-6 mt-12">Die 5 Schritte zur CE-Kennzeichnung</h2>
          </section>

          {/* Schritte */}
          <div className="space-y-6 mb-12">
            <Card className="border-l-4 border-blue-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <CardTitle>Erstprüfung (ITT) durchführen</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">Lassen Sie alle relevanten Eigenschaften durch ein akkreditiertes Prüflabor testen:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Druckfestigkeit nach EN 13892-2</li>
                  <li>• Biegezugfestigkeit nach EN 13892-2</li>
                  <li>• Verschleißwiderstand (falls deklariert)</li>
                  <li>• Brandverhalten</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-blue-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <CardTitle>Werkseigene Produktionskontrolle (FPC) etablieren</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">Richten Sie ein dokumentiertes Qualitätssicherungssystem ein:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Prüfplan mit Frequenzen erstellen</li>
                  <li>• Prüfmittel kalibrieren</li>
                  <li>• Personal schulen</li>
                  <li>• Aufzeichnungen führen</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-blue-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <CardTitle>Leistungserklärung (DoP) erstellen</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">Erstellen Sie für jedes Produkt eine Leistungserklärung mit:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Eindeutiger DoP-Nummer</li>
                  <li>• Produktidentifikation</li>
                  <li>• Deklarierte Leistungen</li>
                  <li>• System der Konformitätsbewertung (System 4)</li>
                </ul>
                <Link href="/wissen/dop-erstellung" className="text-blue-600 hover:underline mt-2 inline-block">
                  → Zur DoP-Anleitung
                </Link>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-blue-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <CardTitle>CE-Kennzeichnung anbringen</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">Bringen Sie die CE-Kennzeichnung an auf:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Dem Produkt selbst (wenn möglich)</li>
                  <li>• Der Verpackung</li>
                  <li>• Den Begleitdokumenten (Lieferschein)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-blue-600">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                  <CardTitle>Technische Dokumentation pflegen</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">Bewahren Sie folgende Unterlagen 10 Jahre auf:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• ITT-Prüfberichte</li>
                  <li>• FPC-Aufzeichnungen</li>
                  <li>• Leistungserklärungen</li>
                  <li>• Konformitätsnachweise</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CE-Zeichen Muster */}
          <Card className="mb-12 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">Das CE-Zeichen korrekt gestalten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Mindestangaben bei Estrich:</h3>
                  <div className="bg-white p-4 rounded border-2 border-gray-300">
                    <div className="text-center mb-2">
                      <span className="text-3xl font-bold">CE</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>25</strong> (Jahr der Anbringung)</div>
                      <div><strong>Musterfirma GmbH</strong></div>
                      <div>Musterstr. 1, 12345 Musterstadt</div>
                      <div><strong>DoP-Nr: 001-2025</strong></div>
                      <div><strong>EN 13813</strong></div>
                      <div><strong>CT-C30-F5</strong></div>
                      <div>Brandverhalten: A1fl</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Gestaltungsregeln:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Mindesthöhe 5 mm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Proportionen müssen eingehalten werden</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Deutlich sichtbar und lesbar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Dauerhaft angebracht</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Häufige Fehler */}
          <Card className="mb-12 border-red-200 bg-red-50">
            <CardHeader>
              <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Häufige Fehler vermeiden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-semibold">❌ Falsch:</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• CE-Zeichen ohne DoP-Nummer</li>
                    <li>• Veraltete ITT-Prüfungen verwenden</li>
                    <li>• CE nur auf Rechnung angeben</li>
                    <li>• Keine FPC-Dokumentation führen</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold">✅ Richtig:</div>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Vollständige CE-Kennzeichnung</li>
                    <li>• Aktuelle ITT-Berichte</li>
                    <li>• CE auf Lieferschein UND Produkt</li>
                    <li>• Lückenlose FPC-Aufzeichnungen</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Häufige Fragen zur CE-Kennzeichnung</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Muss ich für jede Rezeptur eine eigene CE-Kennzeichnung?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Ja, jede Rezeptur mit unterschiedlichen Eigenschaften benötigt eine eigene ITT-Prüfung
                    und DoP. Sie können jedoch ähnliche Produkte in Familien gruppieren.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Was passiert bei fehlender CE-Kennzeichnung?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Produkte ohne CE-Kennzeichnung dürfen nicht in Verkehr gebracht werden.
                    Verstöße können mit Bußgeldern bis 100.000 € und Vertriebsverboten belegt werden.
                    Zusätzlich drohen zivilrechtliche Haftungsrisiken.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gilt die CE-Kennzeichnung auch für Kleinstmengen?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Ja, die CE-Kennzeichnungspflicht gilt unabhängig von der Menge.
                    Auch einzelne Säcke oder kleine Chargen müssen gekennzeichnet werden.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Downloads */}
          <Card className="mb-12 bg-gray-50">
            <CardHeader>
              <CardTitle>Hilfreiche Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  CE-Kennzeichnung Vorlage
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Checkliste CE-Konformität
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  FPC-Dokumentation Muster
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Lieferschein mit CE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>

      {/* CTA */}
      <section className="px-6 py-16 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">CE-Kennzeichnung automatisiert erstellen</h2>
          <p className="text-lg text-green-100 mb-8">
            Mit EstrichManager erfüllen Sie alle CE-Anforderungen auf Knopfdruck.
            DoP-Erstellung, CE-Kennzeichnung und FPC-Dokumentation vollautomatisch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">Live-Demo ansehen<ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
              <Link href="/register">Kostenlos testen</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Weitere Artikel */}
      <section className="px-6 py-12 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Weiterführende Themen</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/wissen/en-13813">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">EN 13813 Norm</CardTitle>
                  <CardDescription>Die Estrichnorm im Detail</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/wissen/dop-erstellung">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <FileText className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">DoP erstellen</CardTitle>
                  <CardDescription>Leistungserklärung Schritt für Schritt</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/wissen/fpc-dokumentation">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <Shield className="h-6 w-6 text-purple-600 mb-2" />
                  <CardTitle className="text-lg">FPC-System</CardTitle>
                  <CardDescription>Produktionskontrolle aufbauen</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}