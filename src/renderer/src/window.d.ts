import type { ApiResponse, ApiListResponse } from '../../@types/api'
import type { Product, ProductCreateInput, ProductUpdateInput, Feature, FeatureCreateInput, FeatureUpdateInput, Comment, CommentCreateInput, CommentUpdateInput, UiUxRequest } from '../../@types/models'

declare global {
  interface Window {
    api: {
      invoke: (channel: string, ...args: any[]) => Promise<any>
      
      postgresql: {
        testConnection: () => Promise<ApiResponse<{ connected: boolean; message: string }>>
        getStats: () => Promise<ApiResponse<any>>
      }
      
      products: {
        getAll: (filters?: any) => Promise<ApiListResponse<Product>>
        getById: (id: string) => Promise<ApiResponse<Product>>
        create: (productData: ProductCreateInput) => Promise<ApiResponse<Product>>
        update: (id: string, productData: ProductUpdateInput) => Promise<ApiResponse<Product>>
        delete: (id: string) => Promise<ApiResponse<void>>
        getSummary: (id: string) => Promise<ApiResponse<any>>
      }
      
      features: {
        getAll: (filters?: any) => Promise<ApiListResponse<Feature>>
        getById: (id: string) => Promise<ApiResponse<Feature>>
        create: (featureData: FeatureCreateInput) => Promise<ApiResponse<Feature>>
        update: (id: string, featureData: FeatureUpdateInput) => Promise<ApiResponse<Feature>>
        delete: (id: string) => Promise<ApiResponse<void>>
        getByProduct: (productId: string) => Promise<ApiListResponse<Feature>>
      }
      
      comments: {
        getByEntity: (entityType: 'product' | 'feature', entityId: string) => Promise<ApiListResponse<Comment>>
        getById: (id: string) => Promise<ApiResponse<Comment>>
        create: (commentData: CommentCreateInput) => Promise<ApiResponse<Comment>>
        update: (id: string, updates: CommentUpdateInput) => Promise<ApiResponse<Comment>>
        delete: (id: string) => Promise<ApiResponse<void>>
        getCount: (entityType: 'product' | 'feature', entityId: string) => Promise<ApiResponse<number>>
      }
      
      uiux: {
        getAll: (filters?: any) => Promise<ApiListResponse<UiUxRequest>>
        getById: (id: string) => Promise<ApiResponse<UiUxRequest>>
        create: (requestData: Partial<UiUxRequest>) => Promise<ApiResponse<UiUxRequest>>
        update: (id: string, requestData: Partial<UiUxRequest>) => Promise<ApiResponse<UiUxRequest>>
        delete: (id: string) => Promise<ApiResponse<void>>
        getByProduct: (productId: string) => Promise<ApiListResponse<UiUxRequest>>
        getStats: () => Promise<ApiResponse<any>>
      }
      
      migration: {
        getStatus: (entityType?: string) => Promise<ApiResponse<any>>
        recordMigration: (data: any) => Promise<ApiResponse<any>>
        recordBatch: (records: any[]) => Promise<ApiResponse<any>>
        resetStatus: (entityType: string) => Promise<ApiResponse<any>>
        checkStatus: (entityType: string, gitlabId: number) => Promise<ApiResponse<any>>
      }
      
      // Legacy APIs
      getGitlab: (path: string) => Promise<any>
      gitlab: (path: string, type: string, data?: any) => Promise<any>
      wrike: (path: string, type: string, data?: any) => Promise<any>
      saveFile: (data: any) => Promise<any>
      getAppVersion: () => Promise<string>
      readExcelFile: () => Promise<any>
      gitlabWithHeaders: (path: string, type: string, data?: any) => Promise<any>
      checkSignIn: () => Promise<any>
      signOut: () => Promise<any>
      signinWithFirebaseEmail: (email: string, password: string) => Promise<any>
      changePassword: (email: string, password: string, newPassword: string) => Promise<any>
      getAllUsers: () => Promise<any>
      createNewUser: (email: string, password: string, role: string, name: string) => Promise<any>
      updateUserInformation: (params: { email: string; role: string; name: string }) => Promise<any>
      graphGet: (endpoint: string) => Promise<any>
      checkForAppUpdate: () => Promise<any>
      performAppUpdate: () => Promise<any>
    }
    
    electron: any
  }
}

export {}