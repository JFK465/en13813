import { test, expect } from '@playwright/test'

test.describe('Hybrid Recipe Draft System', () => {
  test.beforeEach(async ({ page }) => {
    // Go to new recipe page
    await page.goto('http://localhost:3001/en13813/recipes/new')
    await page.waitForLoadState('networkidle')
  })

  test('should save draft without timeout and redirect to recipes', async ({ page }) => {
    // Fill in minimal required fields
    await page.fill('input[name="recipe_code"]', 'E2E-TEST-' + Date.now())
    await page.fill('input[name="manufacturer"]', 'Test E2E GmbH')
    await page.fill('input[name="plant"]', 'Test Werk')

    // Select binder type
    await page.selectOption('select[name="binder_type"]', 'CT')

    // Select strength classes
    await page.selectOption('select[name="compressive_strength_class"]', 'C20')
    await page.selectOption('select[name="flexural_strength_class"]', 'F4')

    // Measure save time
    const startTime = Date.now()

    // Click save draft button
    await page.click('button:has-text("Entwurf speichern")')

    // Should not show "Speichert..." for more than 500ms
    const savingVisible = await page.locator('text=Speichert...').isVisible()
    if (savingVisible) {
      await expect(page.locator('text=Speichert...')).toBeHidden({ timeout: 500 })
    }

    const saveTime = Date.now() - startTime
    console.log(`Draft saved in ${saveTime}ms`)

    // Should redirect to recipes page
    await expect(page).toHaveURL(/\/en13813\/recipes$/, { timeout: 3000 })

    // Verify we're on the recipes page
    await expect(page.locator('h1:has-text("Rezepturen")')).toBeVisible()

    // Check that save was fast (should be under 1 second with hybrid approach)
    expect(saveTime).toBeLessThan(1000)
  })

  test('should show saved drafts on recipes page', async ({ page }) => {
    // Create a draft first
    const draftCode = 'DRAFT-' + Date.now()
    await page.fill('input[name="recipe_code"]', draftCode)
    await page.fill('input[name="manufacturer"]', 'Draft Test GmbH')
    await page.fill('input[name="plant"]', 'Werk 1')
    await page.selectOption('select[name="binder_type"]', 'CT')
    await page.selectOption('select[name="compressive_strength_class"]', 'C20')
    await page.selectOption('select[name="flexural_strength_class"]', 'F4')

    // Save draft
    await page.click('button:has-text("Entwurf speichern")')
    await page.waitForURL(/\/en13813\/recipes$/)

    // Check if draft appears in the list
    await expect(page.locator(`text=${draftCode}`)).toBeVisible({ timeout: 5000 })

    // Verify it's marked as a draft (should have some indicator)
    const draftCard = page.locator(`[data-recipe-code="${draftCode}"]`)
      .or(page.locator(`text=${draftCode}`).locator('..'))

    // Draft should be visible on the page
    await expect(draftCard).toBeVisible()
  })

  test('localStorage should persist draft even without auth', async ({ page, context }) => {
    // Clear any existing auth
    await context.clearCookies()

    // Go to new recipe page
    await page.goto('http://localhost:3001/en13813/recipes/new')

    // Fill form
    const testCode = 'LOCAL-TEST-' + Date.now()
    await page.fill('input[name="recipe_code"]', testCode)
    await page.fill('input[name="manufacturer"]', 'LocalStorage Test')
    await page.fill('input[name="plant"]', 'Test Plant')
    await page.selectOption('select[name="binder_type"]', 'CT')
    await page.selectOption('select[name="compressive_strength_class"]', 'C20')
    await page.selectOption('select[name="flexural_strength_class"]', 'F4')

    // Save draft
    await page.click('button:has-text("Entwurf speichern")')

    // Should still redirect successfully
    await expect(page).toHaveURL(/\/en13813\/recipes$/, { timeout: 3000 })

    // Check localStorage
    const localData = await page.evaluate(() => {
      const data = localStorage.getItem('en13813_recipe_drafts')
      return data ? JSON.parse(data) : null
    })

    expect(localData).toBeTruthy()
    expect(Array.isArray(localData)).toBe(true)

    const savedDraft = localData.find((d: any) => d.draft_data?.recipe_code === testCode)
    expect(savedDraft).toBeTruthy()
    expect(savedDraft.sync_status).toBe('local')
  })
})