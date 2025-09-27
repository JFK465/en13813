"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Bug, CheckCircle, Loader2 } from 'lucide-react'

export default function SentryExamplePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorTriggered, setErrorTriggered] = useState(false)

  const triggerError = async () => {
    setIsLoading(true)

    try {
      // Warte kurz für bessere UX
      await new Promise(resolve => setTimeout(resolve, 500))

      // Trigger verschiedene Fehlertypen für besseres Testing
      const errorType = Math.floor(Math.random() * 3)

      switch (errorType) {
        case 0:
          // TypeError
          // @ts-ignore - Absichtlich für Sentry-Test
          window.myUndefinedFunction()
          break
        case 1:
          // ReferenceError
          throw new Error('Test error from Sentry example page - This is intentional!')
          break
        case 2:
          // Custom Error mit zusätzlichem Context
          const error = new Error('Custom Sentry test error with metadata')
          // @ts-ignore
          error.customData = {
            page: 'sentry-example-page',
            timestamp: new Date().toISOString(),
            userAction: 'button_click'
          }
          throw error
          break
      }
    } catch (error) {
      console.error('Sentry test error triggered:', error)
      setErrorTriggered(true)

      // Sentry sollte den Fehler automatisch erfassen
      // Falls nicht, können wir es manuell senden:
      if (typeof window !== 'undefined' && window.Sentry && error instanceof Error) {
        window.Sentry.captureException(error, {
          tags: {
            section: 'sentry-test',
            intentional: true
          },
          context: {
            testPage: {
              url: window.location.href,
              timestamp: new Date().toISOString()
            }
          }
        })
      }

      throw error // Re-throw damit React Error Boundary es auch sieht
    } finally {
      setIsLoading(false)
    }
  }

  const triggerAsyncError = () => {
    setIsLoading(true)

    // Async error für Promise rejection testing
    setTimeout(() => {
      setIsLoading(false)
      Promise.reject(new Error('Async Sentry test error - Unhandled promise rejection'))
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-6 w-6 text-purple-600" />
              Sentry Integration Test
            </CardTitle>
            <CardDescription>
              Diese Seite dient zur Verifizierung der Sentry-Integration.
              Klicken Sie auf die Buttons unten, um Test-Fehler zu erzeugen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Sentry Setup Status</p>
                  <p>
                    {errorTriggered
                      ? "✅ Error wurde ausgelöst! Prüfen Sie Ihr Sentry Dashboard."
                      : "Warte auf ersten Fehler... Klicken Sie einen Button unten."}
                  </p>
                </div>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Synchrone Fehler</h3>
                <Button
                  onClick={triggerError}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Triggering Error...
                    </>
                  ) : (
                    <>
                      <Bug className="mr-2 h-4 w-4" />
                      Trigger Test Error
                    </>
                  )}
                </Button>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Asynchrone Fehler</h3>
                <Button
                  onClick={triggerAsyncError}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Trigger Async Error
                </Button>
              </div>
            </div>

            {/* Success Message */}
            {errorTriggered && (
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">Fehler erfolgreich ausgelöst!</p>
                    <p>
                      Der Test-Fehler wurde generiert. Sie sollten ihn jetzt in Ihrem
                      Sentry Dashboard unter Issues sehen können.
                    </p>
                    <a
                      href="https://sentry.io/organizations/jonas-kruger/issues/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-green-700 underline hover:text-green-900"
                    >
                      Zum Sentry Dashboard →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-2">So verifizieren Sie Sentry:</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Klicken Sie einen der Test-Buttons oben</li>
                <li>Ein Fehler wird absichtlich ausgelöst</li>
                <li>Öffnen Sie Ihr Sentry Dashboard</li>
                <li>Der Fehler sollte unter "Issues" erscheinen</li>
                <li>Wenn ja, ist Sentry erfolgreich konfiguriert! 🎉</li>
              </ol>
            </div>

            {/* Environment Info */}
            <div className="border-t pt-4 text-xs text-gray-500">
              <p>Environment: {process.env.NODE_ENV}</p>
              <p>Sentry DSN: {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Configured' : '❌ Not configured'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}