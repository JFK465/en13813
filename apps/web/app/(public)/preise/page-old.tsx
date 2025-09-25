"use client"

import { Check, X, ArrowRight, Calculator, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  const plans = [
    {
      name: "Starter",
      description: "Für kleine Estrichwerke",
      monthlyPrice: 49,
      yearlyPrice: 490,
      users: "1-3 Nutzer",
      features: [
        "Rezepturverwaltung",
        "DoP-Erstellung",
        "CE-Kennzeichnung",
        "PDF-Export",
        "E-Mail Support",
        "Basis-Vorlagen",
      ],
      notIncluded: [
        "API-Zugang",
        "Mehrere Standorte",
        "Erweiterte Analysen",
        "Schulungen",
      ],
      cta: "Jetzt starten",
      popular: false,
    },
    {
      name: "Professional",
      description: "Für mittlere Betriebe",
      monthlyPrice: 149,
      yearlyPrice: 1490,
      users: "4-20 Nutzer",
      features: [
        "Alle Starter Features",
        "Chargenrückverfolgung",
        "QR-Code Generator",
        "FPC & ITT Module",
        "Audit-Management",
        "Priority Support",
        "Erweiterte Vorlagen",
        "Datenexport (Excel, XML)",
      ],
      notIncluded: [
        "API-Zugang",
        "White-Label Option",
      ],
      cta: "Jetzt upgraden",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Für große Werke & Konzerne",
      monthlyPrice: null,
      yearlyPrice: null,
      users: "Unbegrenzte Nutzer",
      features: [
        "Alle Professional Features",
        "Mehrere Standorte",
        "API-Zugang",
        "White-Label möglich",
        "Dedizierter Support",
        "SLA Garantie",
        "Persönliche Schulungen",
        "Custom Integrationen",
        "Erweiterte Analysen",
        "Unbegrenzter Speicher",
      ],
      notIncluded: [],
      cta: "Kontakt aufnehmen",
      popular: false,
    },
  ]

  const faqs = [
    {
      question: "Kann ich EstrichManager kostenlos testen?",
      answer: "Ja! Sie können EstrichManager 14 Tage lang kostenlos und unverbindlich testen. Keine Kreditkarte erforderlich."
    },
    {
      question: "Wie funktioniert die Abrechnung?",
      answer: "Sie können zwischen monatlicher und jährlicher Zahlung wählen. Bei jährlicher Zahlung sparen Sie 2 Monate."
    },
    {
      question: "Kann ich meinen Plan später ändern?",
      answer: "Ja, Sie können jederzeit upgraden oder downgraden. Die Änderung wird zum nächsten Abrechnungszeitraum wirksam."
    },
    {
      question: "Gibt es versteckte Kosten?",
      answer: "Nein. Alle Preise sind transparent und beinhalten alle genannten Funktionen. Keine Setup-Gebühren oder versteckte Kosten."
    },
    {
      question: "Was passiert nach der Testphase?",
      answer: "Nach 14 Tagen endet die Testphase automatisch. Sie entscheiden, ob Sie ein kostenpflichtiges Abo abschließen möchten."
    },
    {
      question: "Bieten Sie Schulungen an?",
      answer: "Ja, für Professional-Kunden bieten wir Online-Schulungen an. Enterprise-Kunden erhalten persönliche Vor-Ort-Schulungen."
    },
  ]

  const getPrice = (plan: typeof plans[0]) => {
    if (billingPeriod === "monthly") {
      return plan.monthlyPrice
    } else {
      return plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : null
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
          >
            Transparente Preise für jede Betriebsgröße
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            Wählen Sie den Plan, der zu Ihrem Estrichwerk passt.
            14 Tage kostenlos testen. Jederzeit kündbar.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                billingPeriod === "monthly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                billingPeriod === "yearly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Jährlich
              <Badge className="ml-2 bg-green-100 text-green-800">-2 Monate</Badge>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className={cn(
                  "relative h-full",
                  plan.popular && "border-blue-600 border-2 shadow-xl"
                )}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                      Beliebteste Wahl
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      {plan.monthlyPrice ? (
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold">
                            €{getPrice(plan)}
                          </span>
                          <span className="ml-2 text-gray-600">/Monat</span>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold">Individuell</div>
                      )}
                      <div className="mt-2 text-sm text-gray-600">{plan.users}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.notIncluded.map((feature) => (
                        <div key={feature} className="flex items-start gap-2 opacity-50">
                          <X className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-500 line-through">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      className={cn(
                        "w-full",
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      )}
                    >
                      <Link href={plan.name === "Enterprise" ? "/kontakt" : "/register"}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="px-6 py-24 lg:px-8 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Ihre Zeitersparnis berechnen
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Ein durchschnittliches Estrichwerk spart mit EstrichManager:
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-4xl text-blue-600">15h</CardTitle>
                <CardDescription>pro Woche bei DoP-Erstellung</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-4xl text-blue-600">80%</CardTitle>
                <CardDescription>weniger Fehler in Dokumenten</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-4xl text-blue-600">€2.400</CardTitle>
                <CardDescription>Ersparnis pro Monat</CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/roi-rechner">
                Individuelle Ersparnis berechnen
                <Calculator className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Häufige Fragen</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-lg">{faq.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 pl-7">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold">
            Bereit für digitales Qualitätsmanagement?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Testen Sie EstrichManager 14 Tage kostenlos und unverbindlich.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">
                Kostenlos testen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white/20"
            >
              <Link href="/kontakt">
                Beratung anfragen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}