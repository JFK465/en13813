import { Resend } from 'resend'
import { renderDoPNotificationEmail } from '../templates/dop-notification'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendDoPEmailParams {
  to: string | string[]
  recipientName: string
  dopNumber: string
  productName: string
  recipeCode: string
  manufacturerName: string
  manufacturerEmail?: string
  issueDate: string
  downloadUrl: string
  publicUrl: string
  language?: 'de' | 'en' | 'fr'
  attachmentBuffer?: Buffer
}

export class DoPEmailService {
  async sendDoPNotification(params: SendDoPEmailParams) {
    const {
      to,
      recipientName,
      dopNumber,
      productName,
      recipeCode,
      manufacturerName,
      manufacturerEmail,
      issueDate,
      downloadUrl,
      publicUrl,
      language = 'de',
      attachmentBuffer
    } = params

    try {
      // Render email HTML
      const emailHtml = renderDoPNotificationEmail({
        recipientName,
        dopNumber,
        productName,
        recipeCode,
        manufacturerName,
        issueDate,
        downloadUrl,
        publicUrl,
        language
      })

      // Prepare subject based on language
      const subjects = {
        de: `Leistungserklärung ${dopNumber} - ${productName}`,
        en: `Declaration of Performance ${dopNumber} - ${productName}`,
        fr: `Déclaration de Performance ${dopNumber} - ${productName}`
      }

      // Prepare attachments
      const attachments = []
      if (attachmentBuffer) {
        attachments.push({
          filename: `DoP_${dopNumber}.pdf`,
          content: attachmentBuffer
        })
      }

      // Send email via Resend
      const result = await resend.emails.send({
        from: manufacturerEmail || 'noreply@estrichwerke.de',
        to: Array.isArray(to) ? to : [to],
        subject: subjects[language],
        html: emailHtml,
        attachments
      })

      return {
        success: true,
        messageId: result.id,
        message: 'DoP notification sent successfully'
      }
    } catch (error) {
      console.error('Error sending DoP email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }

  async sendDoPBatch(recipients: SendDoPEmailParams[]) {
    const results = await Promise.allSettled(
      recipients.map(params => this.sendDoPNotification(params))
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success)
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))

    return {
      total: recipients.length,
      successful: successful.length,
      failed: failed.length,
      results
    }
  }
}

// Alternative implementation using nodemailer (if Resend is not available)
export class DoPEmailServiceNodemailer {
  private transporter: any

  constructor() {
    // Only initialize if we have SMTP credentials
    if (process.env.SMTP_HOST) {
      const nodemailer = require('nodemailer')
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    }
  }

  async sendDoPNotification(params: SendDoPEmailParams) {
    if (!this.transporter) {
      console.warn('Email service not configured. Please set SMTP credentials.')
      return {
        success: false,
        error: 'Email service not configured'
      }
    }

    const {
      to,
      recipientName,
      dopNumber,
      productName,
      recipeCode,
      manufacturerName,
      manufacturerEmail,
      issueDate,
      downloadUrl,
      publicUrl,
      language = 'de',
      attachmentBuffer
    } = params

    try {
      const emailHtml = renderDoPNotificationEmail({
        recipientName,
        dopNumber,
        productName,
        recipeCode,
        manufacturerName,
        issueDate,
        downloadUrl,
        publicUrl,
        language
      })

      const subjects = {
        de: `Leistungserklärung ${dopNumber} - ${productName}`,
        en: `Declaration of Performance ${dopNumber} - ${productName}`,
        fr: `Déclaration de Performance ${dopNumber} - ${productName}`
      }

      const attachments = []
      if (attachmentBuffer) {
        attachments.push({
          filename: `DoP_${dopNumber}.pdf`,
          content: attachmentBuffer
        })
      }

      const info = await this.transporter.sendMail({
        from: manufacturerEmail || process.env.SMTP_FROM || 'noreply@estrichwerke.de',
        to: Array.isArray(to) ? to.join(',') : to,
        subject: subjects[language],
        html: emailHtml,
        attachments
      })

      return {
        success: true,
        messageId: info.messageId,
        message: 'DoP notification sent successfully'
      }
    } catch (error) {
      console.error('Error sending DoP email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }
}

// Export the appropriate service based on configuration
export const dopEmailService = process.env.RESEND_API_KEY
  ? new DoPEmailService()
  : new DoPEmailServiceNodemailer()