'use client'

import { createContext, useContext, useEffect, useState } from 'react'
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
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()
  
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      // Check for demo user first
      const demoUser = localStorage.getItem('demo_user')
      if (demoUser) {
        console.log('🎭 Demo user found in localStorage')
        const demoData = JSON.parse(demoUser)
        // Create a mock user object
        const mockUser = {
          id: demoData.id,
          email: demoData.email,
          user_metadata: { tenant_id: demoData.tenant_id }
        } as unknown as User
        
        setUser(mockUser)
        
        // Set mock profile and tenant
        setProfile({
          id: demoData.id,
          user_id: demoData.id,
          full_name: 'Demo User',
          tenant_id: demoData.tenant_id,
          role: 'owner',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        
        setTenant({
          id: demoData.tenant_id,
          name: 'Demo Company',
          slug: 'demo-company',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        
        setIsLoading(false)
        return
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await loadUserData(session.user.id)
      }
      
      setIsLoading(false)
    }
    
    getInitialSession()
    
    // Listen for localStorage changes (for demo user)
    const handleStorageChange = () => {
      console.log('📦 localStorage changed, checking for demo user')
      getInitialSession()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events when demo user is set
    const handleDemoUserSet = () => {
      console.log('🎭 Demo user set event triggered')
      getInitialSession()
    }
    
    window.addEventListener('demo-user-set', handleDemoUserSet)
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          await loadUserData(session.user.id)
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
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('demo-user-set', handleDemoUserSet)
    }
  }, [])
  
  const loadUserData = async (userId: string) => {
    try {
      // Load user profile with tenant
      const { data: profileData, error } = await supabase
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
      await loadUserData(user.id)
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