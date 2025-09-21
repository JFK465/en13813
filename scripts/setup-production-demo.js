#!/usr/bin/env node

/**
 * Komplettes Setup für Demo-Daten in der produktiven Supabase-Instanz
 * Erstellt Tenant, User und Rezepturen
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const { join } = require('path')

// Lade Production Environment
dotenv.config({ path: join(__dirname, '../apps/web/.env.production') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Fehlende Umgebungsvariablen in .env.production')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupProductionDemo() {
  try {
    console.log('🚀 Starte komplettes Setup für Produktiv-Demo...\n')
    console.log(`🔗 Verbunden mit: ${supabaseUrl}\n`)

    // 1. Prüfe ob demo tenant existiert
    console.log('1️⃣ Prüfe Demo-Tenant...')
    let { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', 'demo')
      .single()

    if (tenantError && tenantError.code === 'PGRST116') {
      // Tenant existiert nicht, erstelle ihn
      console.log('   Erstelle neuen Demo-Tenant...')
      const { data: newTenant, error: createError } = await supabase
        .from('tenants')
        .insert({
          slug: 'demo',
          company_name: 'Demo Estrich GmbH',
          settings: {
            demo_account: true,
            features: {
              en13813: true,
              recipes: true,
              compliance: true
            }
          }
        })
        .select()
        .single()

      if (createError) {
        console.error('   ❌ Fehler beim Erstellen des Tenants:', createError.message)
        // Versuche einen vorhandenen Tenant zu verwenden
        const { data: anyTenant } = await supabase
          .from('tenants')
          .select('*')
          .limit(1)
          .single()
        
        if (anyTenant) {
          console.log(`   ℹ️  Verwende vorhandenen Tenant: ${anyTenant.company_name}`)
          tenant = anyTenant
        } else {
          console.error('   ❌ Kein Tenant verfügbar')
          process.exit(1)
        }
      } else {
        tenant = newTenant
        console.log(`   ✅ Demo-Tenant erstellt: ${tenant.id}`)
      }
    } else if (tenant) {
      console.log(`   ✅ Demo-Tenant gefunden: ${tenant.company_name} (${tenant.id})`)
    } else {
      console.error('   ❌ Fehler beim Abrufen des Tenants:', tenantError?.message)
      process.exit(1)
    }

    // 2. Prüfe ob demo@example.com User existiert
    console.log('\n2️⃣ Prüfe Demo-Benutzer...')
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'demo@example.com')
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      console.log('   Demo-Benutzer existiert nicht')
      
      // Erstelle Auth-User über Admin API
      console.log('   Erstelle Demo Auth-Benutzer...')
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'demo@example.com',
        password: 'DemoPassword123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Demo User'
        }
      })

      if (authError) {
        console.warn('   ⚠️  Auth-User konnte nicht erstellt werden:', authError.message)
        // Verwende eine feste UUID für Demo-Zwecke
        profile = {
          id: 'b2222222-2222-2222-2222-222222222222',
          email: 'demo@example.com',
          full_name: 'Demo User',
          tenant_id: tenant.id
        }
        console.log('   ℹ️  Verwende Standard Demo-User ID')
      } else {
        // Erstelle Profile-Eintrag
        const { data: newProfile, error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            email: 'demo@example.com',
            full_name: 'Demo User',
            tenant_id: tenant.id,
            role: 'admin'
          })
          .select()
          .single()

        if (profileCreateError) {
          console.warn('   ⚠️  Profile konnte nicht erstellt werden:', profileCreateError.message)
          profile = {
            id: authUser.user.id,
            email: 'demo@example.com',
            full_name: 'Demo User',
            tenant_id: tenant.id
          }
        } else {
          profile = newProfile
        }
        console.log(`   ✅ Demo-Benutzer erstellt: ${profile.email}`)
      }
    } else if (profile) {
      console.log(`   ✅ Demo-Benutzer gefunden: ${profile.full_name} (${profile.email})`)
    }

    // 3. Lösche vorhandene Demo-Rezepturen
    console.log('\n3️⃣ Bereinige vorhandene Demo-Rezepturen...')
    const { error: deleteError } = await supabase
      .from('en13813_recipes')
      .delete()
      .eq('tenant_id', tenant.id)
      .like('recipe_code', '%PROD%')

    if (deleteError) {
      console.warn('   ⚠️  Fehler beim Löschen:', deleteError.message)
    } else {
      console.log('   ✅ Bereinigung abgeschlossen')
    }

    // 4. Erstelle neue Demo-Rezepturen
    console.log('\n4️⃣ Erstelle neue Demo-Rezepturen...')
    
    const demoRecipes = [
      {
        tenant_id: tenant.id,
        // created_by: profile?.id || 'b2222222-2222-2222-2222-222222222222',
        recipe_code: 'CT-PROD-001',
        name: 'Premium Zementestrich CT-C30-F5',
        type: 'CT',
        description: 'Hochbelastbarer Zementestrich für Industrieböden',
        manufacturer: 'Demo Estrich GmbH',
        production_site: 'Werk Berlin',
        product_designation: 'CT-C30-F5-A15',
        ce_marking_year: 2024,
        standard_reference: 'EN 13813:2002',
        avcp_system: '4',
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
        status: 'active'
      },
      {
        tenant_id: tenant.id,
        // created_by: profile?.id || 'b2222222-2222-2222-2222-222222222222',
        recipe_code: 'CA-PROD-002',
        name: 'Fließestrich CAF Heizestrich',
        type: 'CA',
        description: 'Calciumsulfat-Fließestrich für Fußbodenheizung',
        manufacturer: 'Demo Estrich GmbH',
        production_site: 'Werk München',
        product_designation: 'CA-C35-F7-H',
        ce_marking_year: 2024,
        standard_reference: 'EN 13813:2002',
        avcp_system: '4',
        compressive_strength_class: 'C35',
        flexural_strength_class: 'F7',
        fire_class: 'A1fl',
        release_of_corrosive_substances: 'CA',
        thermal_conductivity_w_mk: 1.4,
        intended_use: {
          wearing_surface: false,
          with_flooring: true,
          heated_screed: true
        },
        dop_number: '2024-CA-002',
        status: 'active'
      },
      {
        tenant_id: tenant.id,
        // created_by: profile?.id || 'b2222222-2222-2222-2222-222222222222',
        recipe_code: 'AS-PROD-003',
        name: 'Gussasphalt AS Industrie',
        type: 'AS',
        description: 'Gussasphaltestrich für Industrieflächen',
        manufacturer: 'Demo Estrich GmbH',
        production_site: 'Werk Hamburg',
        product_designation: 'AS-IC40',
        ce_marking_year: 2024,
        standard_reference: 'EN 13813:2002',
        avcp_system: '3',
        compressive_strength_class: 'IC40',
        flexural_strength_class: 'IP10',
        indentation_class: 'IC40',
        fire_class: 'Bfl-s1',
        release_of_corrosive_substances: 'CA',
        chemical_resistance: 'CR',
        // wear_resistance_method wird weggelassen - AS verwendet Eindringtiefe
        intended_use: {
          wearing_surface: false,  // AS ist meist mit Bodenbelag
          with_flooring: true
        },
        dop_number: '2024-AS-003',
        notified_body: {
          number: '0123',
          name: 'TÜV Rheinland'
        },
        status: 'active'
      },
      {
        tenant_id: tenant.id,
        // created_by: profile?.id || 'b2222222-2222-2222-2222-222222222222',
        recipe_code: 'SR-PROD-004',
        name: 'Epoxidharz SR Heavy Duty',
        type: 'SR',
        description: 'Epoxidharzbeschichtung für Produktionshallen',
        manufacturer: 'Demo Estrich GmbH',
        production_site: 'Werk Frankfurt',
        product_designation: 'SR-B2.0-IR20-AR0.5',
        ce_marking_year: 2024,
        standard_reference: 'EN 13813:2002',
        avcp_system: '3',
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
          with_flooring: false
        },
        dop_number: '2024-SR-004',
        notified_body: {
          number: '0756',
          name: 'KIWA'
        },
        status: 'active'
      },
      {
        tenant_id: tenant.id,
        // created_by: profile?.id || 'b2222222-2222-2222-2222-222222222222',
        recipe_code: 'MA-PROD-005',
        name: 'Steinholzestrich MA Klassik',
        type: 'MA',
        description: 'Magnesiaestrich für historische Gebäude',
        manufacturer: 'Demo Estrich GmbH',
        production_site: 'Werk Leipzig',
        product_designation: 'MA-C40-F7-SH100',
        ce_marking_year: 2024,
        standard_reference: 'EN 13813:2002',
        avcp_system: '4',
        compressive_strength_class: 'C40',
        flexural_strength_class: 'F7',
        surface_hardness_class: 'SH100',
        fire_class: 'A1fl',
        release_of_corrosive_substances: 'CA',
        intended_use: {
          wearing_surface: false,
          with_flooring: true
        },
        dop_number: '2024-MA-005',
        status: 'active'
      }
    ]

    let successCount = 0
    let errorCount = 0

    for (const recipe of demoRecipes) {
      console.log(`   🔄 Erstelle: ${recipe.name}`)
      
      const { data: createdRecipe, error: recipeError } = await supabase
        .from('en13813_recipes')
        .insert(recipe)
        .select()
        .single()

      if (recipeError) {
        console.error(`      ❌ Fehler:`, recipeError.message)
        errorCount++
      } else {
        console.log(`      ✅ Rezeptur erstellt (ID: ${createdRecipe.id})`)
        successCount++

        // Erstelle zusätzliche Daten
        await createAdditionalData(createdRecipe.id, recipe.type, tenant.id)
      }
    }

    // 5. Zusammenfassung
    console.log('\n' + '='.repeat(60))
    console.log('✨ Setup abgeschlossen!')
    console.log('='.repeat(60))
    console.log(`\n📊 Ergebnis:`)
    console.log(`   📂 Tenant: ${tenant.company_name} (${tenant.id})`)
    console.log(`   👤 Benutzer: ${profile?.email || 'Demo User'}`)
    console.log(`   ✅ ${successCount} Rezepturen erfolgreich erstellt`)
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} Rezepturen fehlgeschlagen`)
    }
    
    console.log('\n🌐 Die Demo-Daten sind jetzt in Ihrer Produktivumgebung verfügbar!')
    console.log('📧 Login: demo@example.com')
    console.log('🔑 Passwort: DemoPassword123!')

  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error)
    process.exit(1)
  }
}

async function createAdditionalData(recipeId, type, tenantId) {
  // Materialzusammensetzung
  const materials = {
    recipe_id: recipeId,
    tenant_id: tenantId,
    binder_type: getBinder(type).type,
    binder_designation: getBinder(type).designation,
    binder_amount_kg_m3: getBinder(type).amount,
    binder_percentage: getBinder(type).percentage,
    water_binder_ratio: getBinder(type).water_ratio,
    additives: getAdditives(type)
  }
  
  const { error: matError } = await supabase
    .from('en13813_recipe_materials')
    .insert(materials)
  
  if (!matError) {
    console.log(`      ✅ Materialzusammensetzung erstellt`)
  }

  // ITT Test Plan
  const tests = {
    recipe_id: recipeId,
    tenant_id: tenantId,
    required_tests: getRequiredTests(type),
    test_status: 'completed',
    test_results: {
      test_date: '2024-01-15',
      laboratory: 'TÜV Rheinland',
      certificate: `TR-2024-${Math.floor(Math.random() * 9999)}`
    }
  }
  
  const { error: testError } = await supabase
    .from('en13813_itt_test_plans')
    .insert(tests)
  
  if (!testError) {
    console.log(`      ✅ ITT Test Plan erstellt`)
  }

  // FPC Control Plan
  const fpc = {
    recipe_id: recipeId,
    tenant_id: tenantId,
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
    .insert(fpc)
  
  if (!fpcError) {
    console.log(`      ✅ FPC Control Plan erstellt`)
  }
}

function getBinder(type) {
  const binders = {
    'CT': { type: 'Zement', designation: 'CEM II/B-S 32,5 R', amount: 340, percentage: 15.5, water_ratio: 0.55 },
    'CA': { type: 'Calciumsulfat', designation: 'Alpha-Halbhydrat CAB 30', amount: 395, percentage: 18.0, water_ratio: 0.38 },
    'MA': { type: 'Magnesiumoxid', designation: 'MgO 90', amount: 260, percentage: 12.0, water_ratio: 2.5 },
    'SR': { type: 'Epoxidharz', designation: 'EP-2K-100', amount: 480, percentage: 22.0, water_ratio: 0 },
    'AS': { type: 'Bitumen', designation: 'B 20/30', amount: 165, percentage: 7.5, water_ratio: 0 }
  }
  return binders[type] || binders['CT']
}

function getAdditives(type) {
  const additives = {
    'CT': [{ name: 'Fließmittel', dosage: 0.8 }, { name: 'Verzögerer', dosage: 0.2 }],
    'CA': [{ name: 'Verflüssiger', dosage: 0.5 }, { name: 'Entschäumer', dosage: 0.02 }],
    'MA': [{ name: 'MgCl2-Lösung', concentration: '22°Bé' }],
    'SR': [{ name: 'Härter', ratio: '2:1' }],
    'AS': [{ name: 'Polymer', dosage: 3.0 }]
  }
  return additives[type] || []
}

function getRequiredTests(type) {
  const tests = {
    'CT': [
      { test: 'Druckfestigkeit', standard: 'EN 13892-2', result: '32.5 N/mm²' },
      { test: 'Biegezugfestigkeit', standard: 'EN 13892-2', result: '5.8 N/mm²' },
      { test: 'Verschleiß Böhme', standard: 'EN 13892-3', result: '14.2 cm³/50cm²' }
    ],
    'CA': [
      { test: 'Druckfestigkeit', standard: 'EN 13892-2', result: '37.2 N/mm²' },
      { test: 'Biegezugfestigkeit', standard: 'EN 13892-2', result: '7.5 N/mm²' }
    ],
    'MA': [
      { test: 'Druckfestigkeit', standard: 'EN 13892-2', result: '42.1 N/mm²' },
      { test: 'Oberflächenhärte', standard: 'EN 13892-6', result: '105 N/mm²' }
    ],
    'SR': [
      { test: 'Haftzugfestigkeit', standard: 'EN 13892-8', result: '2.2 N/mm²' },
      { test: 'Verschleiß BCA', standard: 'EN 13892-4', result: 'AR0.5' }
    ],
    'AS': [
      { test: 'Eindringtiefe', standard: 'EN 13892-5', result: 'IC40' }
    ]
  }
  return tests[type] || []
}

// Starte Setup
setupProductionDemo()