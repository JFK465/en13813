import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CorrectiveActionFormSchema } from '@/modules/en13813/schemas/deviation.schema'
import { DeviationService } from '@/modules/en13813/services/deviation.service'
import type { Database } from '@/types/database.types'

/**
 * GET /api/en13813/deviations/[id]/actions
 * Get all corrective actions for a deviation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: actions, error } = await supabase
      .from('en13813_corrective_actions')
      .select('*')
      .eq('deviation_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(actions || [])
  } catch (error) {
    console.error('Error fetching actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/en13813/deviations/[id]/actions
 * Add a new corrective or preventive action
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validation = CorrectiveActionFormSchema.safeParse({
      ...body,
      deviation_id: params.id
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const service = new DeviationService()
    const action = await service.addCorrectiveAction(params.id, validation.data)

    // Update deviation status if needed
    const { data: deviation } = await supabase
      .from('en13813_deviations')
      .select('status')
      .eq('id', params.id)
      .single()

    if (deviation?.status === 'investigation') {
      await service.updateDeviation(params.id, { status: 'corrective_action' })
    }

    return NextResponse.json(action, { status: 201 })
  } catch (error) {
    console.error('Error creating action:', error)
    return NextResponse.json(
      { error: 'Failed to create action', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/en13813/deviations/[id]/actions/[actionId]
 * Update a corrective action
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; actionId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Handle verification
    if (body.action === 'verify') {
      body.verified_by = session.user.email || session.user.id
      body.verified_at = new Date().toISOString()
      body.status = 'verified'
    }

    delete body.action

    const { data: action, error } = await supabase
      .from('en13813_corrective_actions')
      .update(body)
      .eq('id', params.actionId)
      .eq('deviation_id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(action)
  } catch (error) {
    console.error('Error updating action:', error)
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    )
  }
}