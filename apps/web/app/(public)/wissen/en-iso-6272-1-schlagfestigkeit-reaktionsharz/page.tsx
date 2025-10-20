import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "EN ISO 6272-1 Schlagfestigkeit - Reaktionsharzestrich SR",
  description: "EN ISO 6272-1 Schlagfestigkeitsprüfung für Reaktionsharzestrich. Fallkörperverfahren.",
  keywords: ["EN ISO 6272-1", "Schlagfestigkeit Kunstharz", "Reaktionsharzestrich Prüfung"],
  alternates: { canonical: "https://estrichmanager.de/wissen/en-iso-6272-1-schlagfestigkeit-reaktionsharz" }
}

export default function SchlagfestigkeitPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-12 lg:px-8"><div className="mx-auto max-w-4xl">
        <Badge className="mb-4 bg-purple-600">EN ISO 6272-1</Badge>
        <h1 className="text-4xl font-bold mb-6">EN ISO 6272-1: Schlagfestigkeit bei Reaktionsharzestrich</h1>
        <p className="text-xl text-gray-600">Fallkörperprüfung für SR-Estriche bei besonderen Anforderungen.</p>
      </div></section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Demo <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
