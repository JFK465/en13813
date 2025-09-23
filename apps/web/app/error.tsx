'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    console.error('Error caught by error.tsx:', error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-2 text-2xl font-semibold">Ein Fehler ist aufgetreten</h2>
        <p className="mb-4 text-muted-foreground">
          Der Fehler wurde an unser Team gemeldet.
        </p>
        <div className="mb-4 rounded bg-muted p-4 text-left text-xs">
          <pre>{error.message}</pre>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>Erneut versuchen</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Zur Startseite
          </Button>
        </div>
      </div>
    </div>
  )
}