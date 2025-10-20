'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Sparkles,
  Users,
  Tag,
  Gift,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileText,
  ClipboardCheck,
} from 'lucide-react'

export default function BetaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    companySize: '',
    currentManagement: '',
    challenges: [] as string[],
    challengeLevel: '',
    privacy: false,
    newsletter: false,
  })

  const companySizes = [
    '1-10 Mitarbeiter',
    '11-50 Mitarbeiter',
    '51-200 Mitarbeiter',
    '201-500 Mitarbeiter',
    '500+ Mitarbeiter',
  ]

  const challengeOptions = [
    'Rezeptverwaltung und -dokumentation',
    'EN13813 Compliance sicherstellen',
    'Leistungserklärungen (DoP) erstellen',
    'Chargen-Tracking und Rückverfolgbarkeit',
    'Prüfberichte und ITT/FPC managen',
    'CE-Kennzeichnung korrekt durchführen',
    'Abweichungsmanagement (CAPA)',
    'Kalibrierung von Prüfgeräten',
    'Interne Audits dokumentieren',
  ]

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      challenges: checked
        ? [...prev.challenges, value]
        : prev.challenges.filter((c) => c !== value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/beta-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Failed to submit beta registration:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Vielen Dank für Ihr Interesse!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Wir haben Ihre Beta-Anfrage erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 text-left mb-8">
              <h3 className="font-semibold mb-2">Was passiert als Nächstes?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Sie erhalten eine Bestätigungs-E-Mail mit weiteren Informationen</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Unser Team richtet Ihren Beta-Zugang ein</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Sie erhalten Ihre Zugangsdaten und eine persönliche Einführung</span>
                </li>
              </ul>
            </div>
            <Button asChild size="lg">
              <Link href="/">Zurück zur Startseite</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">BETA-PROGRAMM</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 bg-clip-text text-transparent">
            EN13813-Software im Beta-Test
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Testen Sie kostenlos unsere Compliance-Automatisierung für Estrichwerke und sparen Sie
            wertvolle Zeit bei der EN13813-Dokumentation.
          </p>

          {/* Beta Benefits */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Limited Beta Access</h3>
              <p className="text-sm text-gray-600">Werden Sie Beta-Tester</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Exklusive Community</h3>
              <p className="text-sm text-gray-600">Direkter Draht zum Team</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">50% Rabatt</h3>
              <p className="text-sm text-gray-600">Nach der Beta-Phase</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Gift className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Kostenlos testen</h3>
              <p className="text-sm text-gray-600">Keine Kreditkarte nötig</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">Beta-Zugang anfordern</h2>
              <p className="text-gray-600">
                Füllen Sie das Formular aus und starten Sie in 24 Stunden
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Vorname <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Nachname <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    E-Mail <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Company Fields */}
              <div className="space-y-2">
                <Label htmlFor="company">
                  Unternehmen <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">
                  Unternehmensgröße <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.companySize}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, companySize: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Größe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Management */}
              <div className="space-y-2">
                <Label htmlFor="currentManagement">Wie managen Sie EN13813 aktuell?</Label>
                <Textarea
                  id="currentManagement"
                  rows={3}
                  placeholder="z.B. Excel, Papier, andere Software..."
                  value={formData.currentManagement}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, currentManagement: e.target.value }))
                  }
                />
              </div>

              {/* Challenges */}
              <div className="space-y-3">
                <Label>Ihre EN13813-Herausforderungen</Label>
                <div className="space-y-2">
                  {challengeOptions.map((challenge) => (
                    <div key={challenge} className="flex items-start gap-3">
                      <Checkbox
                        id={challenge}
                        checked={formData.challenges.includes(challenge)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(challenge, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={challenge}
                        className="text-sm font-normal leading-relaxed cursor-pointer"
                      >
                        {challenge}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenge Level */}
              <div className="space-y-2">
                <Label htmlFor="challengeLevel">
                  Wie herausfordernd ist EN13813 für Sie aktuell?{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.challengeLevel}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, challengeLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Option..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Kein Problem</SelectItem>
                    <SelectItem value="2">2 - Leicht herausfordernd</SelectItem>
                    <SelectItem value="3">3 - Mäßig herausfordernd</SelectItem>
                    <SelectItem value="4">4 - Sehr herausfordernd</SelectItem>
                    <SelectItem value="5">5 - Extrem herausfordernd</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Privacy Consent */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacy"
                    required
                    checked={formData.privacy}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, privacy: checked as boolean }))
                    }
                  />
                  <Label htmlFor="privacy" className="text-sm font-normal leading-relaxed">
                    Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
                    <Link href="/datenschutz" className="text-blue-600 hover:underline">
                      Datenschutzerklärung
                    </Link>{' '}
                    zu. <span className="text-red-500">*</span>
                  </Label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, newsletter: checked as boolean }))
                      }
                    />
                    <div>
                      <Label htmlFor="newsletter" className="text-sm font-semibold mb-1">
                        COMPLIANCE NEWSLETTER
                      </Label>
                      <p className="text-xs text-gray-600 mb-1">
                        Wöchentliche Insights • Sofort-Alerts bei kritischen Änderungen •
                        Experten-Guides
                      </p>
                      <p className="text-xs text-gray-500">
                        Kostenlos • DSGVO-konform • Jederzeit abmeldbar
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg"
              >
                {isSubmitting ? (
                  'Wird gesendet...'
                ) : (
                  <>
                    Beta-Zugang anfordern
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/50 backdrop-blur rounded-lg p-6">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">100% DSGVO-konform</h3>
              <p className="text-sm text-gray-600">Ihre Daten sind sicher</p>
            </div>
            <div className="bg-white/50 backdrop-blur rounded-lg p-6">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">EN13813 zertifiziert</h3>
              <p className="text-sm text-gray-600">Norm-konforme Dokumentation</p>
            </div>
            <div className="bg-white/50 backdrop-blur rounded-lg p-6">
              <ClipboardCheck className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Keine Verpflichtungen</h3>
              <p className="text-sm text-gray-600">Jederzeit kündbar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
