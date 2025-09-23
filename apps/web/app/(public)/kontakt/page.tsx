"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  Headphones,
  Calendar
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
      })
    }, 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "E-Mail",
      value: "info@estrichmanager.de",
      link: "mailto:info@estrichmanager.de",
    },
    {
      icon: Phone,
      title: "Telefon",
      value: "+49 (0) 123 456789",
      link: "tel:+49123456789",
    },
    {
      icon: MapPin,
      title: "Adresse",
      value: "Musterstraße 123, 12345 Berlin",
      link: null,
    },
    {
      icon: Clock,
      title: "Geschäftszeiten",
      value: "Mo-Fr 8:00 - 17:00 Uhr",
      link: null,
    },
  ]

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chatten Sie direkt mit unserem Support-Team",
      availability: "Mo-Fr 9:00 - 17:00",
      action: "Chat starten",
    },
    {
      icon: Headphones,
      title: "Telefon-Support",
      description: "Sprechen Sie mit unseren Estrich-Experten",
      availability: "Mo-Fr 8:00 - 17:00",
      action: "Anrufen",
    },
    {
      icon: Calendar,
      title: "Demo vereinbaren",
      description: "Persönliche Produktvorstellung",
      availability: "Nach Vereinbarung",
      action: "Termin buchen",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
          >
            Wir sind für Sie da
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            Haben Sie Fragen zu EstrichManager? Benötigen Sie eine persönliche Beratung?
            Unser Team aus Estrich-Experten hilft Ihnen gerne weiter.
          </motion.p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Kontaktformular</CardTitle>
                  <CardDescription>
                    Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden bei Ihnen.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Vielen Dank für Ihre Nachricht! Wir melden uns schnellstmöglich bei Ihnen.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Max Mustermann"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Unternehmen</Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Mustermann GmbH"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="email">E-Mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="max@beispiel.de"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefon</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+49 123 456789"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Betreff *</Label>
                        <RadioGroup
                          value={formData.subject}
                          onValueChange={(value) => setFormData({ ...formData, subject: value })}
                          className="mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="general" id="general" />
                            <Label htmlFor="general" className="font-normal">
                              Allgemeine Anfrage
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="demo" id="demo" />
                            <Label htmlFor="demo" className="font-normal">
                              Demo-Termin vereinbaren
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="support" id="support" />
                            <Label htmlFor="support" className="font-normal">
                              Technischer Support
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pricing" id="pricing" />
                            <Label htmlFor="pricing" className="font-normal">
                              Preise & Lizenzen
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="message">Nachricht *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Beschreiben Sie Ihr Anliegen..."
                        />
                      </div>

                      <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                          "Wird gesendet..."
                        ) : (
                          <>
                            Nachricht senden
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Quick Contact Info */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Kontaktinformationen</h2>
                <div className="space-y-4">
                  {contactInfo.map((item) => (
                    <div key={item.title} className="flex items-start gap-4">
                      <item.icon className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.link ? (
                          <a
                            href={item.link}
                            className="text-blue-600 hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-gray-600">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Options */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Support-Optionen</h2>
                <div className="space-y-4">
                  {supportOptions.map((option) => (
                    <Card key={option.title}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <option.icon className="h-5 w-5 text-blue-600" />
                          {option.title}
                        </CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {option.availability}
                          </span>
                          <Button variant="outline" size="sm">
                            {option.action}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="px-6 py-24 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-gray-100 h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Interaktive Karte</p>
              <p className="text-sm text-gray-500 mt-2">
                Musterstraße 123, 12345 Berlin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold">
            Noch unschlüssig?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Testen Sie EstrichManager einfach 14 Tage kostenlos und unverbindlich.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">
                Jetzt kostenlos testen
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}