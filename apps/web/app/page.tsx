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
  BookOpen,
  Lock,
  Headphones,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ModernHeroSection } from "@/components/home/ModernHeroSection"
import { TrustPlatformFeatures } from "@/components/home/TrustPlatformFeatures"
import { EstrichDiscoveryGrid } from "@/components/home/EstrichDiscoveryGrid"
import { EstrichProblemSolutionGrid } from "@/components/home/EstrichProblemSolutionGrid"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"

// ISR - Seite wird alle 24 Stunden neu generiert für aktuelle Inhalte
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'EstrichManager - EN 13813 Qualitätsmanagement für Estrichwerke',
  description: 'Digitales Qualitätsmanagement für Estrichwerke. Erstellen Sie EN 13813 konforme Leistungserklärungen (DoP) in Minuten. CE-Kennzeichnung, FPC-Dokumentation und Chargenrückverfolgung.',
  keywords: 'EN 13813, Estrich, Leistungserklärung, DoP, CE-Kennzeichnung, Qualitätsmanagement, Estrichwerk, FPC, ITT, Compliance, Estrichmörtel, Zementestrich, Calciumsulfatestrich',
  openGraph: {
    title: 'EstrichManager - Digitales Qualitätsmanagement für Estrichwerke',
    description: 'EN 13813 konforme Leistungserklärungen in Minuten statt Stunden erstellen. Kostenlose Beta-Testphase.',
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
    <main className="min-h-screen">
      {/* Modern Hero Section with Spotlight Effect */}
      <ModernHeroSection />

      {/* Trust Platform Features - Die digitale Qualitätsmanagement-Plattform */}
      <TrustPlatformFeatures />

      {/* Kennen Sie diese Probleme? - Problem/Solution Comparison Grid */}
      <EstrichProblemSolutionGrid />

      {/* EN 13813 Expertise - Server Component für SEO */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 mb-4">
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

          {/* Mobile-optimized Grid: 1 col mobile, 2 tablet, 4 desktop */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {normKnowledge.map((item) => (
              <div
                key={item.term}
                className="bg-gray-50 rounded-lg p-5 sm:p-4 hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all min-h-[100px] flex flex-col justify-between"
              >
                <h4 className="font-mono font-bold text-orange-600 mb-2 text-base sm:text-sm">{item.term}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-600 rounded-2xl p-8 sm:p-12 text-white text-center shadow-xl">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold mb-4">
              Vertiefen Sie Ihr EN 13813 Wissen
            </h3>
            <p className="mb-6 text-blue-100 text-base sm:text-lg max-w-2xl mx-auto">
              Entdecken Sie unseren umfassenden Wissens-Hub mit praktischen Anleitungen
            </p>
            <Button asChild size="lg" className="h-14 px-8 text-base w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600">
              <Link href="/wissen/en-13813">
                Zum EN 13813 Guide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section - Modern Card Grid with Hover Effects */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" />
              Ihre Vorteile
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Warum EstrichManager?
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Die professionelle Lösung für digitales Qualitätsmanagement in Estrichwerken
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon
              const isHighlight = i === 0 || i === 3
              return (
                <div
                  key={benefit.title}
                  className={`group relative bg-white border-2 ${
                    isHighlight ? 'border-orange-200' : 'border-gray-200'
                  } rounded-2xl p-8 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
                >
                  {/* Icon Container */}
                  <div className={`w-14 h-14 rounded-xl ${
                    isHighlight ? 'bg-orange-500' : 'bg-blue-600'
                  } flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Hover Indicator */}
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                    isHighlight ? 'bg-orange-500' : 'bg-blue-600'
                  } opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features List - Server Component für SEO */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
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

      {/* Discovery Grid - Explore EstrichManager Features */}
      <EstrichDiscoveryGrid />

      {/* CTA Section - Server Component für SEO */}
      <section className="py-24 px-6 lg:px-8 bg-blue-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Überzeugen Sie sich selbst
          </h2>
          <p className="mt-4 text-lg text-blue-50">
            Kostenlose Beta-Phase • Keine Kreditkarte • Voller Support
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link href="/beta">
                Jetzt kostenlos Beta-Zugang sichern
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
              <Link href="/kontakt">
                Beratungsgespräch vereinbaren
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-blue-100">
            Oder testen Sie sofort unseren Demo-Zugang: demo@example.com / demo
          </p>
        </div>
      </section>

      {/* Schema.org Structured Data für SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "EstrichManager",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR",
              "description": "Kostenlose Beta-Phase - Aktuell keine Kosten"
            },
            "description": "Digitales Qualitätsmanagement für Estrichwerke. EN 13813 konforme Leistungserklärungen in Minuten erstellen.",
            "url": "https://estrichmanager.de",
            "publisher": {
              "@type": "Organization",
              "name": "EstrichManager",
              "url": "https://estrichmanager.de",
              "logo": {
                "@type": "ImageObject",
                "url": "https://estrichmanager.de/logo.png"
              }
            }
          })
        }}
      />
    </main>
  )
}