export interface Feature {
  id: string
  product_id?: string
  title: string
  overview?: string
  current_problems?: string
  requirements?: string
  priority?: FeaturePriority
  estimate?: number
  status?: FeatureStatus
  requestor?: string
  created_at: Date | string
  updated_at: Date | string
  gitlab_issue_id?: number
  gitlab_issue_iid?: number
  gitlab_project_id?: number
  platforms?: string[]
}

export interface FeatureCreateInput {
  product_id?: string
  title: string
  overview?: string
  current_problems?: string
  requirements?: string
  priority?: FeaturePriority
  estimate?: number
  status?: FeatureStatus
  requestor?: string
  platforms?: string[]
}

export interface FeatureUpdateInput extends Partial<FeatureCreateInput> {}

export type FeaturePriority = 'low' | 'medium' | 'high' | 'critical'
export type FeatureStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
