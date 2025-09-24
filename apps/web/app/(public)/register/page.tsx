'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/lib/auth/auth-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Sparkles, Users, Headphones, Percent, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [productionVolume, setProductionVolume] = useState('')
  const [goals, setGoals] = useState('')
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
      <div className="w-full max-w-4xl space-y-8 p-4">
        <div className="text-center">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            BETA
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Seien Sie einer der Ersten!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Testen Sie EstrichManager kostenlos und gestalten Sie die Zukunft der EN13813 Compliance-Software mit.
          </p>

          {/* Beta Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm mb-1">100% Kostenlos</h3>
                <p className="text-xs text-gray-600">Keine Kosten während der Beta-Phase</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Percent className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Exklusive Rabatte</h3>
                <p className="text-xs text-gray-600">50% Rabatt nach Beta-Ende</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Direkter Einfluss</h3>
                <p className="text-xs text-gray-600">Ihre Wünsche fließen in die Entwicklung ein</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Headphones className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Premium Support</h3>
                <p className="text-xs text-gray-600">Persönliche Betreuung & Onboarding</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold mb-2">Beta-Zugang anfordern</h2>
          <p className="text-sm text-gray-600 mb-6">
            Füllen Sie das Formular aus und starten Sie noch heute mit Ihrer kostenlosen Beta-Version.
          </p>

          <form className="space-y-6" onSubmit={handleRegister}>
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
              {/* First row - Company and Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left">
                  <Label htmlFor="companyName">
                    Firma <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1"
                    placeholder="Ihre Firma GmbH"
                  />
                </div>
                <div className="text-left">
                  <Label htmlFor="fullName">
                    Ihr Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                    placeholder="Max Mustermann"
                  />
                </div>
              </div>

              {/* Second row - Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left">
                  <Label htmlFor="email">
                    E-Mail <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                    placeholder="ihre@email.de"
                  />
                </div>
                <div className="text-left">
                  <Label htmlFor="phone">
                    Telefon <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

              {/* Third row - Password fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left">
                  <Label htmlFor="password">
                    Passwort <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                    placeholder="Mindestens 6 Zeichen"
                  />
                </div>
                <div className="text-left">
                  <Label htmlFor="confirm-password">
                    Passwort bestätigen <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                    placeholder="Passwort wiederholen"
                  />
                </div>
              </div>

              {/* Production Volume */}
              <div className="text-left">
                <Label htmlFor="productionVolume">
                  Jährliche Produktionsmenge (ca.)
                </Label>
                <Select value={productionVolume} onValueChange={setProductionVolume}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< 1000">Unter 1.000 Tonnen</SelectItem>
                    <SelectItem value="1000-5000">1.000 - 5.000 Tonnen</SelectItem>
                    <SelectItem value="5000-10000">5.000 - 10.000 Tonnen</SelectItem>
                    <SelectItem value="10000-25000">10.000 - 25.000 Tonnen</SelectItem>
                    <SelectItem value="> 25000">Über 25.000 Tonnen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Goals */}
              <div className="text-left">
                <Label htmlFor="goals">
                  Was möchten Sie mit EstrichManager erreichen? <span className="text-gray-400">(optional)</span>
                </Label>
                <Textarea
                  id="goals"
                  name="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="mt-1 min-h-[100px]"
                  placeholder="Erzählen Sie uns von Ihren aktuellen Herausforderungen bei der EN13813-Konformität..."
                />
              </div>
            </div>

            {/* Privacy notice */}
            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Shield className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 text-left">
                Ihre Daten sind sicher. Wir verwenden sie nur zur Beta-Registrierung und geben sie niemals an Dritte weiter.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <Link href="/login" className="text-sm text-blue-600 hover:underline flex items-center">
                  ← Zurück zum Login
                </Link>
                <div className="flex-1" />
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" disabled={loading}>
                  {loading ? 'Beta-Zugang wird erstellt...' : 'Beta-Zugang anfordern'}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Oder</span>
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
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-sm text-blue-900 mb-2">Was Sie in der Beta erwarten können:</h3>
          <ul className="text-xs text-blue-800 space-y-1 text-left">
            <li>✓ Vollständige EN13813-Konformitätsverwaltung</li>
            <li>✓ Rezeptverwaltung mit automatischer Kodierung</li>
            <li>✓ Erstprüfungen (ITT) und Werkseigene Produktionskontrolle (FPC)</li>
            <li>✓ Leistungserklärungen und CE-Kennzeichnung</li>
            <li>✓ Abweichungsmanagement nach EN 13813 § 6.3</li>
            <li>✓ Regelmäßige Updates basierend auf Ihrem Feedback</li>
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