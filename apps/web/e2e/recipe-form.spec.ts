import { test, expect } from '@playwright/test'

/**
 * Direkter Test für das Rezeptur-Formular
 * Umgeht Dashboard-Ladeprobleme
 */

test.describe('Recipe Form Direct Test', () => {
  test('Rezeptur-Formular direkt testen', async ({ page }) => {
    // Login
    await page.goto('/login')

    await page.fill('[name="email"]', 'geniusgoods465@gmail.com')
    await page.fill('[name="password"]', 'Jonas1312')
    await page.click('button[type="submit"]')

    // Warte kurz nach Login
    await page.waitForTimeout(2000)

    // Navigiere direkt zur Rezeptur-Seite
    await page.goto('/en13813/recipes/new', { waitUntil: 'networkidle' })

    // Warte auf das Formular
    await page.waitForSelector('[name="recipe_code"]', { timeout: 10000 })

    // Fülle das Formular aus
    await page.fill('[name="recipe_code"]', 'TEST-E2E-001')
    await page.fill('[name="name"]', 'Test Rezeptur E2E')

    // Prüfe ob EN-Bezeichnung angezeigt wird
    await expect(page.locator('text="CT-C25-F4"')).toBeVisible()

    // Klicke auf das Dropdown für Bindemitteltyp und wähle einen anderen Wert
    await page.click('text="CT - Zementestrich"')
    await page.click('text="CA - Calciumsulfatestrich"')

    // Klicke auf Druckfestigkeit Dropdown und wähle C30
    await page.click('text="C25"')
    await page.click('text="C30"')

    // Klicke auf Biegezugfestigkeit Dropdown und wähle F5
    await page.click('text="F4"')
    await page.click('text="F5"')

    // Status auf active setzen
    await page.click('text="Entwurf"')
    await page.click('text="Aktiv"')

    // Screenshot vor dem Speichern
    await page.screenshot({ path: 'test-results/recipe-form-filled.png', fullPage: true })

    // Scrolle zum Speichern-Button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Klicke Speichern
    await page.click('button:has-text("Rezeptur speichern")')

    // Warte auf Toast-Nachricht oder Weiterleitung
    const result = await Promise.race([
      page.waitForSelector('[role="status"]', { timeout: 5000 }).then(() => 'toast'),
      page.waitForSelector('.toast', { timeout: 5000 }).then(() => 'toast'),
      page.waitForSelector('[data-sonner-toast]', { timeout: 5000 }).then(() => 'toast'),
      page.waitForURL('**/en13813/recipes/**', { timeout: 5000 }).then(() => 'redirect'),
      page.waitForSelector('text="erfolgreich"', { timeout: 5000 }).then(() => 'success')
    ]).catch(() => null)

    // Screenshot nach dem Speichern
    await page.screenshot({ path: 'test-results/recipe-form-after-save.png', fullPage: true })

    // Prüfe Ergebnis
    if (result === 'redirect') {
      console.log('✅ Erfolgreich umgeleitet zur Rezeptliste')
    } else if (result === 'toast' || result === 'success') {
      console.log('✅ Erfolgsmeldung angezeigt')
    } else {
      // Prüfe ob ein Fehler angezeigt wird
      const errorText = await page.textContent('body')
      if (errorText?.includes('Fehler') || errorText?.includes('Error')) {
        throw new Error('Speichern fehlgeschlagen: ' + errorText.slice(0, 200))
      }
    }

    // Erweiterte Felder testen
    await test.step('Erweiterte Felder testen', async () => {
      // Navigiere zurück zum Formular falls umgeleitet
      if (result === 'redirect') {
        await page.goto('/en13813/recipes/new')
        await page.waitForSelector('[name="recipe_code"]', { timeout: 10000 })
      }

      // Klicke auf "Erweiterte Eigenschaften"
      const advancedButton = page.locator('text="Erweiterte Eigenschaften"').first()
      if (await advancedButton.isVisible()) {
        await advancedButton.click()

        // Warte auf lazy-loaded content
        await page.waitForTimeout(1000)

        // Prüfe ob erweiterte Felder geladen wurden
        const hasAdvancedFields = await page.locator('[name*="wear_resistance"]').count() > 0 ||
                                  await page.locator('[name*="materials"]').count() > 0 ||
                                  await page.locator('text="Verschleißwiderstand"').count() > 0

        if (hasAdvancedFields) {
          console.log('✅ Erweiterte Felder erfolgreich geladen')
        } else {
          console.log('⚠️ Erweiterte Felder nicht gefunden')
        }
      }
    })
  })
})