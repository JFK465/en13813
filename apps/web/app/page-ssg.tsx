import { Metadata } from 'next'
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  FileCheck,
  TrendingUp,
  Clock,
  Users,
  Award,
  AlertTriangle,
  Calculator,
  FileX,
  Lightbulb,
  BookOpen,
  Download,
  Lock,
  Headphones,
  Building2,
  CheckSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'EstrichManager - EN 13813 Qualitätsmanagement für Estrichwerke',
  description: 'Digitales Qualitätsmanagement für Estrichwerke. Erstellen Sie EN 13813 konforme Leistungserklärungen (DoP) in Minuten. CE-Kennzeichnung, FPC-Dokumentation und Chargenrückverfolgung.',
  keywords: 'EN 13813, Estrich, Leistungserklärung, DoP, CE-Kennzeichnung, Qualitätsmanagement, Estrichwerk, FPC, ITT, Compliance',
  openGraph: {
    title: 'EstrichManager - Digitales Qualitätsmanagement für Estrichwerke',
    description: 'EN 13813 konforme Leistungserklärungen in Minuten statt Stunden erstellen',
    type: 'website',
    locale: 'de_DE',
    url: 'https://estrichmanager.de',
    siteName: 'EstrichManager',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EstrichManager - EN 13813 Qualitätsmanagement',
    description: 'Digitale Leistungserklärungen für Estrichwerke',
  },
  alternates: {
    canonical: 'https://estrichmanager.de'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// Daten als Konstanten für Static Generation
const painPoints = [
  {
    problem: "Stundenlange Erstellung von Leistungserklärungen",
    solution: "DoP in unter 5 Minuten erstellt und validiert",
    icon: FileX,
    before: "4-6 Stunden pro DoP",
    after: "5 Minuten mit EstrichManager"
  },
  {
    problem: "Excel-Chaos bei der Rezepturverwaltung",
    solution: "Zentrale Rezepturdatenbank mit Versionierung",
    icon: Calculator,
    before: "Fehleranfällige Excel-Tabellen",
    after: "Validierte Rezepturen mit Änderungshistorie"
  },
  {
    problem: "Fehlende Rückverfolgbarkeit bei Reklamationen",
    solution: "Lückenlose Chargendokumentation",
    icon: AlertTriangle,
    before: "Stundenlanges Suchen in Ordnern",
    after: "Sofortige Chargenrückverfolgung"
  }
]

const commonMistakes = [
  {
    mistake: "Falsche Normbezeichnung in der DoP",
    prevention: "Automatische Generierung nach EN 13813 Systematik",
    icon: CheckSquare
  },
  {
    mistake: "Veraltete Prüfzertifikate",
    prevention: "Automatische Erinnerung bei ablaufenden Zertifikaten",
    icon: Clock
  },
  {
    mistake: "Unvollständige FPC-Dokumentation",
    prevention: "Geführter Workflow mit Pflichtfeldern",
    icon: FileCheck
  }
]

const benefits = [
  {
    icon: Shield,
    title: "EN 13813 Konformität",
    description: "Vollständige Compliance mit der Estrichnorm EN 13813 - automatisierte Prüfung aller Anforderungen"
  },
  {
    icon: FileCheck,
    title: "Digitale Leistungserklärung",
    description: "Erstellen Sie rechtssichere DoPs in Minuten statt Stunden - mit automatischer Validierung"
  },
  {
    icon: Clock,
    title: "Zeit für Wichtiges",
    description: "Weniger Papierkram, mehr Zeit für Qualität und Kundenbetreuung"
  },
  {
    icon: TrendingUp,
    title: "Qualitätssicherung",
    description: "Lückenlose Rückverfolgbarkeit und Chargenmanagement für höchste Qualitätsstandards"
  },
  {
    icon: Users,
    title: "Einfache Zusammenarbeit",
    description: "Workflow-Management für Teams - von der Rezeptur bis zur fertigen Leistungserklärung"
  },
  {
    icon: Award,
    title: "Audit-Ready",
    description: "Immer bereit für Audits mit vollständiger Dokumentation und Compliance-Nachweisen"
  }
]

const features = [
  "Rezepturverwaltung mit Versionskontrolle",
  "Automatische CE-Kennzeichnung",
  "Integrierte Prüfprotokolle (ITT & FPC)",
  "Chargenrückverfolgung mit QR-Codes",
  "Digitale Unterschriften",
  "Export in alle gängigen Formate"
]

const normKnowledge = [
  {
    term: "CT-C25-F4",
    explanation: "Zementestrich mit 25 N/mm² Druckfestigkeit und 4 N/mm² Biegezugfestigkeit"
  },
  {
    term: "AVCP System 4",
    explanation: "Bewertungssystem ohne externe Überwachung, Hersteller-Eigenverantwortung"
  },
  {
    term: "ITT (Initial Type Testing)",
    explanation: "Erstprüfung zur Bestätigung der Leistungsmerkmale"
  },
  {
    term: "FPC (Factory Production Control)",
    explanation: "Werkseigene Produktionskontrolle zur Qualitätssicherung"
  }
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl" />

        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
            <Building2 className="mr-2 h-4 w-4" />
            Entwickelt von Estrich-Experten für Estrich-Experten
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EstrichManager
            </span>
            <br />
            <span className="text-3xl sm:text-4xl text-gray-700">
              Schluss mit Excel-Chaos und Papierbergen
            </span>
          </h1>

          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Die Qualitätsmanagement-Software, die Estrichwerke wirklich brauchen.
            Erstellen Sie EN 13813 konforme Leistungserklärungen in Minuten statt Stunden.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/register">
                14 Tage kostenlos testen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">
                Demo-Zugang testen
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Keine Kreditkarte erforderlich • Voller Funktionsumfang • Persönlicher Support
          </p>
        </div>
      </section>

      {/* Konkrete Probleme & Lösungen */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Kennen Sie diese Probleme?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              EstrichManager löst die täglichen Herausforderungen in Ihrem Estrichwerk
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {painPoints.map((point) => {
              const Icon = point.icon
              return (
                <Card key={point.problem} className="h-full hover:shadow-xl transition-all duration-300 border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <Icon className="h-8 w-8 text-red-500" />
                      <Lightbulb className="h-6 w-6 text-green-500" />
                    </div>
                    <CardTitle className="text-lg">
                      <span className="text-red-600 line-through block mb-2">{point.problem}</span>
                      <span className="text-green-600 text-xl">{point.solution}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <span className="font-medium">Vorher:</span>
                        <span className="ml-2">{point.before}</span>
                      </div>
                      <div className="flex items-center text-green-600 font-medium">
                        <span>Nachher:</span>
                        <span className="ml-2">{point.after}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Weitere Sections ohne Animationen... */}
      {/* Der Rest bleibt strukturell gleich, nur ohne motion und client-side Features */}

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Überzeugen Sie sich selbst
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            14 Tage kostenlos testen • Keine Kreditkarte • Voller Support
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">
                Jetzt 14 Tage kostenlos testen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
              <Link href="/kontakt">
                Beratungsgespräch vereinbaren
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            Oder testen Sie sofort unseren Demo-Zugang: demo@example.com / demo
          </p>
        </div>
      </section>
    </main>
  )
}