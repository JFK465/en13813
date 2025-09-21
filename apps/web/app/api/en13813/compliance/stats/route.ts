import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', session.user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch FPC statistics
    const { data: fpcTests } = await supabase
      .from('en13813_fpc_test_results')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .gte('test_date', startOfWeek.toISOString())

    const testsToday = fpcTests?.filter(t => new Date(t.test_date) >= today).length || 0
    const testsThisWeek = fpcTests?.length || 0
    const passedTests = fpcTests?.filter(t => t.pass).length || 0
    const passRate = testsThisWeek > 0 ? Math.round((passedTests / testsThisWeek) * 100) : 100
    const pendingActions = fpcTests?.filter(t => !t.pass && !t.action_taken).length || 0

    // Fetch ITT statistics
    const { data: ittTests } = await supabase
      .from('en13813_itt_tests')
      .select('*')
      .eq('tenant_id', profile.tenant_id)

    const ittStats = {
      total: ittTests?.length || 0,
      compliant: ittTests?.filter(t => t.compliant).length || 0,
      pending: ittTests?.filter(t => t.compliant === null).length || 0,
      failed: ittTests?.filter(t => t.compliant === false).length || 0
    }

    // Fetch batch statistics
    const { data: batches } = await supabase
      .from('en13813_batches')
      .select('*')
      .eq('tenant_id', profile.tenant_id)

    const batchesThisMonth = batches?.filter(b =>
      new Date(b.created_at || b.production_date) >= startOfMonth
    ).length || 0

    const batchStats = {
      total: batches?.length || 0,
      thisMonth: batchesThisMonth,
      conforming: batches?.filter(b => b.conformity_status === 'conforming' || b.fpc_status === 'passed').length || 0,
      nonConforming: batches?.filter(b => b.conformity_status === 'non-conforming' || b.fpc_status === 'failed').length || 0
    }

    // Fetch compliance tasks
    const { data: tasks } = await supabase
      .from('en13813_compliance_tasks')
      .select('*')
      .eq('tenant_id', profile.tenant_id)

    const overdueTasks = tasks?.filter(t =>
      t.status !== 'completed' && new Date(t.due_date) < now
    ).length || 0

    const upcomingTasks = tasks?.filter(t =>
      t.status !== 'completed' && new Date(t.due_date) >= now
    ).length || 0

    const completedThisMonth = tasks?.filter(t =>
      t.status === 'completed' && new Date(t.completed_at) >= startOfMonth
    ).length || 0

    // Fetch calibration status
    const { data: calibrations } = await supabase
      .from('en13813_fpc_calibrations')
      .select('*')
      .eq('tenant_id', profile.tenant_id)

    const calibrationsDue = calibrations?.filter(c =>
      new Date(c.next_calibration_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length || 0

    // Compile statistics
    const stats = {
      fpc: {
        testsToday,
        testsThisWeek,
        passRate,
        pendingActions
      },
      itt: ittStats,
      batches: batchStats,
      tasks: {
        overdue: overdueTasks,
        upcoming: upcomingTasks,
        completedThisMonth
      },
      calibrations: {
        due: calibrationsDue
      }
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching compliance stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch compliance stats' },
      { status: 500 }
    )
  }
}