import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, AlertTriangle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Druckfestigkeit C25 nicht erreicht - Lösungen nach EN 13892-2",
  description: "Was tun wenn Druckfestigkeit C25 nicht erreicht wird? Ursachen, Lösungen und Nachprüfung nach EN 13892-2. CAPA-Maßnahmen.",
  keywords: ["Druckfestigkeit nicht erreicht", "C25 zu niedrig", "EN 13892-2 Problemlösung", "Festigkeit Abweichung"],
  alternates: { canonical: "https://estrichmanager.de/wissen/druckfestigkeit-c25-nicht-erreicht" }
}

export default function DruckfestigkeitProblemPage() {
  const ursachen = [
    { ursache: "Zu viel Wasser", loesung: "W/Z-Wert prüfen und reduzieren" },
    { ursache: "Falsche Lagerung", loesung: "Normklima 23°C, 50% r.F. einhalten" },
    { ursache: "Zu frühes Prüfen", loesung: "28 Tage Prüfalter abwarten" },
    { ursache: "Zementqualität", loesung: "Zementlieferant wechseln, CEM I verwenden" },
    { ursache: "Verdichtung mangelhaft", loesung: "Prüfkörper besser verdichten" }
  ]

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b bg-gray-50"><div className="mx-auto max-w-7xl px-6 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          <li><Link href="/" className="text-gray-500">Home</Link></li>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <li><Link href="/wissen" className="text-gray-500">Wissen</Link></li>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <li className="text-gray-900">Druckfestigkeit Problem</li>
        </ol></div>
      </nav>

      <section className="border-b bg-gradient-to-b from-red-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Badge variant="destructive" className="mb-4">Problem-Lösung</Badge>
          <h1 className="text-4xl font-bold mb-6">Druckfestigkeit C25 nicht erreicht: Was tun nach EN 13892-2?</h1>
          <p className="text-xl text-gray-600">
            Wenn die Prüfung zeigt, dass C25 nicht erreicht wird, müssen Sie schnell handeln. 
            Dieser Guide zeigt Ursachen und Lösungen.
          </p>
        </div>
      </section>

      <section className="px-6 py-8 lg:px-8 bg-red-50 border-b">
        <div className="mx-auto max-w-4xl">
          <Alert className="bg-white border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-lg font-semibold">Sofortmaßnahmen</AlertTitle>
            <AlertDescription className="mt-3">
              <ol className="list-decimal list-inside space-y-1">
                <li>Produktion stoppen - keine weitere Auslieferung</li>
                <li>Rezeptur überprüfen (W/Z-Wert, Zementgehalt)</li>
                <li>Nachprüfung mit neuen Prüfkörpern durchführen</li>
                <li>CAPA-Maßnahme dokumentieren (EN 13813 § 6.3)</li>
              </ol>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Häufige Ursachen und Lösungen</h2>
          <div className="space-y-4">
            {ursachen.map((item, i) => (
              <Card key={i} className="border-l-4 border-l-orange-500">
                <CardHeader><CardTitle className="text-lg">{item.ursache}</CardTitle></CardHeader>
                <CardContent><p className="text-gray-700">✓ {item.loesung}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Automatische Abweichungs-Verwaltung</h2>
          <p className="text-lg mb-8">EstrichManager trackt alle Prüfergebnisse und erstellt automatisch CAPA-Berichte bei Abweichungen.</p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Demo ansehen <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Druckfestigkeit C25 nicht erreicht - Lösungen",
          "author": { "@type": "Organization", "name": "EstrichManager" },
          "datePublished": "2025-01-14"
        })
      }} />
    </main>
  )
}
