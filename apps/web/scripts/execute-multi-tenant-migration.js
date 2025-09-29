const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

async function executeMigration() {
  console.log('🚀 Starting Multi-Tenant Migration Execution...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250122_complete_en13813_fresh.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements (separated by semicolons)
    const statements = migrationSQL
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Get first 100 chars of statement for logging
      const shortStatement = statement.substring(0, 100).replace(/\n/g, ' ');

      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        }).single();

        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from('_dummy_') // Dummy table name
            .select()
            .eq('_dummy_', '_dummy_') // This won't match anything
            .limit(0)
            .then(() => supabase.rpc('pg_exec', { query: statement + ';' }));

          if (directError) {
            throw directError;
          }
        }

        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] ${shortStatement}...`);
      } catch (err) {
        errorCount++;
        errors.push({ statement: shortStatement, error: err.message });
        console.log(`❌ [${i + 1}/${statements.length}] ${shortStatement}...`);
        console.log(`   Error: ${err.message}\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Failed Statements:');
      errors.forEach((e, idx) => {
        console.log(`\n${idx + 1}. ${e.statement}`);
        console.log(`   Error: ${e.error}`);
      });
    }

    // Verify critical tables exist
    console.log('\n🔍 Verifying Critical Tables...\n');

    const criticalTables = [
      'tenants',
      'tenant_users',
      'en13813_recipes',
      'en13813_batches',
      'en13813_lab_values'
    ];

    for (const table of criticalTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);

      if (error) {
        console.log(`❌ Table '${table}': NOT FOUND`);
      } else {
        console.log(`✅ Table '${table}': EXISTS`);
      }
    }

    console.log('\n✨ Migration execution completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach: Use direct SQL execution via service role
async function executeDirectSQL() {
  console.log('\n🔄 Trying alternative approach with direct SQL execution...\n');

  const migrationPath = path.join(__dirname, '../supabase/migrations/20250122_complete_en13813_fresh.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Parse and execute critical CREATE TABLE statements first
  const createTableRegex = /CREATE TABLE IF NOT EXISTS (\w+)[^;]+;/gi;
  const createTables = migrationSQL.match(createTableRegex) || [];

  console.log(`Found ${createTables.length} CREATE TABLE statements\n`);

  for (const createTable of createTables) {
    const tableName = createTable.match(/CREATE TABLE IF NOT EXISTS (\w+)/i)?.[1];
    console.log(`Creating table: ${tableName}...`);

    // For now, just log what we would do
    console.log(`Would execute: ${createTable.substring(0, 100)}...`);
  }
}

// Run migration
executeMigration().catch(err => {
  console.error('Fatal error:', err);
  executeDirectSQL();
});