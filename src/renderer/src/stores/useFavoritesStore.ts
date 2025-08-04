import { create } from 'zustand'

type ItemType = 'song' | 'album' | 'artist'

interface FavoritesState {
  favoriteSongIds: Set<string>
  favoriteAlbumIds: Set<string>
  favoriteArtistIds: Set<string>
  actions: {
    loadFavorites: () => Promise<void>
    toggleFavorite: (itemId: string, itemType: ItemType) => Promise<void>
    isFavorite: (itemId: string, itemType: ItemType) => boolean
  }
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favoriteSongIds: new Set(),
  favoriteAlbumIds: new Set(),
  favoriteArtistIds: new Set(),
  actions: {
    loadFavorites: async () => {
      const { songs, albums, artists } = await window.api.getFavoriteIds()
      set({
        favoriteSongIds: new Set(songs),
        favoriteAlbumIds: new Set(albums),
        favoriteArtistIds: new Set(artists)
      })
    },
    toggleFavorite: async (itemId, itemType) => {
      // Optimistic update
      const state = get()
      const idSetKey = `favorite${itemType.charAt(0).toUpperCase() + itemType.slice(1)}Ids` as const
      const currentIds = new Set(state[idSetKey])
      const isCurrentlyFavorite = currentIds.has(itemId)

      if (isCurrentlyFavorite) {
        currentIds.delete(itemId)
      } else {
        currentIds.add(itemId)
      }
      set({ [idSetKey]: currentIds })

      // Call API and handle potential failure
      try {
        await window.api.toggleFavorite({ itemId, itemType })
        // The state is already updated, so we don't need to do anything on success.
      } catch (error) {
        console.error(`Failed to toggle favorite ${itemType}:`, error)
        // Revert state on failure
        const originalIds = new Set(state[idSetKey])
        if (isCurrentlyFavorite) {
          originalIds.add(itemId)
        } else {
          originalIds.delete(itemId)
        }
        set({ [idSetKey]: originalIds })
      }
    },
    isFavorite: (itemId, itemType) => {
      const state = get()
      switch (itemType) {
        case 'song':
          return state.favoriteSongIds.has(itemId)
        case 'album':
          return state.favoriteAlbumIds.has(itemId)
        case 'artist':
          return state.favoriteArtistIds.has(itemId)
        default:
          return false
      }
    }
  }
}))
