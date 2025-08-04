// src/renderer/src/routes/playlist/$playlistId.tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { JSX } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Button } from '@renderer/components/ui/button'
import { Heart, Play, Plus, ListMusic, Dot, Music } from 'lucide-react'
import { SongList } from '@renderer/components/SongList'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'
import { cn } from '@renderer/lib/utils'

export const Route = createFileRoute('/playlist/$playlistId')({
  component: PlaylistView,
  loader: async ({ params }) => {
    const playlist = await window.api.getPlaylist(params.playlistId)
    if (!playlist) {
      throw notFound()
    }
    const songs = await window.api.getSongsByPlaylistId(params.playlistId)
    const totalDuration = songs.reduce((acc, song) => acc + song.rawDuration, 0)
    const durationMinutes = Math.floor(totalDuration / 60)
    return { playlist, songs, duration: `${durationMinutes} min` }
  },
  errorComponent: () => <PlaylistNotFound />
})

function PlaylistNotFound() {
  return (
    <div className="flex h-full w-full items-center justify-center text-center">
      <div className="flex flex-col items-center gap-6">
        <ListMusic className="size-24 text-muted-foreground/30" strokeWidth={1} />
        <h2 className="text-3xl font-semibold">Playlist not found</h2>
        <p className="text-muted-foreground">This playlist might have been removed.</p>
      </div>
    </div>
  )
}

function PlaylistView(): JSX.Element {
  const { playlist, songs, duration } = Route.useLoaderData()
  const playerActions = usePlayerStore((s) => s.actions)

  const handlePlayPlaylist = () => {
    if (songs.length > 0) {
      playerActions.playSong(songs, 0, 'playlist')
      window.api.addRecentlyPlayed({ itemId: playlist.id, itemType: 'playlist' })
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Playlist Header */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <Avatar className="size-48 rounded-lg shadow-lg album-art bg-muted">
          <AvatarImage src={playlist.artwork} className="object-cover" />
          <AvatarFallback
            className={cn(
              'rounded-lg text-5xl font-bold bg-transparent',
              !playlist.artwork && 'p-8'
            )}
          >
            {!playlist.artwork ? (
              <Music className="size-16 text-muted-foreground/60" />
            ) : (
              playlist.name.charAt(0)
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-between h-full pt-4">
          <div>
            <p className="text-sm font-medium text-primary">PLAYLIST</p>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-foreground my-2">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-muted-foreground text-base max-w-prose mb-3">
                {playlist.description}
              </p>
            )}
            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
              <span>
                {songs.length} {songs.length === 1 ? 'song' : 'songs'}
              </span>
              {songs.length > 0 && (
                <>
                  <Dot />
                  <span>{duration}</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <Button
              size="lg"
              className="h-12 px-8 rounded-full play-button"
              onClick={handlePlayPlaylist}
              disabled={songs.length === 0}
            >
              <Play className="size-5 mr-2 fill-current" />
              Play
            </Button>
            <Button variant="ghost" size="icon" className="size-12 rounded-full control-button">
              <Heart className="size-6 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="size-12 rounded-full control-button">
              <Plus className="size-6 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Songs Table */}
      <div className="flex-1 min-h-0">
        <SongList songs={songs} showAlbumColumn={true} source="playlist" />
      </div>
    </div>
  )
}