import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

/**
 * EN13813 Recipe Workflow Integration Tests
 * Tests the complete workflow from recipe creation to DoP generation
 */

describe('EN13813 Recipe Workflow Integration', () => {
  let testRecipeId: string
  let testDoPId: string

  beforeAll(async () => {
    // Setup test database connection
    process.env.NODE_ENV = 'test'
  })

  afterAll(async () => {
    // Cleanup test data - skip if supabase not available (mock tests)
    // In real integration tests, you would initialize supabase here
  })

  describe('Recipe Creation', () => {
    it('should create a valid CT recipe with all required fields', async () => {
      const recipeData = {
        recipe_code: 'TEST-CT-C25-F4',
        name: 'Test Zement-Estrich',
        product_name: 'TestFloor CT25',
        manufacturer_name: 'Test GmbH',
        manufacturer_address: 'Teststraße 1, 12345 Teststadt',
        binder_type: 'CT',
        compressive_strength_class: 'C25',
        flexural_strength_class: 'F4',
        fire_class: 'A1fl',
        wear_resistance_bohme_class: 'A22',
        status: 'draft'
      }

      const response = await fetch('/api/en13813/recipes/compliant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      })

      expect(response.status).toBe(201)
      const result = await response.json()
      expect(result.recipe).toBeDefined()
      expect(result.recipe.recipe_code).toBe(recipeData.recipe_code)
      testRecipeId = result.recipe.id
    })

    it('should reject CA recipe with pH < 7', async () => {
      const invalidRecipe = {
        recipe_code: 'TEST-CA-INVALID',
        name: 'Invalid CA Recipe',
        product_name: 'InvalidCA',
        manufacturer_name: 'Test GmbH',
        manufacturer_address: 'Teststraße 1, 12345 Teststadt',
        binder_type: 'CA',
        compressive_strength_class: 'C16',
        flexural_strength_class: 'F3',
        fire_class: 'A1fl',
        ph_value: 6.5 // Invalid: must be >= 7 for CA
      }

      const response = await fetch('/api/en13813/recipes/compliant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidRecipe)
      })

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toContain('pH')
    })

    it('should validate all required EN13813 fields', async () => {
      const incompleteRecipe = {
        recipe_code: 'TEST-INCOMPLETE',
        name: 'Incomplete Recipe'
        // Missing required fields
      }

      const response = await fetch('/api/en13813/recipes/compliant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteRecipe)
      })

      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toBeDefined()
    })
  })

  describe('FPC System', () => {
    it('should create FPC control plan for recipe', async () => {
      const controlPlan = {
        recipe_id: testRecipeId,
        name: 'Druckfestigkeit Kontrolle',
        control_type: 'final_product',
        frequency: 'daily',
        test_parameter: 'compressive_strength',
        test_method: 'EN 12390-3',
        min_value: 25.0,
        max_value: 35.0,
        target_value: 30.0,
        unit: 'N/mm²'
      }

      const response = await fetch('/api/en13813/fpc/control-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(controlPlan)
      })

      expect(response.status).toBe(201)
      const result = await response.json()
      expect(result.plan).toBeDefined()
      expect(result.plan.test_parameter).toBe('compressive_strength')
    })

    it('should record FPC test results with pass/fail determination', async () => {
      const testResult = {
        recipe_id: testRecipeId,
        test_date: new Date().toISOString(),
        sample_id: 'SAMPLE-001',
        measured_value: 26.5,
        unit: 'N/mm²',
        pass: true
      }

      const response = await fetch('/api/en13813/fpc/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testResult)
      })

      expect(response.status).toBe(201)
      const result = await response.json()
      expect(result.result).toBeDefined()
      expect(result.result.pass).toBe(true)
    })
  })

  describe('ITT Module', () => {
    it('should create ITT test for recipe', async () => {
      const ittTest = {
        recipe_id: testRecipeId,
        test_number: 'ITT-2024-001',
        test_date: new Date().toISOString(),
        laboratory_name: 'Test Labor GmbH',
        laboratory_accreditation: 'DAkkS D-PL-12345',
        compressive_strength_result: 26.8,
        flexural_strength_result: 4.5,
        fire_test_result: 'A1fl',
        compliant: true
      }

      const response = await fetch('/api/en13813/itt/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ittTest)
      })

      expect(response.status).toBe(201)
      const result = await response.json()
      expect(result.test).toBeDefined()
      expect(result.test.compliant).toBe(true)
    })

    it('should validate ITT results against declared classes', async () => {
      const ittTest = {
        recipe_id: testRecipeId,
        test_number: 'ITT-2024-002',
        test_date: new Date().toISOString(),
        laboratory_name: 'Test Labor GmbH',
        compressive_strength_result: 24.0, // Below C25 requirement
        flexural_strength_result: 3.8, // Below F4 requirement
        compliant: false
      }

      const response = await fetch('/api/en13813/itt/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ittTest)
      })

      expect(response.status).toBe(201)
      const result = await response.json()
      expect(result.test.compliant).toBe(false)
    })
  })

  describe('DoP Generation', () => {
    it('should generate DoP for compliant recipe', async () => {
      const dopData = {
        recipe_id: testRecipeId,
        dop_number: 'DoP-TEST-2024-001',
        language: 'de',
        manufacturer_data: {
          name: 'Test GmbH',
          address: 'Teststraße 1',
          postalCode: '12345',
          city: 'Teststadt',
          country: 'Deutschland'
        },
        signatory: {
          name: 'Max Mustermann',
          position: 'Technischer Leiter',
          place: 'Teststadt'
        }
      }

      const response = await fetch('/api/en13813/dops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dopData)
      })

      expect(response.status).toBe(201)
      const result = await response.json()
      expect(result.dop).toBeDefined()
      expect(result.dop.dop_number).toBe(dopData.dop_number)
      testDoPId = result.dop.id
    })

    it('should generate QR code for public DoP access', async () => {
      const response = await fetch(`/api/en13813/dops/${testDoPId}`)

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result.dop.qr_code_data).toBeDefined()
      expect(result.dop.public_url).toBeDefined()
      expect(result.dop.public_url).toContain('/public/dop/')
    })

    it('should generate PDF for DoP', async () => {
      const response = await fetch(`/api/en13813/dops/${testDoPId}/pdf`)

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('application/pdf')

      const blob = await response.blob()
      expect(blob.size).toBeGreaterThan(0)
    })
  })

  describe('Compliance Validation', () => {
    it('should validate complete EN13813 compliance chain', async () => {
      // Check if recipe has all required data
      const recipeResponse = await fetch(`/api/en13813/recipes/${testRecipeId}`)
      const recipeResult = await recipeResponse.json()

      expect(recipeResult.recipe).toBeDefined()
      expect(recipeResult.recipe.manufacturer_name).toBeTruthy()
      expect(recipeResult.recipe.compressive_strength_class).toBeTruthy()
      expect(recipeResult.recipe.flexural_strength_class).toBeTruthy()
      expect(recipeResult.recipe.fire_class).toBeTruthy()

      // Check if ITT tests exist
      const ittResponse = await fetch(`/api/en13813/itt/tests?recipe_id=${testRecipeId}`)
      const ittResult = await ittResponse.json()

      expect(ittResult.tests).toBeDefined()
      expect(ittResult.tests.length).toBeGreaterThan(0)

      // Check if FPC is configured
      const fpcResponse = await fetch(`/api/en13813/fpc/control-plans?recipe_id=${testRecipeId}`)
      const fpcResult = await fpcResponse.json()

      expect(fpcResult.plans).toBeDefined()
      expect(fpcResult.plans.length).toBeGreaterThan(0)

      // Check if DoP exists
      const dopResponse = await fetch(`/api/en13813/dops?recipe_id=${testRecipeId}`)
      const dopResult = await dopResponse.json()

      expect(dopResult.dops).toBeDefined()
      expect(dopResult.dops.length).toBeGreaterThan(0)
    })

    it('should track audit trail for all changes', async () => {
      const auditResponse = await fetch(`/api/en13813/audit-trail?entity_id=${testRecipeId}`)
      const auditResult = await auditResponse.json()

      expect(auditResult.trail).toBeDefined()
      expect(auditResult.trail.length).toBeGreaterThan(0)
      expect(auditResult.trail[0].action).toBe('create')
      expect(auditResult.trail[0].entity_type).toBe('recipe')
    })
  })

  describe('Batch Operations', () => {
    it('should import multiple recipes from Excel', async () => {
      const importData = [
        {
          recipe_code: 'BATCH-001',
          name: 'Batch Recipe 1',
          product_name: 'BatchProduct1',
          manufacturer_name: 'Test GmbH',
          manufacturer_address: 'Teststraße 1',
          binder_type: 'CT',
          compressive_strength_class: 'C20',
          flexural_strength_class: 'F3',
          fire_class: 'A1fl'
        },
        {
          recipe_code: 'BATCH-002',
          name: 'Batch Recipe 2',
          product_name: 'BatchProduct2',
          manufacturer_name: 'Test GmbH',
          manufacturer_address: 'Teststraße 1',
          binder_type: 'CA',
          compressive_strength_class: 'C16',
          flexural_strength_class: 'F3',
          fire_class: 'Bfl-s1',
          ph_value: 7.5
        }
      ]

      const response = await fetch('/api/en13813/recipes/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: importData })
      })

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result.imported).toBe(2)
      expect(result.failed).toBe(0)
    })

    it('should export recipes in multiple formats', async () => {
      // Test Excel export
      const xlsxResponse = await fetch('/api/en13813/recipes/export?format=xlsx')
      expect(xlsxResponse.status).toBe(200)
      expect(xlsxResponse.headers.get('content-type')).toContain('spreadsheet')

      // Test CSV export
      const csvResponse = await fetch('/api/en13813/recipes/export?format=csv')
      expect(csvResponse.status).toBe(200)
      expect(csvResponse.headers.get('content-type')).toContain('csv')

      // Test JSON export
      const jsonResponse = await fetch('/api/en13813/recipes/export?format=json')
      expect(jsonResponse.status).toBe(200)
      expect(jsonResponse.headers.get('content-type')).toContain('json')
    })
  })
})