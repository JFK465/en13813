import { Metadata } from 'next'
import { Calculator, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PricingToggle } from "@/components/pricing/PricingToggle"

// ISR - Preise können sich ändern, daher täglich neu generieren
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Preise - EstrichManager | Transparente Preisgestaltung für Estrichwerke',
  description: 'Faire und transparente Preise für EstrichManager. Wählen Sie das passende Paket für Ihr Estrichwerk. 14 Tage kostenlos testen ohne Kreditkarte.',
  keywords: 'EstrichManager Preise, Estrich Software Kosten, Qualitätsmanagement Preise, EN 13813 Software',
  openGraph: {
    title: 'EstrichManager Preise - Faire Preise für Estrichwerke',
    description: 'Transparente Preisgestaltung ohne versteckte Kosten. 14 Tage kostenlos testen.',
    type: 'website',
    locale: 'de_DE',
    url: 'https://estrichmanager.de/preise',
  },
  alternates: {
    canonical: 'https://estrichmanager.de/preise'
  }
}

const plans = [
  {
    name: "Starter",
    description: "Für kleine Estrichwerke",
    monthlyPrice: 49,
    yearlyPrice: 490,
    users: "1-3 Nutzer",
    features: [
      "Rezepturverwaltung",
      "DoP-Erstellung",
      "CE-Kennzeichnung",
      "PDF-Export",
      "E-Mail Support",
      "Basis-Vorlagen",
    ],
    notIncluded: [
      "API-Zugang",
      "Mehrere Standorte",
      "Erweiterte Analysen",
      "Schulungen",
    ],
    cta: "Jetzt starten",
    popular: false,
  },
  {
    name: "Professional",
    description: "Für mittlere Betriebe",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    users: "4-20 Nutzer",
    features: [
      "Alle Starter Features",
      "Chargenrückverfolgung",
      "QR-Code Generator",
      "FPC & ITT Module",
      "Audit-Management",
      "Prioritäts-Support",
      "Erweiterte Vorlagen",
      "Mehrere Standorte",
    ],
    notIncluded: [
      "API-Zugang",
      "White-Label Option",
      "Dedizierter Account Manager",
    ],
    cta: "Professional wählen",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Für große Unternehmen",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    users: "Unbegrenzte Nutzer",
    features: [
      "Alle Professional Features",
      "API-Zugang",
      "White-Label Option",
      "Erweiterte Analysen",
      "Persönliche Schulungen",
      "Dedizierter Account Manager",
      "SLA-Garantie",
      "Individuelle Anpassungen",
      "Datenexport-Tools",
    ],
    notIncluded: [],
    cta: "Kontakt aufnehmen",
    popular: false,
  },
]

const faqs = [
  {
    question: "Kann ich EstrichManager kostenlos testen?",
    answer: "Ja, Sie können EstrichManager 14 Tage lang kostenlos und unverbindlich testen. Keine Kreditkarte erforderlich."
  },
  {
    question: "Was passiert nach der Testphase?",
    answer: "Nach Ablauf der 14-tägigen Testphase wird Ihr Konto automatisch auf den kostenlosen Lesezugriff umgestellt. Sie können jederzeit ein kostenpflichtiges Paket buchen."
  },
  {
    question: "Kann ich jederzeit kündigen?",
    answer: "Ja, bei monatlicher Zahlung können Sie jederzeit zum Monatsende kündigen. Bei jährlicher Zahlung endet Ihr Zugang nach Ablauf des Jahres."
  },
  {
    question: "Gibt es versteckte Kosten?",
    answer: "Nein, alle Kosten sind transparent aufgeführt. Es gibt keine Einrichtungsgebühren oder versteckte Zusatzkosten."
  },
  {
    question: "Kann ich zwischen den Paketen wechseln?",
    answer: "Ja, Sie können jederzeit zu einem höheren Paket wechseln. Ein Downgrade ist zum nächsten Abrechnungszeitraum möglich."
  },
  {
    question: "Gibt es Mengenrabatte?",
    answer: "Ja, für größere Teams und bei jährlicher Zahlung bieten wir attraktive Rabatte. Kontaktieren Sie uns für ein individuelles Angebot."
  }
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Transparente Preise für jedes Estrichwerk
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Wählen Sie das passende Paket für Ihre Anforderungen.
            Keine versteckten Kosten, keine Einrichtungsgebühren.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              14 Tage kostenlos testen
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Keine Kreditkarte erforderlich
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Jederzeit kündbar
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards with Toggle - Client Component */}
      <section className="px-6 pb-20 lg:px-8">
        <PricingToggle plans={plans} />
      </section>

      {/* Calculator Section */}
      <section className="px-6 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            ROI-Rechner
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Berechnen Sie Ihre Zeitersparnis mit EstrichManager
          </p>

          {/* Mobile-optimized ROI Grid */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">DoP-Erstellung</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">4h → 5min</p>
              <p className="text-sm text-gray-600 mt-2">Zeitersparnis pro Dokument</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">Chargenrückverfolgung</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">2h → 30s</p>
              <p className="text-sm text-gray-600 mt-2">Bei Reklamationen</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">Audit-Vorbereitung</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">3d → 1h</p>
              <p className="text-sm text-gray-600 mt-2">Dokumentation komplett</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-gray-900">
              Bei nur 5 DoPs pro Monat sparen Sie bereits über 19 Arbeitsstunden
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Das entspricht einer Ersparnis von ca. €760 bei einem Stundensatz von €40
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Häufige Fragen
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">
            Bereit für digitales Qualitätsmanagement?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Starten Sie noch heute Ihre kostenlose Testphase
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-base w-full sm:w-auto">
              <Link href="/register">
                14 Tage kostenlos testen
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white/20">
              <Link href="/kontakt">
                Beratungsgespräch vereinbaren
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}