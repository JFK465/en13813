'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { getSessionWithFallback, clearCachedSession, retryWithBackoff } from '@/lib/auth/session-utils'

type Profile = Database['public']['Tables']['profiles']['Row']
type Tenant = Database['public']['Tables']['tenants']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  tenant: Tenant | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, companyName?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  // Start with false for consistent hydration - will be set to true only when needed
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const supabase = useMemo(() => createClient(), [])
  
  // Setup auth state listener immediately
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)

        if (session?.user) {
          setUser(session.user)
          await loadUserData(session.user.id, supabase)
          setIsLoading(false)
        } else {
          setUser(null)
          setProfile(null)
          setTenant(null)
          setIsLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Get initial session
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    // Prevent re-initialization
    if (isInitialized) return

    // Get initial session with retry mechanism and better error handling
    const getInitialSession = async (retryCount = 0) => {
      const MAX_RETRIES = 2 // Reduced from 3
      const TIMEOUT_MS = 5000 // Reduced from 30 seconds to 5 seconds
      const RETRY_DELAYS = [500, 1000] // Reduced delays

      // Set loading true only when actually checking session
      if (retryCount === 0) {
        setIsLoading(true)
      }

      try {
        // Set timeout promise
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), TIMEOUT_MS)
        )

        // Use the enhanced session retrieval with fallback
        const sessionPromise = getSessionWithFallback(supabase)

        const session = await Promise.race([
          sessionPromise,
          timeoutPromise
        ])

        if (session?.user) {
          setUser(session.user)
          await loadUserData(session.user.id, supabase)
        }
      } catch (error: any) {
        console.error(`Session check attempt ${retryCount + 1} failed:`, error)

        // Retry logic with exponential backoff
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAYS[retryCount] || 5000
          console.log(`Retrying session check in ${delay}ms...`)

          setTimeout(() => {
            getInitialSession(retryCount + 1)
          }, delay)
          return // Important: return here to avoid setting isLoading to false during retry
        } else {
          // After all retries failed, in development use a mock user
          console.error('Session check failed after all retries.')

          if (process.env.NODE_ENV === 'development') {
            console.warn('🔧 Development mode: Using mock user for testing')
            // Create a mock user object for development
            const mockUser = {
              id: 'dev-user-123',
              email: 'dev@example.com',
              created_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              role: 'authenticated'
            } as any

            setUser(mockUser)
            // Mock profile data
            setProfile({
              id: 'dev-profile-123',
              user_id: 'dev-user-123',
              email: 'dev@example.com',
              display_name: 'Development User',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as any)
          }
        }
      }

      // Set loading to false after successful check or final retry
      setIsLoading(false)
      setIsInitialized(true)
    }

    getInitialSession()
  }, [supabase, isInitialized])
  
  const loadUserData = async (userId: string, client: ReturnType<typeof createClient>) => {
    try {
      // Load user profile with tenant
      const { data: profileData, error } = await client
        .from('profiles')
        .select(`
          *,
          tenants (*)
        `)
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error loading profile:', error)
        return
      }
      
      setProfile(profileData)
      setTenant(profileData.tenants as Tenant)
      
    } catch (error) {
      console.error('Error in loadUserData:', error)
    }
  }
  
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
  }
  
  const signUp = async (email: string, password: string, companyName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
        },
      },
    })
    
    if (error) throw error
  }
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear cached session on sign out
    clearCachedSession()
  }
  
  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id, supabase)
    }
  }
  
  const value: AuthContextType = {
    user,
    profile,
    tenant,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}