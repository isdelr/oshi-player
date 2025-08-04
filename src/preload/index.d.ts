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

export interface Playlist {
  id: string
  name: string
  description: string | null
  artwork: string
  songCount: number
}

export interface SearchPayload {
  query: string
  filters: {
    songs: boolean
    albums: boolean
    artists: boolean
    playlists: boolean
  }
}

export type SearchResult = (Song | Album | Artist | Playlist) & {
  searchType: 'song' | 'album' | 'artist' | 'playlist'
}

export type RecentlyPlayedItem = (Song | Album | Artist | Playlist) & {
  itemType: 'song' | 'album' | 'artist' | 'playlist'
  playCount: number
  playedAt: string
  recentId: number // The ID from the recently_played table
  name: string
  artist?: string
}

export interface CreatePlaylistPayload {
  name: string
  description?: string
  artwork?: string
}

export interface GetSongsPayload {
  limit: number
  offset: number
}

export interface FavoriteIds {
  songs: string[]
  albums: string[]
  artists: string[]
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
  search: (payload: SearchPayload) => Promise<SearchResult[]>

  // Playlists
  createPlaylist: (payload: CreatePlaylistPayload) => Promise<{ id: string }>
  getPlaylists: () => Promise<Playlist[]>
  getPlaylist: (id: string) => Promise<Playlist | null>
  getSongsByPlaylistId: (playlistId: string) => Promise<Song[]>
  addSongToPlaylist: (payload: { playlistId: string; songId: string }) => Promise<void>

  // Recently Played
  addRecentlyPlayed: (payload: { itemId: string; itemType: string }) => Promise<void>
  getRecentlyPlayed: () => Promise<RecentlyPlayedItem[]>

  // Favorites
  toggleFavorite: (payload: {
    itemId: string
    itemType: string
  }) => Promise<{ isFavorite: boolean }>
  getFavoriteIds: () => Promise<FavoriteIds>

  // Settings
  getLoginSettings: () => Promise<Electron.LoginItemSettings>
  setLoginSettings: (settings: Electron.Settings) => Promise<void>
  relaunchApp: () => void
  resetApp: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IElectronAPI
  }
}
