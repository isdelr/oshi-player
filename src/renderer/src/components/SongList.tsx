import React, { JSX, useRef, useEffect } from 'react'
import { Heart, Pause, Play, Clock, Music, Loader2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Song, useLibraryStore } from '@renderer/stores/useLibraryStore'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'
import { useFavoritesStore } from '@renderer/stores/useFavoritesStore'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@renderer/lib/utils'
import { Skeleton } from './ui/skeleton'

interface SongListProps {
  songs: Song[]
  showAlbumColumn?: boolean
  containerClassName?: string
  isInitialLoading?: boolean
}

export function SongList({
  songs,
  showAlbumColumn = true,
  containerClassName,
  isInitialLoading = false
}: SongListProps): JSX.Element {
  const { currentSong, isPlaying, actions: playerActions } = usePlayerStore()
  const { favoriteSongIds, actions: favoritesActions } = useFavoritesStore()
  const { hasMoreSongs, isLoadingMoreSongs, actions: libraryActions } = useLibraryStore()

  const parentRef = useRef<HTMLDivElement>(null)

  const handleFavoriteClick = (e: React.MouseEvent, songId: string): void => {
    e.stopPropagation()
    favoritesActions.toggleFavorite(songId)
  }

  const rowVirtualizer = useVirtualizer({
    count: hasMoreSongs ? songs.length + 1 : songs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // h-14 is 3.5rem which is 56px
    overscan: 10
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem) return

    if (lastItem.index >= songs.length - 1 && hasMoreSongs && !isLoadingMoreSongs) {
      libraryActions.loadMoreSongs()
    }
  }, [virtualItems, songs.length, hasMoreSongs, isLoadingMoreSongs, libraryActions])

  if (isInitialLoading) {
    return (
      <div className={cn('h-full w-full', containerClassName)}>
        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="w-[40px] pl-2">#</TableHead>
              <TableHead>TITLE</TableHead>
              {showAlbumColumn && <TableHead className="hidden md:table-cell">ALBUM</TableHead>}
              <TableHead className="w-[60px]"></TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="space-y-2 p-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex h-14 items-center gap-3">
              <Skeleton className="size-10 rounded-sm" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
        <Music className="size-16 opacity-30" />
        <p>No songs to display.</p>
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      className={cn('h-full w-full overflow-y-auto custom-scrollbar', containerClassName)}
    >
      <Table className="relative">
        <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          <TableRow className="border-0 hover:bg-transparent">
            <TableHead className="w-[40px] text-xs font-normal text-muted-foreground/60 pb-2 pl-2">
              #
            </TableHead>
            <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
              TITLE
            </TableHead>
            {showAlbumColumn && (
              <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2 hidden md:table-cell">
                ALBUM
              </TableHead>
            )}
            <TableHead className="w-[60px] text-xs font-normal text-muted-foreground/60 pb-2 text-right">
              <Clock className="size-4 ml-auto" />
            </TableHead>
            <TableHead className="w-[50px] text-xs font-normal text-muted-foreground/60 pb-2 text-center">
              <Heart className="size-4 mx-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative'
          }}
        >
          {virtualItems.map((virtualItem) => {
            const isLoaderRow = virtualItem.index > songs.length - 1
            const song = songs[virtualItem.index]

            if (isLoaderRow) {
              return (
                <TableRow
                  key="loader"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`
                  }}
                >
                  <TableCell colSpan={showAlbumColumn ? 5 : 4} className="h-full">
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              )
            }

            const isActive = currentSong?.id === song.id
            const isFavorited = favoriteSongIds.has(song.id)

            return (
              <TableRow
                key={song.id}
                className="group border-0 hover:bg-muted/30 transition-colors cursor-pointer flex items-center"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`
                }}
                data-active={isActive}
                onClick={() => {
                  if (isActive) {
                    playerActions.togglePlayPause()
                  } else {
                    playerActions.playSong(songs, virtualItem.index)
                  }
                }}
              >
                <TableCell className="text-muted-foreground text-sm pl-2 w-[40px] shrink-0">
                  <div className="flex items-center justify-center w-6 h-full">
                    {isActive ? (
                      isPlaying ? (
                        <Pause className="size-4 text-primary" />
                      ) : (
                        <Play className="size-4 text-primary fill-primary" />
                      )
                    ) : (
                      <>
                        <span className="group-hover:hidden text-muted-foreground/80 font-normal">
                          {virtualItem.index + 1}
                        </span>
                        <div className="size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full items-center justify-center hidden group-hover:flex">
                          <Play className="size-3 fill-current text-foreground" />
                        </div>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 rounded-sm">
                      <AvatarImage src={song.artwork} />
                      <AvatarFallback className="rounded-sm bg-muted text-xs">
                        {song.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p
                        className={`font-normal leading-tight truncate ${
                          isActive ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {song.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>
                </TableCell>
                {showAlbumColumn && (
                  <TableCell className="text-sm text-muted-foreground py-2 font-normal hidden md:block flex-1 min-w-0 truncate">
                    {song.album}
                  </TableCell>
                )}
                <TableCell className="text-right text-sm text-muted-foreground py-2 font-normal tabular-nums w-[60px] shrink-0">
                  {song.duration}
                </TableCell>
                <TableCell className="py-2 text-center w-[50px] shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`size-8 p-0 hover:bg-transparent transition-opacity ${
                      isFavorited
                        ? 'text-red-500 opacity-100'
                        : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                    }`}
                    onClick={(e) => handleFavoriteClick(e, song.id)}
                  >
                    <Heart
                      className={`size-4 transition-colors ${
                        isFavorited ? 'fill-current' : 'hover:text-red-500'
                      }`}
                    />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}