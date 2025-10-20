"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Building2, FileCheck, GraduationCap, Mail, Settings } from 'lucide-react'
import { PointerHighlight } from '@/components/ui/pointer-highlight'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface ContentCard {
  title: string
  subtitle: string
  description: string
  tags: string[]
  ctaText: string
  ctaLink: string
  highlightColor: "red" | "blue" | "green"
}

interface ContentCardProps extends ContentCard {
  index: number
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function EstrichDiscoveryGrid() {
  const contentCards: ContentCard[] = [
    {
      title: "Compliance Frameworks",
      subtitle: "EN 13813 im Überblick",
      description: "Von DoP über ITT bis zu FPC – verstehen und implementieren Sie alle Anforderungen der EN 13813 mit Leichtigkeit.",
      tags: ["DoP", "ITT", "FPC"],
      ctaText: "Mehr erfahren",
      ctaLink: "/wissen/en-13813",
      highlightColor: "red"
    },
    {
      title: "Rezeptur-Management",
      subtitle: "Ihre Rezepturen digital verwaltet",
      description: "Praktische Versionskontrolle, automatische CE-Kennzeichnung und vollständige Rückverfolgbarkeit für alle Ihre Estrich-Rezepturen.",
      tags: ["Rezepte", "Versionen", "CE-Kennzeichnung"],
      ctaText: "Mehr erfahren",
      ctaLink: "/funktionen",
      highlightColor: "blue"
    },
    {
      title: "Branchenlösungen",
      subtitle: "Maßgeschneidert für Estrichwerke",
      description: "Ob Zementestrich, Calciumsulfatestrich oder spezielle Mischungen – entdecken Sie spezifische Lösungen für Ihre Produktion.",
      tags: ["CT", "CA", "AS"],
      ctaText: "Mehr erfahren",
      ctaLink: "/funktionen",
      highlightColor: "green"
    },
    {
      title: "Unsere Mission",
      subtitle: "Das Team hinter EstrichManager",
      description: "Erfahren Sie, warum wir EstrichManager entwickelt haben und wie unsere Vision Qualitätsmanagement für Estrichwerke revolutioniert.",
      tags: ["Team", "Vision", "Innovation"],
      ctaText: "Mehr erfahren",
      ctaLink: "/kontakt",
      highlightColor: "red"
    },
    {
      title: "Wissenszentrum",
      subtitle: "Ihr EN 13813 Kompass",
      description: "Aktuelle Normen, Best Practices und alles was Sie für erfolgreiche Compliance-Implementierung in Ihrem Estrichwerk brauchen.",
      tags: ["Guides", "Standards", "Ressourcen"],
      ctaText: "Mehr erfahren",
      ctaLink: "/wissen",
      highlightColor: "blue"
    },
    {
      title: "Kontakt aufnehmen",
      subtitle: "Wir sind für Sie da",
      description: "Haben Sie Fragen? Unser Expertenteam hilft Ihnen gerne bei allen Herausforderungen und findet die perfekte Lösung für Ihr Estrichwerk.",
      tags: ["Support", "Beratung", "Demo"],
      ctaText: "Jetzt kontaktieren",
      ctaLink: "/kontakt",
      highlightColor: "green"
    },
  ]

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Heading with Pointer Highlight */}
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Entdecken Sie die Welt von{" "}
            <PointerHighlight
              rectangleClassName="bg-blue-600/10"
              pointerClassName="text-blue-600"
            >
              <span className="text-blue-600">EstrichManager</span>
            </PointerHighlight>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ihr Kompass durch die EN 13813 Compliance-Landschaft – von praktischen
            Leitfäden bis zu Estrichwerk-spezifischen Lösungen.
          </p>
        </motion.div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {contentCards.map((card, index) => (
            <ContentCard key={card.title} {...card} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// CONTENT CARD COMPONENT
// ============================================================

const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  description,
  tags,
  ctaText,
  ctaLink,
  highlightColor,
  index,
}) => {
  // Highlight color configurations
  const highlightConfig = {
    red: {
      rectangle: "bg-red-50",
      pointer: "text-red-500",
      text: "text-red-600",
    },
    blue: {
      rectangle: "bg-blue-50",
      pointer: "text-blue-500",
      text: "text-blue-600",
    },
    green: {
      rectangle: "bg-green-50",
      pointer: "text-green-500",
      text: "text-green-600",
    },
  }

  const config = highlightConfig[highlightColor]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={ctaLink}
        className={cn(
          // Base styles
          "group block h-full",
          // Layout
          "bg-white rounded-2xl",
          "p-8 lg:p-10",
          // Border
          "border border-gray-200",
          // Transitions
          "transition-all duration-300",
          // Hover states
          "hover:shadow-lg hover:border-gray-300"
        )}
      >
        {/* 1. Title with Pointer Highlight */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          <PointerHighlight
            rectangleClassName={config.rectangle}
            pointerClassName={config.pointer}
          >
            <span>{title}</span>
          </PointerHighlight>
        </h3>

        {/* 2. Subtitle */}
        <p className="text-lg font-semibold text-gray-700 mb-6">
          {subtitle}
        </p>

        {/* 3. Description */}
        <p className="text-gray-600 leading-relaxed mb-6">
          {description}
        </p>

        {/* 4. Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag, i) => (
            <React.Fragment key={tag}>
              <span className={cn("text-sm font-medium", config.text)}>
                {tag}
              </span>
              {i < tags.length - 1 && (
                <span className="text-gray-400">•</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 5. CTA with Arrow */}
        <div className={cn("flex items-center gap-2", config.text)}>
          <span className="font-semibold">{ctaText}</span>
          <ArrowRight
            className={cn(
              "w-5 h-5",
              "transition-transform duration-300",
              "group-hover:translate-x-1"
            )}
          />
        </div>
      </Link>
    </motion.div>
  )
}
