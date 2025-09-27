import { Metadata } from 'next'
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            EN 13813 konform
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Alle Funktionen für perfekte{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Compliance
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            EstrichManager bietet alle Werkzeuge, die Sie für ein effizientes
            Qualitätsmanagement nach EN 13813 benötigen. Von der Rezeptur bis zur
            fertigen Leistungserklärung.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/register">
                14 Tage kostenlos testen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/demo">
                Live-Demo ansehen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Categories with Tabs - Client Component */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Funktionen im Detail
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Wählen Sie einen Bereich, um mehr zu erfahren
            </p>
          </div>

          <FeatureTabs categories={featureCategories} />
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="px-6 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Weitere Vorteile
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              EstrichManager bietet noch mehr für Ihren Arbeitsalltag
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {additionalFeatures.map((feature) => {
              return (
                <AdditionalFeatureCard key={feature.title} feature={feature} />
              )
            })}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                Nahtlose Integration in Ihre Prozesse
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
                EstrichManager fügt sich perfekt in Ihre bestehenden Arbeitsabläufe ein.
                Import aus Excel, Export als PDF, API-Schnittstellen - alles ist möglich.
              </p>

              <div className="grid gap-4 md:grid-cols-3 text-left max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Excel Import</h3>
                  <p className="text-sm text-blue-100">
                    Übernehmen Sie Ihre bestehenden Rezepturen und Daten einfach per Excel-Import
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h3 className="font-semibold mb-2">PDF Export</h3>
                  <p className="text-sm text-blue-100">
                    Alle Dokumente als professionelle PDFs für Kunden und Behörden
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <h3 className="font-semibold mb-2">API Zugang</h3>
                  <p className="text-sm text-blue-100">
                    Verbinden Sie EstrichManager mit Ihrer ERP-Software (Enterprise)
                  </p>
                </div>
              </div>

              <Button asChild size="lg" variant="secondary" className="mt-8">
                <Link href="/kontakt">
                  Integration besprechen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Bereit für effizientes Qualitätsmanagement?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Starten Sie noch heute und erleben Sie, wie einfach EN 13813 Compliance sein kann
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/register">
                Jetzt kostenlos starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/preise">
                Preise ansehen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}