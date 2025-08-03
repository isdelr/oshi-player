import { Howl } from 'howler'
import { DatabaseService } from './database'
import { BrowserWindow } from 'electron'

export class MusicPlayerService {
  private static instance: MusicPlayerService
  private playlist: any[] = []
  private currentIndex = -1
  private currentSong: Howl | null = null
  private databaseService: DatabaseService

  private constructor() {
    this.databaseService = DatabaseService.getInstance()
  }

  public static getInstance(): MusicPlayerService {
    if (!MusicPlayerService.instance) {
      MusicPlayerService.instance = new MusicPlayerService()
    }
    return MusicPlayerService.instance
  }

  public async loadSongs(): Promise<void> {
    this.playlist = this.databaseService.getSongs()
  }

  public play(songIndex?: number): void {
    if (songIndex !== undefined) {
      this.currentIndex = songIndex
    }

    if (this.currentIndex === -1 && this.playlist.length > 0) {
      this.currentIndex = 0
    }

    if (this.currentSong) {
      this.currentSong.stop()
    }

    const song = this.playlist[this.currentIndex]
    if (song) {
      this.currentSong = new Howl({
        src: [song.path],
        html5: true,
        onend: () => {
          this.playNext()
        }
      })
      this.currentSong.play()
      this.sendToFrontend('song-changed', this.getCurrentSongDetails())
    }
  }

  public pause(): void {
    if (this.currentSong?.playing()) {
      this.currentSong.pause()
      this.sendToFrontend('playback-state', { isPlaying: false })
    }
  }

  public resume(): void {
    if (this.currentSong && !this.currentSong.playing()) {
      this.currentSong.play()
      this.sendToFrontend('playback-state', { isPlaying: true })
    }
  }

  public playNext(): void {
    if (this.currentIndex < this.playlist.length - 1) {
      this.play(this.currentIndex + 1)
    }
  }

  public playPrevious(): void {
    if (this.currentIndex > 0) {
      this.play(this.currentIndex - 1)
    }
  }

  public seek(time: number): void {
    if (this.currentSong) {
      this.currentSong.seek(time)
    }
  }

  public getCurrentSongDetails() {
    if (this.currentIndex !== -1 && this.playlist[this.currentIndex]) {
      const song = this.playlist[this.currentIndex]
      return {
        ...song,
        isPlaying: this.currentSong?.playing() ?? false,
        currentTime: this.currentSong?.seek() ?? 0,
        duration: this.currentSong?.duration() ?? song.duration
      }
    }
    return null
  }

  private sendToFrontend(channel: string, data: any): void {
    const window = BrowserWindow.getAllWindows()[0]
    if (window) {
      window.webContents.send(channel, data)
    }
  }
}