import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createEN13813Services } from '@/modules/en13813/services'

export async function GET() {
  try {
    const supabase = createClient()
    const services = createEN13813Services(supabase)
    
    const stats = await services.compliance.getStats()
    
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching compliance stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch compliance stats' },
      { status: 500 }
    )
  }
}