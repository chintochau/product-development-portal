import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { gitlab, gitlabGet, gitlabWithHeaders } from './gitlabAPI'
import fs from 'fs'
import { wrike } from './wrikeAPI'
import { readFromExcel } from './excelAPI'
import { changePassword, checkSignInStatus, createNewUser, getAllUsersFromFirestore, signinWithFirebaseEmail, signOut, updateUserInformation } from './firebaseAPI'
import { graphGet } from './graphAPI'

const { autoUpdater } = require('electron-updater');

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info'; // Log to file
autoUpdater.logger.transports.console.level = 'info'; // Log to console

// Set autoDownload to false
autoUpdater.autoDownload = false;

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
    },
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
app.whenReady().then(() => {
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
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle("gitlab-get", async (event, path) => {
  return gitlabGet(path);
})

ipcMain.handle("gitlab", async (event, path, type, data) => {
  return gitlab(path, type, data);
})

ipcMain.handle("gitlab-with-headers", async (event, path, type, data) => {
  return gitlabWithHeaders(path, type, data);
})

ipcMain.handle("wrike", async (event, path, type, data) => {
  return wrike(path, type, data);
})

ipcMain.handle('save-file', async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save File As',
    defaultPath: 'downloaded_file.txt',  // Default filename
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (canceled || !filePath) return; // User canceled the dialog

  fs.writeFileSync(filePath, data, 'utf-8'); // Write the file content to the selected path

  return filePath; // Send the path back to the front end, if needed
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle("read-excel-file", async () => {
  return await readFromExcel();
})

ipcMain.handle("check-signin", async () => {
  return await checkSignInStatus();
})

ipcMain.handle("sign-out", async () => {
  return await signOut();
})

ipcMain.handle("sign-in", async (event, emailAndPassword) => {
  return await signinWithFirebaseEmail(emailAndPassword);
})

ipcMain.handle("get-all-users", async () => {
  return await getAllUsersFromFirestore();
})
ipcMain.handle("create-new-user", async (event, email, password, role) => {
  return await createNewUser(email, password, role);
})
ipcMain.handle("update-role", async (event, data) => {
  return await updateUserInformation(data);
})

ipcMain.handle("graph-get", async (event, { endpoint }) => {
  return await graphGet(endpoint);
})

ipcMain.handle("change-password", async (event, data) => {
  return await changePassword(data);
})


// Handle in app update process


ipcMain.handle("check-for-app-update", async (event) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('Update check skipped in development mode');
      return {
        message: "No update available in dev mode.",
        releaseNotes: "No release notes available.",
        updateAvailable: false
      };
    }
    // Check for updates without notifying the user
    const updateInfo = await autoUpdater.checkForUpdates();
    if (updateInfo.updateInfo.version !== app.getVersion()) {
      return {
        message: "v" + updateInfo.updateInfo.version + " is available.",
        releaseNotes: updateInfo.updateInfo?.releaseNotes || "No release notes available.",
        updateAvailable: true
      };
    } else {
      // No update is available
      return { message: "No update available.", updateAvailable: false,
        releaseNotes: "No release notes available.", };
    }
  } catch (error) {
    console.error('Update error:', error);
    throw new Error('Failed to initiate update: ' + error.message);
  }
})

// Handle app update trigger
ipcMain.handle('perform-app-update', async (event) => {
  try {
    // Check for updates without notifying the user
    const updateInfo = await autoUpdater.checkForUpdates();
    if (updateInfo.updateInfo.version !== app.getVersion()) {
      // An update is available
      autoUpdater.downloadUpdate(); // Start downloading the update
      return { message: "Update available. Downloading..." };
    } else {
      // No update is available
      return { message: "No update available." };
    }
  } catch (error) {
    console.error('Update error:', error);
    throw new Error('Failed to initiate update: ' + error.message);
  }
});
autoUpdater.on("error", (error) => {
  console.error('Update error:', error);
  throw new Error('Failed to initiate update: ' + error.message);
})
autoUpdater.on("update-available", () => {
  console.log("Update available");
})
autoUpdater.on("update-not-available", () => {
  console.log("Update not available");
})
autoUpdater.on("update-downloaded", () => {
  console.log("Update downloaded");
  autoUpdater.quitAndInstall();
})


// Ensure your autoUpdater is set up properly to handle events
autoUpdater.on('update-downloaded', (info) => {
  // You can prompt the user or automatically quit and install here
  autoUpdater.quitAndInstall();
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
})