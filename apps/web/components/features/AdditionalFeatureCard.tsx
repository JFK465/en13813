"use client"

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
    <div className="flex gap-4 p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <IconRenderer iconName={feature.icon} className="h-8 w-8 text-blue-600 flex-shrink-0" />
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">
          {feature.title}
        </h3>
        <p className="text-gray-600 text-sm">
          {feature.description}
        </p>
      </div>
    </div>
  )
}