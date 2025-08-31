import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DoPGeneratorService } from '@/modules/en13813/services/dop-generator.service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = new DoPGeneratorService(supabase)
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const filters: any = {}
    
    if (searchParams.get('status')) filters.status = searchParams.get('status')
    if (searchParams.get('recipe_id')) filters.recipe_id = searchParams.get('recipe_id')
    if (searchParams.get('search')) filters.search = searchParams.get('search')
    
    const dops = await service.getDoPs(filters)
    
    return NextResponse.json(dops)
  } catch (error: any) {
    console.error('Error fetching DoPs:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const service = new DoPGeneratorService(supabase)
    
    // Generate DoP
    const dop = await service.generateDoP({
      recipeId: body.recipe_id,
      batchId: body.batch_id,
      testReportIds: body.test_report_ids,
      language: body.language || 'de'
    })
    
    return NextResponse.json(dop, { status: 201 })
  } catch (error: any) {
    console.error('Error creating DoP:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}