import { z } from 'zod'
import DOMPurify from 'dompurify'
import validator from 'validator'
import { NextRequest } from 'next/server'

// XSS Protection - sanitize HTML content
export function sanitizeHtml(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  } else {
    // Client-side: use DOMPurify
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false
    })
  }
}

// Input validation schemas
export const validationSchemas = {
  // Authentication
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .refine(email => validator.isEmail(email), 'Invalid email format'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),

  // User data
  userName: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-ZäöüÄÖÜß\s\-\.]+$/, 'Name contains invalid characters'),

  companyName: z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name too long')
    .regex(/^[a-zA-Z0-9äöüÄÖÜß\s\-\.\,\&]+$/, 'Company name contains invalid characters'),

  // Document data
  documentTitle: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .transform(sanitizeHtml),

  documentDescription: z.string()
    .max(1000, 'Description too long')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : val),

  documentCategory: z.string()
    .max(100, 'Category too long')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : val),

  // Workflow data
  workflowTitle: z.string()
    .min(1, 'Workflow title is required')
    .max(255, 'Title too long')
    .transform(sanitizeHtml),

  workflowDescription: z.string()
    .max(2000, 'Description too long')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : val),

  // Comments
  comment: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment too long')
    .transform(sanitizeHtml),

  // Report data
  reportTitle: z.string()
    .min(1, 'Report title is required')
    .max(255, 'Title too long')
    .transform(sanitizeHtml),

  reportDescription: z.string()
    .max(1000, 'Description too long')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : val),

  // IDs and UUIDs
  uuid: z.string()
    .uuid('Invalid ID format'),

  // Dates
  isoDate: z.string()
    .datetime('Invalid date format')
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')),

  // File uploads
  fileName: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9\-_\.\s\(\)]+$/, 'Filename contains invalid characters')
    .refine(name => !name.includes('..'), 'Filename cannot contain path traversal'),

  fileType: z.string()
    .regex(/^[a-zA-Z0-9\-\/]+$/, 'Invalid file type'),

  // API pagination
  page: z.coerce.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .max(1000, 'Page too high'),

  limit: z.coerce.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit too high'),

  // Search
  searchQuery: z.string()
    .max(100, 'Search query too long')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : val),

  // Tenant/Organization
  tenantSlug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-z0-9\-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine(slug => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with hyphen'),
}

// Request validation
export function validateRequestBody<T extends z.ZodSchema>(
  body: unknown,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(body)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Invalid request data'] }
  }
}

// Query parameter validation
export function validateQueryParams<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  try {
    const params = Object.fromEntries(searchParams.entries())
    const result = schema.parse(params)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Invalid query parameters'] }
  }
}

// File validation
export function validateFile(file: File, options: {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
}): { valid: true } | { valid: false; error: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes, allowedExtensions } = options

  // Check file size
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB` 
    }
  }

  // Check file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    }
  }

  // Check file extension
  if (allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      return { 
        valid: false, 
        error: `File extension .${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}` 
      }
    }
  }

  // Check for dangerous file names
  const dangerousPatterns = [
    /^\./,  // Hidden files
    /\.\./,  // Path traversal
    /[<>:"|?*]/,  // Windows reserved characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows reserved names
  ]

  if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
    return { valid: false, error: 'Filename contains dangerous characters or patterns' }
  }

  return { valid: true }
}

// IP validation and geoblocking
export function validateClientIP(request: NextRequest): {
  valid: boolean
  ip: string
  blocked?: boolean
  reason?: string
} {
  const ip = request.ip ?? 
    request.headers.get('x-forwarded-for')?.split(',')[0] ?? 
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  // Basic IP validation
  if (!validator.isIP(ip)) {
    return { valid: false, ip, blocked: true, reason: 'Invalid IP address' }
  }

  // Check for private/local IPs in production
  // TODO: Implement isPrivateIP check
  // if (process.env.NODE_ENV === 'production' && validator.isPrivateIP(ip)) {
  //   return { valid: false, ip, blocked: true, reason: 'Private IP not allowed in production' }
  // }

  // Blocklist check (you can extend this with a database or external service)
  const blockedIPs = process.env.BLOCKED_IPS?.split(',') || []
  if (blockedIPs.includes(ip)) {
    return { valid: false, ip, blocked: true, reason: 'IP address is blocked' }
  }

  return { valid: true, ip }
}

// User Agent validation
export function validateUserAgent(request: NextRequest): {
  valid: boolean
  suspicious: boolean
  reason?: string
} {
  const userAgent = request.headers.get('user-agent') || ''

  // Check for missing User-Agent
  if (!userAgent) {
    return { valid: false, suspicious: true, reason: 'Missing User-Agent header' }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /python/i,
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
  ]

  // Allow legitimate bots but flag others
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slackbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
  ]

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))
  const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent))

  if (isSuspicious && !isLegitimate) {
    return { 
      valid: true, // Don't block, but flag as suspicious
      suspicious: true, 
      reason: 'Suspicious User-Agent detected' 
    }
  }

  return { valid: true, suspicious: false }
}

// CSRF protection
export function validateCSRFToken(request: NextRequest, expectedToken?: string): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true // CSRF protection not needed for safe methods
  }

  const tokenFromHeader = request.headers.get('x-csrf-token')
  const tokenFromCookie = request.cookies.get('csrf-token')?.value

  if (!expectedToken) {
    expectedToken = tokenFromCookie
  }

  return !!(tokenFromHeader && expectedToken && tokenFromHeader === expectedToken)
}

// Content validation for rich text
export function validateRichText(content: string, maxLength: number = 10000): {
  valid: boolean
  sanitized: string
  error?: string
} {
  if (content.length > maxLength) {
    return {
      valid: false,
      sanitized: '',
      error: `Content exceeds maximum length of ${maxLength} characters`
    }
  }

  const sanitized = sanitizeHtml(content)

  // Check for excessive nesting (potential DoS)
  const nestingLevel = (content.match(/<[^>]+>/g) || []).length
  if (nestingLevel > 100) {
    return {
      valid: false,
      sanitized: '',
      error: 'Content has excessive HTML nesting'
    }
  }

  return {
    valid: true,
    sanitized
  }
}