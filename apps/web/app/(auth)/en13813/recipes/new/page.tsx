'use client'

import dynamic from 'next/dynamic'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

// Verwende die vollständige RecipeFormUltimate mit allen EN13813 Features
import { RecipeFormUltimate } from '@/components/en13813/RecipeFormUltimate'

// RecipeFormUltimate bietet:
// - Alle EN13813 Pflichtfelder
// - Estrich-spezifische Eigenschaften (CT, CA, MA, SR, AS)
// - Erweiterte Materialzusammensetzung inkl. Sieblinie
// - Vollständige Qualitätskontrolle und FPC Features

export default function NewRecipePage() {
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <Link href="/en13813/recipes" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {draftId ? 'Entwurf bearbeiten' : 'Neue Rezeptur anlegen'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Vollständige EN 13813 konforme Rezeptur mit allen erforderlichen Eigenschaften
          </p>
        </div>

        <RecipeFormUltimate draftId={draftId} />
      </div>
    </div>
  )
}