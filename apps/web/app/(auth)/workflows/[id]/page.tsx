'use client'

import { WorkflowDetails } from '@/components/workflows/WorkflowDetails'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface WorkflowPageProps {
  params: {
    id: string
  }
}

export default function WorkflowPage({ params }: WorkflowPageProps) {
  const searchParams = useSearchParams()
  const stepId = searchParams.get('step')

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/workflows">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Workflows
          </Button>
        </Link>
      </div>
      
      <WorkflowDetails 
        instanceId={params.id} 
        activeStepId={stepId || undefined}
      />
    </div>
  )
}