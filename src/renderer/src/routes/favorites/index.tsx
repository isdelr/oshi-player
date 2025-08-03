// src/renderer/src/routes/favorites/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { JSX } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Album, Clock, Heart, ListMusic, Mic2, Music, Play, Plus } from 'lucide-react'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Button } from '@renderer/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'

// Placeholder Data
const favoriteSongs = [
  {
    id: '1',
    name: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: '5:55',
    artwork: 'https://via.placeholder.com/40/3b82f6/ffffff?text=Q'
  },
  {
    id: '2',
    name: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    duration: '8:02',
    artwork: 'https://via.placeholder.com/40/f59e0b/ffffff?text=LZ'
  },
  {
    id: '3',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    artwork: 'https://via.placeholder.com/40/10b981/ffffff?text=BL'
  }
]

const favoriteAlbums = [
  {
    id: '1',
    name: 'After Hours',
    artist: 'The Weeknd',
    songs: 14,
    year: 2020,
    artwork: 'https://via.placeholder.com/40/06b6d4/ffffff?text=AH'
  },
  {
    id: '2',
    name: 'Rumours',
    artist: 'Fleetwood Mac',
    songs: 11,
    year: 1977,
    artwork: 'https://via.placeholder.com/40/ec4899/ffffff?text=FM'
  }
]

const favoriteArtists = [
  {
    id: '1',
    name: 'The Weeknd',
    songs: 88,
    artwork: 'https://via.placeholder.com/40/8b5cf6/ffffff?text=TW'
  },
  {
    id: '2',
    name: 'Queen',
    songs: 150,
    artwork: 'https://via.placeholder.com/40/3b82f6/ffffff?text=Q'
  }
]

const favoritePlaylists = [
  {
    id: '1',
    name: 'Chill Mix',
    tracks: 50,
    artwork: 'https://via.placeholder.com/40/1d4ed8/ffffff?text=C'
  },
  {
    id: '2',
    name: 'Workout Beats',
    tracks: 100,
    artwork: 'https://via.placeholder.com/40/dc2626/ffffff?text=W'
  }
]

export const Route = createFileRoute('/favorites/')({
  component: Favorites
})

function Favorites(): JSX.Element {
  return (
    <div className="h-full w-full">
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">Favorites</h1>
        <p className="text-muted-foreground text-lg">
          All your favorite songs, albums, artists, and playlists in one place.
        </p>
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="songs">
            <Music className="size-4 mr-2" />
            Songs
          </TabsTrigger>
          <TabsTrigger value="albums">
            <Album className="size-4 mr-2" />
            Albums
          </TabsTrigger>
          <TabsTrigger value="artists">
            <Mic2 className="size-4 mr-2" />
            Artists
          </TabsTrigger>
          <TabsTrigger value="playlists">
            <ListMusic className="size-4 mr-2" />
            Playlists
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-16rem)] custom-scrollbar">
          <TabsContent value="songs">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="w-[40px] text-xs font-normal text-muted-foreground/60 pb-2 pl-2">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    TITLE
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    ALBUM
                  </TableHead>
                  <TableHead className="w-[60px] text-xs font-normal text-muted-foreground/60 pb-2 text-right">
                    <Clock className="size-4 ml-auto" />
                  </TableHead>
                  <TableHead className="w-[50px] pb-2"></TableHead>
                  <TableHead className="w-[50px] pb-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {favoriteSongs.map((song, index) => (
                  <TableRow
                    key={song.id}
                    className="group border-0 hover:bg-muted/30 transition-colors cursor-pointer h-14"
                  >
                    <TableCell className="text-muted-foreground text-sm pl-2">
                      <div className="flex items-center justify-center w-6">
                        <span className="group-hover:hidden text-muted-foreground/80 font-normal">
                          {index + 1}
                        </span>
                        <Button
                          size="sm"
                          className="size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity control-button rounded-full"
                        >
                          <Play className="size-3 fill-current" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-sm">
                          <AvatarImage src={song.artwork} className="object-cover" />
                          <AvatarFallback className="rounded-sm text-xs font-medium bg-muted">
                            {song.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-normal text-foreground leading-tight truncate">
                            {song.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {song.artist}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                      {song.album}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground py-2 font-normal tabular-nums">
                      {song.duration}
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
                      >
                        <Plus className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </Button>
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 transition-opacity hover:bg-transparent text-red-500 hover:text-red-400"
                      >
                        <Heart className="size-4 fill-current" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="albums">
            {/* Albums Table */}
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
                    SONGS
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
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-sm">
                          <AvatarImage src={album.artwork} className="object-cover" />
                          <AvatarFallback className="rounded-sm text-xs font-medium bg-muted">
                            {album.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-normal text-foreground leading-tight truncate">
                          {album.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                      {album.artist}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                      {album.songs}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                      {album.year}
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 transition-opacity hover:bg-transparent text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
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
            {/* Artists Table */}
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="w-[40px] text-xs font-normal text-muted-foreground/60 pb-2 pl-2">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    ARTIST
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    SONGS
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
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-full">
                          <AvatarImage src={artist.artwork} className="object-cover" />
                          <AvatarFallback className="rounded-full text-xs font-medium bg-muted">
                            {artist.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-normal text-foreground leading-tight truncate">
                          {artist.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                      {artist.songs} songs
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 transition-opacity hover:bg-transparent text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
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
            {/* Playlists Table */}
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="w-[40px] text-xs font-normal text-muted-foreground/60 pb-2 pl-2">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    PLAYLIST
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    TRACKS
                  </TableHead>
                  <TableHead className="w-[50px] pb-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {favoritePlaylists.map((playlist, index) => (
                  <TableRow
                    key={playlist.id}
                    className="group border-0 hover:bg-muted/30 transition-colors cursor-pointer h-14"
                  >
                    <TableCell className="text-muted-foreground text-sm pl-2">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-sm bg-muted">
                          <ListMusic className="size-5 text-muted-foreground" />
                        </Avatar>
                        <p className="font-normal text-foreground leading-tight truncate">
                          {playlist.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                      {playlist.tracks} tracks
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 transition-opacity hover:bg-transparent text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        <Heart className="size-4 fill-current" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
