"use client"

import { motion } from "framer-motion"
import { BookOpen, Search, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"

export function ModernWissenHero() {
  return (
    <section className="relative min-h-[60vh] w-full overflow-hidden bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="relative z-10 flex min-h-[60vh] items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex items-center rounded-full border border-white/[0.2] bg-white/[0.05] px-6 py-2 text-sm font-medium text-white backdrop-blur-sm"
          >
            <BookOpen className="mr-2 h-4 w-4 text-blue-400" />
            Nachschlagewerk • 150+ Fachbegriffe
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
              Estrich-Wissen
            </span>
            <br />
            <span className="text-2xl md:text-3xl lg:text-4xl font-normal text-neutral-400">
              von A bis Z
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-6 max-w-3xl text-base leading-8 text-neutral-400 md:text-lg"
          >
            Das umfassendste deutsche Nachschlagewerk für Estrich-Fachbegriffe.
            <br className="hidden sm:block" />
            Über 150 Begriffe aus{" "}
            <span className="font-semibold text-blue-400">EN 13813</span>,
            Qualitätsmanagement und Produktion verständlich erklärt.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  className="pl-12 h-14 text-base bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 backdrop-blur-sm focus:bg-white/[0.1] focus:border-blue-500/50"
                  placeholder="Suchen Sie nach EN 13813, DoP, CE..."
                  type="search"
                />
              </div>
              <Button
                size="lg"
                className="h-14 min-w-[120px] text-base bg-white text-black hover:bg-neutral-200"
              >
                Suchen
              </Button>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            <div className="text-center p-4 rounded-lg bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-bold text-white">150+</div>
              <div className="text-sm sm:text-base text-neutral-400 mt-2">Fachartikel</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-bold text-white">2025</div>
              <div className="text-sm sm:text-base text-neutral-400 mt-2">Aktualisiert</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-bold text-white">100%</div>
              <div className="text-sm sm:text-base text-neutral-400 mt-2">Normkonform</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-bold text-blue-400">Kostenlos</div>
              <div className="text-sm sm:text-base text-neutral-400 mt-2">Zugang</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </section>
  )
}
