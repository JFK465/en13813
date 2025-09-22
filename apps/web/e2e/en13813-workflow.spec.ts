import { test, expect, type Page } from '@playwright/test'

/**
 * E2E Tests für EN13813 Haupt-Workflow
 * Testet den kompletten Prozess von Rezepterstellung bis DoP-Generierung
 */

test.describe('EN13813 Compliance Workflow', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage

    // Login als Demo User
    await page.goto('/login')
    await page.fill('[name="email"]', 'demo@estrichwerke.de')
    await page.fill('[name="password"]', 'Demo2024!')
    await page.click('button[type="submit"]')

    // Warte auf Dashboard
    await page.waitForURL('**/en13813')
    await expect(page.locator('h1')).toContainText('EN 13813')
  })

  test('Kompletter Workflow: Rezept → Charge → Test → DoP', async () => {
    // 1. Rezept erstellen
    await test.step('Rezept erstellen', async () => {
      await page.goto('/en13813/recipes/new')

      // Grunddaten
      await page.fill('[name="name"]', 'E2E Test Rezept CT-C25-F4')
      await page.selectOption('[name="binder_type"]', 'CT')
      await page.selectOption('[name="compressive_strength_class"]', 'C25')
      await page.selectOption('[name="flexural_strength_class"]', 'F4')

      // AVCP System
      await page.selectOption('[name="avcp_system"]', '4')

      // Verwendungszweck
      await page.selectOption('[name="intended_use"]', 'wearing_screed')

      await page.click('button:has-text("Speichern")')
      await expect(page.locator('.toast')).toContainText('erfolgreich')
    })

    // 2. Charge anlegen
    await test.step('Charge produzieren', async () => {
      await page.goto('/en13813/batches/new')

      // Rezept auswählen
      await page.selectOption('[name="recipe_id"]', 'E2E Test Rezept CT-C25-F4')

      // Chargendaten
      await page.fill('[name="quantity_kg"]', '1000')
      await page.fill('[name="production_date"]', '2024-01-15')

      await page.click('button:has-text("Charge anlegen")')
      await expect(page.locator('.toast')).toContainText('Charge erstellt')
    })

    // 3. Laborwerte eingeben
    await test.step('Laborwerte erfassen', async () => {
      await page.goto('/en13813/lab-values/new')

      // Charge auswählen (letzte erstellte)
      await page.selectOption('[name="batch_id"]', { index: 0 })

      // Druckfestigkeit
      await page.fill('[name="compressive_strength_value"]', '26.5')
      await page.fill('[name="compressive_strength_age_days"]', '28')

      // Biegezugfestigkeit
      await page.fill('[name="flexural_strength_value"]', '4.8')
      await page.fill('[name="flexural_strength_age_days"]', '28')

      await page.click('button:has-text("Werte speichern")')
      await expect(page.locator('.toast')).toContainText('gespeichert')
    })

    // 4. Konformität prüfen
    await test.step('Konformitätsbewertung', async () => {
      await page.goto('/en13813/test-reports')

      // Neue Bewertung
      await page.click('button:has-text("Neue Bewertung")')

      // Rezept wählen
      await page.selectOption('[name="recipe_id"]', 'E2E Test Rezept CT-C25-F4')

      // Bewertungsmethode
      await page.selectOption('[name="evaluation_method"]', 'single_value')

      // Prüfung durchführen
      await page.click('button:has-text("Konformität prüfen")')

      // Ergebnis prüfen
      await expect(page.locator('[data-testid="conformity-result"]')).toContainText('Konform')
      await expect(page.locator('[data-testid="min-value"]')).toContainText('26.5')
    })

    // 5. DoP generieren
    await test.step('DoP erstellen', async () => {
      await page.goto('/en13813/dops/new')

      // Rezept wählen
      await page.selectOption('[name="recipe_id"]', 'E2E Test Rezept CT-C25-F4')

      // DoP-Nummer wird automatisch generiert
      await expect(page.locator('[name="dop_number"]')).toHaveValue(/DoP-\d{4}-\d{3}/)

      // Sprache
      await page.selectOption('[name="language"]', 'de')

      // Unterzeichner
      await page.fill('[name="signatory.name"]', 'Max Mustermann')
      await page.fill('[name="signatory.position"]', 'Qualitätsmanager')
      await page.fill('[name="signatory.place"]', 'München')

      // DoP generieren
      await page.click('button:has-text("DoP generieren")')

      // PDF Download prüfen
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('button:has-text("PDF herunterladen")')
      ])

      expect(download.suggestedFilename()).toContain('DoP')
      expect(download.suggestedFilename()).toContain('.pdf')
    })
  })

  test('Abweichungsmanagement (CAPA)', async () => {
    await test.step('Abweichung erstellen', async () => {
      await page.goto('/en13813/deviations/new')

      // Abweichungsdetails
      await page.fill('[name="title"]', 'E2E Test: Druckfestigkeit unter Sollwert')
      await page.fill('[name="description"]', 'Charge 2024-001 zeigt C23 statt C25')

      // EN13813 spezifisch
      await page.fill('[name="affected_characteristic"]', 'C25')
      await page.fill('[name="target_class"]', 'C25')
      await page.selectOption('[name="conformity_mode"]', 'single_value')

      // Testergebnisse
      await page.fill('[name="test_results[0].value"]', '23.5')
      await page.fill('[name="test_results[0].date"]', '2024-01-20')

      // Schweregrad
      await page.selectOption('[name="severity"]', 'major')
      await page.selectOption('[name="source"]', 'quality_control')

      // Sofortmaßnahme
      await page.check('[name="immediate_action_required"]')
      await page.fill('[name="immediate_action_description"]', 'Charge gesperrt, Nachprüfung angeordnet')

      await page.click('button:has-text("Abweichung speichern")')

      // Prüfe automatische Aktionen
      await expect(page.locator('[data-testid="batch-blocked"]')).toBeChecked()
      await expect(page.locator('[data-testid="marking-blocked"]')).toBeChecked()
    })

    await test.step('Korrekturmaßnahme definieren', async () => {
      // Zur Abweichungsdetails
      await page.click('[data-testid="deviation-row"]:first-child')

      // Neue Korrekturmaßnahme
      await page.click('button:has-text("Maßnahme hinzufügen")')

      await page.fill('[name="description"]', 'Rezeptur anpassen: Zementanteil um 5% erhöhen')
      await page.fill('[name="responsible_person"]', 'Produktionsleiter')
      await page.fill('[name="planned_end_date"]', '2024-02-01')

      await page.selectOption('[name="action_type"]', 'corrective')

      await page.click('button:has-text("Maßnahme speichern")')
      await expect(page.locator('[data-testid="action-status"]')).toContainText('planned')
    })
  })

  test('Multi-Tenant Isolation', async () => {
    // Versuche auf Daten eines anderen Mandanten zuzugreifen
    await test.step('Direkter URL-Zugriff blockiert', async () => {
      // Versuche eine DoP eines anderen Mandanten zu öffnen
      await page.goto('/en13813/dops/other-tenant-dop-id')

      // Sollte 404 oder Zugriff verweigert zeigen
      await expect(page.locator('body')).toContainText(/404|Nicht gefunden|Zugriff verweigert/i)
    })

    await test.step('API-Zugriff blockiert', async () => {
      // Versuche API-Call zu anderem Mandanten
      const response = await page.request.get('/api/en13813/recipes?tenant_id=other-tenant')

      expect(response.status()).toBe(403)
    })
  })

  test('Normkonformität: Bezeichnung', async () => {
    await test.step('Korrekte EN13813 Bezeichnung', async () => {
      await page.goto('/en13813/recipes')

      // Prüfe Bezeichnungen
      const designations = await page.locator('[data-testid="recipe-designation"]').allTextContents()

      designations.forEach(designation => {
        // Muss Format haben: BINDERTYPE-CVALUE-FVALUE[-OPTIONAL]
        expect(designation).toMatch(/^(CT|CA|MA|AS|SR)-C\d{1,2}-F\d{1,2}/)
      })
    })
  })

  test('CE-Kennzeichnung Validierung', async () => {
    await test.step('CE-Label enthält Pflichtangaben', async () => {
      await page.goto('/en13813/dops/[id]/ce-label')

      const ceContent = await page.locator('[data-testid="ce-label"]').textContent()

      // Pflichtangaben nach EN13813 § 8
      expect(ceContent).toContain('CE')
      expect(ceContent).toMatch(/\d{2}/) // Jahr
      expect(ceContent).toContain('EN 13813:2002')
      expect(ceContent).toMatch(/DoP-\d{4}-\d{3}/)
      expect(ceContent).toMatch(/(CT|CA|MA|AS|SR)-C\d+-F\d+/)
    })
  })

  test('Performance: Große Datenmengen', async () => {
    await test.step('Pagination funktioniert', async () => {
      await page.goto('/en13813/batches')

      // Warte auf Tabelle
      await page.waitForSelector('[data-testid="batch-table"]')

      // Prüfe Pagination
      const paginationInfo = await page.locator('[data-testid="pagination-info"]').textContent()
      expect(paginationInfo).toMatch(/\d+ von \d+ Einträgen/)

      // Navigiere zur nächsten Seite
      await page.click('button[aria-label="Nächste Seite"]')

      // URL sollte sich ändern
      expect(page.url()).toContain('page=2')
    })

    await test.step('Filterung funktioniert', async () => {
      await page.goto('/en13813/recipes')

      // Filter nach Bindemitteltyp
      await page.selectOption('[data-testid="filter-binder-type"]', 'CT')

      // Warte auf gefilterte Ergebnisse
      await page.waitForTimeout(500)

      // Alle Ergebnisse sollten CT sein
      const types = await page.locator('[data-testid="recipe-type"]').allTextContents()
      types.forEach(type => expect(type).toBe('CT'))
    })
  })

  test('Accessibility', async () => {
    await test.step('Keyboard Navigation', async () => {
      await page.goto('/en13813/recipes/new')

      // Tab durch Formular
      await page.keyboard.press('Tab')
      const firstInput = await page.evaluate(() => document.activeElement?.getAttribute('name'))
      expect(firstInput).toBeTruthy()

      // Escape sollte Modal schließen
      await page.click('button:has-text("Hilfe")')
      await page.waitForSelector('[role="dialog"]')
      await page.keyboard.press('Escape')
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    })

    await test.step('ARIA Labels', async () => {
      await page.goto('/en13813')

      // Hauptnavigation
      const nav = page.locator('nav[aria-label="Hauptnavigation"]')
      await expect(nav).toBeVisible()

      // Buttons haben Labels
      const buttons = await page.locator('button').all()
      for (const button of buttons.slice(0, 5)) { // Prüfe erste 5
        const ariaLabel = await button.getAttribute('aria-label')
        const text = await button.textContent()
        expect(ariaLabel || text).toBeTruthy()
      }
    })
  })
})