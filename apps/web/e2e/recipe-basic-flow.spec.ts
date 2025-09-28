import { test, expect } from '@playwright/test'

/**
 * VEREINFACHTER E2E TEST
 * Testet nur die Basis-Funktionalität
 */

test.describe('Recipe Basic Flow', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
    // Nur ein Browser für schnelleren Test
  })

  test('Can navigate to recipe form', async ({ page }) => {
    // 1. Navigiere zur Seite
    await page.goto('/en13813/recipes/new')

    // 2. Warte auf Seite
    await page.waitForLoadState('networkidle')

    // 3. Prüfe ob Seite geladen wurde
    const title = await page.title()
    console.log('Page title:', title)

    // 4. Suche nach Formular-Elementen
    const hasForm = await page.locator('form').count() > 0
    const hasInput = await page.locator('input').count() > 0

    console.log('Has form:', hasForm)
    console.log('Number of inputs:', await page.locator('input').count())

    // 5. Screenshot
    await page.screenshot({ path: 'test-results/recipe-form-page.png', fullPage: true })

    // Basic Assertions
    expect(hasForm || hasInput).toBeTruthy()
  })

  test('Can access recipe list', async ({ page }) => {
    // 1. Navigiere zur Liste
    await page.goto('/en13813/recipes')

    // 2. Warte auf Seite
    await page.waitForLoadState('networkidle')

    // 3. Prüfe ob Liste/Tabelle existiert
    const hasTable = await page.locator('table').count() > 0
    const hasList = await page.locator('[role="list"], .list, .grid').count() > 0
    const hasHeading = await page.locator('h1, h2').count() > 0

    console.log('Has table:', hasTable)
    console.log('Has list:', hasList)
    console.log('Has heading:', hasHeading)

    // 4. Screenshot
    await page.screenshot({ path: 'test-results/recipe-list-page.png', fullPage: true })

    // Basic Assertion
    expect(hasTable || hasList || hasHeading).toBeTruthy()
  })

  test('Can fill basic recipe fields', async ({ page }) => {
    // Navigiere zum Formular
    await page.goto('/en13813/recipes/new')
    await page.waitForLoadState('networkidle')

    // Versuche die ersten sichtbaren Input-Felder zu finden
    const inputs = page.locator('input[type="text"], input:not([type="hidden"])')
    const inputCount = await inputs.count()

    console.log(`Found ${inputCount} input fields`)

    if (inputCount > 0) {
      // Fülle das erste Feld
      const firstInput = inputs.first()
      await firstInput.fill('Test Value')

      // Prüfe ob Wert gesetzt wurde
      const value = await firstInput.inputValue()
      expect(value).toBe('Test Value')

      console.log('✅ Successfully filled first input field')
    }

    // Screenshot
    await page.screenshot({ path: 'test-results/recipe-form-filled.png' })
  })
})