// src/main/musicPlayerService.ts
import { DatabaseService } from './database'

export class MusicPlayerService {
  private static instance: MusicPlayerService
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

  // This is now just a proxy to the database service
  public async loadSongs(): Promise<void> {
    await this.databaseService.getSongs()
  }

}