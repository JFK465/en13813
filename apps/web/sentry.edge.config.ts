import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Sentry DSN - MUST be configured in production
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Performance Monitoring for Edge Runtime
  tracesSampleRate: 0.1,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Before sending event to Sentry
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }

    // Don't send events in development
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      return null;
    }

    return event;
  },

  // Add edge context
  initialScope: {
    tags: {
      component: 'edge',
      runtime: 'edge',
    },
  },
});

// Export Sentry for manual error reporting
export { Sentry };