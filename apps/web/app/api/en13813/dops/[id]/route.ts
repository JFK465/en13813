import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

    const { data: dop, error } = await supabase
      .from('en13813_dops')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (error || !dop) {
      return NextResponse.json({ error: 'DoP not found' }, { status: 404 })
    }
    
    return NextResponse.json(dop)
  } catch (error: any) {
    console.error('Error fetching DoP:', error)
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
    
    const { data: dop, error } = await supabase
      .from('en13813_dops')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json(dop)
  } catch (error: any) {
    console.error('Error updating DoP:', error)
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

    const { error } = await supabase
      .from('en13813_dops')
      .delete()
      .eq('id', params.id)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting DoP:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}