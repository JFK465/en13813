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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    let query = supabase
      .from('en13813_dops')
      .select(`
        *,
        recipe:en13813_recipes(
          id,
          recipe_code,
          name,
          product_name,
          binder_type,
          compressive_strength_class,
          flexural_strength_class,
          fire_class
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (searchParams.get('status')) {
      query = query.eq('status', searchParams.get('status'))
    }
    if (searchParams.get('recipe_id')) {
      query = query.eq('recipe_id', searchParams.get('recipe_id'))
    }
    if (searchParams.get('search')) {
      query = query.or(`dop_number.ilike.%${searchParams.get('search')}%`)
    }

    const { data: dops, error } = await query

    if (error) {
      console.error('Error fetching DoPs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ dops })
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

    // Get user's tenant and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, id')
      .eq('user_id', session.user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ['recipe_id', 'dop_number', 'language', 'manufacturer_data']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        )
      }
    }

    // Get recipe to validate it exists
    const { data: recipe } = await supabase
      .from('en13813_recipes')
      .select('*')
      .eq('id', body.recipe_id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Create DoP entry
    const dopData = {
      tenant_id: profile.tenant_id,
      recipe_id: body.recipe_id,
      dop_number: body.dop_number,
      version: body.version || 1,
      language: body.language,
      issue_date: body.issue_date || new Date().toISOString(),
      valid_until: body.valid_until,
      manufacturer_data: body.manufacturer_data,
      signatory: body.signatory,
      qr_code_data: body.qr_code_data,
      public_url: body.public_url,
      status: body.status || 'draft',
      created_by: profile.id,
      created_at: new Date().toISOString()
    }

    const { data: dop, error } = await supabase
      .from('en13813_dops')
      .insert(dopData)
      .select()
      .single()

    if (error) {
      console.error('Error creating DoP:', error)

      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'DoP number already exists' },
          { status: 400 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create audit trail entry
    await supabase.from('en13813_audit_trail').insert({
      tenant_id: profile.tenant_id,
      entity_type: 'dop',
      entity_id: dop.id,
      action: 'create',
      performed_by: profile.id,
      changes: dopData
    })

    return NextResponse.json({ dop }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating DoP:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}