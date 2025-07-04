import { Pool } from 'pg'
import axios from 'axios'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') })

// GitLab configuration
const GITLAB_BASE_URL = 'https://gitlab.com/api/v4'
const GITLAB_TOKEN = process.env.VITE_GITLAB_API_TOKEN
const PRODUCT_PROJECT_ID = 61440508
const FEATURES_PROJECT_ID = 36518895

// PostgreSQL configuration
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
})

interface GitLabNote {
  id: number
  body: string
  author: {
    name: string
    username: string
  }
  created_at: string
  noteable_id: number
  noteable_type: string
}

interface ProductMapping {
  gitlab_issue_id: number
  postgres_id: string
}

interface FeatureMapping {
  gitlab_issue_id: number
  postgres_id: string
}

// Fetch comments/notes from GitLab issue
async function fetchGitLabNotes(projectId: number, issueIid: number): Promise<GitLabNote[]> {
  try {
    const response = await axios.get(
      `${GITLAB_BASE_URL}/projects/${projectId}/issues/${issueIid}/notes`,
      {
        headers: {
          'Private-Token': GITLAB_TOKEN
        },
        params: {
          per_page: 100
        }
      }
    )
    return response.data
  } catch (error) {
    console.error(`Error fetching notes for issue ${issueIid}:`, error.message)
    return []
  }
}

// Get product and feature mappings from PostgreSQL
async function getMappings() {
  const productQuery = `
    SELECT id as postgres_id, gitlab_issue_iid as gitlab_issue_id 
    FROM products 
    WHERE gitlab_issue_iid IS NOT NULL
  `
  const featureQuery = `
    SELECT id as postgres_id, gitlab_issue_id 
    FROM features 
    WHERE gitlab_issue_id IS NOT NULL
  `
  
  const [productResult, featureResult] = await Promise.all([
    pool.query(productQuery),
    pool.query(featureQuery)
  ])
  
  return {
    products: productResult.rows as ProductMapping[],
    features: featureResult.rows as FeatureMapping[]
  }
}

// Insert comment into PostgreSQL
async function insertComment(comment: {
  entity_type: string
  entity_id: string
  author: string
  author_username: string
  content: string
  gitlab_note_id: number
  gitlab_created_at: string
}) {
  const query = `
    INSERT INTO comments (
      entity_type, entity_id, author, author_username, 
      content, gitlab_note_id, gitlab_created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (gitlab_note_id) DO NOTHING
    RETURNING id
  `
  
  const values = [
    comment.entity_type,
    comment.entity_id,
    comment.author,
    comment.author_username,
    comment.content,
    comment.gitlab_note_id,
    comment.gitlab_created_at
  ]
  
  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error inserting comment:', error)
    throw error
  }
}

// Main migration function
async function migrateComments() {
  console.log('Starting comment migration from GitLab to PostgreSQL...')
  
  try {
    // First, run the SQL migration to create the comments table
    console.log('Creating comments table...')
    const sqlMigration = require('fs').readFileSync(
      path.join(__dirname, '001-add-comments-table.sql'), 
      'utf8'
    )
    await pool.query(sqlMigration)
    console.log('Comments table created successfully')
    
    // Get mappings
    const { products, features } = await getMappings()
    console.log(`Found ${products.length} products and ${features.length} features to process`)
    
    let totalComments = 0
    
    // Migrate product comments
    console.log('\nMigrating product comments...')
    for (const product of products) {
      const notes = await fetchGitLabNotes(PRODUCT_PROJECT_ID, product.gitlab_issue_id)
      
      for (const note of notes) {
        // Skip system notes and empty notes
        if (note.body.includes('changed the description') || 
            note.body.includes('mentioned in') ||
            note.body.trim() === '') {
          continue
        }
        
        await insertComment({
          entity_type: 'product',
          entity_id: product.postgres_id,
          author: note.author.name,
          author_username: note.author.username,
          content: note.body,
          gitlab_note_id: note.id,
          gitlab_created_at: note.created_at
        })
        totalComments++
      }
      
      console.log(`  Processed product ${product.gitlab_issue_id}`)
    }
    
    // Migrate feature comments
    console.log('\nMigrating feature comments...')
    for (const feature of features) {
      const notes = await fetchGitLabNotes(FEATURES_PROJECT_ID, feature.gitlab_issue_id)
      
      for (const note of notes) {
        // Skip system notes and empty notes
        if (note.body.includes('changed the description') || 
            note.body.includes('mentioned in') ||
            note.body.trim() === '') {
          continue
        }
        
        await insertComment({
          entity_type: 'feature',
          entity_id: feature.postgres_id,
          author: note.author.name,
          author_username: note.author.username,
          content: note.body,
          gitlab_note_id: note.id,
          gitlab_created_at: note.created_at
        })
        totalComments++
      }
      
      console.log(`  Processed feature ${feature.gitlab_issue_id}`)
    }
    
    console.log(`\nMigration completed! Total comments migrated: ${totalComments}`)
    
    // Update migration status
    await pool.query(`
      INSERT INTO migration_status (entity_type, status, migrated_at)
      VALUES ('comments', 'completed', CURRENT_TIMESTAMP)
    `)
    
  } catch (error) {
    console.error('Migration failed:', error)
    
    // Record failure
    await pool.query(`
      INSERT INTO migration_status (entity_type, status, error_message, migrated_at)
      VALUES ('comments', 'failed', $1, CURRENT_TIMESTAMP)
    `, [error.message])
    
    throw error
  } finally {
    await pool.end()
  }
}

// Run migration
if (require.main === module) {
  migrateComments()
    .then(() => {
      console.log('Comment migration completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Comment migration failed:', error)
      process.exit(1)
    })
}

export { migrateComments }