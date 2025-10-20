import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "EN 13872 Schwindmaß Estrich - Dimensionsstabilität Bestimmung",
  description: "EN 13872 Schwindmaß-Bestimmung bei Estrich. Dimensionsstabilität für große Flächen wichtig.",
  keywords: ["EN 13872", "Schwindmaß Estrich", "Dimensionsstabilität", "Estrich Schwinden"],
  alternates: { canonical: "https://estrichmanager.de/wissen/en-13872-schwindmass-estrich-bestimmung" }
}

export default function EN13872Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-12 lg:px-8"><div className="mx-auto max-w-4xl">
        <Badge className="mb-4">EN 13872</Badge>
        <h1 className="text-4xl font-bold mb-6">EN 13872: Schwindmaß-Bestimmung bei Estrich</h1>
        <p className="text-xl text-gray-600">Prüfung der Dimensionsstabilität. Bei großen Flächen {'>'}500m² empfohlen.</p>
      </div></section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Software <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
