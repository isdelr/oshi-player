// src/renderer/src/stores/usePlayerStore.ts
import { create } from 'zustand'
import { Song } from './useLibraryStore'
import { player, PlayerState } from '../lib/howlerPlayer'

interface CurrentSongDetails extends Song {
  isPlaying: boolean
  currentTime: number
}

interface AppPlayerState {
  playlist: Song[]
  currentSong: CurrentSongDetails | null
  isPlaying: boolean
  currentTime: number
  isLoading: boolean
  isSeeking: boolean
  currentIndex: number | null
  actions: {
    setPlaylist: (songs: Song[]) => void
    playSong: (index: number) => void
    togglePlayPause: () => void
    playNextSong: () => void
    playPreviousSong: () => void
    seekSong: (time: number) => void
    seekSongCommit: (time: number) => void
    initializeListeners: () => () => void
  }
}

export const usePlayerStore = create<AppPlayerState>((set, get) => ({
  playlist: [],
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  isLoading: false,
  isSeeking: false,
  currentIndex: null,
  actions: {
    setPlaylist: (songs) => set({ playlist: songs }),

    // Actions just send commands via the preload API
    playSong: (index) => {
      const { playlist } = get()
      if (index >= 0 && index < playlist.length) {
        // This still goes to main to prepare the file (e.g. FLAC conversion)
        window.api.playSong(index)
      }
    },
    togglePlayPause: () => {
      player.togglePlayPause()
    },
    playNextSong: () => window.api.playNextSong(),
    playPreviousSong: () => window.api.playPreviousSong(),

    // Sets seeking to true and updates the UI time for a smooth dragging experience.
    seekSong: (time) => {
      set({ isSeeking: true, currentTime: time })
    },
    // Commits the seek to the audio player and resets the seeking state.
    seekSongCommit: (time) => {
      player.seek(time)
      set({ isSeeking: false })
    },

    // This listener now listens to events on the document
    initializeListeners: () => {
      const handleStateChange = (event: Event) => {
        const newState = (event as CustomEvent<PlayerState>).detail
        const currentDetails = newState.currentSongDetails
          ? {
              ...newState.currentSongDetails,
              rawDuration: newState.rawDuration,
              isPlaying: newState.isPlaying,
              currentTime: newState.currentTime
            }
          : null

        set((state) => ({
          currentSong: currentDetails,
          isPlaying: newState.isPlaying,
          isLoading: newState.isLoading,
          // Only update the time from the player if the user is not dragging the slider
          currentTime: state.isSeeking ? state.currentTime : newState.currentTime
        }))

        if (newState.currentSongDetails) {
          const playlist = get().playlist
          const songIndex = playlist.findIndex((s) => s.id === newState.currentSongDetails?.id)
          set({ currentIndex: songIndex !== -1 ? songIndex : null })
        } else {
          set({ currentIndex: null })
        }
      }

      document.addEventListener('player-state-change', handleStateChange)

      // Still useful to get initial state on app load
      window.api.getCurrentSongDetails().then((details) => {
        if (details) {
          set({
            currentSong: details,
            isPlaying: details.isPlaying,
            currentTime: details.currentTime
          })
        }
      })

      // Return a cleanup function
      return () => {
        document.removeEventListener('player-state-change', handleStateChange)
      }
    }
  }
}))