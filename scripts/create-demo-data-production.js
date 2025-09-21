#!/usr/bin/env node

/**
 * Script zum Erstellen von Demo-Daten für EN13813 in der PRODUKTIVEN Supabase-Instanz
 * 
 * Verwendung:
 * 1. Erstellen Sie eine .env.production Datei mit Ihren produktiven Supabase-Credentials
 * 2. Führen Sie aus: node scripts/create-demo-data-production.js
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const { join } = require('path')
const readline = require('readline')
const fs = require('fs')

// Versuche zuerst .env.production zu laden
const prodEnvPath = join(__dirname, '../apps/web/.env.production')
if (fs.existsSync(prodEnvPath)) {
  dotenv.config({ path: prodEnvPath })
  console.log('✅ Verwende .env.production')
} else {
  console.log('⚠️  Keine .env.production gefunden')
  console.log('Erstellen Sie eine .env.production Datei mit folgenden Variablen:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...')
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJ...')
  console.log('\nOder geben Sie die Werte direkt ein:')
}

// Interface für Benutzereingabe
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function getSupabaseCredentials() {
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Falls nicht in env gefunden, frage den Benutzer
  if (!supabaseUrl) {
    console.log('\n📝 Bitte geben Sie Ihre Supabase-Credentials ein:')
    supabaseUrl = await question('Supabase URL (https://xxx.supabase.co): ')
    
    if (!supabaseUrl.startsWith('http')) {
      console.error('❌ Ungültige URL. Muss mit http:// oder https:// beginnen')
      process.exit(1)
    }
  }
  
  if (!supabaseServiceKey) {
    supabaseServiceKey = await question('Service Role Key (eyJ...): ')
    
    if (!supabaseServiceKey.startsWith('eyJ')) {
      console.error('❌ Ungültiger Service Role Key')
      process.exit(1)
    }
  }
  
  rl.close()
  return { supabaseUrl, supabaseServiceKey }
}

// Demo-Rezepturen Daten
const demoRecipes = [
  {
    recipe_code: 'CT-PROD-001',
    name: 'Premium Zementestrich CT-C30-F5',
    type: 'CT',
    compressive_strength_class: 'C30',
    flexural_strength_class: 'F5',
    wear_resistance_class: 'A15',
    fire_class: 'A1fl',
    additives: ['Fließmittel', 'Verzögerer', 'Fasern'],
    special_properties: {
      application: 'Industrieboden',
      thickness: '50-80mm',
      strength_development: '28 Tage',
      surface_treatment: 'Hartstoffeinstreuung möglich'
    },
    status: 'active'
  },
  {
    recipe_code: 'CA-PROD-002',
    name: 'Fließestrich CAF Heizestrich Premium',
    type: 'CA',
    compressive_strength_class: 'C35',
    flexural_strength_class: 'F7',
    fire_class: 'A1fl',
    additives: ['Verflüssiger', 'Entschäumer', 'Beschleuniger'],
    special_properties: {
      application: 'Fußbodenheizung',
      pumpable: true,
      thermal_conductivity: '1.4 W/mK',
      drying_time: 'Schnelltrocknend'
    },
    status: 'active'
  },
  {
    recipe_code: 'MA-PROD-003',
    name: 'Magnesiaestrich MA Klassik',
    type: 'MA',
    compressive_strength_class: 'C40',
    flexural_strength_class: 'F7',
    fire_class: 'A1fl',
    additives: ['MgCl2-Lösung', 'Holzmehl', 'Farbpigmente'],
    special_properties: {
      application: 'Historische Gebäude',
      ecological: true,
      diffusion_open: true,
      surface_hardness: 'SH100'
    },
    status: 'active'
  },
  {
    recipe_code: 'SR-PROD-004',
    name: 'Epoxidharz-Beschichtung Heavy Duty',
    type: 'SR',
    compressive_strength_class: 'B2.0',
    flexural_strength_class: 'IR20',
    wear_resistance_class: 'AR0.5',
    fire_class: 'Bfl-s1',
    additives: ['Härter', 'Pigmente', 'Antistatikum'],
    special_properties: {
      application: 'Produktionshalle',
      chemical_resistant: true,
      bond_strength: 'B2.0',
      esd_protection: true
    },
    status: 'active'
  },
  {
    recipe_code: 'AS-PROD-005',
    name: 'Gussasphalt AS Industrial',
    type: 'AS',
    compressive_strength_class: 'IC40',
    flexural_strength_class: 'IP10',
    fire_class: 'Bfl-s1',
    additives: ['SBS-Polymer', 'Füller', 'Haftvermittler'],
    special_properties: {
      application: 'Parkhaus/Industriefläche',
      waterproof: true,
      indentation_class: 'IC40',
      oil_resistant: true
    },
    status: 'active'
  }
]

async function createDemoData() {
  try {
    console.log('🚀 Starte Erstellung der Demo-Daten für PRODUKTION...\n')
    
    // Hole Credentials
    const { supabaseUrl, supabaseServiceKey } = await getSupabaseCredentials()
    
    console.log(`\n🔗 Verbinde mit: ${supabaseUrl}`)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Teste Verbindung
    console.log('🔍 Teste Datenbankverbindung...')
    const { data: testData, error: testError } = await supabase
      .from('en13813_recipes')
      .select('count')
      .limit(0)
    
    if (testError) {
      console.error('❌ Verbindung fehlgeschlagen:', testError.message)
      console.log('\nMögliche Ursachen:')
      console.log('1. Falsche URL oder Service Key')
      console.log('2. Tabelle en13813_recipes existiert nicht')
      console.log('3. RLS (Row Level Security) blockiert Zugriff')
      process.exit(1)
    }
    
    console.log('✅ Verbindung erfolgreich!\n')
    
    // Automatisch bestätigen für Script-Ausführung
    console.log(`
⚠️  WARNUNG: Erstelle Demo-Daten in PRODUKTIVER Datenbank!
   URL: ${supabaseUrl}
   
   Fortfahren...`)
    
    // Lösche vorhandene Demo-Daten
    console.log('\n🗑️  Lösche vorhandene Demo-Rezepturen...')
    for (const recipe of demoRecipes) {
      const { error } = await supabase
        .from('en13813_recipes')
        .delete()
        .eq('recipe_code', recipe.recipe_code)
      
      if (error && error.code !== 'PGRST116') {
        console.warn(`  ⚠️  Fehler beim Löschen von ${recipe.recipe_code}:`, error.message)
      }
    }
    console.log('✅ Bereinigung abgeschlossen\n')
    
    // Erstelle neue Rezepturen
    console.log('📝 Erstelle neue Rezepturen...')
    let successCount = 0
    let errorCount = 0
    const createdRecipes = []
    
    for (const recipeData of demoRecipes) {
      console.log(`\n🔄 Verarbeite: ${recipeData.name}`)
      
      // Erstelle Rezeptur
      const { data: createdRecipe, error: recipeError } = await supabase
        .from('en13813_recipes')
        .insert(recipeData)
        .select()
        .single()
      
      if (recipeError) {
        console.error(`  ❌ Fehler:`, recipeError.message)
        errorCount++
        continue
      }
      
      console.log(`  ✅ Rezeptur erstellt (ID: ${createdRecipe.id})`)
      createdRecipes.push(createdRecipe)
      successCount++
      
      // Erstelle Materialzusammensetzung
      await createMaterials(supabase, createdRecipe.id, recipeData.type)
      
      // Erstelle ITT Tests
      await createITTTests(supabase, createdRecipe.id, recipeData.type)
      
      // Erstelle FPC Plan
      await createFPCPlan(supabase, createdRecipe.id, recipeData.name)
      
      // Erstelle Compliance Tasks
      await createComplianceTasks(supabase, createdRecipe.id, recipeData.name)
    }
    
    // Zusammenfassung
    console.log('\n' + '='.repeat(60))
    console.log('✨ Demo-Daten Erstellung abgeschlossen!')
    console.log('='.repeat(60))
    console.log(`\n📊 Ergebnis:`)
    console.log(`   ✅ ${successCount} Rezepturen erfolgreich erstellt`)
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} Rezepturen fehlgeschlagen`)
    }
    
    if (createdRecipes.length > 0) {
      console.log('\n📋 Erstellte Rezepturen:')
      createdRecipes.forEach(r => {
        console.log(`   - [${r.type}] ${r.recipe_code}: ${r.name}`)
      })
    }
    
    console.log('\n✅ Script erfolgreich abgeschlossen!')
    console.log('🌐 Die Demo-Daten sind jetzt in Ihrer Produktivumgebung verfügbar.')
    
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Hilfsfunktionen
async function createMaterials(supabase, recipeId, type) {
  const materials = {
    recipe_id: recipeId,
    binder_type: getBinder(type).type,
    binder_designation: getBinder(type).designation,
    binder_amount_kg_m3: getBinder(type).amount,
    water_binder_ratio: getBinder(type).water_ratio,
    additives: getAdditives(type)
  }
  
  const { error } = await supabase
    .from('en13813_recipe_materials')
    .insert(materials)
  
  if (!error) {
    console.log(`  ✅ Materialzusammensetzung erstellt`)
  } else if (error.code !== 'PGRST205') {
    console.warn(`  ⚠️  Material-Fehler:`, error.message)
  }
}

async function createITTTests(supabase, recipeId, type) {
  const tests = {
    recipe_id: recipeId,
    required_tests: getRequiredTests(type),
    test_status: 'completed',
    test_results: {
      test_date: new Date().toISOString().split('T')[0],
      laboratory: 'Demo Prüflabor GmbH',
      certificate_number: `DEMO-${type}-${Date.now()}`
    }
  }
  
  const { error } = await supabase
    .from('en13813_itt_test_plans')
    .insert(tests)
  
  if (!error) {
    console.log(`  ✅ ITT Test Plan erstellt`)
  } else if (error.code !== 'PGRST205') {
    console.warn(`  ⚠️  ITT-Fehler:`, error.message)
  }
}

async function createFPCPlan(supabase, recipeId, recipeName) {
  const fpcPlan = {
    recipe_id: recipeId,
    control_frequency: {
      raw_materials: 'Täglich',
      fresh_mortar: 'Je Charge',
      hardened_properties: 'Wöchentlich',
      documentation: 'Monatlich'
    },
    control_parameters: {
      binder_quality: ['Zertifikat', 'Stichprobenanalyse'],
      consistency: ['Ausbreitmaß', 'Fließmaß'],
      strength: ['7d', '28d'],
      surface_quality: ['Ebenheit', 'Oberflächenhärte']
    },
    acceptance_criteria: {
      strength_tolerance: '±10%',
      consistency_range: '±20mm',
      density_tolerance: '±50 kg/m³'
    }
  }
  
  const { error } = await supabase
    .from('en13813_fpc_control_plans')
    .insert(fpcPlan)
  
  if (!error) {
    console.log(`  ✅ FPC Control Plan erstellt`)
  } else if (error.code !== 'PGRST205') {
    console.warn(`  ⚠️  FPC-Fehler:`, error.message)
  }
}

async function createComplianceTasks(supabase, recipeId, recipeName) {
  const tasks = [
    {
      recipe_id: recipeId,
      task_type: 'itt_review',
      description: `Jährliche ITT-Überprüfung: ${recipeName}`,
      due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      priority: 'medium'
    },
    {
      recipe_id: recipeId,
      task_type: 'fpc_audit',
      description: `Vierteljährliches FPC-Audit: ${recipeName}`,
      due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      priority: 'high'
    },
    {
      recipe_id: recipeId,
      task_type: 'document_update',
      description: `DoP-Aktualisierung prüfen: ${recipeName}`,
      due_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      priority: 'low'
    }
  ]
  
  const { error } = await supabase
    .from('en13813_compliance_tasks')
    .insert(tasks)
  
  if (!error) {
    console.log(`  ✅ Compliance Tasks erstellt`)
  } else if (error.code !== 'PGRST205') {
    console.warn(`  ⚠️  Task-Fehler:`, error.message)
  }
}

function getBinder(type) {
  const binders = {
    'CT': { type: 'Zement', designation: 'CEM II/B-S 32,5 R', amount: 340, water_ratio: 0.55 },
    'CA': { type: 'Calciumsulfat', designation: 'Alpha-Halbhydrat CAB 30', amount: 395, water_ratio: 0.38 },
    'MA': { type: 'Magnesiumoxid', designation: 'MgO 90', amount: 260, water_ratio: 2.5 },
    'SR': { type: 'Epoxidharz', designation: 'EP-2K-100', amount: 480, water_ratio: 0 },
    'AS': { type: 'Bitumen', designation: 'B 20/30 modifiziert', amount: 165, water_ratio: 0 }
  }
  return binders[type] || binders['CT']
}

function getAdditives(type) {
  const additives = {
    'CT': [
      { name: 'Fließmittel PCE', dosage: '0.8%', function: 'Verarbeitbarkeit' },
      { name: 'Verzögerer', dosage: '0.2%', function: 'Verarbeitungszeit' }
    ],
    'CA': [
      { name: 'Verflüssiger', dosage: '0.5%', function: 'Fließfähigkeit' },
      { name: 'Entschäumer', dosage: '0.02%', function: 'Luftporenreduzierung' }
    ],
    'MA': [
      { name: 'MgCl2-Lösung', concentration: '22°Bé', function: 'Bindemittelaktivierung' }
    ],
    'SR': [
      { name: 'Aminischer Härter', ratio: '2:1', function: 'Aushärtung' }
    ],
    'AS': [
      { name: 'SBS-Polymer', dosage: '3%', function: 'Flexibilisierung' }
    ]
  }
  return additives[type] || []
}

function getRequiredTests(type) {
  const tests = {
    'CT': [
      { test: 'Druckfestigkeit', standard: 'EN 13892-2', unit: 'N/mm²' },
      { test: 'Biegezugfestigkeit', standard: 'EN 13892-2', unit: 'N/mm²' },
      { test: 'Verschleiß nach Böhme', standard: 'EN 13892-3', unit: 'cm³/50cm²' }
    ],
    'CA': [
      { test: 'Druckfestigkeit', standard: 'EN 13892-2', unit: 'N/mm²' },
      { test: 'Biegezugfestigkeit', standard: 'EN 13892-2', unit: 'N/mm²' },
      { test: 'Schwindmaß', standard: 'EN 13454-2', unit: 'mm/m' }
    ],
    'MA': [
      { test: 'Druckfestigkeit', standard: 'EN 13892-2', unit: 'N/mm²' },
      { test: 'Biegezugfestigkeit', standard: 'EN 13892-2', unit: 'N/mm²' },
      { test: 'Oberflächenhärte', standard: 'EN 13892-6', unit: 'N/mm²' }
    ],
    'SR': [
      { test: 'Haftzugfestigkeit', standard: 'EN 13892-8', unit: 'N/mm²' },
      { test: 'Verschleiß BCA', standard: 'EN 13892-4', unit: 'μm' },
      { test: 'Schlagfestigkeit', standard: 'EN ISO 6272-1', unit: 'Nm' }
    ],
    'AS': [
      { test: 'Eindringtiefe', standard: 'EN 13892-5', unit: 'mm' },
      { test: 'Stempeleindringversuch', standard: 'EN 12697-20', unit: 'mm' }
    ]
  }
  return tests[type] || []
}

// Starte das Script
createDemoData()