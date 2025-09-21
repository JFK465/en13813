'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './core/useAuth'
import type { CalendarTask, CreateTaskData, UpdateTaskData, TaskStatus, TaskCategory, TaskPriority } from '@/lib/core/calendar'

interface UseCalendarOptions {
  startDate?: string
  endDate?: string
  category?: TaskCategory
  status?: TaskStatus
  assignedTo?: string
  includeCompleted?: boolean
}

export function useCalendar(options: UseCalendarOptions = {}) {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([])
  const [overdueTasks, setOverdueTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch tasks for date range
  const fetchTasks = useCallback(async (fetchOptions: UseCalendarOptions = {}) => {
    if (!user || !profile?.tenant_id) return

    try {
      setLoading(true)
      setError(null)

      const mergedOptions = { ...options, ...fetchOptions }
      
      let query = supabase
        .from('calendar_tasks')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)

      // Date range filter
      if (mergedOptions.startDate) {
        query = query.gte('start_date', mergedOptions.startDate)
      }
      if (mergedOptions.endDate) {
        query = query.lte('start_date', mergedOptions.endDate)
      }

      // Apply filters
      if (mergedOptions.category) {
        query = query.eq('category', mergedOptions.category)
      }
      if (mergedOptions.status) {
        query = query.eq('status', mergedOptions.status)
      }
      if (mergedOptions.assignedTo) {
        query = query.eq('assigned_to', mergedOptions.assignedTo)
      }
      if (!mergedOptions.includeCompleted) {
        query = query.neq('status', 'completed')
      }

      // Order by start date
      query = query.order('start_date', { ascending: true })

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      // Transform data
      const transformedTasks: CalendarTask[] = (data || []).map(task => ({
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

      setTasks(transformedTasks)

    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [user, profile?.tenant_id, supabase, options])

  // Fetch upcoming deadlines
  const fetchUpcomingDeadlines = useCallback(async (daysAhead: number = 30) => {
    if (!user || !profile?.tenant_id) return

    try {
      const { data, error } = await supabase
        .rpc('get_upcoming_tasks', {
          user_tenant_id: profile.tenant_id,
          days_ahead: daysAhead
        })

      if (error) {
        throw new Error(error.message)
      }

      setUpcomingDeadlines(data || [])
    } catch (err: any) {
      console.error('Error fetching upcoming deadlines:', err)
    }
  }, [user, profile?.tenant_id, supabase])

  // Fetch overdue tasks
  const fetchOverdueTasks = useCallback(async () => {
    if (!user || !profile?.tenant_id) return

    try {
      const { data, error } = await supabase
        .rpc('get_overdue_tasks', {
          user_tenant_id: profile.tenant_id
        })

      if (error) {
        throw new Error(error.message)
      }

      setOverdueTasks(data || [])
    } catch (err: any) {
      console.error('Error fetching overdue tasks:', err)
    }
  }, [user, profile?.tenant_id, supabase])

  // Create new task
  const createTask = useCallback(async (taskData: CreateTaskData): Promise<string | null> => {
    if (!user || !profile?.tenant_id) return null

    try {
      const { data, error } = await supabase
        .from('calendar_tasks')
        .insert({
          tenant_id: profile.tenant_id,
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
          assigned_by: user.id,
          resource_type: taskData.resourceType,
          resource_id: taskData.resourceId,
          compliance_framework: taskData.complianceFramework,
          regulatory_reference: taskData.regulatoryReference,
          recurrence_pattern: taskData.recurrencePattern || 'none',
          recurrence_config: taskData.recurrenceConfig || {},
          reminder_intervals: taskData.reminderIntervals || [1440, 60],
          tags: taskData.tags || [],
          metadata: taskData.metadata || {},
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Refresh tasks
      await fetchTasks()
      
      return data.id
    } catch (err: any) {
      setError(err.message)
      console.error('Error creating task:', err)
      return null
    }
  }, [user, profile?.tenant_id, supabase, fetchTasks])

  // Update task
  const updateTask = useCallback(async (taskId: string, updateData: UpdateTaskData): Promise<boolean> => {
    if (!user) return false

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
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) {
        throw new Error(error.message)
      }

      // Refresh tasks
      await fetchTasks()
      
      return true
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating task:', err)
      return false
    }
  }, [user, supabase, fetchTasks])

  // Delete task
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('calendar_tasks')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', taskId)

      if (error) {
        throw new Error(error.message)
      }

      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== taskId))
      
      return true
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting task:', err)
      return false
    }
  }, [user, supabase])

  // Update task status
  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus): Promise<boolean> => {
    return updateTask(taskId, { status })
  }, [updateTask])

  // Get task by ID
  const getTask = useCallback(async (taskId: string): Promise<CalendarTask | null> => {
    if (!user || !profile?.tenant_id) return null

    try {
      const { data, error } = await supabase
        .from('calendar_tasks')
        .select('*')
        .eq('id', taskId)
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        return null
      }

      return {
        id: data.id,
        tenant_id: data.tenant_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        priority: data.priority,
        startDate: data.start_date,
        endDate: data.end_date,
        dueDate: data.due_date,
        allDay: data.all_day,
        location: data.location,
        assignedTo: data.assigned_to,
        assignedBy: data.assigned_by,
        resourceType: data.resource_type,
        resourceId: data.resource_id,
        complianceFramework: data.compliance_framework,
        regulatoryReference: data.regulatory_reference,
        recurrencePattern: data.recurrence_pattern,
        recurrenceConfig: data.recurrence_config,
        parentTaskId: data.parent_task_id,
        reminderIntervals: data.reminder_intervals,
        tags: data.tags,
        metadata: data.metadata
      }
    } catch (err: any) {
      console.error('Error fetching task:', err)
      return null
    }
  }, [user, profile?.tenant_id, supabase])

  // Get task statistics
  const getTaskStats = useCallback(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length
    }
  }, [tasks])

  // Set up real-time subscription for task updates
  useEffect(() => {
    if (!user || !profile?.tenant_id) return

    const channel = supabase
      .channel('calendar_tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_tasks',
          filter: `tenant_id=eq.${profile.tenant_id}`
        },
        () => {
          // Refresh tasks when any change occurs
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile?.tenant_id, supabase, fetchTasks])

  // Initial load
  useEffect(() => {
    if (user && profile?.tenant_id) {
      fetchTasks()
      fetchUpcomingDeadlines()
      fetchOverdueTasks()
    }
  }, [user, profile?.tenant_id, fetchTasks, fetchUpcomingDeadlines, fetchOverdueTasks])

  return {
    tasks,
    upcomingDeadlines,
    overdueTasks,
    loading,
    error,
    fetchTasks,
    fetchUpcomingDeadlines,
    fetchOverdueTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTask,
    getTaskStats
  }
}