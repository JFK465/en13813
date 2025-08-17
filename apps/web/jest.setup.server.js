// Server-side test setup

// Mock environment variables for server tests
process.env.SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.CRON_SECRET = 'test-cron-secret'
process.env.NEXTAUTH_SECRET = 'test-secret'

// Mock Supabase client for server tests
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  })),
}))

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(() => ({
    from: jest.fn(),
    auth: {
      admin: {
        getUserById: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
      },
    },
    storage: {
      from: jest.fn(),
    },
    rpc: jest.fn(),
  })),
}))

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}))

// Increase timeout for server tests
jest.setTimeout(30000)