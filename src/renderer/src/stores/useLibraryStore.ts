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
  year?: number
  artwork: string
}

export interface Artist {
  id: string
  name: string
  artwork: string
}

const SONGS_PER_PAGE = 50 // Define a page size

interface LibraryState {
  songs: Song[]
  albums: Album[]
  artists: Artist[]
  folders: string[]
  isScanning: boolean
  isLoadingMoreSongs: boolean // To prevent multiple simultaneous loads
  hasMoreSongs: boolean
  totalSongs: number
  currentPage: number
  actions: {
    loadLibrary: () => Promise<void>
    loadMoreSongs: () => Promise<void> // New action
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
  isScanning: true, // Start in loading state
  isLoadingMoreSongs: false,
  hasMoreSongs: true,
  totalSongs: 0,
  currentPage: 0,
  actions: {
    // Action to load all library data from the main process
    loadLibrary: async () => {
      // Prevent re-initialization if already loaded and not scanning
      if (!get().isScanning && get().songs.length > 0) return

      set({ isScanning: true, songs: [], currentPage: 0, totalSongs: 0 })
      try {
        const [folders, albums, artists, totalSongs] = await Promise.all([
          window.api.getMusicDirectories(),
          window.api.getAlbums(),
          window.api.getArtists(),
          window.api.getSongsCount()
        ])

        const songs = await window.api.getSongs({ limit: SONGS_PER_PAGE, offset: 0 })

        set({
          folders,
          albums,
          artists,
          totalSongs,
          songs,
          currentPage: 1,
          hasMoreSongs: songs.length < totalSongs,
          isScanning: false // Finish scanning state
        })
      } catch (error) {
        console.error('Failed to load library:', error)
        set({ isScanning: false })
      }
    },

    loadMoreSongs: async () => {
      const { isLoadingMoreSongs, hasMoreSongs, currentPage, songs, totalSongs } = get()
      if (isLoadingMoreSongs || !hasMoreSongs) return

      set({ isLoadingMoreSongs: true })

      try {
        const offset = currentPage * SONGS_PER_PAGE
        const newSongs = await window.api.getSongs({ limit: SONGS_PER_PAGE, offset })

        if (newSongs.length > 0) {
          const allSongs = [...songs, ...newSongs]
          set({
            songs: allSongs,
            currentPage: currentPage + 1,
            hasMoreSongs: allSongs.length < totalSongs
          })
        } else {
          set({ hasMoreSongs: false })
        }
      } catch (error) {
        console.error('Failed to load more songs:', error)
      } finally {
        set({ isLoadingMoreSongs: false })
      }
    },

    // Action to add a new folder to scan
    addFolder: async () => {
      // This will trigger the main process to open a dialog
      const success = await window.api.addMusicDirectory()
      if (success) {
        await get().actions.rescanFolders()
      }
    },

    // Action to remove a folder from the library
    removeFolder: async (path: string) => {
      await window.api.removeMusicDirectory(path)
      await get().actions.rescanFolders()
    },

    // Action to trigger a full library scan
    rescanFolders: async () => {
      set({ isScanning: true })
      try {
        await window.api.scanFolders()
        // After scanning, reload everything from scratch
        await get().actions.loadLibrary()
      } catch (error) {
        console.error('Failed to scan folders:', error)
        set({ isScanning: false })
      }
    }
  }
}))