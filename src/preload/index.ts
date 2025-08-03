// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Window Controls
  minimize: (): void => ipcRenderer.send('minimize-window'),
  maximize: (): void => ipcRenderer.send('maximize-window'),
  close: (): void => ipcRenderer.send('close-window'),
  onWindowStateChange: (callback: (isMaximized: boolean) => void): (() => void) => {
    const handler = (_event, isMaximized: boolean): void => callback(isMaximized)
    ipcRenderer.on('window-state-change', handler)
    return () => {
      ipcRenderer.removeListener('window-state-change', handler)
    }
  },

  // Settings
  getSetting: (key: string): Promise<string | null> => ipcRenderer.invoke('get-setting', key),
  setSetting: (key: string, value: string): Promise<void> =>
    ipcRenderer.invoke('set-setting', key, value),

  // Library Management
  getMusicDirectories: (): Promise<string[]> => ipcRenderer.invoke('get-music-directories'),
  addMusicDirectory: (): Promise<boolean> => ipcRenderer.invoke('add-music-directory'),
  removeMusicDirectory: (path: string): Promise<void> =>
    ipcRenderer.invoke('remove-music-directory', path),
  scanFolders: (): Promise<void> => ipcRenderer.invoke('scan-folders'),

  // Library Data
  getSongs: (): Promise<any[]> => ipcRenderer.invoke('get-songs'),
  getAlbums: (): Promise<any[]> => ipcRenderer.invoke('get-albums'),
  getArtists: (): Promise<any[]> => ipcRenderer.invoke('get-artists'),
  getAlbum: (id: string): Promise<any> => ipcRenderer.invoke('get-album', id),
  getArtist: (id: string): Promise<any> => ipcRenderer.invoke('get-artist', id),
  getSongsByAlbumId: (albumId: string): Promise<any[]> =>
    ipcRenderer.invoke('get-songs-by-album-id', albumId),
  getAlbumsByArtistId: (artistId: string): Promise<any[]> =>
    ipcRenderer.invoke('get-albums-by-artist-id', artistId),
  getSongsByArtistId: (artistId: string): Promise<any[]> =>
    ipcRenderer.invoke('get-songs-by-artist-id', artistId)
}

// ... contextBridge logic remains the same
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}