"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Calculator, FileX, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const painPoints = [
  {
    problem: "Stundenlange Erstellung von Leistungserklärungen",
    solution: "DoP in unter 5 Minuten erstellt und validiert",
    icon: FileX,
    before: "4-6 Stunden pro DoP",
    after: "5 Minuten mit EstrichManager"
  },
  {
    problem: "Excel-Chaos bei der Rezepturverwaltung",
    solution: "Zentrale Rezepturdatenbank mit Versionierung",
    icon: Calculator,
    before: "Fehleranfällige Excel-Tabellen",
    after: "Validierte Rezepturen mit Änderungshistorie"
  },
  {
    problem: "Fehlende Rückverfolgbarkeit bei Reklamationen",
    solution: "Lückenlose Chargendokumentation",
    icon: AlertTriangle,
    before: "Stundenlanges Suchen in Ordnern",
    after: "Sofortige Chargenrückverfolgung"
  }
]

export function PainPointsSection() {
  return (
    <section className="py-24 px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Kennen Sie diese Probleme?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            EstrichManager löst die täglichen Herausforderungen in Ihrem Estrichwerk
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {painPoints.map((point, index) => (
            <motion.div
              key={point.problem}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <point.icon className="h-8 w-8 text-red-500" />
                    <Lightbulb className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">
                    <span className="text-red-600 line-through block mb-2">{point.problem}</span>
                    <span className="text-green-600 text-xl">{point.solution}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <span className="font-medium">Vorher:</span>
                      <span className="ml-2">{point.before}</span>
                    </div>
                    <div className="flex items-center text-green-600 font-medium">
                      <span>Nachher:</span>
                      <span className="ml-2">{point.after}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}