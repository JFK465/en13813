// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { EffectivenessCheckFormSchema } from '@/modules/en13813/schemas/deviation.schema'
import { DeviationService } from '@/modules/en13813/services/deviation.service'
import type { Database } from '@/types/database.types'

/**
 * GET /api/en13813/deviations/[id]/effectiveness
 * Get all effectiveness checks for a deviation
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

    const { data: checks, error } = await supabase
      .from('en13813_effectiveness_checks')
      .select('*')
      .eq('deviation_id', params.id)
      .order('planned_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(checks || [])
  } catch (error) {
    console.error('Error fetching effectiveness checks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch effectiveness checks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/en13813/deviations/[id]/effectiveness
 * Schedule a new effectiveness check
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
    const validation = EffectivenessCheckFormSchema.safeParse({
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
    const check = await service.scheduleEffectivenessCheck(params.id, validation.data)

    return NextResponse.json(check, { status: 201 })
  } catch (error) {
    console.error('Error scheduling effectiveness check:', error)
    return NextResponse.json(
      { error: 'Failed to schedule effectiveness check', details: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/en13813/deviations/[id]/effectiveness/[checkId]
 * Perform/update an effectiveness check
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; checkId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    body.performed_by = session.user.email || session.user.id

    const service = new DeviationService()
    await service.performEffectivenessCheck(params.checkId, body)

    // Get updated check
    const { data: check, error } = await supabase
      .from('en13813_effectiveness_checks')
      .select('*')
      .eq('id', params.checkId)
      .single()

    if (error) throw error

    // Check if deviation can be closed
    const { data: pendingChecks } = await supabase
      .from('en13813_effectiveness_checks')
      .select('id')
      .eq('deviation_id', params.id)
      .is('performed_date', null)

    if (!pendingChecks || pendingChecks.length === 0) {
      // All checks complete
      await service.updateDeviation(params.id, {
        status: 'effectiveness_check'
      })
    }

    return NextResponse.json(check)
  } catch (error) {
    console.error('Error performing effectiveness check:', error)
    return NextResponse.json(
      { error: 'Failed to perform effectiveness check', details: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    )
  }
}