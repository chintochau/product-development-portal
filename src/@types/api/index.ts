export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}