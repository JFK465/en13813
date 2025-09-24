import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'praise']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  satisfaction: z.enum(['very-satisfied', 'satisfied', 'neutral', 'unsatisfied', 'very-unsatisfied']).optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  module: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = feedbackSchema.parse(body)

    // Insert feedback into database
    const { data, error } = await supabase
      .from('en13813_feedback')
      .insert({
        user_id: user.id,
        type: validated.type,
        priority: validated.priority || 'medium',
        satisfaction: validated.satisfaction,
        title: validated.title,
        description: validated.description,
        module: validated.module,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Feedback submission error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}