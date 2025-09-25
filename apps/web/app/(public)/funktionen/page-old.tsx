"use client"

import {
  FileText,
  FlaskConical,
  Package,
  ClipboardCheck,
  Shield,
  BarChart3,
  Truck,
  AlertTriangle,
  QrCode,
  Download,
  Users,
  Lock,
  Cloud,
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { motion } from "framer-motion"

export default function FeaturesPage() {
  const featureCategories = [
    {
      id: "recipes",
      title: "Rezepturverwaltung",
      icon: FlaskConical,
      description: "Zentrale Verwaltung aller Estrich-Rezepturen mit Versionskontrolle",
      features: [
        {
          title: "Rezepturdatenbank",
          description: "Zentrale Speicherung aller Rezepturen mit Such- und Filterfunktionen",
          icon: FileText,
        },
        {
          title: "Versionsverwaltung",
          description: "Automatische Versionierung bei Änderungen mit vollständiger Historie",
          icon: Shield,
        },
        {
          title: "Normbezeichnung",
          description: "Automatische Generierung der EN 13813 konformen Bezeichnungen",
          icon: CheckCircle,
        },
        {
          title: "Materialverwaltung",
          description: "Verwaltung von Rohstoffen, Zusatzmitteln und deren Eigenschaften",
          icon: Package,
        },
      ],
      benefits: [
        "Keine veralteten Excel-Tabellen mehr",
        "Fehlerfreie Normbezeichnungen",
        "Schneller Zugriff auf alle Rezepturen",
        "Nachvollziehbare Änderungshistorie",
      ],
    },
    {
      id: "dop",
      title: "Leistungserklärungen",
      icon: FileText,
      description: "Erstellen Sie rechtssichere DoPs in wenigen Minuten",
      features: [
        {
          title: "DoP-Generator",
          description: "Automatische Erstellung von Leistungserklärungen nach EN 13813",
          icon: Zap,
        },
        {
          title: "CE-Kennzeichnung",
          description: "Konforme CE-Kennzeichnung mit allen erforderlichen Angaben",
          icon: Shield,
        },
        {
          title: "Mehrsprachigkeit",
          description: "DoPs in mehreren Sprachen für internationale Märkte",
          icon: Users,
        },
        {
          title: "PDF-Export",
          description: "Professionelle PDFs mit Ihrem Corporate Design",
          icon: Download,
        },
      ],
      benefits: [
        "5 Minuten statt 4 Stunden pro DoP",
        "Immer rechtskonform",
        "Einheitliches Design",
        "Digitale Archivierung",
      ],
    },
    {
      id: "quality",
      title: "Qualitätskontrolle",
      icon: ClipboardCheck,
      description: "Lückenlose Dokumentation für ITT und FPC",
      features: [
        {
          title: "ITT-Management",
          description: "Verwaltung der Erstprüfungen mit allen Prüfparametern",
          icon: ClipboardCheck,
        },
        {
          title: "FPC-System",
          description: "Werkseigene Produktionskontrolle nach Norm",
          icon: BarChart3,
        },
        {
          title: "Prüfprotokolle",
          description: "Digitale Erfassung und Auswertung aller Prüfungen",
          icon: FileText,
        },
        {
          title: "Kalibrierung",
          description: "Verwaltung und Erinnerung für Gerätekalibrierungen",
          icon: Shield,
        },
      ],
      benefits: [
        "Audit-ready jederzeit",
        "Automatische Prüfintervalle",
        "Statistische Auswertungen",
        "Normkonforme Dokumentation",
      ],
    },
    {
      id: "production",
      title: "Produktion & Logistik",
      icon: Package,
      description: "Von der Charge bis zur Lieferung alles im Griff",
      features: [
        {
          title: "Chargenverwaltung",
          description: "Lückenlose Rückverfolgbarkeit jeder produzierten Charge",
          icon: Package,
        },
        {
          title: "QR-Code System",
          description: "Eindeutige Identifikation mit QR-Codes auf Lieferscheinen",
          icon: QrCode,
        },
        {
          title: "Lieferscheine",
          description: "Digitale Lieferscheine mit allen relevanten Daten",
          icon: Truck,
        },
        {
          title: "Lagerbestand",
          description: "Übersicht über Rohstoffe und fertige Produkte",
          icon: Package,
        },
      ],
      benefits: [
        "Sofortige Chargenrückverfolgung",
        "Digitale Lieferdokumentation",
        "Transparente Lagerbestände",
        "Schnelle Reklamationsbearbeitung",
      ],
    },
    {
      id: "compliance",
      title: "Compliance & Audit",
      icon: Shield,
      description: "Immer bereit für Audits und Zertifizierungen",
      features: [
        {
          title: "CAPA-Management",
          description: "Systematische Abweichungs- und Maßnahmenverwaltung",
          icon: AlertTriangle,
        },
        {
          title: "Audit-Trail",
          description: "Vollständige Dokumentation aller Änderungen",
          icon: Shield,
        },
        {
          title: "Berichtswesen",
          description: "Automatisierte Reports für Management und Behörden",
          icon: BarChart3,
        },
        {
          title: "Dokumentenlenkung",
          description: "Verwaltung aller qualitätsrelevanten Dokumente",
          icon: FileText,
        },
      ],
      benefits: [
        "Jederzeit audit-ready",
        "Lückenlose Dokumentation",
        "Schnelle Berichtserstellung",
        "Systematisches Qualitätsmanagement",
      ],
    },
    {
      id: "tech",
      title: "Technik & Sicherheit",
      icon: Lock,
      description: "Modernste Technologie mit höchsten Sicherheitsstandards",
      features: [
        {
          title: "Cloud-Hosting",
          description: "Sicheres Hosting in deutschen Rechenzentren",
          icon: Cloud,
        },
        {
          title: "Datensicherheit",
          description: "Ende-zu-Ende-Verschlüsselung und tägliche Backups",
          icon: Lock,
        },
        {
          title: "Multi-Tenancy",
          description: "Strikte Datentrennung zwischen Mandanten",
          icon: Users,
        },
        {
          title: "API-Zugang",
          description: "Offene Schnittstellen für Integrationen (Enterprise)",
          icon: Zap,
        },
      ],
      benefits: [
        "DSGVO-konform",
        "99.9% Verfügbarkeit",
        "Automatische Backups",
        "Zugriff von überall",
      ],
    },
  ]

  const integrations = [
    { name: "PDF Export", description: "Alle Dokumente als PDF" },
    { name: "Excel Export", description: "Daten in Excel exportieren" },
    { name: "XML Schnittstelle", description: "Datenaustausch via XML" },
    { name: "QR-Code Generator", description: "Für Chargen und Produkte" },
    { name: "E-Mail Integration", description: "Automatische Benachrichtigungen" },
    { name: "Digitale Signatur", description: "Rechtssichere Unterschriften" },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
          >
            Alle Funktionen für Ihr Estrichwerk
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            EstrichManager bietet Ihnen alle Werkzeuge für effizientes Qualitätsmanagement
            und EN 13813 Compliance in einer einzigen Plattform.
          </motion.p>
        </div>
      </section>

      {/* Feature Categories Tabs */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Tabs defaultValue="recipes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-12">
              {featureCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col sm:flex-row items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {featureCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Category Header */}
                  <div className="text-center">
                    <category.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">{category.title}</h2>
                    <p className="text-lg text-gray-600">{category.description}</p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {category.features.map((feature) => (
                      <Card key={feature.title}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <feature.icon className="h-5 w-5 text-blue-600" />
                            {feature.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{feature.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Benefits */}
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader>
                      <CardTitle>Ihre Vorteile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {category.benefits.map((benefit) => (
                          <div key={benefit} className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Integrations */}
      <section className="px-6 py-24 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Nahtlose Integrationen</h2>
            <p className="mt-4 text-lg text-gray-600">
              EstrichManager arbeitet perfekt mit Ihren bestehenden Systemen zusammen
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile & Desktop */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">
                Arbeiten Sie von überall
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                EstrichManager läuft auf allen Geräten - ob im Büro am Desktop,
                unterwegs auf dem Tablet oder vor Ort mit dem Smartphone.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Responsive Design für alle Bildschirmgrößen</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Offline-fähig für Arbeit ohne Internet</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Automatische Synchronisation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Touch-optimierte Bedienung</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Package className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Geräte-Mockup</p>
                </div>
              </div>
              <Badge className="absolute -top-2 -right-2 bg-green-600">
                Neu: Mobile App
              </Badge>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold">
            Erleben Sie EstrichManager in Aktion
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Überzeugen Sie sich selbst von der Leistungsfähigkeit unserer Lösung.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">
                14 Tage kostenlos testen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white/20"
            >
              <Link href="/kontakt">
                Live-Demo anfragen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}