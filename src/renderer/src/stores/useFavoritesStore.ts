import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface FavoritesState {
  favoriteSongIds: Set<string>
  actions: {
    toggleFavorite: (songId: string) => void
    isFavorite: (songId: string) => boolean
  }
}

/**
 * Zustand store for managing favorite songs.
 * Uses persist middleware to save state to localStorage.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteSongIds: new Set(),
      actions: {
        /**
         * Toggles the favorite status of a song.
         * @param songId - The ID of the song to toggle.
         */
        toggleFavorite: (songId) => {
          set((state) => {
            const newFavoriteIds = new Set(state.favoriteSongIds)
            if (newFavoriteIds.has(songId)) {
              newFavoriteIds.delete(songId)
            } else {
              newFavoriteIds.add(songId)
            }
            return { favoriteSongIds: newFavoriteIds }
          })
        },
        /**
         * Checks if a song is favorited.
         * @param songId - The ID of the song to check.
         * @returns True if the song is a favorite, false otherwise.
         */
        isFavorite: (songId) => {
          return get().favoriteSongIds.has(songId)
        }
      }
    }),
    {
      name: 'oshi-favorite-songs-storage', // Unique name for localStorage item
      storage: createJSONStorage(() => localStorage, {
        // Custom replacer and reviver to handle Set serialization
        replacer: (key, value) => {
          if (key === 'favoriteSongIds' && value instanceof Set) {
            return Array.from(value)
          }
          return value
        },
        reviver: (key, value) => {
          if (key === 'favoriteSongIds') {
            return new Set(value as string[])
          }
          return value
        }
      })
    }
  )
)