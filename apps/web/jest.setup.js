import '@testing-library/jest-dom'

// Mock fetch for tests since we're not making real API calls
global.fetch = jest.fn((url, options) => {
  // Parse the URL to determine the response
  const urlStr = typeof url === 'string' ? url : url.toString()

  // Default response
  let status = 200
  let responseData = {}
  let headers = new Map()

  // Mock different endpoints
  if (urlStr.includes('/api/en13813/recipes') && options?.method === 'POST') {
    // Parse body to check for validation errors
    const body = options.body ? JSON.parse(options.body) : {}

    // Check for CA pH validation
    if (body.binder_type === 'CA' && body.ph_value && body.ph_value < 7) {
      status = 400
      responseData = { error: 'pH value must be >= 7 for CA estrich' }
    }
    // Check for missing required fields
    else if (!body.binder_type || !body.compressive_strength_class) {
      status = 400
      responseData = { error: 'Missing required fields' }
    }
    else {
      status = 201 // Created
      responseData = {
        recipe: {
          id: 'test-recipe-id',
          recipe_code: body.recipe_code || 'TEST-CODE',
          manufacturer_name: body.manufacturer_name || 'Test Manufacturer',
          compressive_strength_class: body.compressive_strength_class || 'C25',
          flexural_strength_class: body.flexural_strength_class || 'F4',
          binder_type: body.binder_type || 'CT'
        }
      }
    }
  } else if (urlStr.includes('/export')) {
    // Export endpoints
    if (urlStr.includes('format=xlsx')) {
      headers.set('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    } else if (urlStr.includes('format=csv')) {
      headers.set('content-type', 'text/csv; charset=utf-8')
    } else if (urlStr.includes('format=pdf')) {
      headers.set('content-type', 'application/pdf')
    } else if (urlStr.includes('format=json')) {
      headers.set('content-type', 'application/json; charset=utf-8')
    }
  } else if (urlStr.includes('/api/en13813/recipes') && options?.method === 'GET') {
    responseData = { recipes: [], total: 0 }
  } else if (urlStr.includes('/api/en13813/batches') && options?.method === 'POST') {
    status = 201
    responseData = { batch: { id: 'test-batch-id' } }
  } else if (urlStr.includes('/api/en13813/dops') && options?.method === 'POST') {
    status = 201
    const body = options.body ? JSON.parse(options.body) : {}
    responseData = {
      dop: {
        id: 'test-dop-id',
        dop_number: body.dop_number || 'DoP-TEST-2024-001',
        qr_code_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        public_url: '/public/dop/test-dop-id'
      }
    }
  } else if (urlStr.includes('/api/en13813/fpc/control-plans') && options?.method === 'POST') {
    status = 201
    const body = options.body ? JSON.parse(options.body) : {}
    responseData = {
      plan: {
        id: 'test-plan-id',
        test_parameter: body.test_parameter || 'compressive_strength'
      }
    }
  } else if (urlStr.includes('/api/en13813/fpc/test-results') && options?.method === 'POST') {
    status = 201
    const body = options.body ? JSON.parse(options.body) : {}
    responseData = {
      result: {
        id: 'test-result-id',
        pass: body.pass !== undefined ? body.pass : true
      }
    }
  } else if (urlStr.includes('/api/en13813/itt/tests') && options?.method === 'POST') {
    status = 201
    const body = options.body ? JSON.parse(options.body) : {}
    responseData = {
      test: {
        id: 'test-itt-id',
        test_type: body.test_type || 'compressive_strength',
        compliant: body.compliant !== undefined ? body.compliant : true,
        compressive_strength_result: body.compressive_strength_result || 26.8,
        flexural_strength_result: body.flexural_strength_result || 4.5
      }
    }
  } else if (urlStr.includes('/api/en13813/itt/results') && options?.method === 'POST') {
    status = 201
    responseData = { result: { id: 'test-itt-result-id', passed: true } }
  } else if (urlStr.includes('/api/en13813/dops/generate') && options?.method === 'POST') {
    status = 200
    responseData = {
      dop: {
        id: 'test-dop-id',
        dop_number: 'DoP-2025-001',
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      }
    }
  } else if (urlStr.includes('/api/en13813/dops') && urlStr.includes('/pdf')) {
    status = 200
    headers.set('content-type', 'application/pdf')
    // Return a blob-like object for PDF
    return Promise.resolve({
      ok: true,
      status: 200,
      headers,
      blob: () => Promise.resolve(new Blob(['PDF content'], { type: 'application/pdf' })),
      json: () => Promise.resolve({ pdf: 'base64-pdf-data' }),
      text: () => Promise.resolve('PDF content')
    })
  } else if (urlStr.includes('/api/en13813/compliance/validate') && options?.method === 'POST') {
    status = 200
    responseData = { compliant: true, validation: { all_tests_passed: true } }
  } else if (urlStr.includes('/api/en13813/audit-trail')) {
    status = 200
    responseData = { events: [{ id: '1', action: 'created', timestamp: new Date().toISOString() }] }
  } else if (urlStr.includes('/api/en13813/recipes/import') && options?.method === 'POST') {
    status = 200
    responseData = { imported: 5, failed: 0, recipes: [] }
  }

  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(responseData),
    text: () => Promise.resolve(JSON.stringify(responseData)),
    blob: () => Promise.resolve(new Blob([JSON.stringify(responseData)], { type: 'application/json' })),
    headers,
  })
})

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})