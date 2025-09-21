'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authService } from '@/lib/auth/auth-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await authService.resetPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-gray-600">
            We&apos;ve sent a password reset link to {email}
          </p>
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
              className="font-medium text-primary hover:underline"
            >
              try again
            </button>
          </p>
          <Link href="/login">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Forgot your password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="inline mr-1 h-3 w-3" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}