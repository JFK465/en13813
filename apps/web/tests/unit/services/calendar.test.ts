import { CalendarService } from '@/lib/core/calendar'
import { NotificationService } from '@/lib/core/notifications'
import { setupTestEnvironment } from '@/tests/utils/test-db'

// Mock the notification service
jest.mock('@/lib/core/notifications')

describe('CalendarService', () => {
  let calendarService: CalendarService
  let testEnv: any
  let mockNotificationService: jest.Mocked<NotificationService>

  beforeEach(async () => {
    testEnv = await setupTestEnvironment()
    calendarService = new CalendarService()
    mockNotificationService = new NotificationService() as jest.Mocked<NotificationService>
    
    // Mock the getCurrentTenantId method
    jest.spyOn(calendarService as any, 'getCurrentTenantId').mockResolvedValue(testEnv.tenant.id)
  })

  afterEach(async () => {
    await testEnv.cleanup()
    jest.clearAllMocks()
  })

  describe('createTask', () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test description',
      category: 'compliance_deadline' as const,
      priority: 'high' as const,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      allDay: false,
      assignedTo: 'test-user-id',
      complianceFramework: 'ISO 50001',
      regulatoryReference: '4.5.1',
      reminderIntervals: [1440, 60],
      tags: ['test', 'compliance'],
      metadata: { testData: 'value' },
    }

    it('should create a task successfully', async () => {
      const taskId = await calendarService.createTask(taskData, testEnv.user.id)

      expect(taskId).toBeDefined()
      expect(typeof taskId).toBe('string')

      // Verify task was created
      const createdTask = await calendarService.getById(taskId)
      expect(createdTask).toMatchObject({
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        complianceFramework: taskData.complianceFramework,
        regulatoryReference: taskData.regulatoryReference,
      })
    })

    it('should send notification when task is assigned to someone else', async () => {
      mockNotificationService.sendNotification = jest.fn().mockResolvedValue('notification-id')
      
      const assignedUserId = 'other-user-id'
      const taskWithAssignment = {
        ...taskData,
        assignedTo: assignedUserId,
      }

      await calendarService.createTask(taskWithAssignment, testEnv.user.id)

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('New Task Assignment'),
          recipientId: assignedUserId,
          type: 'workflow_assigned',
        })
      )
    })

    it('should handle missing title', async () => {
      const invalidTaskData = {
        ...taskData,
        title: '',
      }

      await expect(
        calendarService.createTask(invalidTaskData, testEnv.user.id)
      ).rejects.toThrow()
    })

    it('should set default values correctly', async () => {
      const minimalTaskData = {
        title: 'Minimal Task',
        startDate: new Date().toISOString(),
      }

      const taskId = await calendarService.createTask(minimalTaskData, testEnv.user.id)
      const createdTask = await calendarService.getById(taskId)

      expect(createdTask).toMatchObject({
        category: 'other',
        priority: 'medium',
        allDay: false,
        recurrencePattern: 'none',
        reminderIntervals: [1440, 60],
        tags: [],
        metadata: {},
      })
    })
  })

  describe('updateTask', () => {
    let taskId: string

    beforeEach(async () => {
      const task = await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id)
      taskId = task.id
    })

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task Title',
        priority: 'urgent' as const,
        description: 'Updated description',
      }

      const success = await calendarService.updateTask(taskId, updateData, testEnv.user.id)

      expect(success).toBe(true)

      const updatedTask = await calendarService.getById(taskId)
      expect(updatedTask).toMatchObject(updateData)
    })

    it('should send notification when task is completed', async () => {
      mockNotificationService.sendNotification = jest.fn().mockResolvedValue('notification-id')

      const updateData = {
        status: 'completed' as const,
      }

      await calendarService.updateTask(taskId, updateData, testEnv.user.id)

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Task Completed'),
          type: 'workflow_completed',
        })
      )
    })

    it('should handle non-existent task', async () => {
      const nonExistentId = 'non-existent-id'
      const updateData = { title: 'Updated Title' }

      await expect(
        calendarService.updateTask(nonExistentId, updateData, testEnv.user.id)
      ).rejects.toThrow()
    })
  })

  describe('fetchTasks', () => {
    beforeEach(async () => {
      // Create multiple test tasks
      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        title: 'Task 1',
        category: 'compliance_deadline',
        priority: 'high',
        status: 'pending',
        start_date: new Date().toISOString(),
      })

      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        title: 'Task 2',
        category: 'audit_preparation',
        priority: 'medium',
        status: 'completed',
        start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        title: 'Task 3',
        category: 'compliance_deadline',
        priority: 'low',
        status: 'in_progress',
        start_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      })
    })

    it('should fetch all tasks', async () => {
      const tasks = await calendarService.fetchTasks()

      expect(tasks).toHaveLength(3)
      expect(tasks.map(t => t.title)).toEqual(
        expect.arrayContaining(['Task 1', 'Task 2', 'Task 3'])
      )
    })

    it('should filter by category', async () => {
      const tasks = await calendarService.fetchTasks({
        category: 'compliance_deadline',
      })

      expect(tasks).toHaveLength(2)
      expect(tasks.every(t => t.category === 'compliance_deadline')).toBe(true)
    })

    it('should filter by status', async () => {
      const tasks = await calendarService.fetchTasks({
        status: 'pending',
      })

      expect(tasks).toHaveLength(1)
      expect(tasks[0].status).toBe('pending')
    })

    it('should exclude completed tasks by default', async () => {
      const tasks = await calendarService.fetchTasks({
        includeCompleted: false,
      })

      expect(tasks).toHaveLength(2)
      expect(tasks.every(t => t.status !== 'completed')).toBe(true)
    })

    it('should include completed tasks when requested', async () => {
      const tasks = await calendarService.fetchTasks({
        includeCompleted: true,
      })

      expect(tasks).toHaveLength(3)
      expect(tasks.some(t => t.status === 'completed')).toBe(true)
    })

    it('should filter by date range', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

      const tasks = await calendarService.fetchTasks({
        startDate: tomorrow,
        endDate: dayAfter,
      })

      expect(tasks).toHaveLength(2)
    })
  })

  describe('getTaskStats', () => {
    beforeEach(async () => {
      // Create tasks with different statuses
      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        status: 'pending',
      })
      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        status: 'pending',
      })
      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        status: 'in_progress',
      })
      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        status: 'completed',
      })
      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        status: 'overdue',
      })
    })

    it('should return correct task statistics', async () => {
      const stats = await calendarService.getTaskStats()

      expect(stats).toEqual({
        total: 5,
        pending: 2,
        inProgress: 1,
        completed: 1,
        overdue: 1,
        cancelled: 0,
      })
    })
  })

  describe('deleteTask', () => {
    let taskId: string

    beforeEach(async () => {
      const task = await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id)
      taskId = task.id
    })

    it('should soft delete task successfully', async () => {
      const success = await calendarService.deleteTask(taskId, testEnv.user.id)

      expect(success).toBe(true)

      // Task should no longer be fetchable
      const deletedTask = await calendarService.getById(taskId)
      expect(deletedTask).toBeNull()
    })

    it('should handle non-existent task', async () => {
      const nonExistentId = 'non-existent-id'

      await expect(
        calendarService.deleteTask(nonExistentId, testEnv.user.id)
      ).rejects.toThrow()
    })
  })

  describe('addTaskComment', () => {
    let taskId: string

    beforeEach(async () => {
      const task = await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id)
      taskId = task.id
    })

    it('should add comment successfully', async () => {
      const comment = 'This is a test comment'
      const commentType = 'comment'

      const commentId = await calendarService.addTaskComment(
        taskId,
        comment,
        commentType,
        testEnv.user.id
      )

      expect(commentId).toBeDefined()
      expect(typeof commentId).toBe('string')

      // Verify comment was added
      const comments = await calendarService.getTaskComments(taskId)
      expect(comments).toHaveLength(1)
      expect(comments[0]).toMatchObject({
        comment,
        commentType,
        userId: testEnv.user.id,
      })
    })
  })
})