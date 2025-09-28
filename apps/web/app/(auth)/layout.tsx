'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/core/useAuth'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('🔐 AuthLayout rendering')
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  console.log('👤 Auth state:', { user: !!user, isLoading, userDetails: user })

  // Check if we're in the EN13813 section
  const isEN13813Section = pathname?.startsWith('/en13813')

  // Track if auth check has completed
  const [authCheckComplete, setAuthCheckComplete] = useState(false)

  useEffect(() => {
    console.log('🔒 AuthLayout useEffect triggered', { user: !!user, isLoading })
    // Add a small delay to ensure auth state is fully initialized
    const timer = setTimeout(() => {
      if (!isLoading && !user) {
        console.log('❌ No user found, redirecting to login')
        router.push('/login')
      } else if (user) {
        console.log('✅ User found, allowing access')
      }
      setAuthCheckComplete(true)
    }, 100)

    // Fallback: If auth check takes too long, just show the page
    const fallbackTimer = setTimeout(() => {
      console.log('⚠️ Auth check timeout, showing page anyway')
      setAuthCheckComplete(true)
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
  }, [user, isLoading, router])

  // Show loading state only briefly, with a max timeout
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoading(true), 200) // Only show after 200ms
      const maxTimer = setTimeout(() => setShowLoading(false), 2000) // Hide after max 2s
      return () => {
        clearTimeout(timer)
        clearTimeout(maxTimer)
      }
    } else {
      setShowLoading(false)
    }
  }, [isLoading])

  if (showLoading && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Lädt...</p>
        </div>
      </div>
    )
  }

  // Don't block rendering if auth check has completed or timed out
  if (!authCheckComplete && !user && !isLoading) {
    return null
  }

  // For development: Allow access even without user after timeout
  if (authCheckComplete && !user && process.env.NODE_ENV === 'development') {
    console.log('⚠️ Development mode: Allowing access without authentication')
    // Continue rendering the page in development
  } else if (!user && !isLoading && authCheckComplete) {
    // In production, still block if no user
    return null
  }

  // If we're in EN13813 section, don't render the sidebar (it will be handled by EN13813 layout)
  if (isEN13813Section) {
    return children
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}