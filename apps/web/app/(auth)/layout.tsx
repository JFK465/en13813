'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  
  console.log('👤 Auth state:', { user: !!user, isLoading, userDetails: user })

  useEffect(() => {
    console.log('🔒 AuthLayout useEffect triggered', { user: !!user, isLoading })
    if (!isLoading && !user) {
      console.log('❌ No user found, redirecting to login')
      router.push('/login')
    } else if (user) {
      console.log('✅ User found, allowing access')
    }
  }, [user, isLoading, router])

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