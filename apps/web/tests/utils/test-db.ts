import { createServiceClient } from '@/lib/supabase/service'

export class TestDatabase {
  private supabase = createServiceClient()
  private createdRecords: { table: string; id: string }[] = []

  async cleanup() {
    // Clean up in reverse order to handle foreign key constraints
    for (const record of this.createdRecords.reverse()) {
      try {
        await this.supabase
          .from(record.table)
          .delete()
          .eq('id', record.id)
      } catch (error) {
        console.warn(`Failed to cleanup ${record.table}:${record.id}`, error)
      }
    }
    this.createdRecords = []
  }

  async createTestTenant(overrides: Partial<any> = {}) {
    const tenant = {
      name: 'Test Tenant',
      slug: `test-tenant-${Date.now()}`,
      domain: `test-${Date.now()}.example.com`,
      settings: {},
      ...overrides,
    }

    const { data, error } = await this.supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single()

    if (error) throw error

    this.createdRecords.push({ table: 'tenants', id: data.id })
    return data
  }

  async createTestUser(overrides: Partial<any> = {}) {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      email_confirm: true,
      ...overrides,
    }

    const { data: authUser, error: authError } = await this.supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: userData.email_confirm,
    })

    if (authError) throw authError

    // Create profile
    const profile = {
      id: authUser.user.id,
      email: userData.email,
      full_name: userData.full_name || 'Test User',
      avatar_url: userData.avatar_url || null,
    }

    const { data: profileData, error: profileError } = await this.supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()

    if (profileError) throw profileError

    this.createdRecords.push({ table: 'profiles', id: authUser.user.id })
    return { authUser: authUser.user, profile: profileData }
  }

  async createTestUserTenant(userId: string, tenantId: string, role: string = 'member') {
    const userTenant = {
      user_id: userId,
      tenant_id: tenantId,
      role,
    }

    const { data, error } = await this.supabase
      .from('user_tenants')
      .insert(userTenant)
      .select()
      .single()

    if (error) throw error

    this.createdRecords.push({ table: 'user_tenants', id: data.id })
    return data
  }

  async createTestDocument(tenantId: string, userId: string, overrides: Partial<any> = {}) {
    const document = {
      tenant_id: tenantId,
      title: 'Test Document',
      description: 'Test document description',
      category: 'policy',
      status: 'draft',
      content: 'Test document content',
      created_by: userId,
      ...overrides,
    }

    const { data, error } = await this.supabase
      .from('documents')
      .insert(document)
      .select()
      .single()

    if (error) throw error

    this.createdRecords.push({ table: 'documents', id: data.id })
    return data
  }

  async createTestWorkflow(tenantId: string, userId: string, overrides: Partial<any> = {}) {
    const workflow = {
      tenant_id: tenantId,
      name: 'Test Workflow',
      description: 'Test workflow description',
      category: 'document_approval',
      steps: [
        {
          id: 'review',
          name: 'Review',
          type: 'approval',
          assignee_type: 'user',
          assignee_id: userId,
          required: true,
        },
      ],
      created_by: userId,
      ...overrides,
    }

    const { data, error } = await this.supabase
      .from('workflows')
      .insert(workflow)
      .select()
      .single()

    if (error) throw error

    this.createdRecords.push({ table: 'workflows', id: data.id })
    return data
  }

  async createTestTask(tenantId: string, userId: string, overrides: Partial<any> = {}) {
    const task = {
      tenant_id: tenantId,
      title: 'Test Task',
      description: 'Test task description',
      category: 'compliance_deadline',
      priority: 'medium',
      start_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      all_day: false,
      assigned_to: userId,
      created_by: userId,
      reminder_intervals: [1440, 60],
      tags: ['test'],
      metadata: {},
      ...overrides,
    }

    const { data, error } = await this.supabase
      .from('calendar_tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error

    this.createdRecords.push({ table: 'calendar_tasks', id: data.id })
    return data
  }

  async createTestNotification(tenantId: string, userId: string, overrides: Partial<any> = {}) {
    const notification = {
      tenant_id: tenantId,
      user_id: userId,
      type: 'deadline_reminder',
      title: 'Test Notification',
      message: 'Test notification message',
      priority: 'medium',
      channels: ['in_app'],
      status: 'pending',
      metadata: {},
      ...overrides,
    }

    const { data, error } = await this.supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw error

    this.createdRecords.push({ table: 'notifications', id: data.id })
    return data
  }

  async createTestReport(tenantId: string, userId: string, overrides: Partial<any> = {}) {
    const report = {
      tenant_id: tenantId,
      name: 'Test Report',
      description: 'Test report description',
      category: 'compliance',
      format: 'pdf',
      status: 'completed',
      file_path: '/test/report.pdf',
      file_size: 1024,
      generated_by: userId,
      ...overrides,
    }

    const { data, error } = await this.supabase
      .from('reports')
      .insert(report)
      .select()
      .single()

    if (error) throw error

    this.createdRecords.push({ table: 'reports', id: data.id })
    return data
  }
}

// Helper to create a clean test environment
export async function setupTestEnvironment() {
  const testDb = new TestDatabase()
  
  // Create test tenant
  const tenant = await testDb.createTestTenant()
  
  // Create test user
  const { authUser, profile } = await testDb.createTestUser()
  
  // Link user to tenant
  const userTenant = await testDb.createTestUserTenant(authUser.id, tenant.id, 'admin')

  return {
    testDb,
    tenant,
    user: authUser,
    profile,
    userTenant,
    cleanup: () => testDb.cleanup(),
  }
}