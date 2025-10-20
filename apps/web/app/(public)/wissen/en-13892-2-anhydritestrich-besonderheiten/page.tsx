import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "EN 13892-2 Anhydritestrich - Besonderheiten CA-Estrich Prüfung",
  description: "EN 13892-2 Besonderheiten bei Anhydrit/Calciumsulfatestrich. Längere Trocknungszeit, höhere Festigkeit.",
  keywords: ["Anhydritestrich EN 13892-2", "CA-Estrich Besonderheiten", "Calciumsulfat Festigkeit"],
  alternates: { canonical: "https://estrichmanager.de/wissen/en-13892-2-anhydritestrich-besonderheiten" }
}

export default function AnhydritBesonderheitenPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b bg-gray-50"><div className="mx-auto max-w-7xl px-6 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          <li><Link href="/" className="text-gray-500">Home</Link></li>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <li className="text-gray-900">CA Besonderheiten</li>
        </ol></div>
      </nav>
      <section className="px-6 py-12 lg:px-8"><div className="mx-auto max-w-4xl">
        <Badge className="mb-4 bg-green-600">CA-Estrich</Badge>
        <h1 className="text-4xl font-bold mb-6">EN 13892-2 bei Anhydritestrich: Besonderheiten</h1>
        <p className="text-xl text-gray-600 mb-8">CA-Estrich erreicht oft C30-C35. Längere Trockenzeit beachten.</p>
        <div className="bg-green-50 p-6 rounded-lg"><h3 className="font-bold mb-2">Besonderheiten:</h3>
          <ul className="space-y-2"><li>✓ Höhere Festigkeiten als CT möglich</li>
          <li>✓ Empfindlich gegen Feuchtigkeit vor Prüfung</li>
          <li>✓ 28 Tage Prüfalter wie bei CT</li></ul>
        </div>
      </div></section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Software testen <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
