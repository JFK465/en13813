import { createClient } from '@/lib/supabase/client'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export interface AuthError {
  code: string
  message: string
  details?: any
}

export interface SignUpOptions {
  email: string
  password: string
  companyName?: string
  fullName?: string
}

export interface SignInOptions {
  email: string
  password: string
}

export class AuthService {
  private supabase = createClient()

  async signUp({ email, password, companyName, fullName }: SignUpOptions) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        throw new Error('An account with this email already exists')
      }

      // Attempt signup
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Signup error:', error)
        
        // Parse and throw appropriate error
        if (error.message.includes('Database error')) {
          throw new Error('Database configuration error. Please contact support.')
        } else if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in instead.')
        } else if (error.status === 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(error.message || 'Registration failed')
        }
      }

      return { data, requiresEmailConfirmation: data?.user && !data.session }
    } catch (error: any) {
      console.error('SignUp error:', error)
      throw error
    }
  }

  async signIn({ email, password }: SignInOptions) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('SignIn error:', error)
        
        // Parse and throw appropriate error
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email before signing in')
        } else if (error.status === 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(error.message || 'Sign in failed')
        }
      }

      return data
    } catch (error: any) {
      console.error('SignIn error:', error)
      throw error
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      console.error('SignOut error:', error)
      throw new Error('Failed to sign out')
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Reset password error:', error)
      throw new Error('Failed to send reset password email')
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Update password error:', error)
      throw new Error('Failed to update password')
    }
  }

  async getSession() {
    try {
      const { data, error } = await this.supabase.auth.getSession()
      if (error) throw error
      return data.session
    } catch (error: any) {
      console.error('Get session error:', error)
      return null
    }
  }

  async getUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser()
      if (error) throw error
      return data.user
    } catch (error: any) {
      console.error('Get user error:', error)
      return null
    }
  }

  // Demo user handling
  setDemoUser() {
    const demoUserData = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      tenant_id: 'demo-tenant-id',
      full_name: 'Demo User',
      company_name: 'Demo Company',
    }

    localStorage.setItem('demo_user', JSON.stringify(demoUserData))
    window.dispatchEvent(new CustomEvent('demo-user-set'))
    
    return demoUserData
  }

  removeDemoUser() {
    localStorage.removeItem('demo_user')
    window.dispatchEvent(new CustomEvent('demo-user-removed'))
  }

  isDemoUser() {
    return !!localStorage.getItem('demo_user')
  }

  getDemoUser() {
    const demoUser = localStorage.getItem('demo_user')
    return demoUser ? JSON.parse(demoUser) : null
  }
}

export const authService = new AuthService()