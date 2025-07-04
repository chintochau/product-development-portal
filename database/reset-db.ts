import { Client } from 'pg';
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

async function dropAllTables() {
  const config = getDbConfig();
  const client = new Client(config);

  try {
    await client.connect();
    console.log('Connected to database');

    // Get all tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log(`Found ${tablesResult.rows.length} tables to drop`);

    // Drop all tables with CASCADE
    for (const row of tablesResult.rows) {
      const tableName = row.tablename;
      console.log(`Dropping table: ${tableName}`);
      await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
    }

    // Drop all views
    const viewsResult = await client.query(`
      SELECT viewname 
      FROM pg_views 
      WHERE schemaname = 'public'
      ORDER BY viewname;
    `);

    console.log(`Found ${viewsResult.rows.length} views to drop`);

    for (const row of viewsResult.rows) {
      const viewName = row.viewname;
      console.log(`Dropping view: ${viewName}`);
      await client.query(`DROP VIEW IF EXISTS ${viewName} CASCADE`);
    }

    // Drop all functions (except those from extensions)
    const functionsResult = await client.query(`
      SELECT p.proname as routine_name
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
      WHERE n.nspname = 'public' 
      AND d.objid IS NULL
      AND p.prokind = 'f';
    `);

    console.log(`Found ${functionsResult.rows.length} functions to drop`);

    for (const row of functionsResult.rows) {
      const functionName = row.routine_name;
      console.log(`Dropping function: ${functionName}`);
      try {
        await client.query(`DROP FUNCTION IF EXISTS ${functionName} CASCADE`);
      } catch (err) {
        console.log(`  Warning: Could not drop function ${functionName}: ${(err as Error).message}`);
      }
    }

    console.log('\nDatabase reset completed successfully!');
    console.log('Run "npm run db:init" to recreate the schema');

  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('WARNING: This will drop all tables, views, and functions in the database!');
  console.log('Database:', getDbConfig().database);
  console.log('\nPress Ctrl+C to cancel or wait 5 seconds to continue...\n');
  
  // Give user time to cancel
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await dropAllTables();
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Reset failed:', err);
    process.exit(1);
  });
}