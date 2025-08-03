// src/renderer/src/routes/playlist/$playlistId.tsx
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
import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Clock, Heart, Play, Plus, ListMusic, Dot } from 'lucide-react'

// --- MOCK DATA ---
// In a real app, you'd fetch this based on the playlistId
const playlistData = {
  'chill-mix': {
    id: 'chill-mix',
    name: 'Chill Mix',
    description: 'A curated selection of relaxing and lo-fi beats to help you focus or unwind.',
    trackCount: 5,
    duration: '18 min',
    artwork: 'https://via.placeholder.com/150/1d4ed8/ffffff?text=C',
    songs: [
      {
        id: '1',
        name: 'Morning Dew',
        artist: 'Lo-fi Beats',
        album: 'Coffee Shop Vibes',
        duration: '3:45',
        artwork: 'https://via.placeholder.com/40/3b82f6/ffffff?text=LV'
      },
      {
        id: '2',
        name: 'Sunset Cruise',
        artist: 'Chillwave Rider',
        album: 'Coastal Drives',
        duration: '4:10',
        artwork: 'https://via.placeholder.com/40/f59e0b/ffffff?text=CR'
      },
      {
        id: '3',
        name: 'Rainy Night in Tokyo',
        artist: 'Tokyo Lo-fi',
        album: 'Urban Dreams',
        duration: '3:20',
        artwork: 'https://via.placeholder.com/40/10b981/ffffff?text=TL'
      },
      {
        id: '4',
        name: 'Cozy Fireplace',
        artist: 'Ambient Soundscapes',
        album: 'Winter Warmth',
        duration: '4:30',
        artwork: 'https://via.placeholder.com/40/06b6d4/ffffff?text=AS'
      },
      {
        id: '5',
        name: 'Starlight Glimmer',
        artist: 'Dreamy Keys',
        album: 'Midnight Melodies',
        duration: '2:15',
        artwork: 'https://via.placeholder.com/40/ec4899/ffffff?text=DK'
      }
    ]
  },
  'workout-beats': {
    id: 'workout-beats',
    name: 'Workout Beats',
    description: 'High-energy tracks to keep you motivated during your workout.',
    trackCount: 0,
    duration: '0 min',
    artwork: 'https://via.placeholder.com/150/dc2626/ffffff?text=W',
    songs: []
  },
  'late-night-lo-fi': {
    id: 'late-night-lo-fi',
    name: 'Late Night Lo-fi',
    description: 'Chill beats for late-night coding sessions or just relaxing.',
    trackCount: 0,
    duration: '0 min',
    artwork: 'https://via.placeholder.com/150/6d28d9/ffffff?text=LNL',
    songs: []
  },
  'road-trip-jams': {
    id: 'road-trip-jams',
    name: 'Road Trip Jams',
    description: 'The perfect soundtrack for your next adventure on the open road.',
    trackCount: 0,
    duration: '0 min',
    artwork: 'https://via.placeholder.com/150/f59e0b/ffffff?text=RTJ',
    songs: []
  }
}

// In a real app, you'd have a type for this
type PlaylistId = keyof typeof playlistData

export const Route = createFileRoute('/playlist/$playlistId')({
  component: PlaylistView
})

function PlaylistView(): JSX.Element {
  const { playlistId } = Route.useParams()
  const playlist = playlistData[playlistId as PlaylistId]

  // Fallback for when a playlist doesn't exist
  if (!playlist) {
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

  return (
    <div className="h-full w-full">
      {/* Playlist Header */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <Avatar className="size-48 rounded-lg shadow-lg album-art">
          <AvatarImage src={playlist.artwork} className="object-cover" />
          <AvatarFallback className="rounded-lg text-5xl font-bold bg-muted">
            {playlist.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-between h-full pt-4">
          <div>
            <p className="text-sm font-medium text-primary">PLAYLIST</p>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-foreground my-2">
              {playlist.name}
            </h1>
            <p className="text-muted-foreground text-base max-w-prose mb-3">
              {playlist.description}
            </p>
            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
              <span>{playlist.trackCount} songs</span>
              <Dot />
              <span>{playlist.duration}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <Button size="lg" className="h-12 px-8 rounded-full play-button">
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
      <ScrollArea className="h-[calc(100vh-24rem)] custom-scrollbar">
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
            {playlist.songs.map((song, index) => (
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
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{song.artist}</p>
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
                    className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
                  >
                    <Heart className="size-4 text-muted-foreground hover:text-red-500 transition-colors" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
