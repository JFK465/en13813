import { Metadata } from "next"
import Link from "next/link"
import { FileText, CheckCircle, AlertCircle, Download, Clock, BookOpen, ChevronRight, ArrowRight, Zap, Shield, Edit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "DoP (Leistungserklärung) für Estrich erstellen - Komplettanleitung 2025 | EstrichManager",
  description: "Leistungserklärung (DoP) für Estrich rechtssicher erstellen ✓ Schritt-für-Schritt Anleitung ✓ Vorlagen ✓ Beispiele ✓ Häufige Fehler vermeiden. In 5 Minuten zur fertigen DoP.",
  keywords: ["DoP erstellen", "Leistungserklärung Estrich", "Declaration of Performance", "DoP Estrich", "DoP EN 13813", "Leistungserklärung erstellen", "DoP Vorlage", "DoP Generator"],
  openGraph: {
    title: "DoP für Estrich erstellen - Schritt-für-Schritt Anleitung",
    description: "Erstellen Sie rechtssichere Leistungserklärungen (DoP) für Estrich nach EN 13813. Mit Vorlagen, Beispielen und Praxistipps.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/dop-erstellung",
  },
}

export default function DoPErstellungPage() {
  const dopInhalte = [
    { nummer: "1", titel: "DoP-Nummer", pflicht: true, beispiel: "DoP-001-2025" },
    { nummer: "2", titel: "Produkttyp", pflicht: true, beispiel: "CT-C30-F5" },
    { nummer: "3", titel: "Verwendungszweck", pflicht: true, beispiel: "Estrichmörtel für Innenräume" },
    { nummer: "4", titel: "Hersteller", pflicht: true, beispiel: "Musterfirma GmbH, Musterstr. 1" },
    { nummer: "5", titel: "Bevollmächtigter", pflicht: false, beispiel: "Nicht zutreffend" },
    { nummer: "6", titel: "System AVCP", pflicht: true, beispiel: "System 4" },
    { nummer: "7", titel: "Harmonisierte Norm", pflicht: true, beispiel: "EN 13813:2002" },
    { nummer: "8", titel: "Notifizierte Stelle", pflicht: false, beispiel: "Nicht zutreffend (System 4)" },
    { nummer: "9", titel: "Erklärte Leistung", pflicht: true, beispiel: "Siehe Tabelle" },
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
            <li className="text-gray-900 font-medium">DoP Erstellung</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 lg:px-8 border-b">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-purple-100 text-purple-800">Praxis-Guide • 5 Min zur fertigen DoP</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Leistungserklärung (DoP) für Estrich erstellen
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Die komplette Anleitung zur Erstellung rechtssicherer Leistungserklärungen nach EN 13813.
            Mit Vorlagen, Beispielen und einer Schritt-für-Schritt Anleitung.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />15 Min Lesezeit</span>
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />8.7k Aufrufe</span>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <Download className="mr-2 h-4 w-4" />
              DoP-Vorlage herunterladen
            </Button>
            <Button size="lg" variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              DoP-Generator testen
            </Button>
          </div>
        </div>
      </section>

      {/* Hauptinhalt */}
      <article className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Was ist eine DoP */}
          <section className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold mb-6">Was ist eine Leistungserklärung (DoP)?</h2>
            <p className="text-lg text-gray-700">
              Die <strong>Leistungserklärung</strong> (englisch: Declaration of Performance, DoP) ist ein rechtlich verbindliches Dokument,
              in dem der Hersteller die Leistungen seines Bauprodukts erklärt. Seit dem 1. Juli 2013 ist sie für alle
              harmonisierten Bauprodukte, einschließlich Estriche nach EN 13813, verpflichtend.
            </p>

            <Alert className="my-6">
              <Shield className="h-4 w-4" />
              <AlertTitle>Rechtliche Bedeutung</AlertTitle>
              <AlertDescription>
                Mit der DoP übernimmt der Hersteller die volle rechtliche Verantwortung für die deklarierten Leistungen.
                Falsche Angaben können zu erheblichen Haftungsrisiken und Bußgeldern führen.
              </AlertDescription>
            </Alert>
          </section>

          {/* Die 9 Pflichtangaben */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Die 9 Pflichtangaben einer DoP</h2>
            <p className="text-lg text-gray-700 mb-6">
              Jede Leistungserklärung muss gemäß Bauproduktverordnung Anhang III diese Angaben enthalten:
            </p>

            <div className="space-y-4">
              {dopInhalte.map((inhalt) => (
                <Card key={inhalt.nummer} className={inhalt.pflicht ? "border-l-4 border-blue-600" : "border-l-4 border-gray-300"}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {inhalt.nummer}
                        </div>
                        <CardTitle className="text-lg">{inhalt.titel}</CardTitle>
                      </div>
                      {inhalt.pflicht ? (
                        <Badge className="bg-red-100 text-red-800">Pflicht</Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      <strong>Beispiel:</strong> {inhalt.beispiel}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Schritt-für-Schritt Anleitung */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Schritt-für-Schritt zur fertigen DoP</h2>

            <Tabs defaultValue="schritt1" className="mt-8">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="schritt1">1. Vorbereitung</TabsTrigger>
                <TabsTrigger value="schritt2">2. Daten</TabsTrigger>
                <TabsTrigger value="schritt3">3. Leistungen</TabsTrigger>
                <TabsTrigger value="schritt4">4. Prüfung</TabsTrigger>
                <TabsTrigger value="schritt5">5. Veröffentlichung</TabsTrigger>
              </TabsList>

              <TabsContent value="schritt1" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schritt 1: Vorbereitung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>Stellen Sie folgende Unterlagen bereit:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>ITT-Prüfbericht (nicht älter als Rezepturänderung)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Produktrezeptur und technisches Datenblatt</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Firmendaten (Name, Adresse, Kontakt)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Bisherige DoPs für Nummerierung</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schritt2" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schritt 2: Grunddaten eingeben</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">DoP-Nummer vergeben</label>
                      <input type="text" className="w-full p-2 border rounded" placeholder="z.B. DoP-001-2025" />
                      <p className="text-sm text-gray-600 mt-1">Eindeutig und nachvollziehbar</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Produkttyp-Bezeichnung</label>
                      <input type="text" className="w-full p-2 border rounded" placeholder="z.B. CT-C30-F5" />
                      <p className="text-sm text-gray-600 mt-1">Nach EN 13813</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Verwendungszweck</label>
                      <textarea className="w-full p-2 border rounded" rows={2}
                        placeholder="Zementestrich zur Verwendung in Gebäuden" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schritt3" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schritt 3: Leistungen deklarieren</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Übertragen Sie die Werte aus dem ITT-Prüfbericht:</p>
                    <table className="w-full border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border px-4 py-2 text-left">Eigenschaft</th>
                          <th className="border px-4 py-2 text-left">Norm</th>
                          <th className="border px-4 py-2 text-left">Deklarierte Leistung</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border px-4 py-2">Brandverhalten</td>
                          <td className="border px-4 py-2">EN 13501-1</td>
                          <td className="border px-4 py-2">A1fl</td>
                        </tr>
                        <tr>
                          <td className="border px-4 py-2">Druckfestigkeit</td>
                          <td className="border px-4 py-2">EN 13892-2</td>
                          <td className="border px-4 py-2">C30</td>
                        </tr>
                        <tr>
                          <td className="border px-4 py-2">Biegezugfestigkeit</td>
                          <td className="border px-4 py-2">EN 13892-2</td>
                          <td className="border px-4 py-2">F5</td>
                        </tr>
                        <tr>
                          <td className="border px-4 py-2">Verschleißwiderstand</td>
                          <td className="border px-4 py-2">EN 13892-3</td>
                          <td className="border px-4 py-2">NPD</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-sm text-gray-600 mt-2">NPD = No Performance Determined (keine Leistung festgelegt)</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schritt4" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schritt 4: Prüfung und Freigabe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Alle Pflichtangaben vollständig?</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Werte stimmen mit ITT-Bericht überein?</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>DoP-Nummer eindeutig vergeben?</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4" />
                        <span>Datum und Unterschrift vorbereitet?</span>
                      </label>
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Die DoP muss vom Geschäftsführer oder einem Bevollmächtigten unterzeichnet werden.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schritt5" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schritt 5: Veröffentlichung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">DoP bereitstellen:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <span>Auf Website veröffentlichen (empfohlen)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <span>Als PDF per E-Mail versendbar machen</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <span>Kopie mit Lieferung mitgeben</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Archivierung:</h4>
                      <p className="text-gray-700">
                        DoPs müssen 10 Jahre nach letzter Produktlieferung aufbewahrt werden.
                        Empfehlung: Digitale Archivierung mit Versionskontrolle.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* Häufige Fehler */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Die 7 häufigsten Fehler bei DoPs</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-900">❌ Fehler</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700">
                    <li>• DoP ohne eindeutige Nummer</li>
                    <li>• Veraltete ITT-Werte verwenden</li>
                    <li>• Falsche Norm-Bezeichnung</li>
                    <li>• Fehlende Unterschrift</li>
                    <li>• DoP nicht verfügbar machen</li>
                    <li>• Keine Archivierung</li>
                    <li>• NPD falsch verwenden</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">✅ Richtig</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Eindeutige DoP-Nr. (Jahr + Nummer)</li>
                    <li>• Aktuelle ITT-Berichte verwenden</li>
                    <li>• Korrekte EN 13813 Bezeichnung</li>
                    <li>• Rechtsgültige Unterschrift</li>
                    <li>• DoP online verfügbar</li>
                    <li>• 10 Jahre Archivierung</li>
                    <li>• NPD nur bei nicht deklarierten Werten</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Beispiel DoP */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Beispiel einer vollständigen DoP</h2>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle>Muster-Leistungserklärung</CardTitle>
                <CardDescription>DoP-Nr.: 001-2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded border space-y-4 font-mono text-sm">
                  <div>
                    <strong>LEISTUNGSERKLÄRUNG</strong><br />
                    Nr. 001-2025
                  </div>
                  <div>
                    <strong>1. Eindeutiger Kenncode:</strong><br />
                    CT-C30-F5-2025
                  </div>
                  <div>
                    <strong>2. Verwendungszweck:</strong><br />
                    Zementestrich zur Verwendung in Gebäuden gemäß EN 13813
                  </div>
                  <div>
                    <strong>3. Hersteller:</strong><br />
                    Musterfirma GmbH<br />
                    Musterstraße 123<br />
                    12345 Musterstadt<br />
                    Tel: +49 123 456789
                  </div>
                  <div>
                    <strong>4. Bevollmächtigter:</strong><br />
                    Nicht zutreffend
                  </div>
                  <div>
                    <strong>5. System AVCP:</strong><br />
                    System 4
                  </div>
                  <div>
                    <strong>6. Harmonisierte Norm:</strong><br />
                    EN 13813:2002
                  </div>
                  <div>
                    <strong>7. Erklärte Leistung:</strong><br />
                    <table className="w-full border mt-2">
                      <tr>
                        <td className="border px-2 py-1">Brandverhalten</td>
                        <td className="border px-2 py-1">A1fl</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Druckfestigkeit</td>
                        <td className="border px-2 py-1">C30</td>
                      </tr>
                      <tr>
                        <td className="border px-2 py-1">Biegezugfestigkeit</td>
                        <td className="border px-2 py-1">F5</td>
                      </tr>
                    </table>
                  </div>
                  <div className="pt-4 border-t">
                    Die Leistung entspricht der erklärten Leistung.<br />
                    Verantwortlich: Max Mustermann, Geschäftsführer<br />
                    Musterstadt, 15.01.2025<br />
                    <br />
                    _______________________<br />
                    (Unterschrift)
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4 flex gap-4">
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Als Word-Vorlage
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Als PDF
              </Button>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Häufige Fragen zur DoP-Erstellung</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Muss ich für jede Rezeptur eine eigene DoP erstellen?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Ja, grundsätzlich benötigt jede Rezeptur mit unterschiedlichen Eigenschaften eine eigene DoP.
                    Sie können jedoch ähnliche Produkte in Produktfamilien zusammenfassen, wenn die schlechtesten
                    Werte für alle Produkte der Familie deklariert werden.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Wie oft muss ich die DoP aktualisieren?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Die DoP muss aktualisiert werden bei: Rezepturänderungen, neuen ITT-Prüfungen,
                    Änderungen der Norm, Änderungen der Firmendaten. Empfehlung: Jährliche Überprüfung.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">In welcher Sprache muss die DoP verfasst sein?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Die DoP muss in der Sprache des Mitgliedstaats verfasst sein, in dem das Produkt
                    bereitgestellt wird. Für Deutschland: Deutsch. Für internationale Lieferungen
                    empfiehlt sich zusätzlich eine englische Version.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Was bedeutet NPD?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    NPD steht für "No Performance Determined" (keine Leistung festgelegt).
                    Dies wird verwendet, wenn eine Eigenschaft nicht geprüft wurde und nicht deklariert wird.
                    Wichtig: Wesentliche Merkmale dürfen nicht mit NPD angegeben werden.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </article>

      {/* CTA */}
      <section className="px-6 py-16 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold mb-4">DoP in 5 Minuten statt 4 Stunden</h2>
          <p className="text-lg text-purple-100 mb-8">
            Mit dem EstrichManager DoP-Generator erstellen Sie rechtssichere Leistungserklärungen
            in wenigen Minuten. Automatische Prüfung, Versionierung und Archivierung inklusive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">DoP-Generator Demo<ArrowRight className="ml-2 h-4 w-4" /></Link>
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
          <h2 className="text-2xl font-bold mb-6">Verwandte Themen</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/wissen/ce-kennzeichnung">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <Shield className="h-6 w-6 text-green-600 mb-2" />
                  <CardTitle className="text-lg">CE-Kennzeichnung</CardTitle>
                  <CardDescription>Schritt für Schritt zur CE-Kennzeichnung</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/wissen/en-13813">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">EN 13813</CardTitle>
                  <CardDescription>Die Norm im Detail erklärt</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/wissen/itt-management">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <Edit className="h-6 w-6 text-purple-600 mb-2" />
                  <CardTitle className="text-lg">ITT-Prüfung</CardTitle>
                  <CardDescription>Erstprüfung richtig durchführen</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}