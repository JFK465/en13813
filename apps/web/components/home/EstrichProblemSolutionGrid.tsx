"use client";
import React from "react";
import { TracingBeam } from "../ui/tracing-beam";
import { motion } from "framer-motion";
import {
  Clock,
  Zap,
  Database,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Users,
  Timer
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EstrichProblemSolutionGrid() {
  const steps = [
    {
      number: "01",
      category: "Das Problem",
      title: "EN 13813 war ein Versprechen, das schwer zu halten war",
      description: [
        "Ein Regelwerk, das komplexer ist als es sein müsste. Sie sind gefangen zwischen Angst vor Non-Compliance und der Lähmung durch Papierkram. Zwischen dem, was sein sollte, und dem, was ist.",
        "",
        "Das war der wahre Preis von EN 13813. Nicht die Audit-Kosten - die Lebenszeit.",
        "",
        "Ihre Lebenszeit. Verschwendet an Formulare, die niemand versteht. An Prozesse, die keiner durchschaut. An eine Bürokratie, die niemand braucht."
      ],
      metrics: [
        { value: "4-6 Std.", label: "Pro DoP" },
        { value: "67%", label: "Fehlerhafte Docs" },
        { value: "100+", label: "Dokumente pro Jahr" }
      ]
    },
    {
      number: "02",
      category: "Das Fundament",
      title: "Einmal das Fundament legen",
      description: [
        "Ihre Rezepturen eingeben. Ihre Prüfergebnisse erfassen. Darauf baut EstrichManager ein ganzes Compliance-System. Dokument für Dokument. Charge für Charge.",
        "",
        "Qualität ist wichtig. Die Bürokratie drumherum nicht."
      ],
      features: [
        "Automatische Dokumentenerstellung",
        "EN 13813 Konformitätsprüfung",
        "Echtzeit-Chargenrückverfolgung",
        "Zentrale Rezepturverwaltung"
      ]
    },
    {
      number: "03",
      category: "Die Zukunft",
      title: "Ab jetzt läuft EN 13813 wie die Buchhaltung",
      description: [
        "Einfach mit. Niemand denkt mehr daran. Niemand spricht mehr darüber. Es ist einfach erledigt. Für immer.",
        "",
        "Ihre Teams atmen auf. Ihr Estrichwerk erinnert sich wieder, warum es existiert.",
        "",
        "Der neue Großauftrag? Kein Compliance-Problem. Die Sonderrezeptur? Kein Dokumentations-Drama. Zeit nicht für Formulare. Für die Zukunft."
      ],
      metrics: [
        { value: "95%", label: "Zeitersparnis" },
        { value: "100%", label: "Compliance" },
        { value: "∞", label: "Updates inklusive" }
      ],
      bottomText: "Fokus aufs Geschäft"
    }
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <motion.div
          className="text-center mb-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Die Compliance-Revolution
          </motion.div>

          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Von der Last zur{" "}
            <span className="bg-emerald-600 bg-clip-text text-transparent">
              Leichtigkeit
            </span>
          </h2>

          <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
            Drei Schritte, die alles verändern. Von der Compliance-Hölle zum{" "}
            <span className="font-semibold text-emerald-600">
              automatisierten Paradies
            </span>
            .
          </p>
        </motion.div>

        {/* TracingBeam Steps */}
        <TracingBeam className="px-6">
          <div className="max-w-3xl mx-auto antialiased pt-4 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="mb-24 last:mb-0"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                {/* Step Number & Category */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-6xl lg:text-7xl font-black text-gray-200 leading-none">
                    {step.number}
                  </div>
                  <div>
                    <div className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-1">
                      {step.category}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <div className="prose prose-lg max-w-none mb-8">
                  {step.description.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className={`text-gray-700 leading-relaxed ${
                        paragraph === "" ? "h-4" : ""
                      } ${idx === step.description.length - 1 ? "font-medium text-gray-900" : ""}`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Metrics Grid */}
                {step.metrics && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {step.metrics.map((metric, idx) => (
                      <motion.div
                        key={idx}
                        className="relative group"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="absolute inset-0 bg-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity" />
                        <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-lg hover:border-blue-300 transition-all">
                          <div className="text-4xl lg:text-5xl font-black bg-blue-600 bg-clip-text text-transparent mb-2">
                            {metric.value}
                          </div>
                          <div className="text-xs uppercase tracking-wider font-bold text-gray-500">
                            {metric.label}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Features List */}
                {step.features && (
                  <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                    <div className="space-y-4">
                      {step.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-gray-900 font-medium text-lg">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Text */}
                {step.bottomText && (
                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                      <Sparkles className="w-5 h-5" />
                      {step.bottomText}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </TracingBeam>

        {/* Beta CTA Section */}
        <motion.div
          className="mt-32 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-xl opacity-20" />

            {/* Main Card */}
            <div className="relative bg-gray-900 rounded-3xl p-12 lg:p-16 shadow-2xl border border-gray-700">
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-8"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <Timer className="w-4 h-4" />
                LIMITED BETA ACCESS
              </motion.div>

              {/* Heading */}
              <h3 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Werden Sie Beta-Tester
              </h3>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl">
                Gestalten Sie die Zukunft der EN 13813 Compliance mit uns
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: "Exklusive Community",
                    description: "Direkter Draht zum Team"
                  },
                  {
                    icon: <Sparkles className="w-6 h-6" />,
                    title: "50% Rabatt",
                    description: "Nach der Beta-Phase"
                  },
                  {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Kostenlos testen",
                    description: "Keine Kreditkarte nötig"
                  }
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4">
                      {benefit.icon}
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {benefit.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/beta" className="group">
                    Jetzt Beta-Zugang sichern
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-lg h-14 px-8 backdrop-blur-sm"
                >
                  <Link href="#preise">Preise ansehen</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
