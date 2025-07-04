import { executeQuery, getClient } from './postgresqlAPI'
import { PoolClient } from 'pg'

interface MigrationStatus {
  id: number
  entity_type: string
  gitlab_id: number
  postgres_id?: string
  status: 'pending' | 'completed' | 'failed'
  error_message?: string
  migrated_at?: Date
  created_at: Date
}

interface MigrationStats {
  entity_type: string
  total: number
  completed: number
  failed: number
  pending: number
}

export async function getMigrationStatus(entityType?: string) {
  try {
    let query = 'SELECT * FROM migration_status WHERE 1=1'
    const params: any[] = []

    if (entityType) {
      params.push(entityType)
      query += ` AND entity_type = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'

    const result = await executeQuery<MigrationStatus>(query, params)

    // Get summary stats
    const statsResult = await executeQuery<MigrationStats>(`
      SELECT 
        entity_type,
        COUNT(*)::int as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::int as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int as pending
      FROM migration_status
      GROUP BY entity_type
    `)

    return {
      success: true,
      data: result.rows || [],
      stats: statsResult.rows || []
    }
  } catch (error) {
    console.error('Error fetching migration status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: [],
      stats: []
    }
  }
}

export async function recordMigration(migrationData: {
  entity_type: string
  gitlab_id: number
  postgres_id?: string
  status: 'pending' | 'completed' | 'failed'
  error_message?: string
}) {
  try {
    const { entity_type, gitlab_id, postgres_id, status, error_message } = migrationData

    if (!entity_type || !gitlab_id || !status) {
      return {
        success: false,
        error: 'entity_type, gitlab_id, and status are required'
      }
    }

    const result = await executeQuery(
      `INSERT INTO migration_status (
        entity_type, gitlab_id, postgres_id, status, error_message, migrated_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (entity_type, gitlab_id) 
      DO UPDATE SET 
        postgres_id = $3,
        status = $4,
        error_message = $5,
        migrated_at = $6
      RETURNING *`,
      [
        entity_type,
        gitlab_id,
        postgres_id,
        status,
        error_message,
        status === 'completed' ? new Date() : null
      ]
    )

    return {
      success: true,
      data: result.rows?.[0]
    }
  } catch (error) {
    console.error('Error recording migration:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function recordMigrationBatch(
  records: Array<{
    entity_type: string
    gitlab_id: number
    postgres_id?: string
    status: 'pending' | 'completed' | 'failed'
    error_message?: string
  }>
) {
  let client: PoolClient | null = null

  try {
    if (!Array.isArray(records) || records.length === 0) {
      return {
        success: false,
        error: 'records array is required and must not be empty'
      }
    }

    client = await getClient()
    await client.query('BEGIN')

    const results = []

    for (const record of records) {
      const { entity_type, gitlab_id, postgres_id, status, error_message } = record

      const result = await client.query(
        `INSERT INTO migration_status (
          entity_type, gitlab_id, postgres_id, status, error_message, migrated_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (entity_type, gitlab_id) 
        DO UPDATE SET 
          postgres_id = $3,
          status = $4,
          error_message = $5,
          migrated_at = $6
        RETURNING *`,
        [
          entity_type,
          gitlab_id,
          postgres_id,
          status,
          error_message,
          status === 'completed' ? new Date() : null
        ]
      )

      results.push(result.rows[0])
    }

    await client.query('COMMIT')

    return {
      success: true,
      data: results,
      count: results.length
    }
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK')
    }
    console.error('Error recording migration batch:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  } finally {
    if (client) {
      client.release()
    }
  }
}

export async function resetMigrationStatus(entityType: string) {
  try {
    const result = await executeQuery('DELETE FROM migration_status WHERE entity_type = $1', [
      entityType
    ])

    return {
      success: true,
      message: `Deleted ${result.rowCount} migration records for ${entityType}`
    }
  } catch (error) {
    console.error('Error resetting migration status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function checkMigrationStatus(entityType: string, gitlabId: number) {
  try {
    const result = await executeQuery<MigrationStatus>(
      'SELECT * FROM migration_status WHERE entity_type = $1 AND gitlab_id = $2',
      [entityType, gitlabId]
    )

    return {
      success: true,
      migrated: result.rows && result.rows.length > 0 && result.rows[0].status === 'completed',
      data: result.rows?.[0] || null
    }
  } catch (error) {
    console.error('Error checking migration status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      migrated: false,
      data: null
    }
  }
}
