import { create } from 'zustand'

interface Song {
  id: number
  title: string
  path: string
  duration: number
  album: string
  artist: string
}

interface PlayerState {
  playlist: Song[]
  currentSong: (Song & { isPlaying: boolean; currentTime: number }) | null
  isPlaying: boolean
  currentIndex: number | null
  actions: {
    setPlaylist: (songs: Song[]) => void
    playSong: (index: number) => void
    pauseSong: () => void
    resumeSong: () => void
    playNextSong: () => void
    playPreviousSong: () => void
    seekSong: (time: number) => void
    updateCurrentSong: (songDetails: any) => void
    updatePlaybackState: (playbackState: { isPlaying: boolean }) => void
    initializeListeners: () => () => void
  }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  playlist: [],
  currentSong: null,
  isPlaying: false,
  currentIndex: null,
  actions: {
    setPlaylist: (songs) => set({ playlist: songs }),
    playSong: (index) => {
      const { playlist } = get()
      if (index >= 0 && index < playlist.length) {
        window.api.playSong(index)
        set({ currentIndex: index, isPlaying: true })
      }
    },
    pauseSong: () => {
      window.api.pauseSong()
      set({ isPlaying: false })
    },
    resumeSong: () => {
      window.api.resumeSong()
      set({ isPlaying: true })
    },
    playNextSong: () => {
      window.api.playNextSong()
    },
    playPreviousSong: () => {
      window.api.playPreviousSong()
    },
    seekSong: (time) => {
      window.api.seekSong(time)
    },
    updateCurrentSong: (songDetails) => {
      set({ currentSong: songDetails, isPlaying: songDetails.isPlaying })
      const playlist = get().playlist
      const songIndex = playlist.findIndex((s) => s.id === songDetails.id)
      if (songIndex !== -1) {
        set({ currentIndex: songIndex })
      }
    },
    updatePlaybackState: (playbackState) => {
      set({ isPlaying: playbackState.isPlaying })
    },
    initializeListeners: () => {
      const removeSongChangedListener = window.api.onSongChanged((songDetails) => {
        get().actions.updateCurrentSong(songDetails)
      })
      const removePlaybackStateListener = window.api.onPlaybackStateChanged((playbackState) => {
        get().actions.updatePlaybackState(playbackState)
      })

      // Return a cleanup function
      return () => {
        removeSongChangedListener()
        removePlaybackStateListener()
      }
    }
  }
}))
