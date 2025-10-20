import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "28 Tage Prüfalter bei Estrich - EN 13892-2 erklärt | Warum?",
  description: "Warum 28 Tage Prüfalter nach EN 13892-2? Hydratation, Festigkeitsentwicklung Zement. Kann man früher prüfen?",
  keywords: ["28 Tage Prüfalter", "Prüfalter Estrich", "EN 13892-2 Wartezeit", "Festigkeitsentwicklung"],
  alternates: { canonical: "https://estrichmanager.de/wissen/prueffalter-28-tage-en-13892-2" }
}

export default function Pruefalt28TPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b bg-gradient-to-b from-blue-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Badge className="mb-4 bg-blue-600"><Clock className="mr-1.5 h-3.5 w-3.5" /> Prüfalter</Badge>
          <h1 className="text-4xl font-bold mb-6">Prüfalter 28 Tage: Warum ist das nach EN 13892-2 wichtig?</h1>
          <p className="text-xl text-gray-600">
            28 Tage sind das normative Prüfalter für Zementestrich. Grund: Zement erreicht seine 
            Endfestigkeit erst nach etwa 4 Wochen durch Hydratation.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Festigkeitsentwicklung über Zeit:</h3>
            <ul className="space-y-2">
              <li>• <strong>7 Tage:</strong> ~70% der Endfestigkeit</li>
              <li>• <strong>14 Tage:</strong> ~85% der Endfestigkeit</li>
              <li>• <strong>28 Tage:</strong> ~95% der Endfestigkeit (normativ)</li>
              <li>• <strong>90 Tage:</strong> ~100% der Endfestigkeit</li>
            </ul>
            <p className="mt-4 text-sm text-gray-700">
              Frühere Prüfungen sind möglich, aber nur die 28-Tage-Festigkeit zählt für die Klassifizierung.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prüfalter automatisch tracken</h2>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Demo <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
