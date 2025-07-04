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