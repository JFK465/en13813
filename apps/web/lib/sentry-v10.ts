import * as Sentry from "@sentry/nextjs";

/**
 * Modern Sentry v10 wrapper for EN13813 application
 * Compatible with @sentry/nextjs v10.x
 */
export const sentryCapture = {
  /**
   * Capture an exception with EN13813-specific context
   */
  exception: (error: Error | unknown, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
      console.error("Sentry Exception:", error, context);
      return;
    }

    // Use isolationScope for v10 compatibility
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext("en13813", context);
      }
      Sentry.captureException(error);
    });
  },

  /**
   * Capture a message with severity level
   */
  message: (message: string, level: "info" | "warning" | "error" = "info") => {
    if (process.env.NODE_ENV === "development" && !process.env.SENTRY_DEBUG) {
      console.log(`Sentry ${level}:`, message);
      return;
    }

    const severityLevel =
      level === "error" ? "error" : level === "warning" ? "warning" : "info";
    Sentry.captureMessage(message, severityLevel);
  },

  /**
   * Track user actions for better debugging
   */
  breadcrumb: (message: string, data?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      message,
      level: "info",
      category: "en13813",
      data,
      timestamp: Date.now() / 1000,
    });
  },

  /**
   * Set user context for better error tracking
   */
  setUser: (user: { id: string; email?: string; tenant?: string } | null) => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        tenant: user.tenant,
      });
    } else {
      Sentry.setUser(null);
    }
  },

  /**
   * Track specific EN13813 operations with Sentry v10 startSpan
   */
  trackOperation: async <T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: Record<string, any>,
  ): Promise<T> => {
    // Use startSpan for v10 compatibility
    return Sentry.startSpan(
      {
        name: operationName,
        op: "en13813.operation",
        attributes: context || {},
      },
      async (span) => {
        try {
          const result = await operation();
          span.setStatus({ code: 1, message: "ok" });
          return result;
        } catch (error) {
          span.setStatus({ code: 2, message: "error" });
          sentryCapture.exception(error, { operation: operationName, ...context });
          throw error;
        }
      }
    );
  },

  /**
   * Measure performance of synchronous operations
   */
  measurePerformance: <T>(
    operationName: string,
    operation: () => T,
    context?: Record<string, any>,
  ): T => {
    return Sentry.startSpan(
      {
        name: operationName,
        op: "en13813.measure",
        attributes: context || {},
      },
      (span) => {
        try {
          const result = operation();
          span.setStatus({ code: 1, message: "ok" });
          return result;
        } catch (error) {
          span.setStatus({ code: 2, message: "error" });
          sentryCapture.exception(error, { operation: operationName, ...context });
          throw error;
        }
      }
    );
  },

  /**
   * Flush all pending Sentry events
   */
  flush: async (timeout: number = 2000): Promise<boolean> => {
    try {
      return await Sentry.flush(timeout);
    } catch {
      return false;
    }
  },

  /**
   * Get Sentry client for advanced usage
   */
  getClient: () => {
    return Sentry.getClient();
  },
};