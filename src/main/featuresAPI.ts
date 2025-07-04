import { executeQuery } from './postgresqlAPI'
import { PoolClient } from 'pg'

interface Feature {
  id: string
  product_id: string
  title: string
  overview?: string
  current_problems?: string
  requirements?: string
  priority?: string
  estimate?: number
  status?: string
  requestor?: string
  created_at: Date
  updated_at: Date
  gitlab_issue_id?: number
}

export async function getAllFeatures(filters?: {
  product_id?: string
  status?: string
  priority?: string
}) {
  try {
    let query =
      'SELECT f.*, p.name as product_name FROM features f LEFT JOIN products p ON f.product_id = p.id WHERE 1=1'
    const params: any[] = []

    if (filters?.product_id) {
      params.push(filters.product_id)
      query += ` AND f.product_id = $${params.length}`
    }

    if (filters?.status) {
      params.push(filters.status)
      query += ` AND f.status = $${params.length}`
    }

    if (filters?.priority) {
      params.push(filters.priority)
      query += ` AND f.priority = $${params.length}`
    }

    query += ' ORDER BY f.created_at DESC'

    const result = await executeQuery(query, params)
    
    // Fetch platforms for each feature
    const featuresWithPlatforms = await Promise.all(
      (result.rows || []).map(async (feature) => {
        const platformsResult = await executeQuery(
          'SELECT platform FROM feature_platforms WHERE feature_id = $1',
          [feature.id]
        )
        return {
          ...feature,
          platforms: platformsResult.rows?.map((row) => row.platform) || []
        }
      })
    )
    
    return {
      success: true,
      data: featuresWithPlatforms,
      count: result.rowCount
    }
  } catch (error) {
    console.error('Error fetching features:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function getFeatureById(id: string) {
  try {
    const featureResult = await executeQuery('SELECT * FROM features WHERE id = $1', [id])

    if (!featureResult.rows || featureResult.rows.length === 0) {
      return {
        success: false,
        error: 'Feature not found'
      }
    }

    const platformsResult = await executeQuery(
      'SELECT platform FROM feature_platforms WHERE feature_id = $1',
      [id]
    )

    const feature = featureResult.rows![0]
    const platforms = platformsResult.rows?.map((row) => row.platform) || []

    return {
      success: true,
      data: {
        ...feature,
        platforms
      }
    }
  } catch (error) {
    console.error('Error fetching feature:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function createFeature(featureData: Partial<Feature> & { platforms?: string[] }) {
  let client: PoolClient | null = null

  try {
    const {
      product_id,
      title,
      overview,
      current_problems,
      requirements,
      priority,
      estimate,
      status,
      requestor,
      platforms = []
    } = featureData

    if (!product_id || !title) {
      return {
        success: false,
        error: 'Product ID and title are required'
      }
    }

    // Get a client from the pool for transaction
    const { getClient } = await import('./postgresqlAPI')
    client = await getClient()

    await client.query('BEGIN')

    const featureResult = await client.query<Feature>(
      `INSERT INTO features (
        product_id, title, overview, current_problems, requirements,
        priority, estimate, status, requestor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        product_id,
        title,
        overview,
        current_problems,
        requirements,
        priority,
        estimate,
        status,
        requestor
      ]
    )

    const feature = featureResult.rows[0]

    if (platforms.length > 0) {
      const platformValues = platforms
        .map((platform: string, index: number) => `($1, $${index + 2})`)
        .join(', ')

      await client.query(
        `INSERT INTO feature_platforms (feature_id, platform) VALUES ${platformValues}`,
        [feature.id, ...platforms]
      )
    }

    await client.query('COMMIT')

    return {
      success: true,
      data: {
        ...feature,
        platforms
      }
    }
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK')
    }
    console.error('Error creating feature:', error)
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

export async function updateFeature(
  id: string,
  featureData: Partial<Feature> & { platforms?: string[] }
) {
  let client: PoolClient | null = null

  try {
    const {
      title,
      overview,
      current_problems,
      requirements,
      priority,
      estimate,
      status,
      requestor,
      platforms
    } = featureData

    // Get a client from the pool for transaction
    const { getClient } = await import('./postgresqlAPI')
    client = await getClient()

    await client.query('BEGIN')

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`)
      values.push(title)
    }
    if (overview !== undefined) {
      updates.push(`overview = $${paramCount++}`)
      values.push(overview)
    }
    if (current_problems !== undefined) {
      updates.push(`current_problems = $${paramCount++}`)
      values.push(current_problems)
    }
    if (requirements !== undefined) {
      updates.push(`requirements = $${paramCount++}`)
      values.push(requirements)
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`)
      values.push(priority)
    }
    if (estimate !== undefined) {
      updates.push(`estimate = $${paramCount++}`)
      values.push(estimate)
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`)
      values.push(status)
    }
    if (requestor !== undefined) {
      updates.push(`requestor = $${paramCount++}`)
      values.push(requestor)
    }

    let feature

    if (updates.length > 0) {
      values.push(id)
      const query = `
        UPDATE features 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `

      const result = await client.query<Feature>(query, values)

      if (result.rows.length === 0) {
        await client.query('ROLLBACK')
        return {
          success: false,
          error: 'Feature not found'
        }
      }

      feature = result.rows[0]
    } else {
      const result = await client.query<Feature>('SELECT * FROM features WHERE id = $1', [id])

      if (result.rows.length === 0) {
        await client.query('ROLLBACK')
        return {
          success: false,
          error: 'Feature not found'
        }
      }

      feature = result.rows[0]
    }

    if (platforms !== undefined) {
      await client.query('DELETE FROM feature_platforms WHERE feature_id = $1', [id])

      if (platforms.length > 0) {
        const platformValues = platforms
          .map((platform: string, index: number) => `($1, $${index + 2})`)
          .join(', ')

        await client.query(
          `INSERT INTO feature_platforms (feature_id, platform) VALUES ${platformValues}`,
          [id, ...platforms]
        )
      }
    }

    await client.query('COMMIT')

    const platformsResult = await client.query(
      'SELECT platform FROM feature_platforms WHERE feature_id = $1',
      [id]
    )

    return {
      success: true,
      data: {
        ...feature,
        platforms: platformsResult.rows.map((row) => row.platform)
      }
    }
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK')
    }
    console.error('Error updating feature:', error)
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

export async function deleteFeature(id: string) {
  try {
    const result = await executeQuery('DELETE FROM features WHERE id = $1 RETURNING id', [id])

    if (result.rowCount === 0) {
      return {
        success: false,
        error: 'Feature not found'
      }
    }

    return {
      success: true,
      message: 'Feature deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting feature:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function getFeaturesByProduct(productId: string) {
  try {
    const result = await executeQuery(
      `SELECT f.*, 
        array_agg(fp.platform) FILTER (WHERE fp.platform IS NOT NULL) as platforms
      FROM features f
      LEFT JOIN feature_platforms fp ON f.id = fp.feature_id
      WHERE f.product_id = $1
      GROUP BY f.id
      ORDER BY f.created_at DESC`,
      [productId]
    )

    return {
      success: true,
      data: result.rows,
      count: result.rowCount
    }
  } catch (error) {
    console.error('Error fetching features by product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
