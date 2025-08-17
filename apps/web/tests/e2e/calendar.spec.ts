import { test, expect } from '@playwright/test'

test.describe('Calendar Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // Navigate to calendar
    await page.goto('/calendar')
    await expect(page).toHaveURL('/calendar')
  })

  test('should display calendar interface', async ({ page }) => {
    // Should show calendar view
    await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible()
    
    // Should show calendar navigation
    await expect(page.locator('[data-testid="calendar-toolbar"]')).toBeVisible()
    
    // Should show filters
    await expect(page.locator('[data-testid="calendar-filters"]')).toBeVisible()
    
    // Should show stats cards
    await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible()
  })

  test('should create a new task', async ({ page }) => {
    // Click new task button
    await page.click('[data-testid="new-task-button"]')
    
    // Should open task modal
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Fill in task details
    await page.fill('[data-testid="task-title"]', 'Test Compliance Task')
    await page.fill('[data-testid="task-description"]', 'This is a test compliance task')
    
    // Select category
    await page.click('[data-testid="task-category"]')
    await page.click('[data-testid="category-compliance_deadline"]')
    
    // Select priority
    await page.click('[data-testid="task-priority"]')
    await page.click('[data-testid="priority-high"]')
    
    // Set due date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    await page.fill('[data-testid="task-due-date"]', tomorrowStr)
    
    // Add compliance details
    await page.fill('[data-testid="task-framework"]', 'ISO 50001')
    await page.fill('[data-testid="task-reference"]', '4.5.1')
    
    // Add tags
    await page.fill('[data-testid="task-tags"]', 'energy, compliance, test')
    
    // Save task
    await page.click('[data-testid="save-task-button"]')
    
    // Should close modal
    await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible()
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Task should appear in calendar
    await expect(page.locator('[data-testid="calendar-event"]').first()).toContainText('Test Compliance Task')
  })

  test('should edit an existing task', async ({ page }) => {
    // First create a task
    await page.click('[data-testid="new-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Original Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Click on the task to view it
    await page.click('[data-testid="calendar-event"]')
    
    // Should open task modal in view mode
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="task-title-display"]')).toContainText('Original Task')
    
    // Click edit button
    await page.click('[data-testid="edit-task-button"]')
    
    // Should switch to edit mode
    await expect(page.locator('[data-testid="task-title"]')).toBeVisible()
    
    // Edit the task
    await page.fill('[data-testid="task-title"]', 'Updated Task Title')
    await page.fill('[data-testid="task-description"]', 'Updated description')
    
    // Update priority
    await page.click('[data-testid="task-priority"]')
    await page.click('[data-testid="priority-urgent"]')
    
    // Save changes
    await page.click('[data-testid="save-task-button"]')
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Updated task should appear in calendar
    await expect(page.locator('[data-testid="calendar-event"]').first()).toContainText('Updated Task Title')
  })

  test('should filter tasks by category', async ({ page }) => {
    // Create tasks with different categories
    const categories = [
      { name: 'Compliance Task', category: 'compliance_deadline' },
      { name: 'Audit Task', category: 'audit_preparation' },
      { name: 'Training Task', category: 'training_session' },
    ]
    
    for (const task of categories) {
      await page.click('[data-testid="new-task-button"]')
      await page.fill('[data-testid="task-title"]', task.name)
      await page.click('[data-testid="task-category"]')
      await page.click(`[data-testid="category-${task.category}"]`)
      await page.click('[data-testid="save-task-button"]')
      await page.waitForTimeout(500) // Wait for task to be created
    }
    
    // Filter by compliance deadline
    await page.click('[data-testid="category-filter"]')
    await page.click('[data-testid="filter-compliance_deadline"]')
    
    // Should only show compliance tasks
    await expect(page.locator('[data-testid="calendar-event"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="calendar-event"]')).toContainText('Compliance Task')
    
    // Reset filter
    await page.click('[data-testid="category-filter"]')
    await page.click('[data-testid="filter-all"]')
    
    // Should show all tasks again
    await expect(page.locator('[data-testid="calendar-event"]')).toHaveCount(3)
  })

  test('should switch between calendar views', async ({ page }) => {
    // Should start in month view
    await expect(page.locator('[data-testid="calendar-view"]')).toHaveClass(/month-view/)
    
    // Switch to week view
    await page.click('[data-testid="view-week"]')
    await expect(page.locator('[data-testid="calendar-view"]')).toHaveClass(/week-view/)
    
    // Switch to day view
    await page.click('[data-testid="view-day"]')
    await expect(page.locator('[data-testid="calendar-view"]')).toHaveClass(/day-view/)
    
    // Switch to agenda view
    await page.click('[data-testid="view-agenda"]')
    await expect(page.locator('[data-testid="calendar-view"]')).toHaveClass(/agenda-view/)
    
    // Switch back to month view
    await page.click('[data-testid="view-month"]')
    await expect(page.locator('[data-testid="calendar-view"]')).toHaveClass(/month-view/)
  })

  test('should navigate between months', async ({ page }) => {
    // Get current month display
    const currentMonth = await page.locator('[data-testid="calendar-month-display"]').textContent()
    
    // Click next month
    await page.click('[data-testid="calendar-next"]')
    
    // Should show different month
    const nextMonth = await page.locator('[data-testid="calendar-month-display"]').textContent()
    expect(nextMonth).not.toBe(currentMonth)
    
    // Click previous month
    await page.click('[data-testid="calendar-prev"]')
    
    // Should return to original month
    const returnedMonth = await page.locator('[data-testid="calendar-month-display"]').textContent()
    expect(returnedMonth).toBe(currentMonth)
    
    // Click today to return to current date
    await page.click('[data-testid="calendar-today"]')
    await expect(page.locator('[data-testid="calendar-month-display"]')).toContainText(
      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    )
  })

  test('should export calendar to iCal', async ({ page }) => {
    // Create a test task first
    await page.click('[data-testid="new-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Export Test Task')
    await page.click('[data-testid="save-task-button"]')
    
    // Start download listener
    const downloadPromise = page.waitForEvent('download')
    
    // Click export button
    await page.click('[data-testid="export-calendar-button"]')
    
    // Wait for download
    const download = await downloadPromise
    
    // Verify download
    expect(download.suggestedFilename()).toBe('compliance-calendar.ics')
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Calendar exported')
  })

  test('should show task statistics', async ({ page }) => {
    // Create tasks with different statuses
    const tasks = [
      { title: 'Pending Task', status: 'pending' },
      { title: 'In Progress Task', status: 'in_progress' },
      { title: 'Completed Task', status: 'completed' },
      { title: 'Overdue Task', status: 'overdue' },
    ]
    
    for (const task of tasks) {
      await page.click('[data-testid="new-task-button"]')
      await page.fill('[data-testid="task-title"]', task.title)
      if (task.status !== 'pending') {
        await page.click('[data-testid="task-status"]')
        await page.click(`[data-testid="status-${task.status}"]`)
      }
      await page.click('[data-testid="save-task-button"]')
      await page.waitForTimeout(500)
    }
    
    // Verify stats are displayed correctly
    await expect(page.locator('[data-testid="stat-total"]')).toContainText('4')
    await expect(page.locator('[data-testid="stat-pending"]')).toContainText('1')
    await expect(page.locator('[data-testid="stat-in-progress"]')).toContainText('1')
    await expect(page.locator('[data-testid="stat-completed"]')).toContainText('1')
    await expect(page.locator('[data-testid="stat-overdue"]')).toContainText('1')
  })

  test('should handle task deletion', async ({ page }) => {
    // Create a task
    await page.click('[data-testid="new-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Task to Delete')
    await page.click('[data-testid="save-task-button"]')
    
    // Click on task to open modal
    await page.click('[data-testid="calendar-event"]')
    
    // Click delete button
    await page.click('[data-testid="delete-task-button"]')
    
    // Should show confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible()
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]')
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Task should be removed from calendar
    await expect(page.locator('[data-testid="calendar-event"]')).not.toBeVisible()
  })

  test('should show assigned tasks only filter', async ({ page }) => {
    // Create tasks assigned to different users
    await page.click('[data-testid="new-task-button"]')
    await page.fill('[data-testid="task-title"]', 'My Task')
    // Leave assigned to current user (default)
    await page.click('[data-testid="save-task-button"]')
    
    await page.click('[data-testid="new-task-button"]')
    await page.fill('[data-testid="task-title"]', 'Other User Task')
    await page.fill('[data-testid="task-assigned-to"]', 'other-user@example.com')
    await page.click('[data-testid="save-task-button"]')
    
    // Enable "assigned to me" filter
    await page.check('[data-testid="assigned-to-me-filter"]')
    
    // Should only show tasks assigned to current user
    await expect(page.locator('[data-testid="calendar-event"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="calendar-event"]')).toContainText('My Task')
    
    // Disable filter
    await page.uncheck('[data-testid="assigned-to-me-filter"]')
    
    // Should show all tasks
    await expect(page.locator('[data-testid="calendar-event"]')).toHaveCount(2)
  })
})