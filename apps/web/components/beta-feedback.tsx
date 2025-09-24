'use client'

import { useState } from 'react'
import { MessageSquare, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function BetaFeedback() {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!feedbackType || !message) return

    setIsSubmitting(true)

    try {
      // Here you would send the feedback to your backend
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      })

      if (response.ok) {
        // Reset form and close dialog
        setFeedbackType('')
        setMessage('')
        setIsOpen(false)
        // You could show a success toast here
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating Beta Feedback Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          size="lg"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          <span>Beta Feedback</span>
          <Badge
            variant="secondary"
            className="ml-2 bg-white/20 text-white border-white/30"
          >
            NEU
          </Badge>
        </Button>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Ihr Feedback ist uns wichtig!
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                BETA
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Helfen Sie uns, EstrichManager zu verbessern. Jedes Feedback zählt!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Feedback-Typ
              </label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Typ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 Fehler gefunden</SelectItem>
                  <SelectItem value="feature">✨ Feature-Wunsch</SelectItem>
                  <SelectItem value="improvement">💡 Verbesserungsvorschlag</SelectItem>
                  <SelectItem value="praise">❤️ Lob & Positives</SelectItem>
                  <SelectItem value="other">💬 Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Ihre Nachricht
              </label>
              <Textarea
                placeholder="Beschreiben Sie Ihr Feedback..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              <p className="font-semibold mb-1">Beta-Tester Vorteile:</p>
              <ul className="space-y-1 text-xs">
                <li>• Direkter Draht zum Entwicklungsteam</li>
                <li>• Ihre Ideen werden priorisiert umgesetzt</li>
                <li>• Exklusive Updates über neue Features</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!feedbackType || !message || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Wird gesendet...' : 'Feedback senden'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}