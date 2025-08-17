import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & {
    queryClient?: QueryClient
  }
) {
  const queryClient = options?.queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  }
}

// Mock user context
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

// Mock profile context
export function createMockProfile(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: null,
    tenant_id: 'test-tenant-id',
    ...overrides,
  }
}

// Mock tenant context
export function createMockTenant(overrides = {}) {
  return {
    id: 'test-tenant-id',
    name: 'Test Tenant',
    slug: 'test-tenant',
    domain: 'test.example.com',
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

// Mock calendar task
export function createMockTask(overrides = {}) {
  return {
    id: 'test-task-id',
    title: 'Test Task',
    description: 'Test task description',
    category: 'compliance_deadline' as const,
    status: 'pending' as const,
    priority: 'medium' as const,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    allDay: false,
    location: '',
    assignedTo: 'test-user-id',
    assignedBy: 'test-user-id',
    resourceType: '',
    resourceId: '',
    complianceFramework: 'ISO 50001',
    regulatoryReference: '4.5.1',
    recurrencePattern: 'none' as const,
    recurrenceConfig: {},
    parentTaskId: '',
    reminderIntervals: [1440, 60],
    tags: ['test'],
    metadata: {},
    ...overrides,
  }
}

// Mock document
export function createMockDocument(overrides = {}) {
  return {
    id: 'test-document-id',
    title: 'Test Document',
    description: 'Test document description',
    category: 'policy' as const,
    status: 'draft' as const,
    content: 'Test document content',
    version: 1,
    filePath: '/test/document.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    tags: ['test'],
    metadata: {},
    createdBy: 'test-user-id',
    tenantId: 'test-tenant-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

// Mock notification
export function createMockNotification(overrides = {}) {
  return {
    id: 'test-notification-id',
    type: 'deadline_reminder' as const,
    title: 'Test Notification',
    message: 'Test notification message',
    priority: 'medium' as const,
    channels: ['in_app'] as const,
    status: 'pending' as const,
    recipientId: 'test-user-id',
    tenantId: 'test-tenant-id',
    resourceType: 'task',
    resourceId: 'test-task-id',
    metadata: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// Mock workflow
export function createMockWorkflow(overrides = {}) {
  return {
    id: 'test-workflow-id',
    name: 'Test Workflow',
    description: 'Test workflow description',
    category: 'document_approval' as const,
    steps: [
      {
        id: 'review',
        name: 'Review',
        type: 'approval',
        assigneeType: 'user',
        assigneeId: 'test-user-id',
        required: true,
      },
    ],
    status: 'active' as const,
    tenantId: 'test-tenant-id',
    createdBy: 'test-user-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

// Mock API response
export function createMockApiResponse<T>(data: T, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  } as Response
}

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock file for testing file uploads
export function createMockFile(name = 'test.pdf', type = 'application/pdf') {
  return new File(['test content'], name, { type })
}

// Mock form data
export function createMockFormData(data: Record<string, any>) {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}