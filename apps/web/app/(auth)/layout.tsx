'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    console.log('🔒 AuthLayout useEffect triggered', { user: !!user, isLoading })
    if (!isLoading && !user) {
      console.log('❌ No user found, redirecting to login')
      router.push('/login')
    } else if (user) {
      console.log('✅ User found, allowing access')
    }
  }, [user, isLoading, router])

  // Don't show loading state during SSR - let the page render
  // The auth check will happen client-side
  if (typeof window === 'undefined') {
    // During SSR, render children immediately
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

  // Client-side loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Lädt...</p>
        </div>
      </div>
    )
  }

  if (!user) {
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