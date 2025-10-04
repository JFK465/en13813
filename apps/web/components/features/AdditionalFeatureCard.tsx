"use client"

import { motion } from "framer-motion"
import { IconRenderer } from "./IconRenderer"

interface AdditionalFeatureCardProps {
  feature: {
    icon: string
    title: string
    description: string
  }
}

export function AdditionalFeatureCard({ feature }: AdditionalFeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group flex gap-4 p-6 sm:p-8 bg-white/[0.02] border border-white/[0.1] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.2] transition-all min-h-[120px] backdrop-blur-sm"
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.1] flex items-center justify-center group-hover:scale-110 transition-transform">
          <IconRenderer iconName={feature.icon} className="h-6 w-6 text-blue-400" />
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-white mb-2 text-base sm:text-lg group-hover:text-blue-400 transition-colors">
          {feature.title}
        </h3>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}