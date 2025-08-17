import { NextRequest, NextResponse } from 'next/server'
import { CalendarService } from '@/lib/core/calendar'
import { exportTasksToICal } from '@/lib/utils/ical'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('key')
    
    if (!apiKey) {
      return new NextResponse('API key required', { status: 401 })
    }

    // TODO: Verify API key against tenant
    // For now, we'll skip this validation but in production
    // you should verify the API key belongs to the tenant
    
    const tenantId = params.tenantId
    const category = searchParams.get('category') as any
    const assignedTo = searchParams.get('assignedTo')
    const includeCompleted = searchParams.get('includeCompleted') === 'true'
    
    // Get date range (default to next 90 days)
    const startDate = searchParams.get('startDate') || new Date().toISOString()
    const endDate = searchParams.get('endDate') || 
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()

    const supabase = await createClient()
    const calendarService = new CalendarService(supabase)
    
    // Override tenant context for this service call
    const tasks = await calendarService.fetchTasks({
      startDate,
      endDate,
      category,
      assignedTo: assignedTo || undefined,
      includeCompleted
    })

    // Generate iCal content
    const icalContent = exportTasksToICal(tasks, {
      name: 'Compliance Calendar',
      description: 'Compliance tasks and deadlines',
      url: request.url
    })

    // Return iCal content with proper headers
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="compliance-calendar.ics"',
        'Cache-Control': 'private, max-age=300' // Cache for 5 minutes
      }
    })
  } catch (error: any) {
    console.error('Calendar feed error:', error)
    return new NextResponse(
      `Error generating calendar feed: ${error.message}`,
      { status: 500 }
    )
  }
}