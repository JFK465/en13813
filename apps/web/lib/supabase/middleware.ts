import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Extract subdomain for multi-tenancy
  const hostname = request.headers.get('host')!
  const hostParts = hostname.split('.')
  
  // For localhost development, use default tenant
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  let subdomain = 'default'
  
  if (!isLocalhost) {
    // Production: extract actual subdomain
    subdomain = hostParts[0]
  } else if (isDevelopment && process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG) {
    // In development, use configured default tenant
    subdomain = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG
  }
  
  // Store in header for components
  response.headers.set('x-tenant-slug', subdomain)
  
  // Check tenant exists and is active (skip for auth routes and certain pages)
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || 
                     request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register') ||
                     request.nextUrl.pathname === '/' // Allow homepage
  
  const isPublicRoute = request.nextUrl.pathname.startsWith('/api/') ||
                       request.nextUrl.pathname.startsWith('/_next/') ||
                       request.nextUrl.pathname.includes('/favicon')
  
  // Skip tenant check for localhost, auth routes, public routes, and system subdomains
  const skipTenantCheck = isLocalhost || isAuthRoute || isPublicRoute || 
                         subdomain === 'app' || subdomain === 'www'
  
  if (!skipTenantCheck) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, status')
      .eq('slug', subdomain)
      .single()
    
    if (!tenant || tenant.status !== 'active') {
      // Redirect to login page with error message instead of non-existent route
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'invalid_tenant')
      return NextResponse.redirect(loginUrl)
    }
    
    response.headers.set('x-tenant-id', tenant.id)
  } else if (isLocalhost) {
    // For localhost, try to get default tenant or first active tenant
    const { data: defaultTenant } = await supabase
      .from('tenants')
      .select('id, slug')
      .eq('status', 'active')
      .limit(1)
      .single()
    
    if (defaultTenant) {
      response.headers.set('x-tenant-id', defaultTenant.id)
      response.headers.set('x-tenant-slug', defaultTenant.slug)
    }
  }

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && !isAuthRoute && !request.nextUrl.pathname.startsWith('/')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}