import { NextRequest, NextResponse } from 'next/server'

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; '),

  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',

  // Prevent content type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
    'bluetooth=()'
  ].join(', '),

  // HSTS (HTTP Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Remove server information
  'Server': '',
  'X-Powered-By': '',
}

// CORS configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS || 'https://yourdomain.com'
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-User-ID',
    'Accept',
    'Origin'
  ].join(', '),
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
}

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Apply CORS headers to response
export function applyCorsHeaders(response: NextResponse, request?: NextRequest): NextResponse {
  const origin = request?.headers.get('origin')
  
  // Dynamic CORS handling
  if (process.env.NODE_ENV === 'production' && origin) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',')
    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
  } else {
    // Development - allow all origins
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  return response
}

// Handle preflight requests
export function handlePreflightRequest(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 200 })
  
  // Apply CORS headers
  applyCorsHeaders(response, request)
  
  return response
}

// Content Security Policy for different page types
export function getCSPForPage(pageType: 'auth' | 'dashboard' | 'api' | 'public'): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : ''
  
  const baseCSP = {
    "default-src": ["'self'"],
    "connect-src": ["'self'", supabaseHost, "https://*.supabase.co", "wss://*.supabase.co"],
    "script-src": ["'self'"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "https:", "blob:"],
    "media-src": ["'self'", "https:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
    "block-all-mixed-content": []
  }

  // Adjust CSP based on page type
  switch (pageType) {
    case 'auth':
      // Stricter CSP for authentication pages
      baseCSP["script-src"] = ["'self'"]
      break
    
    case 'dashboard':
      // Allow some inline scripts for dashboard functionality
      baseCSP["script-src"] = ["'self'", "'unsafe-eval'", "'unsafe-inline'"]
      break
    
    case 'api':
      // Minimal CSP for API endpoints
      return "default-src 'none'"
    
    case 'public':
      // More lenient for public pages
      baseCSP["script-src"] = ["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com"]
      break
  }

  return Object.entries(baseCSP)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

// Security headers for API routes
export function getAPISecurityHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'",
  }
}

// File upload security headers
export function getFileUploadHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': 'attachment',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
  }
}

// Generate nonce for CSP
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// Apply nonce to CSP
export function applyNonceToCSP(csp: string, nonce: string): string {
  return csp.replace(
    /script-src ([^;]+)/,
    `script-src $1 'nonce-${nonce}'`
  )
}

// Validate request headers for security issues
export function validateRequestHeaders(request: NextRequest): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check for required headers
  if (!request.headers.get('user-agent')) {
    issues.push('Missing User-Agent header')
  }

  if (!request.headers.get('accept')) {
    issues.push('Missing Accept header')
  }

  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-cluster-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ]

  let forwardedHeaderCount = 0
  suspiciousHeaders.forEach(header => {
    if (request.headers.get(header)) {
      forwardedHeaderCount++
    }
  })

  if (forwardedHeaderCount > 2) {
    issues.push('Multiple forwarded headers detected (possible proxy spoofing)')
  }

  // Check for excessively long headers
  for (const [name, value] of request.headers.entries()) {
    if (value && value.length > 8192) {
      issues.push(`Header ${name} is excessively long`)
    }
  }

  // Check for dangerous header values
  const headerValuePatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i
  ]

  for (const [name, value] of request.headers.entries()) {
    if (value && headerValuePatterns.some(pattern => pattern.test(value))) {
      issues.push(`Header ${name} contains potentially dangerous content`)
    }
  }

  return {
    valid: issues.length === 0,
    issues
  }
}