"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ContactForm() {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="py-12"
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Vielen Dank für Ihre Nachricht!</strong>
                <br />
                Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Max Mustermann"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Unternehmen *</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="Mustermann Estrichwerk GmbH"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="max@estrichwerk.de"
                />
              </div>

              <div className="space-y-2">
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

            <div className="space-y-2">
              <Label>Betreff *</Label>
              <RadioGroup
                value={formData.subject}
                onValueChange={(value) =>
                  setFormData({ ...formData, subject: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="general" id="general" />
                  <Label htmlFor="general" className="font-normal cursor-pointer">
                    Allgemeine Anfrage
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="demo" id="demo" />
                  <Label htmlFor="demo" className="font-normal cursor-pointer">
                    Demo vereinbaren
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="support" id="support" />
                  <Label htmlFor="support" className="font-normal cursor-pointer">
                    Support-Anfrage
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partnership" id="partnership" />
                  <Label htmlFor="partnership" className="font-normal cursor-pointer">
                    Partnerschaft
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Nachricht *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Beschreiben Sie Ihr Anliegen..."
                rows={6}
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="privacy"
                required
                className="mt-1"
              />
              <Label htmlFor="privacy" className="text-sm text-gray-600 font-normal">
                Ich habe die{" "}
                <a href="/datenschutz" className="text-blue-600 hover:underline">
                  Datenschutzerklärung
                </a>{" "}
                gelesen und akzeptiere diese. *
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                "Wird gesendet..."
              ) : (
                <>
                  Nachricht senden
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}