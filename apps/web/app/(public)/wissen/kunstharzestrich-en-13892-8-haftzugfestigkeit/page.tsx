import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Kunstharzestrich EN 13892-8 - Haftzugfestigkeit Prüfung SR",
  description: "EN 13892-8 Haftzugfestigkeitsprüfung für Kunstharzestrich (SR). Abreißverfahren, B-Klassen, Prüfanleitung.",
  keywords: ["Kunstharzestrich Haftzugfestigkeit", "EN 13892-8 SR", "Reaktionsharzestrich Prüfung"],
  openGraph: {
    title: "EN 13892-8 Haftzugfestigkeit - Kunstharzestrich richtig prüfen",
    description: "Haftzugfestigkeitsprüfung für Kunstharzestrich nach EN 13892-8. Abreißverfahren und B-Klassen-Zuordnung erklärt.",
    type: "article",
  },
  alternates: { canonical: "https://estrichmanager.de/wissen/kunstharzestrich-en-13892-8-haftzugfestigkeit" }
}

export default function KunstharzHaftzugPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b bg-gray-50"><div className="mx-auto max-w-7xl px-6 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          <li><Link href="/" className="text-gray-500">Home</Link></li>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <li className="text-gray-900 font-medium">SR Haftzugfestigkeit</li>
        </ol></div>
      </nav>
      <section className="border-b bg-gradient-to-b from-purple-50 to-white px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Badge className="mb-4 bg-purple-600">SR - Kunstharzestrich</Badge>
          <h1 className="text-4xl font-bold mb-6">Kunstharzestrich-Prüfung: EN 13892-8 Haftzugfestigkeit</h1>
          <p className="text-xl text-gray-600">
            Haftzugfestigkeit ist kritisch bei SR-Estrichen. EN 13892-8 Abreißverfahren. B-Klassen: B0.5 bis B2.5.
          </p>
        </div>
      </section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">SR-Estrich normkonform dokumentieren</h2>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Demo <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
