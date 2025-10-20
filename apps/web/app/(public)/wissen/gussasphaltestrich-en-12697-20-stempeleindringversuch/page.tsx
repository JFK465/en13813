import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Gussasphaltestrich EN 12697-20 - Stempeleindringversuch AS",
  description: "EN 12697-20 Stempeleindringversuch für Gussasphaltestrich. AS-Estrich spezielle Prüfung.",
  keywords: ["Gussasphaltestrich", "EN 12697-20", "AS-Estrich Prüfung", "Stempeleindringversuch"],
  alternates: { canonical: "https://estrichmanager.de/wissen/gussasphaltestrich-en-12697-20-stempeleindringversuch" }
}

export default function GussasphaltPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-12 lg:px-8"><div className="mx-auto max-w-4xl">
        <Badge className="mb-4 bg-gray-700">AS - Gussasphalt</Badge>
        <h1 className="text-4xl font-bold mb-6">Gussasphaltestrich: EN 12697-20 Stempeleindringversuch</h1>
        <p className="text-xl text-gray-600">AS-Estrich hat spezielle Prüfverfahren. Stempeleindringversuch nach EN 12697-20.</p>
      </div></section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-gray-700 to-gray-900">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Jetzt testen <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
