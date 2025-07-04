import { pool } from './postgresqlAPI'
import type { UiUxRequest } from '../@types/models/uiux.types'

// Get all UI/UX requests with optional filters
export async function getAllUiUxRequests(filters?: {
  status?: string
  priority?: string
  assignee?: string
  product_id?: string
}): Promise<{ success: boolean; data?: UiUxRequest[]; error?: string }> {
  try {
    let query = `
      SELECT 
        u.*,
        p.name as product_name,
        p.brand as product_brand,
        p.model as product_model
      FROM uiux_requests u
      LEFT JOIN products p ON u.product_id = p.id
      WHERE 1=1
    `
    const values: any[] = []
    let paramCount = 0

    if (filters?.status) {
      paramCount++
      query += ` AND u.status = $${paramCount}`
      values.push(filters.status)
    }

    if (filters?.priority) {
      paramCount++
      query += ` AND u.priority = $${paramCount}`
      values.push(filters.priority)
    }

    if (filters?.assignee) {
      paramCount++
      query += ` AND u.assignee = $${paramCount}`
      values.push(filters.assignee)
    }

    if (filters?.product_id) {
      paramCount++
      query += ` AND u.product_id = $${paramCount}`
      values.push(filters.product_id)
    }

    query += ' ORDER BY u.created_at DESC'

    const result = await pool.query(query, values)
    return { success: true, data: result.rows }
  } catch (error) {
    console.error('Error fetching UI/UX requests:', error)
    return { success: false, error: error.message }
  }
}

// Get a single UI/UX request by ID
export async function getUiUxRequestById(id: string): Promise<{ success: boolean; data?: UiUxRequest; error?: string }> {
  try {
    const query = `
      SELECT 
        u.*,
        p.name as product_name,
        p.brand as product_brand,
        p.model as product_model
      FROM uiux_requests u
      LEFT JOIN products p ON u.product_id = p.id
      WHERE u.id = $1
    `
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return { success: false, error: 'UI/UX request not found' }
    }
    
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error('Error fetching UI/UX request:', error)
    return { success: false, error: error.message }
  }
}

// Create a new UI/UX request
export async function createUiUxRequest(requestData: Partial<UiUxRequest>): Promise<{ success: boolean; data?: UiUxRequest; error?: string }> {
  try {
    const {
      product_id,
      title,
      description,
      priority,
      status = 'todo',
      step,
      assignee,
      requestor,
      due_date,
      completion_percentage = 0,
      tags = [],
      gitlab_tickets = [],
      gitlab_note_id,
      created_by
    } = requestData

    const query = `
      INSERT INTO uiux_requests (
        product_id, title, description, priority, status, step,
        assignee, requestor, due_date, completion_percentage,
        tags, gitlab_tickets, gitlab_note_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `
    const values = [
      product_id,
      title,
      description,
      priority,
      status,
      step,
      assignee,
      requestor,
      due_date,
      completion_percentage,
      tags,
      gitlab_tickets,
      gitlab_note_id,
      created_by
    ]

    const result = await pool.query(query, values)
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error('Error creating UI/UX request:', error)
    return { success: false, error: error.message }
  }
}

// Update a UI/UX request
export async function updateUiUxRequest(id: string, requestData: Partial<UiUxRequest>): Promise<{ success: boolean; data?: UiUxRequest; error?: string }> {
  try {
    const fields = []
    const values = []
    let paramCount = 0

    // Build dynamic update query
    const updateableFields = [
      'product_id', 'title', 'description', 'priority', 'status', 'step',
      'assignee', 'requestor', 'due_date', 'completion_percentage',
      'tags', 'gitlab_tickets'
    ]

    for (const field of updateableFields) {
      if (requestData[field] !== undefined) {
        paramCount++
        fields.push(`${field} = $${paramCount}`)
        values.push(requestData[field])
      }
    }

    if (fields.length === 0) {
      return { success: false, error: 'No fields to update' }
    }

    paramCount++
    values.push(id)

    const query = `
      UPDATE uiux_requests
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await pool.query(query, values)
    
    if (result.rows.length === 0) {
      return { success: false, error: 'UI/UX request not found' }
    }
    
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error('Error updating UI/UX request:', error)
    return { success: false, error: error.message }
  }
}

// Delete a UI/UX request
export async function deleteUiUxRequest(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const query = 'DELETE FROM uiux_requests WHERE id = $1 RETURNING id'
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return { success: false, error: 'UI/UX request not found' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting UI/UX request:', error)
    return { success: false, error: error.message }
  }
}

// Get UI/UX requests by product
export async function getUiUxRequestsByProduct(productId: string): Promise<{ success: boolean; data?: UiUxRequest[]; error?: string }> {
  try {
    const query = `
      SELECT * FROM uiux_requests
      WHERE product_id = $1
      ORDER BY created_at DESC
    `
    const result = await pool.query(query, [productId])
    return { success: true, data: result.rows }
  } catch (error) {
    console.error('Error fetching UI/UX requests by product:', error)
    return { success: false, error: error.message }
  }
}

// Get UI/UX request statistics
export async function getUiUxRequestStats(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_count,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_count,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_count,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_count
      FROM uiux_requests
    `
    const result = await pool.query(query)
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error('Error fetching UI/UX request stats:', error)
    return { success: false, error: error.message }
  }
}