"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ModernAZNavigationProps {
  alphabet: string[]
  filteredTerms: Record<string, any[]>
}

export function ModernAZNavigation({ alphabet, filteredTerms }: ModernAZNavigationProps) {
  return (
    <div className="mb-12 p-6 bg-neutral-950 rounded-2xl border border-white/[0.1] sticky top-20 md:top-4 z-10">
      <p className="font-semibold mb-4 text-sm sm:text-base text-white">
        Schnellnavigation:
      </p>
      <div className="flex flex-wrap gap-2">
        {alphabet.map((letter) => {
          const hasTerms = letter in filteredTerms
          return (
            <motion.a
              key={letter}
              href={hasTerms ? `#${letter}` : undefined}
              whileHover={hasTerms ? { scale: 1.1 } : {}}
              whileTap={hasTerms ? { scale: 0.95 } : {}}
              className={cn(
                "relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all font-medium text-base group",
                hasTerms
                  ? "bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.3] cursor-pointer"
                  : "bg-neutral-900/50 text-neutral-600 cursor-not-allowed border border-transparent"
              )}
              onClick={!hasTerms ? (e) => e.preventDefault() : undefined}
            >
              {hasTerms && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId={`glow-${letter}`}
                />
              )}
              <span className="relative z-10">{letter}</span>

              {hasTerms && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-70 transition-opacity" />
              )}
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}
