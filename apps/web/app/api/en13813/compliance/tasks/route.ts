// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createEN13813Services } from '@/modules/en13813/services'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    
    const supabase = await createClient()
    const services = createEN13813Services(supabase)
    
    const tasks = await services.compliance.getTasks(status)
    
    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error('Error fetching compliance tasks:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch compliance tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const supabase = await createClient()
    const services = createEN13813Services(supabase)
    
    const task = await services.compliance.createTask(data)
    
    return NextResponse.json(task)
  } catch (error: any) {
    console.error('Error creating compliance task:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create compliance task' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }
    
    const updates = await request.json()
    
    const supabase = await createClient()
    const services = createEN13813Services(supabase)
    
    const task = await services.compliance.updateTask(id, updates)
    
    return NextResponse.json(task)
  } catch (error: any) {
    console.error('Error updating compliance task:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update compliance task' },
      { status: 500 }
    )
  }
}