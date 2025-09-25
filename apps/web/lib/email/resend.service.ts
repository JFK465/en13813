import { Resend } from 'resend'
import logger from '@/lib/logger'
import { emailTemplates } from './email-templates'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
}

export class EmailService {
  private resend: Resend | null = null
  private from: string

  constructor() {
    // Only initialize Resend if API key is available
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY)
    }
    this.from = process.env.EMAIL_FROM || 'EstrichManager <noreply@estrichmanager.de>'
  }

  private isEnabled(): boolean {
    return !!this.resend && !!process.env.RESEND_API_KEY
  }

  async sendEmail(options: EmailOptions): Promise<{ id?: string; error?: string }> {
    if (!this.isEnabled()) {
      logger.warn('Email service not configured - skipping email', {
        to: options.to,
        subject: options.subject
      })
      return { error: 'Email service not configured' }
    }

    try {
      // Resend requires either 'react' or 'html'/'text'
      // We only use html/text, not react components
      const emailData: any = {
        from: this.from,
        to: options.to,
        subject: options.subject,
      }

      // Add html or text content
      if (options.html) {
        emailData.html = options.html
      }
      if (options.text) {
        emailData.text = options.text
      }

      // Add optional fields
      if (options.attachments && options.attachments.length > 0) {
        emailData.attachments = options.attachments.map(att => ({
          filename: att.filename,
          content: att.content instanceof Buffer
            ? att.content.toString('base64')
            : att.content,
          type: att.contentType,
        }))
      }
      if (options.replyTo) {
        emailData.reply_to = options.replyTo
      }
      if (options.cc) {
        emailData.cc = options.cc
      }
      if (options.bcc) {
        emailData.bcc = options.bcc
      }

      const result = await this.resend!.emails.send(emailData)

      logger.info('Email sent successfully', {
        emailId: result.data?.id,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        category: 'EMAIL_SENT'
      })

      return { id: result.data?.id }
    } catch (error) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error: error as Error,
        errorCode: 'EMAIL_SEND_FAILED'
      })
      return { error: 'Failed to send email' }
    }
  }

  // Specialized email methods for EN13813 operations

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject: 'Willkommen bei EstrichManager',
      html: emailTemplates.welcome(userName),
    })
  }

  async sendPasswordResetEmail(userEmail: string, resetLink: string): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject: 'Passwort zurücksetzen - EstrichManager',
      html: emailTemplates.passwordReset(resetLink),
    })
  }

  async sendAuditReportEmail(
    recipientEmail: string,
    auditNumber: string,
    reportBuffer: Buffer
  ): Promise<void> {
    await this.sendEmail({
      to: recipientEmail,
      subject: `Auditbericht ${auditNumber} - EstrichManager`,
      html: emailTemplates.auditReport(auditNumber),
      attachments: [
        {
          filename: `Auditbericht_${auditNumber}.pdf`,
          content: reportBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
  }

  async sendDeviationNotification(
    recipientEmails: string[],
    deviationTitle: string,
    deviationDescription: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    const priorityLabels = {
      low: 'NIEDRIG',
      medium: 'MITTEL',
      high: 'HOCH',
      critical: 'KRITISCH'
    }

    await this.sendEmail({
      to: recipientEmails,
      subject: `[${priorityLabels[priority]}] Neue Abweichung: ${deviationTitle} - EstrichManager`,
      html: emailTemplates.deviationNotification(deviationTitle, deviationDescription, priority),
    })
  }

  async sendTestReminderEmail(
    recipientEmail: string,
    testType: string,
    dueDate: Date,
    recipeName: string
  ): Promise<void> {
    await this.sendEmail({
      to: recipientEmail,
      subject: `Prüfung fällig: ${testType} am ${dueDate.toLocaleDateString('de-DE')} - EstrichManager`,
      html: emailTemplates.testReminder(testType, dueDate, recipeName),
    })
  }

  async sendDoPGeneratedEmail(
    recipientEmail: string,
    dopNumber: string,
    recipeName: string,
    dopPdfBuffer?: Buffer
  ): Promise<void> {
    const attachments = dopPdfBuffer
      ? [
          {
            filename: `Leistungserklaerung_${dopNumber}.pdf`,
            content: dopPdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : undefined

    await this.sendEmail({
      to: recipientEmail,
      subject: `Leistungserklärung ${dopNumber} erstellt - EstrichManager`,
      html: emailTemplates.dopGenerated(dopNumber, recipeName, dopPdfBuffer),
      attachments,
    })
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export for testing and custom instances
export default EmailService