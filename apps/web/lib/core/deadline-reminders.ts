import { BaseService, BaseEntity } from './base.service'
import { CalendarService } from './calendar'
import { NotificationService } from './notifications'
import type { CalendarTask } from './calendar'
import type { SupabaseClient } from '@supabase/supabase-js'

interface DeadlineReminderConfig {
  taskId: string
  reminderIntervals: number[] // minutes before due date
  enabled: boolean
  lastSent?: string
}

interface ReminderJob extends BaseEntity {
  taskId: string
  dueDate: string
  reminderMinutes: number
  scheduledFor: string
  status: 'pending' | 'sent' | 'failed'
}

export class DeadlineReminderService extends BaseService<ReminderJob> {
  private calendarService: CalendarService
  private notificationService: NotificationService

  constructor(supabase: SupabaseClient) {
    super(supabase, 'deadline_reminders')
    this.calendarService = new CalendarService(supabase)
    this.notificationService = new NotificationService(supabase)
  }

  /**
   * Schedule reminders for a task
   */
  async scheduleReminders(
    task: CalendarTask, 
    reminderIntervals: number[] = [1440, 60, 15] // 24h, 1h, 15min before
  ): Promise<string[]> {
    if (!task.dueDate) {
      throw new Error('Task must have a due date to schedule reminders')
    }

    const dueDate = new Date(task.dueDate)
    const now = new Date()
    const reminderJobs: Partial<ReminderJob>[] = []

    // Create reminder jobs for each interval
    for (const minutes of reminderIntervals) {
      const scheduledFor = new Date(dueDate.getTime() - (minutes * 60 * 1000))
      
      // Only schedule if the reminder time is in the future
      if (scheduledFor > now) {
        reminderJobs.push({
          taskId: task.id,
          dueDate: task.dueDate,
          reminderMinutes: minutes,
          scheduledFor: scheduledFor.toISOString(),
          status: 'pending',
          created_at: now.toISOString()
        })
      }
    }

    if (reminderJobs.length === 0) {
      return []
    }

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(reminderJobs)
      .select('id')

    if (error) {
      throw new Error(`Failed to schedule reminders: ${error.message}`)
    }

    return data?.map(job => job.id) || []
  }

  /**
   * Process pending reminders that are due
   */
  async processPendingReminders(): Promise<number> {
    const now = new Date().toISOString()
    
    // Get all pending reminders that are due
    const { data: pendingReminders, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        calendar_tasks!inner(
          id,
          title,
          description,
          due_date,
          priority,
          category,
          assigned_to,
          compliance_framework,
          regulatory_reference,
          tenant_id
        )
      `)
      .eq('status', 'pending')
      .lte('scheduledFor', now)

    if (error) {
      console.error('Error fetching pending reminders:', error)
      return 0
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      return 0
    }

    let processedCount = 0

    // Process each reminder
    for (const reminder of pendingReminders) {
      try {
        const task = reminder.calendar_tasks
        if (!task) continue

        await this.sendDeadlineReminder(reminder, task)
        
        // Mark reminder as sent
        await this.supabase
          .from(this.tableName)
          .update({ 
            status: 'sent',
            lastSent: new Date().toISOString()
          })
          .eq('id', reminder.id)

        processedCount++
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error)
        
        // Mark reminder as failed
        await this.supabase
          .from(this.tableName)
          .update({ status: 'failed' })
          .eq('id', reminder.id)
      }
    }

    return processedCount
  }

  /**
   * Send a deadline reminder notification
   */
  private async sendDeadlineReminder(reminder: ReminderJob, task: any): Promise<void> {
    const timeUntilDue = this.formatTimeUntilDue(reminder.reminderMinutes)
    const urgencyLevel = this.getUrgencyLevel(reminder.reminderMinutes)

    await this.notificationService.sendNotification({
      type: 'deadline_reminder',
      title: `Deadline Reminder: ${task.title}`,
      message: `Task "${task.title}" is due ${timeUntilDue}`,
      recipientId: task.assigned_to,
      priority: urgencyLevel,
      channels: ['email', 'in_app']
    }, reminder.tenant_id)
  }

  /**
   * Update reminders when task due date changes
   */
  async updateTaskReminders(taskId: string, newDueDate?: string): Promise<void> {
    // Remove existing pending reminders
    await this.supabase
      .from(this.tableName)
      .delete()
      .eq('taskId', taskId)
      .eq('status', 'pending')

    // Schedule new reminders if task has a due date
    if (newDueDate) {
      const task = await this.calendarService.getById(taskId)
      if (task) {
        const updatedTask = { ...task, dueDate: newDueDate }
        await this.scheduleReminders(updatedTask)
      }
    }
  }

  /**
   * Cancel reminders for a task
   */
  async cancelTaskReminders(taskId: string): Promise<void> {
    await this.supabase
      .from(this.tableName)
      .delete()
      .eq('taskId', taskId)
      .eq('status', 'pending')
  }

  /**
   * Get reminders for a task
   */
  async getTaskReminders(taskId: string): Promise<ReminderJob[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('taskId', taskId)
      .order('scheduledFor', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch task reminders: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get upcoming reminders (next 24 hours)
   */
  async getUpcomingReminders(): Promise<ReminderJob[]> {
    const now = new Date()
    const next24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000))

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        calendar_tasks!inner(
          id,
          title,
          due_date,
          priority,
          category,
          assigned_to
        )
      `)
      .eq('status', 'pending')
      .gte('scheduledFor', now.toISOString())
      .lte('scheduledFor', next24Hours.toISOString())
      .order('scheduledFor', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch upcoming reminders: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get overdue tasks (past due date)
   */
  async getOverdueTasks(): Promise<CalendarTask[]> {
    const now = new Date().toISOString()

    const { data, error } = await this.supabase
      .from('calendar_tasks')
      .select('*')
      .lt('due_date', now)
      .neq('status', 'completed')
      .neq('status', 'cancelled')
      .order('due_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch overdue tasks: ${error.message}`)
    }

    // Return tasks as CalendarTask array
    return (data || []) as CalendarTask[]
  }

  /**
   * Process overdue tasks and send notifications
   */
  async processOverdueTasks(): Promise<number> {
    const overdueTasks = await this.getOverdueTasks()
    let processedCount = 0

    for (const task of overdueTasks) {
      try {
        // Update task status to overdue if not already
        if (task.status !== 'overdue') {
          await this.calendarService.updateTask(task.id, { status: 'overdue' }, 'system')
        }

        // Send overdue notification
        await this.notificationService.sendNotification({
          type: 'workflow_overdue',
          title: `Overdue: ${task.title}`,
          message: `Task "${task.title}" is overdue and requires immediate attention`,
          recipientId: task.assignedTo || 'admin',
          priority: 'high',
          channels: ['email', 'in_app']
        }, task.tenant_id)

        processedCount++
      } catch (error) {
        console.error(`Failed to process overdue task ${task.id}:`, error)
      }
    }

    return processedCount
  }

  private formatTimeUntilDue(minutes: number): string {
    if (minutes < 60) {
      return `in ${minutes} minutes`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      return `in ${hours} hour${hours > 1 ? 's' : ''}`
    } else {
      const days = Math.floor(minutes / 1440)
      return `in ${days} day${days > 1 ? 's' : ''}`
    }
  }

  private getUrgencyLevel(minutes: number): 'low' | 'medium' | 'high' {
    if (minutes <= 15) return 'high'
    if (minutes <= 60) return 'medium'
    return 'low'
  }

  protected transformFromDb(dbRecord: any): ReminderJob {
    return {
      id: dbRecord.id,
      taskId: dbRecord.task_id,
      dueDate: dbRecord.due_date,
      reminderMinutes: dbRecord.reminder_minutes,
      scheduledFor: dbRecord.scheduled_for,
      status: dbRecord.status,
      tenant_id: dbRecord.tenant_id,
      created_at: dbRecord.created_at
    }
  }

  protected transformToDb(data: Partial<ReminderJob>): any {
    return {
      task_id: data.taskId,
      due_date: data.dueDate,
      reminder_minutes: data.reminderMinutes,
      scheduled_for: data.scheduledFor,
      status: data.status,
      tenant_id: data.tenant_id,
      created_at: data.created_at
    }
  }
}