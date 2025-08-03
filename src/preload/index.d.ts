import { ElectronAPI } from '@electron-toolkit/preload'

// Redefine interfaces to avoid import issues and match the store
export interface Song {
  id: string
  name: string
  artist: string
  album: string
  duration: string
  artwork: string
  path: string
  rawDuration: number
}

export interface Album {
  id: string
  name: string
  artist: string
  year: number
  artwork: string
}

export interface Artist {
  id: string
  name: string
  artwork: string
}

export interface IElectronAPI {
  // Window
  minimize: () => void
  maximize: () => void
  close: () => void
  onWindowStateChange: (callback: (isMaximized: boolean) => void) => () => void

  // Settings
  getSetting: (key: string) => Promise<string | null>
  setSetting: (key: string, value: string) => Promise<void>

  // Library Management
  getMusicDirectories: () => Promise<string[]>
  addMusicDirectory: () => Promise<boolean>
  removeMusicDirectory: (path: string) => Promise<void>
  scanFolders: () => Promise<void>

  // Library Data
  getSongs: () => Promise<Song[]>
  getAlbums: () => Promise<Album[]>
  getArtists: () => Promise<Artist[]>

  // --- REVISED Music Player API ---

  // Commands from Renderer -> Main
  playSong: (songIndex?: number) => void
  playNextSong: () => void
  playPreviousSong: () => void
  getCurrentSongDetails: () => Promise<any>
  requestPlayNextSong: () => void
  updatePlaybackState: (state: { isPlaying: boolean; currentTime: number }) => void

  // Listeners for events from Main -> Renderer
  onSongLoading: (callback: (isLoading: boolean) => void) => () => void
  onPlayFile: (callback: (payload: { details: any; filePath: string }) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IElectronAPI
  }
}