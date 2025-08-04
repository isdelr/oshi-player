import { create } from 'zustand'
import { RecentlyPlayedItem } from 'src/preload/index.d'

interface RecentlyPlayedState {
  items: RecentlyPlayedItem[]
  isLoading: boolean
  actions: {
    fetchHistory: () => Promise<void>
    clearHistory: () => Promise<void> // To be implemented later
  }
}

export const useRecentlyPlayedStore = create<RecentlyPlayedState>((set) => ({
  items: [],
  isLoading: true,
  actions: {
    fetchHistory: async () => {
      set({ isLoading: true })
      try {
        const items = await window.api.getRecentlyPlayed()
        set({ items, isLoading: false })
      } catch (error) {
        console.error('Failed to fetch recently played:', error)
        set({ isLoading: false })
      }
    },
    clearHistory: async () => {
      // TODO: Add DB and API call to clear history
      set({ items: [] })
    }
  }
}))