'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/lib/auth/auth-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Sparkles, Users, MessageSquare, Gift } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setSuccess(message)
    }
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      // Validation is now handled by authService

      // Use auth service for signup
      const { data, requiresEmailConfirmation } = await authService.signUp({
        email,
        password,
        companyName,
        fullName,
      })

      if (requiresEmailConfirmation) {
        setSuccess('Please check your email to confirm your account')
        setTimeout(() => {
          router.push('/login?message=Please check your email to confirm your account')
        }, 3000)
      } else if (data?.session) {
        // Auto-signed in
        router.push('/en13813/dashboard')
      } else {
        // Redirect to login page with success message
        router.push('/login?registered=true')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleDemoSignup = () => {
    // Set demo user
    authService.setDemoUser()
    router.push('/en13813/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="w-full max-w-2xl space-y-8 p-4">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold text-blue-600">EstrichManager</h1>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              BETA
            </Badge>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Jetzt kostenlos testen und mitgestalten!
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Seien Sie einer der ersten Nutzer und prägen Sie die Zukunft von EstrichManager
          </p>

          {/* Beta Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <Gift className="w-8 h-8 text-blue-600 mb-2 mx-auto" />
                <h3 className="font-semibold text-sm mb-1">100% Kostenlos</h3>
                <p className="text-xs text-gray-600">Während der gesamten Beta-Phase</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="pt-6">
                <MessageSquare className="w-8 h-8 text-purple-600 mb-2 mx-auto" />
                <h3 className="font-semibold text-sm mb-1">Direkter Einfluss</h3>
                <p className="text-xs text-gray-600">Ihr Feedback formt die Software</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-green-600 mb-2 mx-auto" />
                <h3 className="font-semibold text-sm mb-1">Early Adopter Vorteile</h3>
                <p className="text-xs text-gray-600">50% Rabatt nach Beta</p>
              </CardContent>
            </Card>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            Bereits ein Beta-Tester?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Anmelden
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1"
                  placeholder="Mustermann Estrichwerke GmbH"
                />
              </div>
            </div>
            
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" disabled={loading}>
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? 'Beta-Zugang wird erstellt...' : 'Kostenlos Beta-Zugang sichern'}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoSignup}
            >
              Mit Demo-Account testen
            </Button>
          </div>
        </form>
        
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-semibold text-sm text-amber-900 mb-2">Beta-Phase Details</h3>
          <ul className="text-xs text-amber-800 space-y-1 text-left">
            <li>• Beta läuft bis Ende März 2025</li>
            <li>• Alle Kernfunktionen verfügbar</li>
            <li>• Regelmäßige Updates und neue Features</li>
            <li>• Direkter Support-Kanal für Feedback</li>
            <li>• Ihre Daten bleiben nach Beta erhalten</li>
          </ul>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            Mit der Registrierung stimmen Sie unseren{' '}
            <Link href="/terms" className="underline hover:text-gray-700">Nutzungsbedingungen</Link>
            {' '}und{' '}
            <Link href="/privacy" className="underline hover:text-gray-700">Datenschutzrichtlinien</Link>
            {' '}zu.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  )
}