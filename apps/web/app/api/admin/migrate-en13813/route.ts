import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

// WARNUNG: Diese Route sollte nur einmal ausgeführt und dann gelöscht werden!
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250121_en13813_fix_existing.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(/;\s*$/m)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';')

    const results = []
    const errors = []

    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue
      }

      try {
        // For DO blocks, execute as a single statement
        if (statement.includes('DO $$')) {
          const endIndex = statement.indexOf('END$$;')
          if (endIndex !== -1) {
            const doBlock = statement.substring(0, endIndex + 6)
            const { error } = await supabase.rpc('exec_sql', { sql_query: doBlock })

            if (error) {
              errors.push({ statement: `DO block ${i}`, error: error.message })
            } else {
              results.push({ statement: `DO block ${i}`, success: true })
            }
          }
        } else {
          // For regular statements, execute directly
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

          if (error) {
            errors.push({ statement: statement.substring(0, 50) + '...', error: error.message })
          } else {
            results.push({ statement: statement.substring(0, 50) + '...', success: true })
          }
        }
      } catch (err: any) {
        errors.push({ statement: statement.substring(0, 50) + '...', error: err.message })
      }
    }

    // Alternative approach: Try key operations directly
    const criticalUpdates = []

    // Check and add missing columns to en13813_recipes
    const { data: columns } = await supabase.rpc('get_table_columns', { table_name: 'en13813_recipes' })

    const requiredColumns = [
      { name: 'product_name', type: 'VARCHAR(255)' },
      { name: 'manufacturer_name', type: 'VARCHAR(255)' },
      { name: 'manufacturer_address', type: 'TEXT' },
      { name: 'notified_body_name', type: 'VARCHAR(255)' },
      { name: 'notified_body_number', type: 'VARCHAR(50)' },
      { name: 'rwfc_class', type: 'VARCHAR(10)' },
      { name: 'ph_value', type: 'DECIMAL(4,2)' }
    ]

    for (const col of requiredColumns) {
      if (!columns?.find((c: any) => c.column_name === col.name)) {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `ALTER TABLE en13813_recipes ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`
        })

        if (error) {
          criticalUpdates.push({ column: col.name, status: 'failed', error: error.message })
        } else {
          criticalUpdates.push({ column: col.name, status: 'added' })
        }
      } else {
        criticalUpdates.push({ column: col.name, status: 'exists' })
      }
    }

    // Create missing tables
    const tablesToCreate = [
      'en13813_fpc_control_plans',
      'en13813_fpc_test_results',
      'en13813_fpc_calibrations',
      'en13813_itt_tests',
      'en13813_audit_trail'
    ]

    for (const tableName of tablesToCreate) {
      const { data: tableExists } = await supabase.rpc('table_exists', { table_name: tableName })

      if (!tableExists) {
        // Table creation would require the full CREATE TABLE statement
        // For now, we'll just note it needs creation
        criticalUpdates.push({ table: tableName, status: 'needs_creation' })
      } else {
        criticalUpdates.push({ table: tableName, status: 'exists' })
      }
    }

    return NextResponse.json({
      message: 'Migration attempt completed',
      results,
      errors,
      criticalUpdates,
      summary: {
        successful: results.length,
        failed: errors.length,
        columnsUpdated: criticalUpdates.filter(u => u.status === 'added').length,
        tablesNeeded: criticalUpdates.filter(u => u.status === 'needs_creation').length
      }
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}

// Helper function to check if we can execute SQL
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Test connection
    const { data, error } = await supabase
      .from('en13813_recipes')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        connected: false,
        error: error.message,
        hint: 'Table might not exist or connection failed'
      })
    }

    // Check what tables exist
    const { data: tables } = await supabase.rpc('get_tables')

    const en13813Tables = tables?.filter((t: any) =>
      t.table_name.startsWith('en13813_')
    ) || []

    return NextResponse.json({
      connected: true,
      existingTables: en13813Tables.map((t: any) => t.table_name),
      message: 'Ready to run migration'
    })
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      error: error.message
    }, { status: 500 })
  }
}