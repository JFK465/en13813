import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "EN 12570 Feuchtegehalt Estrich - Bestimmung Feuchtigkeit",
  description: "EN 12570 Feuchtegehalts-Bestimmung bei Estrich. Wichtig bei Heizestrich und vor Bodenbelag.",
  keywords: ["EN 12570", "Feuchtegehalt Estrich", "Estrich Feuchtigkeit", "Feuchtemessung"],
  alternates: { canonical: "https://estrichmanager.de/wissen/en-12570-feuchtegehalt-estrich-bestimmung" }
}

export default function EN12570Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-12 lg:px-8"><div className="mx-auto max-w-4xl">
        <Badge className="mb-4">EN 12570</Badge>
        <h1 className="text-4xl font-bold mb-6">EN 12570: Bestimmung des Feuchtegehalts bei Estrich</h1>
        <p className="text-xl text-gray-600">Feuchtemessung bei Heizestrich und vor Bodenbelag-Verlegung.</p>
      </div></section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Testen <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
