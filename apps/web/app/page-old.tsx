"use client"

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
import { motion } from "framer-motion"

export default function HomePage() {
  // Konkrete Probleme und Lösungen
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

  // EN 13813 Fachbegriffe
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
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl" />

        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Entwickelt von Estrich-Experten für Estrich-Experten
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EstrichManager
            </span>
            <br />
            <span className="text-3xl sm:text-4xl text-gray-700">
              Schluss mit Excel-Chaos und Papierbergen
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            Die Qualitätsmanagement-Software, die Estrichwerke wirklich brauchen.
            Erstellen Sie EN 13813 konforme Leistungserklärungen in Minuten statt Stunden.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
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
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-4 text-sm text-gray-500"
          >
            Keine Kreditkarte erforderlich • Voller Funktionsumfang • Persönlicher Support
          </motion.p>
        </div>
      </motion.section>

      {/* Konkrete Probleme & Lösungen */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Kennen Sie diese Probleme?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              EstrichManager löst die täglichen Herausforderungen in Ihrem Estrichwerk
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {painPoints.map((point, index) => (
              <motion.div
                key={point.problem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <point.icon className="h-8 w-8 text-red-500" />
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Typische Fehlerquellen vermeiden */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Vermeiden Sie teure Fehler
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              EstrichManager verhindert die häufigsten Compliance-Fallen automatisch
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {commonMistakes.map((item, index) => (
              <motion.div
                key={item.mistake}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <item.icon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  ❌ {item.mistake}
                </h3>
                <p className="text-green-600 font-medium">
                  ✓ {item.prevention}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EN 13813 Expertise */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
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
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {normKnowledge.map((item, index) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors"
              >
                <h4 className="font-mono font-bold text-blue-600 mb-2">{item.term}</h4>
                <p className="text-sm text-gray-600">{item.explanation}</p>
              </motion.div>
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

      {/* Benefits Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Warum EstrichManager?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Die professionelle Lösung für digitales Qualitätsmanagement in Estrichwerken
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <benefit.icon className="h-10 w-10 text-blue-600 mb-4" />
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12">
              Alle Funktionen für Ihre Compliance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-left">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Datenschutz & Sicherheit</h3>
              <p className="text-gray-600">
                DSGVO-konform, verschlüsselte Übertragung, tägliche Backups.
                Ihre Daten sind bei uns sicher - gehostet in Deutschland.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <Headphones className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Persönlicher Support</h3>
              <p className="text-gray-600">
                Direkter Draht zu unseren Estrich-Experten.
                Wir sprechen Ihre Sprache und kennen Ihre Herausforderungen.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Von Praktikern für Praktiker</h3>
              <p className="text-gray-600">
                Entwickelt in Zusammenarbeit mit Estrichwerken.
                Praxiserprobt und kontinuierlich weiterentwickelt.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600"
      >
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
      </motion.section>
    </main>
  )
}