import { NotificationService } from '@/lib/core/notifications'
import { setupTestEnvironment } from '@/tests/utils/test-db'
import { Resend } from 'resend'

// Mock Resend
jest.mock('resend')

describe('NotificationService', () => {
  let notificationService: NotificationService
  let testEnv: any
  let mockResend: jest.Mocked<Resend>

  beforeEach(async () => {
    testEnv = await setupTestEnvironment()
    notificationService = new NotificationService()
    mockResend = new Resend() as jest.Mocked<Resend>
    
    // Mock the getCurrentTenantId method
    jest.spyOn(notificationService as any, 'getCurrentTenantId').mockResolvedValue(testEnv.tenant.id)
  })

  afterEach(async () => {
    await testEnv.cleanup()
    jest.clearAllMocks()
  })

  describe('sendNotification', () => {
    const notificationData = {
      type: 'deadline_reminder' as const,
      title: 'Test Notification',
      message: 'This is a test notification',
      recipientId: 'test-user-id',
      tenantId: 'test-tenant-id',
      priority: 'medium' as const,
      channels: ['email', 'in_app'] as const,
      metadata: { taskId: 'test-task-id' },
      actionUrl: '/calendar/tasks/test-task-id',
    }

    it('should send notification successfully', async () => {
      mockResend.emails = {
        send: jest.fn().mockResolvedValue({ id: 'email-id' }),
      } as any

      const notificationId = await notificationService.sendNotification(notificationData)

      expect(notificationId).toBeDefined()
      expect(typeof notificationId).toBe('string')

      // Verify email was sent
      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.any(String),
          subject: notificationData.title,
          html: expect.stringContaining(notificationData.message),
        })
      )
    })

    it('should create in-app notification', async () => {
      const inAppOnlyData = {
        ...notificationData,
        channels: ['in_app'] as const,
      }

      const notificationId = await notificationService.sendNotification(inAppOnlyData)

      // Verify notification was created in database
      const notification = await notificationService.getById(notificationId)
      expect(notification).toMatchObject({
        type: inAppOnlyData.type,
        title: inAppOnlyData.title,
        message: inAppOnlyData.message,
        priority: inAppOnlyData.priority,
        status: 'delivered',
      })
    })

    it('should handle email sending failure', async () => {
      mockResend.emails = {
        send: jest.fn().mockRejectedValue(new Error('Email service error')),
      } as any

      const emailData = {
        ...notificationData,
        channels: ['email'] as const,
      }

      await expect(
        notificationService.sendNotification(emailData)
      ).rejects.toThrow('Email service error')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        ...notificationData,
        title: '', // Empty title
      }

      await expect(
        notificationService.sendNotification(invalidData)
      ).rejects.toThrow()
    })

    it('should handle multiple channels', async () => {
      mockResend.emails = {
        send: jest.fn().mockResolvedValue({ id: 'email-id' }),
      } as any

      const multiChannelData = {
        ...notificationData,
        channels: ['email', 'in_app'] as const,
      }

      const notificationId = await notificationService.sendNotification(multiChannelData)

      // Verify both email and in-app notification were created
      expect(mockResend.emails.send).toHaveBeenCalled()
      
      const notification = await notificationService.getById(notificationId)
      expect(notification).toBeDefined()
    })
  })

  describe('getNotificationsForUser', () => {
    beforeEach(async () => {
      // Create test notifications
      await testEnv.testDb.createTestNotification(testEnv.tenant.id, testEnv.user.id, {
        title: 'Notification 1',
        status: 'delivered',
        priority: 'high',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      })

      await testEnv.testDb.createTestNotification(testEnv.tenant.id, testEnv.user.id, {
        title: 'Notification 2',
        status: 'read',
        priority: 'medium',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      })

      await testEnv.testDb.createTestNotification(testEnv.tenant.id, testEnv.user.id, {
        title: 'Notification 3',
        status: 'delivered',
        priority: 'low',
        created_at: new Date().toISOString(), // Now
      })
    })

    it('should fetch user notifications', async () => {
      const notifications = await notificationService.getNotificationsForUser(
        testEnv.user.id,
        { limit: 10 }
      )

      expect(notifications).toHaveLength(3)
      expect(notifications.map(n => n.title)).toEqual([
        'Notification 3', // Most recent first
        'Notification 2',
        'Notification 1',
      ])
    })

    it('should filter by status', async () => {
      const unreadNotifications = await notificationService.getNotificationsForUser(
        testEnv.user.id,
        { status: 'delivered', limit: 10 }
      )

      expect(unreadNotifications).toHaveLength(2)
      expect(unreadNotifications.every(n => n.status === 'delivered')).toBe(true)
    })

    it('should limit results', async () => {
      const limitedNotifications = await notificationService.getNotificationsForUser(
        testEnv.user.id,
        { limit: 2 }
      )

      expect(limitedNotifications).toHaveLength(2)
    })

    it('should filter by priority', async () => {
      const highPriorityNotifications = await notificationService.getNotificationsForUser(
        testEnv.user.id,
        { priority: 'high', limit: 10 }
      )

      expect(highPriorityNotifications).toHaveLength(1)
      expect(highPriorityNotifications[0].priority).toBe('high')
    })
  })

  describe('markAsRead', () => {
    let notificationId: string

    beforeEach(async () => {
      const notification = await testEnv.testDb.createTestNotification(
        testEnv.tenant.id,
        testEnv.user.id,
        { status: 'delivered' }
      )
      notificationId = notification.id
    })

    it('should mark notification as read', async () => {
      const success = await notificationService.markAsRead(notificationId, testEnv.user.id)

      expect(success).toBe(true)

      const notification = await notificationService.getById(notificationId)
      expect(notification?.status).toBe('read')
      expect(notification?.readAt).toBeDefined()
    })

    it('should handle non-existent notification', async () => {
      const nonExistentId = 'non-existent-id'

      await expect(
        notificationService.markAsRead(nonExistentId, testEnv.user.id)
      ).rejects.toThrow()
    })
  })

  describe('markAllAsRead', () => {
    beforeEach(async () => {
      // Create multiple unread notifications
      await testEnv.testDb.createTestNotification(testEnv.tenant.id, testEnv.user.id, {
        status: 'delivered',
      })
      await testEnv.testDb.createTestNotification(testEnv.tenant.id, testEnv.user.id, {
        status: 'delivered',
      })
      await testEnv.testDb.createTestNotification(testEnv.tenant.id, testEnv.user.id, {
        status: 'delivered',
      })
    })

    it('should mark all notifications as read', async () => {
      const count = await notificationService.markAllAsRead(testEnv.user.id)

      expect(count).toBe(3)

      const notifications = await notificationService.getNotificationsForUser(
        testEnv.user.id,
        { limit: 10 }
      )

      expect(notifications.every(n => n.status === 'read')).toBe(true)
    })
  })

  describe('getUnreadCount', () => {
    beforeEach(async () => {
      // Create mix of read and unread notifications
      await testEnv.testDb.createTestNotification(testEnv.tenant.id, testEnv.user.id, {
        status: 'delivered',
      })
      await testEnv.testDb.createTestNotification(testEnv.tenant.id, testEnv.user.id, {
        status: 'delivered',
      })
      await testEnv.testDb.createTestNotification(testEnv.tenant.id, testEnv.user.id, {
        status: 'read',
      })
    })

    it('should return correct unread count', async () => {
      const count = await notificationService.getUnreadCount(testEnv.user.id)

      expect(count).toBe(2)
    })
  })

  describe('sendDeadlineReminder', () => {
    it('should send deadline reminder notification', async () => {
      mockResend.emails = {
        send: jest.fn().mockResolvedValue({ id: 'email-id' }),
      } as any

      const reminderData = {
        recipientId: testEnv.user.id,
        taskName: 'Important Task',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high' as const,
        taskUrl: '/calendar/tasks/task-id',
        resourceId: 'task-id',
      }

      await notificationService.sendDeadlineReminder(reminderData)

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Deadline Reminder'),
          html: expect.stringContaining(reminderData.taskName),
        })
      )
    })
  })

  describe('createNotificationTemplate', () => {
    const templateData = {
      name: 'Test Template',
      description: 'Test template description',
      type: 'deadline_reminder' as const,
      channels: ['email', 'in_app'] as const,
      subject: 'Test Subject: {{taskName}}',
      body: 'Test body with {{taskName}} and {{dueDate}}',
      variables: ['taskName', 'dueDate'],
    }

    it('should create notification template', async () => {
      const templateId = await notificationService.createNotificationTemplate(
        templateData,
        testEnv.user.id
      )

      expect(templateId).toBeDefined()
      expect(typeof templateId).toBe('string')

      const template = await notificationService.getNotificationTemplate(templateId)
      expect(template).toMatchObject({
        name: templateData.name,
        type: templateData.type,
        subject: templateData.subject,
        body: templateData.body,
      })
    })

    it('should validate template variables', async () => {
      const invalidTemplate = {
        ...templateData,
        body: 'Body with {{invalidVariable}}',
        variables: ['taskName'], // Missing invalidVariable
      }

      await expect(
        notificationService.createNotificationTemplate(invalidTemplate, testEnv.user.id)
      ).rejects.toThrow()
    })
  })
})