// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * GET /api/en13813/devices
 * Get all calibration devices
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: devices, error } = await supabase
      .from('en13813_devices')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    // Calculate status for each device
    const devicesWithStatus = (devices || []).map(device => ({
      ...device,
      status: new Date(device.next_cal_at) < new Date() ? 'overdue' : 'ok'
    }))

    return NextResponse.json(devicesWithStatus)
  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    )
  }
}