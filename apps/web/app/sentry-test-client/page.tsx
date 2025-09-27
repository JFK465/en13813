"use client"

import { useEffect, useState } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function SentryTestClient() {
  const [sentryStatus, setSentryStatus] = useState<string>('Checking...')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    // Check if Sentry is loaded
    const client = Sentry.getClient()
    const dsn = client?.getDsn()

    if (dsn) {
      setSentryStatus(`✅ Sentry loaded with DSN: ${dsn.host}`)
    } else {
      setSentryStatus('❌ Sentry NOT loaded - DSN missing')
    }

    // Force initialize if not loaded
    if (!dsn) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
      })
      setSentryStatus('🔄 Manually initialized Sentry')
    }
  }, [])

  const testClientError = () => {
    try {
      // Log attempt
      const msg = `Client error test at ${new Date().toISOString()}`
      console.error(msg)
      setErrors(prev => [...prev, msg])

      // Force capture
      const error = new Error('Manual client error test from Beta user')
      Sentry.captureException(error, {
        tags: {
          test: true,
          source: 'client',
          user: 'beta-tester'
        }
      })

      // Also throw to test automatic capture
      throw error
    } catch (e) {
      console.error('Caught error:', e)
      setErrors(prev => [...prev, `Caught: ${e}`])
    }
  }

  const testAsyncError = () => {
    setTimeout(() => {
      const error = new Error('Async client error from Beta')
      Sentry.captureException(error)
      console.error('Async error:', error)
      setErrors(prev => [...prev, `Async: ${error.message}`])
    }, 100)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sentry Client Test</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p className="font-semibold">Status:</p>
        <p>{sentryStatus}</p>
        <p className="text-sm text-gray-600 mt-2">
          DSN from env: {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Set' : '❌ Not set'}
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={testClientError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Client Error
        </button>

        <button
          onClick={testAsyncError}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 ml-4"
        >
          Test Async Error
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="font-semibold mb-2">Errors triggered:</p>
          <ul className="text-sm space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-gray-700">{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="font-semibold">Next steps:</p>
        <ol className="text-sm mt-2 space-y-1">
          <li>1. Click "Test Client Error"</li>
          <li>2. Check browser console (F12)</li>
          <li>3. Check Sentry Dashboard</li>
          <li>4. Check Vercel Function Logs</li>
        </ol>
      </div>
    </div>
  )
}