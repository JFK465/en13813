"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"

interface ModernFeatureCardProps {
  feature: {
    title: string
    description: string
    icon: string
  }
  index: number
}

export function ModernFeatureCard({ feature, index }: ModernFeatureCardProps) {
  const Icon = (Icons as any)[feature.icon] as LucideIcon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card */}
      <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.1] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.2] transition-all duration-300 h-full">
        {/* Icon */}
        <div className="mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.1] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {Icon && <Icon className="w-6 h-6 text-blue-400" />}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm text-neutral-400 leading-relaxed">
          {feature.description}
        </p>

        {/* Decorative corner */}
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  )
}
