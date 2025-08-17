'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Login attempt started', { email, password: password ? '[HIDDEN]' : 'empty' })
    setLoading(true)
    setError(null)

    // Temporärer Demo-Login für Entwicklung
    if (email === 'demo@example.com' && password === 'demo') {
      console.log('✅ Demo login detected, proceeding with demo authentication')
      // Simuliere erfolgreichen Login
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'demo-user-id',
        email: 'demo@example.com',
        tenant_id: 'demo-tenant-id'
      }))
      console.log('📦 Demo user data stored in localStorage')
      
      // Trigger custom event to notify useAuth
      window.dispatchEvent(new CustomEvent('demo-user-set'))
      console.log('📡 Demo user event dispatched')
      console.log('🚀 Redirecting to /en13813')
      
      // More detailed debugging
      console.log('Router object:', router)
      console.log('Current pathname:', window.location.pathname)
      console.log('Current href:', window.location.href)
      
      try {
        const result = router.push('/en13813')
        console.log('Router.push result:', result)
        console.log('✅ router.push executed successfully')
        
        // Check if navigation actually happened
        setTimeout(() => {
          console.log('After 1s - Current pathname:', window.location.pathname)
          console.log('After 1s - Current href:', window.location.href)
        }, 1000)
        
        setTimeout(() => {
          console.log('After 3s - Current pathname:', window.location.pathname) 
          console.log('After 3s - Current href:', window.location.href)
        }, 3000)
        
      } catch (error) {
        console.error('❌ Error during router.push:', error)
      }
      
      setLoading(false)
      return
    }

    try {
      console.log('🔗 Attempting Supabase authentication')
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log('❌ Supabase login error:', error.message)
        setError(error.message)
        setLoading(false)
        return
      }

      console.log('✅ Supabase login successful, redirecting to EN13813')
      router.push('/en13813')
      router.refresh()
    } catch (err) {
      console.log('💥 Login exception caught:', err)
      setError('Verbindung zum Server fehlgeschlagen. Nutze demo@example.com / demo für Demo-Zugang.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              create a new account
            </Link>
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo-Zugang:</strong><br/>
              Email: demo@example.com<br/>
              Passwort: demo
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            onClick={(e) => {
              console.log('🖱️ Login button clicked')
              console.log('📝 Form values:', { email, password: password ? '[HIDDEN]' : 'empty' })
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}