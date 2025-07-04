import axios from 'axios';
import { Client } from 'pg';
import frontMatter from 'front-matter';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// GitLab configuration
const GITLAB_BASE_URL = 'https://gitlab.com/api/v4';
const GITLAB_TOKEN = process.env.VITE_GITLAB_ACCESS_TOKEN;
const FEATURES_PROJECT_ID = 36518895;

// Feature issue IIDs (based on the codebase analysis)
const FEATURE_ISSUES = {
  FEATURE_REQUESTS: 1,
  MILESTONE_PLANNING: 2,
  ADHOC_TASKS: 3,
  UI_REQUESTS: 4
};

// PostgreSQL configuration
const pgConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

interface GitLabNote {
  id: number;
  body: string;
  author: {
    id: number;
    username: string;
    name: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
  system: boolean;
  noteable_id: number;
  noteable_iid: number;
}

interface FeatureYAML {
  title?: string;
  overview?: string;
  currentProblems?: string;
  requirements?: string;
  priority?: string;
  estimate?: number;
  status?: string;
  requestor?: string;
  platforms?: string[];
  productName?: string;
}

async function fetchGitLabNotes(issueIid: number, page: number = 1): Promise<GitLabNote[]> {
  try {
    const response = await axios.get(
      `${GITLAB_BASE_URL}/projects/${FEATURES_PROJECT_ID}/issues/${issueIid}/notes`,
      {
        headers: {
          'PRIVATE-TOKEN': GITLAB_TOKEN
        },
        params: {
          per_page: 100,
          page: page,
          order_by: 'created_at',
          sort: 'asc'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching notes for issue ${issueIid}:`, error);
    return [];
  }
}

async function parseFeatureFromNote(note: GitLabNote): Promise<{feature: any, platforms: string[], yamlData: FeatureYAML} | null> {
  try {
    // Skip system notes
    if (note.system) {
      return null;
    }
    
    // Parse front matter from note body
    const parsed = frontMatter(note.body);
    
    if (!parsed.attributes || Object.keys(parsed.attributes).length === 0) {
      console.log(`No front matter found in note #${note.id}`);
      return null;
    }
    
    const yamlData = parsed.attributes as FeatureYAML;
    
    // Map YAML data to database schema
    const feature = {
      title: yamlData.title || 'Untitled Feature',
      overview: yamlData.overview || null,
      current_problems: yamlData.currentProblems || null,
      requirements: yamlData.requirements || null,
      priority: yamlData.priority || 'medium',
      estimate: yamlData.estimate || null,
      status: yamlData.status || 'pending',
      requestor: yamlData.requestor || note.author.email || note.author.username,
      created_at: new Date(note.created_at),
      updated_at: new Date(note.updated_at),
      gitlab_issue_id: note.noteable_id,
      gitlab_issue_iid: note.noteable_iid,
      gitlab_project_id: FEATURES_PROJECT_ID,
      gitlab_note_id: note.id // Store the note ID as well
    };
    
    const platforms = yamlData.platforms || [];
    
    return { feature, platforms, yamlData };
  } catch (error) {
    console.error(`Error parsing front matter from note #${note.id}:`, error);
    return null;
  }
}

async function findProductByName(client: Client, productName: string): Promise<string | null> {
  try {
    const result = await client.query(
      'SELECT id FROM products WHERE name ILIKE $1 LIMIT 1',
      [`%${productName}%`]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding product:', error);
    return null;
  }
}

async function migrateFeatures() {
  const client = new Client(pgConfig);
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    let totalMigrated = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    
    // Process each feature issue type
    for (const [issueType, issueIid] of Object.entries(FEATURE_ISSUES)) {
      console.log(`\n========================================`);
      console.log(`Processing ${issueType} (Issue #${issueIid})`);
      console.log(`========================================`);
      
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        console.log(`\nFetching notes page ${page}...`);
        const notes = await fetchGitLabNotes(issueIid, page);
        
        if (notes.length === 0) {
          hasMore = false;
          break;
        }
        
        for (const note of notes) {
          console.log(`\nProcessing note #${note.id}`);
          
          // Check if already migrated using gitlab_note_id
          const checkResult = await client.query(
            'SELECT id FROM migration_status WHERE entity_type = $1 AND gitlab_id = $2 AND status = $3',
            ['feature', note.id, 'completed']
          );
          
          if (checkResult.rows.length > 0) {
            console.log(`  → Already migrated, skipping`);
            totalSkipped++;
            continue;
          }
          
          const parsedData = await parseFeatureFromNote(note);
          
          if (!parsedData) {
            // Record as failed migration if it's not a system note
            if (!note.system) {
              await client.query(
                `INSERT INTO migration_status (entity_type, gitlab_id, status, error_message) 
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (entity_type, gitlab_id) DO UPDATE 
                 SET status = $3, error_message = $4`,
                ['feature', note.id, 'failed', 'No valid YAML data found or system note']
              );
              totalFailed++;
            }
            continue;
          }
          
          const { feature, platforms, yamlData } = parsedData;
          
          // Try to find associated product
          let productId = null;
          if (yamlData.productName) {
            productId = await findProductByName(client, yamlData.productName);
            if (productId) {
              console.log(`  → Found product: ${yamlData.productName}`);
            } else {
              console.log(`  → Product not found: ${yamlData.productName}`);
            }
          }
          
          try {
            // Begin transaction for feature and platforms
            await client.query('BEGIN');
            
            // Insert feature into database
            const insertResult = await client.query(
              `INSERT INTO features (
                product_id, title, overview, current_problems, requirements,
                priority, estimate, status, requestor, created_at, updated_at,
                gitlab_issue_id, gitlab_issue_iid, gitlab_project_id
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
              RETURNING id`,
              [
                productId, feature.title, feature.overview, feature.current_problems,
                feature.requirements, feature.priority, feature.estimate,
                feature.status, feature.requestor, feature.created_at, feature.updated_at,
                feature.gitlab_issue_id, feature.gitlab_issue_iid, feature.gitlab_project_id
              ]
            );
            
            const featureId = insertResult.rows[0].id;
            
            // Insert platforms if any
            if (platforms.length > 0) {
              for (const platform of platforms) {
                await client.query(
                  'INSERT INTO feature_platforms (feature_id, platform) VALUES ($1, $2)',
                  [featureId, platform]
                );
              }
              console.log(`  → Added ${platforms.length} platforms`);
            }
            
            // Commit transaction
            await client.query('COMMIT');
            
            // Record successful migration
            await client.query(
              `INSERT INTO migration_status (entity_type, gitlab_id, postgres_id, status, migrated_at) 
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (entity_type, gitlab_id) DO UPDATE 
               SET postgres_id = $3, status = $4, migrated_at = $5`,
              ['feature', note.id, featureId, 'completed', new Date()]
            );
            
            console.log(`  ✓ Migrated successfully (ID: ${featureId}) - ${feature.title}`);
            totalMigrated++;
            
          } catch (error) {
            await client.query('ROLLBACK');
            console.error(`  ✗ Migration failed:`, error);
            
            // Record failed migration
            await client.query(
              `INSERT INTO migration_status (entity_type, gitlab_id, status, error_message) 
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (entity_type, gitlab_id) DO UPDATE 
               SET status = $3, error_message = $4`,
              ['feature', note.id, 'failed', (error as Error).message]
            );
            totalFailed++;
          }
        }
        
        // Check if there are more pages
        if (notes.length < 100) {
          hasMore = false;
        }
        page++;
      }
    }
    
    console.log('\n========================================');
    console.log('Migration Summary:');
    console.log(`Total features migrated: ${totalMigrated}`);
    console.log(`Total failed: ${totalFailed}`);
    console.log(`Total skipped (already migrated): ${totalSkipped}`);
    console.log('========================================\n');
    
    // Show migration statistics
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM migration_status
      WHERE entity_type = 'feature'
    `);
    
    console.log('Database statistics:', statsResult.rows[0]);
    
    // Show features with products vs without
    const productStatsResult = await client.query(`
      SELECT 
        COUNT(*) as total_features,
        SUM(CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END) as with_product,
        SUM(CASE WHEN product_id IS NULL THEN 1 ELSE 0 END) as without_product
      FROM features
    `);
    
    console.log('Feature-Product association:', productStatsResult.rows[0]);
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Main function
async function main() {
  console.log('Starting GitLab to PostgreSQL feature migration...');
  console.log(`GitLab Project: ${FEATURES_PROJECT_ID}`);
  console.log(`PostgreSQL Database: ${pgConfig.database}`);
  console.log('========================================\n');
  
  try {
    await migrateFeatures();
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}