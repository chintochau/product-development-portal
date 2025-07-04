export interface UiUxRequest {
  id: string
  product_id?: string
  title: string
  description?: string
  priority?: 'critical' | 'high' | 'medium' | 'low'
  status?: 'todo' | 'in-progress' | 'review' | 'completed'
  step?: string
  assignee?: string
  requestor?: string
  due_date?: Date | string
  completion_percentage?: number
  tags?: string[]
  gitlab_tickets?: number[]
  gitlab_note_id?: number
  created_at: Date | string
  updated_at: Date | string
  created_by?: string
  // Join fields from products table
  product_name?: string
  product_brand?: string
  product_model?: string
}

export interface UiUxRequestFilters {
  status?: string
  priority?: string
  assignee?: string
  product_id?: string
}

export interface UiUxRequestStats {
  total_requests: number
  todo_count: number
  in_progress_count: number
  review_count: number
  completed_count: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
}