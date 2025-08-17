# Testing Guide

This document provides comprehensive information about the testing setup and practices for the Compliance SaaS platform.

## Overview

Our testing strategy includes multiple layers:
- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test API endpoints and service interactions
- **E2E Tests**: Test complete user workflows in a browser environment

## Testing Stack

### Unit & Integration Tests
- **Jest**: JavaScript testing framework
- **Testing Library**: React component testing utilities
- **MSW**: Mock Service Worker for API mocking
- **ts-jest**: TypeScript support for Jest

### E2E Tests
- **Playwright**: Modern browser automation
- **Cross-browser testing**: Chrome, Firefox, Safari, Mobile
- **Visual regression testing**: Screenshot comparisons
- **Network interception**: Mock external APIs

## Quick Start

### Running Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all test suites
npm run test:all
```

### Using the Test Runner

```bash
# Run specific test suite
node scripts/test-runner.js unit
node scripts/test-runner.js e2e --ui
node scripts/test-runner.js coverage

# Run with options
node scripts/test-runner.js unit --watch
node scripts/test-runner.js e2e --debug
node scripts/test-runner.js unit --pattern "calendar"
```

## Test Structure

### Directory Layout

```
tests/
├── e2e/                    # End-to-end tests
│   ├── auth.spec.ts
│   ├── calendar.spec.ts
│   └── documents.spec.ts
├── integration/            # Integration tests
│   ├── api/
│   │   └── calendar.test.ts
│   └── frontend/
├── unit/                   # Unit tests
│   ├── components/
│   │   └── TaskModal.test.tsx
│   └── services/
│       ├── calendar.test.ts
│       ├── documents.test.ts
│       └── notifications.test.ts
├── utils/                  # Test utilities
│   ├── test-db.ts
│   └── test-helpers.tsx
└── fixtures/               # Test data
    └── test-document.pdf
```

## Writing Tests

### Unit Tests

#### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { renderWithProviders, createMockTask } from '@/tests/utils/test-helpers'
import { TaskModal } from '@/components/calendar/TaskModal'

describe('TaskModal', () => {
  it('should render create form', () => {
    renderWithProviders(
      <TaskModal open={true} onOpenChange={jest.fn()} mode="create" />
    )

    expect(screen.getByText('Create New Task')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
  })

  it('should create task with valid data', async () => {
    const mockCreateTask = jest.fn().mockResolvedValue('task-id')
    
    // Setup component with mocked hooks
    renderWithProviders(<TaskModal {...props} />)
    
    // Interact with component
    await userEvent.type(screen.getByLabelText(/title/i), 'New Task')
    await userEvent.click(screen.getByText('Create Task'))
    
    // Assert expectations
    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Task' })
    )
  })
})
```

#### Testing Services

```typescript
import { CalendarService } from '@/lib/core/calendar'
import { setupTestEnvironment } from '@/tests/utils/test-db'

describe('CalendarService', () => {
  let calendarService: CalendarService
  let testEnv: any

  beforeEach(async () => {
    testEnv = await setupTestEnvironment()
    calendarService = new CalendarService()
  })

  afterEach(async () => {
    await testEnv.cleanup()
  })

  it('should create task successfully', async () => {
    const taskData = {
      title: 'Test Task',
      startDate: new Date().toISOString(),
    }

    const taskId = await calendarService.createTask(taskData, testEnv.user.id)

    expect(taskId).toBeDefined()
    
    const createdTask = await calendarService.getById(taskId)
    expect(createdTask).toMatchObject(taskData)
  })
})
```

### Integration Tests

#### Testing API Endpoints

```typescript
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/v1/calendar/tasks/route'
import { setupTestEnvironment } from '@/tests/utils/test-db'

describe('/api/v1/calendar/tasks', () => {
  let testEnv: any

  beforeEach(async () => {
    testEnv = await setupTestEnvironment()
  })

  afterEach(async () => {
    await testEnv.cleanup()
  })

  it('should return all tasks', async () => {
    // Create test data
    await testEnv.testDb.createTestTask(testEnv.tenant.id, testEnv.user.id)

    // Make API request
    const request = new NextRequest('http://localhost:3000/api/v1/calendar/tasks')
    const response = await GET(request)
    const data = await response.json()

    // Assert response
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
  })
})
```

### E2E Tests

#### User Flow Testing

```typescript
import { test, expect } from '@playwright/test'

test.describe('Calendar Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // Navigate to calendar
    await page.goto('/calendar')
  })

  test('should create a new task', async ({ page }) => {
    // Click new task button
    await page.click('[data-testid="new-task-button"]')
    
    // Fill form
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Verify creation
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="calendar-event"]')).toContainText('Test Task')
  })
})
```

## Test Data Management

### Database Setup

```typescript
// tests/utils/test-db.ts
export class TestDatabase {
  async createTestTenant(overrides = {}) {
    const tenant = {
      name: 'Test Tenant',
      slug: `test-tenant-${Date.now()}`,
      ...overrides,
    }

    const { data } = await this.supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single()

    this.createdRecords.push({ table: 'tenants', id: data.id })
    return data
  }

  async cleanup() {
    // Clean up all created records
    for (const record of this.createdRecords.reverse()) {
      await this.supabase
        .from(record.table)
        .delete()
        .eq('id', record.id)
    }
  }
}
```

### Mock Data Helpers

```typescript
// tests/utils/test-helpers.tsx
export function createMockTask(overrides = {}) {
  return {
    id: 'test-task-id',
    title: 'Test Task',
    category: 'compliance_deadline',
    status: 'pending',
    priority: 'medium',
    startDate: new Date().toISOString(),
    ...overrides,
  }
}
```

## Configuration

### Jest Configuration

Key configurations in `jest.config.js`:
- **Multiple projects**: Separate client and server test environments
- **Coverage thresholds**: 70% minimum coverage
- **Module mapping**: Support for `@/` path aliases
- **Setup files**: Automatic mocking and test utilities

### Playwright Configuration

Key configurations in `playwright.config.ts`:
- **Cross-browser testing**: Chrome, Firefox, Safari, Mobile
- **Parallel execution**: Faster test runs
- **Screenshots/videos**: Capture on failure
- **Trace collection**: Debug test failures

## Best Practices

### General Testing

1. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
2. **Test Names**: Descriptive names that explain behavior
3. **Arrange-Act-Assert**: Clear test structure
4. **Test Data**: Use factories and builders for consistent test data
5. **Cleanup**: Always clean up test data and mocks

### Unit Testing

1. **Mock External Dependencies**: Mock APIs, databases, external services
2. **Test Behavior, Not Implementation**: Focus on what, not how
3. **Single Responsibility**: One assertion per test
4. **Edge Cases**: Test error conditions and boundary values

### Integration Testing

1. **Test Real Interactions**: Use actual database and services
2. **API Contract Testing**: Verify request/response formats
3. **Error Handling**: Test error scenarios and edge cases
4. **Authentication**: Test with different user roles and permissions

### E2E Testing

1. **User-Centric**: Test from user perspective
2. **Critical Paths**: Focus on core business workflows
3. **Test Data**: Use consistent, predictable test data
4. **Page Object Model**: Organize selectors and actions
5. **Parallel Execution**: Run tests independently

### Performance

1. **Test Speed**: Keep tests fast with minimal setup
2. **Selective Running**: Run only relevant tests during development
3. **Parallel Execution**: Use Jest and Playwright parallel features
4. **Test Data**: Use minimal data sets for faster execution

## CI/CD Integration

### GitHub Actions

Our CI pipeline runs:
1. **Lint & Type Check**: Code quality validation
2. **Unit Tests**: Fast feedback on code changes
3. **Integration Tests**: API and service validation
4. **E2E Tests**: Critical user flow validation
5. **Security Scan**: Dependency and vulnerability checks

### Coverage Reporting

- **Minimum Coverage**: 70% for branches, functions, lines, statements
- **Coverage Reports**: Generated in HTML and LCOV formats
- **Codecov Integration**: Track coverage trends over time

## Debugging Tests

### Unit Tests

```bash
# Debug specific test
npm run test -- --testNamePattern="should create task"

# Debug with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug in VS Code
# Use "Jest Debug" configuration
```

### E2E Tests

```bash
# Run with UI
npm run test:e2e:ui

# Debug specific test
npm run test:e2e:debug -- --grep "should create task"

# Run headed (visible browser)
npx playwright test --headed

# Debug with browser developer tools
npx playwright test --debug
```

## Common Issues

### Mocking

**Problem**: Mock not working in tests
**Solution**: Ensure mocks are defined before imports

```typescript
// ❌ Wrong
import { MyService } from './my-service'
jest.mock('./my-service')

// ✅ Correct
jest.mock('./my-service')
import { MyService } from './my-service'
```

### Async Testing

**Problem**: Tests failing due to timing issues
**Solution**: Use proper async/await and waitFor

```typescript
// ❌ Wrong
test('should update task', () => {
  updateTask(taskId, data)
  expect(mockFunction).toHaveBeenCalled()
})

// ✅ Correct
test('should update task', async () => {
  await updateTask(taskId, data)
  await waitFor(() => {
    expect(mockFunction).toHaveBeenCalled()
  })
})
```

### Test Isolation

**Problem**: Tests affecting each other
**Solution**: Proper cleanup and isolated test data

```typescript
describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await testDb.cleanup()
  })
})
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure good test coverage
3. Update this documentation if needed
4. Run all test suites before submitting PR