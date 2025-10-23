import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Magnesiaestrich EN 13892-6 - Oberflächenhärte Steinholz MA",
  description: "EN 13892-6 Oberflächenhärteprüfung für Magnesiaestrich (Steinholz). Shore-Härte, SH-Klassen.",
  keywords: ["Magnesiaestrich Oberflächenhärte", "EN 13892-6 MA", "Steinholzestrich Härte"],
  openGraph: {
    title: "EN 13892-6 Oberflächenhärte - Magnesiaestrich prüfen",
    description: "Oberflächenhärteprüfung für Magnesiaestrich (Steinholz) nach EN 13892-6. Shore-Härte und SH-Klassen erklärt.",
    type: "article",
  },
  alternates: { canonical: "https://estrichmanager.de/wissen/magnesiaestrich-en-13892-6-oberflaechenhaerte" }
}

export default function MagnesiaOberflaechePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b bg-gradient-to-b from-yellow-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Badge className="mb-4 bg-yellow-600">MA - Magnesiaestrich</Badge>
          <h1 className="text-4xl font-bold mb-6">Magnesiaestrich-Prüfung: EN 13892-6 Oberflächenhärte</h1>
          <p className="text-xl text-gray-600">
            Oberflächenhärte ist Pflicht bei MA-Estrichen. EN 13892-6 Shore-/Brinell-Härte. SH40-SH100.
          </p>
        </div>
      </section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-yellow-600 to-orange-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">MA-Estrich Software</h2>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Testen <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
