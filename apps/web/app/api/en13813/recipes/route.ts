import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { RecipeService } from '@/modules/en13813/services/recipe.service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = new RecipeService(supabase)
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const filters: any = {}
    
    if (searchParams.get('type')) filters.type = searchParams.get('type')
    if (searchParams.get('status')) filters.status = searchParams.get('status')
    if (searchParams.get('search')) filters.search = searchParams.get('search')
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const result = await service.list(filters)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching recipes:', error)
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
    const service = new RecipeService(supabase)
    
    // Get current user's tenant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', session.user.id)
      .single()
    
    if (!profile?.tenant_id) {
      // Create a default tenant for testing
      const { data: tenant } = await supabase
        .from('tenants')
        .insert({
          name: 'Test Company',
          subdomain: 'test',
          status: 'active'
        })
        .select()
        .single()
      
      if (tenant) {
        await supabase
          .from('profiles')
          .update({ tenant_id: tenant.id })
          .eq('id', session.user.id)
        
        body.tenant_id = tenant.id
      }
    } else {
      body.tenant_id = profile.tenant_id
    }
    
    // Generate recipe code if not provided
    if (!body.recipe_code) {
      body.recipe_code = `${body.type || 'CT'}-${body.compressive_strength_class || 'C25'}-${body.flexural_strength_class || 'F4'}`
    }
    
    const recipe = await service.create(body)
    
    return NextResponse.json(recipe, { status: 201 })
  } catch (error: any) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}