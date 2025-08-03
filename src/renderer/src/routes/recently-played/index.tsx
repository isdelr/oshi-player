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
import {
  Clock,
  Music,
  Mic2,
  Album,
  Play,
  Heart,
  Plus,
  Trash
} from 'lucide-react'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Button } from '@renderer/components/ui/button'

// Mixed recently played content - songs, albums, and artists
const recentPlays = [
  {
    id: '1',
    type: 'Song',
    name: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: '5:55',
    time: '2 hours ago',
    artwork: 'https://via.placeholder.com/40/3b82f6/ffffff?text=Q'
  },
  {
    id: '2',
    type: 'Artist',
    name: 'The Weeknd',
    artist: 'The Weeknd',
    album: '88 songs • Artist',
    duration: '',
    time: '5 hours ago',
    artwork: 'https://via.placeholder.com/40/8b5cf6/ffffff?text=TW'
  },
  {
    id: '3',
    type: 'Album',
    name: 'After Hours',
    artist: 'The Weeknd',
    album: '14 songs • 2020',
    duration: '56:18',
    time: '1 day ago',
    artwork: 'https://via.placeholder.com/40/06b6d4/ffffff?text=AH'
  },
  {
    id: '4',
    type: 'Song',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    time: '1 day ago',
    artwork: 'https://via.placeholder.com/40/10b981/ffffff?text=BL'
  },
  {
    id: '5',
    type: 'Song',
    name: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    duration: '8:02',
    time: '2 days ago',
    artwork: 'https://via.placeholder.com/40/f59e0b/ffffff?text=LZ'
  },
  {
    id: '6',
    type: 'Album',
    name: 'Rumours',
    artist: 'Fleetwood Mac',
    album: '11 songs • 1977',
    duration: '39:51',
    time: '3 days ago',
    artwork: 'https://via.placeholder.com/40/ec4899/ffffff?text=FM'
  },
  {
    id: '7',
    type: 'Artist',
    name: 'Pink Floyd',
    artist: 'Pink Floyd',
    album: '165 songs • Artist',
    duration: '',
    time: '4 days ago',
    artwork: 'https://via.placeholder.com/40/8b5cf6/ffffff?text=PF'
  },
  {
    id: '8',
    type: 'Song',
    name: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    duration: '6:30',
    time: '5 days ago',
    artwork: 'https://via.placeholder.com/40/06b6d4/ffffff?text=E'
  },
  {
    id: '9',
    type: 'Album',
    name: 'Abbey Road',
    artist: 'The Beatles',
    album: '17 songs • 1969',
    duration: '47:23',
    time: '1 week ago',
    artwork: 'https://via.placeholder.com/40/10b981/ffffff?text=AB'
  },
  {
    id: '10',
    type: 'Artist',
    name: 'Radiohead',
    artist: 'Radiohead',
    album: '101 songs • Artist',
    duration: '',
    time: '1 week ago',
    artwork: 'https://via.placeholder.com/40/3b82f6/ffffff?text=RH'
  }
]

const TypeIcon = ({ type }: { type: string }): JSX.Element | null => {
  switch (type) {
    case 'Song':
      return <Music className="size-3 text-muted-foreground" />
    case 'Artist':
      return <Mic2 className="size-3 text-muted-foreground" />
    case 'Album':
      return <Album className="size-3 text-muted-foreground" />
    default:
      return null
  }
}

export const Route = createFileRoute('/recently-played/')({
  component: RecentlyPlayed
})

function RecentlyPlayed(): JSX.Element {
  return (
    <div className="h-full w-full">
      {/* Recently Played Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">
            Recently Played
          </h1>
          <p className="text-muted-foreground text-lg">
            Your listening history • {recentPlays.length} items
          </p>
          <div className="flex items-center justify-between mt-6">
            <Button size="lg" className="rounded-full h-12 px-8 play-button">
              <Play className="size-5 mr-2 fill-current" />
              Play All
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full h-12 px-6 ">
              <Trash className="size-5 mr-2" />
              Clear History
            </Button>
          </div>
        </div>
      </div>

      {/* Clean Table - Tidal Style */}
      <div className="space-y-0">
        <ScrollArea className="h-[calc(100vh-16rem)] custom-scrollbar">
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
                  TYPE
                </TableHead>
                <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                  DETAILS
                </TableHead>
                <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                  PLAYED
                </TableHead>
                <TableHead className="w-[60px] text-xs font-normal text-muted-foreground/60 pb-2 text-right">
                  <Clock className="size-4 ml-auto" />
                </TableHead>
                <TableHead className="w-[50px] pb-2"></TableHead>
                <TableHead className="w-[50px] pb-2"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPlays.map((item, index) => (
                <TableRow
                  key={item.id}
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
                        <AvatarImage src={item.artwork} className="object-cover" />
                        <AvatarFallback className="rounded-sm text-xs font-medium bg-muted">
                          {item.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-normal text-foreground leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {item.artist}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon type={item.type} />
                      <span className="text-sm text-muted-foreground font-normal capitalize">
                        {item.type}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                    {item.type === 'Song' ? item.album : item.album}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                    {item.time}
                  </TableCell>

                  <TableCell className="text-right text-sm text-muted-foreground py-2 font-normal tabular-nums">
                    {item.type !== 'Artist' ? item.duration : '—'}
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
    </div>
  )
}
