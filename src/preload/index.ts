import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Generic invoke method for any IPC channel
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),

  // PostgreSQL APIs
  postgresql: {
    testConnection: () => ipcRenderer.invoke('postgresql:test-connection'),
    getStats: () => ipcRenderer.invoke('postgresql:get-stats')
  },

  products: {
    getAll: (filters?: any) => ipcRenderer.invoke('products:get-all', filters),
    getById: (id: string) => ipcRenderer.invoke('products:get-by-id', id),
    create: (productData: any) => ipcRenderer.invoke('products:create', productData),
    update: (id: string, productData: any) => 
      ipcRenderer.invoke('products:update', { id, productData }),
    delete: (id: string) => ipcRenderer.invoke('products:delete', id),
    getSummary: (id: string) => ipcRenderer.invoke('products:get-summary', id)
  },

  features: {
    getAll: (filters?: any) => ipcRenderer.invoke('features:get-all', filters),
    getById: (id: string) => ipcRenderer.invoke('features:get-by-id', id),
    create: (featureData: any) => ipcRenderer.invoke('features:create', featureData),
    update: (id: string, featureData: any) => 
      ipcRenderer.invoke('features:update', { id, featureData }),
    delete: (id: string) => ipcRenderer.invoke('features:delete', id),
    getByProduct: (productId: string) => ipcRenderer.invoke('features:get-by-product', productId)
  },

  migration: {
    getStatus: (entityType?: string) => ipcRenderer.invoke('migration:get-status', entityType),
    recordMigration: (data: any) => ipcRenderer.invoke('migration:record', data),
    recordBatch: (records: any[]) => ipcRenderer.invoke('migration:record-batch', records),
    resetStatus: (entityType: string) => ipcRenderer.invoke('migration:reset-status', entityType),
    checkStatus: (entityType: string, gitlabId: number) => 
      ipcRenderer.invoke('migration:check-status', { entityType, gitlabId })
  },

  comments: {
    getByEntity: (entityType: 'product' | 'feature', entityId: string) => 
      ipcRenderer.invoke('comments:get-by-entity', { entityType, entityId }),
    getById: (id: string) => ipcRenderer.invoke('comments:get-by-id', id),
    create: (commentData: any) => ipcRenderer.invoke('comments:create', commentData),
    update: (id: string, updates: any) => 
      ipcRenderer.invoke('comments:update', { id, updates }),
    delete: (id: string) => ipcRenderer.invoke('comments:delete', id),
    getCount: (entityType: 'product' | 'feature', entityId: string) => 
      ipcRenderer.invoke('comments:get-count', { entityType, entityId })
  },

  uiux: {
    getAll: (filters?: any) => ipcRenderer.invoke('uiux:get-all', filters),
    getById: (id: string) => ipcRenderer.invoke('uiux:get-by-id', id),
    create: (requestData: any) => ipcRenderer.invoke('uiux:create', requestData),
    update: (id: string, requestData: any) => 
      ipcRenderer.invoke('uiux:update', { id, requestData }),
    delete: (id: string) => ipcRenderer.invoke('uiux:delete', id),
    getByProduct: (productId: string) => ipcRenderer.invoke('uiux:get-by-product', productId),
    getStats: () => ipcRenderer.invoke('uiux:get-stats')
  },

  // Legacy methods (kept for backward compatibility)
  getGitlab: (path: string) => ipcRenderer.invoke('gitlab-get', path),
  gitlab: (path: string, type: string, data?: any) =>
    ipcRenderer.invoke('gitlab', path, type, data),
  wrike: (path: string, type: string, data?: any) => ipcRenderer.invoke('wrike', path, type, data),
  saveFile: (data: any) => ipcRenderer.invoke('save-file', data),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  readExcelFile: () => ipcRenderer.invoke('read-excel-file'),
  gitlabWithHeaders: (path: string, type: string, data?: any) =>
    ipcRenderer.invoke('gitlab-with-headers', path, type, data),
  checkSignIn: () => ipcRenderer.invoke('check-signin'),
  signOut: () => ipcRenderer.invoke('sign-out'),
  signinWithFirebaseEmail: (email: string, password: string) =>
    ipcRenderer.invoke('sign-in', { email, password }),
  changePassword: (email: string, password: string, newPassword: string) =>
    ipcRenderer.invoke('change-password', { email, password, newPassword }),
  getAllUsers: () => ipcRenderer.invoke('get-all-users'),
  createNewUser: (email: string, password: string, role: string, name: string) =>
    ipcRenderer.invoke('create-new-user', { email, password, role, name }),
  updateUserInformation: ({ email, role, name }: { email: string; role: string; name: string }) =>
    ipcRenderer.invoke('update-role', { email, role, name }),
  graphGet: (endpoint: string) => ipcRenderer.invoke('graph-get', { endpoint }),
  checkForAppUpdate: () => ipcRenderer.invoke('check-for-app-update'),
  performAppUpdate: () => ipcRenderer.invoke('perform-app-update')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
