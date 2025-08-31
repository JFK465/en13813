'use client'

import { ComplianceDashboard } from '@/components/en13813/ComplianceDashboard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CompliancePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link 
          href="/en13813" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">EN 13813 Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Übersicht über Compliance-Status, ITT-Prüfungen und anstehende Aufgaben
          </p>
        </div>

        <ComplianceDashboard />
      </div>
    </div>
  )
}