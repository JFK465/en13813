import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()

    const body = await request.json()
    const { type, message, timestamp, userAgent } = body

    // Store feedback in database
    const { data, error } = await supabase
      .from('beta_feedback')
      .insert({
        user_id: session?.user?.id || null,
        user_email: session?.user?.email || 'anonymous',
        type,
        message,
        timestamp,
        user_agent: userAgent,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save feedback:', error)
      // Don't expose database errors to the client
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      )
    }

    // Optional: Send notification email to the team
    // await sendFeedbackNotification(data)

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your feedback!'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}