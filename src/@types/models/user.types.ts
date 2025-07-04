export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  role?: UserRole
  createdAt?: Date | string
  lastLoginAt?: Date | string
}

export type UserRole = 'admin' | 'developer' | 'viewer' | 'editor'

export interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}
