export interface Product {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  status?: string;
  mp1_date?: Date | string;
  launch_date?: Date | string;
  description?: string;
  epic_id?: number;
  lookup_code?: string;
  created_at: Date | string;
  updated_at: Date | string;
  created_by?: string;
  gitlab_issue_id?: number;
  gitlab_issue_iid?: number;
  gitlab_project_id?: number;
}

export interface ProductCreateInput {
  name: string;
  brand?: string;
  model?: string;
  status?: string;
  mp1_date?: Date | string;
  launch_date?: Date | string;
  description?: string;
  epic_id?: number;
  lookup_code?: string;
  created_by?: string;
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {}

export type ProductStatus = 'Active' | 'Greenlight' | 'On Hold' | 'Cancelled' | 'Completed';

export interface ProductFilter {
  status?: ProductStatus;
  brand?: string;
}