import { executeQuery } from './postgresqlAPI'

interface Product {
  id: string
  name: string
  brand?: string
  model?: string
  status?: string
  mp1_date?: Date
  launch_date?: Date
  description?: string
  epic_id?: number
  lookup_code?: string
  created_at: Date
  updated_at: Date
  created_by?: string
  gitlab_issue_id?: number
}

export async function getAllProducts(filters?: { status?: string; brand?: string }) {
  try {
    let query = 'SELECT * FROM products WHERE 1=1'
    const params: any[] = []

    if (filters?.status) {
      params.push(filters.status)
      query += ` AND status = $${params.length}`
    }

    if (filters?.brand) {
      params.push(filters.brand)
      query += ` AND brand = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'

    const result = await executeQuery(query, params)
    return {
      success: true,
      data: result.rows,
      count: result.rowCount
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function getProductById(id: string) {
  try {
    const result = await executeQuery('SELECT * FROM products WHERE id = $1', [id])

    if (!result.rows || result.rows.length === 0) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    return {
      success: true,
      data: result.rows![0]
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function createProduct(productData: Partial<Product>) {
  try {
    const {
      name,
      brand,
      model,
      status,
      mp1_date,
      launch_date,
      description,
      epic_id,
      lookup_code,
      created_by
    } = productData

    if (!name) {
      return {
        success: false,
        error: 'Product name is required'
      }
    }

    const result = await executeQuery(
      `INSERT INTO products (
        name, brand, model, status, mp1_date, launch_date,
        description, epic_id, lookup_code, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name,
        brand,
        model,
        status,
        mp1_date,
        launch_date,
        description,
        epic_id,
        lookup_code,
        created_by
      ]
    )

    return {
      success: true,
      data: result.rows![0]
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  try {
    const { name, brand, model, status, mp1_date, launch_date, description, epic_id, lookup_code } =
      productData

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      values.push(name)
    }
    if (brand !== undefined) {
      updates.push(`brand = $${paramCount++}`)
      values.push(brand)
    }
    if (model !== undefined) {
      updates.push(`model = $${paramCount++}`)
      values.push(model)
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`)
      values.push(status)
    }
    if (mp1_date !== undefined) {
      updates.push(`mp1_date = $${paramCount++}`)
      values.push(mp1_date)
    }
    if (launch_date !== undefined) {
      updates.push(`launch_date = $${paramCount++}`)
      values.push(launch_date)
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(description)
    }
    if (epic_id !== undefined) {
      updates.push(`epic_id = $${paramCount++}`)
      values.push(epic_id)
    }
    if (lookup_code !== undefined) {
      updates.push(`lookup_code = $${paramCount++}`)
      values.push(lookup_code)
    }

    if (updates.length === 0) {
      return {
        success: false,
        error: 'No fields to update'
      }
    }

    values.push(id)
    const query = `
      UPDATE products 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await executeQuery(query, values)

    if (!result.rows || result.rows.length === 0) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    return {
      success: true,
      data: result.rows![0]
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function deleteProduct(id: string) {
  try {
    const result = await executeQuery('DELETE FROM products WHERE id = $1 RETURNING id', [id])

    if (result.rowCount === 0) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    return {
      success: true,
      message: 'Product deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function getProductSummary(id: string) {
  try {
    const result = await executeQuery('SELECT * FROM product_summary WHERE id = $1', [id])

    if (!result.rows || result.rows.length === 0) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    return {
      success: true,
      data: result.rows![0]
    }
  } catch (error) {
    console.error('Error fetching product summary:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
