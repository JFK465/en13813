import { ReportGenerator } from '@/components/reports/ReportGenerator'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ReportGeneratePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Reports
          </Button>
        </Link>
      </div>
      
      <ReportGenerator />
    </div>
  )
}