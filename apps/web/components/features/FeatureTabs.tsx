"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconRenderer } from "./IconRenderer"
import { ModernFeatureCard } from "./ModernFeatureCard"

interface Feature {
  title: string
  description: string
  icon: string
}

interface FeatureCategory {
  id: string
  title: string
  icon: string
  description: string
  features: Feature[]
}

interface FeatureTabsProps {
  categories: FeatureCategory[]
}

export function FeatureTabs({ categories }: FeatureTabsProps) {
  return (
    <Tabs defaultValue={categories[0]?.id} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto bg-white/[0.05] border border-white/[0.1] p-2">
        {categories.map((category) => (
          <TabsTrigger
            key={category.id}
            value={category.id}
            className="flex flex-col gap-2 py-4 data-[state=active]:bg-white/[0.1] data-[state=active]:text-white text-neutral-400 rounded-lg"
          >
            <IconRenderer iconName={category.icon} className="h-5 w-5" />
            <span className="text-xs sm:text-sm font-medium">{category.title}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category, categoryIndex) => (
        <TabsContent key={category.id} value={category.id} className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-3">{category.title}</h3>
              <p className="text-neutral-400 text-lg">{category.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.features.map((feature, index) => (
                <ModernFeatureCard key={feature.title} feature={feature} index={index} />
              ))}
            </div>
          </motion.div>
        </TabsContent>
      ))}
    </Tabs>
  )
}