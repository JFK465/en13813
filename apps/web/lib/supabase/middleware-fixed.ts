import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

// Helper to clear old/duplicate cookies
function clearOldCookies(request: NextRequest, response: NextResponse) {
  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'next-auth.session-token',
    'next-auth.csrf-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token'
  ]

  cookiesToClear.forEach(cookieName => {
    if (request.cookies.has(cookieName)) {
      response.cookies.delete(cookieName)
    }
  })

  // Clear old Supabase cookies with wrong project ref
  const allCookies = request.cookies.getAll()
  allCookies.forEach(cookie => {
    // Clear cookies from old project (ovcxtfsonjrtyiwdwqmc)
    if (cookie.name.includes('ovcxtfsonjrtyiwdwqmc')) {
      response.cookies.delete(cookie.name)
    }
    // Keep only cookies from new project (fhftgdffhkhmbwqbwiyt)
    if (cookie.name.includes('sb-') && !cookie.name.includes('fhftgdffhkhmbwqbwiyt')) {
      response.cookies.delete(cookie.name)
    }
  })

  return response
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Clear old cookies to prevent 431 error
  response = clearOldCookies(request, response)

  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Limit cookie size to prevent 431 error
            if (value && value.length > 3900) {
              console.warn(`Cookie ${name} is too large (${value.length} bytes), truncating...`)
              return
            }
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.delete(name)
            response.cookies.delete(name)
          },
        },
      }
    )

    // Simplified tenant handling for localhost
    const hostname = request.headers.get('host') || 'localhost'
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')

    // For localhost, always use default tenant
    if (isLocalhost) {
      response.headers.set('x-tenant-slug', 'demo-estrichwerke')
      response.headers.set('x-tenant-id', '11111111-1111-1111-1111-111111111111')
    }

    // Check authentication for protected routes
    const pathname = request.nextUrl.pathname
    const isAuthRoute = pathname.startsWith('/auth') ||
                       pathname.startsWith('/login') ||
                       pathname.startsWith('/register') ||
                       pathname === '/'

    const isPublicRoute = pathname.startsWith('/api/') ||
                         pathname.startsWith('/_next/') ||
                         pathname.startsWith('/public/') ||
                         pathname.includes('/favicon')

    if (!isAuthRoute && !isPublicRoute) {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        // Clear all auth-related cookies on auth error
        const authCookies = request.cookies.getAll().filter(c =>
          c.name.includes('sb-') || c.name.includes('auth')
        )
        authCookies.forEach(cookie => {
          response.cookies.delete(cookie.name)
        })

        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)

    // On error, clear all cookies and redirect to login
    const allCookies = request.cookies.getAll()
    allCookies.forEach(cookie => {
      response.cookies.delete(cookie.name)
    })

    return NextResponse.redirect(new URL('/login', request.url))
  }
}