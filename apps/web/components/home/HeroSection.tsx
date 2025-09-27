"use client"

import { motion } from "framer-motion"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
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
              Jetzt Beta-Zugang sichern
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">
              Anmelden
            </Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-4 text-sm text-gray-500"
        >
          Beta-Phase: Kostenloser Zugang für Early Adopters • Voller Funktionsumfang • Persönlicher Support
        </motion.p>
      </div>
    </section>
  )
}