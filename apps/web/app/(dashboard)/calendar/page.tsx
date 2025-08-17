'use client'

import { useState } from 'react'
import { CalendarView } from '@/components/calendar/CalendarView'
import { TaskModal } from '@/components/calendar/TaskModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useCalendar } from '@/hooks/useCalendar'
import type { CalendarTask, TaskCategory } from '@/lib/core/calendar'
import { downloadICalFile, createCalendarSubscriptionUrl } from '@/lib/utils/ical'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Download, 
  Link, 
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users
} from 'lucide-react'

const TASK_CATEGORIES: { value: TaskCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'compliance_deadline', label: 'Compliance Deadline' },
  { value: 'audit_preparation', label: 'Audit Preparation' },
  { value: 'document_review', label: 'Document Review' },
  { value: 'training_session', label: 'Training Session' },
  { value: 'certification_renewal', label: 'Certification Renewal' },
  { value: 'inspection_date', label: 'Inspection Date' },
  { value: 'reporting_deadline', label: 'Reporting Deadline' },
  { value: 'maintenance_task', label: 'Maintenance Task' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' }
]

export default function CalendarPage() {
  const { toast } = useToast()
  const { tasks, loading, getTaskStats } = useCalendar()
  
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit' | 'view'>('view')
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all')
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false)

  const stats = getTaskStats()

  const handleSelectEvent = (task: CalendarTask) => {
    setSelectedTask(task)
    setTaskModalMode('view')
    setTaskModalOpen(true)
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; slots: Date[] }) => {
    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end })
    setSelectedTask(null)
    setTaskModalMode('create')
    setTaskModalOpen(true)
  }

  const handleCreateTask = () => {
    setSelectedTask(null)
    setSelectedSlot(null)
    setTaskModalMode('create')
    setTaskModalOpen(true)
  }

  const handleExportCalendar = () => {
    try {
      downloadICalFile(tasks, 'compliance-calendar.ics', {
        name: 'Compliance Calendar',
        description: 'Compliance tasks and deadlines'
      })
      toast({
        title: 'Success',
        description: 'Calendar exported successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export calendar',
        variant: 'destructive'
      })
    }
  }

  const handleCopySubscriptionUrl = () => {
    // This would need actual implementation with tenant ID and API key
    const url = createCalendarSubscriptionUrl('tenant-id', 'api-key')
    navigator.clipboard.writeText(url)
    toast({
      title: 'Success',
      description: 'Subscription URL copied to clipboard'
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-8 w-8" />
            Compliance Calendar
          </h1>
          <p className="text-muted-foreground">
            Manage compliance tasks, deadlines, and schedules
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopySubscriptionUrl}>
            <Link className="h-4 w-4 mr-2" />
            Subscribe
          </Button>
          <Button variant="outline" onClick={handleExportCalendar}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter calendar view by category and assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="category" className="text-sm font-medium">Category:</label>
            <Select
              value={categoryFilter}
              onValueChange={(value: TaskCategory | 'all') => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TASK_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="assigned-to-me"
              checked={assignedToMeOnly}
              onChange={(e) => setAssignedToMeOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="assigned-to-me" className="text-sm font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              Assigned to me only
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <CalendarView
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            category={categoryFilter === 'all' ? undefined : categoryFilter}
            assignedToMe={assignedToMeOnly}
            height={700}
          />
        </CardContent>
      </Card>

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={selectedTask}
        mode={taskModalMode}
        initialData={selectedSlot ? {
          start: selectedSlot.start,
          end: selectedSlot.end
        } : undefined}
      />
    </div>
  )
}