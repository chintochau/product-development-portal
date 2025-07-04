import { Router } from 'express';
import { pool } from '../../server';

const router = Router();

// GET migration status
router.get('/status', async (req, res, next) => {
  try {
    const { entity_type } = req.query;
    
    let query = 'SELECT * FROM migration_status WHERE 1=1';
    const params: any[] = [];
    
    if (entity_type) {
      params.push(entity_type);
      query += ` AND entity_type = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    // Get summary stats
    const statsResult = await pool.query(`
      SELECT 
        entity_type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM migration_status
      GROUP BY entity_type
    `);
    
    res.json({
      success: true,
      data: result.rows,
      stats: statsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

// POST record migration result
router.post('/record', async (req, res, next) => {
  try {
    const {
      entity_type,
      gitlab_id,
      postgres_id,
      status,
      error_message
    } = req.body;
    
    if (!entity_type || !gitlab_id || !status) {
      return res.status(400).json({
        success: false,
        error: 'entity_type, gitlab_id, and status are required'
      });
    }
    
    const result = await pool.query(
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
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// POST batch record migration results
router.post('/record-batch', async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { records } = req.body;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'records array is required and must not be empty'
      });
    }
    
    await client.query('BEGIN');
    
    const results = [];
    
    for (const record of records) {
      const {
        entity_type,
        gitlab_id,
        postgres_id,
        status,
        error_message
      } = record;
      
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
      );
      
      results.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// DELETE reset migration status
router.delete('/reset/:entityType', async (req, res, next) => {
  try {
    const { entityType } = req.params;
    
    const result = await pool.query(
      'DELETE FROM migration_status WHERE entity_type = $1',
      [entityType]
    );
    
    res.json({
      success: true,
      message: `Deleted ${result.rowCount} migration records for ${entityType}`
    });
  } catch (error) {
    next(error);
  }
});

// GET check if entity is already migrated
router.get('/check/:entityType/:gitlabId', async (req, res, next) => {
  try {
    const { entityType, gitlabId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM migration_status WHERE entity_type = $1 AND gitlab_id = $2',
      [entityType, parseInt(gitlabId)]
    );
    
    res.json({
      success: true,
      migrated: result.rows.length > 0 && result.rows[0].status === 'completed',
      data: result.rows[0] || null
    });
  } catch (error) {
    next(error);
  }
});

export default router;