import { Router } from 'express';
import { pool } from '../../server';

const router = Router();

// Feature interface
interface Feature {
  id: string;
  product_id: string;
  title: string;
  overview?: string;
  current_problems?: string;
  requirements?: string;
  priority?: string;
  estimate?: number;
  status?: string;
  requestor?: string;
  created_at: Date;
  updated_at: Date;
  gitlab_issue_id?: number;
}

// GET all features
router.get('/', async (req, res, next) => {
  try {
    const { product_id, status, priority } = req.query;
    
    let query = 'SELECT f.*, p.name as product_name FROM features f LEFT JOIN products p ON f.product_id = p.id WHERE 1=1';
    const params: any[] = [];
    
    if (product_id) {
      params.push(product_id);
      query += ` AND f.product_id = $${params.length}`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND f.status = $${params.length}`;
    }
    
    if (priority) {
      params.push(priority);
      query += ` AND f.priority = $${params.length}`;
    }
    
    query += ' ORDER BY f.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    next(error);
  }
});

// GET single feature by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const featureResult = await pool.query<Feature>(
      'SELECT * FROM features WHERE id = $1',
      [id]
    );
    
    if (featureResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feature not found'
      });
    }
    
    // Get associated platforms
    const platformsResult = await pool.query(
      'SELECT platform FROM feature_platforms WHERE feature_id = $1',
      [id]
    );
    
    const feature = featureResult.rows[0];
    const platforms = platformsResult.rows.map(row => row.platform);
    
    res.json({
      success: true,
      data: {
        ...feature,
        platforms
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST create new feature
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  
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
    } = req.body;
    
    // Validate required fields
    if (!product_id || !title) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and title are required'
      });
    }
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Insert feature
    const featureResult = await client.query<Feature>(
      `INSERT INTO features (
        product_id, title, overview, current_problems, requirements,
        priority, estimate, status, requestor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        product_id, title, overview, current_problems, requirements,
        priority, estimate, status, requestor
      ]
    );
    
    const feature = featureResult.rows[0];
    
    // Insert platforms if any
    if (platforms.length > 0) {
      const platformValues = platforms.map((platform: string, index: number) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      await client.query(
        `INSERT INTO feature_platforms (feature_id, platform) VALUES ${platformValues}`,
        [feature.id, ...platforms]
      );
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      data: {
        ...feature,
        platforms
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// PUT update feature
router.put('/:id', async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
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
    } = req.body;
    
    await client.query('BEGIN');
    
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (overview !== undefined) {
      updates.push(`overview = $${paramCount++}`);
      values.push(overview);
    }
    if (current_problems !== undefined) {
      updates.push(`current_problems = $${paramCount++}`);
      values.push(current_problems);
    }
    if (requirements !== undefined) {
      updates.push(`requirements = $${paramCount++}`);
      values.push(requirements);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (estimate !== undefined) {
      updates.push(`estimate = $${paramCount++}`);
      values.push(estimate);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (requestor !== undefined) {
      updates.push(`requestor = $${paramCount++}`);
      values.push(requestor);
    }
    
    let feature;
    
    if (updates.length > 0) {
      values.push(id);
      const query = `
        UPDATE features 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await client.query<Feature>(query, values);
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Feature not found'
        });
      }
      
      feature = result.rows[0];
    } else {
      // If no updates to feature table, just get the feature
      const result = await client.query<Feature>(
        'SELECT * FROM features WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Feature not found'
        });
      }
      
      feature = result.rows[0];
    }
    
    // Update platforms if provided
    if (platforms !== undefined) {
      // Delete existing platforms
      await client.query(
        'DELETE FROM feature_platforms WHERE feature_id = $1',
        [id]
      );
      
      // Insert new platforms
      if (platforms.length > 0) {
        const platformValues = platforms.map((platform: string, index: number) => 
          `($1, $${index + 2})`
        ).join(', ');
        
        await client.query(
          `INSERT INTO feature_platforms (feature_id, platform) VALUES ${platformValues}`,
          [id, ...platforms]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Get final platforms
    const platformsResult = await client.query(
      'SELECT platform FROM feature_platforms WHERE feature_id = $1',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...feature,
        platforms: platformsResult.rows.map(row => row.platform)
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// DELETE feature
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM features WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feature not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Feature deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET features by product
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const result = await pool.query(
      `SELECT f.*, 
        array_agg(fp.platform) FILTER (WHERE fp.platform IS NOT NULL) as platforms
      FROM features f
      LEFT JOIN feature_platforms fp ON f.id = fp.feature_id
      WHERE f.product_id = $1
      GROUP BY f.id
      ORDER BY f.created_at DESC`,
      [productId]
    );
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    next(error);
  }
});

export default router;