#!/usr/bin/env node

/**
 * Script zum Erstellen von Demo-Daten für EN13813 über Supabase API
 * Verwendung: node scripts/create-demo-data.js
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const { join } = require('path')

// Lade Umgebungsvariablen
dotenv.config({ path: join(__dirname, '../apps/web/.env.development') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Fehlende Umgebungsvariablen: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Demo-Rezepturen Daten
const demoRecipes = [
  {
    recipe_code: 'CT-DEMO-001',
    name: 'Premium Zementestrich CT-C30-F5',
    type: 'CT',
    description: 'Hochbelastbarer Zementestrich für Industrieböden',
    manufacturer: 'Demo Estrich GmbH',
    production_site: 'Werk Berlin',
    product_designation: 'CT-C30-F5-A15',
    ce_marking_year: 2024,
    standard_reference: 'EN 13813:2002',
    avcp_system: 'System 4',
    compressive_strength_class: 'C30',
    flexural_strength_class: 'F5',
    wear_resistance_bohme_class: 'A15',
    wear_resistance_method: 'bohme',
    fire_class: 'A1fl',
    release_of_corrosive_substances: 'CA',
    rwfc_class: 'RWFC350',
    intended_use: {
      wearing_surface: true,
      with_flooring: false,
      location: 'Industriehalle'
    },
    dop_number: '2024-CT-001',
    status: 'published',
    materials: {
      binder_type: 'Zement',
      binder_designation: 'CEM II/B-S 32,5 R',
      binder_amount_kg_m3: 340,
      binder_percentage: 15.5,
      water_binder_ratio: 0.55,
      aggregates: [
        { material: 'Quarzsand 0-2mm', percentage: 35 },
        { material: 'Quarzsand 2-4mm', percentage: 25 },
        { material: 'Kies 4-8mm', percentage: 24.5 }
      ],
      additives: [
        { type: 'Fließmittel', dosage: 0.8 },
        { type: 'Verzögerer', dosage: 0.2 }
      ]
    },
    itt_tests: {
      required_tests: [
        { test: 'Druckfestigkeit', standard: 'EN 13892-2', result: '32.5 N/mm²', class: 'C30' },
        { test: 'Biegezugfestigkeit', standard: 'EN 13892-2', result: '5.8 N/mm²', class: 'F5' },
        { test: 'Verschleiß Böhme', standard: 'EN 13892-3', result: '14.2 cm³/50cm²', class: 'A15' }
      ],
      test_status: 'completed'
    }
  },
  {
    recipe_code: 'CA-DEMO-002',
    name: 'Fließestrich CAF Heizestrich',
    type: 'CA',
    description: 'Calciumsulfat-Fließestrich für Fußbodenheizung',
    manufacturer: 'Demo Estrich GmbH',
    production_site: 'Werk München',
    product_designation: 'CA-C35-F7-H',
    ce_marking_year: 2024,
    standard_reference: 'EN 13813:2002',
    avcp_system: 'System 4',
    compressive_strength_class: 'C35',
    flexural_strength_class: 'F7',
    fire_class: 'A1fl',
    release_of_corrosive_substances: 'CA',
    thermal_conductivity_w_mk: 1.4,
    intended_use: {
      wearing_surface: false,
      with_flooring: true,
      heated_screed: true,
      location: 'Wohnbereich'
    },
    dop_number: '2024-CA-002',
    status: 'published',
    materials: {
      binder_type: 'Calciumsulfat',
      binder_designation: 'Alpha-Halbhydrat CAB 30',
      binder_amount_kg_m3: 395,
      binder_percentage: 18.0,
      water_binder_ratio: 0.38,
      aggregates: [
        { material: 'Quarzsand 0-4mm', percentage: 60 },
        { material: 'Kalksteinmehl', percentage: 21.38 }
      ],
      additives: [
        { type: 'Verflüssiger', dosage: 0.5 },
        { type: 'Entschäumer', dosage: 0.02 }
      ]
    },
    itt_tests: {
      required_tests: [
        { test: 'Druckfestigkeit', standard: 'EN 13892-2', result: '37.2 N/mm²', class: 'C35' },
        { test: 'Biegezugfestigkeit', standard: 'EN 13892-2', result: '7.5 N/mm²', class: 'F7' }
      ],
      test_status: 'completed'
    }
  },
  {
    recipe_code: 'AS-DEMO-003',
    name: 'Gussasphalt AS Industrie',
    type: 'AS',
    description: 'Gussasphaltestrich für Industrieflächen',
    manufacturer: 'Demo Estrich GmbH',
    production_site: 'Werk Hamburg',
    product_designation: 'AS-IC40',
    ce_marking_year: 2024,
    standard_reference: 'EN 13813:2002',
    avcp_system: 'System 4',
    compressive_strength_class: 'IC40',
    flexural_strength_class: 'IP10',
    indentation_class: 'IC40',
    fire_class: 'Bfl-s1',
    release_of_corrosive_substances: 'CA',
    chemical_resistance: 'CR',
    intended_use: {
      wearing_surface: true,
      with_flooring: false,
      location: 'Parkhaus'
    },
    dop_number: '2024-AS-003',
    status: 'published',
    materials: {
      binder_type: 'Bitumen',
      binder_designation: 'B 20/30',
      binder_amount_kg_m3: 165,
      binder_percentage: 7.5,
      water_binder_ratio: 0,
      aggregates: [
        { material: 'Basalt 0-2mm', percentage: 20 },
        { material: 'Basalt 2-5mm', percentage: 24.5 },
        { material: 'Basalt 5-8mm', percentage: 20 }
      ],
      additives: [
        { type: 'Polymer-Modifier', dosage: 3.0 },
        { type: 'Füller', dosage: 25 }
      ]
    },
    itt_tests: {
      required_tests: [
        { test: 'Eindringtiefe', standard: 'EN 13892-5', result: 'IC40' }
      ],
      test_status: 'completed'
    }
  },
  {
    recipe_code: 'SR-DEMO-004',
    name: 'Epoxidharz SR Heavy Duty',
    type: 'SR',
    description: 'Epoxidharzbeschichtung für Produktionshallen',
    manufacturer: 'Demo Estrich GmbH',
    production_site: 'Werk Frankfurt',
    product_designation: 'SR-B2.0-IR20-AR0.5',
    ce_marking_year: 2024,
    standard_reference: 'EN 13813:2002',
    avcp_system: 'System 3',
    compressive_strength_class: 'B2.0',
    flexural_strength_class: 'IR20',
    bond_strength_class: 'B2.0',
    impact_resistance_class: 'IR20',
    wear_resistance_bca_class: 'AR0.5',
    wear_resistance_method: 'bca',
    fire_class: 'Bfl-s1',
    release_of_corrosive_substances: 'CA',
    chemical_resistance: 'CR',
    intended_use: {
      wearing_surface: true,
      with_flooring: false,
      location: 'Produktionshalle',
      special_requirements: ['Chemikalienbeständig', 'ESD-Schutz']
    },
    dop_number: '2024-SR-004',
    notified_body: {
      number: '0756',
      name: 'KIWA',
      test_report: 'K-2024-0789',
      test_date: '2024-02-20'
    },
    status: 'published',
    materials: {
      binder_type: 'Epoxidharz',
      binder_designation: 'EP-2K-100',
      binder_amount_kg_m3: 480,
      binder_percentage: 22.0,
      water_binder_ratio: 0,
      aggregates: [
        { material: 'Quarzsand 0.1-0.3mm', percentage: 30 },
        { material: 'Quarzsand 0.3-0.8mm', percentage: 44.5 }
      ],
      additives: [
        { type: 'Härter', ratio: '2:1' },
        { type: 'Pigmente', dosage: 2.0 }
      ]
    },
    itt_tests: {
      required_tests: [
        { test: 'Haftzugfestigkeit', standard: 'EN 13892-8', result: '2.2 N/mm²', class: 'B2.0' },
        { test: 'Verschleiß BCA', standard: 'EN 13892-4', result: 'AR0.5' }
      ],
      test_status: 'completed'
    }
  },
  {
    recipe_code: 'MA-DEMO-005',
    name: 'Steinholzestrich MA Klassik',
    type: 'MA',
    description: 'Magnesiaestrich für historische Gebäude',
    manufacturer: 'Demo Estrich GmbH',
    production_site: 'Werk Leipzig',
    product_designation: 'MA-C40-F7-SH100',
    ce_marking_year: 2024,
    standard_reference: 'EN 13813:2002',
    avcp_system: 'System 4',
    compressive_strength_class: 'C40',
    flexural_strength_class: 'F7',
    surface_hardness_class: 'SH100',
    fire_class: 'A1fl',
    release_of_corrosive_substances: 'CA',
    intended_use: {
      wearing_surface: false,
      with_flooring: true,
      location: 'Historisches Gebäude',
      special_requirements: ['Diffusionsoffen', 'Ökologisch']
    },
    dop_number: '2024-MA-005',
    status: 'published',
    materials: {
      binder_type: 'Magnesiumoxid',
      binder_designation: 'MgO 90',
      binder_amount_kg_m3: 260,
      binder_percentage: 12.0,
      water_binder_ratio: 2.5,
      aggregates: [
        { material: 'Quarzsand 0-2mm', percentage: 40 },
        { material: 'Holzspäne 2-4mm', percentage: 32 }
      ],
      additives: [
        { type: 'MgCl2-Lösung', concentration: '22°Bé', ratio: 2.5 },
        { type: 'Holzmehl', dosage: 15 }
      ]
    },
    itt_tests: {
      required_tests: [
        { test: 'Druckfestigkeit', standard: 'EN 13892-2', result: '42.1 N/mm²', class: 'C40' },
        { test: 'Biegezugfestigkeit', standard: 'EN 13892-2', result: '7.8 N/mm²', class: 'F7' },
        { test: 'Oberflächenhärte', standard: 'EN 13892-6', result: '105 N/mm²', class: 'SH100' }
      ],
      test_status: 'completed'
    }
  }
]

async function createDemoData() {
  try {
    console.log('🚀 Starte Erstellung der Demo-Daten...\n')
    
    // 1. Hole Demo-Tenant
    console.log('📋 Suche Demo-Tenant...')
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, slug, company_name')
      .eq('slug', 'demo')
      .single()
    
    if (tenantError || !tenant) {
      console.error('❌ Demo-Tenant nicht gefunden:', tenantError)
      process.exit(1)
    }
    console.log(`✅ Demo-Tenant gefunden: ${tenant.company_name} (${tenant.id})\n`)
    
    // 2. Hole Demo-User
    console.log('👤 Suche Demo-Benutzer...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'demo@example.com')
      .single()
    
    if (profileError || !profile) {
      console.error('❌ Demo-Benutzer nicht gefunden:', profileError)
      process.exit(1)
    }
    console.log(`✅ Demo-Benutzer gefunden: ${profile.full_name} (${profile.email})\n`)
    
    // 3. Lösche vorhandene Demo-Daten
    console.log('🗑️  Lösche vorhandene Demo-Rezepturen...')
    const { error: deleteError } = await supabase
      .from('en13813_recipes')
      .delete()
      .eq('tenant_id', tenant.id)
    
    if (deleteError) {
      console.error('⚠️  Fehler beim Löschen:', deleteError.message)
    } else {
      console.log('✅ Vorhandene Demo-Daten gelöscht\n')
    }
    
    // 4. Erstelle neue Rezepturen
    console.log('📝 Erstelle neue Rezepturen...')
    
    for (const recipeData of demoRecipes) {
      console.log(`\n🔄 Verarbeite: ${recipeData.name}`)
      
      // Extrahiere Material- und Test-Daten
      const { materials, itt_tests, ...recipeFields } = recipeData
      
      // Füge tenant_id und created_by hinzu
      const recipe = {
        ...recipeFields,
        tenant_id: tenant.id,
        created_by: profile.id
      }
      
      // Erstelle Rezeptur
      const { data: createdRecipe, error: recipeError } = await supabase
        .from('en13813_recipes')
        .insert(recipe)
        .select()
        .single()
      
      if (recipeError) {
        console.error(`❌ Fehler bei ${recipeData.name}:`, recipeError.message)
        continue
      }
      
      console.log(`  ✅ Rezeptur erstellt (ID: ${createdRecipe.id})`)
      
      // Erstelle Materialzusammensetzung
      if (materials) {
        const materialData = {
          recipe_id: createdRecipe.id,
          tenant_id: tenant.id,
          ...materials
        }
        
        const { error: materialError } = await supabase
          .from('en13813_recipe_materials')
          .insert(materialData)
        
        if (materialError) {
          console.error(`  ⚠️  Fehler bei Materialien:`, materialError.message)
        } else {
          console.log(`  ✅ Materialzusammensetzung erstellt`)
        }
      }
      
      // Erstelle ITT Test Plan
      if (itt_tests) {
        const testData = {
          recipe_id: createdRecipe.id,
          tenant_id: tenant.id,
          ...itt_tests
        }
        
        const { error: testError } = await supabase
          .from('en13813_itt_test_plans')
          .insert(testData)
        
        if (testError) {
          console.error(`  ⚠️  Fehler bei ITT Tests:`, testError.message)
        } else {
          console.log(`  ✅ ITT Test Plan erstellt`)
        }
      }
      
      // Erstelle FPC Control Plan
      const fpcData = {
        recipe_id: createdRecipe.id,
        tenant_id: tenant.id,
        control_frequency: {
          raw_materials: 'Täglich',
          fresh_mortar: 'Je Charge',
          hardened_properties: 'Wöchentlich'
        },
        control_parameters: {
          binder_quality: ['Zertifikat', 'Analyse'],
          consistency: ['Ausbreitmaß'],
          strength: ['7d', '28d']
        },
        acceptance_criteria: {
          strength_tolerance: '±10%',
          consistency_range: '±20mm'
        }
      }
      
      const { error: fpcError } = await supabase
        .from('en13813_fpc_control_plans')
        .insert(fpcData)
      
      if (fpcError) {
        console.error(`  ⚠️  Fehler bei FPC Plan:`, fpcError.message)
      } else {
        console.log(`  ✅ FPC Control Plan erstellt`)
      }
      
      // Erstelle Compliance Tasks
      const tasks = [
        {
          recipe_id: createdRecipe.id,
          tenant_id: tenant.id,
          task_type: 'itt_review',
          description: `Jährliche ITT-Überprüfung: ${recipeData.name}`,
          due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'medium'
        },
        {
          recipe_id: createdRecipe.id,
          tenant_id: tenant.id,
          task_type: 'fpc_audit',
          description: `Vierteljährliches FPC-Audit: ${recipeData.name}`,
          due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'high'
        }
      ]
      
      const { error: taskError } = await supabase
        .from('en13813_compliance_tasks')
        .insert(tasks)
      
      if (taskError) {
        console.error(`  ⚠️  Fehler bei Compliance Tasks:`, taskError.message)
      } else {
        console.log(`  ✅ Compliance Tasks erstellt`)
      }
    }
    
    // 5. Zusammenfassung
    console.log('\n' + '='.repeat(50))
    console.log('✨ Demo-Daten erfolgreich erstellt!')
    console.log('='.repeat(50))
    
    // Zeige Statistiken
    const { count: recipeCount } = await supabase
      .from('en13813_recipes')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
    
    const { count: materialCount } = await supabase
      .from('en13813_recipe_materials')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
    
    const { count: testCount } = await supabase
      .from('en13813_itt_test_plans')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
    
    const { count: fpcCount } = await supabase
      .from('en13813_fpc_control_plans')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
    
    const { count: taskCount } = await supabase
      .from('en13813_compliance_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
    
    console.log(`\n📊 Erstellte Datensätze:`)
    console.log(`   - ${recipeCount} Rezepturen`)
    console.log(`   - ${materialCount} Materialzusammensetzungen`)
    console.log(`   - ${testCount} ITT Test Plans`)
    console.log(`   - ${fpcCount} FPC Control Plans`)
    console.log(`   - ${taskCount} Compliance Tasks`)
    
    console.log('\n✅ Script erfolgreich abgeschlossen!')
    
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error)
    process.exit(1)
  }
}

// Führe Script aus
createDemoData()