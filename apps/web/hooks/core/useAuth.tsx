'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

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
  // Start with false during SSR to prevent hydration mismatch
  const [isLoading, setIsLoading] = useState(() => typeof window === 'undefined' ? false : true)

  const supabase = useMemo(() => createClient(), [])
  
  useEffect(() => {
    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        // Set a longer timeout for the session check (10 seconds)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        )

        const sessionPromise = supabase.auth.getSession()

        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        if (session?.user) {
          setUser(session.user)
          await loadUserData(session.user.id, supabase)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          await loadUserData(session.user.id, supabase)
        } else {
          setUser(null)
          setProfile(null)
          setTenant(null)
        }
        
        setIsLoading(false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])
  
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