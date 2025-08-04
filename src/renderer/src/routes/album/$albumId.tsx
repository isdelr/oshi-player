// src/renderer/src/routes/album/$albumId.tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { JSX } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Button } from '@renderer/components/ui/button'
import { Heart, Play, Plus, Dot, Mic2, Calendar } from 'lucide-react'
import { SongList } from '@renderer/components/SongList'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'
import { useFavoritesStore } from '@renderer/stores/useFavoritesStore'
import { cn } from '@renderer/lib/utils'

export const Route = createFileRoute('/album/$albumId')({
  component: AlbumView,
  loader: async ({ params }) => {
    const album = await window.api.getAlbum(params.albumId)
    if (!album) {
      throw notFound()
    }
    const songs = await window.api.getSongsByAlbumId(params.albumId)
    const totalDuration = songs.reduce((acc, song) => acc + song.rawDuration, 0)
    const durationMinutes = Math.floor(totalDuration / 60)
    return { album, songs, duration: `${durationMinutes} min` }
  }
})

function AlbumView(): JSX.Element {
  const { album, songs, duration } = Route.useLoaderData()
  const playerActions = usePlayerStore((s) => s.actions)
  const { actions: favoritesActions, favoriteAlbumIds } = useFavoritesStore()
  const isAlbumFavorited = favoriteAlbumIds.has(album.id)

  const handlePlayAlbum = () => {
    if (songs.length > 0) {
      playerActions.playSong(songs, 0, 'album')
      window.api.addRecentlyPlayed({ itemId: album.id, itemType: 'album' })
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8 shrink-0">
        <Avatar className="size-48 rounded-lg shadow-lg album-art">
          <AvatarImage src={album.artwork} className="object-cover" />
          <AvatarFallback className="rounded-lg text-5xl font-bold bg-muted">
            {album.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-between h-full pt-4">
          <div>
            <p className="text-sm font-medium text-primary">ALBUM</p>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground my-2">
              {album.name}
            </h1>

            <div className="flex items-center text-base text-muted-foreground gap-1.5 mt-4">
              <div className="flex items-center gap-2">
                <Mic2 className="size-4" />
                <span>{album.artist}</span>
              </div>
              <Dot />
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>{album.year}</span>
              </div>
              <Dot />
              <span>
                {songs.length} songs, {duration}
              </span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <Button
              size="lg"
              className="h-12 px-8 rounded-full play-button"
              onClick={handlePlayAlbum}
            >
              <Play className="size-5 mr-2 fill-current" />
              Play
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-12 rounded-full control-button"
              onClick={() => favoritesActions.toggleFavorite(album.id, 'album')}
            >
              <Heart
                className={cn(
                  'size-6 text-muted-foreground',
                  isAlbumFavorited && 'fill-red-500 text-red-500'
                )}
              />
            </Button>
            <Button variant="ghost" size="icon" className="size-12 rounded-full control-button">
              <Plus className="size-6 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Songs Table Container */}
      <div className="flex-1 min-h-0">
        <SongList songs={songs} showAlbumColumn={false} source="album" />
      </div>
    </div>
  )
}