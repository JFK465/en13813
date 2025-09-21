"use client"

import { ArrowRight, CheckCircle2, Shield, FileCheck, TrendingUp, Clock, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"

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
      title: "Zeitersparnis bis zu 80%",
      description: "Reduzieren Sie den Dokumentationsaufwand drastisch durch intelligente Automatisierung"
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
    "Integrierte Prüfprotokolle",
    "Chargenrückverfolgung",
    "Digitale Unterschriften",
    "Export in alle gängigen Formate"
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
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            EN 13813 Compliance
            <br />
            Digital. Einfach. Sicher.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            Die intelligente Lösung für Estrichhersteller: Automatisierte Leistungserklärungen, 
            Rezepturverwaltung und vollständige EN 13813 Konformität - alles in einer Plattform.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/register">
                Jetzt kostenlos starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">
                Anmelden
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

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
              Warum EN 13813 Compliance Platform?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Transformieren Sie Ihre Estrich-Dokumentation in einen Wettbewerbsvorteil
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

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Bereit für digitale Compliance?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Starten Sie noch heute und erleben Sie, wie einfach EN 13813 Konformität sein kann.
            Keine Kreditkarte erforderlich.
          </p>
          <div className="mt-10">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/register">
                Kostenlos registrieren
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>
    </main>
  )
}