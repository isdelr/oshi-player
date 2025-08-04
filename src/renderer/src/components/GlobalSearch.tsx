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

function SearchResult({ item }: { item: SearchResultItem }): JSX.Element {
  const renderContent = (): JSX.Element => {
    switch (item.searchType) {
      case 'song':
        return (
          <>
            <Avatar rounded="sm" className="size-8">
              <AvatarImage src={item.artwork} />
              <AvatarFallback>
                <Music className="size-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-normal">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.artist}</p>
            </div>
          </>
        )
      // Cases for album, artist, and playlist would be here
      default:
        // Default case to handle other types or provide a fallback
        const linkTo =
          item.searchType === 'album'
            ? `/album/${item.id}`
            : item.searchType === 'artist'
              ? `/artist/${item.id}`
              : `/playlist/${item.id}`
        return (
          <Link to={linkTo} className="flex w-full items-center gap-3">
            <Avatar
              rounded={item.searchType === 'artist' ? 'full' : 'sm'}
              className="size-8 bg-muted"
            >
              <AvatarImage src={item.artwork} />
              <AvatarFallback>
                {item.searchType === 'album' && <AlbumIcon className="size-4" />}
                {item.searchType === 'artist' && <Mic2 className="size-4" />}
                {item.searchType === 'playlist' && <ListMusic className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-normal">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.searchType === 'artist' ? 'Artist' : item.artist || 'Playlist'}
              </p>
            </div>
          </Link>
        )
    }
  }

  return (
    <CommandItem
      onSelect={() => handleSearchResultSelect(item)}
      className="flex cursor-pointer items-center gap-3"
    >
      {renderContent()}
    </CommandItem>
  )
}

export function GlobalSearch(): JSX.Element {
  const { query, results, isLoading, isSearchOpen, activeFilters, actions } = useSearchStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        actions.setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [actions])

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

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => actions.setQuery(e.target.value)}
        onFocus={() => query && actions.setSearchOpen(true)}
        placeholder="Search songs, artists, albums..."
        className="w-full pl-10 h-10 rounded-lg bg-muted/40 border-transparent transition-colors focus:bg-background focus:border-primary"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => actions.setQuery('')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 rounded-full"
        >
          <X className="size-4 text-muted-foreground hover:text-foreground" />
        </Button>
      )}

      {isSearchOpen && (
        <div className="absolute top-full mt-2 w-full z-50 rounded-lg border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="border-b p-2">
            <ToggleGroup
              type="multiple"
              value={activeFilterValues}
              onValueChange={handleFilterChange}
            >
              <ToggleGroupItem value="songs" aria-label="Toggle songs">
                <Music className="mr-1.5 size-4" />
                Songs
              </ToggleGroupItem>
              <ToggleGroupItem value="artists" aria-label="Toggle artists">
                <Mic2 className="mr-1.5 size-4" />
                Artists
              </ToggleGroupItem>
              <ToggleGroupItem value="albums" aria-label="Toggle albums">
                <AlbumIcon className="mr-1.5 size-4" />
                Albums
              </ToggleGroupItem>
              <ToggleGroupItem value="playlists" aria-label="Toggle playlists">
                <ListMusic className="mr-1.5 size-4" />
                Playlists
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Command>
            <CommandList className="max-h-[min(60vh,400px)]">
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && results.length === 0 && query && (
                <CommandEmpty>No results found for "{query}".</CommandEmpty>
              )}

              {!isLoading && results.length > 0 && (
                <CommandGroup>
                  {results.map((item) => (
                    <SearchResult key={`${item.searchType}-${item.id}`} item={item} />
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
