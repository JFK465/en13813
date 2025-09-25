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
  CheckSquare,
  BookOpen,
  Download,
  Lock,
  Headphones,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { HeroSection } from "@/components/home/HeroSection"
import { PainPointsSection } from "@/components/home/PainPointsSection"

// ISR - Seite wird alle 24 Stunden neu generiert für aktuelle Inhalte
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'EstrichManager - EN 13813 Qualitätsmanagement für Estrichwerke',
  description: 'Digitales Qualitätsmanagement für Estrichwerke. Erstellen Sie EN 13813 konforme Leistungserklärungen (DoP) in Minuten. CE-Kennzeichnung, FPC-Dokumentation und Chargenrückverfolgung.',
  keywords: 'EN 13813, Estrich, Leistungserklärung, DoP, CE-Kennzeichnung, Qualitätsmanagement, Estrichwerk, FPC, ITT, Compliance, Estrichmörtel, Zementestrich, Calciumsulfatestrich',
  openGraph: {
    title: 'EstrichManager - Digitales Qualitätsmanagement für Estrichwerke',
    description: 'EN 13813 konforme Leistungserklärungen in Minuten statt Stunden erstellen. 14 Tage kostenlos testen.',
    type: 'website',
    locale: 'de_DE',
    url: 'https://estrichmanager.de',
    siteName: 'EstrichManager',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'EstrichManager - Qualitätsmanagement für Estrichwerke'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EstrichManager - EN 13813 Qualitätsmanagement',
    description: 'Digitale Leistungserklärungen für Estrichwerke in Minuten erstellen',
    images: ['/og-image.jpg']
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

export default function HomePage() {
  // Typische Fehlerquellen
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section mit Animationen - Client Component */}
      <HeroSection />

      {/* Konkrete Probleme & Lösungen - Client Component mit Animationen */}
      <PainPointsSection />

      {/* Typische Fehlerquellen vermeiden - Server Component für SEO */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Vermeiden Sie teure Fehler
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              EstrichManager verhindert die häufigsten Compliance-Fallen automatisch
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {commonMistakes.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.mistake}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Icon className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ❌ {item.mistake}
                  </h3>
                  <p className="text-green-600 font-medium">
                    ✓ {item.prevention}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* EN 13813 Expertise - Server Component für SEO */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 mb-4">
              <BookOpen className="mr-2 h-4 w-4" />
              EN 13813:2002 Fachwissen integriert
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Sprechen Sie EN 13813?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Wir kennen die Norm in- und auswendig - und haben sie in EstrichManager eingebaut
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {normKnowledge.map((item) => (
              <div
                key={item.term}
                className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors"
              >
                <h4 className="font-mono font-bold text-blue-600 mb-2">{item.term}</h4>
                <p className="text-sm text-gray-600">{item.explanation}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <Download className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">
              Kostenlose EN 13813 Compliance-Checkliste
            </h3>
            <p className="mb-6 text-blue-100">
              Überprüfen Sie Ihre aktuelle Dokumentation auf Vollständigkeit
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link href="/en13813-checkliste.pdf">
                Checkliste herunterladen
                <Download className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section - Server Component für SEO */}
      <section className="py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Warum EstrichManager?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Die professionelle Lösung für digitales Qualitätsmanagement in Estrichwerken
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <Card key={benefit.title} className="h-full hover:shadow-xl transition-shadow duration-300 border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <Icon className="h-10 w-10 text-blue-600 mb-4" />
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features List - Server Component für SEO */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12">
              Alle Funktionen für Ihre Compliance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-left">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Server Component für SEO */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="text-center">
              <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Datenschutz & Sicherheit</h3>
              <p className="text-gray-600">
                DSGVO-konform, verschlüsselte Übertragung, tägliche Backups.
                Ihre Daten sind bei uns sicher - gehostet in Deutschland.
              </p>
            </div>

            <div className="text-center">
              <Headphones className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Persönlicher Support</h3>
              <p className="text-gray-600">
                Direkter Draht zu unseren Estrich-Experten.
                Wir sprechen Ihre Sprache und kennen Ihre Herausforderungen.
              </p>
            </div>

            <div className="text-center">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Von Praktikern für Praktiker</h3>
              <p className="text-gray-600">
                Entwickelt in Zusammenarbeit mit Estrichwerken.
                Praxiserprobt und kontinuierlich weiterentwickelt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Server Component für SEO */}
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