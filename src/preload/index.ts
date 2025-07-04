import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Generic invoke method for any IPC channel
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),

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
