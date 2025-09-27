/**
 * Simple Error Logger that works everywhere
 * Falls back to console.error if Sentry is not available
 */

interface ErrorContext {
  user?: string;
  page?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log error to Sentry if available, otherwise console
   */
  logError(error: Error | unknown, context?: ErrorContext) {
    // Always log to console for debugging
    console.error('Error occurred:', error, context);

    // Try to send to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;

      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: context,
          extra: context?.metadata,
        });
      } else {
        Sentry.captureMessage(String(error), 'error', {
          tags: context,
          extra: context?.metadata,
        });
      }

      console.log('✅ Error sent to Sentry');
    } else {
      console.log('⚠️ Sentry not available, logged to console only');
    }

    // In production, also send to a backup endpoint
    if (!this.isDevelopment && typeof window !== 'undefined') {
      this.sendToBackupLogger(error, context);
    }
  }

  /**
   * Send errors to a backup logging endpoint
   */
  private async sendToBackupLogger(error: Error | unknown, context?: ErrorContext) {
    try {
      const errorData = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    } catch (e) {
      // Silently fail backup logging
      console.error('Backup logging failed:', e);
    }
  }

  /**
   * Test if Sentry is working
   */
  testSentry() {
    const testError = new Error('Test error - Checking if Sentry is working');
    this.logError(testError, {
      action: 'test',
      page: 'test-page',
    });
  }
}

export const errorLogger = new ErrorLogger();