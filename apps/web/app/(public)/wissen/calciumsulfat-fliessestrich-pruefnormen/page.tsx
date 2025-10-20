import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Calciumsulfat-Fließestrich Prüfnormen - CA-Estrich EN 13813",
  description: "Alle Prüfnormen für Calciumsulfat-Fließestrich (Anhydritestrich). CA-C25-F4 Anforderungen, EN 13892 Prüfungen, Besonderheiten.",
  keywords: ["Calciumsulfat Fließestrich", "Anhydritestrich Prüfung", "CA-Estrich EN 13813"],
  alternates: { canonical: "https://estrichmanager.de/wissen/calciumsulfat-fliessestrich-pruefnormen" }
}

export default function CalciumsulfatPruefnormenPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b bg-gray-50"><div className="mx-auto max-w-7xl px-6 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <li><Link href="/wissen" className="text-gray-500 hover:text-gray-700">Wissen</Link></li>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <li className="text-gray-900 font-medium">CA-Estrich Prüfnormen</li>
        </ol></div>
      </nav>
      <section className="border-b bg-gradient-to-b from-green-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Badge className="mb-4 bg-green-600">CA - Calciumsulfat</Badge>
          <h1 className="text-4xl font-bold mb-6">Calciumsulfat-Fließestrich: Prüfnormen nach EN 13813</h1>
          <p className="text-xl text-gray-600">
            CA-Estriche (Anhydritestriche) haben spezielle Anforderungen. Typische Klassen: CA-C25-F4 bis CA-C30-F5.
          </p>
        </div>
      </section>
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card><CardHeader><CardTitle>Pflichtprüfungen für CA-Estrich</CardTitle></CardHeader>
            <CardContent><ul className="space-y-2">
              <li>✅ EN 13892-1: Probenahme</li>
              <li>✅ EN 13892-2: Festigkeit (C25-C35 typisch)</li>
              <li>⚠️ EN 13892-3: Verschleiß (nur bei Nutzschicht)</li>
              <li>✅ A1fl Brandverhalten (ohne Prüfung)</li>
            </ul></CardContent>
          </Card>
        </div>
      </section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">CA-Estrich Rezepturen verwalten</h2>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Jetzt testen <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
