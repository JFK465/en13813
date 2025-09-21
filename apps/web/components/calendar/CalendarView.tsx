'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import { useCalendar } from '@/hooks/useCalendar'
import { useAuth } from '@/hooks/core/useAuth'
import type { CalendarTask, TaskCategory, TaskPriority } from '@/lib/core/calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource: CalendarTask
}

interface CalendarViewProps {
  onSelectEvent?: (task: CalendarTask) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[] }) => void
  defaultView?: any
  showToolbar?: boolean
  height?: number
  category?: TaskCategory
  assignedToMe?: boolean
}

export function CalendarView({
  onSelectEvent,
  onSelectSlot,
  defaultView = Views.MONTH,
  showToolbar = true,
  height = 600,
  category,
  assignedToMe = false
}: CalendarViewProps) {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<any>(defaultView)
  
  // Calculate date range based on current view
  const dateRange = useMemo(() => {
    const start = moment(currentDate).startOf(currentView === Views.MONTH ? 'month' : 'week')
    const end = moment(currentDate).endOf(currentView === Views.MONTH ? 'month' : 'week')
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    }
  }, [currentDate, currentView])

  const { tasks, loading, error, fetchTasks } = useCalendar({
    startDate: dateRange.start,
    endDate: dateRange.end,
    category,
    assignedTo: assignedToMe ? user?.id : undefined,
    includeCompleted: true
  })

  // Transform tasks to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return tasks.map(task => {
      const start = new Date(task.startDate)
      const end = task.endDate ? new Date(task.endDate) : new Date(task.startDate)
      
      // If no end date and not all day, make it 1 hour duration
      if (!task.endDate && !task.allDay) {
        end.setHours(start.getHours() + 1)
      }

      return {
        id: task.id,
        title: task.title,
        start,
        end,
        allDay: task.allDay,
        resource: task
      }
    })
  }, [tasks])

  // Refresh data when date range changes
  useEffect(() => {
    fetchTasks({
      startDate: dateRange.start,
      endDate: dateRange.end,
      category,
      assignedTo: assignedToMe ? user?.id : undefined,
      includeCompleted: true
    })
  }, [dateRange.start, dateRange.end, category, assignedToMe, user?.id, fetchTasks])

  // Event styling based on task properties
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const task = event.resource
    let backgroundColor = '#3174ad' // Default blue
    let borderColor = '#3174ad'

    // Color by priority
    switch (task.priority) {
      case 'urgent':
        backgroundColor = '#dc2626' // Red
        borderColor = '#dc2626'
        break
      case 'high':
        backgroundColor = '#ea580c' // Orange
        borderColor = '#ea580c'
        break
      case 'medium':
        backgroundColor = '#2563eb' // Blue
        borderColor = '#2563eb'
        break
      case 'low':
        backgroundColor = '#16a34a' // Green
        borderColor = '#16a34a'
        break
    }

    // Adjust opacity based on status
    if (task.status === 'completed') {
      backgroundColor = '#6b7280' // Gray
      borderColor = '#6b7280'
    } else if (task.status === 'overdue') {
      backgroundColor = '#dc2626' // Red
      borderColor = '#dc2626'
    } else if (task.status === 'cancelled') {
      backgroundColor = '#6b7280' // Gray
      borderColor = '#6b7280'
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        opacity: task.status === 'completed' ? 0.7 : 1
      }
    }
  }, [])

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onSelectEvent?.(event.resource)
  }, [onSelectEvent])

  // Handle slot selection (for creating new events)
  const handleSelectSlot = useCallback((slotInfo: any) => {
    onSelectSlot?.(slotInfo)
  }, [onSelectSlot])

  // Handle navigation
  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  // Handle view change
  const handleViewChange = useCallback((view: any) => {
    setCurrentView(view)
  }, [])

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const task = event.resource
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    
    return (
      <div className="p-1">
        <div className="flex items-center gap-1 text-xs">
          {isOverdue && <span className="text-red-200">⚠️</span>}
          <span className="font-medium truncate">{event.title}</span>
        </div>
        {task.category && (
          <div className="text-xs opacity-80 capitalize">
            {task.category.replace('_', ' ')}
          </div>
        )}
      </div>
    )
  }

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView, view }: any) => (
    <div className="flex items-center justify-between mb-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('PREV')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          ←
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          →
        </button>
      </div>
      
      <h2 className="text-lg font-semibold">{label}</h2>
      
      <div className="flex items-center gap-1">
        {[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA].map(viewName => (
          <button
            key={viewName}
            onClick={() => onView(viewName)}
            className={`px-3 py-1 text-sm border border-gray-300 rounded ${
              view === viewName 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
          >
            {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error loading calendar: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        allDayAccessor="allDay"
        resourceAccessor="resource"
        style={{ height }}
        date={currentDate}
        view={currentView}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable={!!onSelectSlot}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
          ...(showToolbar && { toolbar: CustomToolbar })
        }}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        step={60}
        timeslots={1}
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
          agendaTimeFormat: 'HH:mm',
          agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
        }}
        messages={{
          noEventsInRange: 'No tasks in this date range.',
          showMore: (total: number) => `+${total} more`
        }}
      />
      
      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">Priority:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600 rounded"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}