import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DeviationSchema } from '@/modules/en13813/schemas/deviation.schema'
import { DeviationService } from '@/modules/en13813/services/deviation.service'
import type { Database } from '@/types/database.types'

/**
 * GET /api/en13813/deviations/[id]
 * Get a specific deviation with all related data
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

    const service = new DeviationService()
    const deviation = await service.getDeviation(params.id)

    // Get related data
    const { data: actions } = await supabase
      .from('en13813_corrective_actions')
      .select('*')
      .eq('deviation_id', params.id)
      .order('created_at', { ascending: true })

    const { data: checks } = await supabase
      .from('en13813_effectiveness_checks')
      .select('*')
      .eq('deviation_id', params.id)
      .order('planned_date', { ascending: true })

    const { data: attachments } = await supabase
      .from('en13813_deviation_attachments')
      .select('*')
      .eq('deviation_id', params.id)

    return NextResponse.json({
      ...deviation,
      corrective_actions: actions || [],
      effectiveness_checks: checks || [],
      attachments: attachments || []
    })
  } catch (error) {
    console.error('Error fetching deviation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deviation' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/en13813/deviations/[id]
 * Update a deviation
 */
export async function PATCH(
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

    // Handle sign-off workflow
    if (body.action === 'review') {
      body.reviewed_by = session.user.email || session.user.id
      body.reviewed_by_role = session.user.user_metadata.role
      body.reviewed_at = new Date().toISOString()
    } else if (body.action === 'approve') {
      // Check if user has approval rights
      const userRole = session.user.user_metadata.role
      if (!['qa_manager', 'admin', 'quality_lead'].includes(userRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions for approval' },
          { status: 403 }
        )
      }
      body.approved_by = session.user.email || session.user.id
      body.approved_by_role = userRole
      body.approved_at = new Date().toISOString()
    } else if (body.action === 'close') {
      body.closed_by = session.user.email || session.user.id
      body.closed_at = new Date().toISOString()
      body.status = 'closed'
    }

    delete body.action // Remove action field before update

    const service = new DeviationService()
    const deviation = await service.updateDeviation(params.id, body)

    return NextResponse.json(deviation)
  } catch (error) {
    console.error('Error updating deviation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update deviation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/en13813/deviations/[id]
 * Delete a deviation (soft delete by setting status to rejected)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const userRole = session.user.user_metadata.role
    if (!['qa_manager', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Soft delete by setting status to rejected
    const service = new DeviationService()
    await service.updateDeviation(params.id, {
      status: 'rejected',
      final_status: 'rejected',
      closure_notes: 'Deviation rejected/deleted by ' + session.user.email
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deviation:', error)
    return NextResponse.json(
      { error: 'Failed to delete deviation' },
      { status: 500 }
    )
  }
}