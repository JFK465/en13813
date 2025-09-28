'use client'

import { UseFormReturn } from 'react-hook-form'

interface MaterialsSectionProps {
  form: UseFormReturn<any>
}

export default function MaterialsSection({ form }: MaterialsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 bg-muted/10">
        <h3 className="font-medium mb-2">Materialien & Rezeptur</h3>
        <p className="text-sm text-muted-foreground">
          Bindemittel, Zuschläge, Zusatzmittel und deren Mengenangaben.
        </p>
      </div>
    </div>
  )
}