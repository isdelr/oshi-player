// src/main/database.worker.ts

import { parentPort, workerData } from 'worker_threads'
import path from 'path'
import Database from 'better-sqlite3'
import * as mm from 'music-metadata'
import { readdir, stat } from 'fs/promises'

// Note: The interface definitions are duplicated here to keep the worker self-contained.
// This is acceptable as they are simple data contracts.
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

const dbPath = workerData.dbPath

class DatabaseService {
  private static instance: DatabaseService
  private db: Database.Database

  private constructor() {
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL') // Good for concurrent read/write
    this.createTables()
    this.migrate()
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private createTables(): void {
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS music_directories (
        path TEXT PRIMARY KEY
      );
      CREATE TABLE IF NOT EXISTS artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        artistId INTEGER,
        year INTEGER,
        artworkPath TEXT,
        FOREIGN KEY (artistId) REFERENCES artists (id),
        UNIQUE(name, artistId)
      );
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        path TEXT NOT NULL UNIQUE,
        duration REAL,
        albumId INTEGER,
        artistId INTEGER,
        artworkPath TEXT,
        FOREIGN KEY (albumId) REFERENCES albums (id),
        FOREIGN KEY (artistId) REFERENCES artists (id)
      );

      -- OPTIMIZATION: Add indexes to foreign keys and other queried columns
      -- This dramatically speeds up JOINs and WHERE clauses in getSongs, getAlbums, etc.
      CREATE INDEX IF NOT EXISTS idx_songs_albumId ON songs (albumId);
      CREATE INDEX IF NOT EXISTS idx_songs_artistId ON songs (artistId);
      CREATE INDEX IF NOT EXISTS idx_albums_artistId ON albums (artistId);
      CREATE INDEX IF NOT EXISTS idx_artists_name ON artists (name);
    `
    this.db.exec(createTablesQuery)
  }

  private migrate(): void {
    try {
      const albumColumns = this.db.prepare('PRAGMA table_info(albums)').all() as { name: string }[]
      const songColumns = this.db.prepare('PRAGMA table_info(songs)').all() as { name: string }[]
      const hasAlbumArtworkPath = albumColumns.some((c) => c.name === 'artworkPath')
      const hasAlbumYear = albumColumns.some((c) => c.name === 'year')
      const hasSongArtworkPath = songColumns.some((c) => c.name === 'artworkPath')

      if (!hasAlbumArtworkPath) this.db.exec('ALTER TABLE albums ADD COLUMN artworkPath TEXT')
      if (!hasAlbumYear) this.db.exec('ALTER TABLE albums ADD COLUMN year INTEGER')
      if (!hasSongArtworkPath) this.db.exec('ALTER TABLE songs ADD COLUMN artworkPath TEXT')
    } catch (error) {
      console.error('Database migration failed:', error)
    }
  }

  public getSetting(key: string): string | null {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?')
    const result = stmt.get(key) as { value: string } | undefined
    return result ? result.value : null
  }

  public setSetting(key: string, value: string): void {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    stmt.run(key, value)
  }

  public getMusicDirectories(): string[] {
    const stmt = this.db.prepare('SELECT path FROM music_directories')
    const results = stmt.all() as { path: string }[]
    return results.map((row) => row.path)
  }

  public addMusicDirectory(path: string): void {
    const stmt = this.db.prepare('INSERT OR IGNORE INTO music_directories (path) VALUES (?)')
    stmt.run(path)
  }

  public removeMusicDirectory(path: string): void {
    const stmt = this.db.prepare('DELETE FROM music_directories WHERE path = ?')
    stmt.run(path)
    const deleteSongsStmt = this.db.prepare('DELETE FROM songs WHERE path LIKE ?')
    deleteSongsStmt.run(`${path}%`)
  }

  public async scanFolders(folderPaths: string[]): Promise<void> {
    for (const folderPath of folderPaths) {
      await this.scanDirectory(folderPath)
    }
  }

  private async scanDirectory(directory: string): Promise<void> {
    try {
      const files = await readdir(directory)
      for (const file of files) {
        const filePath = path.join(directory, file)
        try {
          const stats = await stat(filePath)
          if (stats.isDirectory()) {
            await this.scanDirectory(filePath)
          } else if (stats.isFile() && this.isAudioFile(filePath)) {
            await this.addSong(filePath)
          }
        } catch (error) {
          console.error(`Could not stat file ${filePath}:`, error)
        }
      }
    } catch (error) {
      console.error(`Could not read directory ${directory}:`, error)
    }
  }

  private isAudioFile(filePath: string): boolean {
    const supportedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.opus', '.flac']
    const ext = path.extname(filePath).toLowerCase()
    return supportedExtensions.includes(ext)
  }

  private async getEmbeddedArtwork(pictures: mm.IPicture[] | undefined): Promise<string | null> {
    if (!pictures || pictures.length === 0) return null
    const picture = pictures[0]
    return `data:${picture.format};base64,${picture.data.toString()}`
  }

  public async addSong(filePath: string): Promise<void> {
    // OPTIMIZATION: Wrap the entire song import process in a single transaction.
    // This is much faster than running individual INSERT/UPDATE statements,
    // especially during a large scan. It reduces disk I/O overhead significantly.
    const addSongTransaction = this.db.transaction(async (fp: string) => {
      try {
        const existingSong = this.db.prepare('SELECT id FROM songs WHERE path = ?').get(fp)
        if (existingSong) return // Skip if song already exists

        const metadata = await mm.parseFile(fp)
        const { common, format } = metadata

        if (!format.duration) return // Skip files with no duration

        const artwork = await this.getEmbeddedArtwork(common.picture)

        // Get or insert Artist
        const artistName = common.artist ?? 'Unknown Artist'
        let artist = this.db.prepare('SELECT id FROM artists WHERE name = ?').get(artistName) as
          | { id: number }
          | undefined
        if (!artist) {
          const { lastInsertRowid } = this.db
            .prepare('INSERT INTO artists (name) VALUES (?)')
            .run(artistName)
          artist = { id: lastInsertRowid as number }
        }
        const artistId = artist.id

        // Get or insert Album
        const albumName = common.album ?? 'Unknown Album'
        let album = this.db
          .prepare('SELECT id, artworkPath FROM albums WHERE name = ? AND artistId = ?')
          .get(albumName, artistId) as { id: number; artworkPath: string | null } | undefined
        if (!album) {
          const { lastInsertRowid } = this.db
            .prepare('INSERT INTO albums (name, artistId, year, artworkPath) VALUES (?, ?, ?, ?)')
            .run(albumName, artistId, common.year, artwork)
          album = { id: lastInsertRowid as number, artworkPath: artwork }
        } else if (artwork && !album.artworkPath) {
          this.db.prepare('UPDATE albums SET artworkPath = ? WHERE id = ?').run(artwork, album.id)
        }
        const albumId = album!.id

        // Insert Song
        this.db
          .prepare(
            'INSERT INTO songs (title, path, duration, albumId, artistId, artworkPath) VALUES (?, ?, ?, ?, ?, ?)'
          )
          .run(common.title ?? path.basename(fp), fp, format.duration, albumId, artistId, artwork)
      } catch (error) {
        console.error(`Error processing file ${fp}:`, error)
      }
    })

    addSongTransaction(filePath)
  }

  private formatDuration(seconds: number | undefined | null): string {
    if (seconds === null || seconds === undefined) return '0:00'
    const totalSeconds = Math.floor(seconds)
    const min = Math.floor(totalSeconds / 60)
    const sec = totalSeconds % 60
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  public getSongs(): Song[] {
    const stmt = this.db.prepare(`
      SELECT s.id, s.title as name, s.path, s.duration as rawDuration, al.name as album, ar.name as artist, COALESCE(s.artworkPath, al.artworkPath) as artwork
      FROM songs s
      JOIN albums al ON s.albumId = al.id
      JOIN artists ar ON s.artistId = ar.id
      ORDER BY ar.name, al.name, s.id
    `)
    return (stmt.all() as any[]).map((s: any) => ({
      ...s,
      id: s.id.toString(),
      duration: this.formatDuration(s.rawDuration)
    }))
  }

  public getAlbums(): Album[] {
    const stmt = this.db.prepare(`
      SELECT al.id, al.name, ar.name as artist, al.year, al.artworkPath as artwork
      FROM albums al
      JOIN artists ar ON al.artistId = ar.id
      ORDER BY ar.name, al.name
    `)
    return (stmt.all() as any[]).map((a: any) => ({ ...a, id: a.id.toString() }))
  }

  public getArtists(): Artist[] {
    const stmt = this.db.prepare(`
      SELECT ar.id, ar.name, (SELECT al.artworkPath FROM albums al WHERE al.artistId = ar.id AND al.artworkPath IS NOT NULL LIMIT 1) as artwork
      FROM artists ar
      ORDER BY ar.name
    `)
    return (stmt.all() as any[]).map((a: any) => ({ ...a, id: a.id.toString() }))
  }

  public close(): void {
    this.db.close()
  }
}

// --- Worker Message Handling ---

const db = DatabaseService.getInstance()

parentPort?.on('message', async (msg: { type: string; payload?: any; id: number }) => {
  try {
    let result: any
    switch (msg.type) {
      case 'get-setting':
        result = db.getSetting(msg.payload)
        break
      case 'set-setting':
        result = db.setSetting(msg.payload.key, msg.payload.value)
        break
      case 'get-music-directories':
        result = db.getMusicDirectories()
        break
      case 'add-music-directory':
        result = db.addMusicDirectory(msg.payload)
        break
      case 'remove-music-directory':
        result = db.removeMusicDirectory(msg.payload)
        break
      case 'scan-folders':
        result = await db.scanFolders(msg.payload)
        break
      case 'get-songs':
        result = db.getSongs()
        break
      case 'get-albums':
        result = db.getAlbums()
        break
      case 'get-artists':
        result = db.getArtists()
        break
      case 'close':
        result = db.close()
        break
      default:
        throw new Error(`Unknown database worker command: ${msg.type}`)
    }
    parentPort?.postMessage({ id: msg.id, result })
  } catch (error) {
    parentPort?.postMessage({
      id: msg.id,
      error: error instanceof Error ? error.message : String(error)
    })
  }
})