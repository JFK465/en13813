import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const betaRegistrationSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Unternehmen ist erforderlich'),
  companySize: z.string().min(1, 'Unternehmensgröße ist erforderlich'),
  currentManagement: z.string().optional(),
  challenges: z.array(z.string()).optional(),
  challengeLevel: z.string().min(1, 'Challenge Level ist erforderlich'),
  privacy: z.boolean().refine((val) => val === true, {
    message: 'Sie müssen der Datenschutzerklärung zustimmen',
  }),
  newsletter: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = betaRegistrationSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Store beta registration in database
    const { data, error } = await supabase.from('beta_registrations').insert({
      first_name: validated.firstName,
      last_name: validated.lastName,
      email: validated.email,
      phone: validated.phone || null,
      company: validated.company,
      company_size: validated.companySize,
      current_management: validated.currentManagement || null,
      challenges: validated.challenges || [],
      challenge_level: validated.challengeLevel,
      newsletter_consent: validated.newsletter || false,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error storing beta registration:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Registrierung' },
        { status: 500 }
      )
    }

    // TODO: Send confirmation email using Resend
    // await sendBetaConfirmationEmail(validated.email, validated.firstName)

    // TODO: Notify team about new beta registration
    // await notifyTeamAboutBetaRegistration(validated)

    return NextResponse.json(
      {
        success: true,
        message: 'Beta-Registrierung erfolgreich',
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validierungsfehler', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
