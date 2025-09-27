"use client"

import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"

interface IconRendererProps {
  iconName: string
  className?: string
}

export function IconRenderer({ iconName, className }: IconRendererProps) {
  const Icon = (Icons as any)[iconName] as LucideIcon

  if (!Icon) {
    console.warn(`Icon ${iconName} not found`)
    return null
  }

  return <Icon className={className} />
}