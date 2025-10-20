import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Thermometer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Normklima 23°C Estrichprüfung - EN 13892 Anforderungen",
  description: "Normklima 23°C ± 2°C und 50% ± 5% r.F. bei Estrichprüfung. Warum so wichtig? EN 13892 Standards.",
  keywords: ["Normklima 23°C", "Estrich Prüfbedingungen", "EN 13892 Klima", "23 Grad Prüfung"],
  alternates: { canonical: "https://estrichmanager.de/wissen/normklima-23-grad-estrich-pruefung" }
}

export default function NormklimaPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Badge className="mb-4 bg-orange-600"><Thermometer className="mr-1.5 h-3.5 w-3.5" /> Normklima</Badge>
          <h1 className="text-4xl font-bold mb-6">Normklima 23°C bei Estrich-Prüfung: EN 13892 Anforderungen</h1>
          <p className="text-xl text-gray-600 mb-8">
            EN 13892 schreibt Normklima vor: 23°C ± 2°C Temperatur und 50% ± 5% relative Luftfeuchte. 
            Abweichungen verfälschen Festigkeitswerte erheblich.
          </p>
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="font-bold mb-2">Warum genau 23°C?</h3>
            <p className="text-gray-700">
              Bei 23°C läuft die Zementhydratation optimal und reproduzierbar ab. 
              Höhere Temperaturen beschleunigen die Erhärtung, niedrigere verlangsamen sie. 
              Für vergleichbare Ergebnisse weltweit ist ein einheitlicher Standard nötig.
            </p>
          </div>
        </div>
      </section>
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Software testen <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
