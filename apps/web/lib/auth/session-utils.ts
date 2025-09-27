import { SupabaseClient } from '@supabase/supabase-js'

const SESSION_CACHE_KEY = 'supabase.auth.session'
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

interface CachedSession {
  session: any
  timestamp: number
}

/**
 * Get session from cache if valid
 */
function getCachedSession(): any | null {
  try {
    if (typeof window === 'undefined') return null

    const cached = localStorage.getItem(SESSION_CACHE_KEY)
    if (!cached) return null

    const { session, timestamp }: CachedSession = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid
    if (now - timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(SESSION_CACHE_KEY)
      return null
    }

    return session
  } catch (error) {
    console.error('Error reading cached session:', error)
    return null
  }
}

/**
 * Cache session for faster access
 */
function setCachedSession(session: any): void {
  try {
    if (typeof window === 'undefined') return

    const cached: CachedSession = {
      session,
      timestamp: Date.now()
    }

    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cached))
  } catch (error) {
    console.error('Error caching session:', error)
  }
}

/**
 * Clear cached session
 */
export function clearCachedSession(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_CACHE_KEY)
    }
  } catch (error) {
    console.error('Error clearing cached session:', error)
  }
}

/**
 * Get session with fallback to cache
 */
export async function getSessionWithFallback(
  supabase: SupabaseClient
): Promise<any | null> {
  try {
    // Try to get fresh session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (!error && session) {
      setCachedSession(session)
      return session
    }

    // Fallback to cached session if available
    const cachedSession = getCachedSession()
    if (cachedSession) {
      console.log('Using cached session due to network issue')
      return cachedSession
    }

    return null
  } catch (error) {
    console.error('Error getting session with fallback:', error)

    // Last resort: try cached session
    const cachedSession = getCachedSession()
    if (cachedSession) {
      console.log('Using cached session due to error')
      return cachedSession
    }

    return null
  }
}

/**
 * Validate Supabase connection health
 */
export async function validateSupabaseConnection(
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    // Simple health check - just try to get auth session
    const promise = supabase.auth.getSession()

    await Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      )
    ])

    clearTimeout(timeoutId)
    return true
  } catch (error) {
    console.error('Supabase connection validation failed:', error)
    return false
  }
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}