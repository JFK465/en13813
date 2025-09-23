// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DeviationFormSchema } from '@/modules/en13813/schemas/deviation.schema'
import { DeviationService } from '@/modules/en13813/services/deviation.service'
import type { Database } from '@/types/database.types'

/**
 * GET /api/en13813/deviations
 * List all deviations with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const filters = {
      status: searchParams.get('status')?.split(','),
      severity: searchParams.get('severity')?.split(','),
      type: searchParams.get('type')?.split(','),
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      recipe_id: searchParams.get('recipe_id') || undefined,
      batch_id: searchParams.get('batch_id') || undefined,
      has_pending_effectiveness_check: searchParams.get('pending_checks') === 'true'
    }

    const service = new DeviationService()
    const deviations = await service.listDeviations(filters)

    return NextResponse.json(deviations)
  } catch (error) {
    console.error('Error fetching deviations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deviations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/en13813/deviations
 * Create a new deviation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validation = DeviationFormSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Add tenant and user info
    const deviationData = {
      ...validation.data,
      tenant_id: session.user.user_metadata.tenant_id,
      created_by: session.user.email || session.user.id,
      created_by_role: session.user.user_metadata.role || 'user'
    }

    const service = new DeviationService()
    const deviation = await service.createDeviation(deviationData)

    // Send notification if critical or major
    if (deviation.severity === 'critical' || deviation.severity === 'major') {
      await sendDeviationNotification(deviation, session.user.user_metadata.tenant_id)
    }

    return NextResponse.json(deviation, { status: 201 })
  } catch (error) {
    console.error('Error creating deviation:', error)
    return NextResponse.json(
      { error: 'Failed to create deviation', details: error instanceof Error ? error.message : 'Unbekannter Fehler' },
      { status: 500 }
    )
  }
}

/**
 * Send email notification for critical deviations
 */
async function sendDeviationNotification(deviation: any, tenantId: string) {
  try {
    // Get QA manager emails
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: users } = await supabase
      .from('users')
      .select('email')
      .eq('tenant_id', tenantId)
      .or('role.eq.qa_manager,role.eq.admin')

    if (!users || users.length === 0) return

    const emails = users.map(u => u.email).filter(Boolean)

    // Send notification (implement with your email service)
    console.log('Sending deviation notification to:', emails)
    // await emailService.send({
    //   to: emails,
    //   subject: `${deviation.severity.toUpperCase()} Deviation: ${deviation.title}`,
    //   template: 'deviation-notification',
    //   data: deviation
    // })
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}