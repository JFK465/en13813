"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, ArrowRight, Calculator, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Plan {
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  users: string
  features: string[]
  notIncluded: string[]
  cta: string
  popular: boolean
}

interface PricingToggleProps {
  plans: Plan[]
}

export function PricingToggle({ plans }: PricingToggleProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  return (
    <>
      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center items-center gap-4 mb-12"
      >
        <button
          onClick={() => setBillingPeriod("monthly")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            billingPeriod === "monthly"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
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
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          )}
        >
          Jährlich
          <Badge variant="secondary" className="ml-2">
            -17%
          </Badge>
        </button>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
          >
            <Card className={cn(
              "relative h-full flex flex-col",
              plan.popular && "border-blue-600 border-2 shadow-xl"
            )}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                  Beliebteste Wahl
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>

                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      €{billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-gray-600">
                      /{billingPeriod === "monthly" ? "Monat" : "Jahr"}
                    </span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-green-600 mt-1">
                      Spare €{(plan.monthlyPrice * 12 - plan.yearlyPrice)} pro Jahr
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">{plan.users}</p>
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">Inklusive:</h4>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}

                  {plan.notIncluded.length > 0 && (
                    <>
                      <div className="pt-3 border-t"></div>
                      {plan.notIncluded.map((feature) => (
                        <div key={feature} className="flex items-start gap-2 opacity-50">
                          <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-500">{feature}</span>
                        </div>
                      ))}
                    </>
                  )}
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
                  size="lg"
                >
                  <Link href="/register">
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  )
}