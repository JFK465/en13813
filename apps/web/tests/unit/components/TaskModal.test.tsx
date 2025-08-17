import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskModal } from '@/components/calendar/TaskModal'
import { useCalendar } from '@/hooks/useCalendar'
import { useToast } from '@/hooks/use-toast'
import { renderWithProviders, createMockTask } from '@/tests/utils/test-helpers'

// Mock hooks
jest.mock('@/hooks/useCalendar')
jest.mock('@/hooks/use-toast')

const mockUseCalendar = useCalendar as jest.MockedFunction<typeof useCalendar>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('TaskModal', () => {
  const mockCreateTask = jest.fn()
  const mockUpdateTask = jest.fn()
  const mockToast = jest.fn()

  beforeEach(() => {
    mockUseCalendar.mockReturnValue({
      createTask: mockCreateTask,
      updateTask: mockUpdateTask,
      tasks: [],
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      deleteTask: jest.fn(),
      getTaskStats: jest.fn(),
      getUpcomingDeadlines: jest.fn(),
      getOverdueTasks: jest.fn(),
      addTaskComment: jest.fn(),
      getTaskById: jest.fn(),
      getTaskComments: jest.fn(),
      clearError: jest.fn(),
      refresh: jest.fn(),
    })

    mockUseToast.mockReturnValue({
      toast: mockToast,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Create Mode', () => {
    const defaultProps = {
      open: true,
      onOpenChange: jest.fn(),
      mode: 'create' as const,
    }

    it('should render create form', () => {
      renderWithProviders(<TaskModal {...defaultProps} />)

      expect(screen.getByText('Create New Task')).toBeInTheDocument()
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByText('Create Task')).toBeInTheDocument()
    })

    it('should create task with valid data', async () => {
      const user = userEvent.setup()
      mockCreateTask.mockResolvedValue('new-task-id')

      renderWithProviders(<TaskModal {...defaultProps} />)

      // Fill form
      await user.type(screen.getByLabelText(/title/i), 'New Compliance Task')
      await user.type(screen.getByLabelText(/description/i), 'Task description')
      
      // Select category
      await user.click(screen.getByLabelText(/category/i))
      await user.click(screen.getByText('Compliance Deadline'))
      
      // Select priority
      await user.click(screen.getByLabelText(/priority/i))
      await user.click(screen.getByText('High'))

      // Submit
      await user.click(screen.getByText('Create Task'))

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Compliance Task',
            description: 'Task description',
            category: 'compliance_deadline',
            priority: 'high',
          })
        )
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Task created successfully',
      })
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()

      renderWithProviders(<TaskModal {...defaultProps} />)

      // Try to submit without title
      await user.click(screen.getByText('Create Task'))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Task title is required',
          variant: 'destructive',
        })
      })

      expect(mockCreateTask).not.toHaveBeenCalled()
    })

    it('should handle initial data for slot selection', () => {
      const initialData = {
        start: new Date('2024-01-15T09:00:00'),
        end: new Date('2024-01-15T10:00:00'),
      }

      renderWithProviders(
        <TaskModal {...defaultProps} initialData={initialData} />
      )

      const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement
      expect(startDateInput.value).toBe('2024-01-15T09:00')
    })

    it('should toggle all-day mode', async () => {
      const user = userEvent.setup()

      renderWithProviders(<TaskModal {...defaultProps} />)

      const allDaySwitch = screen.getByLabelText(/all day/i)
      
      // Should start unchecked
      expect(allDaySwitch).not.toBeChecked()

      // Toggle all day
      await user.click(allDaySwitch)
      expect(allDaySwitch).toBeChecked()

      // Date inputs should change format
      const startDateInput = screen.getByLabelText(/start date/i)
      expect(startDateInput).toHaveAttribute('type', 'date')
    })
  })

  describe('Edit Mode', () => {
    const mockTask = createMockTask({
      title: 'Existing Task',
      description: 'Existing description',
      category: 'audit_preparation',
      priority: 'medium',
      status: 'in_progress',
    })

    const editProps = {
      open: true,
      onOpenChange: jest.fn(),
      task: mockTask,
      mode: 'edit' as const,
    }

    it('should render edit form with task data', () => {
      renderWithProviders(<TaskModal {...editProps} />)

      expect(screen.getByText('Edit Task')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
      expect(screen.getByText('Update Task')).toBeInTheDocument()
    })

    it('should update task with changes', async () => {
      const user = userEvent.setup()
      mockUpdateTask.mockResolvedValue(true)

      renderWithProviders(<TaskModal {...editProps} />)

      // Modify title
      const titleInput = screen.getByDisplayValue('Existing Task')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task Title')

      // Submit
      await user.click(screen.getByText('Update Task'))

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          mockTask.id,
          expect.objectContaining({
            title: 'Updated Task Title',
            status: 'in_progress',
          })
        )
      })

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Task updated successfully',
      })
    })

    it('should allow status change', async () => {
      const user = userEvent.setup()

      renderWithProviders(<TaskModal {...editProps} />)

      // Change status
      await user.click(screen.getByLabelText(/status/i))
      await user.click(screen.getByText('Completed'))

      await user.click(screen.getByText('Update Task'))

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          mockTask.id,
          expect.objectContaining({
            status: 'completed',
          })
        )
      })
    })
  })

  describe('View Mode', () => {
    const mockTask = createMockTask({
      title: 'View Task',
      description: 'Task for viewing',
      category: 'compliance_deadline',
      priority: 'urgent',
      status: 'pending',
      complianceFramework: 'ISO 50001',
      regulatoryReference: '4.5.1',
      tags: ['energy', 'compliance'],
    })

    const viewProps = {
      open: true,
      onOpenChange: jest.fn(),
      task: mockTask,
      mode: 'view' as const,
    }

    it('should render view mode correctly', () => {
      renderWithProviders(<TaskModal {...viewProps} />)

      expect(screen.getByText('Task Details')).toBeInTheDocument()
      expect(screen.getByText('View Task')).toBeInTheDocument()
      expect(screen.getByText('Task for viewing')).toBeInTheDocument()
      expect(screen.getByText('ISO 50001')).toBeInTheDocument()
      expect(screen.getByText('4.5.1')).toBeInTheDocument()
      expect(screen.getByText('energy')).toBeInTheDocument()
      expect(screen.getByText('compliance')).toBeInTheDocument()
      expect(screen.getByText('Edit Task')).toBeInTheDocument()
      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    it('should switch to edit mode when edit button clicked', async () => {
      const user = userEvent.setup()

      renderWithProviders(<TaskModal {...viewProps} />)

      await user.click(screen.getByText('Edit Task'))

      // Should now show edit form
      expect(screen.getByDisplayValue('View Task')).toBeInTheDocument()
      expect(screen.getByText('Update Task')).toBeInTheDocument()
    })

    it('should display priority with color indicator', () => {
      renderWithProviders(<TaskModal {...viewProps} />)

      const priorityElement = screen.getByText('urgent').closest('div')
      expect(priorityElement).toHaveClass('bg-red-500')
    })

    it('should display status badge', () => {
      renderWithProviders(<TaskModal {...viewProps} />)

      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  describe('Compliance Fields', () => {
    const defaultProps = {
      open: true,
      onOpenChange: jest.fn(),
      mode: 'create' as const,
    }

    it('should show compliance fields when framework is entered', async () => {
      const user = userEvent.setup()

      renderWithProviders(<TaskModal {...defaultProps} />)

      // Add compliance framework
      await user.type(screen.getByLabelText(/framework/i), 'ISO 50001')

      expect(screen.getByLabelText(/reference/i)).toBeInTheDocument()
    })

    it('should save compliance metadata', async () => {
      const user = userEvent.setup()
      mockCreateTask.mockResolvedValue('new-task-id')

      renderWithProviders(<TaskModal {...defaultProps} />)

      // Fill required fields
      await user.type(screen.getByLabelText(/title/i), 'Compliance Task')
      
      // Add compliance data
      await user.type(screen.getByLabelText(/framework/i), 'GDPR')
      await user.type(screen.getByLabelText(/reference/i), 'Art. 30')

      await user.click(screen.getByText('Create Task'))

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            complianceFramework: 'GDPR',
            regulatoryReference: 'Art. 30',
          })
        )
      })
    })
  })

  describe('Tags', () => {
    const defaultProps = {
      open: true,
      onOpenChange: jest.fn(),
      mode: 'create' as const,
    }

    it('should parse comma-separated tags', async () => {
      const user = userEvent.setup()
      mockCreateTask.mockResolvedValue('new-task-id')

      renderWithProviders(<TaskModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/title/i), 'Tagged Task')
      await user.type(screen.getByLabelText(/tags/i), 'energy, compliance, iso')

      await user.click(screen.getByText('Create Task'))

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['energy', 'compliance', 'iso'],
          })
        )
      })
    })

    it('should display existing tags in view mode', () => {
      const taskWithTags = createMockTask({
        tags: ['energy', 'management', 'compliance'],
      })

      renderWithProviders(
        <TaskModal
          open={true}
          onOpenChange={jest.fn()}
          task={taskWithTags}
          mode="view"
        />
      )

      expect(screen.getByText('energy')).toBeInTheDocument()
      expect(screen.getByText('management')).toBeInTheDocument()
      expect(screen.getByText('compliance')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    const defaultProps = {
      open: true,
      onOpenChange: jest.fn(),
      mode: 'create' as const,
    }

    it('should handle create task error', async () => {
      const user = userEvent.setup()
      mockCreateTask.mockRejectedValue(new Error('Failed to create task'))

      renderWithProviders(<TaskModal {...defaultProps} />)

      await user.type(screen.getByLabelText(/title/i), 'Error Task')
      await user.click(screen.getByText('Create Task'))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to create task',
          variant: 'destructive',
        })
      })
    })

    it('should handle update task error', async () => {
      const user = userEvent.setup()
      mockUpdateTask.mockRejectedValue(new Error('Update failed'))

      const task = createMockTask()
      renderWithProviders(
        <TaskModal
          open={true}
          onOpenChange={jest.fn()}
          task={task}
          mode="edit"
        />
      )

      await user.click(screen.getByText('Update Task'))

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Update failed',
          variant: 'destructive',
        })
      })
    })
  })
})