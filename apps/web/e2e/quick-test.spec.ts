import { test, expect } from '@playwright/test'

test.describe('Quick EN13813 Tests', () => {
  test('Login and navigate to recipes page', async ({ page }) => {
    // Go to login
    await page.goto('/login')

    // Fill login form
    await page.fill('[name="email"]', 'geniusgoods465@gmail.com')
    await page.fill('[name="password"]', 'Jonas1312')

    // Submit
    await page.click('button[type="submit"]')

    // Wait for navigation (with extended timeout)
    await page.waitForURL('**/en13813', { timeout: 30000 })

    // Wait for any loading to finish
    await page.waitForTimeout(3000)

    // Try to navigate to recipes page directly
    await page.goto('/en13813/recipes')

    // Check if we're on the recipes page
    await expect(page.url()).toContain('/en13813/recipes')

    console.log('✅ Successfully navigated to recipes page')
  })

  test('Direct navigation to recipe form after login', async ({ page }) => {
    // Go to login
    await page.goto('/login')

    // Fill login form
    await page.fill('[name="email"]', 'geniusgoods465@gmail.com')
    await page.fill('[name="password"]', 'Jonas1312')

    // Submit
    await page.click('button[type="submit"]')

    // Wait briefly for auth to complete
    await page.waitForTimeout(2000)

    // Navigate directly to recipe form
    await page.goto('/en13813/recipes/new')

    // Wait for form to appear
    await page.waitForSelector('form', { timeout: 10000 })

    // Check for key form fields
    const recipeCodeField = await page.locator('[name="recipe_code"]')
    await expect(recipeCodeField).toBeVisible()

    console.log('✅ Recipe form is accessible and loaded')
  })
})