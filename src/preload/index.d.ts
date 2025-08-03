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

export interface GetSongsPayload {
  limit: number
  offset: number
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
  getSongs: (payload: GetSongsPayload) => Promise<Song[]>
  getSongsCount: () => Promise<number>
  getAlbums: () => Promise<Album[]>
  getArtists: () => Promise<Artist[]>
  getAlbum: (id: string) => Promise<Album | null>
  getArtist: (id: string) => Promise<Artist | null>
  getSongsByAlbumId: (albumId: string) => Promise<Song[]>
  getAlbumsByArtistId: (artistId: string) => Promise<Album[]>
  getSongsByArtistId: (artistId: string) => Promise<Song[]>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IElectronAPI
  }
}