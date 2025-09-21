import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/en13813'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the specified next URL or dashboard
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Redirect to login with error if code exchange failed
  return NextResponse.redirect(
    new URL('/login?error=Could not authenticate user', requestUrl.origin)
  )
}