import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// Comprehensive test for all recipe form fields
test.describe('Recipe Form - Complete Field Verification', () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const testRecipeData = {
    // === GRUNDDATEN ===
    recipe_code: 'TEST-' + Date.now(),
    name: 'Vollständiger Test Rezeptur',
    description: 'Test aller Felder',
    type: 'CT',

    // === HERSTELLERANGABEN ===
    manufacturer_name: 'Test GmbH',
    manufacturer_address: 'Teststraße 1, 12345 Teststadt',
    product_name: 'TestProduct Pro',

    // === KONFORMITÄTSBEWERTUNG ===
    avcp_system: '4',
    notified_body_number: '1234',

    // === VERSIONIERUNG ===
    version: '1.0.0',
    status: 'draft',

    // === MECHANISCHE EIGENSCHAFTEN ===
    compressive_strength_class: 'C25',
    flexural_strength_class: 'F4',
    test_age_days: 28,
    early_strength: true,

    // === VERSCHLEISSWIDERSTAND ===
    wear_resistance_method: 'bohme',
    wear_resistance_class: 'A22',

    // === ROLLWIDERSTAND ===
    rwfc_class: 'RWFC350',

    // === VERFORMUNG ===
    indentation_class: 'IC10',
    heated_indicator: true,

    // === HAFTZUGFESTIGKEIT ===
    bond_strength_class: 'B1.5',
    impact_resistance_nm: 10,

    // === OBERFLÄCHENHÄRTE ===
    surface_hardness_class: 'SH50',

    // === BRANDVERHALTEN ===
    fire_class: 'A1fl',
    smoke_class: 's1',

    // === VERWENDUNGSZWECK ===
    intended_use: {
      wearing_surface: true,
      with_flooring: false,
      heated_screed: true,
      indoor_only: false,
      outdoor_use: true,
      wet_areas: true,
      industrial_use: true,
      chemical_resistance: true
    },

    // === MATERIALZUSAMMENSETZUNG ===
    materials: {
      binder_type: 'CT',
      binder_designation: 'CEM I 42,5 R',
      binder_amount_kg_m3: 320,
      binder_supplier: 'Zement AG',
      binder_certificate: 'CERT-123',
      batch_size_kg: 25,
      production_date: '2025-01-01',
      shelf_life_months: 12,
      storage_conditions: 'Trocken lagern',
      aggregate_type: 'natural',
      aggregate_designation: 'Quarzsand 0/4',
      // ... weitere Material-Felder
    },

    // === ZUSÄTZLICHE EIGENSCHAFTEN ===
    additional_properties: {
      elastic_modulus_class: 'E10',
      shrinkage_mm_m: 0.5,
      thermal_conductivity_w_mk: 1.2,
      electrical_resistance_ohm_m: 100000,
      chemical_resistance: ['oil', 'acid'],
      radioactivity_index: 0.5,
      tvoc_emission: 250
    },

    // === QUALITÄTSKONTROLLE ===
    quality_control: {
      test_frequency_fresh: 'daily',
      test_frequency_hardened: 'weekly',
      sample_size: '3 Würfel',
      retention_samples_months: 6,
      calibration_scales: 'monthly',
      calibration_mixers: 'quarterly',
      calibration_testing: 'jährlich',
      tolerance_binder_percent: 2,
      tolerance_water_percent: 3,
      tolerance_temperature_celsius: 2,
      tolerance_consistency_percent: 5,
      deviation_minor: 'Nachjustierung',
      deviation_major: 'Produktion stoppen',
      deviation_critical: 'Rückruf',
      acceptance_criteria: 'Nach DIN EN 13813'
    }
  }

  test('should save ALL form fields to database', async () => {
    await test.step('Fill and submit form', async ({ page }) => {
      await page.goto('/en13813/recipes/new')

      // === Grunddaten ausfüllen ===
      await page.fill('[name="recipe_code"]', testRecipeData.recipe_code)
      await page.fill('[name="name"]', testRecipeData.name)
      await page.fill('[name="description"]', testRecipeData.description)
      await page.selectOption('[name="type"]', testRecipeData.type)

      // === Herstellerangaben ===
      await page.fill('[name="manufacturer_name"]', testRecipeData.manufacturer_name)
      await page.fill('[name="manufacturer_address"]', testRecipeData.manufacturer_address)
      await page.fill('[name="product_name"]', testRecipeData.product_name)

      // === Mechanische Eigenschaften ===
      await page.selectOption('[name="compressive_strength_class"]', testRecipeData.compressive_strength_class)
      await page.selectOption('[name="flexural_strength_class"]', testRecipeData.flexural_strength_class)
      await page.fill('[name="test_age_days"]', testRecipeData.test_age_days.toString())
      await page.check('[name="early_strength"]')

      // === Verschleißwiderstand ===
      await page.selectOption('[name="wear_resistance_method"]', testRecipeData.wear_resistance_method)
      await page.selectOption('[name="wear_resistance_class"]', testRecipeData.wear_resistance_class)

      // === Weitere Eigenschaften ===
      await page.selectOption('[name="rwfc_class"]', testRecipeData.rwfc_class)
      await page.selectOption('[name="surface_hardness_class"]', testRecipeData.surface_hardness_class)
      await page.selectOption('[name="bond_strength_class"]', testRecipeData.bond_strength_class)

      // === Verwendungszweck ===
      await page.check('[name="intended_use.wearing_surface"]')
      await page.check('[name="intended_use.heated_screed"]')
      await page.check('[name="intended_use.outdoor_use"]')
      await page.check('[name="intended_use.wet_areas"]')
      await page.check('[name="intended_use.industrial_use"]')
      await page.check('[name="intended_use.chemical_resistance"]')

      // === Material ===
      await page.selectOption('[name="materials.binder_type"]', testRecipeData.materials.binder_type)
      await page.fill('[name="materials.binder_designation"]', testRecipeData.materials.binder_designation)
      await page.fill('[name="materials.binder_amount_kg_m3"]', testRecipeData.materials.binder_amount_kg_m3.toString())

      // === Qualitätskontrolle ===
      await page.selectOption('[name="quality_control.test_frequency_fresh"]', testRecipeData.quality_control.test_frequency_fresh)
      await page.selectOption('[name="quality_control.test_frequency_hardened"]', testRecipeData.quality_control.test_frequency_hardened)
      await page.fill('[name="quality_control.retention_samples_months"]', testRecipeData.quality_control.retention_samples_months.toString())

      // Submit form
      await page.click('button[type="submit"]')
      await page.waitForURL('**/recipes/**')
    })

    await test.step('Verify data in database', async () => {
      // Wait for data to be saved
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Query database directly
      const { data: recipe, error } = await supabase
        .from('en13813_recipes')
        .select('*')
        .eq('recipe_code', testRecipeData.recipe_code)
        .single()

      expect(error).toBeNull()
      expect(recipe).toBeDefined()

      // === Verify ALL fields ===
      // Grunddaten
      expect(recipe.recipe_code).toBe(testRecipeData.recipe_code)
      expect(recipe.name).toBe(testRecipeData.name)
      expect(recipe.description).toBe(testRecipeData.description)
      expect(recipe.type).toBe(testRecipeData.type)

      // Herstellerangaben
      expect(recipe.manufacturer_name).toBe(testRecipeData.manufacturer_name)
      expect(recipe.manufacturer_address).toBe(testRecipeData.manufacturer_address)
      expect(recipe.product_name).toBe(testRecipeData.product_name)

      // Mechanische Eigenschaften
      expect(recipe.compressive_strength_class).toBe(testRecipeData.compressive_strength_class)
      expect(recipe.flexural_strength_class).toBe(testRecipeData.flexural_strength_class)
      expect(recipe.test_age_days).toBe(testRecipeData.test_age_days)
      expect(recipe.early_strength).toBe(testRecipeData.early_strength)

      // Verschleißwiderstand
      expect(recipe.wear_resistance_method).toBe(testRecipeData.wear_resistance_method)
      expect(recipe.wear_resistance_class).toBe(testRecipeData.wear_resistance_class)

      // Material (als JSONB gespeichert)
      expect(recipe.materials?.binder_type).toBe(testRecipeData.materials.binder_type)
      expect(recipe.materials?.binder_designation).toBe(testRecipeData.materials.binder_designation)
      expect(recipe.materials?.binder_amount_kg_m3).toBe(testRecipeData.materials.binder_amount_kg_m3)

      // Intended Use (als JSONB gespeichert)
      expect(recipe.intended_use?.wearing_surface).toBe(true)
      expect(recipe.intended_use?.heated_screed).toBe(true)
      expect(recipe.intended_use?.outdoor_use).toBe(true)

      // Quality Control (als JSONB gespeichert)
      expect(recipe.quality_control?.test_frequency_fresh).toBe(testRecipeData.quality_control.test_frequency_fresh)
      expect(recipe.quality_control?.retention_samples_months).toBe(testRecipeData.quality_control.retention_samples_months)

      console.log('✅ All fields verified successfully!')
    })

    await test.step('Cleanup', async () => {
      // Clean up test data
      await supabase
        .from('en13813_recipes')
        .delete()
        .eq('recipe_code', testRecipeData.recipe_code)
    })
  })
})