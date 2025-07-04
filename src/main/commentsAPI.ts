import { executeQuery } from './postgresqlAPI'
import type { ApiListResponse, ApiResponse } from '../@types/api'

export interface Comment {
  id: string
  entity_type: 'product' | 'feature'
  entity_id: string
  author: string
  author_username: string
  content: string
  gitlab_note_id?: number
  gitlab_created_at?: Date
  created_at: Date
  updated_at: Date
}

export interface CommentCreateInput {
  entity_type: 'product' | 'feature'
  entity_id: string
  author: string
  author_username: string
  content: string
}

export interface CommentUpdateInput {
  content?: string
}

// Get all comments for an entity
export async function getCommentsByEntity(
  entityType: 'product' | 'feature',
  entityId: string
): Promise<ApiListResponse<Comment>> {
  try {
    const query = `
      SELECT * FROM comments
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY created_at DESC
    `
    const result = await executeQuery(query, [entityType, entityId])

    return {
      success: true,
      data: result.rows || [],
      count: result.rows?.length || 0
    }
  } catch (error) {
    console.error('Error fetching comments:', error)
    return {
      success: false,
      data: [],
      count: 0
    }
  }
}

// Get a single comment by ID
export async function getCommentById(id: string): Promise<ApiResponse<Comment>> {
  try {
    const query = 'SELECT * FROM comments WHERE id = $1'
    const result = await executeQuery(query, [id])

    if (!result.rows || result.rows.length === 0) {
      return {
        success: false,
        error: 'Comment not found'
      }
    }

    return {
      success: true,
      data: result.rows![0]
    }
  } catch (error) {
    console.error('Error fetching comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch comment'
    }
  }
}

// Create a new comment
export async function createComment(
  commentData: CommentCreateInput
): Promise<ApiResponse<Comment>> {
  try {
    const query = `
      INSERT INTO comments (entity_type, entity_id, author, author_username, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const values = [
      commentData.entity_type,
      commentData.entity_id,
      commentData.author,
      commentData.author_username,
      commentData.content
    ]

    const result = await executeQuery(query, values)

    return {
      success: true,
      data: result.rows![0]
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create comment'
    }
  }
}

// Update a comment
export async function updateComment(
  id: string,
  updates: CommentUpdateInput
): Promise<ApiResponse<Comment>> {
  try {
    const fields: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.content !== undefined) {
      fields.push(`content = $${paramCount++}`)
      values.push(updates.content)
    }

    if (fields.length === 0) {
      return {
        success: false,
        error: 'No fields to update'
      }
    }

    values.push(id)
    const query = `
      UPDATE comments
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await executeQuery(query, values)

    if (!result.rows || result.rows.length === 0) {
      return {
        success: false,
        error: 'Comment not found'
      }
    }

    return {
      success: true,
      data: result.rows![0]
    }
  } catch (error) {
    console.error('Error updating comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update comment'
    }
  }
}

// Delete a comment
export async function deleteComment(id: string): Promise<ApiResponse<void>> {
  try {
    const query = 'DELETE FROM comments WHERE id = $1 RETURNING id'
    const result = await executeQuery(query, [id])

    if (!result.rows || result.rows.length === 0) {
      return {
        success: false,
        error: 'Comment not found'
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Error deleting comment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete comment'
    }
  }
}

// Get comment count for an entity
export async function getCommentCount(
  entityType: 'product' | 'feature',
  entityId: string
): Promise<ApiResponse<number>> {
  try {
    const query = `
      SELECT COUNT(*) as count FROM comments
      WHERE entity_type = $1 AND entity_id = $2
    `
    const result = await executeQuery(query, [entityType, entityId])

    return {
      success: true,
      data: parseInt(result.rows?.[0]?.count || '0')
    }
  } catch (error) {
    console.error('Error fetching comment count:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch comment count',
      data: 0
    }
  }
}