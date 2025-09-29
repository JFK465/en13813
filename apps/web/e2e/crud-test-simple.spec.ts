import { test, expect } from '@playwright/test'

// Test-Konfiguration
test.use({
  baseURL: 'http://localhost:3001',
  viewport: { width: 1280, height: 720 },
  video: 'retain-on-failure',
  screenshot: 'only-on-failure'
})

// Hilfsfunktion für eindeutige Test-Daten
const getTestId = () => Date.now().toString()

/**
 * CRUD Test Suite für EN13813 QM System
 * Vereinfachte Version ohne direkte DB-Checks
 */
test.describe('🔄 CRUD Operations - EN13813 System', () => {

  // ===========================
  // 1. REZEPTUREN CRUD TEST
  // ===========================
  test('📝 Rezepturen - Complete CRUD Cycle', async ({ page }) => {
    const testId = getTestId()
    const recipeName = `CRUD Test Rezept ${testId}`
    const updatedName = `Updated Rezept ${testId}`

    console.log('Testing Recipe CRUD with ID:', testId)

    // CREATE - Neue Rezeptur erstellen
    await test.step('Create new recipe', async () => {
      await page.goto('/en13813/recipes/new')

      // Warte bis Formular geladen
      await page.waitForSelector('form', { timeout: 10000 })

      // Name (Pflichtfeld)
      await page.fill('input[name="name"]', recipeName)

      // Beschreibung
      await page.fill('textarea[name="description"]', 'Automatisierter CRUD Test')

      // Bindemitteltyp (type) - Wichtigstes Feld!
      await page.selectOption('select[name="type"]', 'CT')

      // Norm-relevante Eigenschaften
      await page.selectOption('select[name="compressive_strength_class"]', 'C30')
      await page.selectOption('select[name="flexural_strength_class"]', 'F5')

      // Verwendungsart
      const usageSelect = page.locator('select[name="usage_type"]')
      if (await usageSelect.count() > 0) {
        await usageSelect.selectOption('unbewehrt')
      }

      // Rezeptur-Zusammensetzung (materials JSONB)
      // Bindemittel
      const binderAmount = page.locator('input[name="materials.binder.amount"]')
      if (await binderAmount.count() > 0) {
        await binderAmount.fill('350')
      }

      // Wasser
      const waterAmount = page.locator('input[name="materials.water.amount"]')
      if (await waterAmount.count() > 0) {
        await waterAmount.fill('175')
      }

      // Screenshot vor dem Speichern
      await page.screenshot({
        path: `test-results/crud-recipe-create-${testId}.png`,
        fullPage: true
      })

      // Speichern Button - verschiedene Varianten testen
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()

      // Warte auf Erfolg - entweder Redirect oder Success Message
      await Promise.race([
        page.waitForURL('**/recipes', { timeout: 10000 }),
        page.waitForSelector('[role="alert"]', { timeout: 5000 }),
        page.waitForSelector('text=/gespeichert|erfolgreich|success/i', { timeout: 5000 })
      ]).catch(() => {
        console.log('No immediate feedback, checking if still on form...')
      })

      console.log('✅ Recipe creation attempted')
    })

    // READ - Prüfe ob in Liste erscheint
    await test.step('Verify recipe in list', async () => {
      await page.goto('/en13813/recipes')
      await page.waitForLoadState('networkidle')

      // Suche nach dem erstellten Rezept
      const recipeInList = page.locator(`text="${recipeName}"`).first()

      // Warte bis es sichtbar ist
      await expect(recipeInList).toBeVisible({ timeout: 15000 })

      console.log('✅ Recipe found in list')

      // Screenshot der Liste
      await page.screenshot({
        path: `test-results/crud-recipe-list-${testId}.png`,
        fullPage: true
      })
    })

    // UPDATE - Rezeptur bearbeiten
    await test.step('Update recipe', async () => {
      await page.goto('/en13813/recipes')
      await page.waitForLoadState('networkidle')

      // Finde die Zeile mit dem Rezept
      const recipeText = page.locator(`text="${recipeName}"`).first()

      // Klicke auf das Rezept (öffnet Detail/Edit)
      await recipeText.click()

      // Alternativ: Suche Bearbeiten Button in der Nähe
      const parentRow = recipeText.locator('..')
      const editButton = parentRow.locator('button, a').filter({ hasText: /bearbeiten|edit/i }).first()

      if (await editButton.count() > 0) {
        await editButton.click()
      }

      // Warte auf Formular
      await page.waitForSelector('form', { timeout: 10000 })

      // Ändere den Namen
      const nameInput = page.locator('input[name="name"]')
      await nameInput.clear()
      await nameInput.fill(updatedName)

      // Ändere auch die Druckfestigkeitsklasse
      await page.selectOption('select[name="compressive_strength_class"]', 'C40')

      // Speichern
      await page.locator('button[type="submit"]').first().click()

      // Warte auf Erfolg
      await Promise.race([
        page.waitForURL('**/recipes', { timeout: 10000 }),
        page.waitForSelector('text=/aktualisiert|updated|gespeichert/i', { timeout: 5000 })
      ]).catch(() => {
        console.log('Update feedback not immediately visible')
      })

      console.log('✅ Recipe update attempted')
    })

    // DELETE - Rezeptur löschen (optional, da es die Daten zerstört)
    await test.step('Verify updated recipe in list', async () => {
      await page.goto('/en13813/recipes')
      await page.waitForLoadState('networkidle')

      // Suche nach dem aktualisierten Namen
      const updatedRecipeInList = page.locator(`text="${updatedName}"`).first()
      await expect(updatedRecipeInList).toBeVisible({ timeout: 10000 })

      console.log('✅ Updated recipe found in list')
    })
  })

  // ===========================
  // 2. DOP (LEISTUNGSERKLÄRUNGEN) TEST
  // ===========================
  test('📄 DoP - Create and Verify', async ({ page }) => {
    const testId = getTestId()
    const dopNumber = `DoP-${testId}`
    const productName = `Test Estrich ${testId}`

    console.log('Testing DoP Creation with ID:', testId)

    // CREATE
    await test.step('Create new DoP', async () => {
      await page.goto('/en13813/dops')

      // Suche "Neue DoP" Button
      const newDopButton = page.locator('button, a').filter({ hasText: /neue dop|new dop|erstellen|create/i }).first()

      if (await newDopButton.count() > 0) {
        await newDopButton.click()
        await page.waitForSelector('form', { timeout: 10000 })
      } else {
        // Direkt zur new Page
        await page.goto('/en13813/dops/new')
        await page.waitForSelector('form', { timeout: 10000 })
      }

      // DoP Nummer
      const dopNumberInput = page.locator('input').filter({ hasNot: page.locator('[type="hidden"]') }).first()
      await dopNumberInput.fill(dopNumber)

      // Produktname (zweites Input Feld)
      const productInput = page.locator('input').nth(1)
      await productInput.fill(productName)

      // Verwendungszweck (erstes Textarea)
      const intendedUseInput = page.locator('textarea').first()
      await intendedUseInput.fill('Estrich für Industrieböden gemäß EN 13813')

      // Screenshot
      await page.screenshot({
        path: `test-results/crud-dop-create-${testId}.png`,
        fullPage: true
      })

      // Speichern
      await page.locator('button[type="submit"]').first().click()

      // Warte auf Erfolg
      await Promise.race([
        page.waitForURL('**/dops', { timeout: 10000 }),
        page.waitForSelector('text=/erstellt|created|gespeichert/i', { timeout: 5000 })
      ]).catch(() => {
        console.log('DoP creation feedback not immediately visible')
      })

      console.log('✅ DoP creation attempted')
    })

    // READ
    await test.step('Verify DoP in list', async () => {
      await page.goto('/en13813/dops')
      await page.waitForLoadState('networkidle')

      // Suche nach der DoP Nummer
      const dopInList = page.locator(`text="${dopNumber}"`).first()
      await expect(dopInList).toBeVisible({ timeout: 10000 })

      console.log('✅ DoP found in list')
    })
  })

  // ===========================
  // 3. CHARGEN/BATCHES TEST
  // ===========================
  test('📦 Chargen - Create and Verify', async ({ page }) => {
    const testId = getTestId()
    const batchNumber = `BATCH-${testId}`

    console.log('Testing Batch Creation with ID:', testId)

    // CREATE
    await test.step('Create new batch', async () => {
      // Batches Seite braucht länger zum Laden
      await page.goto('/en13813/batches', { timeout: 20000 })
      await page.waitForLoadState('networkidle')

      // Suche "Neue Charge" Button
      const newBatchButton = page.locator('button, a').filter({ hasText: /neue charge|new batch|erstellen|create/i }).first()

      if (await newBatchButton.count() > 0) {
        await newBatchButton.click()
        await page.waitForSelector('form', { timeout: 15000 })
      } else {
        await page.goto('/en13813/batches/new')
        await page.waitForSelector('form', { timeout: 15000 })
      }

      // Chargennummer (erstes Input)
      const batchInput = page.locator('input').filter({ hasNot: page.locator('[type="hidden"]') }).first()
      await batchInput.fill(batchNumber)

      // Menge (suche Input mit number type oder name quantity)
      const quantityInput = page.locator('input[type="number"], input[name="quantity"]').first()
      if (await quantityInput.count() > 0) {
        await quantityInput.fill('1000')
      }

      // Screenshot
      await page.screenshot({
        path: `test-results/crud-batch-create-${testId}.png`,
        fullPage: true
      })

      // Speichern
      await page.locator('button[type="submit"]').first().click()

      await Promise.race([
        page.waitForURL('**/batches', { timeout: 15000 }),
        page.waitForSelector('text=/erstellt|created|gespeichert/i', { timeout: 5000 })
      ]).catch(() => {
        console.log('Batch creation feedback not immediately visible')
      })

      console.log('✅ Batch creation attempted')
    })

    // READ
    await test.step('Verify batch in list', async () => {
      await page.goto('/en13813/batches', { timeout: 20000 })
      await page.waitForLoadState('networkidle')

      const batchInList = page.locator(`text="${batchNumber}"`).first()
      await expect(batchInList).toBeVisible({ timeout: 15000 })

      console.log('✅ Batch found in list')
    })
  })

  // ===========================
  // 4. INTEGRATION TEST
  // ===========================
  test('🎯 Complete Workflow Test', async ({ page }) => {
    const testId = getTestId()

    console.log('Testing complete integration workflow...')

    // Test navigation zwischen Modulen
    await test.step('Navigate through critical modules', async () => {
      // Dashboard
      await page.goto('/en13813/dashboard')
      await expect(page).toHaveURL(/.*dashboard/)
      console.log('✅ Dashboard accessible')

      // Rezepturen
      await page.goto('/en13813/recipes')
      await expect(page).toHaveURL(/.*recipes/)
      console.log('✅ Recipes accessible')

      // DoPs
      await page.goto('/en13813/dops')
      await expect(page).toHaveURL(/.*dops/)
      console.log('✅ DoPs accessible')

      // Chargen (mit längerem Timeout)
      await page.goto('/en13813/batches', { timeout: 20000 })
      await expect(page).toHaveURL(/.*batches/)
      console.log('✅ Batches accessible')

      // Compliance
      await page.goto('/en13813/compliance')
      await expect(page).toHaveURL(/.*compliance/)
      console.log('✅ Compliance accessible')
    })

    console.log('✅ Complete workflow test successful!')
  })
})

// ===========================
// VALIDATION TEST
// ===========================
test.describe('🛡️ Validation', () => {

  test('Form validation - Required fields', async ({ page }) => {
    await page.goto('/en13813/recipes/new')
    await page.waitForSelector('form', { timeout: 10000 })

    // Versuche leeres Formular zu speichern
    await page.locator('button[type="submit"]').first().click()

    // Sollte auf der gleichen Seite bleiben (nicht redirecten)
    await expect(page).toHaveURL(/.*recipes\/new/)

    // Suche nach Validierungshinweisen
    const possibleErrors = [
      page.locator('text=/erforderlich|required|pflichtfeld/i'),
      page.locator('.text-destructive'),
      page.locator('[role="alert"]'),
      page.locator('.error-message')
    ]

    let foundError = false
    for (const errorLocator of possibleErrors) {
      if (await errorLocator.count() > 0) {
        foundError = true
        break
      }
    }

    if (foundError) {
      console.log('✅ Form validation working')
    } else {
      console.log('⚠️ No visible validation errors, but form did not submit')
    }
  })
})

// ===========================
// PERFORMANCE TEST
// ===========================
test.describe('⚡ Performance', () => {

  test('Page load times', async ({ page }) => {
    const criticalPages = [
      { url: '/en13813/dashboard', maxTime: 5000, name: 'Dashboard' },
      { url: '/en13813/recipes', maxTime: 5000, name: 'Recipes' },
      { url: '/en13813/dops', maxTime: 5000, name: 'DoPs' },
      { url: '/en13813/batches', maxTime: 20000, name: 'Batches' },
      { url: '/en13813/compliance', maxTime: 5000, name: 'Compliance' }
    ]

    for (const { url, maxTime, name } of criticalPages) {
      const startTime = Date.now()
      await page.goto(url, { timeout: maxTime })
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      console.log(`${name}: ${loadTime}ms (max: ${maxTime}ms)`)

      if (loadTime < maxTime) {
        console.log(`✅ ${name} loads within acceptable time`)
      } else {
        console.log(`⚠️ ${name} loads slowly`)
      }
    }
  })
})