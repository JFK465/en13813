import * as Sentry from "@sentry/nextjs";

/**
 * Custom Sentry wrapper for EN13813 application
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
   * Track performance of critical operations
   */
  startTransaction: (name: string, op: string = "function") => {
    return Sentry.startTransaction({ name, op });
  },

  /**
   * Track specific EN13813 operations
   */
  trackOperation: async <T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: Record<string, any>,
  ): Promise<T> => {
    const transaction = Sentry.startTransaction({
      name: operationName,
      op: "en13813.operation",
    });

    Sentry.getCurrentScope().setSpan(transaction);

    try {
      const result = await operation();
      transaction.setStatus("ok");
      return result;
    } catch (error) {
      transaction.setStatus("internal_error");
      sentryCapture.exception(error, { operation: operationName, ...context });
      throw error;
    } finally {
      transaction.finish();
    }
  },
};
