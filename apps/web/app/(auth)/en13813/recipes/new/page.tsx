'use client'

import { RecipeFormAdvanced } from '@/components/en13813/RecipeFormAdvanced'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewRecipePage() {
  return (
    <div className="container mx-auto py-6 max-w-6xl">
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
            Erstellen Sie eine neue Estrichmörtel-Rezeptur nach EN 13813 mit vollständiger Materialzusammensetzung
          </p>
        </div>

        <RecipeFormAdvanced />
      </div>
    </div>
  )
}