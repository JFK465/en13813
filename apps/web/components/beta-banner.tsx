'use client'

import { useState } from 'react'
import { X, Sparkles, Calendar, Gift } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function BetaBanner() {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const betaEndDate = new Date('2025-03-31')
  const today = new Date()
  const daysRemaining = Math.ceil((betaEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <Badge className="bg-white/20 text-white border-white/30">
              BETA VERSION
            </Badge>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Noch {daysRemaining} Tage kostenlos
            </span>
            <span className="flex items-center gap-1">
              <Gift className="w-4 h-4" />
              50% Early Adopter Rabatt gesichert
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => {
              // Open feedback dialog
              const event = new CustomEvent('openBetaFeedback')
              window.dispatchEvent(event)
            }}
          >
            Feedback geben
          </Button>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-white/80 hover:text-white ml-2"
            aria-label="Banner schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}