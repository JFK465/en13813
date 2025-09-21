#!/usr/bin/env node

/**
 * Standalone Script zum Erstellen von Demo-Daten für EN13813
 * Funktioniert ohne tenants/profiles Tabellen
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const { join } = require('path')
const { randomUUID } = require('crypto')

// Lade Umgebungsvariablen
dotenv.config({ path: join(__dirname, '../apps/web/.env.development') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Fehlende Umgebungsvariablen: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Demo-Rezepturen Daten (vereinfacht ohne tenant_id)
const demoRecipes = [
  {
    recipe_code: 'CT-DEMO-001',
    name: 'Premium Zementestrich CT-C30-F5',
    type: 'CT',
    compressive_strength_class: 'C30',
    flexural_strength_class: 'F5',
    wear_resistance_class: 'A15',
    fire_class: 'A1fl',
    additives: ['Fließmittel', 'Verzögerer'],
    special_properties: {
      application: 'Industrieboden',
      thickness: '50-80mm',
      strength_development: '28 Tage'
    },
    status: 'active'
  },
  {
    recipe_code: 'CA-DEMO-002',
    name: 'Fließestrich CAF Heizestrich',
    type: 'CA',
    compressive_strength_class: 'C35',
    flexural_strength_class: 'F7',
    fire_class: 'A1fl',
    additives: ['Verflüssiger', 'Entschäumer'],
    special_properties: {
      application: 'Heizestrich',
      pumpable: true,
      thermal_conductivity: '1.4 W/mK'
    },
    status: 'active'
  },
  {
    recipe_code: 'MA-DEMO-003',
    name: 'Magnesiaestrich MA-C40-F7',
    type: 'MA',
    compressive_strength_class: 'C40',
    flexural_strength_class: 'F7',
    fire_class: 'A1fl',
    additives: ['MgCl2-Lösung', 'Holzmehl'],
    special_properties: {
      application: 'Historische Gebäude',
      ecological: true,
      diffusion_open: true
    },
    status: 'active'
  },
  {
    recipe_code: 'SR-DEMO-004',
    name: 'Epoxidharz-Estrich SR',
    type: 'SR',
    compressive_strength_class: 'B2.0',
    flexural_strength_class: 'IR20',
    wear_resistance_class: 'AR0.5',
    fire_class: 'Bfl-s1',
    additives: ['Härter', 'Pigmente'],
    special_properties: {
      application: 'Chemische Industrie',
      chemical_resistant: true,
      bond_strength: 'B2.0'
    },
    status: 'active'
  },
  {
    recipe_code: 'AS-DEMO-005',
    name: 'Gussasphalt AS',
    type: 'AS',
    compressive_strength_class: 'IC40',
    flexural_strength_class: 'IP10',
    fire_class: 'Bfl-s1',
    additives: ['Polymer-Modifier', 'Füller'],
    special_properties: {
      application: 'Parkhaus',
      waterproof: true,
      indentation_class: 'IC40'
    },
    status: 'active'
  }
]

async function createDemoData() {
  try {
    console.log('🚀 Starte Erstellung der Demo-Daten (Standalone)...\n')
    
    // Verwende feste Demo-IDs
    const demoTenantId = 'a1111111-1111-1111-1111-111111111111'
    const demoUserId = 'b2222222-2222-2222-2222-222222222222'
    
    // 1. Lösche vorhandene Demo-Daten (basierend auf recipe_code)
    console.log('🗑️  Lösche vorhandene Demo-Rezepturen...')
    for (const recipe of demoRecipes) {
      const { error } = await supabase
        .from('en13813_recipes')
        .delete()
        .eq('recipe_code', recipe.recipe_code)
      
      if (error && error.code !== 'PGRST116') { // Ignoriere "no rows returned"
        console.warn(`  ⚠️  Fehler beim Löschen von ${recipe.recipe_code}:`, error.message)
      }
    }
    console.log('✅ Bereinigung abgeschlossen\n')
    
    // 2. Erstelle neue Rezepturen
    console.log('📝 Erstelle neue Rezepturen...')
    let successCount = 0
    let errorCount = 0
    
    for (const recipeData of demoRecipes) {
      console.log(`\n🔄 Verarbeite: ${recipeData.name}`)
      
      // Füge tenant_id und created_by hinzu (falls Spalten existieren)
      const recipe = {
        ...recipeData,
        tenant_id: demoTenantId,
        created_by: demoUserId
      }
      
      // Erstelle Rezeptur
      const { data: createdRecipe, error: recipeError } = await supabase
        .from('en13813_recipes')
        .insert(recipe)
        .select()
        .single()
      
      if (recipeError) {
        // Versuche es ohne tenant_id und created_by
        console.log(`  ⚠️  Fehler mit tenant_id, versuche ohne...`)
        const { tenant_id, created_by, ...recipeWithoutTenant } = recipe
        
        const { data: retryRecipe, error: retryError } = await supabase
          .from('en13813_recipes')
          .insert(recipeWithoutTenant)
          .select()
          .single()
        
        if (retryError) {
          console.error(`  ❌ Fehler bei ${recipeData.name}:`, retryError.message)
          errorCount++
          continue
        } else {
          console.log(`  ✅ Rezeptur erstellt (ID: ${retryRecipe.id})`)
          successCount++
          
          // Versuche Materialzusammensetzung zu erstellen
          await createMaterials(retryRecipe.id, recipeData.type, null)
          
          // Versuche ITT Tests zu erstellen
          await createITTTests(retryRecipe.id, recipeData.type, null)
          
          // Versuche FPC Plan zu erstellen
          await createFPCPlan(retryRecipe.id, recipeData.name, null)
        }
      } else {
        console.log(`  ✅ Rezeptur erstellt (ID: ${createdRecipe.id})`)
        successCount++
        
        // Versuche weitere Daten zu erstellen
        await createMaterials(createdRecipe.id, recipeData.type, demoTenantId)
        await createITTTests(createdRecipe.id, recipeData.type, demoTenantId)
        await createFPCPlan(createdRecipe.id, recipeData.name, demoTenantId)
      }
    }
    
    // 3. Zusammenfassung
    console.log('\n' + '='.repeat(50))
    console.log('✨ Demo-Daten Erstellung abgeschlossen!')
    console.log('='.repeat(50))
    console.log(`\n📊 Ergebnis:`)
    console.log(`   ✅ ${successCount} Rezepturen erfolgreich erstellt`)
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} Rezepturen fehlgeschlagen`)
    }
    
    // Zeige erstellte Rezepturen
    const { data: recipes, error: listError } = await supabase
      .from('en13813_recipes')
      .select('recipe_code, name, type, status')
      .in('recipe_code', demoRecipes.map(r => r.recipe_code))
    
    if (recipes && recipes.length > 0) {
      console.log('\n📋 Erstellte Rezepturen:')
      recipes.forEach(r => {
        console.log(`   - [${r.type}] ${r.recipe_code}: ${r.name} (${r.status})`)
      })
    }
    
    console.log('\n✅ Script erfolgreich abgeschlossen!')
    
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error)
    process.exit(1)
  }
}

// Hilfsfunktionen für zusätzliche Tabellen
async function createMaterials(recipeId, type, tenantId) {
  // Prüfe ob Tabelle existiert
  const { error: checkError } = await supabase
    .from('en13813_recipe_materials')
    .select('id')
    .limit(0)
  
  if (checkError && checkError.code === 'PGRST205') {
    console.log(`  ℹ️  Tabelle 'en13813_recipe_materials' existiert nicht`)
    return
  }
  
  const materials = {
    recipe_id: recipeId,
    tenant_id: tenantId,
    binder_type: getBinder(type).type,
    binder_designation: getBinder(type).designation,
    binder_amount_kg_m3: getBinder(type).amount,
    water_binder_ratio: getBinder(type).water_ratio
  }
  
  const { error } = await supabase
    .from('en13813_recipe_materials')
    .insert(materials)
  
  if (error) {
    // Versuche ohne tenant_id
    const { tenant_id, ...materialsWithoutTenant } = materials
    const { error: retryError } = await supabase
      .from('en13813_recipe_materials')
      .insert(materialsWithoutTenant)
    
    if (!retryError) {
      console.log(`  ✅ Materialzusammensetzung erstellt`)
    }
  } else {
    console.log(`  ✅ Materialzusammensetzung erstellt`)
  }
}

async function createITTTests(recipeId, type, tenantId) {
  // Prüfe ob Tabelle existiert
  const { error: checkError } = await supabase
    .from('en13813_itt_test_plans')
    .select('id')
    .limit(0)
  
  if (checkError && checkError.code === 'PGRST205') {
    console.log(`  ℹ️  Tabelle 'en13813_itt_test_plans' existiert nicht`)
    return
  }
  
  const tests = {
    recipe_id: recipeId,
    tenant_id: tenantId,
    required_tests: getRequiredTests(type),
    test_status: 'completed'
  }
  
  const { error } = await supabase
    .from('en13813_itt_test_plans')
    .insert(tests)
  
  if (error) {
    // Versuche ohne tenant_id
    const { tenant_id, ...testsWithoutTenant } = tests
    const { error: retryError } = await supabase
      .from('en13813_itt_test_plans')
      .insert(testsWithoutTenant)
    
    if (!retryError) {
      console.log(`  ✅ ITT Test Plan erstellt`)
    }
  } else {
    console.log(`  ✅ ITT Test Plan erstellt`)
  }
}

async function createFPCPlan(recipeId, recipeName, tenantId) {
  // Prüfe ob Tabelle existiert
  const { error: checkError } = await supabase
    .from('en13813_fpc_control_plans')
    .select('id')
    .limit(0)
  
  if (checkError && checkError.code === 'PGRST205') {
    console.log(`  ℹ️  Tabelle 'en13813_fpc_control_plans' existiert nicht`)
    return
  }
  
  const fpcPlan = {
    recipe_id: recipeId,
    tenant_id: tenantId,
    control_frequency: {
      raw_materials: 'Täglich',
      fresh_mortar: 'Je Charge',
      hardened_properties: 'Wöchentlich'
    },
    control_parameters: {
      binder_quality: ['Zertifikat'],
      consistency: ['Ausbreitmaß'],
      strength: ['7d', '28d']
    },
    acceptance_criteria: {
      strength_tolerance: '±10%',
      consistency_range: '±20mm'
    }
  }
  
  const { error } = await supabase
    .from('en13813_fpc_control_plans')
    .insert(fpcPlan)
  
  if (error) {
    // Versuche ohne tenant_id
    const { tenant_id, ...planWithoutTenant } = fpcPlan
    const { error: retryError } = await supabase
      .from('en13813_fpc_control_plans')
      .insert(planWithoutTenant)
    
    if (!retryError) {
      console.log(`  ✅ FPC Control Plan erstellt`)
    }
  } else {
    console.log(`  ✅ FPC Control Plan erstellt`)
  }
}

// Hilfsfunktionen für typ-spezifische Daten
function getBinder(type) {
  const binders = {
    'CT': { type: 'Zement', designation: 'CEM II/B-S 32,5 R', amount: 340, water_ratio: 0.55 },
    'CA': { type: 'Calciumsulfat', designation: 'Alpha-Halbhydrat CAB 30', amount: 395, water_ratio: 0.38 },
    'MA': { type: 'Magnesiumoxid', designation: 'MgO 90', amount: 260, water_ratio: 2.5 },
    'SR': { type: 'Epoxidharz', designation: 'EP-2K-100', amount: 480, water_ratio: 0 },
    'AS': { type: 'Bitumen', designation: 'B 20/30', amount: 165, water_ratio: 0 }
  }
  return binders[type] || binders['CT']
}

function getRequiredTests(type) {
  const tests = {
    'CT': [
      { test: 'Druckfestigkeit', standard: 'EN 13892-2' },
      { test: 'Biegezugfestigkeit', standard: 'EN 13892-2' },
      { test: 'Verschleiß Böhme', standard: 'EN 13892-3' }
    ],
    'CA': [
      { test: 'Druckfestigkeit', standard: 'EN 13892-2' },
      { test: 'Biegezugfestigkeit', standard: 'EN 13892-2' }
    ],
    'MA': [
      { test: 'Druckfestigkeit', standard: 'EN 13892-2' },
      { test: 'Biegezugfestigkeit', standard: 'EN 13892-2' },
      { test: 'Oberflächenhärte', standard: 'EN 13892-6' }
    ],
    'SR': [
      { test: 'Haftzugfestigkeit', standard: 'EN 13892-8' },
      { test: 'Verschleiß BCA', standard: 'EN 13892-4' }
    ],
    'AS': [
      { test: 'Eindringtiefe', standard: 'EN 13892-5' }
    ]
  }
  return tests[type] || []
}

// Führe Script aus
createDemoData()