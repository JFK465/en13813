"use client"

import { motion } from "framer-motion"
import { ArrowRight, Building2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/animated-text"

export function ModernHeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 inline-flex items-center rounded-full border border-white/[0.2] bg-white/[0.05] px-6 py-3 text-sm font-medium text-white backdrop-blur-sm"
          >
            <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
            Entwickelt von Estrich-Experten für Estrich-Experten
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
                EstrichManager
              </span>
            </h1>
            <div className="mt-6 text-xl md:text-3xl lg:text-4xl font-bold text-neutral-400">
              <TextGenerateEffect words="Schluss mit Excel-Chaos und Papierbergen" className="text-center" />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-neutral-400"
          >
            Die Qualitätsmanagement-Software, die Estrichwerke wirklich brauchen.
            Erstellen Sie EN 13813 konforme Leistungserklärungen in{" "}
            <span className="font-semibold text-blue-400">Minuten statt Stunden</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="group h-14 px-8 text-base w-full sm:w-auto bg-white text-black hover:bg-neutral-200 transition-all duration-300"
            >
              <Link href="/register" className="flex items-center">
                Jetzt Beta-Zugang sichern
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base w-full sm:w-auto border-white/[0.2] bg-transparent text-white hover:bg-white/[0.1]"
            >
              <Link href="/login">
                Anmelden
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Beta-Phase: Kostenloser Zugang</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Voller Funktionsumfang</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span>Persönlicher Support</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </section>
  )
}
