import React from 'react';
import { cn } from '@/lib/utils';
import {
  ShieldCheck,
  AlertTriangle,
  Award,
  ClipboardCheck,
  Users,
  Bot,
} from 'lucide-react';

export function TrustPlatformFeatures() {
  const features = [
    {
      title: "Automatisierte Compliance",
      description: "EN 13813-konform werden und bleiben – ganz ohne Excel-Chaos.",
      icon: <ShieldCheck className="w-8 h-8" />,
    },
    {
      title: "Risikomanagement",
      description: "Alle Risiken zentral verwalten und im Blick behalten.",
      icon: <AlertTriangle className="w-8 h-8" />,
    },
    {
      title: "Audit-Ready",
      description: "Immer bereit für Audits mit vollständiger Dokumentation.",
      icon: <Award className="w-8 h-8" />,
    },
    {
      title: "Optimierte Prüfungen",
      description: "Automatisch prüfbereit – jederzeit und ohne Stress.",
      icon: <ClipboardCheck className="w-8 h-8" />,
    },
    {
      title: "Team-Verwaltung",
      description: "Workflow-Management für Teams – von Rezeptur bis DoP.",
      icon: <Users className="w-8 h-8" />,
    },
    {
      title: "KI-Unterstützung",
      description: "Schnellere Prozesse durch intelligente Automatisierung.",
      icon: <Bot className="w-8 h-8" />,
    },
  ];

  return (
    <section className="relative py-20 lg:py-24 bg-white overflow-hidden">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Die digitale Qualitätsmanagement-Plattform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Egal wie groß Ihr Estrichwerk ist – EstrichManager automatisiert
            Compliance, verwaltet Risiken und schafft kontinuierliches Vertrauen.
            Alles aus einer einzigen, intelligenten Plattform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col py-10 px-8 relative group/feature transition-all duration-300",
        // All cards have bottom border by default
        "border-b border-gray-200",
        // Add right border except for last column (2, 5)
        index % 3 !== 2 && "lg:border-r",
        // First row keeps bottom border
        index < 3 && "lg:border-b",
        // Second row removes bottom border
        index >= 3 && "lg:border-b-0"
      )}
    >
      {/* Hover Gradient Overlay */}
      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

      {/* Icon */}
      <div className="mb-4 relative z-10 text-blue-600 group-hover/feature:text-blue-700 transition-colors duration-300">
        {icon}
      </div>

      {/* Title with Animated Border */}
      <div className="text-lg font-bold mb-2 relative z-10">
        {/* Left Border - expands on hover */}
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-gray-300 group-hover/feature:bg-blue-600 transition-all duration-300 origin-center" />

        {/* Title Text - slides right on hover */}
        <span className="group-hover/feature:translate-x-2 transition duration-300 inline-block text-gray-900 pl-4">
          {title}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 relative z-10 pl-4 group-hover/feature:text-gray-700 transition-colors duration-300">
        {description}
      </p>
    </div>
  );
};
