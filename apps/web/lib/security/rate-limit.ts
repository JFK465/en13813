import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Redis client (fallback to memory-based for development)
const redis = process.env.UPSTASH_REDIS_REST_URL 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined

// Rate limit configurations for different endpoints
const rateLimitConfigs = {
  // Authentication endpoints - strict limits
  auth: {
    requests: parseInt(process.env.RATE_LIMIT_AUTH_REQUESTS || '5'),
    window: process.env.RATE_LIMIT_AUTH_WINDOW || '15m', // 5 requests per 15 minutes
  },
  // API endpoints - moderate limits  
  api: {
    requests: parseInt(process.env.RATE_LIMIT_API_REQUESTS || '100'),
    window: process.env.RATE_LIMIT_API_WINDOW || '1m', // 100 requests per minute
  },
  // File uploads - very strict limits
  upload: {
    requests: 10,
    window: '1h', // 10 uploads per hour
  },
  // Report generation - strict limits (resource intensive)
  reports: {
    requests: 5,
    window: '10m', // 5 reports per 10 minutes
  },
  // General pages - lenient limits
  pages: {
    requests: 1000,
    window: '1m', // 1000 requests per minute
  },
  // Password reset - very strict
  password: {
    requests: 3,
    window: '1h', // 3 attempts per hour
  }
}

// Create rate limiters
export const rateLimiters = {
  auth: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rateLimitConfigs.auth.requests, rateLimitConfigs.auth.window),
    analytics: true,
    prefix: 'ratelimit:auth',
  }) : null,

  api: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rateLimitConfigs.api.requests, rateLimitConfigs.api.window),
    analytics: true,
    prefix: 'ratelimit:api',
  }) : null,

  upload: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rateLimitConfigs.upload.requests, rateLimitConfigs.upload.window),
    analytics: true,
    prefix: 'ratelimit:upload',
  }) : null,

  reports: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rateLimitConfigs.reports.requests, rateLimitConfigs.reports.window),
    analytics: true,
    prefix: 'ratelimit:reports',
  }) : null,

  pages: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rateLimitConfigs.pages.requests, rateLimitConfigs.pages.window),
    analytics: true,
    prefix: 'ratelimit:pages',
  }) : null,

  password: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rateLimitConfigs.password.requests, rateLimitConfigs.password.window),
    analytics: true,
    prefix: 'ratelimit:password',
  }) : null,
}

// Memory-based fallback for development
const memoryStore = new Map<string, { count: number; resetTime: number }>()

function memoryRateLimit(identifier: string, config: typeof rateLimitConfigs.auth): {
  success: boolean
  limit: number
  remaining: number
  reset: Date
} {
  const now = Date.now()
  const windowMs = parseWindow(config.window)
  const key = identifier
  
  const record = memoryStore.get(key)
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    const resetTime = now + windowMs
    memoryStore.set(key, { count: 1, resetTime })
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - 1,
      reset: new Date(resetTime)
    }
  }
  
  if (record.count >= config.requests) {
    return {
      success: false,
      limit: config.requests,
      remaining: 0,
      reset: new Date(record.resetTime)
    }
  }
  
  record.count++
  memoryStore.set(key, record)
  
  return {
    success: true,
    limit: config.requests,
    remaining: config.requests - record.count,
    reset: new Date(record.resetTime)
  }
}

function parseWindow(window: string): number {
  const unit = window.slice(-1)
  const value = parseInt(window.slice(0, -1))
  
  switch (unit) {
    case 's': return value * 1000
    case 'm': return value * 60 * 1000
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    default: return value
  }
}

// Get client identifier (IP + User ID if authenticated)
export function getClientIdentifier(request: NextRequest): string {
  // Get IP address
  const ip = request.ip ?? 
    request.headers.get('x-forwarded-for')?.split(',')[0] ?? 
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  
  // Try to get user ID from session if available
  const userId = request.headers.get('x-user-id') || 'anonymous'
  
  return `${ip}:${userId}`
}

// Rate limit middleware
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters
): Promise<NextResponse | null> {
  // Check if rate limiting is disabled
  if (process.env.DISABLE_RATE_LIMIT === 'true') {
    return null
  }
  
  const identifier = getClientIdentifier(request)
  const limiter = rateLimiters[type]
  const config = rateLimitConfigs[type]
  
  let result
  
  if (limiter) {
    // Use Redis-based rate limiter
    result = await limiter.limit(identifier)
  } else {
    // Use memory-based fallback
    result = memoryRateLimit(identifier, config)
  }
  
  // Add rate limit headers
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', result.reset.getTime().toString())
  
  if (!result.success) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((result.reset.getTime() - Date.now()) / 1000)
    headers.set('Retry-After', retryAfter.toString())
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${retryAfter} seconds.`,
        retryAfter 
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries())
        }
      }
    )
  }
  
  return null // No rate limit exceeded
}

// Specific rate limiting functions
export async function rateLimitAuth(request: NextRequest) {
  return applyRateLimit(request, 'auth')
}

export async function rateLimitAPI(request: NextRequest) {
  return applyRateLimit(request, 'api')
}

export async function rateLimitUpload(request: NextRequest) {
  return applyRateLimit(request, 'upload')
}

export async function rateLimitReports(request: NextRequest) {
  return applyRateLimit(request, 'reports')
}

export async function rateLimitPages(request: NextRequest) {
  return applyRateLimit(request, 'pages')
}

export async function rateLimitPassword(request: NextRequest) {
  return applyRateLimit(request, 'password')
}

// Clean up memory store periodically (for development)
if (typeof window === 'undefined' && !redis) {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key)
      }
    }
  }, 60000) // Clean up every minute
}