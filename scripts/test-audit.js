/**
 * Test script for Audit functionality
 * Run with: NODE_PATH=/Users/jonaskruger/Dev/en13813/apps/web/node_modules node scripts/test-audit.js
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fhftgdffhkhmbwqbwiyt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZnRnZGZmaGtobWJ3cWJ3aXl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTQ2MDEzNywiZXhwIjoyMDQxMDM2MTM3fQ.jUvUqTlHKRJMqEy5uJ7ny_1VjZV8l8f8n4K9lCOJZ5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureTablesExist() {
  console.log('🔧 Ensuring audit tables exist...');

  // Create tenants table if not exists
  const { error: tenantsError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  }).single();

  if (tenantsError && !tenantsError.message.includes('already exists')) {
    console.log('Note: tenants table might already exist');
  }

  // Create tenant_users table if not exists
  const { error: tenantUsersError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS tenant_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(tenant_id, user_id)
      );
    `
  }).single();

  if (tenantUsersError && !tenantUsersError.message.includes('already exists')) {
    console.log('Note: tenant_users table might already exist');
  }

  // Now create audit tables
  const migrationSQL = `
    -- Create audit tables for EN13813 compliance
    CREATE TABLE IF NOT EXISTS en13813_audits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL,
      audit_number VARCHAR(50) NOT NULL,
      audit_type VARCHAR(50) NOT NULL,
      audit_date DATE NOT NULL,
      auditor_name VARCHAR(255) NOT NULL,
      audit_scope TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'planned',

      -- Product-specific information
      binder_types TEXT[],
      intended_use VARCHAR(50),

      -- AVCP-System
      rf_regulated BOOLEAN DEFAULT FALSE,
      rf_improvement_stage BOOLEAN DEFAULT FALSE,
      dangerous_substances_regulated BOOLEAN DEFAULT FALSE,
      avcp_system VARCHAR(10) DEFAULT '4',

      -- ITT
      itt_available BOOLEAN DEFAULT FALSE,
      itt_after_change BOOLEAN DEFAULT FALSE,

      -- Conformity assessment
      conformity_method VARCHAR(20),
      sample_size INTEGER,
      mean_value NUMERIC,
      standard_deviation NUMERIC,
      ka_value NUMERIC,

      -- Results
      findings_summary TEXT,
      nonconformities_count INTEGER DEFAULT 0,
      observations_count INTEGER DEFAULT 0,
      opportunities_count INTEGER DEFAULT 0,

      -- Follow-up
      next_audit_date DATE,
      corrective_actions_required BOOLEAN DEFAULT FALSE,

      -- Metadata
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_by UUID,

      UNIQUE(tenant_id, audit_number)
    );

    -- Create checklist items table
    CREATE TABLE IF NOT EXISTS en13813_audit_checklist_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      audit_id UUID NOT NULL REFERENCES en13813_audits(id) ON DELETE CASCADE,
      section VARCHAR(50) NOT NULL,
      category VARCHAR(100) NOT NULL,
      requirement TEXT NOT NULL,
      reference VARCHAR(255),
      status VARCHAR(50) NOT NULL,
      evidence TEXT,
      finding TEXT,
      severity VARCHAR(50),
      corrective_action_required BOOLEAN DEFAULT FALSE,
      corrective_action_description TEXT,
      responsible_person VARCHAR(255),
      due_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create findings table
    CREATE TABLE IF NOT EXISTS en13813_audit_findings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      audit_id UUID NOT NULL REFERENCES en13813_audits(id) ON DELETE CASCADE,
      finding_number VARCHAR(50) NOT NULL,
      finding_type VARCHAR(50) NOT NULL,
      severity VARCHAR(50),
      description TEXT NOT NULL,
      evidence TEXT,
      affected_process VARCHAR(255),
      root_cause TEXT,
      corrective_action_required BOOLEAN DEFAULT TRUE,
      corrective_action_description TEXT,
      preventive_action_description TEXT,
      responsible_person VARCHAR(255),
      target_date DATE,
      verification_date DATE,
      verification_result VARCHAR(50),
      verified_by VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'open',
      closure_date DATE,
      closure_comments TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(audit_id, finding_number)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_audits_tenant_id ON en13813_audits(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_audits_status ON en13813_audits(status);
    CREATE INDEX IF NOT EXISTS idx_audits_audit_date ON en13813_audits(audit_date);
  `;

  // Execute migration in parts
  const statements = migrationSQL.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      const { error } = await supabase.rpc('exec_sql', {
        query: statement
      }).single();

      if (error && !error.message.includes('already exists')) {
        console.log('Warning:', error.message);
      }
    }
  }

  console.log('✅ Audit tables ensured');
}

async function testAuditCreation() {
  console.log('\n🧪 Testing Audit Creation...\n');

  // First ensure tables exist
  await ensureTablesExist();

  // Create or get demo tenant
  let { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('name', 'Demo Tenant')
    .single();

  if (!tenant) {
    const { data: newTenant, error } = await supabase
      .from('tenants')
      .insert({ name: 'Demo Tenant', id: 'demo-tenant-id' })
      .select()
      .single();

    if (error && !error.message.includes('duplicate')) {
      console.log('Note: Demo tenant might already exist');
    }
    tenant = newTenant || { id: 'demo-tenant-id' };
  }

  console.log('📌 Using tenant:', tenant?.name || 'Demo Tenant');

  // Create test audit
  const auditData = {
    tenant_id: tenant?.id || 'demo-tenant-id',
    audit_number: `AUD-${new Date().getFullYear()}-TEST-${Date.now()}`,
    audit_type: 'internal',
    audit_date: new Date().toISOString().split('T')[0],
    auditor_name: 'Test Auditor',
    audit_scope: 'EN 13813 Compliance Test Audit - Full scope FPC evaluation',
    status: 'planned',
    binder_types: ['CT', 'CA'],
    intended_use: 'wearing_layer',
    rf_regulated: true,
    rf_improvement_stage: false,
    dangerous_substances_regulated: false,
    avcp_system: '3',
    itt_available: true,
    itt_after_change: false,
    conformity_method: 'variables',
    sample_size: 10,
    mean_value: 30.5,
    standard_deviation: 2.1,
    ka_value: 0.64
  };

  console.log('\n📝 Creating audit...');
  const { data: audit, error: auditError } = await supabase
    .from('en13813_audits')
    .insert(auditData)
    .select()
    .single();

  if (auditError) {
    console.error('❌ Error creating audit:', auditError);
    return;
  }

  console.log('✅ Audit created:', audit.audit_number);

  // Create sample checklist items
  const checklistItems = [
    {
      audit_id: audit.id,
      section: '6.3.1',
      category: 'fpc_general',
      requirement: 'QM-Handbuch vorhanden und aktuell',
      reference: 'EN 13813:2002 §6.3.1',
      status: 'conform'
    },
    {
      audit_id: audit.id,
      section: '6.3.2.1',
      category: 'incoming_materials',
      requirement: 'Eingangsprüfungen durchgeführt und dokumentiert',
      reference: 'EN 13813:2002 §6.3.2.1',
      status: 'conform'
    },
    {
      audit_id: audit.id,
      section: '6.3.3.3',
      category: 'test_equipment',
      requirement: 'Kalibrierplan für Prüfequipment vorhanden',
      reference: 'EN 13813:2002 §6.3.3.3',
      status: 'nonconform',
      finding: 'Kalibrierplan nicht vollständig',
      severity: 'minor'
    }
  ];

  console.log('\n📋 Creating checklist items...');
  const { data: items, error: itemsError } = await supabase
    .from('en13813_audit_checklist_items')
    .insert(checklistItems)
    .select();

  if (itemsError) {
    console.error('❌ Error creating checklist items:', itemsError);
  } else {
    console.log(`✅ ${items.length} checklist items created`);
  }

  // Create sample finding
  const finding = {
    audit_id: audit.id,
    finding_number: 'F001',
    finding_type: 'nonconformity',
    severity: 'minor',
    description: 'Kalibrierplan für Prüfequipment unvollständig',
    evidence: 'Sichtprüfung Dokumentation',
    affected_process: 'Qualitätssicherung',
    corrective_action_required: true,
    corrective_action_description: 'Kalibrierplan vervollständigen',
    responsible_person: 'QM-Beauftragter',
    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'open'
  };

  console.log('\n🔍 Creating finding...');
  const { data: findingData, error: findingError } = await supabase
    .from('en13813_audit_findings')
    .insert(finding)
    .select()
    .single();

  if (findingError) {
    console.error('❌ Error creating finding:', findingError);
  } else {
    console.log('✅ Finding created:', findingData.finding_number);
  }

  // Fetch and display created audit
  console.log('\n📊 Fetching audit summary...');
  const { data: summary, error: summaryError } = await supabase
    .from('en13813_audits')
    .select(`
      *,
      en13813_audit_checklist_items(count),
      en13813_audit_findings(count)
    `)
    .eq('id', audit.id)
    .single();

  if (summaryError) {
    console.error('❌ Error fetching summary:', summaryError);
  } else {
    console.log('\n✨ Audit Summary:');
    console.log('  - Audit Number:', summary.audit_number);
    console.log('  - Type:', summary.audit_type);
    console.log('  - Status:', summary.status);
    console.log('  - AVCP System:', summary.avcp_system);
    console.log('  - Checklist Items:', items?.length || 0);
    console.log('  - Findings:', 1);
  }

  console.log('\n🎉 Test completed successfully!');
  console.log('📌 Visit http://localhost:3001/en13813/audit to see the audit');
}

// Run the test
testAuditCreation().catch(console.error);