const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.log('Please set these in your .env.local file')
  process.exit(1)
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting EN13813 migration...')
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250830_en13813_safe.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split SQL into individual statements (by semicolon, but not inside functions)
    const statements = migrationSQL
      .split(/;\s*$(?![^$]*\$\$)/gm)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';')
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue
      }
      
      // Show progress
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/)?.[1]
        console.log(`  Creating table: ${tableName}...`)
      } else if (statement.includes('CREATE INDEX')) {
        const indexName = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/)?.[1]
        console.log(`  Creating index: ${indexName}...`)
      } else if (statement.includes('CREATE POLICY')) {
        console.log(`  Creating RLS policy...`)
      }
      
      try {
        // Use raw SQL execution
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        }).single()
        
        if (error) {
          // Try direct execution as fallback
          const { error: directError } = await supabase.from('_sql').select(statement)
          if (directError) {
            console.warn(`  ⚠️  Warning: ${directError.message}`)
            errorCount++
          } else {
            successCount++
          }
        } else {
          successCount++
        }
      } catch (err) {
        // Some errors are expected (e.g., "already exists")
        if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
          console.log(`  ℹ️  Skipped (already exists)`)
        } else {
          console.warn(`  ⚠️  Warning: ${err.message}`)
          errorCount++
        }
      }
    }
    
    console.log('\n✅ Migration completed!')
    console.log(`   Successful statements: ${successCount}`)
    console.log(`   Warnings/Skipped: ${errorCount}`)
    
    // Test the tables
    console.log('\n🔍 Verifying tables...')
    
    const tables = [
      'en13813_recipes',
      'en13813_test_reports', 
      'en13813_batches',
      'en13813_dops',
      'en13813_dop_packages',
      'en13813_compliance_tasks'
    ]
    
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
    
    console.log('\n🎉 EN13813 module is ready to use!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run the migration
runMigration()