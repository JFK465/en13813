import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED - Just pass through all requests
  return NextResponse.next()
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