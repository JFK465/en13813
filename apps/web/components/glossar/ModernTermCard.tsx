"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface Term {
  term: string
  definition: string
  category?: string
  norm?: string
  example?: string
  related?: string[]
  detailedDescription?: string
  technicalData?: Record<string, string>
  practicalTips?: string
}

interface ModernTermCardProps {
  term: Term
  index: number
  onRelatedClick?: (term: string) => void
}

export function ModernTermCard({ term, index, onRelatedClick }: ModernTermCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.1] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.2] transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {term.term}
          </h3>
          {term.norm && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 shrink-0 ml-2">
              {term.norm}
            </Badge>
          )}
        </div>

        <p className="text-neutral-300 leading-relaxed mb-4">
          {term.definition}
        </p>

        {term.detailedDescription && (
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.05] mb-4">
            <p className="text-sm text-neutral-400 leading-relaxed">
              {term.detailedDescription}
            </p>
          </div>
        )}

        {term.technicalData && (
          <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] mb-4">
            <p className="text-xs font-semibold text-neutral-300 mb-3 uppercase tracking-wider">Technische Daten</p>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(term.technicalData).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-neutral-400">{key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="text-neutral-300 font-medium text-right">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {term.practicalTips && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
            <p className="text-xs text-blue-400 font-semibold mb-2">Praxistipp:</p>
            <p className="text-sm text-blue-300">{term.practicalTips}</p>
          </div>
        )}

        {term.example && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
            <p className="text-xs text-amber-400 font-semibold mb-2">Beispiel:</p>
            <p className="text-sm text-amber-300">{term.example}</p>
          </div>
        )}

        {term.related && term.related.length > 0 && (
          <div className="pt-4 border-t border-white/[0.1]">
            <p className="text-xs font-semibold text-neutral-400 mb-2">
              Siehe auch:
            </p>
            <div className="flex flex-wrap gap-2">
              {term.related.map((rel: string) => (
                <Badge
                  key={rel}
                  variant="outline"
                  className="text-xs bg-white/[0.03] border-white/[0.1] text-neutral-300 hover:bg-white/[0.05] hover:border-white/[0.2] transition-all cursor-pointer"
                  onClick={() => onRelatedClick?.(rel)}
                >
                  {rel}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 right-4 opacity-30 group-hover:opacity-100 transition-opacity">
          <div className="h-2 w-2 rounded-full bg-blue-400" />
        </div>
      </div>
    </motion.div>
  )
}
