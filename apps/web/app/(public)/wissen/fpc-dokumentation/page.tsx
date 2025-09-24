import { Metadata } from "next"
import Link from "next/link"
import { ClipboardCheck, CheckCircle, AlertCircle, Download, Clock, BookOpen, ChevronRight, ArrowRight, Calendar, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "FPC (Werkseigene Produktionskontrolle) für Estrich nach EN 13813 | EstrichManager",
  description: "FPC System für Estrichwerke aufbauen ✓ Prüfpläne ✓ Prüffrequenzen ✓ Dokumentation ✓ EN 13813 konform. Komplette Anleitung zur werkseigenen Produktionskontrolle.",
  keywords: ["FPC", "werkseigene Produktionskontrolle", "Factory Production Control", "FPC Estrich", "FPC EN 13813", "Produktionskontrolle Estrich", "FPC Dokumentation"],
  openGraph: {
    title: "FPC - Werkseigene Produktionskontrolle für Estrichwerke",
    description: "Bauen Sie ein normkonformes FPC-System nach EN 13813 auf. Mit Prüfplänen, Checklisten und Vorlagen.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/fpc-dokumentation",
  },
}

export default function FPCDokumentationPage() {
  const prueffrequenzen = [
    { pruefung: "Rohstoffkontrolle", frequenz: "Bei jeder Lieferung", norm: "EN 13813" },
    { pruefung: "Druckfestigkeit", frequenz: "1x wöchentlich", norm: "EN 13892-2" },
    { pruefung: "Biegezugfestigkeit", frequenz: "1x monatlich", norm: "EN 13892-2" },
    { pruefung: "Konsistenz", frequenz: "Täglich", norm: "Werksstandard" },
    { pruefung: "Verschleißwiderstand", frequenz: "Bei Bedarf", norm: "EN 13892-3" },
    { pruefung: "Kalibrierung Waage", frequenz: "Jährlich", norm: "DIN EN ISO 9001" },
  ]

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li><Link href="/wissen" className="text-gray-500 hover:text-gray-700">Wissen</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">FPC-Dokumentation</li>
          </ol>
        </div>
      </nav>

      <section className="px-6 py-16 lg:px-8 border-b">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-orange-100 text-orange-800">Qualitätssicherung • EN 13813 konform</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Werkseigene Produktionskontrolle (FPC) für Estrichwerke
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Der komplette Leitfaden zum Aufbau eines normkonformen FPC-Systems nach EN 13813.
            Mit Prüfplänen, Frequenzen und Dokumentationsvorlagen.
          </p>
        </div>
      </section>

      <article className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <section className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold mb-6">Was ist FPC?</h2>
            <p className="text-lg text-gray-700">
              Die <strong>werkseigene Produktionskontrolle (FPC)</strong> ist ein verpflichtendes Qualitätssicherungssystem
              für alle Estrichwerke, die Produkte nach EN 13813 herstellen. Es stellt sicher, dass die deklarierten
              Leistungen dauerhaft eingehalten werden.
            </p>

            <Alert className="my-6">
              <ClipboardCheck className="h-4 w-4" />
              <AlertTitle>Gesetzliche Pflicht</AlertTitle>
              <AlertDescription>
                Ohne dokumentiertes FPC-System dürfen Sie keine CE-Kennzeichnung anbringen und somit
                Ihre Produkte nicht in der EU in Verkehr bringen.
              </AlertDescription>
            </Alert>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Prüfplan und Frequenzen</h2>
            <Card>
              <CardHeader>
                <CardTitle>Mindest-Prüffrequenzen nach EN 13813</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-4 py-2 text-left">Prüfung</th>
                      <th className="border px-4 py-2 text-left">Frequenz</th>
                      <th className="border px-4 py-2 text-left">Norm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prueffrequenzen.map((item) => (
                      <tr key={item.pruefung}>
                        <td className="border px-4 py-2">{item.pruefung}</td>
                        <td className="border px-4 py-2 font-medium">{item.frequenz}</td>
                        <td className="border px-4 py-2 text-gray-600">{item.norm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Die 5 Säulen eines FPC-Systems</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>1. Prüfplanung</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Prüfplan erstellen</li>
                    <li>• Verantwortlichkeiten festlegen</li>
                    <li>• Prüfmittel bereitstellen</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle>2. Durchführung</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Probenahme nach Norm</li>
                    <li>• Prüfungen durchführen</li>
                    <li>• Ergebnisse bewerten</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ClipboardCheck className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle>3. Dokumentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Prüfprotokolle führen</li>
                    <li>• Abweichungen dokumentieren</li>
                    <li>• Chargenrückverfolgbarkeit</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
                  <CardTitle>4. Auswertung</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Statistische Auswertung</li>
                    <li>• Trendanalysen</li>
                    <li>• Konformitätsbewertung</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>5. Korrekturmaßnahmen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-gray-700">
                  <li>• Sofortmaßnahmen bei Abweichungen</li>
                  <li>• Ursachenanalyse durchführen</li>
                  <li>• Wirksamkeit überprüfen</li>
                  <li>• Prozesse anpassen</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Downloads & Vorlagen</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                FPC-Handbuch Vorlage
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Prüfplan Excel
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Prüfprotokoll Muster
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Checkliste FPC-Audit
              </Button>
            </div>
          </section>
        </div>
      </article>

      <section className="px-6 py-16 lg:px-8 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">FPC-Dokumentation automatisieren</h2>
          <p className="text-lg text-orange-100 mb-8">
            Mit EstrichManager erfüllen Sie alle FPC-Anforderungen digital. Automatische Prüferinnerungen,
            digitale Protokolle und lückenlose Dokumentation.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">FPC-System Demo<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
