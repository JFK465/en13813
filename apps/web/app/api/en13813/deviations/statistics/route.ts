// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * GET /api/en13813/deviations/statistics
 * Get CAPA statistics for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.user_metadata.tenant_id

    // Get statistics from the view
    const { data: stats, error } = await supabase
      .from('en13813_capa_statistics')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No data yet, return empty statistics
      return NextResponse.json({
        total_deviations: 0,
        open_deviations: 0,
        overdue_actions: 0,
        pending_effectiveness_checks: 0,
        by_severity: {
          critical: 0,
          major: 0,
          minor: 0,
          observation: 0
        },
        by_status: {
          open: 0,
          investigation: 0,
          corrective_action: 0,
          effectiveness_check: 0,
          closed: 0
        },
        effectiveness_rate: {
          effective: 0,
          partially_effective: 0,
          not_effective: 0,
          pending: 0
        },
        avg_closure_time_days: 0,
        recurring_issues: []
      })
    }

    if (error) throw error

    // Get recurring issues
    const { data: recurringIssues } = await supabase
      .from('en13813_deviations')
      .select('affected_characteristic, count')
      .eq('tenant_id', tenantId)
      .gte('discovered_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('count', { ascending: false })
      .limit(5)

    return NextResponse.json({
      ...stats,
      recurring_issues: recurringIssues || []
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}