'use client'

import { UseFormReturn } from 'react-hook-form'

interface TestingSectionProps {
  form: UseFormReturn<any>
}

export default function TestingSection({ form }: TestingSectionProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 bg-muted/10">
        <h3 className="font-medium mb-2">Prüfungen & Qualitätskontrolle</h3>
        <p className="text-sm text-muted-foreground">
          ITT, FPC, Prüfintervalle und Konformitätskriterien.
        </p>
      </div>
    </div>
  )
}