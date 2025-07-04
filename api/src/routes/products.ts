import { Router } from 'express';
import { pool } from '../../server';
import { QueryResult } from 'pg';

const router = Router();

// Product interface
interface Product {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  status?: string;
  mp1_date?: Date;
  launch_date?: Date;
  description?: string;
  epic_id?: number;
  lookup_code?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  gitlab_issue_id?: number;
}

// GET all products
router.get('/', async (req, res, next) => {
  try {
    const { status, brand } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    if (brand) {
      params.push(brand);
      query += ` AND brand = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query<Product>(query, params);
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    next(error);
  }
});

// GET single product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query<Product>(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// POST create new product
router.post('/', async (req, res, next) => {
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
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required'
      });
    }
    
    const result = await pool.query<Product>(
      `INSERT INTO products (
        name, brand, model, status, mp1_date, launch_date,
        description, epic_id, lookup_code, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name, brand, model, status, mp1_date, launch_date,
        description, epic_id, lookup_code, created_by
      ]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// PUT update product
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      brand,
      model,
      status,
      mp1_date,
      launch_date,
      description,
      epic_id,
      lookup_code
    } = req.body;
    
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (brand !== undefined) {
      updates.push(`brand = $${paramCount++}`);
      values.push(brand);
    }
    if (model !== undefined) {
      updates.push(`model = $${paramCount++}`);
      values.push(model);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (mp1_date !== undefined) {
      updates.push(`mp1_date = $${paramCount++}`);
      values.push(mp1_date);
    }
    if (launch_date !== undefined) {
      updates.push(`launch_date = $${paramCount++}`);
      values.push(launch_date);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (epic_id !== undefined) {
      updates.push(`epic_id = $${paramCount++}`);
      values.push(epic_id);
    }
    if (lookup_code !== undefined) {
      updates.push(`lookup_code = $${paramCount++}`);
      values.push(lookup_code);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    values.push(id);
    const query = `
      UPDATE products 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query<Product>(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// DELETE product
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET product summary (using view)
router.get('/:id/summary', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM product_summary WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

export default router;