import { Metadata } from 'next'
import { ArrowRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ModernFeaturesHero } from "@/components/features/ModernFeaturesHero"
import { FeatureTabs } from "@/components/features/FeatureTabs"
import { AdditionalFeatureCard } from "@/components/features/AdditionalFeatureCard"

// ISR - Funktionen ändern sich selten, monatliche Revalidierung reicht
export const revalidate = 2592000 // 30 Tage

export const metadata: Metadata = {
  title: 'Funktionen - EstrichManager | Alle Features für EN 13813 Compliance',
  description: 'Umfassende Funktionen für Estrichwerke: Rezepturverwaltung, DoP-Erstellung, CE-Kennzeichnung, FPC-Dokumentation, Chargenrückverfolgung und mehr.',
  keywords: 'EstrichManager Funktionen, EN 13813 Software Features, DoP Generator, CE-Kennzeichnung Tool, FPC Software, ITT Management',
  openGraph: {
    title: 'EstrichManager Funktionen - Digitales Qualitätsmanagement',
    description: 'Alle Funktionen für EN 13813 konforme Dokumentation und Qualitätsmanagement in Estrichwerken.',
    type: 'website',
    locale: 'de_DE',
    url: 'https://estrichmanager.de/funktionen',
  },
  alternates: {
    canonical: 'https://estrichmanager.de/funktionen'
  }
}

const featureCategories = [
  {
    id: "recipes",
    title: "Rezepturverwaltung",
    icon: "FlaskConical",
    description: "Zentrale Verwaltung aller Estrich-Rezepturen mit Versionskontrolle",
    features: [
      {
        title: "Rezepturdatenbank",
        description: "Zentrale Speicherung aller Rezepturen mit Such- und Filterfunktionen",
        icon: "FileText",
      },
      {
        title: "Versionsverwaltung",
        description: "Automatische Versionierung bei Änderungen mit vollständiger Historie",
        icon: "Shield",
      },
      {
        title: "Normbezeichnung",
        description: "Automatische Generierung der EN 13813 konformen Bezeichnungen",
        icon: "CheckCircle",
      },
      {
        title: "Materialverwaltung",
        description: "Verwaltung aller Rohstoffe mit Lieferantendaten und Zertifikaten",
        icon: "Package",
      },
      {
        title: "Rezeptur-Kalkulation",
        description: "Automatische Berechnung von Mischungsverhältnissen und Eigenschaften",
        icon: "BarChart3",
      },
      {
        title: "Import/Export",
        description: "Excel-Import und Export für einfache Datenmigration",
        icon: "Download",
      },
    ]
  },
  {
    id: "production",
    title: "Produktion & Chargen",
    icon: "Package",
    description: "Lückenlose Dokumentation der Produktion mit Chargenrückverfolgung",
    features: [
      {
        title: "Chargenverwaltung",
        description: "Eindeutige Chargennummern mit vollständiger Produktionsdokumentation",
        icon: "Package",
      },
      {
        title: "QR-Code Generator",
        description: "Automatische QR-Code Erstellung für Lieferscheine und Etiketten",
        icon: "QrCode",
      },
      {
        title: "Produktionsstatistik",
        description: "Echtzeitübersicht über Produktionsmengen und Auslastung",
        icon: "BarChart3",
      },
      {
        title: "Lieferscheine",
        description: "Digitale Lieferscheine mit CE-Kennzeichnung und DoP-Referenz",
        icon: "Truck",
      },
      {
        title: "Rückverfolgbarkeit",
        description: "Sekundenschnelle Rückverfolgung bei Reklamationen",
        icon: "Shield",
      },
      {
        title: "Chargenfreigabe",
        description: "Digitaler Freigabeworkflow mit Vier-Augen-Prinzip",
        icon: "CheckCircle",
      },
    ]
  },
  {
    id: "testing",
    title: "Prüfungen & Tests",
    icon: "FlaskConical",
    description: "ITT und FPC Prüfungen nach EN 13813 mit automatischer Auswertung",
    features: [
      {
        title: "ITT Management",
        description: "Verwaltung aller Erstprüfungen mit Zertifikaten",
        icon: "ClipboardCheck",
      },
      {
        title: "FPC Protokolle",
        description: "Digitale FPC-Protokolle mit automatischer Konformitätsbewertung",
        icon: "FileText",
      },
      {
        title: "Prüfplanung",
        description: "Automatische Erinnerungen für anstehende Prüfungen",
        icon: "ClipboardCheck",
      },
      {
        title: "Statistische Auswertung",
        description: "Automatische statistische Bewertung nach EN 13813",
        icon: "BarChart3",
      },
      {
        title: "Trendanalyse",
        description: "Frühwarnsystem bei Abweichungen vom Sollwert",
        icon: "AlertTriangle",
      },
      {
        title: "Prüfmittelverwaltung",
        description: "Kalibrierungsmanagement für Prüfgeräte",
        icon: "Shield",
      },
    ]
  },
  {
    id: "compliance",
    title: "Compliance & DoP",
    icon: "Shield",
    description: "Rechtssichere Dokumentation und automatische DoP-Erstellung",
    features: [
      {
        title: "DoP Generator",
        description: "Automatische Erstellung von Leistungserklärungen in 5 Minuten",
        icon: "FileText",
      },
      {
        title: "CE-Kennzeichnung",
        description: "Konforme CE-Etiketten mit allen Pflichtangaben",
        icon: "Shield",
      },
      {
        title: "Audit-Management",
        description: "Vorbereitung und Dokumentation interner und externer Audits",
        icon: "ClipboardCheck",
      },
      {
        title: "Abweichungsmanagement",
        description: "CAPA-System für Korrektur- und Vorbeugemaßnahmen",
        icon: "AlertTriangle",
      },
      {
        title: "Dokumentenlenkung",
        description: "Versionierte Dokumente mit Freigabeworkflow",
        icon: "FileText",
      },
      {
        title: "Compliance-Dashboard",
        description: "Übersicht aller compliance-relevanten Kennzahlen",
        icon: "BarChart3",
      },
    ]
  },
]

const additionalFeatures = [
  {
    icon: "Users",
    title: "Multi-User & Rechteverwaltung",
    description: "Rollenbasierte Zugriffsrechte für Teams jeder Größe"
  },
  {
    icon: "Cloud",
    title: "Cloud-basiert & Sicher",
    description: "DSGVO-konforme Datenspeicherung in deutschen Rechenzentren"
  },
  {
    icon: "Zap",
    title: "Echtzeitdaten",
    description: "Alle Änderungen sofort für alle Nutzer sichtbar"
  },
  {
    icon: "Download",
    title: "Export & Schnittstellen",
    description: "PDF, Excel, CSV Export und API-Anbindung möglich"
  },
  {
    icon: "Lock",
    title: "Revisionssicherheit",
    description: "Unveränderliche Audit-Logs für alle kritischen Aktionen"
  },
  {
    icon: "Shield",
    title: "Automatische Backups",
    description: "Tägliche Backups mit 30 Tage Wiederherstellung"
  },
]

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-neutral-950">
      {/* Modern Hero with Spotlight */}
      <ModernFeaturesHero />

      {/* Feature Categories with Tabs - Client Component */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
              Funktionen im Detail
            </h2>
            <p className="mt-4 text-xl text-neutral-400">
              Wählen Sie einen Bereich, um mehr zu erfahren
            </p>
          </div>

          <FeatureTabs categories={featureCategories} />
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
              Weitere Vorteile
            </h2>
            <p className="mt-4 text-xl text-neutral-400">
              EstrichManager bietet noch mehr für Ihren Arbeitsalltag
            </p>
          </div>

          {/* Mobile-optimized Grid: 1 col mobile, 2 tablet, 3 desktop */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {additionalFeatures.map((feature) => (
              <AdditionalFeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="relative px-6 py-20 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="relative bg-white/[0.02] border border-white/[0.1] rounded-3xl p-12 text-white backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-6">
                Nahtlose Integration in Ihre Prozesse
              </h2>
              <p className="text-lg text-neutral-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                EstrichManager fügt sich perfekt in Ihre bestehenden Arbeitsabläufe ein.
                Import aus Excel, Export als PDF, API-Schnittstellen - alles ist möglich.
              </p>

              {/* Mobile-optimized Integration Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left max-w-5xl mx-auto">
                <div className="bg-white/[0.05] border border-white/[0.1] backdrop-blur rounded-2xl p-6 hover:bg-white/[0.08] transition-all">
                  <h3 className="font-semibold mb-3 text-lg text-white">Excel Import</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Übernehmen Sie Ihre bestehenden Rezepturen und Daten einfach per Excel-Import
                  </p>
                </div>
                <div className="bg-white/[0.05] border border-white/[0.1] backdrop-blur rounded-2xl p-6 hover:bg-white/[0.08] transition-all">
                  <h3 className="font-semibold mb-3 text-lg text-white">PDF Export</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Alle Dokumente als professionelle PDFs für Kunden und Behörden
                  </p>
                </div>
                <div className="bg-white/[0.05] border border-white/[0.1] backdrop-blur rounded-2xl p-6 hover:bg-white/[0.08] transition-all">
                  <h3 className="font-semibold mb-3 text-lg text-white">API Zugang</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Verbinden Sie EstrichManager mit Ihrer ERP-Software (Enterprise)
                  </p>
                </div>
              </div>

              <Button asChild size="lg" className="mt-10 h-14 px-8 text-base w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/kontakt">
                  Integration besprechen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-24 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
            Bereit für effizientes Qualitätsmanagement?
          </h2>
          <p className="mt-6 text-xl text-neutral-300 leading-relaxed">
            Starten Sie noch heute und erleben Sie, wie einfach EN 13813 Compliance sein kann
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-base w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20">
              <Link href="/register">
                Jetzt kostenlos starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base w-full sm:w-auto border-white/[0.2] text-white hover:bg-white/[0.1]">
              <Link href="/preise">
                Preise ansehen
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}