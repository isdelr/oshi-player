// src/renderer/src/stores/usePlayerStore.ts
import { create } from 'zustand'
import { Song } from './useLibraryStore'
import React from 'react'

// Define the shape of the currently playing song, including its playback state
interface CurrentSongDetails extends Song {
  isPlaying: boolean
  currentTime: number
}

// Keep a reference to the audio element outside the store's state
// This prevents re-renders every time the ref is set, which is crucial for performance.
let audioRef: React.RefObject<HTMLAudioElement | null> | null = null

interface PlayerState {
  playlist: Song[]
  currentSong: CurrentSongDetails | null
  isPlaying: boolean
  currentTime: number
  volume: number
  isSeeking: boolean
  currentIndex: number | null
  actions: {
    // --- Public API for Components ---
    setAudioRef: (ref: React.RefObject<HTMLAudioElement | null>) => void
    playSong: (songs: Song[], index: number) => void
    togglePlayPause: () => void
    playNext: () => void
    playPrevious: () => void
    seek: (time: number) => void
    setVolume: (volumeLevel: number) => void // Accepts 0-100

    // --- Internal API for <audio> element events ---
    _handlePlay: () => void
    _handlePause: () => void
    _handleTimeUpdate: (e: React.SyntheticEvent<HTMLAudioElement>) => void
    _handleLoadedData: (e: React.SyntheticEvent<HTMLAudioElement>) => void
    _handleEnded: () => void
    _handleVolumeChange: (e: React.SyntheticEvent<HTMLAudioElement>) => void
    _handleSeeked: (e: React.SyntheticEvent<HTMLAudioElement>) => void
  }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // --- Initial State ---
  playlist: [],
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  volume: 1, // Stored as 0-1 for the <audio> element
  isSeeking: false,
  currentIndex: null,

  // --- Actions ---
  actions: {
    setAudioRef: (ref) => {
      audioRef = ref
    },

    playSong: (songs, index) => {
      if (!audioRef?.current) return
      const newSong = songs[index]
      if (!newSong) return

      const formattedPath = `safe-file://${newSong.path}`

      audioRef.current.src = formattedPath

      set({
        playlist: songs,
        currentIndex: index,
        currentSong: { ...newSong, isPlaying: true, currentTime: 0 },
        isPlaying: true,
        currentTime: 0
      })

      // Play the audio
      audioRef.current.play().catch((e) => {
        console.error('Error playing audio:', e)
        set({ isPlaying: false }) // Revert playing state if an error occurs
      })
    },

    togglePlayPause: () => {
      const { isPlaying, currentSong } = get()
      if (!audioRef?.current || !currentSong) return

      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(console.error)
      }
      // The actual `isPlaying` state is updated by the _handlePlay/_handlePause events
    },

    playNext: () => {
      const { playlist, currentIndex } = get()
      if (currentIndex === null || currentIndex >= playlist.length - 1) return
      get().actions.playSong(playlist, currentIndex + 1)
    },

    playPrevious: () => {
      const { playlist, currentIndex } = get()
      if (currentIndex === null || currentIndex <= 0) return
      get().actions.playSong(playlist, currentIndex - 1)
    },

    seek: (time) => {
      if (audioRef?.current) {
        set({ isSeeking: true })
        audioRef.current.currentTime = time
      }
    },

    setVolume: (volumeLevel) => {
      const newVolume = Math.max(0, Math.min(1, volumeLevel / 100))
      if (audioRef?.current) {
        audioRef.current.volume = newVolume
      }
      set({ volume: newVolume }) // Also update state for immediate UI feedback
    },

    // --- Internal Event Handlers ---

    _handlePlay: () => set({ isPlaying: true }),
    _handlePause: () => set({ isPlaying: false }),

    _handleTimeUpdate: (e) => {
      // Only update time if the user is not actively dragging the slider
      if (!get().isSeeking) {
        set({ currentTime: e.currentTarget.currentTime })
      }
    },

    _handleLoadedData: (e) => {
      // Apply the stored volume when a new track loads
      e.currentTarget.volume = get().volume
      set((state) => ({
        currentSong: state.currentSong
          ? { ...state.currentSong, rawDuration: e.currentTarget.duration }
          : null
      }))
    },

    _handleEnded: () => {
      get().actions.playNext()
    },

    _handleVolumeChange: (e) => {
      set({ volume: e.currentTarget.volume })
    },

    _handleSeeked: (e) => {
      // When seeking is finished, update the state and allow time updates again
      set({ isSeeking: false, currentTime: e.currentTarget.currentTime })
    }
  }
}))
