'use client'

import { RecipeFormUltimate } from '@/components/en13813/RecipeFormUltimate'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewRecipePage() {
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
          <h1 className="text-3xl font-bold">Neue Rezeptur anlegen</h1>
          <p className="text-muted-foreground mt-1">
            Vollständige EN 13813 konforme Rezeptur mit allen erforderlichen Eigenschaften
          </p>
        </div>

        <RecipeFormUltimate />
      </div>
    </div>
  )
}