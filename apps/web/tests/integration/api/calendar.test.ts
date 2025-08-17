import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/v1/calendar/tasks/route'
import { setupTestEnvironment } from '@/tests/utils/test-db'
import { createMockApiResponse } from '@/tests/utils/test-helpers'

// Mock authentication
jest.mock('@/lib/auth/server', () => ({
  getServerSession: jest.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  })),
}))

describe('/api/v1/calendar/tasks', () => {
  let testEnv: any

  beforeEach(async () => {
    testEnv = await setupTestEnvironment()
  })

  afterEach(async () => {
    await testEnv.cleanup()
  })

  describe('GET /api/v1/calendar/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        title: 'Task 1',
        start_date: new Date().toISOString(),
        category: 'compliance_deadline',
        priority: 'high',
      })

      await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id, {
        title: 'Task 2',
        start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        category: 'audit_preparation',
        priority: 'medium',
      })
    })

    it('should return all tasks', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/calendar/tasks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data.map((t: any) => t.title)).toEqual(
        expect.arrayContaining(['Task 1', 'Task 2'])
      )
    })

    it('should filter tasks by category', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/calendar/tasks?category=compliance_deadline'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].category).toBe('compliance_deadline')
    })

    it('should filter tasks by date range', async () => {
      const startDate = new Date().toISOString()
      const endDate = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours

      const request = new NextRequest(
        `http://localhost:3000/api/v1/calendar/tasks?startDate=${startDate}&endDate=${endDate}`
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
      expect(data.data[0].title).toBe('Task 1')
    })

    it('should handle authentication failure', async () => {
      // Mock no session
      jest.mocked(require('@/lib/auth/server').getServerSession).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/v1/calendar/tasks')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/v1/calendar/tasks', () => {
    const taskData = {
      title: 'New Task',
      description: 'Test task description',
      category: 'compliance_deadline',
      priority: 'high',
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      allDay: false,
      complianceFramework: 'ISO 50001',
      regulatoryReference: '4.5.1',
      tags: ['test', 'compliance'],
    }

    it('should create task successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/calendar/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.id).toBeDefined()
      expect(data.data.title).toBe(taskData.title)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        ...taskData,
        title: '', // Missing required title
      }

      const request = new NextRequest('http://localhost:3000/api/v1/calendar/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('title')
    })

    it('should validate date formats', async () => {
      const invalidData = {
        ...taskData,
        startDate: 'invalid-date',
      }

      const request = new NextRequest('http://localhost:3000/api/v1/calendar/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should validate enum values', async () => {
      const invalidData = {
        ...taskData,
        priority: 'invalid-priority',
      }

      const request = new NextRequest('http://localhost:3000/api/v1/calendar/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('PUT /api/v1/calendar/tasks/[id]', () => {
    let taskId: string

    beforeEach(async () => {
      const task = await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id)
      taskId = task.id
    })

    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task Title',
        priority: 'urgent',
        status: 'in_progress',
      }

      const request = new NextRequest(`http://localhost:3000/api/v1/calendar/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await PUT(request, { params: { id: taskId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.title).toBe(updateData.title)
      expect(data.data.priority).toBe(updateData.priority)
      expect(data.data.status).toBe(updateData.status)
    })

    it('should handle non-existent task', async () => {
      const nonExistentId = 'non-existent-id'
      const updateData = { title: 'Updated Title' }

      const request = new NextRequest(
        `http://localhost:3000/api/v1/calendar/tasks/${nonExistentId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const response = await PUT(request, { params: { id: nonExistentId } })

      expect(response.status).toBe(404)
    })

    it('should validate update data', async () => {
      const invalidData = {
        priority: 'invalid-priority',
      }

      const request = new NextRequest(`http://localhost:3000/api/v1/calendar/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await PUT(request, { params: { id: taskId } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('DELETE /api/v1/calendar/tasks/[id]', () => {
    let taskId: string

    beforeEach(async () => {
      const task = await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id)
      taskId = task.id
    })

    it('should delete task successfully', async () => {
      const request = new NextRequest(`http://localhost:3000/api/v1/calendar/tasks/${taskId}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: taskId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle non-existent task', async () => {
      const nonExistentId = 'non-existent-id'

      const request = new NextRequest(
        `http://localhost:3000/api/v1/calendar/tasks/${nonExistentId}`,
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request, { params: { id: nonExistentId } })

      expect(response.status).toBe(404)
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array.from({ length: 101 }, () =>
        new NextRequest('http://localhost:3000/api/v1/calendar/tasks')
      )

      const responses = await Promise.all(requests.map(req => GET(req)))
      
      // At least one request should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/calendar/tasks', {
        method: 'POST',
        body: 'invalid-json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Create request that will cause database error
      const request = new NextRequest('http://localhost:3000/api/v1/calendar/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          startDate: new Date().toISOString(),
          // Invalid tenant reference that will cause foreign key error
          tenantId: 'invalid-tenant-id',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })
})