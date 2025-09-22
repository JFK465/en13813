import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { BaseService } from './base.service'
import { NotificationService } from './notifications'
import type { SupabaseClient } from '@supabase/supabase-js'

// Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'on_hold'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskCategory = 
  | 'compliance_deadline'
  | 'audit_preparation'
  | 'document_review'
  | 'training_session'
  | 'certification_renewal'
  | 'inspection_date'
  | 'reporting_deadline'
  | 'maintenance_task'
  | 'meeting'
  | 'other'

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

export interface CalendarTask {
  id: string
  tenant_id: string
  created_at: string
  updated_at?: string
  title: string
  description?: string
  category: TaskCategory
  status: TaskStatus
  priority: TaskPriority
  startDate: string
  endDate?: string
  dueDate?: string
  allDay: boolean
  location?: string
  assignedTo?: string
  assignedBy?: string
  resourceType?: string
  resourceId?: string
  complianceFramework?: string
  regulatoryReference?: string
  recurrencePattern: RecurrencePattern
  recurrenceConfig?: Record<string, any>
  parentTaskId?: string
  reminderIntervals: number[]
  tags: string[]
  metadata: Record<string, any>
}

export interface CreateTaskData {
  title: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  startDate: string
  endDate?: string
  dueDate?: string
  allDay?: boolean
  location?: string
  assignedTo?: string
  resourceType?: string
  resourceId?: string
  complianceFramework?: string
  regulatoryReference?: string
  recurrencePattern?: RecurrencePattern
  recurrenceConfig?: Record<string, any>
  reminderIntervals?: number[]
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatus
}

export interface ComplianceDeadline {
  id: string
  framework: string
  requirementCode?: string
  requirementTitle: string
  requirementDescription?: string
  deadlineDate: string
  submissionDeadline?: string
  frequency: RecurrencePattern
  responsibleDepartment?: string
  responsiblePerson?: string
  preparationStatus: string
  evidenceRequired: boolean
  evidenceLocation?: string
  penaltyDescription?: string
  penaltyAmount?: number
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  comment: string
  commentType: string
  metadata: Record<string, any>
  createdAt: string
}

export class CalendarService extends BaseService<CalendarTask> {
  private notificationService: NotificationService

  constructor(supabase: SupabaseClient) {
    super(supabase, 'calendar_tasks')
    this.notificationService = new NotificationService(supabase)
  }

  /**
   * Create a new calendar task
   */
  async createTask(taskData: CreateTaskData, userId: string): Promise<string> {
    const supabase = createServiceClient()
    // Get current tenant ID from auth context or use default
    const tenantId = 'default-tenant'

    try {
      const { data: task, error } = await supabase
        .from('calendar_tasks')
        .insert({
          tenant_id: tenantId,
          title: taskData.title,
          description: taskData.description,
          category: taskData.category || 'other',
          priority: taskData.priority || 'medium',
          start_date: taskData.startDate,
          end_date: taskData.endDate,
          due_date: taskData.dueDate,
          all_day: taskData.allDay || false,
          location: taskData.location,
          assigned_to: taskData.assignedTo,
          assigned_by: userId,
          resource_type: taskData.resourceType,
          resource_id: taskData.resourceId,
          compliance_framework: taskData.complianceFramework,
          regulatory_reference: taskData.regulatoryReference,
          recurrence_pattern: taskData.recurrencePattern || 'none',
          recurrence_config: taskData.recurrenceConfig || {},
          reminder_intervals: taskData.reminderIntervals || [1440, 60], // 24h, 1h
          tags: taskData.tags || [],
          metadata: taskData.metadata || {},
          created_by: userId
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create task: ${error.message}`)
      }

      // Send notification if task is assigned to someone
      if (taskData.assignedTo && taskData.assignedTo !== userId) {
        await this.notificationService.sendNotification({
          title: `New Task Assignment: ${taskData.title}`,
          message: `You have been assigned a new ${taskData.category?.replace('_', ' ')} task.`,
          type: 'workflow_assigned',
          priority: taskData.priority || 'medium',
          channels: ['email', 'in_app'],
          recipientId: taskData.assignedTo,
          resourceType: 'task',
          resourceId: task.id,
          data: {
            task_title: taskData.title,
            due_date: taskData.dueDate || 'No deadline',
            category: taskData.category,
            task_url: `${process.env.NEXT_PUBLIC_APP_URL}/calendar/tasks/${task.id}`
          }
        }, tenantId)
      }

      // Create recurring instances if needed
      if (taskData.recurrencePattern && taskData.recurrencePattern !== 'none') {
        await this.createRecurringInstances(task.id, taskData.recurrencePattern, taskData.recurrenceConfig)
      }

      return task.id
    } catch (error: any) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  /**
   * Update a calendar task
   */
  async updateTask(taskId: string, updateData: UpdateTaskData, userId: string): Promise<boolean> {
    const supabase = createServiceClient()

    try {
      const { error } = await supabase
        .from('calendar_tasks')
        .update({
          ...updateData,
          start_date: updateData.startDate,
          end_date: updateData.endDate,
          due_date: updateData.dueDate,
          all_day: updateData.allDay,
          assigned_to: updateData.assignedTo,
          resource_type: updateData.resourceType,
          resource_id: updateData.resourceId,
          compliance_framework: updateData.complianceFramework,
          regulatory_reference: updateData.regulatoryReference,
          recurrence_pattern: updateData.recurrencePattern,
          recurrence_config: updateData.recurrenceConfig,
          reminder_intervals: updateData.reminderIntervals,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) {
        throw new Error(`Failed to update task: ${error.message}`)
      }

      // Send notification for status changes
      if (updateData.status === 'completed') {
        const { data: task } = await supabase
          .from('calendar_tasks')
          .select('title, assigned_by, tenant_id')
          .eq('id', taskId)
          .single()

        if (task?.assigned_by && task.assigned_by !== userId) {
          await this.notificationService.sendNotification({
            title: `Task Completed: ${task.title}`,
            message: `The task "${task.title}" has been completed.`,
            type: 'workflow_completed',
            priority: 'medium',
            channels: ['in_app'],
            recipientId: task.assigned_by,
            resourceType: 'task',
            resourceId: taskId
          }, task.tenant_id || 'default-tenant')
        }
      }

      return true
    } catch (error: any) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  /**
   * Get tasks for a date range
   */
  async getTasksForDateRange(
    startDate: string,
    endDate: string,
    options: {
      category?: TaskCategory
      status?: TaskStatus
      assignedTo?: string
      includeCompleted?: boolean
    } = {}
  ): Promise<CalendarTask[]> {
    const supabase = await createClient()
    // Get current tenant ID from auth context or use default
    const tenantId = 'default-tenant'

    try {
      let query = supabase
        .from('calendar_tasks')
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .gte('start_date', startDate)
        .lte('start_date', endDate)

      // Apply filters
      if (options.category) {
        query = query.eq('category', options.category)
      }

      if (options.status) {
        query = query.eq('status', options.status)
      }

      if (options.assignedTo) {
        query = query.eq('assigned_to', options.assignedTo)
      }

      if (!options.includeCompleted) {
        query = query.neq('status', 'completed')
      }

      // Order by start date
      query = query.order('start_date', { ascending: true })

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`)
      }

      return this.transformTasks(data || [])
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(daysAhead: number = 30): Promise<any[]> {
    const supabase = await createClient()
    // Get current tenant ID from auth context or use default
    const tenantId = 'default-tenant'

    try {
      const { data, error } = await supabase
        .rpc('get_upcoming_tasks', {
          user_tenant_id: tenantId,
          days_ahead: daysAhead
        })

      if (error) {
        throw new Error(`Failed to fetch upcoming deadlines: ${error.message}`)
      }

      return data || []
    } catch (error: any) {
      console.error('Error fetching upcoming deadlines:', error)
      throw error
    }
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<any[]> {
    const supabase = await createClient()
    // Get current tenant ID from auth context or use default
    const tenantId = 'default-tenant'

    try {
      const { data, error } = await supabase
        .rpc('get_overdue_tasks', {
          user_tenant_id: tenantId
        })

      if (error) {
        throw new Error(`Failed to fetch overdue tasks: ${error.message}`)
      }

      return data || []
    } catch (error: any) {
      console.error('Error fetching overdue tasks:', error)
      throw error
    }
  }

  /**
   * Create compliance deadline
   */
  async createComplianceDeadline(deadlineData: Omit<ComplianceDeadline, 'id'>, userId: string): Promise<string> {
    const supabase = createServiceClient()
    // Get current tenant ID from auth context or use default
    const tenantId = 'default-tenant'

    try {
      // Create the compliance deadline record
      const { data: deadline, error: deadlineError } = await supabase
        .from('compliance_deadlines')
        .insert({
          tenant_id: tenantId,
          framework: deadlineData.framework,
          requirement_code: deadlineData.requirementCode,
          requirement_title: deadlineData.requirementTitle,
          requirement_description: deadlineData.requirementDescription,
          deadline_date: deadlineData.deadlineDate,
          submission_deadline: deadlineData.submissionDeadline,
          frequency: deadlineData.frequency,
          responsible_department: deadlineData.responsibleDepartment,
          responsible_person: deadlineData.responsiblePerson,
          preparation_status: deadlineData.preparationStatus || 'not_started',
          evidence_required: deadlineData.evidenceRequired,
          evidence_location: deadlineData.evidenceLocation,
          penalty_description: deadlineData.penaltyDescription,
          penalty_amount: deadlineData.penaltyAmount,
          created_by: userId
        })
        .select()
        .single()

      if (deadlineError) {
        throw new Error(`Failed to create compliance deadline: ${deadlineError.message}`)
      }

      // Create corresponding calendar task
      const taskId = await this.createTask({
        title: `${deadlineData.framework}: ${deadlineData.requirementTitle}`,
        description: deadlineData.requirementDescription,
        category: 'compliance_deadline',
        priority: 'high',
        startDate: deadlineData.submissionDeadline || deadlineData.deadlineDate,
        dueDate: deadlineData.deadlineDate,
        assignedTo: deadlineData.responsiblePerson,
        complianceFramework: deadlineData.framework,
        regulatoryReference: deadlineData.requirementCode,
        recurrencePattern: deadlineData.frequency,
        tags: [deadlineData.framework, 'compliance'],
        metadata: {
          compliance_deadline_id: deadline.id,
          evidence_required: deadlineData.evidenceRequired,
          responsible_department: deadlineData.responsibleDepartment
        }
      }, userId)

      // Update deadline with task reference
      await supabase
        .from('compliance_deadlines')
        .update({ task_id: taskId })
        .eq('id', deadline.id)

      return deadline.id
    } catch (error: any) {
      console.error('Error creating compliance deadline:', error)
      throw error
    }
  }

  /**
   * Add comment to task
   */
  async addTaskComment(
    taskId: string,
    comment: string,
    commentType: string = 'comment',
    userId: string
  ): Promise<string> {
    const supabase = createServiceClient()
    // Get current tenant ID from auth context or use default
    const tenantId = 'default-tenant'

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: userId,
          tenant_id: tenantId,
          comment,
          comment_type: commentType,
          metadata: {}
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to add comment: ${error.message}`)
      }

      return data.id
    } catch (error: any) {
      console.error('Error adding task comment:', error)
      throw error
    }
  }

  /**
   * Get task comments
   */
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          id,
          task_id,
          user_id,
          comment,
          comment_type,
          metadata,
          created_at,
          profiles(full_name, email)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch comments: ${error.message}`)
      }

      return (data || []).map(comment => ({
        id: comment.id,
        taskId: comment.task_id,
        userId: comment.user_id,
        comment: comment.comment,
        commentType: comment.comment_type,
        metadata: comment.metadata,
        createdAt: comment.created_at,
        user: comment.profiles
      }))
    } catch (error: any) {
      console.error('Error fetching task comments:', error)
      throw error
    }
  }

  /**
   * Delete task (soft delete)
   */
  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    const supabase = createServiceClient()

    try {
      const { error } = await supabase
        .from('calendar_tasks')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: userId
        })
        .eq('id', taskId)

      if (error) {
        throw new Error(`Failed to delete task: ${error.message}`)
      }

      return true
    } catch (error: any) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  /**
   * Create recurring task instances
   */
  private async createRecurringInstances(
    parentTaskId: string,
    pattern: RecurrencePattern,
    config: Record<string, any> = {}
  ): Promise<void> {
    const supabase = createServiceClient()

    try {
      // Get parent task
      const { data: parentTask, error } = await supabase
        .from('calendar_tasks')
        .select('*')
        .eq('id', parentTaskId)
        .single()

      if (error || !parentTask) {
        throw new Error('Parent task not found')
      }

      const startDate = new Date(parentTask.start_date)
      const instances: Date[] = []

      // Calculate future instances based on pattern
      const maxInstances = config.maxInstances || 12
      let currentDate = new Date(startDate)

      for (let i = 0; i < maxInstances; i++) {
        switch (pattern) {
          case 'daily':
            currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
            break
          case 'weekly':
            currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            break
          case 'monthly':
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())
            break
          case 'quarterly':
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, currentDate.getDate())
            break
          case 'yearly':
            currentDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate())
            break
          default:
            return // No recurrence
        }

        instances.push(new Date(currentDate))
      }

      // Create task instances
      for (const instanceDate of instances) {
        await supabase
          .rpc('create_recurring_task_instance', {
            parent_task_id: parentTaskId,
            new_start_date: instanceDate.toISOString(),
            new_due_date: parentTask.due_date 
              ? new Date(instanceDate.getTime() + (new Date(parentTask.due_date).getTime() - startDate.getTime())).toISOString()
              : null
          })
      }
    } catch (error: any) {
      console.error('Error creating recurring instances:', error)
      throw error
    }
  }

  /**
   * Transform database tasks to API format
   */
  private transformTasks(tasks: any[]): CalendarTask[] {
    return tasks.map(task => ({
      id: task.id,
      tenant_id: task.tenant_id,
      created_at: task.created_at,
      updated_at: task.updated_at,
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      priority: task.priority,
      startDate: task.start_date,
      endDate: task.end_date,
      dueDate: task.due_date,
      allDay: task.all_day,
      location: task.location,
      assignedTo: task.assigned_to,
      assignedBy: task.assigned_by,
      resourceType: task.resource_type,
      resourceId: task.resource_id,
      complianceFramework: task.compliance_framework,
      regulatoryReference: task.regulatory_reference,
      recurrencePattern: task.recurrence_pattern,
      recurrenceConfig: task.recurrence_config,
      parentTaskId: task.parent_task_id,
      reminderIntervals: task.reminder_intervals,
      tags: task.tags,
      metadata: task.metadata
    }))
  }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<{
    total: number
    pending: number
    inProgress: number
    completed: number
    overdue: number
    cancelled: number
  }> {
    const supabase = await createClient()
    // Get current tenant ID from auth context or use default
    const tenantId = 'default-tenant'

    try {
      const { data, error } = await supabase
        .from('calendar_tasks')
        .select('status')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

      if (error) {
        throw new Error(`Failed to fetch task stats: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        cancelled: 0
      }

      data?.forEach(task => {
        switch (task.status) {
          case 'pending':
            stats.pending++
            break
          case 'in_progress':
            stats.inProgress++
            break
          case 'completed':
            stats.completed++
            break
          case 'overdue':
            stats.overdue++
            break
          case 'cancelled':
            stats.cancelled++
            break
        }
      })

      return stats
    } catch (error: any) {
      console.error('Error fetching task stats:', error)
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        cancelled: 0
      }
    }
  }

  /**
   * Fetch tasks with filters
   */
  async fetchTasks(filters: {
    startDate?: string
    endDate?: string
    category?: TaskCategory
    assignedTo?: string
    includeCompleted?: boolean
    status?: TaskStatus
  } = {}): Promise<CalendarTask[]> {
    const supabase = await createClient()
    // Get current tenant ID from auth context or use default
    const tenantId = 'default-tenant'

    try {
      let query = supabase
        .from('calendar_tasks')
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)

      // Apply date filters
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('start_date', filters.endDate)
      }

      // Apply other filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (!filters.includeCompleted) {
        query = query.neq('status', 'completed')
      }

      query = query.order('start_date', { ascending: true })

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`)
      }

      return this.transformTasks(data || [])
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }

  /**
   * Get task by ID
   */
  async getById(taskId: string): Promise<CalendarTask | null> {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase
        .from('calendar_tasks')
        .select('*')
        .eq('id', taskId)
        .is('deleted_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Task not found
        }
        throw new Error(`Failed to fetch task: ${error.message}`)
      }

      return this.transformTasks([data])[0]
    } catch (error: any) {
      console.error('Error fetching task by ID:', error)
      throw error
    }
  }

  /**
   * Send deadline reminders
   */
  async sendDeadlineReminders(): Promise<void> {
    const supabase = createServiceClient()

    try {
      // Get tasks with upcoming deadlines that need reminders
      const { data: tasks, error } = await supabase
        .from('calendar_tasks')
        .select('*')
        .not('due_date', 'is', null)
        .not('assigned_to', 'is', null)
        .in('status', ['pending', 'in_progress'])
        .is('deleted_at', null)

      if (error) {
        throw new Error(`Failed to fetch tasks for reminders: ${error.message}`)
      }

      for (const task of tasks || []) {
        const dueDate = new Date(task.due_date)
        const now = new Date()
        const minutesUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60))

        // Check if we should send a reminder
        if (task.reminder_intervals.includes(minutesUntilDue)) {
          await this.notificationService.sendDeadlineReminder({
            recipientId: task.assigned_to,
            taskName: task.title,
            dueDate: task.due_date,
            priority: task.priority,
            taskUrl: `${process.env.NEXT_PUBLIC_APP_URL}/calendar/tasks/${task.id}`,
            resourceId: task.id,
            tenantId: task.tenant_id || 'default-tenant'
          })
        }
      }
    } catch (error: any) {
      console.error('Error sending deadline reminders:', error)
    }
  }
}