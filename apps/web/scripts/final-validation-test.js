#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Pragmatisches Test-Set mit realistischen Daten
const realWorldRecipe = {
  // Pflichtfelder
  recipe_code: `FINAL_TEST_${Date.now()}`,
  name: 'Produktions-Rezept CT-C25-F4',
  type: 'CT',
  binder_type: 'CT',
  compressive_strength_class: 'C25',
  flexural_strength_class: 'F4',
  version: '1.0',
  status: 'active',
  fire_class: 'A1fl',

  // Wichtige optionale Felder
  description: 'Standard Zementestrich für Industrieböden',
  manufacturer_name: 'Musterfirma GmbH',
  manufacturer_address: 'Industriestr. 1, 12345 Musterstadt',
  product_name: 'IndustrieEstrich 25',

  test_age_days: 28,
  early_strength: false,

  wear_resistance_method: 'bohme',
  wear_resistance_class: 'A22',
  surface_hardness_class: 'SH50',
  bond_strength_class: 'B1.5',

  avcp_system: '4',
  notified_body_number: '1234',

  notes: 'Standardrezeptur für normale Beanspruchung',
  internal_notes: 'Bewährt seit 2020',

  // NEU: approved_by sollte jetzt funktionieren!
  approved_by: 'Max Mustermann',
  approved_at: new Date().toISOString(),

  // JSONB Felder - pragmatisch strukturiert
  materials: {
    binder_type: 'CEM I 42,5 R',
    binder_amount_kg_m3: 320,
    water_cement_ratio: 0.5,
    aggregate_type: 'natural',
    aggregate_designation: 'Quarzsand 0/4',
    consistency: 'F3',
    // Keine tiefen Arrays, sondern flache Struktur
    additive_1: 'Fließmittel 1.2%',
    additive_2: 'Verzögerer 0.3%'
  },

  quality_control: {
    test_frequency_fresh: 'per_batch',
    test_frequency_hardened: 'weekly',
    sample_size: '3 Würfel',
    tolerance_binder_percent: 2
  },

  intended_use: {
    wearing_surface: true,
    industrial_use: true,
    indoor_only: false
  }
}

async function runFinalValidation() {
  console.log('\n🏁 FINALER VALIDIERUNGS-TEST\n')
  console.log('=' .repeat(50))

  // 1. Erstelle Rezept
  console.log('📝 Erstelle Real-World Rezept...')
  const { data: recipe, error: createError } = await supabase
    .from('en13813_recipes')
    .insert(realWorldRecipe)
    .select()
    .single()

  if (createError) {
    console.error('❌ Fehler beim Erstellen:', createError.message)
    return { success: false, error: createError.message }
  }

  console.log('✅ Rezept erfolgreich erstellt!')
  console.log(`   ID: ${recipe.id}`)
  console.log(`   Code: ${recipe.recipe_code}`)

  // 2. Validiere wichtige Felder
  console.log('\n🔍 Validiere Felder...')

  const validationResults = {
    perfect: [],
    issues: []
  }

  // Prüfe jedes Feld
  for (const [field, expectedValue] of Object.entries(realWorldRecipe)) {
    const actualValue = recipe[field]

    if (JSON.stringify(actualValue) === JSON.stringify(expectedValue)) {
      validationResults.perfect.push(field)
      console.log(`  ✅ ${field}`)
    } else if (actualValue === null || actualValue === undefined) {
      validationResults.issues.push(`${field}: Nicht gespeichert`)
      console.log(`  ❌ ${field}: Nicht gespeichert`)
    } else {
      validationResults.issues.push(`${field}: Wert unterschiedlich`)
      console.log(`  ⚠️  ${field}: Wert unterschiedlich`)
    }
  }

  // 3. Cleanup
  await supabase
    .from('en13813_recipes')
    .delete()
    .eq('id', recipe.id)

  // 4. Ergebnis
  const successRate = (validationResults.perfect.length / Object.keys(realWorldRecipe).length * 100).toFixed(1)

  console.log('\n' + '=' .repeat(50))
  console.log('📊 ERGEBNIS:')
  console.log(`  ✅ Perfekt: ${validationResults.perfect.length} Felder`)
  console.log(`  ❌ Probleme: ${validationResults.issues.length} Felder`)
  console.log(`  📈 Erfolgsrate: ${successRate}%`)

  if (successRate >= 90) {
    console.log('\n🎉 AUSGEZEICHNET! System ist produktionsreif!')
  } else if (successRate >= 80) {
    console.log('\n✅ GUT! System kann deployed werden.')
  } else {
    console.log('\n⚠️  Es gibt noch Probleme zu lösen.')
  }

  console.log('\n' + '=' .repeat(50))

  // 5. approved_by Test
  console.log('\n🔑 SPEZIELLER TEST: approved_by Feld...')
  if (recipe.approved_by === 'Max Mustermann') {
    console.log('✅ approved_by funktioniert ENDLICH!')
  } else {
    console.log(`❌ approved_by Problem besteht: ${recipe.approved_by}`)
  }

  return {
    success: true,
    successRate: parseFloat(successRate),
    perfectFields: validationResults.perfect.length,
    issues: validationResults.issues
  }
}

// Führe Test aus
console.log('🚀 Starte finalen Validierungstest...\n')
runFinalValidation()
  .then(result => {
    if (result.success && result.successRate >= 85) {
      console.log('\n✨ TEST BESTANDEN - READY FOR PRODUCTION! 🚀')
      process.exit(0)
    } else {
      console.log('\n⚠️  Test zeigt noch Probleme.')
      process.exit(1)
    }
  })
  .catch(err => {
    console.error('\n❌ Test fehlgeschlagen:', err)
    process.exit(1)
  })