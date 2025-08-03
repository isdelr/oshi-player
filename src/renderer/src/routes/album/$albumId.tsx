// src/renderer/src/routes/album/$albumId.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
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
import { Clock, Heart, Play, Plus, Dot, Mic2, Calendar } from 'lucide-react'

// --- MOCK DATA ---
// In a real app, you'd fetch this based on the albumId
const albumData = {
  'never-take-friendship-personal': {
    id: 'never-take-friendship-personal',
    name: 'Never Take Friendship Personal',
    artist: 'Anberlin',
    year: 2005,
    trackCount: 11,
    duration: '38 min',
    artwork: 'https://via.placeholder.com/150/3b82f6/ffffff?text=NTFP',
    songs: [
      {
        id: '1',
        name: 'The Feel Good Drag',
        artist: 'Anberlin',
        duration: '3:25'
      },
      {
        id: '2',
        name: 'Paperthin Hymn',
        artist: 'Anberlin',
        duration: '3:15'
      },
      {
        id: '3',
        name: 'Stationary Stationery',
        artist: 'Anberlin',
        duration: '3:00'
      },
      {
        id: '4',
        name: '(The Symphony of) Blasé',
        artist: 'Anberlin',
        duration: '4:21'
      },
      {
        id: '5',
        name: 'A Day Late',
        artist: 'Anberlin',
        duration: '3:33'
      },
      {
        id: '6',
        name: 'The Runaways',
        artist: 'Anberlin',
        duration: '3:20'
      },
      {
        id: '7',
        name: 'Time & Confusion',
        artist: 'Anberlin',
        duration: '3:23'
      },
      {
        id: '8',
        name: 'The Meds, The Cures',
        artist: 'Anberlin',
        duration: '3:31'
      },
      {
        id: '9',
        name: 'Dance, Dance Christa Päffgen',
        artist: 'Anberlin',
        duration: '7:05'
      }
    ]
  }
  // ... other albums would go here
}

// In a real app, you'd have a type for this
type AlbumId = keyof typeof albumData

export const Route = createFileRoute('/album/$albumId')({
  component: AlbumView
})

function AlbumView(): JSX.Element {
  const { albumId } = Route.useParams()
  // A real implementation would fetch or have a fallback
  const album = albumData[albumId as AlbumId] || Object.values(albumData)[0]

  return (
    <div className="h-full w-full">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <Avatar className="size-48 rounded-lg shadow-lg album-art">
          <AvatarImage src={album.artwork} className="object-cover" />
          <AvatarFallback className="rounded-lg text-5xl font-bold bg-muted">
            {album.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-between h-full pt-4">
          <div>
            <p className="text-sm font-medium text-primary">ALBUM</p>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-foreground my-2">
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
                {album.trackCount} songs, {album.duration}
              </span>
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
              <TableHead className="w-[60px] text-xs font-normal text-muted-foreground/60 pb-2 text-right">
                <Clock className="size-4 ml-auto" />
              </TableHead>
              <TableHead className="w-[50px] pb-2"></TableHead>
              <TableHead className="w-[50px] pb-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {album.songs.map((song, index) => (
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
                  <div className="min-w-0 flex-1">
                    <p className="font-normal text-foreground leading-tight truncate">
                      {song.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{song.artist}</p>
                  </div>
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
