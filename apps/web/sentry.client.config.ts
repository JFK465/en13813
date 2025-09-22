import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Sentry DSN - MUST be configured in production
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Before sending event to Sentry
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }

    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      return null;
    }

    // Filter out known non-critical errors
    const error = hint.originalException;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message as string;

      // Skip network errors that are expected
      if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
        return null;
      }

      // Skip user-cancelled operations
      if (message.includes('AbortError') || message.includes('cancelled')) {
        return null;
      }
    }

    return event;
  },

  // Breadcrumbs configuration
  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
      return null;
    }

    // Add EN13813-specific context to breadcrumbs
    if (breadcrumb.category === 'navigation') {
      const url = breadcrumb.data?.to || '';
      if (url.includes('/en13813/')) {
        breadcrumb.data = {
          ...breadcrumb.data,
          module: 'en13813',
          feature: extractFeatureFromUrl(url),
        };
      }
    }

    return breadcrumb;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',

    // Network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',

    // User actions
    'AbortError',
    'cancelled',
  ],

  // Allowed URLs for error reporting
  allowUrls: [
    /https:\/\/.*\.en13813\.app/,
    /http:\/\/localhost:3001/,
  ],
});

// Helper function to extract feature from URL
function extractFeatureFromUrl(url: string): string {
  const parts = url.split('/');
  const en13813Index = parts.indexOf('en13813');
  if (en13813Index !== -1 && en13813Index < parts.length - 1) {
    return parts[en13813Index + 1];
  }
  return 'unknown';
}

// Export Sentry for manual error reporting
export { Sentry };