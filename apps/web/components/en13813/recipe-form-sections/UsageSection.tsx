'use client'

import { UseFormReturn } from 'react-hook-form'

interface UsageSectionProps {
  form: UseFormReturn<any>
}

export default function UsageSection({ form }: UsageSectionProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 bg-muted/10">
        <h3 className="font-medium mb-2">Verwendungszweck</h3>
        <p className="text-sm text-muted-foreground">
          Hier werden Verwendungszwecke wie Industrieboden, Wohnbereich, 
          beheizte Konstruktion etc. definiert.
        </p>
      </div>
    </div>
  )
}