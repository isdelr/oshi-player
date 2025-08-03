import { app } from 'electron'
import path from 'path'
import Database from 'better-sqlite3'
import * as mm from 'music-metadata'
import { readdir, stat } from 'fs/promises'

// Define the types to match the store
export interface Song {
  id: string
  name: string
  artist: string
  album: string
  duration: string
  artwork: string
  path: string
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

const dbPath = path.join(app.getPath('userData'), 'app.db')

export class DatabaseService {
  private static instance: DatabaseService
  private db: Database.Database

  private constructor() {
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.createTables()
    // Run migration logic to handle schema changes on existing databases
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
        artworkPath TEXT, -- Store base64 artwork string
        FOREIGN KEY (albumId) REFERENCES albums (id),
        FOREIGN KEY (artistId) REFERENCES artists (id)
      );
    `
    this.db.exec(createTablesQuery)
  }

  /**
   * Simple migration system to add missing columns to existing tables.
   * This prevents errors when the app is updated with a new schema.
   */
  private migrate(): void {
    try {
      const albumColumns = this.db.prepare('PRAGMA table_info(albums)').all() as { name: string }[]
      const songColumns = this.db.prepare('PRAGMA table_info(songs)').all() as { name: string }[]

      const hasAlbumArtworkPath = albumColumns.some((c) => c.name === 'artworkPath')
      const hasAlbumYear = albumColumns.some((c) => c.name === 'year')
      const hasSongArtworkPath = songColumns.some((c) => c.name === 'artworkPath')

      if (!hasAlbumArtworkPath) {
        this.db.exec('ALTER TABLE albums ADD COLUMN artworkPath TEXT')
      }
      if (!hasAlbumYear) {
        this.db.exec('ALTER TABLE albums ADD COLUMN year INTEGER')
      }
      if (!hasSongArtworkPath) {
        this.db.exec('ALTER TABLE songs ADD COLUMN artworkPath TEXT')
      }
    } catch (error) {
      console.error('Database migration failed:', error)
    }
  }

  // --- Settings ---
  public getSetting(key: string): string | null {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?')
    const result = stmt.get(key) as { value: string } | undefined
    return result ? result.value : null
  }

  public setSetting(key: string, value: string): void {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    stmt.run(key, value)
  }

  // --- Music Directories ---
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
    // Also remove songs from that path to keep DB clean
    const deleteSongsStmt = this.db.prepare('DELETE FROM songs WHERE path LIKE ?')
    deleteSongsStmt.run(`${path}%`)
  }

  // --- Scanning Logic ---
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
    const supportedExtensions = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac']
    const ext = path.extname(filePath).toLowerCase()
    return supportedExtensions.includes(ext)
  }

  private async getEmbeddedArtwork(pictures: mm.IPicture[] | undefined): Promise<string | null> {
    if (!pictures || pictures.length === 0) {
      return null
    }
    const picture = pictures[0]
    // **FIXED**: Correctly encode the buffer to a base64 string.
    const base64String = picture.data.toString('base64')
    return `data:${picture.format};base64,${base64String}`
  }

  public async addSong(filePath: string): Promise<void> {
    try {
      const metadata = await mm.parseFile(filePath)
      const { common, format } = metadata
      const artwork = await this.getEmbeddedArtwork(common.picture)

      const getArtistId = this.db.transaction((name: string) => {
        let artist = this.db.prepare('SELECT id FROM artists WHERE name = ?').get(name) as
          | { id: number }
          | undefined
        if (!artist) {
          const { lastInsertRowid } = this.db
            .prepare('INSERT INTO artists (name) VALUES (?)')
            .run(name)
          artist = { id: lastInsertRowid as number }
        }
        return artist.id
      })

      const getAlbumId = this.db.transaction(
        (albumName: string, artistId: number, year: number | undefined, art: string | null) => {
          let album = this.db
            .prepare('SELECT id, artworkPath FROM albums WHERE name = ? AND artistId = ?')
            .get(albumName, artistId) as { id: number; artworkPath: string | null } | undefined

          if (!album) {
            const { lastInsertRowid } = this.db
              .prepare('INSERT INTO albums (name, artistId, year, artworkPath) VALUES (?, ?, ?, ?)')
              .run(albumName, artistId, year, art)
            album = { id: lastInsertRowid as number, artworkPath: art }
          } else if (art && !album.artworkPath) {
            this.db.prepare('UPDATE albums SET artworkPath = ? WHERE id = ?').run(art, album.id)
          }
          return album!.id
        }
      )

      const artistId = getArtistId(common.artist ?? 'Unknown Artist')
      const albumId = getAlbumId(common.album ?? 'Unknown Album', artistId, common.year, artwork)

      const stmt = this.db.prepare(
        'INSERT OR IGNORE INTO songs (title, path, duration, albumId, artistId, artworkPath) VALUES (?, ?, ?, ?, ?, ?)'
      )
      stmt.run(
        common.title ?? path.basename(filePath),
        filePath,
        format.duration,
        albumId,
        artistId,
        artwork
      )
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error)
    }
  }

  // --- Data Retrieval ---
  private formatDuration(seconds: number | undefined | null): string {
    if (seconds === null || seconds === undefined) return '0:00'
    const totalSeconds = Math.floor(seconds)
    const min = Math.floor(totalSeconds / 60)
    const sec = totalSeconds % 60
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  public getSongs(): Song[] {
    const stmt = this.db.prepare(`
      SELECT
        s.id,
        s.title as name,
        s.path,
        s.duration,
        al.name as album,
        ar.name as artist,
        COALESCE(s.artworkPath, al.artworkPath) as artwork
      FROM songs s
      JOIN albums al ON s.albumId = al.id
      JOIN artists ar ON s.artistId = ar.id
      ORDER BY ar.name, al.name, s.id
    `)
    const songs = stmt.all()
    return songs.map((s: any) => ({
      ...s,
      id: s.id.toString(),
      duration: this.formatDuration(s.duration)
    }))
  }

  public getAlbums(): Album[] {
    const stmt = this.db.prepare(`
      SELECT
        al.id,
        al.name,
        ar.name as artist,
        al.year,
        al.artworkPath as artwork
      FROM albums al
      JOIN artists ar ON al.artistId = ar.id
      WHERE al.artworkPath IS NOT NULL
      ORDER BY ar.name, al.name
    `)
    const albums = stmt.all()
    return albums.map((a: any) => ({ ...a, id: a.id.toString() }))
  }

  public getArtists(): Artist[] {
    const stmt = this.db.prepare(`
      SELECT
        ar.id,
        ar.name,
        (SELECT al.artworkPath FROM albums al WHERE al.artistId = ar.id AND al.artworkPath IS NOT NULL LIMIT 1) as artwork
      FROM artists ar
      WHERE artwork IS NOT NULL
      ORDER BY ar.name
    `)
    const artists = stmt.all()
    return artists.map((a: any) => ({ ...a, id: a.id.toString() }))
  }

  public close(): void {
    this.db.close()
  }
}
