"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface Feature {
  title: string
  description: string
  icon: LucideIcon
}

interface FeatureCategory {
  id: string
  title: string
  icon: LucideIcon
  description: string
  features: Feature[]
}

interface FeatureTabsProps {
  categories: FeatureCategory[]
}

export function FeatureTabs({ categories }: FeatureTabsProps) {
  return (
    <Tabs defaultValue={categories[0]?.id} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="flex flex-col gap-2 py-4"
          >
            <category.icon className="h-5 w-5" />
            <span className="text-xs sm:text-sm">{category.title}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category, categoryIndex) => (
        <TabsContent key={category.id} value={category.id} className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-gray-600">{category.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Icon className="h-8 w-8 text-blue-600 mb-2" />
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </TabsContent>
      ))}
    </Tabs>
  )
}