import { Worker } from 'worker_threads'
import path from 'path'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'

// Keep the interfaces here for type safety in the main process
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

export interface Playlist {
  id: string
  name: string
  description: string | null
  artwork: string | null
  songCount: number
}

export interface SearchPayload {
  query: string
  filters: {
    songs: boolean
    albums: boolean
    artists: boolean
    playlists: boolean
  }
}

// The search result can be any of the main types, plus a new field to distinguish them
export type SearchResult = (Song | Album | Artist | Playlist) & {
  searchType: 'song' | 'album' | 'artist' | 'playlist'
}

export type RecentlyPlayedItem = (Song | Album | Artist | Playlist) & {
  itemType: 'song' | 'album' | 'artist' | 'playlist'
  playCount: number
  playedAt: string
  recentId: number
  name: string
}

export interface GetSongsPayload {
  limit: number
  offset: number
}

export interface FavoriteIds {
  songs: string[]
  albums: string[]
  artists: string[]
}

export class DatabaseService {
  createPlaylist(payload: {
    name: string
    description: string
    artwork: string
  }): Promise<{ id: string }> {
    return this.sendCommand('create-playlist', payload)
  }

  createPlaylistWithSongs(payload: {
    name: string
    description?: string
    songIds: string[]
  }): Promise<{ id: string }> {
    return this.sendCommand('create-playlist-with-songs', payload)
  }
  getPlaylists(): Promise<Playlist[]> {
    return this.sendCommand('get-playlists')
  }

  private static instance: DatabaseService
  private worker: Worker
  private nextRequestId = 0
  private pendingRequests = new Map<
    number,
    { resolve: (value: any) => void; reject: (reason?: any) => void }
  >()

  private constructor() {
    let workerPath: string

    // Get the database path from the main process
    const dbPath = path.join(app.getPath('userData'), 'app.db')

    if (is.dev) {
      // In development, use the compiled JS file from the out directory
      workerPath = path.join(__dirname, 'database.worker.js')
    } else {
      const unpackedDirname = __dirname.replace('app.asar', 'app.asar')
      workerPath = path.join(unpackedDirname, 'database.worker.js')
    }

    console.log(`[DatabaseService] Loading worker from path: ${workerPath}`)

    // Pass the database path to the worker via workerData
    this.worker = new Worker(workerPath, {
      workerData: { dbPath }
    })

    this.worker.on('message', (msg: { id: number; result?: any; error?: string }) => {
      const promise = this.pendingRequests.get(msg.id)
      if (promise) {
        if (msg.error) {
          promise.reject(new Error(msg.error))
        } else {
          promise.resolve(msg.result)
        }
        this.pendingRequests.delete(msg.id)
      }
    })

    this.worker.on('error', (err) => {
      console.error('Database worker error:', err)
    })

    this.worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Database worker stopped with exit code ${code}`)
      }
    })
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private sendCommand<T>(type: string, payload?: any): Promise<T> {
    const id = this.nextRequestId++
    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })
      this.worker.postMessage({ id, type, payload })
    })
  }

  // --- Public API mirroring the worker's capabilities ---

  public getSetting(key: string): Promise<string | null> {
    return this.sendCommand('get-setting', key)
  }

  public setSetting(key: string, value: string): Promise<void> {
    return this.sendCommand('set-setting', { key, value })
  }

  public getMusicDirectories(): Promise<string[]> {
    return this.sendCommand('get-music-directories')
  }

  public addMusicDirectory(path: string): Promise<void> {
    return this.sendCommand('add-music-directory', path)
  }

  public removeMusicDirectory(path: string): Promise<void> {
    return this.sendCommand('remove-music-directory', path)
  }

  public scanFolders(folderPaths: string[]): Promise<void> {
    return this.sendCommand('scan-folders', folderPaths)
  }

  public getSongs(payload: GetSongsPayload): Promise<Song[]> {
    return this.sendCommand('get-songs', payload)
  }

  public getSongsCount(): Promise<number> {
    return this.sendCommand('get-songs-count')
  }

  public getAlbums(): Promise<Album[]> {
    return this.sendCommand('get-albums')
  }

  public getArtists(): Promise<Artist[]> {
    return this.sendCommand('get-artists')
  }

  public getAlbum(id: string): Promise<Album | null> {
    return this.sendCommand('get-album', id)
  }

  public getArtist(id: string): Promise<Artist | null> {
    return this.sendCommand('get-artist', id)
  }

  public getSongsByAlbumId(albumId: string): Promise<Song[]> {
    return this.sendCommand('get-songs-by-album-id', albumId)
  }

  public getAlbumsByArtistId(artistId: string): Promise<Album[]> {
    return this.sendCommand('get-albums-by-artist-id', artistId)
  }

  public getSongsByArtistId(artistId: string): Promise<Song[]> {
    return this.sendCommand('get-songs-by-artist-id', artistId)
  }

  public search(payload: SearchPayload): Promise<SearchResult[]> {
    return this.sendCommand('search', payload)
  }

  public getPlaylist(id: string): Promise<Playlist | null> {
    return this.sendCommand('get-playlist', id)
  }

  public getSongsByPlaylistId(playlistId: string): Promise<Song[]> {
    return this.sendCommand('get-songs-by-playlist-id', playlistId)
  }

  public addSongToPlaylist(payload: { playlistId: string; songId: string }): Promise<void> {
    return this.sendCommand('add-song-to-playlist', {
      playlistId: Number(payload.playlistId),
      songId: Number(payload.songId)
    })
  }

  public addRecentlyPlayed(payload: { itemId: string; itemType: string }): Promise<void> {
    return this.sendCommand('add-recently-played', payload)
  }

  public getRecentlyPlayed(): Promise<RecentlyPlayedItem[]> {
    return this.sendCommand('get-recently-played')
  }

  public toggleFavorite(payload: {
    itemId: string
    itemType: string
  }): Promise<{ isFavorite: boolean }> {
    return this.sendCommand('toggle-favorite', payload)
  }

  public getFavoriteIds(): Promise<FavoriteIds> {
    return this.sendCommand('get-favorite-ids')
  }

  public async close(): Promise<void> {
    await this.sendCommand('close')
    await this.worker.terminate()
  }
}