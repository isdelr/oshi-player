import { app, shell, BrowserWindow, ipcMain, screen, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { DatabaseService } from './database'
import { MusicPlayerService } from './musicPlayerService'

function createWindow(): void {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.8),
    height: Math.floor(height * 0.8),
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    // Frameless Window
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      // Enable nodeIntegration to allow the `howler` package to work in the renderer
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-state-change', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-state-change', false)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.oshi')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize Services
  const dbService = DatabaseService.getInstance()
  const musicPlayerService = MusicPlayerService.getInstance()
  await musicPlayerService.loadSongs()

  // IPC Window Controls
  ipcMain.on('minimize-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.minimize()
  })

  ipcMain.on('maximize-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window?.isMaximized()) {
      window?.unmaximize()
    } else {
      window?.maximize()
    }
  })

  ipcMain.on('close-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.close()
  })

  // IPC for Settings
  ipcMain.handle('get-setting', (_, key) => {
    return dbService.getSetting(key)
  })

  ipcMain.handle('set-setting', (_, key, value) => {
    dbService.setSetting(key, value)
  })

  // IPC for Library Management
  ipcMain.handle('get-music-directories', () => {
    return dbService.getMusicDirectories()
  })

  ipcMain.handle('add-music-directory', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return false

    const result = await dialog.showOpenDialog(window, {
      properties: ['openDirectory']
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const path = result.filePaths[0]
      dbService.addMusicDirectory(path)
      return true // Indicate success
    }
    return false // Indicate cancellation
  })

  ipcMain.handle('remove-music-directory', async (_, path) => {
    dbService.removeMusicDirectory(path)
  })

  ipcMain.handle('scan-folders', async () => {
    const folders = dbService.getMusicDirectories()
    if (folders.length > 0) {
      await dbService.scanFolders(folders)
      await musicPlayerService.loadSongs()
    }
  })

  // IPC for Data Retrieval
  ipcMain.handle('get-songs', () => {
    return dbService.getSongs()
  })

  ipcMain.handle('get-albums', () => {
    return dbService.getAlbums()
  })

  ipcMain.handle('get-artists', () => {
    return dbService.getArtists()
  })

  // IPC for Music Player
  ipcMain.on('play-song', (_, songIndex) => {
    musicPlayerService.play(songIndex)
  })

  ipcMain.on('pause-song', () => {
    musicPlayerService.pause()
  })

  ipcMain.on('resume-song', () => {
    musicPlayerService.resume()
  })

  ipcMain.on('play-next-song', () => {
    musicPlayerService.playNext()
  })

  ipcMain.on('play-previous-song', () => {
    musicPlayerService.playPrevious()
  })

  ipcMain.on('seek-song', (_, time) => {
    musicPlayerService.seek(time)
  })

  ipcMain.handle('get-current-song-details', () => {
    return musicPlayerService.getCurrentSongDetails()
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
  DatabaseService.getInstance().close()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
