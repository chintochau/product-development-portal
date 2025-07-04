import { Client } from 'pg';
import * as dotenv from 'dotenv';

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
    
    console.log('Altering migration_status table to use BIGINT for gitlab_id...');
    await client.query('ALTER TABLE migration_status ALTER COLUMN gitlab_id TYPE BIGINT');
    console.log('✓ Successfully updated gitlab_id to BIGINT');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}