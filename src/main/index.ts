import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// @ts-ignore
import icon from '../../resources/icon.png?asset'
import { gitlab, gitlabGet, gitlabWithHeaders } from './gitlabAPI'
import fs from 'fs'
import { wrike } from './wrikeAPI'
import { readFromExcel } from './excelAPI'
import {
  changePassword,
  checkSignInStatus,
  createNewUser,
  getAllUsersFromFirestore,
  signinWithFirebaseEmail,
  signOut,
  updateUserInformation
} from './firebaseAPI'
import { graphGet } from './graphAPI'
import {
  testPostgreSQLConnection,
  initializePostgreSQL,
  closePostgreSQL,
  executeQuery,
  checkTablesExist
} from './postgresqlAPI'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductSummary
} from './productsAPI'
import {
  getAllFeatures,
  getFeatureById,
  createFeature,
  updateFeature,
  deleteFeature,
  getFeaturesByProduct
} from './featuresAPI'
import {
  getMigrationStatus,
  recordMigration,
  recordMigrationBatch,
  resetMigrationStatus,
  checkMigrationStatus
} from './migrationAPI'
import {
  getCommentsByEntity,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentCount
} from './commentsAPI'
import {
  getAllUiUxRequests,
  getUiUxRequestById,
  createUiUxRequest,
  updateUiUxRequest,
  deleteUiUxRequest,
  getUiUxRequestsByProduct,
  getUiUxRequestStats
} from './uiuxAPI'

const { autoUpdater } = require('electron-updater')

autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info' // Log to file
autoUpdater.logger.transports.console.level = 'info' // Log to console

// Set autoDownload to false
autoUpdater.autoDownload = false

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.showInactive()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Initialize PostgreSQL connection
  console.log('Initializing PostgreSQL connection...')
  const initResult = await initializePostgreSQL()
  if (!initResult.success) {
    console.error('Failed to initialize PostgreSQL:', initResult.error)
    // You might want to show an error dialog here
  } else {
    console.log('PostgreSQL initialized successfully')
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  // Close PostgreSQL connection
  await closePostgreSQL()
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Also close PostgreSQL when app is quitting
app.on('before-quit', async () => {
  await closePostgreSQL()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('gitlab-get', async (event, path) => {
  return gitlabGet(path)
})

ipcMain.handle('gitlab', async (event, path, type, data) => {
  return gitlab(path, type, data)
})

ipcMain.handle('gitlab-with-headers', async (event, path, type, data) => {
  return gitlabWithHeaders(path, type, data)
})

ipcMain.handle('wrike', async (event, path, type, data) => {
  return wrike(path, type, data)
})

ipcMain.handle('save-file', async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save File As',
    defaultPath: 'downloaded_file.txt', // Default filename
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  })

  if (canceled || !filePath) return // User canceled the dialog

  fs.writeFileSync(filePath, data, 'utf-8') // Write the file content to the selected path

  return filePath // Send the path back to the front end, if needed
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('read-excel-file', async () => {
  return await readFromExcel()
})

ipcMain.handle('check-signin', async () => {
  return await checkSignInStatus()
})

ipcMain.handle('sign-out', async () => {
  return await signOut()
})

ipcMain.handle('sign-in', async (event, emailAndPassword) => {
  return await signinWithFirebaseEmail(emailAndPassword)
})

ipcMain.handle('get-all-users', async () => {
  return await getAllUsersFromFirestore()
})
ipcMain.handle('create-new-user', async (event, email, password, role) => {
  return await createNewUser(email, password, role)
})
ipcMain.handle('update-role', async (event, data) => {
  return await updateUserInformation(data)
})

ipcMain.handle('graph-get', async (event, { endpoint }) => {
  return await graphGet(endpoint)
})

ipcMain.handle('change-password', async (event, data) => {
  return await changePassword(data)
})

// Handle in app update process

ipcMain.handle('check-for-app-update', async (event) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (isDevelopment) {
      console.log('Update check skipped in development mode')
      return {
        message: 'No update available in dev mode.',
        releaseNotes: 'No release notes available.',
        updateAvailable: false
      }
    }
    // Check for updates without notifying the user
    const updateInfo = await autoUpdater.checkForUpdates()
    if (updateInfo.updateInfo.version !== app.getVersion()) {
      return {
        message: 'v' + updateInfo.updateInfo.version + ' is available.',
        releaseNotes: updateInfo.updateInfo?.releaseNotes || 'No release notes available.',
        updateAvailable: true
      }
    } else {
      // No update is available
      return {
        message: 'No update available.',
        updateAvailable: false,
        releaseNotes: 'No release notes available.'
      }
    }
  } catch (error) {
    console.error('Update error:', error)
    throw new Error('Failed to initiate update: ' + (error as Error).message)
  }
})

// Handle app update trigger
ipcMain.handle('perform-app-update', async (event) => {
  try {
    // Check for updates without notifying the user
    const updateInfo = await autoUpdater.checkForUpdates()
    if (updateInfo.updateInfo.version !== app.getVersion()) {
      // An update is available
      autoUpdater.downloadUpdate() // Start downloading the update
      return { message: 'Update available. Downloading...' }
    } else {
      // No update is available
      return { message: 'No update available.' }
    }
  } catch (error) {
    console.error('Update error:', error)
    throw new Error('Failed to initiate update: ' + (error as Error).message)
  }
})
autoUpdater.on('error', (error: Error) => {
  console.error('Update error:', error)
  throw new Error('Failed to initiate update: ' + error.message)
})
autoUpdater.on('update-available', () => {
  console.log('Update available')
})
autoUpdater.on('update-not-available', () => {
  console.log('Update not available')
})
autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded')
  autoUpdater.quitAndInstall()
})

// Ensure your autoUpdater is set up properly to handle events
autoUpdater.on('update-downloaded', (info: any) => {
  // You can prompt the user or automatically quit and install here
  autoUpdater.quitAndInstall()
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
})

// PostgreSQL IPC handlers
ipcMain.handle('postgresql:test-connection', async () => {
  return await testPostgreSQLConnection()
})

ipcMain.handle('postgresql:initialize', async () => {
  return await initializePostgreSQL()
})

ipcMain.handle('postgresql:close', async () => {
  return await closePostgreSQL()
})

ipcMain.handle('postgresql:execute-query', async (_event, { query, params }) => {
  return await executeQuery(query, params)
})

ipcMain.handle('postgresql:check-tables', async () => {
  return await checkTablesExist()
})

// Products API handlers
ipcMain.handle('products:get-all', async (_event, filters) => {
  return await getAllProducts(filters)
})

ipcMain.handle('products:get-by-id', async (_event, id) => {
  return await getProductById(id)
})

ipcMain.handle('products:create', async (_event, productData) => {
  return await createProduct(productData)
})

ipcMain.handle('products:update', async (_event, { id, productData }) => {
  return await updateProduct(id, productData)
})

ipcMain.handle('products:delete', async (_event, id) => {
  return await deleteProduct(id)
})

ipcMain.handle('products:get-summary', async (_event, id) => {
  return await getProductSummary(id)
})

// Features API handlers
ipcMain.handle('features:get-all', async (_event, filters) => {
  return await getAllFeatures(filters)
})

ipcMain.handle('features:get-by-id', async (_event, id) => {
  return await getFeatureById(id)
})

ipcMain.handle('features:create', async (_event, featureData) => {
  return await createFeature(featureData)
})

ipcMain.handle('features:update', async (_event, { id, featureData }) => {
  return await updateFeature(id, featureData)
})

ipcMain.handle('features:delete', async (_event, id) => {
  return await deleteFeature(id)
})

ipcMain.handle('features:get-by-product', async (_event, productId) => {
  return await getFeaturesByProduct(productId)
})

// Migration API handlers
ipcMain.handle('migration:get-status', async (_event, entityType) => {
  return await getMigrationStatus(entityType)
})

ipcMain.handle('migration:record', async (_event, migrationData) => {
  return await recordMigration(migrationData)
})

ipcMain.handle('migration:record-batch', async (_event, records) => {
  return await recordMigrationBatch(records)
})

ipcMain.handle('migration:reset', async (_event, entityType) => {
  return await resetMigrationStatus(entityType)
})

ipcMain.handle('migration:check', async (_event, { entityType, gitlabId }) => {
  return await checkMigrationStatus(entityType, gitlabId)
})

// Comments API handlers
ipcMain.handle('comments:get-by-entity', async (_event, { entityType, entityId }) => {
  return await getCommentsByEntity(entityType, entityId)
})

ipcMain.handle('comments:get-by-id', async (_event, id) => {
  return await getCommentById(id)
})

ipcMain.handle('comments:create', async (_event, commentData) => {
  return await createComment(commentData)
})

ipcMain.handle('comments:update', async (_event, { id, updates }) => {
  return await updateComment(id, updates)
})

ipcMain.handle('comments:delete', async (_event, id) => {
  return await deleteComment(id)
})

ipcMain.handle('comments:get-count', async (_event, { entityType, entityId }) => {
  return await getCommentCount(entityType, entityId)
})

// UI/UX Request handlers
ipcMain.handle('uiux:get-all', async (_event, filters) => {
  return await getAllUiUxRequests(filters)
})

ipcMain.handle('uiux:get-by-id', async (_event, id) => {
  return await getUiUxRequestById(id)
})

ipcMain.handle('uiux:create', async (_event, requestData) => {
  return await createUiUxRequest(requestData)
})

ipcMain.handle('uiux:update', async (_event, { id, requestData }) => {
  return await updateUiUxRequest(id, requestData)
})

ipcMain.handle('uiux:delete', async (_event, id) => {
  return await deleteUiUxRequest(id)
})

ipcMain.handle('uiux:get-by-product', async (_event, productId) => {
  return await getUiUxRequestsByProduct(productId)
})

ipcMain.handle('uiux:get-stats', async (_event) => {
  return await getUiUxRequestStats()
})
