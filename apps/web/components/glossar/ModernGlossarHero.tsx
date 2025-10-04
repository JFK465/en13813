"use client"

import { motion } from "framer-motion"
import { BookOpen, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spotlight } from "@/components/ui/spotlight"

interface ModernGlossarHeroProps {
  totalTerms: number
  searchTerm: string
  onSearchChange: (value: string) => void
  categories: Array<{ value: string; label: string; count: number }>
  selectedCategory: string
  onCategoryChange: (value: string) => void
  filteredCount: number
}

export function ModernGlossarHero({
  totalTerms,
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  filteredCount,
}: ModernGlossarHeroProps) {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="relative z-10 flex min-h-[70vh] items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-4xl text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex items-center rounded-full border border-white/[0.2] bg-white/[0.05] px-6 py-2 text-sm font-medium text-white backdrop-blur-sm"
          >
            <BookOpen className="mr-2 h-4 w-4 text-blue-400" />
            Nachschlagewerk • {totalTerms} Fachbegriffe
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
              Estrich-Glossar
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
            Über {totalTerms} Begriffe aus{" "}
            <span className="font-semibold text-blue-400">EN 13813</span>,
            Qualitätsmanagement und Produktion.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 max-w-md mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                className="pl-12 h-14 text-base bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 backdrop-blur-sm focus:bg-white/[0.1] focus:border-blue-500/50"
                placeholder="Begriff oder Stichwort suchen..."
                type="search"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] text-white hover:bg-white/[0.1]"
                  onClick={() => onSearchChange("")}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </motion.div>

          {/* Category Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8 flex flex-wrap gap-2 justify-center"
          >
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.value)}
                className={`text-sm min-h-[44px] px-4 ${
                  selectedCategory === category.value
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "border-white/[0.2] bg-transparent text-white hover:bg-white/[0.1]"
                }`}
              >
                {category.label}
                <Badge
                  variant="secondary"
                  className={`ml-2 text-xs ${
                    selectedCategory === category.value
                      ? "bg-neutral-200 text-black"
                      : "bg-white/[0.1] text-neutral-300"
                  }`}
                >
                  {category.value === "alle" ? totalTerms : category.count}
                </Badge>
              </Button>
            ))}
          </motion.div>

          {/* Result Counter */}
          {(searchTerm || selectedCategory !== "alle") && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-neutral-400"
            >
              {filteredCount} {filteredCount === 1 ? "Begriff" : "Begriffe"} gefunden
            </motion.p>
          )}
        </div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </section>
  )
}
