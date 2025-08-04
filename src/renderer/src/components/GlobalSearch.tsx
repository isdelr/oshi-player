// src/renderer/src/components/GlobalSearch.tsx
import { Search, Music, Mic2, Album as AlbumIcon, ListMusic, Loader2, X } from 'lucide-react'
import { Input } from './ui/input'
import { JSX, useEffect, useRef } from 'react'
import {
  useSearchStore,
  SearchResultItem,
  SearchFilters,
  handleSearchResultSelect
} from '@renderer/stores/useSearchStore'
import { Command, CommandEmpty, CommandGroup, CommandList, CommandItem } from './ui/command'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { createPortal } from 'react-dom'

function SearchResult({ item }: { item: SearchResultItem }): JSX.Element {
  const renderContent = (): JSX.Element => {
    switch (item.searchType) {
      case 'song':
        return (
          <>
            <Avatar className="size-8 rounded-sm">
              <AvatarImage src={item.artwork} className="object-cover" />
              <AvatarFallback className="rounded-sm bg-muted">
                <Music className="size-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-normal text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
            </div>
          </>
        )
      case 'album':
        return (
          <Link
            to="/album/$albumId"
            params={{ albumId: item.id }}
            className="flex w-full items-center gap-3"
          >
            <Avatar className="size-8 rounded-sm">
              <AvatarImage src={item.artwork} className="object-cover" />
              <AvatarFallback className="rounded-sm bg-muted">
                <AlbumIcon className="size-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-normal text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
            </div>
          </Link>
        )
      case 'artist':
        return (
          <Link
            to="/artist/$artistId"
            params={{ artistId: item.id }}
            className="flex w-full items-center gap-3"
          >
            <Avatar className="size-8 rounded-full">
              <AvatarImage src={item.artwork} className="object-cover" />
              <AvatarFallback className="rounded-full bg-muted">
                <Mic2 className="size-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-normal text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">Artist</p>
            </div>
          </Link>
        )
      case 'playlist':
        return (
          <Link
            to="/playlist/$playlistId"
            params={{ playlistId: item.id }}
            className="flex w-full items-center gap-3"
          >
            <Avatar className="size-8 rounded-sm">
              <AvatarImage src={item.artwork} className="object-cover" />
              <AvatarFallback className="rounded-sm bg-muted">
                <ListMusic className="size-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-normal text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">Playlist</p>
            </div>
          </Link>
        )
      default:
        return (
          <>
            <div className="size-8 rounded-sm bg-muted flex items-center justify-center">
              <Music className="size-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-normal text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">Unknown</p>
            </div>
          </>
        )
    }
  }

  return (
    <CommandItem
      onSelect={() => handleSearchResultSelect(item)}
      className="flex cursor-pointer items-center gap-3 p-3 hover:bg-accent"
    >
      {renderContent()}
    </CommandItem>
  )
}

function Portal({ children }: { children: React.ReactNode }): JSX.Element {
  const mount =
    (typeof document !== 'undefined' && document.getElementById('app-portals')) || document.body
  return createPortal(children, mount)
}

export function GlobalSearch(): JSX.Element {
  const { query, results, isLoading, isSearchOpen, activeFilters, actions } = useSearchStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null) // <-- 1. ADD NEW REF

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      // 2. UPDATE THE CLICK OUTSIDE LOGIC
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        actions.setSearchOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        actions.setSearchOpen(false)
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [actions, isSearchOpen])

  const handleFilterChange = (newValues: string[]): void => {
    const allFilterKeys: (keyof SearchFilters)[] = ['songs', 'artists', 'albums', 'playlists']

    for (const key of allFilterKeys) {
      const isCurrentlyActive = activeFilters[key]
      const shouldBeActive = newValues.includes(key)

      if (isCurrentlyActive !== shouldBeActive) {
        actions.toggleFilter(key)
        break
      }
    }
  }

  const activeFilterValues = Object.entries(activeFilters)
    .filter(([, value]) => value)
    .map(([key]) => key)

  const handleInputFocus = () => {
    actions.setSearchOpen(true)
  }

  const handleClearQuery = () => {
    actions.setQuery('')
    actions.setSearchOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ WebkitAppRegion: 'no-drag' }}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
        <Input
          value={query}
          onChange={(e) => actions.setQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Search songs, artists, albums..."
          className="w-full pl-10 pr-10 h-10 rounded-lg bg-muted/40 border-transparent transition-colors focus:bg-background focus:border-primary"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearQuery}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 rounded-full hover:bg-muted z-10"
          >
            <X className="size-4 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </div>

      {isSearchOpen && (
        <Portal>
          <div
            ref={popoverRef} // <-- 3. ATTACH THE REF
            className="fixed left-1/2 z-50 w-[min(720px,90vw)] -translate-x-1/2"
            style={{
              top: '72px',
              WebkitAppRegion: 'no-drag',
              pointerEvents: 'auto'
            }}
          >
            {/* Inner wrapper to ensure the whole interactive area is not draggable */}
            <div
              className="rounded-lg dark:border-2 dark:border-accent bg-popover/99 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
              style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' }}
            >
              <div
                className="border-b p-3"
                style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' }}
              >
                <ToggleGroup
                  type="multiple"
                  value={activeFilterValues}
                  onValueChange={handleFilterChange}
                  className="flex w-full"
                >
                  {/* ToggleGroupItem children are interactive */}
                  <ToggleGroupItem
                    value="songs"
                    aria-label="Toggle songs"
                    size="sm"
                    className="h-8 px-3 data-[state=on]:text-primary data-[state=off]:text-muted-foreground"
                    style={{ WebkitAppRegion: 'no-drag' }}
                  >
                    <Music className="mr-1.5 size-3" />
                    Songs
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="artists"
                    aria-label="Toggle artists"
                    size="sm"
                    className="h-8 px-3 data-[state=on]:text-primary data-[state=off]:text-muted-foreground"
                    style={{ WebkitAppRegion: 'no-drag' }}
                  >
                    <Mic2 className="mr-1.5 size-3" />
                    Artists
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="albums"
                    aria-label="Toggle albums"
                    size="sm"
                    className="h-8 px-3 data-[state=on]:text-primary data-[state=off]:text-muted-foreground"
                    style={{ WebkitAppRegion: 'no-drag' }}
                  >
                    <AlbumIcon className="mr-1.5 size-3" />
                    Albums
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="playlists"
                    aria-label="Toggle playlists"
                    size="sm"
                    className="h-8 px-3 data-[state=on]:text-primary data-[state=off]:text-muted-foreground"
                    style={{ WebkitAppRegion: 'no-drag' }}
                  >
                    <ListMusic className="mr-1.5 size-3" />
                    Playlists
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Command className="bg-transparent" style={{ WebkitAppRegion: 'no-drag' }}>
                <CommandList
                  className="max-h-[min(60vh,400px)] overflow-y-auto"
                  style={{ WebkitAppRegion: 'no-drag' }}
                >
                  {isLoading && (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="size-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                    </div>
                  )}

                  {!isLoading && query && results.length === 0 && (
                    <CommandEmpty className="py-8" style={{ WebkitAppRegion: 'no-drag' }}>
                      <div className="text-center">
                        <Search className="mx-auto size-12 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No results found for "{query}"
                        </p>
                      </div>
                    </CommandEmpty>
                  )}

                  {!isLoading && results.length > 0 && (
                    <CommandGroup className="p-2" style={{ WebkitAppRegion: 'no-drag' }}>
                      {results.map((item) => (
                        <SearchResult key={`${item.searchType}-${item.id}`} item={item} />
                      ))}
                    </CommandGroup>
                  )}

                  {!query && !isLoading && (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-center">
                        <Search className="mx-auto size-12 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">Start typing to search...</p>
                      </div>
                    </div>
                  )}
                </CommandList>
              </Command>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}