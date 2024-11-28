import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getGitlab: (path) => ipcRenderer.invoke('gitlab-get',path),
  gitlab:(path,type,data) => ipcRenderer.invoke('gitlab',path,type,data),
  wrike:(path,type,data) => ipcRenderer.invoke('wrike',path,type,data),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
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
  window.electron = electronAPI
  window.api = api
}
