import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the login page
    await page.goto('/auth/login')
  })

  test('should login with valid credentials', async ({ page }) => {
    // Fill in login form
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    
    // Submit form
    await page.click('[data-testid="login-button"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Should show user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    
    // Submit form
    await page.click('[data-testid="login-button"]')
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
    
    // Should stay on login page
    await expect(page).toHaveURL('/auth/login')
  })

  test('should validate email format', async ({ page }) => {
    // Fill in invalid email format
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', 'password123')
    
    // Submit form
    await page.click('[data-testid="login-button"]')
    
    // Should show validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format')
  })

  test('should require both email and password', async ({ page }) => {
    // Try to submit without filling fields
    await page.click('[data-testid="login-button"]')
    
    // Should show required field errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Open user menu and logout
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')
    
    // Should redirect to login page
    await expect(page).toHaveURL('/auth/login')
    
    // Should not be able to access protected pages
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/auth/login')
  })

  test('should remember me functionality', async ({ page }) => {
    // Enable remember me
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.check('[data-testid="remember-me"]')
    await page.click('[data-testid="login-button"]')
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Close browser and reopen (simulate browser restart)
    await page.context().close()
    const newContext = await page.context().browser()?.newContext()
    const newPage = await newContext?.newPage()
    
    if (newPage) {
      // Should still be logged in
      await newPage.goto('/dashboard')
      await expect(newPage).toHaveURL('/dashboard')
    }
  })

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected page while logged out
    await page.goto('/calendar')
    
    // Should redirect to login with return URL
    await expect(page).toHaveURL(/\/auth\/login\?.*returnUrl=.*calendar/)
    
    // Login
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // Should redirect to originally intended page
    await expect(page).toHaveURL('/calendar')
  })

  test('should handle password reset flow', async ({ page }) => {
    // Click forgot password link
    await page.click('[data-testid="forgot-password-link"]')
    
    // Should go to password reset page
    await expect(page).toHaveURL('/auth/reset-password')
    
    // Fill in email
    await page.fill('[data-testid="reset-email-input"]', 'admin@example.com')
    await page.click('[data-testid="reset-submit-button"]')
    
    // Should show success message
    await expect(page.locator('[data-testid="reset-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-success"]')).toContainText('Reset link sent')
  })

  test('should handle registration flow', async ({ page }) => {
    // Click register link
    await page.click('[data-testid="register-link"]')
    
    // Should go to registration page
    await expect(page).toHaveURL('/auth/register')
    
    // Fill in registration form
    await page.fill('[data-testid="register-email"]', 'newuser@example.com')
    await page.fill('[data-testid="register-password"]', 'newpassword123')
    await page.fill('[data-testid="register-confirm-password"]', 'newpassword123')
    await page.fill('[data-testid="register-full-name"]', 'New User')
    await page.fill('[data-testid="register-company"]', 'Test Company')
    
    // Submit registration
    await page.click('[data-testid="register-button"]')
    
    // Should show email verification message
    await expect(page.locator('[data-testid="verification-message"]')).toBeVisible()
  })

  test('should validate password strength', async ({ page }) => {
    await page.click('[data-testid="register-link"]')
    await expect(page).toHaveURL('/auth/register')
    
    // Test weak password
    await page.fill('[data-testid="register-password"]', '123')
    await page.fill('[data-testid="register-confirm-password"]', '123')
    
    // Should show password strength indicator
    await expect(page.locator('[data-testid="password-strength"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-strength"]')).toContainText('Weak')
    
    // Test strong password
    await page.fill('[data-testid="register-password"]', 'StrongPassword123!')
    await page.fill('[data-testid="register-confirm-password"]', 'StrongPassword123!')
    
    await expect(page.locator('[data-testid="password-strength"]')).toContainText('Strong')
  })
})