import axios from 'axios';
import { Client } from 'pg';
import * as yaml from 'js-yaml';
import frontMatter from 'front-matter';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// GitLab configuration
const GITLAB_BASE_URL = 'https://gitlab.com/api/v4';
const GITLAB_TOKEN = process.env.VITE_GITLAB_ACCESS_TOKEN;
const PRODUCTS_PROJECT_ID = 61440508;

// PostgreSQL configuration
const pgConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

// API configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

interface GitLabIssue {
  id: number;
  iid: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  labels: string[];
  author: {
    username: string;
    name: string;
  };
}

interface ProductYAML {
  useLookup?: boolean;
  lookup?: string;
  brand?: string;
  projectName?: string;
  mp1Date?: string;
  launch?: string;
  status?: string;
  description?: string;
  model?: string;
  pifDate?: string;
  pifDateAccepted?: string;
  mp1DateActual?: string;
  greenlightDate?: string;
  greenlightTargetMP?: string;
  bluos?: boolean;
}

async function fetchGitLabIssues(page: number = 1): Promise<GitLabIssue[]> {
  try {
    const response = await axios.get(`${GITLAB_BASE_URL}/projects/${PRODUCTS_PROJECT_ID}/issues`, {
      headers: {
        'PRIVATE-TOKEN': GITLAB_TOKEN
      },
      params: {
        per_page: 100,
        page: page,
        state: 'all',
        labels: 'product'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching GitLab issues:', error);
    throw error;
  }
}

async function parseProductFromIssue(issue: GitLabIssue): Promise<{product: any, yamlData: ProductYAML} | null> {
  try {
    // Skip non-product issues
    if (!issue.labels.includes('product')) {
      console.log(`Issue #${issue.iid} is not labeled as product, skipping`);
      return null;
    }
    
    // Parse front matter from issue description
    const parsed = frontMatter(issue.description);
    
    if (!parsed.attributes || Object.keys(parsed.attributes).length === 0) {
      console.log(`No front matter found in issue #${issue.iid}: ${issue.title}`);
      return null;
    }
    
    const yamlData = parsed.attributes as ProductYAML;
    
    // Map YAML data to database schema
    const product = {
      name: yamlData.projectName || issue.title,
      brand: yamlData.brand || null,
      model: yamlData.model || null,
      status: yamlData.status || 'Active',
      mp1_date: yamlData.mp1Date ? new Date(yamlData.mp1Date) : null,
      launch_date: yamlData.launch ? new Date(yamlData.launch) : null,
      description: yamlData.description || parsed.body || null,
      epic_id: null, // Not in the current YAML structure
      lookup_code: yamlData.lookup || null,
      created_by: issue.author.username,
      gitlab_issue_id: issue.id,
      gitlab_issue_iid: issue.iid,
      gitlab_project_id: PRODUCTS_PROJECT_ID
    };
    
    return { product, yamlData };
  } catch (error) {
    console.error(`Error parsing front matter from issue #${issue.iid}:`, error);
    return null;
  }
}

async function migrateProducts() {
  const client = new Client(pgConfig);
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    let page = 1;
    let totalMigrated = 0;
    let totalFailed = 0;
    let hasMore = true;
    
    while (hasMore) {
      console.log(`\nFetching GitLab issues page ${page}...`);
      const issues = await fetchGitLabIssues(page);
      
      if (issues.length === 0) {
        hasMore = false;
        break;
      }
      
      for (const issue of issues) {
        console.log(`\nProcessing issue #${issue.iid}: ${issue.title}`);
        
        // Check if already migrated
        const checkResult = await client.query(
          'SELECT id FROM migration_status WHERE entity_type = $1 AND gitlab_id = $2 AND status = $3',
          ['product', issue.id, 'completed']
        );
        
        if (checkResult.rows.length > 0) {
          console.log(`  → Already migrated, skipping`);
          continue;
        }
        
        const parsedData = await parseProductFromIssue(issue);
        
        if (!parsedData) {
          // Record as failed migration
          await client.query(
            `INSERT INTO migration_status (entity_type, gitlab_id, status, error_message) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (entity_type, gitlab_id) DO UPDATE 
             SET status = $3, error_message = $4`,
            ['product', issue.id, 'failed', 'No valid YAML data found']
          );
          totalFailed++;
          continue;
        }
        
        const { product } = parsedData;
        
        try {
          // Insert product into database
          const insertResult = await client.query(
            `INSERT INTO products (
              name, brand, model, status, mp1_date, launch_date,
              description, epic_id, lookup_code, created_by,
              gitlab_issue_id, gitlab_issue_iid, gitlab_project_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id`,
            [
              product.name, product.brand, product.model, product.status,
              product.mp1_date, product.launch_date, product.description,
              product.epic_id, product.lookup_code, product.created_by,
              product.gitlab_issue_id, product.gitlab_issue_iid, product.gitlab_project_id
            ]
          );
          
          const productId = insertResult.rows[0].id;
          
          // Record successful migration
          await client.query(
            `INSERT INTO migration_status (entity_type, gitlab_id, postgres_id, status, migrated_at) 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (entity_type, gitlab_id) DO UPDATE 
             SET postgres_id = $3, status = $4, migrated_at = $5`,
            ['product', issue.id, productId, 'completed', new Date()]
          );
          
          console.log(`  ✓ Migrated successfully (ID: ${productId})`);
          totalMigrated++;
          
        } catch (error) {
          console.error(`  ✗ Migration failed:`, error);
          
          // Record failed migration
          await client.query(
            `INSERT INTO migration_status (entity_type, gitlab_id, status, error_message) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (entity_type, gitlab_id) DO UPDATE 
             SET status = $3, error_message = $4`,
            ['product', issue.id, 'failed', (error as Error).message]
          );
          totalFailed++;
        }
      }
      
      // Check if there are more pages
      if (issues.length < 100) {
        hasMore = false;
      }
      page++;
    }
    
    console.log('\n========================================');
    console.log('Migration Summary:');
    console.log(`Total products migrated: ${totalMigrated}`);
    console.log(`Total failed: ${totalFailed}`);
    console.log('========================================\n');
    
    // Show migration statistics
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM migration_status
      WHERE entity_type = 'product'
    `);
    
    console.log('Database statistics:', statsResult.rows[0]);
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Main function
async function main() {
  console.log('Starting GitLab to PostgreSQL product migration...');
  console.log(`GitLab Project: ${PRODUCTS_PROJECT_ID}`);
  console.log(`PostgreSQL Database: ${pgConfig.database}`);
  console.log('========================================\n');
  
  try {
    await migrateProducts();
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