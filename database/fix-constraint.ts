import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pgConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

async function main() {
  const client = new Client(pgConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if constraint exists
    const checkResult = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'migration_status' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'migration_status_entity_gitlab_unique'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('Adding unique constraint to migration_status table...');
      await client.query(`
        ALTER TABLE migration_status 
        ADD CONSTRAINT migration_status_entity_gitlab_unique 
        UNIQUE(entity_type, gitlab_id)
      `);
      console.log('✓ Constraint added successfully');
    } else {
      console.log('✓ Constraint already exists');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}