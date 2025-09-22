// Simple logger that works both on client and server without file system dependencies

export interface LogContext {
  userId?: string
  tenantId?: string
  requestId?: string
  recipeId?: string
  batchId?: string
  testId?: string
  dopId?: string
  auditId?: string
  errorCode?: string
  stackTrace?: string
  duration?: number
  errorMessage?: string
  [key: string]: any
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

class Logger {
  private isServer = typeof window === 'undefined'
  private isDevelopment = process.env.NODE_ENV !== 'production'

  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      service: 'en13813-web',
      environment: process.env.NODE_ENV || 'development',
      ...context
    }

    // In production, return JSON string
    if (!this.isDevelopment) {
      return JSON.stringify(logEntry)
    }

    // In development, return formatted string
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const formattedMessage = this.formatLog(level, message, context)

    // Use appropriate console method based on level
    switch (level) {
      case 'error':
        console.error(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage)
        }
        break
      default:
        console.log(formattedMessage)
    }

    // In production on server, also send to external service if configured
    if (this.isServer && !this.isDevelopment) {
      this.sendToExternalService(level, message, context)
    }
  }

  private sendToExternalService(level: LogLevel, message: string, context?: LogContext) {
    // This could send to Sentry, LogRocket, or any other service
    // For now, it's a placeholder that uses Sentry if available
    if (typeof global !== 'undefined' && (global as any).Sentry) {
      const Sentry = (global as any).Sentry

      if (level === 'error') {
        Sentry.captureException(new Error(message), {
          contexts: { custom: context },
          level: 'error'
        })
      } else {
        Sentry.captureMessage(message, level as any)
      }
    }
  }

  error(message: string, context?: LogContext & { error?: Error }) {
    if (context?.error) {
      context.stackTrace = context.error.stack
      context.errorMessage = context.error.message
      delete context.error
    }
    this.log('error', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  // Specific logging methods for EN13813 operations
  logRecipeOperation(operation: string, recipeId: string, context?: LogContext) {
    this.info(`Recipe ${operation}`, { ...context, recipeId, operation })
  }

  logTestResult(testType: 'ITT' | 'FPC', testId: string, compliant: boolean, context?: LogContext) {
    this.info(`${testType} test completed`, {
      ...context,
      testId,
      testType,
      compliant,
      operation: 'test_result'
    })
  }

  logDoPGeneration(dopId: string, success: boolean, context?: LogContext) {
    const level = success ? 'info' : 'error'
    const message = success ? 'DoP generated successfully' : 'DoP generation failed'
    this.log(level, message, { ...context, dopId, success, operation: 'dop_generation' })
  }

  logAuditEvent(auditId: string, event: string, context?: LogContext) {
    this.info(`Audit ${event}`, { ...context, auditId, event, operation: 'audit' })
  }

  logSecurityEvent(event: string, userId: string, tenantId: string, context?: LogContext) {
    this.warn(`Security event: ${event}`, {
      ...context,
      userId,
      tenantId,
      securityEvent: event,
      operation: 'security'
    })
  }

  logPerformance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 5000 ? 'warn' : 'info'
    this.log(level, `Performance: ${operation}`, {
      ...context,
      duration,
      operation: 'performance',
      performanceOperation: operation
    })
  }

  // Utility to measure and log execution time
  async measureTime<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.logPerformance(operation, duration, context)
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.error(`${operation} failed`, {
        ...context,
        duration,
        error: error as Error
      })
      throw error
    }
  }
}

// HTTP logging stream for Morgan (if needed)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim(), { type: 'http' })
  },
}

// Export singleton instance
const logger = new Logger()
export default logger

// Also export for backward compatibility
export { logger as loggerInstance }