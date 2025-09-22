import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Sentry DSN - MUST be configured in production
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Server-specific integrations
  integrations: [
    Sentry.extraErrorDataIntegration(),
  ],

  // Before sending event to Sentry
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      // Remove authentication headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-supabase-auth'];
      }

      // Remove sensitive query params
      if (event.request.query_string && typeof event.request.query_string === 'string') {
        event.request.query_string = event.request.query_string.replace(
          /api_key=[^&]+/g,
          'api_key=[REDACTED]'
        );
      }
    }

    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      return null;
    }

    // Add additional context for EN13813 errors
    if (event.tags) {
      event.tags.module = 'en13813';
    }

    return event;
  },

  // Server-side error filtering
  ignoreErrors: [
    // Database connection errors (temporary)
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',

    // Supabase rate limiting
    'too many requests',
    'rate limit exceeded',

    // Expected validation errors
    'ValidationError',
    'ZodError',
  ],

  // Add server context
  initialScope: {
    tags: {
      component: 'server',
      runtime: 'node',
    },
  },
});

// Export Sentry for manual error reporting
export { Sentry };