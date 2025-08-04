// src/renderer/src/routes/favorites/index.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
import { JSX, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar'
import { Album, Heart, ListMusic, Mic2, Music, Play, User } from 'lucide-react'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Button } from '@renderer/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { SongList } from '@renderer/components/SongList'
import { useLibraryStore } from '@renderer/stores/useLibraryStore'
import { useFavoritesStore } from '@renderer/stores/useFavoritesStore'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'
import { toast } from 'sonner'

export const Route = createFileRoute('/favorites/')({
  component: Favorites
})

function Favorites(): JSX.Element {
  const { songs: allSongs, albums: allAlbums, artists: allArtists } = useLibraryStore()
  const { favoriteSongIds, favoriteAlbumIds, favoriteArtistIds, actions: favoritesActions } =
    useFavoritesStore()
  const playerActions = usePlayerStore((s) => s.actions)

  const favoriteSongs = useMemo(
    () => allSongs.filter((song) => favoriteSongIds.has(song.id)),
    [allSongs, favoriteSongIds]
  )

  const favoriteAlbums = useMemo(
    () => allAlbums.filter((album) => favoriteAlbumIds.has(album.id)),
    [allAlbums, favoriteAlbumIds]
  )

  const favoriteArtists = useMemo(
    () => allArtists.filter((artist) => favoriteArtistIds.has(artist.id)),
    [allArtists, favoriteArtistIds]
  )

  const handleUnfavorite = (e: React.MouseEvent, id: string, type: 'album' | 'artist'): void => {
    e.stopPropagation()
    favoritesActions.toggleFavorite(id, type)
    toast.success(`Removed from favorites.`)
  }

  const handlePlayAlbum = async (e: React.MouseEvent, albumId: string): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()
    const albumSongs = await window.api.getSongsByAlbumId(albumId)
    if (albumSongs.length > 0) {
      playerActions.playSong(albumSongs, 0, 'album')
    }
  }

  return (
    <div className="h-full w-full">
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">Favorites</h1>
        <p className="text-muted-foreground text-lg">
          All your favorite songs, albums, and artists in one place.
        </p>
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="songs">
            <Music className="size-4 mr-2" />
            Songs ({favoriteSongs.length})
          </TabsTrigger>
          <TabsTrigger value="albums">
            <Album className="size-4 mr-2" />
            Albums ({favoriteAlbums.length})
          </TabsTrigger>
          <TabsTrigger value="artists">
            <Mic2 className="size-4 mr-2" />
            Artists ({favoriteArtists.length})
          </TabsTrigger>
          <TabsTrigger value="playlists" disabled>
            <ListMusic className="size-4 mr-2" />
            Playlists
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-16rem)] custom-scrollbar">
          <TabsContent value="songs">
            <SongList songs={favoriteSongs} source="other" />
          </TabsContent>

          <TabsContent value="albums">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="w-[40px] text-xs font-normal text-muted-foreground/60 pb-2 pl-2">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    ALBUM
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    ARTIST
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    YEAR
                  </TableHead>
                  <TableHead className="w-[50px] pb-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {favoriteAlbums.map((album, index) => (
                  <TableRow
                    key={album.id}
                    className="group border-0 hover:bg-muted/30 transition-colors cursor-pointer h-14"
                  >
                    <TableCell className="text-muted-foreground text-sm pl-2">
                      <div className="w-6 h-full flex items-center justify-center">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                          onClick={(e) => handlePlayAlbum(e, album.id)}
                        >
                          <Play className="size-3 fill-current text-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Link
                        to="/album/$albumId"
                        params={{ albumId: album.id }}
                        className="flex items-center gap-3"
                      >
                        <Avatar className="size-10 rounded-sm">
                          <AvatarImage src={album.artwork} className="object-cover" />
                          <AvatarFallback className="rounded-sm text-xs font-medium bg-muted">
                            {album.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-normal text-foreground leading-tight truncate">
                          {album.name}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                      {album.artist}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                      {album.year}
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 p-0 transition-opacity hover:bg-transparent text-red-500 hover:text-red-400 opacity-100"
                        onClick={(e) => handleUnfavorite(e, album.id, 'album')}
                      >
                        <Heart className="size-4 fill-current" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="artists">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="w-[40px] text-xs font-normal text-muted-foreground/60 pb-2 pl-2">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    ARTIST
                  </TableHead>
                  <TableHead className="w-[50px] pb-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {favoriteArtists.map((artist, index) => (
                  <TableRow
                    key={artist.id}
                    className="group border-0 hover:bg-muted/30 transition-colors cursor-pointer h-14"
                  >
                    <TableCell className="text-muted-foreground text-sm pl-2">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-2">
                      <Link
                        to="/artist/$artistId"
                        params={{ artistId: artist.id }}
                        className="flex items-center gap-3"
                      >
                        <Avatar className="size-10 rounded-full">
                          <AvatarImage src={artist.artwork} className="object-cover" />
                          <AvatarFallback className="rounded-full text-xs font-medium bg-muted">
                            <User className="size-5" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-normal text-foreground leading-tight truncate">
                          {artist.name}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 p-0 transition-opacity hover:bg-transparent text-red-500 hover:text-red-400"
                        onClick={(e) => handleUnfavorite(e, artist.id, 'artist')}
                      >
                        <Heart className="size-4 fill-current" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="playlists">
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
              <ListMusic className="size-16 opacity-30" />
              <p>Favorite playlists will appear here.</p>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}