// Window API types
declare global {
  interface Window {
    api: {
      // Generic invoke method
      invoke: (channel: string, ...args: any[]) => Promise<any>

      // PostgreSQL APIs
      postgresql: {
        testConnection: () => Promise<any>
        getStats: () => Promise<any>
      }

      // Products API
      products: {
        getAll: (filters?: any) => Promise<any>
        getById: (id: string) => Promise<any>
        create: (productData: any) => Promise<any>
        update: (id: string, productData: any) => Promise<any>
        delete: (id: string) => Promise<any>
        getSummary: (id: string) => Promise<any>
      }

      // Features API
      features: {
        getAll: (filters?: any) => Promise<any>
        getById: (id: string) => Promise<any>
        create: (featureData: any) => Promise<any>
        update: (id: string, featureData: any) => Promise<any>
        delete: (id: string) => Promise<any>
        getByProduct: (productId: string) => Promise<any>
      }

      // Migration API
      migration: {
        getStatus: (entityType?: string) => Promise<any>
        recordMigration: (data: any) => Promise<any>
        recordBatch: (records: any[]) => Promise<any>
        resetStatus: (entityType: string) => Promise<any>
        checkStatus: (entityType: string, gitlabId: number) => Promise<any>
      }

      // Legacy methods
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
      updateUserInformation: (data: { email: string; role: string; name: string }) => Promise<any>
      graphGet: (endpoint: string) => Promise<any>
      checkForAppUpdate: () => Promise<any>
      performAppUpdate: () => Promise<any>
    }
    electron: any
  }
}

export {}
