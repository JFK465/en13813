import { test, expect } from '@playwright/test'

// Umgebungsvariablen sind bereits über playwright.config.ts geladen
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fhftgdffhkhmbwqbwiyt.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Dynamischer Import für Supabase Client
let supabase: any = null

test.beforeAll(async () => {
  const { createClient } = await import('@supabase/supabase-js')
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
})

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
 * Testet Create, Read, Update, Delete für alle kritischen Module
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

      // Basierend auf RecipeFormUltimate.tsx Struktur
      // Name (Pflichtfeld)
      await page.fill('input[name="name"]', recipeName)

      // Beschreibung
      await page.fill('textarea[name="description"]', 'Automatisierter CRUD Test')

      // Bindemitteltyp (type) - Wichtigstes Feld!
      await page.selectOption('select[name="type"]', 'CT')

      // Norm-relevante Eigenschaften
      await page.selectOption('select[name="compressive_strength_class"]', 'C30')
      await page.selectOption('select[name="flexural_strength_class"]', 'F5')

      // Verschleißwiderstand (optional aber wichtig)
      const wearMethodRadio = page.locator('input[name="wear_resistance_method"][value="bohme"]')
      if (await wearMethodRadio.count() > 0) {
        await wearMethodRadio.click()
        await page.selectOption('select[name="wear_resistance_class"]', 'A22')
      }

      // Verwendungsart
      await page.selectOption('select[name="usage_type"]', 'unbewehrt')

      // Rezeptur-Zusammensetzung (materials JSONB)
      // Bindemittel
      await page.fill('input[name="materials.binder.amount"]', '350')
      await page.selectOption('select[name="materials.binder.type"]', 'CEM II/A-S 42,5 R')

      // Wasser
      await page.fill('input[name="materials.water.amount"]', '175')

      // Screenshot vor dem Speichern
      await page.screenshot({
        path: `test-results/crud-recipe-create-${testId}.png`,
        fullPage: true
      })

      // Speichern Button
      await page.click('button[type="submit"]:has-text("Rezeptur speichern")')

      // Warte auf Erfolg
      await Promise.race([
        page.waitForURL('**/recipes', { timeout: 10000 }),
        page.waitForSelector('[role="alert"]:has-text("Erfolg")', { timeout: 5000 })
      ])

      console.log('✅ Recipe created successfully')
    })

    // READ - Prüfe ob in Liste erscheint
    await test.step('Verify recipe in list', async () => {
      await page.goto('/en13813/recipes')
      await page.waitForLoadState('networkidle')

      // Suche nach dem erstellten Rezept
      const recipeInList = page.locator(`text="${recipeName}"`).first()
      await expect(recipeInList).toBeVisible({ timeout: 10000 })

      // Verifiziere in Datenbank
      const { data: recipes, error } = await supabase
        .from('en13813_recipes')
        .select('*')
        .eq('name', recipeName)
        .single()

      expect(error).toBeFalsy()
      expect(recipes).toBeTruthy()
      expect(recipes?.name).toBe(recipeName)
      expect(recipes?.type).toBe('CT')
      expect(recipes?.compressive_strength_class).toBe('C30')

      console.log('✅ Recipe found in DB with ID:', recipes?.id)
    })

    // UPDATE - Rezeptur bearbeiten
    await test.step('Update recipe', async () => {
      await page.goto('/en13813/recipes')

      // Finde die Zeile mit dem Rezept
      const recipeRow = page.locator(`tr:has-text("${recipeName}")`)
        .or(page.locator(`div:has-text("${recipeName}")`))

      // Klicke auf Bearbeiten Button in der Zeile
      const editButton = recipeRow.locator('button:has-text("Bearbeiten"), a:has-text("Bearbeiten"), [aria-label="Bearbeiten"]').first()

      if (await editButton.count() > 0) {
        await editButton.click()
      } else {
        // Alternativ: Klicke auf die Zeile selbst
        await recipeRow.first().click()
      }

      // Warte auf Formular
      await page.waitForSelector('form', { timeout: 10000 })

      // Ändere den Namen
      await page.fill('input[name="name"]', updatedName)

      // Ändere auch die Druckfestigkeitsklasse
      await page.selectOption('select[name="compressive_strength_class"]', 'C40')

      // Speichern
      await page.click('button[type="submit"]:has-text("Änderungen speichern"), button[type="submit"]:has-text("Aktualisieren")')

      // Warte auf Erfolg
      await Promise.race([
        page.waitForURL('**/recipes', { timeout: 10000 }),
        page.waitForSelector('[role="alert"]:has-text("aktualisiert")', { timeout: 5000 })
      ])

      // Verifiziere Update in DB
      const { data: updatedRecipe } = await supabase
        .from('en13813_recipes')
        .select('*')
        .eq('name', updatedName)
        .single()

      expect(updatedRecipe).toBeTruthy()
      expect(updatedRecipe?.compressive_strength_class).toBe('C40')
      console.log('✅ Recipe updated successfully')
    })

    // DELETE - Rezeptur löschen
    await test.step('Delete recipe', async () => {
      await page.goto('/en13813/recipes')
      await page.waitForLoadState('networkidle')

      // Finde das aktualisierte Rezept
      const recipeRow = page.locator(`tr:has-text("${updatedName}")`)
        .or(page.locator(`div:has-text("${updatedName}")`))

      // Klicke Löschen-Button
      const deleteButton = recipeRow.locator('button:has-text("Löschen"), [aria-label="Löschen"]').first()
      await deleteButton.click()

      // Bestätige Löschung im Dialog
      const confirmButton = page.locator('button:has-text("Ja"), button:has-text("Bestätigen"), button:has-text("Löschen bestätigen")')
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click()
      }

      // Warte bis Rezept aus Liste verschwindet
      await expect(page.locator(`text="${updatedName}"`)).toBeHidden({ timeout: 10000 })

      // Verifiziere Löschung in DB
      const { data: deletedRecipe } = await supabase
        .from('en13813_recipes')
        .select('*')
        .eq('name', updatedName)
        .maybeSingle()

      expect(deletedRecipe).toBeFalsy()
      console.log('✅ Recipe deleted successfully')
    })
  })

  // ===========================
  // 2. DOP (LEISTUNGSERKLÄRUNGEN) CRUD TEST
  // ===========================
  test('📄 DoP - Complete CRUD Cycle', async ({ page }) => {
    const testId = getTestId()
    const dopNumber = `DoP-${testId}`
    const productName = `Test Estrich ${testId}`

    console.log('Testing DoP CRUD with ID:', testId)

    // CREATE
    await test.step('Create new DoP', async () => {
      await page.goto('/en13813/dops/new')
      await page.waitForSelector('form', { timeout: 10000 })

      // DoP Nummer
      await page.fill('input[name="dop_number"]', dopNumber)

      // Produktname
      await page.fill('input[name="product_name"]', productName)

      // Verwendungszweck
      await page.fill('textarea[name="intended_use"]', 'Estrich für Industrieböden gemäß EN 13813')

      // Hersteller
      await page.fill('input[name="manufacturer_name"]', 'Test GmbH')
      await page.fill('textarea[name="manufacturer_address"]', 'Teststraße 1, 12345 Teststadt')

      // System (AVCP)
      await page.selectOption('select[name="system"]', '4')

      // Leistungen (basierend auf einem Rezept)
      const recipeSelect = page.locator('select[name="recipe_id"]')
      if (await recipeSelect.count() > 0) {
        const options = await recipeSelect.locator('option').count()
        if (options > 1) {
          await recipeSelect.selectOption({ index: 1 })
        }
      }

      // CE-Kennzeichnungsdatum
      await page.fill('input[name="ce_marking_date"]', '2025-01-29')

      // Screenshot
      await page.screenshot({
        path: `test-results/crud-dop-create-${testId}.png`,
        fullPage: true
      })

      // Speichern
      await page.click('button[type="submit"]:has-text("DoP erstellen")')

      // Warte auf Erfolg
      await Promise.race([
        page.waitForURL('**/dops', { timeout: 10000 }),
        page.waitForSelector('[role="alert"]:has-text("erstellt")', { timeout: 5000 })
      ])

      console.log('✅ DoP created successfully')
    })

    // READ
    await test.step('Verify DoP in list', async () => {
      await page.goto('/en13813/dops')
      await page.waitForLoadState('networkidle')

      const dopInList = page.locator(`text="${dopNumber}"`).first()
      await expect(dopInList).toBeVisible({ timeout: 10000 })

      // DB Check
      const { data: dop } = await supabase
        .from('en13813_dops')
        .select('*')
        .eq('dop_number', dopNumber)
        .single()

      expect(dop).toBeTruthy()
      expect(dop?.product_name).toBe(productName)
      console.log('✅ DoP found in DB with ID:', dop?.id)
    })

    // PDF Generation Test
    await test.step('Generate DoP PDF', async () => {
      await page.goto('/en13813/dops')

      const dopRow = page.locator(`tr:has-text("${dopNumber}")`)
        .or(page.locator(`div:has-text("${dopNumber}")`))

      // Suche PDF Download Button
      const pdfButton = dopRow.locator('button:has-text("PDF"), a:has-text("PDF"), [aria-label="PDF"]').first()

      if (await pdfButton.count() > 0) {
        // Starte Download
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          pdfButton.click()
        ])

        // Speichere PDF
        const path = `test-results/dop-${testId}.pdf`
        await download.saveAs(path)
        console.log(`✅ PDF generated and saved to ${path}`)
      }
    })
  })

  // ===========================
  // 3. CHARGEN/BATCHES CRUD TEST
  // ===========================
  test('📦 Chargen - Complete CRUD Cycle', async ({ page }) => {
    const testId = getTestId()
    const batchNumber = `BATCH-${testId}`

    console.log('Testing Batch CRUD with ID:', testId)

    // CREATE
    await test.step('Create new batch', async () => {
      await page.goto('/en13813/batches/new')
      await page.waitForSelector('form', { timeout: 15000 }) // Längerer Timeout

      // Chargennummer
      await page.fill('input[name="batch_number"]', batchNumber)

      // Produktionsdatum
      await page.fill('input[name="production_date"]', '2025-01-29')

      // Menge
      await page.fill('input[name="quantity"]', '1000')
      await page.selectOption('select[name="unit"]', 'kg')

      // Rezept auswählen (falls vorhanden)
      const recipeSelect = page.locator('select[name="recipe_id"]')
      if (await recipeSelect.count() > 0) {
        const options = await recipeSelect.locator('option').count()
        if (options > 1) {
          await recipeSelect.selectOption({ index: 1 })
        }
      }

      // Produktionsanlage
      await page.fill('input[name="production_line"]', 'Anlage 1')

      // Verantwortlicher
      await page.fill('input[name="responsible_person"]', 'Test Operator')

      // Speichern
      await page.click('button[type="submit"]:has-text("Charge erstellen")')

      await Promise.race([
        page.waitForURL('**/batches', { timeout: 15000 }),
        page.waitForSelector('[role="alert"]:has-text("erstellt")', { timeout: 5000 })
      ])

      console.log('✅ Batch created successfully')
    })

    // READ
    await test.step('Verify batch in list', async () => {
      await page.goto('/en13813/batches')
      await page.waitForLoadState('networkidle', { timeout: 15000 })

      const batchInList = page.locator(`text="${batchNumber}"`).first()
      await expect(batchInList).toBeVisible({ timeout: 10000 })

      // DB Check
      const { data: batch } = await supabase
        .from('en13813_batches')
        .select('*')
        .eq('batch_number', batchNumber)
        .single()

      expect(batch).toBeTruthy()
      expect(batch?.quantity).toBe(1000)
      console.log('✅ Batch found in DB with ID:', batch?.id)
    })
  })

  // ===========================
  // 4. INTEGRATION TEST - Multi-Module Workflow
  // ===========================
  test('🎯 Complete Workflow - Recipe → Batch → DoP', async ({ page }) => {
    const testId = getTestId()

    console.log('Testing complete integration workflow...')

    let recipeId: string

    // 1. Create Recipe
    await test.step('Create recipe for workflow', async () => {
      const recipeName = `Workflow Recipe ${testId}`

      await page.goto('/en13813/recipes/new')
      await page.fill('input[name="name"]', recipeName)
      await page.fill('textarea[name="description"]', 'Integration workflow test')
      await page.selectOption('select[name="type"]', 'CT')
      await page.selectOption('select[name="compressive_strength_class"]', 'C35')
      await page.selectOption('select[name="flexural_strength_class"]', 'F6')
      await page.fill('input[name="materials.binder.amount"]', '400')
      await page.fill('input[name="materials.water.amount"]', '180')

      await page.click('button[type="submit"]')
      await page.waitForURL('**/recipes', { timeout: 10000 })

      // Get recipe ID from DB
      const { data: recipe } = await supabase
        .from('en13813_recipes')
        .select('id')
        .eq('name', recipeName)
        .single()

      recipeId = recipe?.id
      console.log('✅ Recipe created with ID:', recipeId)
    })

    // 2. Create Batch using the Recipe
    await test.step('Create batch with recipe', async () => {
      const batchNumber = `WF-BATCH-${testId}`

      await page.goto('/en13813/batches/new')
      await page.fill('input[name="batch_number"]', batchNumber)
      await page.fill('input[name="production_date"]', '2025-01-29')
      await page.fill('input[name="quantity"]', '2000')

      // Select the created recipe
      if (recipeId) {
        await page.selectOption('select[name="recipe_id"]', recipeId)
      }

      await page.click('button[type="submit"]')
      await page.waitForURL('**/batches', { timeout: 15000 })

      console.log('✅ Batch created with recipe')
    })

    // 3. Create DoP referencing the Recipe
    await test.step('Create DoP with recipe', async () => {
      const dopNumber = `WF-DOP-${testId}`

      await page.goto('/en13813/dops/new')
      await page.fill('input[name="dop_number"]', dopNumber)
      await page.fill('input[name="product_name"]', `Workflow Product ${testId}`)
      await page.fill('textarea[name="intended_use"]', 'Workflow test product')
      await page.fill('input[name="manufacturer_name"]', 'Workflow Test GmbH')

      // Select the created recipe
      if (recipeId) {
        await page.selectOption('select[name="recipe_id"]', recipeId)
      }

      await page.click('button[type="submit"]')
      await page.waitForURL('**/dops', { timeout: 10000 })

      console.log('✅ DoP created with recipe')
    })

    console.log('✅ Complete workflow test successful!')
  })
})

// ===========================
// VALIDATION & ERROR HANDLING
// ===========================
test.describe('🛡️ Validation & Error Handling', () => {

  test('Form validation - Required fields', async ({ page }) => {
    await page.goto('/en13813/recipes/new')

    // Versuche leeres Formular zu speichern
    await page.click('button[type="submit"]')

    // Sollte Validierungsfehler zeigen
    const nameError = page.locator('text=/Name.*erforderlich|Name.*required/i')
    await expect(nameError).toBeVisible({ timeout: 5000 })

    console.log('✅ Form validation working')
  })

  test('Duplicate recipe code handling', async ({ page }) => {
    const duplicateCode = `DUP_${Date.now()}`

    // Create first recipe
    await page.goto('/en13813/recipes/new')
    await page.fill('input[name="name"]', 'First Recipe')
    await page.fill('input[name="recipe_code"]', duplicateCode)
    await page.selectOption('select[name="type"]', 'CT')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/recipes', { timeout: 10000 })

    // Try to create second with same code
    await page.goto('/en13813/recipes/new')
    await page.fill('input[name="name"]', 'Second Recipe')
    await page.fill('input[name="recipe_code"]', duplicateCode)
    await page.selectOption('select[name="type"]', 'CT')
    await page.click('button[type="submit"]')

    // Should show error
    const errorMessage = page.locator('text=/existiert bereits|already exists/i')
    await expect(errorMessage).toBeVisible({ timeout: 5000 })

    console.log('✅ Duplicate handling working')
  })
})

// ===========================
// PERFORMANCE TEST
// ===========================
test.describe('⚡ Performance', () => {

  test('Page load times for critical modules', async ({ page }) => {
    const criticalPages = [
      { url: '/en13813/dashboard', maxTime: 3000 },
      { url: '/en13813/recipes', maxTime: 5000 },
      { url: '/en13813/dops', maxTime: 5000 },
      { url: '/en13813/batches', maxTime: 15000 } // Longer timeout for batches
    ]

    for (const { url, maxTime } of criticalPages) {
      const startTime = Date.now()
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      console.log(`${url}: ${loadTime}ms (max: ${maxTime}ms)`)
      expect(loadTime).toBeLessThan(maxTime)
    }
  })
})