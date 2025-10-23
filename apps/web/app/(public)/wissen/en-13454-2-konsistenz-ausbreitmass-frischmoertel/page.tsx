import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "EN 13454-2 Konsistenz Ausbreitmaß - Frischmörtel Estrich",
  description: "EN 13454-2 Konsistenz und Ausbreitmaß bei Estrich-Frischmörtel. Fließmaß-Prüfung.",
  keywords: ["EN 13454-2", "Ausbreitmaß Estrich", "Konsistenz Frischmörtel", "Fließmaß"],
  openGraph: {
    title: "EN 13454-2 Konsistenz & Ausbreitmaß - Frischmörtel prüfen",
    description: "Konsistenz und Ausbreitmaß von Estrich-Frischmörtel nach EN 13454-2 bestimmen. Fließmaß-Prüfung Schritt-für-Schritt.",
    type: "article",
  },
  alternates: { canonical: "https://estrichmanager.de/wissen/en-13454-2-konsistenz-ausbreitmass-frischmoertel" }
}

export default function EN13454Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-12 lg:px-8"><div className="mx-auto max-w-4xl">
        <Badge className="mb-4">EN 13454-2</Badge>
        <h1 className="text-4xl font-bold mb-6">EN 13454-2: Konsistenz und Ausbreitmaß bei Frischmörtel</h1>
        <p className="text-xl text-gray-600">Prüfung der Konsistenz von frischem Estrichmörtel. Fließmaß-Test.</p>
      </div></section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Demo <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
