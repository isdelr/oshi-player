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

export class DatabaseService {
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
      // In production, the app is packed in an ASAR file. Workers cannot run from
      // inside an ASAR, so electron-vite unpacks it. We need to find its new path.
      // We do this by replacing 'app.asar' in the path with 'app.asar.unpacked'.
      const unpackedDirname = __dirname.replace('app.asar', 'app.asar.unpacked')
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

  public getSongs(): Promise<Song[]> {
    return this.sendCommand('get-songs')
  }

  public getAlbums(): Promise<Album[]> {
    return this.sendCommand('get-albums')
  }

  public getArtists(): Promise<Artist[]> {
    return this.sendCommand('get-artists')
  }

  public async close(): Promise<void> {
    await this.sendCommand('close')
    await this.worker.terminate()
  }
}
