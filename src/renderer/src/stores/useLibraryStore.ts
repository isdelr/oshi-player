import { create } from 'zustand'

// Define types for our library items, assuming these from component mock data
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

interface LibraryState {
  songs: Song[]
  albums: Album[]
  artists: Artist[]
  folders: string[]
  isScanning: boolean
  actions: {
    loadLibrary: () => Promise<void>
    addFolder: () => Promise<void>
    removeFolder: (path: string) => Promise<void>
    rescanFolders: () => Promise<void>
  }
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  songs: [],
  albums: [],
  artists: [],
  folders: [],
  isScanning: false,
  actions: {
    // Action to load all library data from the main process
    loadLibrary: async () => {
      set({ isScanning: true })
      try {
        const [folders, songs, albums, artists] = await Promise.all([
          window.api.getMusicDirectories(),
          window.api.getSongs(),
          window.api.getAlbums(),
          window.api.getArtists()
        ])
        set({ folders, songs, albums, artists })
      } catch (error) {
        console.error('Failed to load library:', error)
      } finally {
        set({ isScanning: false })
      }
    },

    // Action to add a new folder to scan
    addFolder: async () => {
      // This will trigger the main process to open a dialog
      const success = await window.api.addMusicDirectory()
      if (success) {
        // If a folder was added, refresh the folder list and scan
        const folders = await window.api.getMusicDirectories()
        set({ folders })
        await get().actions.rescanFolders()
      }
    },

    // Action to remove a folder from the library
    removeFolder: async (path: string) => {
      await window.api.removeMusicDirectory(path)
      // Refresh folder list from main process and rescan to remove old songs
      const folders = await window.api.getMusicDirectories()
      set({ folders })
      await get().actions.rescanFolders()
    },

    // Action to trigger a full library scan
    rescanFolders: async () => {
      set({ isScanning: true })
      try {
        await window.api.scanFolders()
        // After scanning, refetch all data to update the UI
        const songs = await window.api.getSongs()
        const albums = await window.api.getAlbums()
        const artists = await window.api.getArtists()
        set({ songs, albums, artists })
      } catch (error) {
        console.error('Failed to scan folders:', error)
      } finally {
        set({ isScanning: false })
      }
    }
  }
}))