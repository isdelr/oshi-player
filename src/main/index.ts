// src/main/index.ts

import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  screen,
  dialog,
  protocol,
  Menu,
  net,
  nativeTheme,
  Tray // Import Tray
} from 'electron'
import { join, normalize, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { DatabaseService } from './database'
import { MusicPlayerService } from './musicPlayerService'
import { pathToFileURL } from 'url'
import { unlink } from 'fs/promises' // Import fs promises for file deletion

// Hide the default menu
Menu.setApplicationMenu(null)

// Keep a global reference to the tray object
let tray: Tray | null = null
let isQuitting = false

// This function needs to be async now to read settings before creating the window.
async function createWindow(): Promise<void> {
  const dbService = DatabaseService.getInstance()
  const frameStyle = await dbService.getSetting('windowFrameStyle')
  const isCustomFrame = frameStyle !== 'native'

  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.8),
    height: Math.floor(height * 0.8),
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#000000' : '#FFFFFF',
    ...(process.platform === 'linux' ? { icon } : {}),
    frame: !isCustomFrame, // Use the setting here
    titleBarStyle: isCustomFrame ? 'hidden' : 'default', // Adjust titleBarStyle as well
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // --- Window Event Handlers ---
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-state-change', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-state-change', false)
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // New 'close' handler for minimize-to-tray functionality
  mainWindow.on('close', async (event) => {
    const minimizeToTrayEnabled = (await dbService.getSetting('minimizeToTray')) !== 'false' // Default to true
    if (minimizeToTrayEnabled && !isQuitting) {
      event.preventDefault()
      mainWindow.hide()
      if (!tray) {
        tray = new Tray(icon)
        const contextMenu = Menu.buildFromTemplate([
          {
            label: 'Show Oshi',
            click: function () {
              mainWindow.show()
            }
          },
          {
            label: 'Quit',
            click: function () {
              app.isQuitting = true
              app.quit()
            }
          }
        ])
        tray.setToolTip('Oshi Player')
        tray.setContextMenu(contextMenu)
        tray.on('double-click', () => {
          mainWindow.show()
        })
      }
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

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

// Extend the app object type for our custom property
declare global {
  namespace Electron {
    interface App {
      isQuitting?: boolean
    }
  }
}

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

  // --- NEW IPC Handlers for Settings ---
  ipcMain.handle('get-login-settings', () => {
    return app.getLoginItemSettings()
  })

  ipcMain.handle('set-login-settings', (_, settings) => {
    app.setLoginItemSettings(settings)
  })

  ipcMain.on('relaunch-app', () => {
    app.relaunch()
    app.quit()
  })

  ipcMain.handle('reset-app', async () => {
    const dbPath = join(app.getPath('userData'), 'app.db')

    await dbService.close() // Close the DB connection before deleting

    try {
      // Attempt to delete the main DB file and its journals
      await unlink(dbPath)
      await unlink(`${dbPath}-shm`).catch(() => {
        /* ignore error if file doesn't exist */
      })
      await unlink(`${dbPath}-wal`).catch(() => {
        /* ignore error if file doesn't exist */
      })
    } catch (error) {
      console.error('Failed to delete database file:', error)
      // If the file doesn't exist, that's okay, just log other errors
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        dialog.showErrorBox('Reset Failed', 'Could not remove the database file.')
        // We should probably not relaunch if we can't delete the file
        return
      }
    }

    // Relaunch the application
    app.relaunch()
    app.quit()
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

  ipcMain.handle('search', async (_, payload: any) => {
    return await dbService.search(payload)
  })

  ipcMain.handle('create-playlist', async (_, payload) => {
    return await dbService.createPlaylist(payload)
  })

  ipcMain.handle('create-playlist-with-songs', async (_, payload) => {
    return await dbService.createPlaylistWithSongs(payload)
  })

  ipcMain.handle('get-playlists', async () => {
    return await dbService.getPlaylists()
  })

  ipcMain.handle('get-playlist', async (_, id: string) => {
    return await dbService.getPlaylist(id)
  })

  ipcMain.handle('get-songs-by-playlist-id', async (_, playlistId: string) => {
    return await dbService.getSongsByPlaylistId(playlistId)
  })

  ipcMain.handle(
    'add-song-to-playlist',
    async (_, payload: { playlistId: string; songId: string }) => {
      return await dbService.addSongToPlaylist(payload)
    }
  )

  ipcMain.handle('add-recently-played', async (_, payload) => {
    return await dbService.addRecentlyPlayed(payload)
  })

  ipcMain.handle('get-recently-played', async () => {
    return await dbService.getRecentlyPlayed()
  })

  ipcMain.handle('toggle-favorite', async (_, payload: { itemId: string; itemType: string }) => {
    return await dbService.toggleFavorite(payload)
  })

  ipcMain.handle('get-favorite-ids', async () => {
    return await dbService.getFavoriteIds()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Add isQuitting flag for tray logic
app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await DatabaseService.getInstance().close()
    app.quit()
  }
})

// Make sure to close DB on quit
app.on('quit', async () => {
  await DatabaseService.getInstance().close()
})