import { initializePostgreSQL, executeQuery } from '../../postgresqlAPI'
import fs from 'fs'
import path from 'path'

async function runFeaturesSchemaUpdate() {
  try {
    // Initialize PostgreSQL connection
    await initializePostgreSQL()
    console.log('Running features schema update migration...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '006_update_features_schema.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    const result = await executeQuery(sql)
    if (!result.success) {
      throw new Error(result.error || 'Failed to execute migration SQL')
    }
    
    console.log('✅ Features table schema updated successfully!')
    
    // Verify the changes
    const columnQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'features'
      ORDER BY ordinal_position
    `
    const columns = await executeQuery<{ column_name: string; data_type: string; is_nullable: string }>(columnQuery)
    if (columns.success && columns.rows) {
      console.log('\nUpdated table columns:')
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error running features schema update:', error)
    throw error
  }
}

// Run the migration
runFeaturesSchemaUpdate()
  .then(() => {
    console.log('\nMigration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nMigration failed:', error)
    process.exit(1)
  })