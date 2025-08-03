// src/main/index.ts

import { app, shell, BrowserWindow, ipcMain, screen, dialog, protocol, Menu } from 'electron'
import path, { join } from 'path'
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

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'safe-file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: false,
      stream: true
    }
  }
])


app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.oshi')

  // ... (registerStreamProtocol remains exactly the same)
  protocol.registerStreamProtocol('safe-file', (request, callback) => {
    try {
      let filePath = decodeURI(request.url.replace('safe-file://', ''))
      if (process.platform === 'win32') {
        filePath = filePath.charAt(0) + ':' + filePath.slice(1)
      }
      const normalizedPath = path.normalize(filePath)

      // Security check
      if (!fs.existsSync(normalizedPath)) {
        console.error('File not found for streaming:', normalizedPath)
        callback({ statusCode: 404 })
        return
      }

      const stat = fs.statSync(normalizedPath)
      const fileSize = stat.size
      const range = (request.headers.Range || request.headers.range) as string | undefined
      const contentType = mime.getType(normalizedPath) || 'application/octet-stream'

      if (range) {
        const parts = String(range)
          .replace(/bytes=/, '')
          .split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const validStart = isNaN(start) ? 0 : start
        const validEnd = isNaN(end) ? fileSize - 1 : end
        const chunksize = validEnd - validStart + 1
        const head = {
          'Content-Range': `bytes ${validStart}-${validEnd}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType
        }
        callback({
          statusCode: 206,
          headers: head,
          data: fs.createReadStream(normalizedPath, { start: validStart, end: validEnd })
        })
      } else {
        const head = {
          'Accept-Ranges': 'bytes',
          'Content-Length': fileSize,
          'Content-Type': contentType
        }
        callback({ statusCode: 200, headers: head, data: fs.createReadStream(normalizedPath) })
      }
    } catch (error) {
      console.error('Protocol stream error:', error)
      callback({ statusCode: 500 }) // Internal Server Error
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
      const path = result.filePaths[0]
      await dbService.addMusicDirectory(path)
      return true
    }
    return false
  })

  ipcMain.handle('remove-music-directory', async (_, path) => {
    await dbService.removeMusicDirectory(path)
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

  // --- IPC for Music Player ---
  ipcMain.on('play-song', (_, songIndex?: number) => {
    musicPlayerService.play(songIndex)
  })

  ipcMain.on('play-next-song', () => {
    musicPlayerService.playNext()
  })

  ipcMain.on('play-previous-song', () => {
    musicPlayerService.playPrevious()
  })

  ipcMain.on('request-play-next-song', () => {
    musicPlayerService.playNext()
  })

  ipcMain.on('playback-state-update', (_, state: { isPlaying: boolean; currentTime: number }) => {
    musicPlayerService.updatePlaybackState(state)
  })

  // This is the handler that was causing the error
  ipcMain.handle('get-current-song-details', () => {
    return musicPlayerService.getCurrentSongDetails()
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
