// src/main/index.ts
import { app, shell, BrowserWindow, ipcMain, screen, dialog, protocol, Menu } from 'electron'
import { join, normalize, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { DatabaseService } from './database'
import { MusicPlayerService } from './musicPlayerService'
import fs from 'fs'
import mime from 'mime'

Menu.setApplicationMenu(null)

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.8),
    height: Math.floor(height * 0.8),
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
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

  // HMR for renderer based on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'safe-file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true, // Recommended to be true for range requests
      stream: true
    }
  }
])

app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.oshi')

  // --- MODIFIED PROTOCOL HANDLER ---
  protocol.registerStreamProtocol('safe-file', (request, callback) => {
    try {
      console.log('🎵 Protocol handler received URL:', request.url)

      // Extract the file path from safe-file:// protocol
      let filePath = request.url.replace('safe-file://', '')

      // Handle Windows paths - ensure we have the proper format
      if (process.platform === 'win32') {
        // If path starts with a drive letter (like 'c/Users/...'), add the colon
        if (filePath.match(/^[a-zA-Z]\//)) {
          filePath = filePath.replace(/^([a-zA-Z])\//, '$1:/')
        }
        // Convert forward slashes to backslashes for Windows
        filePath = filePath.replace(/\//g, '\\')
      }

      // Decode URL encoding (handles special characters like Japanese text)
      filePath = decodeURIComponent(filePath)

      console.log('📁 Decoded and normalized file path:', filePath)

      // Check for file existence and read permissions
      if (!fs.existsSync(filePath)) {
        console.error('❌ File not found for streaming:', filePath)
        console.error('🔗 Original URL was:', request.url)
        callback({ statusCode: 404 })
        return
      }

      try {
        fs.accessSync(filePath, fs.constants.R_OK)
      } catch (accessError) {
        console.error('🚫 File not accessible for streaming:', filePath, accessError)
        callback({ statusCode: 403 })
        return
      }

      // Proceed with creating the stream response
      const stat = fs.statSync(filePath)
      const fileSize = stat.size
      const contentType = mime.getType(filePath) || 'application/octet-stream'

      const range = request.headers.Range || request.headers.range

      if (range && range.startsWith('bytes=')) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunksize = end - start + 1

        console.log(`⚡ Range request: Streaming bytes ${start}-${end} of ${fileSize}`)

        const headers = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunksize),
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        }

        callback({
          statusCode: 206, // HTTP 206 Partial Content
          headers,
          data: fs.createReadStream(filePath, { start, end })
        })
      } else {
        console.log(' Full file request')
        const headers = {
          'Content-Length': String(fileSize),
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes', // Important to tell the browser seeking is supported
          'Cache-Control': 'no-cache'
        }

        callback({
          statusCode: 200, // HTTP 200 OK
          headers,
          data: fs.createReadStream(filePath)
        })
      }
    } catch (error) {
      console.error('💥 Protocol stream error:', error)
      callback({ statusCode: 500 })
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize Services
  const dbService = DatabaseService.getInstance()
  const musicPlayerService = MusicPlayerService.getInstance()
  await musicPlayerService.loadSongs()

  // IPC Window Controls
  ipcMain.on('minimize-window', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })
  ipcMain.on('maximize-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window?.isMaximized()) {
      window.unmaximize()
    } else {
      window?.maximize()
    }
  })
  ipcMain.on('close-window', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  // IPC handlers for DatabaseService
  ipcMain.handle('get-setting', async (_, key) => {
    return await dbService.getSetting(key)
  })

  ipcMain.handle('set-setting', async (_, key, value) => {
    await dbService.setSetting(key, value)
  })

  ipcMain.handle('get-music-directories', async () => {
    return await dbService.getMusicDirectories()
  })

  ipcMain.handle('add-music-directory', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return false
    const result = await dialog.showOpenDialog(window, { properties: ['openDirectory'] })
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0]
      const normalizedPath = normalize(resolve(selectedPath))
      await dbService.addMusicDirectory(normalizedPath)
      return true
    }
    return false
  })

  ipcMain.handle('remove-music-directory', async (_, directoryPath) => {
    const normalizedPath = normalize(resolve(directoryPath))
    await dbService.removeMusicDirectory(normalizedPath)
  })

  ipcMain.handle('scan-folders', async () => {
    const folders = await dbService.getMusicDirectories()
    if (folders.length > 0) {
      await dbService.scanFolders(folders)
      await musicPlayerService.loadSongs()
    }
  })

  ipcMain.handle('get-songs', async () => {
    return await dbService.getSongs()
  })

  ipcMain.handle('get-albums', async () => {
    return await dbService.getAlbums()
  })

  ipcMain.handle('get-artists', async () => {
    return await dbService.getArtists()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', async () => {
  await DatabaseService.getInstance().close()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
