import { initializePostgreSQL, executeQuery } from '../../postgresqlAPI'
import fs from 'fs'
import path from 'path'

async function runUiUxMigration() {
  try {
    // Initialize PostgreSQL connection
    await initializePostgreSQL()
    console.log('Running UI/UX requests table migration...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '005_create_uiux_requests_table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    const result = await executeQuery(sql)
    if (!result.success) {
      throw new Error(result.error || 'Failed to execute migration SQL')
    }
    
    console.log('✅ UI/UX requests table created successfully!')
    
    // Check if table was created
    const checkQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'uiux_requests'
    `
    const checkResult = await executeQuery<{ table_name: string }>(checkQuery)
    
    if (checkResult.success && checkResult.rows && checkResult.rows.length > 0) {
      console.log('✅ Verified: uiux_requests table exists')
      
      // Get column information
      const columnQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'uiux_requests'
        ORDER BY ordinal_position
      `
      const columns = await executeQuery<{ column_name: string; data_type: string; is_nullable: string }>(columnQuery)
      if (columns.success && columns.rows) {
        console.log('\nTable columns:')
        columns.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error running UI/UX migration:', error)
    throw error
  } finally {
    // Pool is managed by the main process, don't close it here
  }
}

// Run the migration
runUiUxMigration()
  .then(() => {
    console.log('\nMigration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nMigration failed:', error)
    process.exit(1)
  })