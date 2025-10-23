import { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, ArrowRight, ChevronRight, Hammer, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "EN 13892-2 Zementestrich - Festigkeitsprüfung Anleitung 2025",
  description: "EN 13892-2 Festigkeitsprüfung für Zementestrich Schritt-für-Schritt. Druckfestigkeit und Biegezugfestigkeit richtig prüfen. 28 Tage Prüfalter, Normklima.",
  keywords: ["EN 13892-2 Zementestrich", "Druckfestigkeit CT", "Biegezugfestigkeit Zementestrich", "Festigkeitsprüfung Estrich"],
  openGraph: {
    title: "EN 13892-2 Zementestrich - Festigkeitsprüfung richtig durchführen",
    description: "Schritt-für-Schritt Anleitung zur Festigkeitsprüfung von Zementestrich nach EN 13892-2. Mit Prüfschritten und Normklima-Anforderungen.",
    type: "article",
  },
  alternates: { canonical: "https://estrichmanager.de/wissen/en-13892-2-zementestrich-festigkeit" }
}

export default function EN13892ZementestrichPage() {
  const pruefschritte = [
    { schritt: "1. Probenahme", beschreibung: "Frischmörtel nach EN 13892-1 entnehmen", dauer: "10 Min" },
    { schritt: "2. Prüfkörper herstellen", beschreibung: "40x40x160mm Balken oder Würfel herstellen", dauer: "30 Min" },
    { schritt: "3. Lagerung", beschreibung: "28 Tage bei 23°C ± 2°C, 50% ± 5% r.F.", dauer: "28 Tage" },
    { schritt: "4. Biegezugprüfung", beschreibung: "Balken im 3-Punkt-Biegeversuch prüfen", dauer: "30 Min" },
    { schritt: "5. Druckprüfung", beschreibung: "Bruchstücke auf Druckfestigkeit prüfen", dauer: "20 Min" },
    { schritt: "6. Auswertung", beschreibung: "Mittelwerte berechnen, Klasse zuordnen", dauer: "15 Min" }
  ]

  const faqs = [
    {
      frage: "Warum 28 Tage Prüfalter?",
      antwort: "Zementestrich erreicht seine Endfestigkeit erst nach etwa 28 Tagen. Dies ist das normative Prüfalter nach EN 13892-2. Frühere Prüfungen sind möglich, aber nicht für die Klassifizierung maßgeblich."
    },
    {
      frage: "Wie viele Prüfkörper brauche ich?",
      antwort: "Für die ITT: 6 Prüfkörper für Biegezug (= 3 Balken) und 12 für Druckfestigkeit (aus den Bruchstücken). Für FPC reichen oft 3 Prüfkörper."
    },
    {
      frage: "Was passiert bei Abweichung vom Normklima?",
      antwort: "Temperatur und Luftfeuchte müssen 23°C ± 2°C und 50% ± 5% r.F. betragen. Abweichungen verfälschen die Festigkeitswerte erheblich und machen die Prüfung ungültig."
    }
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
            <li><Link href="/wissen/en-13892-reihe" className="text-gray-500 hover:text-gray-700">EN 13892</Link></li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 font-medium">EN 13892-2 Zementestrich</li>
          </ol>
        </div>
      </nav>

      <section className="border-b bg-gradient-to-b from-blue-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 mb-4">
            <Hammer className="mr-1.5 h-3.5 w-3.5" />
            EN 13892-2
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            EN 13892-2 für Zementestrich: Festigkeitsprüfung Schritt-für-Schritt
          </h1>
          <p className="text-xl text-gray-600">
            Die EN 13892-2 regelt die Prüfung von Biege- und Druckfestigkeit bei Estrich.
            Dieser Guide zeigt die korrekte Durchführung für Zementestrich.
          </p>
        </div>
      </section>

      <section className="px-6 py-8 lg:px-8 bg-blue-50 border-b">
        <div className="mx-auto max-w-4xl">
          <Alert className="bg-white border-blue-200">
            <Clock className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-lg font-semibold text-blue-900">Schnellübersicht</AlertTitle>
            <AlertDescription className="mt-3 text-gray-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Prüfalter:</strong> 28 Tage bei Normklima (23°C, 50% r.F.)</li>
                <li><strong>Prüfkörper:</strong> 40x40x160mm Balken oder 40mm Würfel</li>
                <li><strong>Erst Biegezug, dann Druck:</strong> Bruchstücke nutzen</li>
                <li><strong>Mittelwert:</strong> Aus 6 Einzelwerten bilden</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Prüfablauf Schritt-für-Schritt</h2>
          <div className="space-y-4">
            {pruefschritte.map((schritt, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{schritt.schritt}</CardTitle>
                    <Badge variant="outline">{schritt.dauer}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{schritt.beschreibung}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Häufige Fragen</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <span className="text-blue-600 font-bold">Q:</span>
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

      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prüfplanung automatisieren</h2>
          <p className="text-lg text-blue-100 mb-8">
            EstrichManager plant EN 13892-2 Prüfungen automatisch, trackt Prüfalter und erinnert rechtzeitig.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Demo ansehen <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "EN 13892-2 für Zementestrich: Festigkeitsprüfung",
          "author": { "@type": "Organization", "name": "EstrichManager" },
          "datePublished": "2025-01-14"
        })
      }} />
    </main>
  )
}
