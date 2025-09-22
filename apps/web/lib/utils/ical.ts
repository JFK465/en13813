import ical from 'ical-generator'
import type { CalendarTask } from '@/lib/core/calendar'

export interface ICalExportOptions {
  name?: string
  description?: string
  timezone?: string
  url?: string
}

/**
 * Export calendar tasks to iCal format
 */
export function exportTasksToICal(
  tasks: CalendarTask[],
  options: ICalExportOptions = {}
): string {
  const calendar = ical({
    name: options.name || 'Compliance Calendar',
    description: options.description || 'Compliance tasks and deadlines',
    timezone: options.timezone || 'UTC',
    url: options.url,
    prodId: {
      company: 'Compliance SaaS',
      product: 'Calendar',
      language: 'EN'
    }
  })

  tasks.forEach(task => {
    const event = calendar.createEvent({
      id: task.id,
      start: new Date(task.startDate),
      end: task.endDate ? new Date(task.endDate) : new Date(task.startDate),
      allDay: task.allDay,
      summary: task.title,
      description: createEventDescription(task),
      location: task.location,
      categories: [
        {
          name: task.category.replace('_', ' ').toUpperCase()
        }
      ],
      priority: getPriorityNumber(task.priority),
      status: getEventStatus(task.status) as any,
      created: new Date(),
      lastModified: new Date()
    })

    // Add alarm/reminder if due date exists
    if (task.dueDate && task.reminderIntervals.length > 0) {
      task.reminderIntervals.forEach(minutes => {
        event.createAlarm({
          type: 'display' as any,
          trigger: minutes * 60, // Convert minutes to seconds
          description: `Reminder: ${task.title}`
        } as any)
      })
    }

    // Add custom properties for compliance data
    if (task.complianceFramework) {
      event.x('X-COMPLIANCE-FRAMEWORK', task.complianceFramework)
    }
    if (task.regulatoryReference) {
      event.x('X-REGULATORY-REFERENCE', task.regulatoryReference)
    }
    if (task.assignedTo) {
      event.x('X-ASSIGNED-TO', task.assignedTo)
    }

    // Add tags as custom property
    if (task.tags.length > 0) {
      event.x('X-TAGS', task.tags.join(','))
    }
  })

  return calendar.toString()
}

/**
 * Create detailed event description
 */
function createEventDescription(task: CalendarTask): string {
  const parts: string[] = []

  if (task.description) {
    parts.push(task.description)
    parts.push('')
  }

  // Add task details
  parts.push(`Status: ${task.status.replace('_', ' ').toUpperCase()}`)
  parts.push(`Priority: ${task.priority.toUpperCase()}`)
  parts.push(`Category: ${task.category.replace('_', ' ')}`)

  if (task.dueDate) {
    parts.push(`Due Date: ${new Date(task.dueDate).toLocaleString()}`)
  }

  if (task.complianceFramework) {
    parts.push(`Framework: ${task.complianceFramework}`)
  }

  if (task.regulatoryReference) {
    parts.push(`Reference: ${task.regulatoryReference}`)
  }

  if (task.tags.length > 0) {
    parts.push(`Tags: ${task.tags.join(', ')}`)
  }

  return parts.join('\\n')
}

/**
 * Convert priority to RFC5545 priority number
 */
function getPriorityNumber(priority: string): number {
  switch (priority) {
    case 'urgent':
      return 1 // Highest
    case 'high':
      return 2
    case 'medium':
      return 5 // Normal
    case 'low':
      return 9 // Lowest
    default:
      return 5
  }
}

/**
 * Convert task status to iCal event status
 */
function getEventStatus(status: string): string {
  switch (status) {
    case 'completed':
      return 'CONFIRMED'
    case 'cancelled':
      return 'CANCELLED'
    case 'in_progress':
    case 'pending':
      return 'TENTATIVE'
    default:
      return 'TENTATIVE'
  }
}

/**
 * Generate download URL for iCal content
 */
export function createICalDownloadUrl(icalContent: string): string {
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  return URL.createObjectURL(blob)
}

/**
 * Download iCal file
 */
export function downloadICalFile(
  tasks: CalendarTask[],
  filename: string = 'compliance-calendar.ics',
  options: ICalExportOptions = {}
): void {
  const icalContent = exportTasksToICal(tasks, options)
  const url = createICalDownloadUrl(icalContent)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the object URL
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Generate iCal for a single task
 */
export function generateTaskICal(task: CalendarTask, options: ICalExportOptions = {}): string {
  return exportTasksToICal([task], {
    ...options,
    name: `Task: ${task.title}`,
    description: `Individual task export: ${task.title}`
  })
}

/**
 * Parse iCal content and extract task data
 */
export function parseICalToTasks(icalContent: string): Partial<CalendarTask>[] {
  // This is a simplified parser - in production you might want to use a proper iCal parsing library
  const tasks: Partial<CalendarTask>[] = []
  
  try {
    // Basic regex parsing for demonstration
    const eventBlocks = icalContent.split('BEGIN:VEVENT')
    
    eventBlocks.slice(1).forEach(block => {
      const lines = block.split('\n')
      const task: Partial<CalendarTask> = {}
      
      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':')
        const value = valueParts.join(':').trim()
        
        switch (key) {
          case 'UID':
            task.id = value
            break
          case 'SUMMARY':
            task.title = value
            break
          case 'DESCRIPTION':
            task.description = value.replace(/\\n/g, '\n')
            break
          case 'DTSTART':
            task.startDate = parseICalDate(value)
            break
          case 'DTEND':
            task.endDate = parseICalDate(value)
            break
          case 'LOCATION':
            task.location = value
            break
          case 'X-COMPLIANCE-FRAMEWORK':
            task.complianceFramework = value
            break
          case 'X-REGULATORY-REFERENCE':
            task.regulatoryReference = value
            break
          case 'X-TAGS':
            task.tags = value.split(',').map(tag => tag.trim())
            break
        }
      })
      
      if (task.title) {
        tasks.push(task)
      }
    })
  } catch (error) {
    console.error('Error parsing iCal content:', error)
  }
  
  return tasks
}

/**
 * Parse iCal date format
 */
function parseICalDate(dateString: string): string {
  // Handle various iCal date formats
  if (dateString.includes('T')) {
    // YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
    const cleanDate = dateString.replace(/[TZ]/g, '')
    const year = cleanDate.substring(0, 4)
    const month = cleanDate.substring(4, 6)
    const day = cleanDate.substring(6, 8)
    const hour = cleanDate.substring(8, 10) || '00'
    const minute = cleanDate.substring(10, 12) || '00'
    const second = cleanDate.substring(12, 14) || '00'
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`
  } else {
    // YYYYMMDD
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    
    return `${year}-${month}-${day}T00:00:00`
  }
}

/**
 * Create subscription URL for calendar feed
 */
export function createCalendarSubscriptionUrl(tenantId: string, apiKey: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/api/v1/calendar/feed/${tenantId}?key=${apiKey}`
}

/**
 * Validate iCal content
 */
export function validateICalContent(icalContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!icalContent.includes('BEGIN:VCALENDAR')) {
    errors.push('Missing VCALENDAR BEGIN')
  }
  
  if (!icalContent.includes('END:VCALENDAR')) {
    errors.push('Missing VCALENDAR END')
  }
  
  if (!icalContent.includes('VERSION:')) {
    errors.push('Missing VERSION property')
  }
  
  if (!icalContent.includes('PRODID:')) {
    errors.push('Missing PRODID property')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}