import { Client, ClientConfig, Pool, PoolConfig, PoolClient } from 'pg'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Types
interface ConnectionInfo {
  connected: boolean
  currentTime?: Date
  version?: string
  database?: string
  host?: string
  port?: number
  error?: string
}

interface QueryResult<T = any> {
  success: boolean
  rows?: T[]
  rowCount?: number
  error?: string
}

interface InitResult {
  success: boolean
  error?: string
}

interface TablesResult {
  success: boolean
  tables?: string[]
  error?: string
}

// PostgreSQL connection configuration
const dbConfig: PoolConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  connectionTimeoutMillis: 10000,
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  ssl: {
    rejectUnauthorized: false // For remote connections
  }
}

let pool: Pool | null = null

// Test database connection
export async function testPostgreSQLConnection(): Promise<ConnectionInfo> {
  try {
    console.log('Testing PostgreSQL connection...')
    const testPool = new Pool(dbConfig)

    // Test query
    const result = await testPool.query<{
      current_time: Date
      pg_version: string
    }>('SELECT NOW() as current_time, version() as pg_version')

    const connectionInfo: ConnectionInfo = {
      connected: true,
      currentTime: result.rows[0].current_time,
      version: result.rows[0].pg_version,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    }

    await testPool.end()

    console.log('PostgreSQL connection successful:', connectionInfo)
    return connectionInfo
  } catch (error) {
    console.error('PostgreSQL connection failed:', (error as Error).message)
    return {
      connected: false,
      error: (error as Error).message,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port
    }
  }
}

// Initialize connection
export async function initializePostgreSQL(): Promise<InitResult> {
  try {
    if (pool) {
      await pool.end()
    }

    pool = new Pool(dbConfig)

    // Test the pool connection
    const client = await pool.connect()
    client.release()

    console.log('PostgreSQL pool initialized')
    return { success: true }
  } catch (error) {
    console.error('Failed to initialize PostgreSQL:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Close connection
export async function closePostgreSQL(): Promise<InitResult> {
  try {
    if (pool) {
      await pool.end()
      pool = null
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to close PostgreSQL connection:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Execute query
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  try {
    if (!pool) {
      throw new Error('Database not connected. Call initializePostgreSQL first.')
    }

    const result = await pool.query(query, params)
    return {
      success: true,
      rows: result.rows as T[],
      rowCount: result.rowCount ?? 0
    }
  } catch (error) {
    console.error('Query execution failed:', error)
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

// Get a client from the pool for transactions
export async function getClient(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Database not connected. Call initializePostgreSQL first.')
  }
  return pool.connect()
}

// Check if tables exist
export async function checkTablesExist(): Promise<TablesResult> {
  try {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `

    const result = await executeQuery<{ table_name: string }>(query)
    if (result.success && result.rows) {
      return {
        success: true,
        tables: result.rows.map((row) => row.table_name)
      }
    }
    return {
      success: false,
      error: result.error || 'Unknown error'
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

// Export pool for direct use in migration scripts
export { pool }
