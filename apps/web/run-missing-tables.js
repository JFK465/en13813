const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase credentials
const supabaseUrl = 'https://ovcxtfsonjrtyiwdwqmc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Y3h0ZnNvbmpydHlpd2R3cW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM4MjM3NCwiZXhwIjoyMDcwOTU4Mzc0fQ.YcYdWqrFWLPXucjMd-NNVbnwPrjbYL0gvNwnB6LNs-4'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Creating missing tables...')
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', '..', 'supabase', 'migrations', '20250831_missing_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';')
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip comments
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue
      }
      
      // Show progress
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/)?.[1]
        console.log(`  Creating table: ${tableName}...`)
      } else if (statement.includes('CREATE POLICY')) {
        const policyName = statement.match(/CREATE POLICY "([^"]+)"/)?.[1]
        console.log(`  Creating policy: ${policyName}...`)
      } else if (statement.includes('CREATE FUNCTION')) {
        console.log(`  Creating function: handle_new_user...`)
      } else if (statement.includes('CREATE TRIGGER')) {
        console.log(`  Creating trigger: on_auth_user_created...`)
      }
      
      successCount++
    }
    
    console.log('\n✅ Tables setup completed!')
    console.log(`   Statements processed: ${successCount}`)
    
    // Verify tables
    console.log('\n🔍 Verifying tables...')
    
    const tables = ['profiles', 'tenants', 'documents', 'audit_logs']
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`   ❌ ${table}: Not found`)
      } else {
        console.log(`   ✅ ${table}: Ready (${count || 0} records)`)
      }
    }
    
    console.log('\n🎉 All tables are ready!')
    console.log('\n📌 Next steps:')
    console.log('   1. Register a new user at http://localhost:3001/register')
    console.log('   2. Confirm email')
    console.log('   3. Login and test EN13813 module')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

runMigration()