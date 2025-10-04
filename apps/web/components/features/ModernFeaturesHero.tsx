"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function ModernFeaturesHero() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-black/[0.96] antialiased bg-grid-white/[0.02] flex items-center">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-6 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20 text-sm sm:text-base px-4 py-1.5">
            EN 13813 konform
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
            Alle Funktionen für perfekte{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Compliance
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl leading-8 text-neutral-300 max-w-3xl mx-auto">
            EstrichManager bietet alle Werkzeuge, die Sie für ein effizientes
            Qualitätsmanagement nach EN 13813 benötigen. Von der Rezeptur bis zur
            fertigen Leistungserklärung.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/20"
            >
              <Link href="/register">
                14 Tage kostenlos testen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base w-full sm:w-auto border-white/[0.2] text-white hover:bg-white/[0.1]"
            >
              <Link href="/demo">
                Live-Demo ansehen
              </Link>
            </Button>
          </div>

          {/* Feature Badges */}
          <motion.div
            className="mt-16 flex flex-wrap justify-center gap-4 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {["✓ Rezepturverwaltung", "✓ DoP-Generator", "✓ CE-Kennzeichnung", "✓ FPC & ITT"].map((item) => (
              <div
                key={item}
                className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] text-neutral-300 backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
