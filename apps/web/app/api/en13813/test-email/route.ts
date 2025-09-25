import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email/resend.service'
import { baseEmailTemplate } from '@/lib/email/email-templates'

export async function POST(request: Request) {
  try {
    const { email, type = 'test' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(email, 'Test User')
        break

      case 'reset':
        result = await emailService.sendPasswordResetEmail(
          email,
          'https://estrichmanager.de/reset-password?token=test123'
        )
        break

      case 'test':
      default:
        const testContent = `
          <h2 style="color: #1a202c; margin-top: 0; margin-bottom: 24px; font-size: 24px;">
            Test-Email erfolgreich!
          </h2>
          <p>Diese Test-Email bestätigt, dass Ihre Email-Konfiguration korrekt eingerichtet ist.</p>

          <div style="background-color: #f0fff4; border: 2px solid #9ae6b4; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #22543d;">
              ✅ Email-Versand funktioniert<br>
              ✅ Resend API ist konfiguriert<br>
              ✅ EstrichManager ist bereit
            </p>
          </div>

          <p>Mit freundlichen Grüßen,<br>
          <strong>Ihr EstrichManager Team</strong></p>
        `

        result = await emailService.sendEmail({
          to: email,
          subject: 'Test-Email - EstrichManager',
          html: baseEmailTemplate(testContent),
          text: 'Dies ist eine Test-Email von EstrichManager. Ihre Email-Konfiguration funktioniert korrekt!'
        })
        break
    }

    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: result?.id
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}