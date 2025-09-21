'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useCalendar } from '@/hooks/useCalendar'
import type { CalendarTask, CreateTaskData, UpdateTaskData, TaskCategory, TaskPriority, TaskStatus } from '@/lib/core/calendar'
import { Calendar, Clock, User, Building, Tag, AlertTriangle, CheckCircle } from 'lucide-react'

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: CalendarTask | null
  initialData?: {
    start: Date
    end: Date
  }
  mode?: 'create' | 'edit' | 'view'
}

const TASK_CATEGORIES: { value: TaskCategory; label: string }[] = [
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

const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' }
]

const TASK_STATUSES: { value: TaskStatus; label: string; icon: any }[] = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'in_progress', label: 'In Progress', icon: Clock },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { value: 'cancelled', label: 'Cancelled', icon: AlertTriangle },
  { value: 'on_hold', label: 'On Hold', icon: Clock }
]

export function TaskModal({
  open,
  onOpenChange,
  task,
  initialData,
  mode = task ? 'view' : 'create'
}: TaskModalProps) {
  const { createTask, updateTask } = useCalendar()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentMode, setCurrentMode] = useState(mode)

  // Form state
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    startDate: new Date().toISOString(),
    endDate: '',
    dueDate: '',
    allDay: false,
    location: '',
    assignedTo: '',
    complianceFramework: '',
    regulatoryReference: '',
    recurrencePattern: 'none',
    tags: [],
    metadata: {}
  })

  const [status, setStatus] = useState<TaskStatus>('pending')

  // Initialize form data
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        startDate: task.startDate,
        endDate: task.endDate || '',
        dueDate: task.dueDate || '',
        allDay: task.allDay,
        location: task.location || '',
        assignedTo: task.assignedTo || '',
        complianceFramework: task.complianceFramework || '',
        regulatoryReference: task.regulatoryReference || '',
        recurrencePattern: task.recurrencePattern,
        tags: task.tags,
        metadata: task.metadata
      })
      setStatus(task.status)
      setCurrentMode(mode)
    } else if (initialData) {
      setFormData(prev => ({
        ...prev,
        startDate: initialData.start.toISOString(),
        endDate: initialData.end.toISOString()
      }))
      setCurrentMode('create')
    }
  }, [task, initialData, mode])

  const isViewMode = currentMode === 'view'
  const isEditMode = currentMode === 'edit'
  const isCreateMode = currentMode === 'create'

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Task title is required',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)

      if (isCreateMode) {
        const taskId = await createTask(formData)
        if (taskId) {
          toast({
            title: 'Success',
            description: 'Task created successfully'
          })
          onOpenChange(false)
        }
      } else if (isEditMode && task) {
        const updateData: UpdateTaskData = {
          ...formData,
          status
        }
        const success = await updateTask(task.id, updateData)
        if (success) {
          toast({
            title: 'Success',
            description: 'Task updated successfully'
          })
          onOpenChange(false)
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save task',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    return format(new Date(dateString), 'PPP p')
  }

  const getPriorityColor = (priority: TaskPriority) => {
    return TASK_PRIORITIES.find(p => p.value === priority)?.color || 'bg-gray-500'
  }

  const getStatusIcon = (status: TaskStatus) => {
    const statusConfig = TASK_STATUSES.find(s => s.value === status)
    return statusConfig?.icon || Clock
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreateMode && (
              <>
                <Calendar className="h-5 w-5" />
                Create New Task
              </>
            )}
            {isViewMode && (
              <>
                <Calendar className="h-5 w-5" />
                Task Details
              </>
            )}
            {isEditMode && (
              <>
                <Calendar className="h-5 w-5" />
                Edit Task
              </>
            )}
          </DialogTitle>
          {!isCreateMode && (
            <DialogDescription>
              {isViewMode ? 'View task details and actions' : 'Update task information'}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Status (Edit/View mode) */}
          {!isCreateMode && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const StatusIcon = getStatusIcon(status)
                  return <StatusIcon className="h-4 w-4" />
                })()}
                <span className="font-medium">Status:</span>
              </div>
              {isEditMode ? (
                <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <status.icon className="h-4 w-4" />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={status === 'completed' ? 'default' : status === 'overdue' ? 'destructive' : 'secondary'}>
                  {TASK_STATUSES.find(s => s.value === status)?.label || status}
                </Badge>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              {isViewMode ? (
                <p className="text-lg font-medium mt-1">{formData.title}</p>
              ) : (
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  className="mt-1"
                />
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              {isViewMode ? (
                <p className="text-gray-600 mt-1">{formData.description || 'No description'}</p>
              ) : (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows={3}
                  className="mt-1"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                {isViewMode ? (
                  <p className="mt-1 capitalize">
                    {TASK_CATEGORIES.find(c => c.value === formData.category)?.label || formData.category}
                  </p>
                ) : (
                  <Select
                    value={formData.category}
                    onValueChange={(value: TaskCategory) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                {isViewMode ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded ${formData.priority ? getPriorityColor(formData.priority) : 'bg-gray-500'}`}></div>
                    <span className="capitalize">{formData.priority || 'medium'}</span>
                  </div>
                ) : (
                  <Select
                    value={formData.priority}
                    onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_PRIORITIES.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${priority.color}`}></div>
                            {priority.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="font-medium">Schedule</h3>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allDay"
                  checked={formData.allDay}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allDay: checked }))}
                  disabled={isViewMode}
                />
                <Label htmlFor="allDay">All day</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                {isViewMode ? (
                  <p className="mt-1">{formatDateTime(formData.startDate)}</p>
                ) : (
                  <Input
                    id="startDate"
                    type={formData.allDay ? 'date' : 'datetime-local'}
                    value={formData.allDay 
                      ? formData.startDate.split('T')[0]
                      : formData.startDate.slice(0, 16)
                    }
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      startDate: formData.allDay 
                        ? `${e.target.value}T00:00:00`
                        : `${e.target.value}:00`
                    }))}
                    className="mt-1"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                {isViewMode ? (
                  <p className="mt-1">{formData.dueDate ? formatDateTime(formData.dueDate) : 'No due date'}</p>
                ) : (
                  <Input
                    id="dueDate"
                    type={formData.allDay ? 'date' : 'datetime-local'}
                    value={formData.dueDate 
                      ? (formData.allDay 
                          ? formData.dueDate.split('T')[0]
                          : formData.dueDate.slice(0, 16)
                        )
                      : ''
                    }
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      dueDate: e.target.value 
                        ? (formData.allDay 
                            ? `${e.target.value}T23:59:59`
                            : `${e.target.value}:00`
                          )
                        : ''
                    }))}
                    className="mt-1"
                  />
                )}
              </div>
            </div>

            {formData.location && (
              <div>
                <Label htmlFor="location">Location</Label>
                {isViewMode ? (
                  <p className="mt-1">{formData.location}</p>
                ) : (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location"
                    className="mt-1"
                  />
                )}
              </div>
            )}
          </div>

          {/* Compliance Information */}
          {(formData.complianceFramework || formData.regulatoryReference || !isViewMode) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium">Compliance Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="complianceFramework">Framework</Label>
                    {isViewMode ? (
                      <p className="mt-1">{formData.complianceFramework || 'None'}</p>
                    ) : (
                      <Input
                        id="complianceFramework"
                        value={formData.complianceFramework}
                        onChange={(e) => setFormData(prev => ({ ...prev, complianceFramework: e.target.value }))}
                        placeholder="e.g., ISO 50001, GDPR"
                        className="mt-1"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="regulatoryReference">Reference</Label>
                    {isViewMode ? (
                      <p className="mt-1">{formData.regulatoryReference || 'None'}</p>
                    ) : (
                      <Input
                        id="regulatoryReference"
                        value={formData.regulatoryReference}
                        onChange={(e) => setFormData(prev => ({ ...prev, regulatoryReference: e.target.value }))}
                        placeholder="e.g., Art. 30, 4.5.1"
                        className="mt-1"
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {((formData.tags?.length ?? 0) > 0 || !isViewMode) && (
            <>
              <Separator />
              <div>
                <Label>Tags</Label>
                {isViewMode ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {(formData.tags?.length ?? 0) === 0 && <p className="text-gray-500">No tags</p>}
                  </div>
                ) : (
                  <Input
                    value={formData.tags?.join(', ') ?? ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                    placeholder="Enter tags separated by commas"
                    className="mt-1"
                  />
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {isViewMode ? (
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => setCurrentMode('edit')}>
                Edit Task
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : (isCreateMode ? 'Create Task' : 'Update Task')}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}