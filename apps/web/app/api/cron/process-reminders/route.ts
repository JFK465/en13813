import { NextRequest, NextResponse } from 'next/server'
import { DeadlineReminderService } from '@/lib/core/deadline-reminders'
import { createClient } from '@/lib/supabase/server'

// This endpoint should be called by a cron job every 15 minutes
// to process pending deadline reminders and overdue tasks
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('Authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const reminderService = new DeadlineReminderService(supabase)
    
    // Process pending reminders
    const remindersProcessed = await reminderService.processPendingReminders()
    
    // Process overdue tasks
    const overdueProcessed = await reminderService.processOverdueTasks()
    
    // Get upcoming reminders for monitoring
    const upcomingReminders = await reminderService.getUpcomingReminders()
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      remindersProcessed,
      overdueProcessed,
      upcomingCount: upcomingReminders.length
    }

    console.log('Cron job completed:', result)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Cron job failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}