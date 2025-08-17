import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip all middleware processing for Next.js static assets and system files
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon') || 
      pathname.includes('.')) {
    return NextResponse.next()
  }

  try {
    // Only run session handling for page routes
    const response = await updateSession(request)
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/ (all Next.js internals)
     * - favicon.ico, robots.txt, etc.
     * - static files with extensions
     */
    '/((?!_next/|favicon.ico|robots.txt|.*\\.).*)',
  ],
}