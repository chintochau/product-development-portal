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

async function main() {
  const config = getDbConfig();
  console.log('Initializing PostgreSQL database...');
  console.log(`Database: ${config.database}`);
  console.log(`Host: ${config.host}:${config.port}`);

  // First, ensure database exists
  const adminClient = new Client({
    ...config,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.database]
    );
    
    if (dbCheck.rows.length === 0) {
      console.log(`Creating database: ${config.database}`);
      await adminClient.query(`CREATE DATABASE "${config.database}"`);
    }
  } catch (error) {
    console.error('Error checking/creating database:', error);
  } finally {
    await adminClient.end();
  }

  // Now connect to the target database
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...');
    
    // Execute the entire schema file
    // PostgreSQL can handle multiple statements in one query
    await client.query(schema);
    
    console.log('✓ Schema executed successfully');

    // Verify what was created
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\nCreated ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    const views = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (views.rows.length > 0) {
      console.log(`\nCreated ${views.rows.length} views:`);
      views.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }

    console.log('\n✅ Database initialization completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Schema execution failed:', error.message);
    
    // If it's a multi-statement error, try using psql command
    if (error.message.includes('multiple commands') || error.code === '42601') {
      console.log('\nTry running with psql directly:');
      console.log(`psql -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} -f database/schema.sql`);
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}