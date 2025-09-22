import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

// Format for console output (development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    return `${timestamp} [${level}]: ${message} ${metaString}`
  })
)

// Format for file output (production)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create transports array based on environment
const transports: winston.transport[] = []

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  )
}

// File transports for production
if (process.env.NODE_ENV === 'production') {
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    })
  )

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    })
  )

  // Also log to console in production (for Vercel logs)
  transports.push(
    new winston.transports.Console({
      format: fileFormat,
    })
  )
}

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format: fileFormat,
  defaultMeta: {
    service: 'en13813-web',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version,
  },
  transports,
  exitOnError: false,
})

// Create a stream for Morgan HTTP logging
export const stream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

// Enhanced logging functions with context
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
  [key: string]: any
}

class Logger {
  private addContext(message: string, context?: LogContext) {
    return { message, ...context }
  }

  error(message: string, context?: LogContext & { error?: Error }) {
    if (context?.error) {
      context.stackTrace = context.error.stack
      context.errorMessage = context.error.message
      delete context.error
    }
    logger.error(this.addContext(message, context))
  }

  warn(message: string, context?: LogContext) {
    logger.warn(this.addContext(message, context))
  }

  info(message: string, context?: LogContext) {
    logger.info(this.addContext(message, context))
  }

  http(message: string, context?: LogContext) {
    logger.http(this.addContext(message, context))
  }

  debug(message: string, context?: LogContext) {
    logger.debug(this.addContext(message, context))
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
    logger[level](this.addContext(message, { ...context, dopId, success, operation: 'dop_generation' }))
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
    logger[level](this.addContext(`Performance: ${operation}`, {
      ...context,
      duration,
      operation: 'performance',
      performanceOperation: operation
    }))
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

// Export singleton instance
const loggerInstance = new Logger()
export default loggerInstance

// Also export for backward compatibility
export { loggerInstance as logger }