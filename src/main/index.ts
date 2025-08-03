// src/main/index.ts
import { app, shell, BrowserWindow, ipcMain, screen, dialog, protocol, Menu, net } from 'electron'
import { join, normalize, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { DatabaseService } from './database'
import { MusicPlayerService } from './musicPlayerService'
import { pathToFileURL } from 'url'

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
      corsEnabled: true,
      stream: true
    }
  }
])

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.oshi')

  protocol.handle('safe-file', async (request) => {
    try {
      const urlPath = request.url.replace('safe-file://', '')
      const decodedPath = decodeURIComponent(urlPath)

      // Fix the path construction for Windows
      let filePath = decodedPath

      // Handle Windows drive letters properly
      if (process.platform === 'win32') {
        // If path starts with a drive letter pattern like "c/Users/..."
        if (/^[a-zA-Z]\//.test(filePath)) {
          filePath = filePath.replace(/^([a-zA-Z])\//, '$1:\\')
        }
        // If path doesn't have a colon after drive letter, add it
        if (/^[a-zA-Z][^:]/.test(filePath)) {
          filePath = filePath.replace(/^([a-zA-Z])/, '$1:')
        }
      }

      const fileUrl = pathToFileURL(filePath).toString()

      const response = await net.fetch(fileUrl, { headers: request.headers })
      return response
    } catch (error: unknown) {
      if (!(error instanceof Error)) return new Response('Internal Server Error', { status: 500 })

      if (error.message.includes('ERR_FILE_NOT_FOUND')) {
        return new Response('File Not Found', { status: 404 })
      }
      if (error.message.includes('ERR_ACCESS_DENIED')) {
        return new Response('Access Denied', { status: 403 })
      }
      
      return new Response('Internal Server Error', { status: 500 })
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize Services
  const dbService = DatabaseService.getInstance()
  MusicPlayerService.getInstance()

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
    }
  })

  ipcMain.handle('get-songs', async (_, payload: { limit: number; offset: number }) => {
    return await dbService.getSongs(payload)
  })

  ipcMain.handle('get-songs-count', async () => {
    return await dbService.getSongsCount()
  })

  ipcMain.handle('get-albums', async () => {
    return await dbService.getAlbums()
  })

  ipcMain.handle('get-artists', async () => {
    return await dbService.getArtists()
  })

  ipcMain.handle('get-album', async (_, id: string) => {
    return await dbService.getAlbum(id)
  })

  ipcMain.handle('get-artist', async (_, id: string) => {
    return await dbService.getArtist(id)
  })

  ipcMain.handle('get-songs-by-album-id', async (_, albumId: string) => {
    return await dbService.getSongsByAlbumId(albumId)
  })

  ipcMain.handle('get-albums-by-artist-id', async (_, artistId: string) => {
    return await dbService.getAlbumsByArtistId(artistId)
  })

  ipcMain.handle('get-songs-by-artist-id', async (_, artistId: string) => {
    return await dbService.getSongsByArtistId(artistId)
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
