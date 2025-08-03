// src/renderer/src/lib/howlerPlayer.ts
import { Howl } from 'howler'
import { Song } from '../stores/useLibraryStore'

// --- Type Definitions ---
interface PlayFilePayload {
  details: SongDetails
  filePath: string
}

interface SongDetails extends Song {
  isPlaying: boolean
  currentTime: number
}

export interface PlayerState {
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  rawDuration: number
  currentSongDetails: SongDetails | null
}

export class PlayerStateChangeEvent extends CustomEvent<PlayerState> {
  constructor(detail: PlayerState) {
    super('player-state-change', { detail })
  }
}

class HowlerPlayer {
  private currentSong: Howl | null = null
  private isSeeking = false
  private timeUpdateInterval: NodeJS.Timeout | null = null
  private state: PlayerState = {
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    rawDuration: 0,
    currentSongDetails: null
  }

  constructor() {
    this.setupApiListeners()
  }

  private cleanup() {
    if (this.currentSong) {
      this.currentSong.stop()
      this.currentSong.unload()
      this.currentSong = null
    }
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
      this.timeUpdateInterval = null
    }
  }

  private setupApiListeners() {
    window.api.onSongLoading((isLoading) => {
      this.state.isLoading = isLoading
      this.broadcastState()
    })

    window.api.onPlayFile((payload) => {
      this.cleanup()

      this.state.isLoading = true
      this.state.currentSongDetails = payload.details
      this.state.rawDuration = payload.details.rawDuration
      this.state.currentTime = 0
      this.broadcastState()

      this.currentSong = new Howl({
        src: [payload.filePath], // Directly use the 'safe-file://' URL
        html5: true,
        onplay: () => {
          this.state.isLoading = false
          this.state.isPlaying = true
          const newDuration = this.currentSong?.duration()
          // Only update the duration if it's a valid, finite number.
          // This prevents 'Infinity' from propagating to the UI slider if the
          // audio duration is not immediately available (e.g., streaming).
          if (newDuration && isFinite(newDuration)) {
            this.state.rawDuration = newDuration
          }
          this.startReportingState()
        },
        onpause: () => {
          this.state.isPlaying = false
          this.stopReportingState()
          this.broadcastState()
        },
        onseek: () => {
          this.state.currentTime = this.currentSong?.seek() as number
          this.broadcastState()
        },
        onend: () => {
          this.state.isPlaying = false
          this.stopReportingState()
          window.api.requestPlayNextSong()
        },
        onload: () => {
          // The 'load' event is the most reliable time to get the final duration.
          this.state.isLoading = false
          const newDuration = this.currentSong?.duration()
          if (newDuration && isFinite(newDuration)) {
            this.state.rawDuration = newDuration
          }
          this.broadcastState()
        },
        onloaderror: (id, err) => {
          console.error('Howler load error:', payload.details.name, err)
          this.state.isLoading = false
          this.broadcastState()
        },
        onplayerror: (id, err) => {
          console.error('Howler play error:', payload.details.name, err)
          this.state.isLoading = false
          this.broadcastState()
        }
      })
      this.currentSong.play()
    })
  }

  // --- PUBLIC CONTROL METHODS ---
  public togglePlayPause() {
    if (!this.currentSong) return
    if (this.currentSong.playing()) {
      this.currentSong.pause()
    } else {
      this.currentSong.play()
    }
  }

  public seek(time: number) {
    // --- THIS IS THE FIX ---
    // Add a sanity check to ensure the seek time is a valid, finite number.
    // This prevents the "non-finite" error if the duration calculation results in NaN or Infinity.
    if (this.currentSong && isFinite(time)) {
      this.currentSong.seek(time)
    } else {
      console.warn(`Seek ignored: Song not loaded or time is non-finite (${time}).`)
    }
  }

  private startReportingState() {
    this.stopReportingState()
    this.timeUpdateInterval = setInterval(() => {
      if (this.currentSong && this.currentSong.playing()) {
        this.state.currentTime = this.currentSong.seek() as number
        this.broadcastState()
      }
    }, 250)
  }

  private stopReportingState() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
      this.timeUpdateInterval = null
    }
  }

  private broadcastState() {
    window.api.updatePlaybackState({
      isPlaying: this.state.isPlaying,
      currentTime: this.state.currentTime
    })
    document.dispatchEvent(new PlayerStateChangeEvent(this.state))
  }
}

export const player = new HowlerPlayer()