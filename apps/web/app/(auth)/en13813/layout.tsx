'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/core/useAuth'
import { EN13813Sidebar } from '@/components/en13813/EN13813Sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function EN13813Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [authCheckComplete, setAuthCheckComplete] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading && !user) {
        router.push('/login')
      }
      setAuthCheckComplete(true)
    }, 100)

    // Fallback timeout
    const fallbackTimer = setTimeout(() => {
      setAuthCheckComplete(true)
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
  }, [user, isLoading, router])

  // Show loading only initially, with a timeout
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (isLoading && typeof window !== 'undefined') {
      // Only show loading after a short delay to avoid flashing
      const timer = setTimeout(() => setShowLoading(true), 100)
      return () => clearTimeout(timer)
    } else {
      setShowLoading(false)
    }
  }, [isLoading])

  // Add a max loading time
  useEffect(() => {
    if (showLoading) {
      const maxLoadingTimer = setTimeout(() => {
        setShowLoading(false)
      }, 3000) // Max 3 seconds loading
      return () => clearTimeout(maxLoadingTimer)
    }
  }, [showLoading])

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Lade EN 13813 Modul...</p>
        </div>
      </div>
    )
  }

  // Don't block rendering if auth check has completed or timed out
  if (!authCheckComplete && !user && !isLoading) {
    return null
  }

  // For development: Allow access even without proper auth after timeout
  if (authCheckComplete && !user && process.env.NODE_ENV === 'development') {
    console.log('⚠️ EN13813: Development mode - allowing access without authentication')
    // Continue rendering in development
  } else if (!user && !isLoading && authCheckComplete) {
    // In production, still block if no user
    return null
  }

  return (
    <SidebarProvider>
      <EN13813Sidebar />
      <SidebarInset>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}