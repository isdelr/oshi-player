import { create } from 'zustand'
import { Album, Artist, Song } from './useLibraryStore'
import { usePlayerStore } from './usePlayerStore'
import { debounce } from '@renderer/lib/utils'

// Define the shape of search results
export type SearchResultItem = (Song | Album | Artist | Playlist) & {
  searchType: 'song' | 'album' | 'artist' | 'playlist'
}

// Define the shape of a playlist for search purposes
export interface Playlist {
  id: string
  name: string
}

// Define the filters for the search
export type SearchFilters = {
  songs: boolean
  artists: boolean
  albums: boolean
  playlists: boolean
}

// Define the state for the search store
interface SearchState {
  query: string
  results: SearchResultItem[]
  isLoading: boolean
  isSearchOpen: boolean
  activeFilters: SearchFilters
  actions: {
    setQuery: (query: string) => void
    setSearchOpen: (isOpen: boolean) => void
    toggleFilter: (filter: keyof SearchFilters) => void
    _performSearch: () => Promise<void>
  }
}

// Create the search store using Zustand
const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  isLoading: false,
  isSearchOpen: false,
  activeFilters: {
    songs: true,
    artists: true,
    albums: true,
    playlists: true
  },
  actions: {
    /**
     * Sets the search query and triggers a debounced search.
     * @param {string} query - The search query.
     */
    setQuery: (query) => {
      set({ query, isLoading: query.length > 0 })
      if (query.length > 0) {
        set({ isSearchOpen: true })
        debouncedSearch()
      } else {
        debouncedSearch.cancel()
        set({ results: [], isLoading: false })
      }
    },
    /**
     * Sets the search popover's open state.
     * @param {boolean} isOpen - Whether the search popover is open.
     */
    setSearchOpen: (isOpen) => {
      set({ isSearchOpen: isOpen })
      if (!isOpen) {
        set({ query: '', results: [], isLoading: false })
      }
    },
    /**
     * Toggles a search filter.
     * @param {keyof SearchFilters} filter - The filter to toggle.
     */
    toggleFilter: (filter) => {
      set((state) => {
        const newFilters = { ...state.activeFilters, [filter]: !state.activeFilters[filter] }
        const atLeastOneActive = Object.values(newFilters).some((v) => v)
        if (!atLeastOneActive) {
          return {} // Prevent deactivating the last filter
        }
        return { activeFilters: newFilters }
      })
      if (get().query) {
        get().actions._performSearch()
      }
    },
    /**
     * Performs the search operation by calling the backend and filtering local data.
     */
    _performSearch: async () => {
      const { query, activeFilters } = get()
      if (!query) {
        set({ results: [], isLoading: false })
        return
      }

      set({ isLoading: true })
      try {
        const dbResults = await window.api.search({ query, filters: activeFilters })

        let playlistResults: SearchResultItem[] = []
        if (activeFilters.playlists) {
          const mockPlaylists = ['Chill Mix', 'Workout Beats', 'Late Night Lo-fi', 'Road Trip Jams']
          const createSlug = (name: string): string => name.toLowerCase().replace(/\s+/g, '-')
          playlistResults = mockPlaylists
            .filter((p) => p.toLowerCase().includes(query.toLowerCase()))
            .map(
              (p) =>
                ({
                  id: createSlug(p),
                  name: p,
                  searchType: 'playlist'
                }) as SearchResultItem
            )
        }

        set({ results: [...dbResults, ...playlistResults], isLoading: false })
      } catch (error) {
        console.error('Search failed:', error)
        set({ isLoading: false })
      }
    }
  }
}))

// Debounce the search function to avoid excessive requests
const debouncedSearch = debounce(() => {
  useSearchStore.getState().actions._performSearch()
}, 300)

export { useSearchStore }

/**
 * Handles the selection of a search result item.
 * @param {SearchResultItem} item - The selected search item.
 */
export const handleSearchResultSelect = (item: SearchResultItem): void => {
  useSearchStore.getState().actions.setSearchOpen(false)
  const { playSong } = usePlayerStore.getState().actions

  switch (item.searchType) {
    case 'song':
      playSong([item as Song], 0)
      break
  }
}
