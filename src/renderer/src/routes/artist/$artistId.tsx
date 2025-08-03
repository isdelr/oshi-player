// src/renderer/src/routes/artist/$artistId.tsx
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { JSX } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Play } from 'lucide-react'
import { SongList } from '@renderer/components/SongList'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'

export const Route = createFileRoute('/artist/$artistId')({
  component: ArtistView,
  loader: async ({ params }) => {
    const artist = await window.api.getArtist(params.artistId)
    if (!artist) {
      throw notFound()
    }
    const albums = await window.api.getAlbumsByArtistId(params.artistId)
    const songs = await window.api.getSongsByArtistId(params.artistId)
    return { artist, albums, songs }
  }
})

function ArtistView(): JSX.Element {
  const { artist, albums, songs } = Route.useLoaderData()
  const playerActions = usePlayerStore((s) => s.actions)

  const handlePlayArtistTop = () => {
    // For local app, just playing all songs is fine.
    if (songs.length > 0) {
      playerActions.playSong(songs, 0)
    }
  }

  return (
    <ScrollArea className="h-full w-full -mx-8 -mt-8 px-8 pt-8">
      {/* Artist Header */}
      <div className="flex items-end gap-6 mb-8">
        <Avatar className="size-48 rounded-full border-4 border-background shadow-lg">
          <AvatarImage src={artist.artwork} className="object-cover" />
          <AvatarFallback className="rounded-full bg-muted text-6xl font-bold">
            {artist.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="pb-4">
          <p className="text-sm font-medium text-primary">ARTIST</p>
          <h1 className="my-1 text-6xl font-black tracking-tighter text-foreground">
            {artist.name}
          </h1>
          <p className="text-muted-foreground">
            {albums.length} {albums.length === 1 ? 'Album' : 'Albums'} • {songs.length}{' '}
            {songs.length === 1 ? 'Song' : 'Songs'}
          </p>
        </div>
      </div>

      <div className="mb-12">
        <div className="mb-6 flex items-center gap-4">
          <Button
            size="lg"
            className="play-button h-12 rounded-full px-8"
            onClick={handlePlayArtistTop}
          >
            <Play className="mr-2 size-5 fill-current" />
            Play All
          </Button>
        </div>

        {/* Albums */}
        {albums.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Albums</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  to="/album/$albumId"
                  params={{ albumId: album.id }}
                  className="group"
                >
                  <Card className="cursor-pointer overflow-hidden rounded-lg border-none bg-transparent shadow-none">
                    <CardHeader className="relative p-0">
                      <Avatar className="aspect-square h-auto w-full rounded-lg">
                        <AvatarImage src={album.artwork} className="object-cover" />
                        <AvatarFallback className="rounded-lg bg-muted text-2xl font-bold">
                          {album.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon"
                          className="play-button pulse-glow size-12 rounded-full"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.api
                              .getSongsByAlbumId(album.id)
                              .then((albumSongs) => {
                                if (albumSongs.length > 0) {
                                  playerActions.playSong(albumSongs, 0)
                                }
                              })
                          }}
                        >
                          <Play className="size-6 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-3 p-0">
                      <CardTitle className="truncate text-base font-normal">{album.name}</CardTitle>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{album.year}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Songs */}
        {songs.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">All Songs</h2>
            <SongList songs={songs} showAlbumColumn={true} />
          </div>
        )}
      </div>
    </ScrollArea>
  )
}