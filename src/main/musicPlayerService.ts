// src/main/musicPlayerService.ts
import { BrowserWindow, app } from 'electron'
import { DatabaseService, Song } from './database'
import { spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

// Ensure ffmpeg is available
import ffmpegPath from 'ffmpeg-static'

export class MusicPlayerService {
  private static instance: MusicPlayerService
  private playlist: Song[] = []
  private currentIndex = -1
  private currentSong: Song | null = null
  private databaseService: DatabaseService
  private tempFilePath: string | null = null

  // Playback state is cached here from renderer updates
  private isPlaying = false
  private currentTime = 0

  private constructor() {
    this.databaseService = DatabaseService.getInstance()
    // Ensure temporary files are deleted when the app closes
    app.on('will-quit', () => this.cleanupTempFile())
  }

  public static getInstance(): MusicPlayerService {
    if (!MusicPlayerService.instance) {
      MusicPlayerService.instance = new MusicPlayerService()
    }
    return MusicPlayerService.instance
  }

  public async loadSongs(): Promise<void> {
    // Await the promise from the new database service
    this.playlist = await this.databaseService.getSongs()
  }

  private cleanupTempFile(): void {
    if (this.tempFilePath && fs.existsSync(this.tempFilePath)) {
      try {
        fs.unlinkSync(this.tempFilePath)
        this.tempFilePath = null
      } catch (error) {
        console.error('Could not delete temp file:', error)
      }
    }
  }

  /**
   * Prepares a song for playback. If it's a FLAC, it's converted to a temporary WAV.
   * Otherwise, the original path is used.
   * @param song The song to prepare.
   * @returns A promise that resolves with the playable file path.
   */
  private prepareSong(song: Song): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cleanupTempFile() // Delete any old temp file

      const extension = path.extname(song.path).toLowerCase()

      if (extension === '.flac') {
        this.sendToFrontend('song-loading', true) // Inform UI we are converting
        const tempPath = path.join(app.getPath('temp'), `playback-${Date.now()}.wav`)
        this.tempFilePath = tempPath

        const ffmpeg = spawn(ffmpegPath, [
          '-i',
          song.path,
          '-acodec',
          'pcm_s16le', // Standard WAV codec
          '-ar',
          '44100', // CD quality sample rate
          '-ac',
          '2', // Stereo
          tempPath
        ])

        ffmpeg.on('close', (code) => {
          this.sendToFrontend('song-loading', false)
          if (code === 0) {
            resolve(tempPath)
          } else {
            reject(new Error(`FFmpeg exited with code ${code}`))
          }
        })

        ffmpeg.on('error', (err) => {
          this.sendToFrontend('song-loading', false)
          console.error('Failed to start FFmpeg:', err)
          reject(err)
        })
      } else {
        // For other supported formats, play them directly
        resolve(song.path)
      }
    })
  }

  public async play(songIndex?: number): Promise<void> {
    if (songIndex !== undefined) {
      this.currentIndex = songIndex
    }

    if (this.currentIndex === -1 && this.playlist.length > 0) {
      this.currentIndex = 0
    }

    const song = this.playlist[this.currentIndex]
    if (!song) return

    try {
      this.currentSong = song
      // This will set the cached state for the initial details request
      this.currentTime = 0
      this.isPlaying = true

      const playablePath = await this.prepareSong(song)

      const normalizedPath = playablePath.replace(/\\/g, '/')
      const safeUrl = `safe-file://${encodeURI(normalizedPath)}`

      this.sendToFrontend('play-file', {
        details: this.getCurrentSongDetails(),
        filePath: safeUrl // Send the corrected, URI-encoded, safe URL
      })
    } catch (error) {
      console.error(`Error preparing or reading song ${song.path}:`, error)
      this.playNext() // Try the next song on error
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

  // --- State management ---

  public updatePlaybackState(state: { isPlaying: boolean; currentTime: number }): void {
    this.isPlaying = state.isPlaying
    this.currentTime = state.currentTime
  }

  public getCurrentSongDetails() {
    if (this.currentSong) {
      return {
        ...this.currentSong,
        isPlaying: this.isPlaying,
        currentTime: this.currentTime
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