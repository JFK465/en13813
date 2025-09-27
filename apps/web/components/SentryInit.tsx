'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export function SentryInit() {
  useEffect(() => {
    try {
      // Only initialize if DSN is available and Sentry not already initialized
      if (process.env.NEXT_PUBLIC_SENTRY_DSN && !Sentry.getClient()?.getDsn()) {
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          environment: process.env.NODE_ENV || 'production',
          integrations: [
            Sentry.replayIntegration({
              maskAllText: false,
              blockAllMedia: false,
            }),
          ],
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          beforeSend(event) {
            console.log('Sentry event being sent:', event.event_id)
            return event
          }
        })
        console.log('✅ Sentry initialized in client component')
      } else {
        console.log('ℹ️ Sentry already initialized or no DSN')
      }
    } catch (error) {
      console.error('❌ Error initializing Sentry:', error)
      // Don't let Sentry initialization errors break the app
    }
  }, [])

  return null
}