// src/renderer/src/stores/usePlayerStore.ts
import { create } from 'zustand'
import { Song, useLibraryStore } from './useLibraryStore'
import React from 'react'

// Define the shape of the currently playing song, including its playback state
interface CurrentSongDetails extends Song {
  isPlaying: boolean
  currentTime: number
}

// Keep a reference to the audio element outside the store's state
let audioRef: React.RefObject<HTMLAudioElement | null> | null = null

interface PlayerState {
  playlist: Song[]
  currentSong: CurrentSongDetails | null
  isPlaying: boolean
  currentTime: number
  volume: number
  isSeeking: boolean
  currentIndex: number | null
  playlistSource: 'library' | 'album' | 'artist' | 'other' // To track where the music is from
  actions: {
    setAudioRef: (ref: React.RefObject<HTMLAudioElement | null>) => void
    playSong: (songs: Song[], index: number, source?: PlayerState['playlistSource']) => void
    togglePlayPause: () => void
    playNext: () => void
    playPrevious: () => void
    startSeeking: () => void
    seek: (time: number) => void
    setVolume: (volumeLevel: number) => void
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
  playlist: [],
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  volume: 1,
  isSeeking: false,
  currentIndex: null,
  playlistSource: 'other',

  actions: {
    setAudioRef: (ref) => {
      audioRef = ref
    },

    playSong: async (songs, index, source = 'other') => {
      if (!audioRef?.current) return
      const newSong = songs[index]
      if (!newSong) return

      try {
        const formattedPath = `safe-file://${newSong.path}`
        const audioBlob = await fetch(formattedPath)

        const audioUrl = URL.createObjectURL(await audioBlob.blob())
        // Clean up previous blob URL to prevent memory leaks
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src)
        }
        audioRef.current.src = audioUrl

        set({
          playlist: songs,
          currentIndex: index,
          currentSong: { ...newSong, isPlaying: true, currentTime: 0 },
          isPlaying: true,
          currentTime: 0,
          isSeeking: false,
          playlistSource: source // Track the source of the playlist
        })

        await audioRef.current.play()
      } catch (e) {
        console.error('Error playing audio:', e)
        set({ isPlaying: false })
      }
    },

    togglePlayPause: () => {
      const { isPlaying, currentSong } = get()
      if (!audioRef?.current || !currentSong) return

      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(console.error)
      }
    },

    playNext: () => {
      const { playlist, currentIndex } = get()
      const isLastSong = currentIndex === null || currentIndex >= playlist.length - 1

      // If it's the last song and the playlist came from the main library, try to load more.
      if (isLastSong && get().playlistSource === 'library' && useLibraryStore.getState().hasMoreSongs) {
        useLibraryStore.getState().actions.loadMoreSongs().then(() => {
            const updatedPlaylist = useLibraryStore.getState().songs
            const nextIndex = (get().currentIndex ?? -1) + 1
            if(nextIndex < updatedPlaylist.length) {
                get().actions.playSong(updatedPlaylist, nextIndex, 'library')
            }
        })
      } else if (!isLastSong) {
          get().actions.playSong(playlist, (currentIndex ?? -1) + 1, get().playlistSource)
      }
    },

    playPrevious: () => {
      const { playlist, currentIndex } = get()
      if (currentIndex === null || currentIndex <= 0) return
      get().actions.playSong(playlist, currentIndex - 1, get().playlistSource)
    },

    startSeeking: () => set({ isSeeking: true }),
    seek: (time) => {
      if (audioRef?.current) {
        audioRef.current.currentTime = time
      }
    },
    setVolume: (volumeLevel) => {
      const newVolume = Math.max(0, Math.min(1, volumeLevel / 100))
      if (audioRef?.current) {
        audioRef.current.volume = newVolume
      }
      set({ volume: newVolume })
    },
    _handlePlay: () => set({ isPlaying: true }),
    _handlePause: () => set({ isPlaying: false }),
    _handleTimeUpdate: (e) => {
      if (!get().isSeeking) {
        set({ currentTime: e.currentTarget.currentTime })
      }

      const {
        currentIndex,
        playlistSource,
      } = get()
      const { hasMoreSongs, isLoadingMoreSongs, actions: libraryActions } = useLibraryStore.getState()
      
      // Proactive loading only if playing from the main library view
      if (playlistSource === 'library' && currentIndex !== null && hasMoreSongs && !isLoadingMoreSongs) {
        const songsRemaining = useLibraryStore.getState().songs.length - 1 - currentIndex
        if (songsRemaining < 5) {
            libraryActions.loadMoreSongs().then(() => {
                // After loading, update the player's playlist to match the new, longer list
                const newPlaylist = useLibraryStore.getState().songs
                set({ playlist: newPlaylist })
            })
        }
      }
    },

    _handleLoadedData: (e) => {
      e.currentTarget.volume = get().volume
      set((state) => ({
        currentSong: state.currentSong
          ? { ...state.currentSong, rawDuration: e.currentTarget.duration }
          : null
      }))
    },

    _handleEnded: () => get().actions.playNext(),
    _handleVolumeChange: (e) => set({ volume: e.currentTarget.volume }),
    _handleSeeked: (e) => {
      set({
        isSeeking: false,
        currentTime: e.currentTarget.currentTime
      })
    }
  }
}))