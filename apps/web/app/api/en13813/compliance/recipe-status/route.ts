import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createEN13813Services } from '@/modules/en13813/services'

export async function GET() {
  try {
    const supabase = createClient()
    const services = createEN13813Services(supabase)
    
    const statuses = await services.compliance.getRecipeStatuses()
    
    return NextResponse.json(statuses)
  } catch (error: any) {
    console.error('Error fetching recipe compliance statuses:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipe compliance statuses' },
      { status: 500 }
    )
  }
}