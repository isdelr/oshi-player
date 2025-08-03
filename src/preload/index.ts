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

  // Music Player APIs
  playSong: (songIndex?: number): void => ipcRenderer.send('play-song', songIndex),
  pauseSong: (): void => ipcRenderer.send('pause-song'),
  resumeSong: (): void => ipcRenderer.send('resume-song'),
  playNextSong: (): void => ipcRenderer.send('play-next-song'),
  playPreviousSong: (): void => ipcRenderer.send('play-previous-song'),
  seekSong: (time: number): void => ipcRenderer.send('seek-song', time),
  getCurrentSongDetails: (): Promise<any> => ipcRenderer.invoke('get-current-song-details'),
  onSongChanged: (callback: (songDetails: any) => void): (() => void) => {
    const handler = (_event, songDetails: any): void => callback(songDetails)
    ipcRenderer.on('song-changed', handler)
    return () => {
      ipcRenderer.removeListener('song-changed', handler)
    }
  },
  onPlaybackStateChanged: (callback: (playbackState: any) => void): (() => void) => {
    const handler = (_event, playbackState: any): void => callback(playbackState)
    ipcRenderer.on('playback-state', handler)
    return () => {
      ipcRenderer.removeListener('playback-state', handler)
    }
  }
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
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
