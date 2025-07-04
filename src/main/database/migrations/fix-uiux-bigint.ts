import { initializePostgreSQL, pool } from '../../postgresqlAPI'

async function fixUiUxBigInt() {
  try {
    await initializePostgreSQL()
    console.log('Fixing gitlab_note_id column type...')
    
    // Alter the column to BIGINT
    await pool.query('ALTER TABLE uiux_requests ALTER COLUMN gitlab_note_id TYPE BIGINT')
    console.log('✅ Successfully changed gitlab_note_id to BIGINT')
    
  } catch (error) {
    console.error('Error fixing column type:', error)
    throw error
  }
}

// Run the fix
fixUiUxBigInt()
  .then(() => {
    console.log('Fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fix failed:', error)
    process.exit(1)
  })