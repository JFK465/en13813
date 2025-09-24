import { Metadata } from "next"
import Link from "next/link"
import { FlaskConical, CheckCircle, AlertCircle, FileText, Clock, ChevronRight, ArrowRight, Euro } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "ITT (Erstprüfung) für Estrich nach EN 13813 - Anleitung & Kosten | EstrichManager",
  description: "ITT Erstprüfung für Estrich durchführen ✓ Initial Type Testing ✓ Prüflabore ✓ Kosten ✓ Ablauf. Alles zur Erstprüfung nach EN 13813 für Estrichwerke.",
  keywords: ["ITT", "Erstprüfung", "Initial Type Testing", "ITT Estrich", "ITT EN 13813", "Erstprüfung Estrich", "ITT Kosten", "ITT Labor"],
  openGraph: {
    title: "ITT Erstprüfung für Estrich - Initial Type Testing Guide",
    description: "Kompletter Leitfaden zur ITT-Erstprüfung nach EN 13813. Mit Laboren, Kosten und Ablauf.",
    type: "article",
  },
  alternates: {
    canonical: "https://estrichmanager.de/wissen/itt-management",
  },
}

export default function ITTManagementPage() {
  const pruefumfang = [
    { eigenschaft: "Druckfestigkeit", norm: "EN 13892-2", kosten: "150-200€", dauer: "28 Tage" },
    { eigenschaft: "Biegezugfestigkeit", norm: "EN 13892-2", kosten: "150-200€", dauer: "28 Tage" },
    { eigenschaft: "Brandverhalten", norm: "EN 13501-1", kosten: "500-800€", dauer: "14 Tage" },
    { eigenschaft: "Verschleißwiderstand", norm: "EN 13892-3", kosten: "300-400€", dauer: "7 Tage" },
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
            <li className="text-gray-900 font-medium">ITT Management</li>
          </ol>
        </div>
      </nav>

      <section className="px-6 py-16 lg:px-8 border-b">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-red-100 text-red-800">Erstprüfung • Pflicht vor CE</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            ITT - Erstprüfung für Estrich nach EN 13813
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Alles zur Initial Type Testing (ITT) für Estrichwerke. Prüfumfang, akkreditierte Labore,
            Kosten und Ablauf der Erstprüfung.
          </p>
        </div>
      </section>

      <article className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <section className="prose prose-lg max-w-none mb-12">
            <h2 className="text-3xl font-bold mb-6">Was ist ITT?</h2>
            <p className="text-lg text-gray-700">
              <strong>ITT (Initial Type Testing)</strong> ist die verpflichtende Erstprüfung, die vor dem erstmaligen
              Inverkehrbringen eines Estrichprodukts durchgeführt werden muss. Sie bildet die Grundlage für die
              Leistungserklärung (DoP) und CE-Kennzeichnung.
            </p>

            <Alert className="my-6">
              <FlaskConical className="h-4 w-4" />
              <AlertTitle>Wichtig</AlertTitle>
              <AlertDescription>
                Ohne gültige ITT-Prüfung keine CE-Kennzeichnung möglich! Die ITT muss durch ein
                akkreditiertes Prüflabor nach EN ISO/IEC 17025 durchgeführt werden.
              </AlertDescription>
            </Alert>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Prüfumfang und Kosten</h2>
            <Card>
              <CardHeader>
                <CardTitle>Typischer ITT-Prüfumfang für Zementestrich</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-4 py-2 text-left">Eigenschaft</th>
                      <th className="border px-4 py-2 text-left">Norm</th>
                      <th className="border px-4 py-2 text-left">Kosten</th>
                      <th className="border px-4 py-2 text-left">Dauer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pruefumfang.map((item) => (
                      <tr key={item.eigenschaft}>
                        <td className="border px-4 py-2">{item.eigenschaft}</td>
                        <td className="border px-4 py-2">{item.norm}</td>
                        <td className="border px-4 py-2 font-medium">{item.kosten}</td>
                        <td className="border px-4 py-2">{item.dauer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <p className="font-semibold">Gesamtkosten: ca. 1.100 - 1.600 € pro Rezeptur</p>
                  <p className="text-sm text-gray-600 mt-1">Gesamtdauer: ca. 4-6 Wochen</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Ablauf der ITT-Prüfung</h2>
            <div className="space-y-4">
              <Card className="border-l-4 border-blue-600">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <CardTitle>Laborauswahl</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Akkreditiertes Prüflabor nach EN ISO/IEC 17025 auswählen und Angebot einholen.</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-blue-600">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <CardTitle>Probenherstellung</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Prüfkörper nach Norm herstellen (meist im Labor oder unter Aufsicht).</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-blue-600">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <CardTitle>Prüfung</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Durchführung aller relevanten Prüfungen nach harmonisierten Normen.</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-blue-600">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <CardTitle>Prüfbericht</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Erhalt des akkreditierten Prüfberichts als Grundlage für DoP und CE.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Wann ist eine neue ITT erforderlich?</h2>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Eine neue ITT ist erforderlich bei: Rezepturänderung, neuen Rohstoffen,
                geändertem Herstellverfahren, Erweiterung der deklarierten Eigenschaften.
              </AlertDescription>
            </Alert>
          </section>
        </div>
      </article>

      <section className="px-6 py-16 lg:px-8 bg-gradient-to-r from-red-600 to-pink-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">ITT-Management digitalisieren</h2>
          <p className="text-lg text-red-100 mb-8">
            Mit EstrichManager verwalten Sie alle ITT-Prüfungen digital. Erinnerungen bei Rezepturänderungen,
            Archivierung aller Berichte und automatische DoP-Generierung.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">ITT-Verwaltung Demo<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
