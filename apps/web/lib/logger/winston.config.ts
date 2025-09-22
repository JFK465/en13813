import winston from 'winston'

// Winston configuration for different environments
export const winstonConfig = {
  development: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
  production: {
    level: 'info',
    handleExceptions: true,
    json: true,
    colorize: false,
  },
  test: {
    level: 'error',
    handleExceptions: false,
    json: false,
    colorize: false,
  },
}

// Custom error filter to exclude sensitive data
export const errorFilter = winston.format((info) => {
  // Remove sensitive data from logs
  if (info.context) {
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization']
    sensitiveKeys.forEach(key => {
      if (info.context[key]) {
        info.context[key] = '[REDACTED]'
      }
    })
  }
  return info
})

// Correlation ID generator for request tracking
export function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Log categories for EN13813 operations
export const LOG_CATEGORIES = {
  RECIPE: 'recipe',
  BATCH: 'batch',
  TEST: 'test',
  DOP: 'dop',
  AUDIT: 'audit',
  DEVIATION: 'deviation',
  CALIBRATION: 'calibration',
  MARKING: 'marking',
  FPC: 'fpc',
  ITT: 'itt',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  DATABASE: 'database',
  EMAIL: 'email',
  PDF: 'pdf',
  API: 'api',
} as const

export type LogCategory = typeof LOG_CATEGORIES[keyof typeof LOG_CATEGORIES]

// Structured logging templates
export const LOG_TEMPLATES = {
  API_REQUEST: (method: string, path: string, statusCode: number) => ({
    message: `API ${method} ${path}`,
    category: LOG_CATEGORIES.API,
    method,
    path,
    statusCode,
  }),

  DATABASE_QUERY: (table: string, operation: string, duration: number) => ({
    message: `Database ${operation} on ${table}`,
    category: LOG_CATEGORIES.DATABASE,
    table,
    operation,
    duration,
  }),

  AUTHENTICATION: (userId: string, success: boolean, method: string) => ({
    message: `Authentication ${success ? 'successful' : 'failed'}`,
    category: LOG_CATEGORIES.SECURITY,
    userId,
    success,
    method,
  }),

  PDF_GENERATION: (type: string, success: boolean, duration: number) => ({
    message: `PDF ${type} generation ${success ? 'completed' : 'failed'}`,
    category: LOG_CATEGORIES.PDF,
    pdfType: type,
    success,
    duration,
  }),

  EMAIL_SENT: (to: string, subject: string, success: boolean) => ({
    message: `Email ${success ? 'sent' : 'failed'}`,
    category: LOG_CATEGORIES.EMAIL,
    recipient: to,
    subject,
    success,
  }),

  COMPLIANCE_CHECK: (type: string, result: boolean, details: any) => ({
    message: `Compliance check ${type} ${result ? 'passed' : 'failed'}`,
    category: LOG_CATEGORIES.TEST,
    checkType: type,
    result,
    details,
  }),
} as const