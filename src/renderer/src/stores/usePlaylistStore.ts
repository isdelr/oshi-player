import { create } from 'zustand'
import { Playlist } from 'src/preload/index.d'

interface CreatePlaylistPayload {
  name: string
  description?: string
  artwork?: string
}

interface PlaylistState {
  playlists: Playlist[]
  loading: boolean
  actions: {
    fetchPlaylists: () => Promise<void>
    createPlaylist: (payload: CreatePlaylistPayload) => Promise<{ id: string } | undefined>
    addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>
  }
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  loading: false,
  actions: {
    fetchPlaylists: async () => {
      set({ loading: true })
      try {
        const playlists = await window.api.getPlaylists()
        set({ playlists, loading: false })
      } catch (error) {
        console.error('Failed to fetch playlists:', error)
        set({ loading: false })
      }
    },
    createPlaylist: async (payload) => {
      try {
        const newPlaylistId = await window.api.createPlaylist(payload)
        // Refresh the playlist list
        await get().actions.fetchPlaylists()
        return newPlaylistId
      } catch (error) {
        console.error('Failed to create playlist:', error)
        return undefined
      }
    },
    addSongToPlaylist: async (playlistId, songId) => {
      try {
        await window.api.addSongToPlaylist({ playlistId, songId })
        // After adding a song, we refetch the playlists to update the songCount
        await get().actions.fetchPlaylists()
      } catch (error) {
        console.error('Failed to add song to playlist:', error)
      }
    }
  }
}))