import { Resend } from 'resend'
import logger from '@/lib/logger'

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
    this.from = process.env.EMAIL_FROM || 'EN13813 System <noreply@en13813.app>'
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
    const html = `
      <h1>Willkommen bei EN13813 Compliance Management</h1>
      <p>Hallo ${userName},</p>
      <p>Ihr Account wurde erfolgreich erstellt. Sie können sich jetzt anmelden und mit der Verwaltung Ihrer EN13813-konformen Rezepturen beginnen.</p>
      <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
      <p>Mit freundlichen Grüßen,<br>Ihr EN13813 Team</p>
    `

    await this.sendEmail({
      to: userEmail,
      subject: 'Willkommen bei EN13813 Compliance Management',
      html,
    })
  }

  async sendPasswordResetEmail(userEmail: string, resetLink: string): Promise<void> {
    const html = `
      <h1>Passwort zurücksetzen</h1>
      <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
      <p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
      <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Passwort zurücksetzen</a></p>
      <p>Dieser Link ist 1 Stunde gültig.</p>
      <p>Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
      <p>Mit freundlichen Grüßen,<br>Ihr EN13813 Team</p>
    `

    await this.sendEmail({
      to: userEmail,
      subject: 'Passwort zurücksetzen - EN13813',
      html,
    })
  }

  async sendAuditReportEmail(
    recipientEmail: string,
    auditNumber: string,
    reportBuffer: Buffer
  ): Promise<void> {
    const html = `
      <h1>Audit Report - ${auditNumber}</h1>
      <p>Sehr geehrte Damen und Herren,</p>
      <p>anbei erhalten Sie den Audit-Bericht für Audit ${auditNumber}.</p>
      <p>Der Bericht enthält:</p>
      <ul>
        <li>Executive Summary</li>
        <li>Detaillierte Prüfpunkte</li>
        <li>Identifizierte Abweichungen</li>
        <li>Empfohlene Maßnahmen</li>
      </ul>
      <p>Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.</p>
      <p>Mit freundlichen Grüßen,<br>Ihr QM-Team</p>
    `

    await this.sendEmail({
      to: recipientEmail,
      subject: `Audit Report - ${auditNumber}`,
      html,
      attachments: [
        {
          filename: `Audit_Report_${auditNumber}.pdf`,
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
    const priorityColor = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#FF5722',
      critical: '#F44336',
    }[priority]

    const html = `
      <h1 style="color: ${priorityColor}">Neue Abweichung: ${deviationTitle}</h1>
      <p><strong>Priorität:</strong> <span style="color: ${priorityColor}">${priority.toUpperCase()}</span></p>
      <p><strong>Beschreibung:</strong></p>
      <p>${deviationDescription}</p>
      <p>Bitte prüfen Sie die Abweichung im System und leiten Sie gegebenenfalls Korrekturmaßnahmen ein.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/en13813/deviations" style="background-color: ${priorityColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Zur Abweichung</a></p>
      <p>Mit freundlichen Grüßen,<br>Ihr QM-System</p>
    `

    await this.sendEmail({
      to: recipientEmails,
      subject: `[${priority.toUpperCase()}] Neue Abweichung: ${deviationTitle}`,
      html,
    })
  }

  async sendTestReminderEmail(
    recipientEmail: string,
    testType: string,
    dueDate: Date,
    recipeName: string
  ): Promise<void> {
    const html = `
      <h1>Erinnerung: Anstehende Prüfung</h1>
      <p>Diese E-Mail erinnert Sie an eine anstehende Prüfung:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Prüfart:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${testType}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Rezeptur:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${recipeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Fälligkeitsdatum:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${dueDate.toLocaleDateString('de-DE')}</td>
        </tr>
      </table>
      <p>Bitte stellen Sie sicher, dass die Prüfung rechtzeitig durchgeführt wird.</p>
      <p>Mit freundlichen Grüßen,<br>Ihr QM-System</p>
    `

    await this.sendEmail({
      to: recipientEmail,
      subject: `Erinnerung: ${testType} fällig am ${dueDate.toLocaleDateString('de-DE')}`,
      html,
    })
  }

  async sendDoPGeneratedEmail(
    recipientEmail: string,
    dopNumber: string,
    recipeName: string,
    dopPdfBuffer?: Buffer
  ): Promise<void> {
    const html = `
      <h1>Leistungserklärung erstellt</h1>
      <p>Die Leistungserklärung wurde erfolgreich erstellt:</p>
      <ul>
        <li><strong>DoP-Nummer:</strong> ${dopNumber}</li>
        <li><strong>Rezeptur:</strong> ${recipeName}</li>
        <li><strong>Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE')}</li>
      </ul>
      <p>Die Leistungserklärung entspricht den Anforderungen der EN 13813:2002.</p>
      ${dopPdfBuffer ? '<p>Die DoP ist als PDF-Anhang beigefügt.</p>' : ''}
      <p>Mit freundlichen Grüßen,<br>Ihr EN13813 System</p>
    `

    const attachments = dopPdfBuffer
      ? [
          {
            filename: `DoP_${dopNumber}.pdf`,
            content: dopPdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      : undefined

    await this.sendEmail({
      to: recipientEmail,
      subject: `Leistungserklärung ${dopNumber} erstellt`,
      html,
      attachments,
    })
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export for testing and custom instances
export default EmailService