import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { RecipeService } from '@/modules/en13813/services/recipe.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = new RecipeService(supabase)
    const recipe = await service.getById(params.id)
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }
    
    return NextResponse.json(recipe)
  } catch (error: any) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const service = new RecipeService(supabase)
    
    // Update recipe code if components changed
    if (body.type || body.compressive_strength_class || body.flexural_strength_class) {
      const existing = await service.getById(params.id)
      if (existing) {
        body.recipe_code = `${body.type || existing.type}-${body.compressive_strength_class || existing.compressive_strength_class}-${body.flexural_strength_class || existing.flexural_strength_class}`
      }
    }
    
    const recipe = await service.update(params.id, body)
    
    return NextResponse.json(recipe)
  } catch (error: any) {
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = new RecipeService(supabase)
    await service.delete(params.id)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}