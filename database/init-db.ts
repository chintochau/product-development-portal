import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const getDbConfig = (): DatabaseConfig => ({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'product_portal'
});

async function createDatabase() {
  const config = getDbConfig();
  
  // First connect without database to create it if needed
  const client = new Client({
    ...config,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    
    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.database]
    );
    
    if (result.rows.length === 0) {
      console.log(`Creating database: ${config.database}`);
      await client.query(`CREATE DATABASE ${config.database}`);
      console.log('Database created successfully');
    } else {
      console.log(`Database ${config.database} already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function runSchema() {
  const config = getDbConfig();
  const client = new Client(config);

  try {
    await client.connect();
    console.log('Connected to database');

    // First, try to grant permissions (might fail if not superuser, that's ok)
    try {
      await client.query(`
        GRANT ALL ON SCHEMA public TO CURRENT_USER;
        ALTER SCHEMA public OWNER TO CURRENT_USER;
      `);
    } catch (permError) {
      console.log('Note: Could not grant permissions (this is okay if not superuser)');
    }

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema migrations...');
    
    // Remove comments and empty lines from schema
    const cleanSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');
    
    // Try to run as single transaction first
    try {
      await client.query('BEGIN');
      await client.query(cleanSchema);
      await client.query('COMMIT');
      console.log('✓ Schema created successfully in transaction');
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.log('Transaction failed, will create tables individually...');
      console.error('Transaction error:', error.message);
      
      // If transaction fails, we need to execute the schema file directly
      // This is more reliable than trying to parse SQL
      console.log('\nExecuting schema file statements...');
      
      // Execute the schema using psql-style execution
      const statements = cleanSchema
        .split(/;\s*$/m)  // Split on semicolons at end of lines
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      let successCount = 0;
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        try {
          await client.query(statement);
          successCount++;
          
          // Log what was created
          if (statement.includes('CREATE TABLE')) {
            const match = statement.match(/CREATE TABLE\s+(\w+)/i);
            if (match) console.log(`✓ Created table: ${match[1]}`);
          } else if (statement.includes('CREATE INDEX')) {
            const match = statement.match(/CREATE INDEX\s+(\w+)/i);
            if (match) console.log(`✓ Created index: ${match[1]}`);
          } else if (statement.includes('CREATE VIEW')) {
            const match = statement.match(/CREATE VIEW\s+(\w+)/i);
            if (match) console.log(`✓ Created view: ${match[1]}`);
          } else if (statement.includes('CREATE FUNCTION')) {
            const match = statement.match(/CREATE (?:OR REPLACE )?FUNCTION\s+(\w+)/i);
            if (match) console.log(`✓ Created function: ${match[1]}`);
          } else if (statement.includes('CREATE TRIGGER')) {
            const match = statement.match(/CREATE TRIGGER\s+(\w+)/i);
            if (match) console.log(`✓ Created trigger: ${match[1]}`);
          } else if (statement.includes('CREATE EXTENSION')) {
            console.log(`✓ Created extension`);
          }
        } catch (err: any) {
          // Handle specific errors
          if (err.code === '42P07') {
            console.log(`⚠ Relation already exists, skipping`);
          } else if (err.code === '42710') {
            console.log(`⚠ Object already exists, skipping`);
          } else if (err.code === '42P06') {
            console.log(`⚠ Schema already exists, skipping`);
          } else if (err.code === '42501' && statement.includes('GRANT')) {
            console.log(`⚠ Permission denied for GRANT, skipping`);
          } else {
            console.error(`\n✗ Failed to execute statement ${i + 1}/${statements.length}`);
            console.error(`Error: ${err.message}`);
            console.error(`Statement: ${statement.substring(0, 100)}...`);
            throw err;
          }
        }
      }
      
      console.log(`\n✓ Successfully executed ${successCount}/${statements.length} statements`);
    }
    
    console.log('Schema created successfully');

    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\nCreated tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verify views were created
    const viewsResult = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nCreated views:');
    viewsResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('Error running schema:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    console.log('Initializing PostgreSQL database...\n');
    
    // Step 1: Create database if it doesn't exist
    await createDatabase();
    
    // Step 2: Run schema
    await runSchema();
    
    console.log('\nDatabase initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the API server: npm run api:dev');
    console.log('2. Run migration scripts: npm run migrate:products');
    console.log('3. Test the connection in Admin Panel');
    
  } catch (error) {
    console.error('\nDatabase initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}