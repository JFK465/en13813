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
  // Start with TRUE - we ARE loading initially until we know the auth state
  const [isLoading, setIsLoading] = useState(true)
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

  // Get initial session - SIMPLIFIED VERSION
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    // Prevent re-initialization
    if (isInitialized) return

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.warn('Session check error:', error)
        }

        if (session?.user) {
          console.log('✅ Session found:', session.user.email)
          setUser(session.user)
          await loadUserData(session.user.id, supabase)
        } else {
          console.log('ℹ️ No active session')
        }
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setIsInitialized(true)
        // IMPORTANT: Set loading to false after initial check
        setIsLoading(false)
      }
    }

    // Just call it once, no retries needed
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