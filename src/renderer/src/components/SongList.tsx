import { JSX } from 'react'
import { Heart, Pause, Play, Clock, Music } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Song } from '@renderer/stores/useLibraryStore'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'
import { useFavoritesStore } from '@renderer/stores/useFavoritesStore'

interface SongListProps {
  songs: Song[]
  showAlbumColumn?: boolean // To conditionally show the "Album" column
}

export function SongList({ songs, showAlbumColumn = true }: SongListProps): JSX.Element {
  const { currentSong, isPlaying, actions: playerActions } = usePlayerStore()
  const { favoriteSongIds, actions: favoritesActions } = useFavoritesStore((state) => state)

  const handleFavoriteClick = (e: React.MouseEvent, songId: string): void => {
    e.stopPropagation() // Prevent the row's onClick from firing
    favoritesActions.toggleFavorite(songId)
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
    <Table>
      <TableHeader>
        <TableRow className="border-0 hover:bg-transparent">
          <TableHead className="w-[40px] text-xs font-normal text-muted-foreground/60 pb-2 pl-2">
            #
          </TableHead>
          <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">TITLE</TableHead>
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
      <TableBody>
        {songs.map((song, index) => {
          const isActive = currentSong?.id === song.id
          const isFavorited = favoriteSongIds.has(song.id)

          return (
            <TableRow
              key={song.id}
              className="group border-0 hover:bg-muted/30 transition-colors cursor-pointer h-14"
              data-active={isActive}
              onClick={() => {
                if (isActive) {
                  playerActions.togglePlayPause()
                } else {
                  playerActions.playSong(songs, index)
                }
              }}
            >
              {/* Play/Pause/Index Cell */}
              <TableCell className="text-muted-foreground text-sm pl-2">
                <div className="flex items-center justify-center w-6 h-6">
                  {isActive ? (
                    isPlaying ? (
                      <Pause className="size-4 text-primary" />
                    ) : (
                      <Play className="size-4 text-primary fill-primary" />
                    )
                  ) : (
                    <>
                      <span className="group-hover:hidden text-muted-foreground/80 font-normal">
                        {index + 1}
                      </span>
                      <div className="size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full items-center justify-center hidden group-hover:flex">
                        <Play className="size-3 fill-current text-foreground" />
                      </div>
                    </>
                  )}
                </div>
              </TableCell>

              {/* Title Cell */}
              <TableCell className="py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-sm">
                    <AvatarImage src={song.artwork} />
                    <AvatarFallback className="rounded-sm bg-muted text-xs">
                      {song.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
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

              {/* Album Cell */}
              {showAlbumColumn && (
                <TableCell className="text-sm text-muted-foreground py-2 font-normal hidden md:table-cell">
                  {song.album}
                </TableCell>
              )}

              {/* Duration Cell */}
              <TableCell className="text-right text-sm text-muted-foreground py-2 font-normal tabular-nums">
                {song.duration}
              </TableCell>

              {/* Favorite Cell */}
              <TableCell className="py-2 text-center">
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
  )
}
