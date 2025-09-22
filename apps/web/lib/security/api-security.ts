import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateRequestBody, validateQueryParams } from './validation'
import { getAPISecurityHeaders } from './headers'

// API Key validation
export interface APIKeyValidation {
  valid: boolean
  keyId?: string
  permissions?: string[]
  tenantId?: string
  error?: string
}

export async function validateAPIKey(request: NextRequest): Promise<APIKeyValidation> {
  const authHeader = request.headers.get('Authorization')
  const apiKeyHeader = request.headers.get('X-API-Key')
  
  const apiKey = authHeader?.replace('Bearer ', '') || apiKeyHeader
  
  if (!apiKey) {
    return { valid: false, error: 'API key required' }
  }

  // Basic API key format validation
  if (!/^sk_[a-zA-Z0-9]{32,}$/.test(apiKey)) {
    return { valid: false, error: 'Invalid API key format' }
  }

  // TODO: Implement actual API key lookup from database
  // This is a placeholder - in production, you'd query your api_keys table
  
  return {
    valid: true,
    keyId: 'mock-key-id',
    permissions: ['read', 'write'],
    tenantId: 'mock-tenant-id'
  }
}

// Request signature validation (for webhooks)
export async function validateWebhookSignature(
  request: NextRequest,
  secret: string,
  body: string
): Promise<boolean> {
  const signature = request.headers.get('X-Webhook-Signature') || 
                   request.headers.get('X-Hub-Signature-256')
  
  if (!signature) return false

  // Extract signature value (remove algorithm prefix)
  const signatureValue = signature.replace(/^sha256=/, '')
  
  // Calculate expected signature
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const bodyData = encoder.encode(body)
  
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, bodyData)
    const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return calculatedSignature === signatureValue
  } catch {
    return false
  }
}

// API response wrapper with security headers
export function createSecureAPIResponse(
  data: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  const headers = {
    ...getAPISecurityHeaders(),
    ...additionalHeaders
  }

  return NextResponse.json(data, { status, headers })
}

// Error response with security considerations
export function createAPIErrorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse {
  // Don't leak sensitive information in production
  const response = {
    error,
    ...(process.env.NODE_ENV === 'development' && details ? { details } : {})
  }

  return createSecureAPIResponse(response, status)
}

// Generic API route wrapper with security
export function withSecurity<T = any>(
  handler: (request: NextRequest, context: { params?: any }) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireAPIKey?: boolean
    rateLimit?: keyof typeof import('./rate-limit').rateLimiters
    validateBody?: z.ZodSchema
    validateQuery?: z.ZodSchema
    permissions?: string[]
  } = {}
) {
  return async (request: NextRequest, context: { params?: any }): Promise<NextResponse> => {
    try {
      // Validate API key if required
      if (options.requireAPIKey) {
        const apiKeyValidation = await validateAPIKey(request)
        if (!apiKeyValidation.valid) {
          return createAPIErrorResponse(
            apiKeyValidation.error || 'Invalid API key',
            401
          )
        }

        // Check permissions
        if (options.permissions && apiKeyValidation.permissions) {
          const hasPermission = options.permissions.some(permission =>
            apiKeyValidation.permissions!.includes(permission)
          )
          if (!hasPermission) {
            return createAPIErrorResponse('Insufficient permissions', 403)
          }
        }
      }

      // Validate request body
      if (options.validateBody && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        try {
          const body = await request.json()
          const validation = validateRequestBody(body, options.validateBody)
          if (!validation.success) {
            return createAPIErrorResponse(
              'Validation error',
              400,
              { errors: validation.errors }
            )
          }
        } catch (error) {
          return createAPIErrorResponse('Invalid JSON body', 400)
        }
      }

      // Validate query parameters
      if (options.validateQuery) {
        const url = new URL(request.url)
        const validation = validateQueryParams(url.searchParams, options.validateQuery)
        if (!validation.success) {
          return createAPIErrorResponse(
            'Invalid query parameters',
            400,
            { errors: validation.errors }
          )
        }
      }

      // Call the actual handler
      return await handler(request, context)

    } catch (error: any) {
      console.error('API Error:', error)
      
      // Don't leak error details in production
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error'
      
      return createAPIErrorResponse(errorMessage, 500)
    }
  }
}

// Input sanitization for API requests
export function sanitizeAPIInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeAPIInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeAPIInput(value)
    }
    return sanitized
  }
  
  return input
}

// Request logging for security audit
export function logAPIRequest(
  request: NextRequest,
  response: NextResponse,
  duration: number,
  userId?: string
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.ip || request.headers.get('x-forwarded-for'),
    userId,
    statusCode: response.status,
    duration,
    requestId: response.headers.get('X-Request-ID')
  }

  // In production, send to your logging service
  console.log('API Request:', JSON.stringify(logData))
}

// SQL injection prevention helpers
export function escapeSQLIdentifier(identifier: string): string {
  // Remove non-alphanumeric characters except underscores
  return identifier.replace(/[^a-zA-Z0-9_]/g, '')
}

export function validateSQLQuery(query: string): { valid: boolean; reason?: string } {
  // Basic SQL injection pattern detection
  const dangerousPatterns = [
    /;\s*(drop|delete|truncate|alter|create)\s/gi,
    /union\s+select/gi,
    /'\s*or\s*'?1'?\s*='?1/gi,
    /'\s*or\s*'?\w+'\s*='?\w+/gi,
    /'.*?;.*?--/gi,
    /\/\*.*?\*\//gi,
    /xp_cmdshell/gi,
    /sp_executesql/gi
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return { 
        valid: false, 
        reason: `Potentially dangerous SQL pattern detected: ${pattern.source}` 
      }
    }
  }

  return { valid: true }
}

// NoSQL injection prevention
export function sanitizeMongoQuery(query: any): any {
  if (typeof query === 'string') {
    // Remove potential NoSQL operators
    return query.replace(/\$\w+/g, '')
  }
  
  if (Array.isArray(query)) {
    return query.map(sanitizeMongoQuery)
  }
  
  if (typeof query === 'object' && query !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(query)) {
      // Remove keys that start with $ (MongoDB operators)
      if (!key.startsWith('$')) {
        sanitized[key] = sanitizeMongoQuery(value)
      }
    }
    return sanitized
  }
  
  return query
}

// Request size validation
export function validateRequestSize(request: NextRequest, maxSize: number = 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > maxSize) {
    return false
  }
  return true
}

// IP whitelist/blacklist checking
export function checkIPAccess(
  ip: string,
  whitelist?: string[],
  blacklist?: string[]
): { allowed: boolean; reason?: string } {
  // Check blacklist first
  if (blacklist && blacklist.includes(ip)) {
    return { allowed: false, reason: 'IP is blacklisted' }
  }

  // If whitelist exists, IP must be in it
  if (whitelist && whitelist.length > 0 && !whitelist.includes(ip)) {
    return { allowed: false, reason: 'IP not in whitelist' }
  }

  return { allowed: true }
}

// Generate API key
export function generateAPIKey(): string {
  const prefix = 'sk_'
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const key = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return prefix + key
}

// Validate request origin
export function validateOrigin(request: NextRequest): { valid: boolean; reason?: string } {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Allow same-origin requests
  if (!origin && !referer) {
    return { valid: true }
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  
  if (origin && !allowedOrigins.includes(origin)) {
    return { valid: false, reason: 'Origin not allowed' }
  }

  if (referer) {
    const refererOrigin = new URL(referer).origin
    if (!allowedOrigins.includes(refererOrigin)) {
      return { valid: false, reason: 'Referer origin not allowed' }
    }
  }

  return { valid: true }
}