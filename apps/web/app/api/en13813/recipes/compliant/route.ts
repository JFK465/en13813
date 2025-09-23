// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', session.session.user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    // Get recipes for tenant
    const { data: recipes, error } = await supabase
      .from('en13813_recipes')
      .select(`
        *,
        approved_by_user:profiles!approved_by(full_name),
        created_by_user:profiles!created_by(full_name)
      `)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recipes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ recipes })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tenant and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, id')
      .eq('user_id', session.session.user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    const body = await request.json()

    // Validate required fields according to EN13813
    const requiredFields = [
      'recipe_code',
      'name',
      'product_name',
      'manufacturer_name',
      'manufacturer_address',
      'binder_type',
      'compressive_strength_class',
      'flexural_strength_class',
      'fire_class'
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field '${field}' is required by EN13813` },
          { status: 400 }
        )
      }
    }

    // Special validation for CA binder type
    if (body.binder_type === 'CA' && (!body.ph_value || body.ph_value < 7)) {
      return NextResponse.json(
        { error: 'pH value must be >= 7 for CA binder type' },
        { status: 400 }
      )
    }

    // Add metadata
    const recipeData = {
      ...body,
      tenant_id: profile.tenant_id,
      created_by: profile.id,
      created_at: new Date().toISOString()
    }

    // Insert recipe
    const { data: recipe, error } = await supabase
      .from('en13813_recipes')
      .insert(recipeData)
      .select()
      .single()

    if (error) {
      console.error('Error creating recipe:', error)

      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Recipe code already exists' },
          { status: 400 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create audit trail entry
    await supabase.from('en13813_audit_trail').insert({
      tenant_id: profile.tenant_id,
      entity_type: 'recipe',
      entity_id: recipe.id,
      action: 'create',
      performed_by: profile.id,
      changes: recipeData
    })

    return NextResponse.json({ recipe }, { status: 201 })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('id')

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 })
    }

    // Get user's tenant and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, id')
      .eq('user_id', session.session.user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    const body = await request.json()

    // Get existing recipe
    const { data: existingRecipe } = await supabase
      .from('en13813_recipes')
      .select('*')
      .eq('id', recipeId)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Check if recipe is locked
    if (existingRecipe.status === 'locked') {
      return NextResponse.json(
        { error: 'Recipe is locked and cannot be modified' },
        { status: 403 }
      )
    }

    // Update recipe
    const updateData = {
      ...body,
      updated_by: profile.id,
      updated_at: new Date().toISOString()
    }

    const { data: recipe, error } = await supabase
      .from('en13813_recipes')
      .update(updateData)
      .eq('id', recipeId)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating recipe:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create audit trail entry
    await supabase.from('en13813_audit_trail').insert({
      tenant_id: profile.tenant_id,
      entity_type: 'recipe',
      entity_id: recipeId,
      action: 'update',
      performed_by: profile.id,
      changes: updateData
    })

    return NextResponse.json({ recipe })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}