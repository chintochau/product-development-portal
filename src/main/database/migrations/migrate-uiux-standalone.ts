import { initializePostgreSQL, pool } from '../../postgresqlAPI'
import axios from 'axios'
import frontMatter from 'front-matter'
import dotenv from 'dotenv'

dotenv.config()

const FEATURES_PROJECTID = 36518895
const UIUX_ISSUE_IID = 4

// Get GitLab token from environment
const GITLAB_TOKEN = process.env.VITE_GITLAB_ACCESS_TOKEN

async function getNotesFromGitLab() {
  const url = `https://gitlab.com/api/v4/projects/${FEATURES_PROJECTID}/issues/${UIUX_ISSUE_IID}/notes`
  
  try {
    const response = await axios.get(url, {
      headers: {
        'PRIVATE-TOKEN': GITLAB_TOKEN
      },
      params: {
        per_page: 100,
        page: 1
      }
    })
    
    // Filter out system notes
    return response.data.filter((note: any) => !note.system)
  } catch (error) {
    console.error('Error fetching notes from GitLab:', error)
    throw error
  }
}

async function migrateUiUxRequests() {
  console.log('Starting UI/UX requests migration from GitLab to PostgreSQL...')
  
  try {
    // Initialize PostgreSQL connection
    await initializePostgreSQL()
    console.log('PostgreSQL connection established.')
    // Get all UI/UX requests from GitLab (stored as notes on issue #4)
    console.log('Fetching UI/UX requests from GitLab...')
    const gitlabRequests = await getNotesFromGitLab()
    console.log(`Found ${gitlabRequests.length} UI/UX requests to migrate`)

    let successCount = 0
    let errorCount = 0

    for (const request of gitlabRequests) {
      try {
        // Parse the YAML front matter
        const parsed = frontMatter(request.body)
        const attributes = parsed.attributes as any

        // Map numeric priority to text values
        let priority = null
        if (attributes.priority) {
          const numPriority = parseInt(attributes.priority)
          if (numPriority <= 2) priority = 'critical'
          else if (numPriority <= 4) priority = 'high'
          else if (numPriority <= 7) priority = 'medium'
          else priority = 'low'
        }

        // Map GitLab data to PostgreSQL schema
        const uiuxData = {
          product_id: attributes.product ? await getProductIdByGitlabIssueId(attributes.product) : null,
          title: attributes.title || 'Untitled Request',
          description: attributes.description || parsed.body || '',
          priority: priority,
          status: attributes.status || 'todo',
          step: attributes.step || null,
          assignee: attributes.assignee || null,
          requestor: attributes.by || request.author?.name || 'Unknown',
          due_date: attributes.dueDate || null,
          completion_percentage: attributes.completionPercentage || 0,
          tags: attributes.tags || [],
          gitlab_tickets: attributes.gitlabTickets || [],
          gitlab_note_id: request.id,
          created_by: request.author?.username || 'gitlab_import',
          created_at: request.created_at,
          updated_at: request.updated_at
        }

        // Check if already migrated
        const existingCheck = await pool.query(
          'SELECT id FROM uiux_requests WHERE gitlab_note_id = $1',
          [request.id]
        )

        if (existingCheck.rows.length > 0) {
          console.log(`UI/UX request ${request.id} already migrated, skipping...`)
          continue
        }

        // Insert into PostgreSQL
        const insertQuery = `
          INSERT INTO uiux_requests (
            product_id, title, description, priority, status, step,
            assignee, requestor, due_date, completion_percentage,
            tags, gitlab_tickets, gitlab_note_id, created_by,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING id
        `
        
        const values = [
          uiuxData.product_id,
          uiuxData.title,
          uiuxData.description,
          uiuxData.priority,
          uiuxData.status,
          uiuxData.step,
          uiuxData.assignee,
          uiuxData.requestor,
          uiuxData.due_date,
          uiuxData.completion_percentage,
          uiuxData.tags,
          uiuxData.gitlab_tickets,
          uiuxData.gitlab_note_id,
          uiuxData.created_by,
          uiuxData.created_at,
          uiuxData.updated_at
        ]

        const result = await pool.query(insertQuery, values)
        console.log(`✅ Migrated UI/UX request: ${uiuxData.title} (GitLab Note ID: ${request.id})`)
        successCount++
      } catch (error) {
        console.error(`❌ Error migrating UI/UX request ${request.id}:`, error)
        errorCount++
      }
    }

    console.log('\n=== Migration Summary ===')
    console.log(`✅ Successfully migrated: ${successCount} UI/UX requests`)
    console.log(`❌ Failed to migrate: ${errorCount} UI/UX requests`)
    console.log(`📊 Total processed: ${gitlabRequests.length} UI/UX requests`)

  } catch (error) {
    console.error('Fatal error during migration:', error)
    throw error
  }
}

// Helper function to get PostgreSQL product ID from GitLab issue ID
async function getProductIdByGitlabIssueId(gitlabIssueId: number | string): Promise<string | null> {
  try {
    // Skip if it's not a number
    const numId = parseInt(gitlabIssueId.toString())
    if (isNaN(numId)) {
      return null
    }
    
    const result = await pool.query(
      'SELECT id FROM products WHERE gitlab_issue_id = $1',
      [numId]
    )
    return result.rows.length > 0 ? result.rows[0].id : null
  } catch (error) {
    console.error(`Error finding product with GitLab issue ID ${gitlabIssueId}:`, error)
    return null
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUiUxRequests()
    .then(() => {
      console.log('Migration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}