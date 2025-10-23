import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Steinholzestrich EN 13813 - MA Prüfanforderungen Magnesia",
  description: "Steinholzestrich (Magnesiaestrich) Prüfanforderungen. MA-C30-F5-SH80, Oberflächenhärte Pflicht.",
  keywords: ["Steinholzestrich", "Magnesiaestrich Prüfung", "MA-Estrich EN 13813"],
  openGraph: {
    title: "Steinholzestrich EN 13813 - Prüfanforderungen für MA-Estrich",
    description: "Alle Prüfanforderungen für Steinholzestrich (Magnesiaestrich) nach EN 13813. MA-C30-F5-SH80 Bezeichnung und Oberflächenhärte.",
    type: "article",
  },
  alternates: { canonical: "https://estrichmanager.de/wissen/steinholzestrich-en-13813-pruefanforderungen" }
}

export default function SteinholzPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-12 lg:px-8"><div className="mx-auto max-w-4xl">
        <Badge className="mb-4 bg-yellow-600">Steinholzestrich (MA)</Badge>
        <h1 className="text-4xl font-bold mb-6">Steinholzestrich nach EN 13813: Spezielle Prüfanforderungen</h1>
        <p className="text-xl text-gray-600">MA-Estriche benötigen zusätzlich EN 13892-6 Oberflächenhärte. SH-Klassen 40-100.</p>
      </div></section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-yellow-600 to-orange-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Software ansehen <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
