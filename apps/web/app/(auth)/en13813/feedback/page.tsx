'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Heart,
  AlertCircle,
  CheckCircle2,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  ThumbsDown,
  Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function FeedbackPage() {
  const router = useRouter()
  const [feedbackType, setFeedbackType] = useState('feature')
  const [priority, setPriority] = useState('medium')
  const [satisfaction, setSatisfaction] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [module, setModule] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/en13813/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          priority,
          satisfaction,
          title,
          description,
          module,
        }),
      })

      if (!response.ok) {
        throw new Error('Feedback konnte nicht gesendet werden')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/en13813/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const feedbackTypes = [
    {
      value: 'bug',
      label: 'Fehler melden',
      icon: Bug,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Etwas funktioniert nicht wie erwartet'
    },
    {
      value: 'feature',
      label: 'Feature-Wunsch',
      icon: Lightbulb,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Neue Funktion oder Verbesserung vorschlagen'
    },
    {
      value: 'improvement',
      label: 'Verbesserung',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Bestehende Funktion optimieren'
    },
    {
      value: 'praise',
      label: 'Lob & Positives',
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Was Ihnen besonders gut gefällt'
    },
  ]

  const modules = [
    { value: 'recipes', label: 'Rezeptverwaltung' },
    { value: 'batches', label: 'Chargenproduktion' },
    { value: 'tests', label: 'Prüfungen (ITT/FPC)' },
    { value: 'deviations', label: 'Abweichungsmanagement' },
    { value: 'dop', label: 'Leistungserklärungen' },
    { value: 'marking', label: 'CE-Kennzeichnung' },
    { value: 'calibration', label: 'Kalibrierung' },
    { value: 'audit', label: 'Interne Audits' },
    { value: 'general', label: 'Allgemein' },
    { value: 'other', label: 'Sonstiges' },
  ]

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold">Vielen Dank!</h2>
            <p className="text-gray-600">
              Ihr Feedback wurde erfolgreich übermittelt. Wir melden uns bei Ihnen!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            BETA FEEDBACK
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Ihr Feedback ist uns wichtig!
          </h1>
          <p className="text-lg text-gray-600">
            Helfen Sie uns, EstrichManager zu verbessern und Ihre Anforderungen perfekt zu erfüllen.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left side - Quick satisfaction rating */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Wie zufrieden sind Sie?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={satisfaction} onValueChange={setSatisfaction}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very-satisfied" id="very-satisfied" />
                      <Label htmlFor="very-satisfied" className="flex items-center gap-2 cursor-pointer">
                        <span className="text-2xl">😍</span>
                        <span>Sehr zufrieden</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="satisfied" id="satisfied" />
                      <Label htmlFor="satisfied" className="flex items-center gap-2 cursor-pointer">
                        <span className="text-2xl">😊</span>
                        <span>Zufrieden</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="neutral" id="neutral" />
                      <Label htmlFor="neutral" className="flex items-center gap-2 cursor-pointer">
                        <span className="text-2xl">😐</span>
                        <span>Neutral</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unsatisfied" id="unsatisfied" />
                      <Label htmlFor="unsatisfied" className="flex items-center gap-2 cursor-pointer">
                        <span className="text-2xl">😕</span>
                        <span>Unzufrieden</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very-unsatisfied" id="very-unsatisfied" />
                      <Label htmlFor="very-unsatisfied" className="flex items-center gap-2 cursor-pointer">
                        <span className="text-2xl">😞</span>
                        <span>Sehr unzufrieden</span>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Beta-Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Rezeptverwaltung</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Prüfungen (ITT/FPC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Leistungserklärungen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />
                  <span>Weitere Module in Entwicklung</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Feedback form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ihr Feedback</CardTitle>
                <CardDescription>
                  Jede Rückmeldung hilft uns, die Software besser zu machen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Feedback Type Selection */}
                  <div className="space-y-3">
                    <Label>Art des Feedbacks</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {feedbackTypes.map((type) => {
                        const Icon = type.icon
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFeedbackType(type.value)}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                              ${feedbackType === type.value
                                ? `border-blue-500 ${type.bgColor}`
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <Icon className={`w-5 h-5 ${type.color}`} />
                            <div className="text-left">
                              <div className="font-medium text-sm">{type.label}</div>
                              <div className="text-xs text-gray-600">{type.description}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Module Selection */}
                  <div>
                    <Label htmlFor="module">Betroffenes Modul</Label>
                    <Select value={module} onValueChange={setModule}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Bitte wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((mod) => (
                          <SelectItem key={mod.value} value={mod.value}>
                            {mod.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority for bugs and features */}
                  {(feedbackType === 'bug' || feedbackType === 'feature') && (
                    <div>
                      <Label htmlFor="priority">Priorität</Label>
                      <RadioGroup
                        value={priority}
                        onValueChange={setPriority}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low" className="cursor-pointer">Niedrig</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium" className="cursor-pointer">Mittel</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="high" />
                          <Label htmlFor="high" className="cursor-pointer">Hoch</Label>
                        </div>
                        {feedbackType === 'bug' && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="critical" id="critical" />
                            <Label htmlFor="critical" className="cursor-pointer text-red-600">Kritisch</Label>
                          </div>
                        )}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <Label htmlFor="title">
                      Titel <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder={
                        feedbackType === 'bug'
                          ? 'z.B. Fehler beim PDF-Export'
                          : feedbackType === 'feature'
                          ? 'z.B. Automatische Berichterstellung'
                          : 'z.B. Schnellere Ladezeiten'
                      }
                      className="mt-1"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">
                      Beschreibung <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={6}
                      placeholder={
                        feedbackType === 'bug'
                          ? 'Bitte beschreiben Sie den Fehler so genau wie möglich. Was haben Sie gemacht, als der Fehler auftrat?'
                          : 'Beschreiben Sie Ihre Idee oder Ihr Feedback ausführlich...'
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? 'Wird gesendet...' : 'Feedback senden'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Vielen Dank, dass Sie sich die Zeit nehmen, uns zu helfen!
            Als Beta-Tester haben Sie direkten Einfluss auf die Entwicklung von EstrichManager.
          </p>
        </div>
      </div>
    </div>
  )
}