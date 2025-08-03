import { createFileRoute, Link } from '@tanstack/react-router'
import { JSX, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Album, Clock, FolderSearch, Mic2, Music, Play, Plus, Heart } from 'lucide-react'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Button, buttonVariants } from '@renderer/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { useLibraryStore } from '@renderer/stores/useLibraryStore'
import { Skeleton } from '@renderer/components/ui/skeleton'

export const Route = createFileRoute('/')({
  component: LocalFilesHome
})

function LocalFilesHome(): JSX.Element {
  // Connect to the library store
  const { songs, albums, artists, isScanning, actions } = useLibraryStore()

  // Load the library on component mount
  useEffect(() => {
    actions.loadLibrary()
  }, [actions])

  if (isScanning) {
    return (
      <div className="h-full w-full">
        <div className="mb-8">
          <Skeleton className="h-12 w-1/2 mb-2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!songs.length) {
    return (
      <div className="flex h-full w-full items-center justify-center text-center">
        <div className="flex flex-col items-center gap-6">
          <FolderSearch className="size-24 text-muted-foreground/30" strokeWidth={1} />
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold">No Music Found</h2>
            <p className="text-muted-foreground">
              Go to Settings to add your music folders and start scanning.
            </p>
          </div>
          <Link
            to="/settings"
            className={buttonVariants({
              size: 'lg',
              className: 'h-12 px-8 rounded-full play-button'
            })}
          >
            Go to Settings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <div className="mb-8">
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">Local Files</h1>
        <p className="text-muted-foreground text-lg">Your personal music collection.</p>
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="songs">
            <Music className="size-4 mr-2" />
            Songs ({songs.length})
          </TabsTrigger>
          <TabsTrigger value="albums">
            <Album className="size-4 mr-2" />
            Albums ({albums.length})
          </TabsTrigger>
          <TabsTrigger value="artists">
            <Mic2 className="size-4 mr-2" />
            Artists ({artists.length})
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-16rem)] custom-scrollbar">
          {/* Songs View */}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song, index) => (
                  <TableRow
                    key={song.id}
                    className="group border-0 hover:bg-muted/30 transition-colors cursor-pointer h-14"
                  >
                    <TableCell className="text-muted-foreground text-sm pl-2">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-sm">
                          <AvatarImage src={song.artwork} />
                          <AvatarFallback className="rounded-sm bg-muted text-xs">
                            {song.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          {/* Albums View */}
          <TabsContent value="albums">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {albums.map((album) => (
                <Link key={album.id} to="/album/$albumId" params={{ albumId: album.id }}>
                  <Card className="bg-transparent border-none shadow-none rounded-lg overflow-hidden group cursor-pointer">
                    <CardHeader className="p-0 relative">
                      <Avatar className="w-full h-auto aspect-square rounded-lg">
                        <AvatarImage src={album.artwork} />
                        <AvatarFallback className="rounded-lg bg-muted text-2xl font-bold">
                          {album.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button className="size-12 rounded-full play-button pulse-glow">
                          <Play className="size-6 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 mt-3">
                      <CardTitle className="text-base font-normal truncate">{album.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{album.artist}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
          {/* Artists View */}
          <TabsContent value="artists">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {artists.map((artist) => (
                <Link key={artist.id} to="/artist/$artistId" params={{ artistId: artist.id }}>
                  <Card className="bg-transparent border-none shadow-none rounded-lg overflow-hidden group cursor-pointer">
                    <CardHeader className="p-0 relative">
                      <Avatar className="w-full h-auto aspect-square rounded-full">
                        <AvatarImage src={artist.artwork} className="object-cover" />
                        <AvatarFallback className="rounded-full text-2xl font-bold bg-muted">
                          {artist.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button className="size-12 rounded-full play-button pulse-glow">
                          <Play className="size-6 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 mt-3 text-center">
                      <CardTitle className="text-base font-normal truncate">
                        {artist.name}
                      </CardTitle>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
