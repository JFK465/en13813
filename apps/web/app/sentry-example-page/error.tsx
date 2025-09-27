'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error, {
      tags: {
        location: 'sentry-example-page',
        errorBoundary: true
      }
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Test Error Triggered!
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Perfect! Der Test-Fehler wurde erfolgreich ausgelöst.
          </p>
          <div className="bg-red-50 rounded p-3 text-sm">
            <p className="text-red-800 font-mono break-all">
              {error.message}
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            ✅ Dieser Fehler wurde an Sentry gesendet. Prüfen Sie Ihr Dashboard!
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={reset}
            variant="outline"
            className="flex-1"
          >
            Nochmal versuchen
          </Button>
          <Button
            onClick={() => window.open('https://sentry.io', '_blank')}
            className="flex-1"
          >
            Sentry Dashboard →
          </Button>
        </div>
      </div>
    </div>
  )
}