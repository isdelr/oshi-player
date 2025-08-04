import { createFileRoute } from '@tanstack/react-router'
import { JSX, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Clock, Music, Mic2, Album, Play, Heart, Plus, Trash, Loader2 } from 'lucide-react'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import { Button } from '@renderer/components/ui/button'
import { useRecentlyPlayedStore } from '@renderer/stores/useRecentlyPlayedStore'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@renderer/components/ui/badge'

const TypeIcon = ({ type }: { type: string }): JSX.Element | null => {
  switch (type) {
    case 'song':
      return <Music className="size-3 text-muted-foreground" />
    case 'artist':
      return <Mic2 className="size-3 text-muted-foreground" />
    case 'album':
      return <Album className="size-3 text-muted-foreground" />
    default:
      return null
  }
}

export const Route = createFileRoute('/recently-played/')({
  component: RecentlyPlayed
})

function RecentlyPlayed(): JSX.Element {
  const { items, isLoading, actions } = useRecentlyPlayedStore()

  useEffect(() => {
    actions.fetchHistory()
  }, [actions])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <div className="mb-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">
            Recently Played
          </h1>
          <p className="text-muted-foreground text-lg">
            Your listening history • {items.length} items
          </p>
          {items.length > 0 && (
            <div className="flex items-center justify-end mt-6">
              <Button variant="ghost" size="lg" className="rounded-full h-12 px-6 ">
                <Trash className="size-5 mr-2" />
                Clear History
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-0">
        <ScrollArea className="h-[calc(100vh-16rem)] custom-scrollbar">
          {items.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
              <Clock className="size-16 opacity-30" />
              <p>Your listening history is empty.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    TITLE
                  </TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground/60 pb-2">
                    TYPE
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
                {items.map((item) => (
                  <TableRow
                    key={item.recentId}
                    className="group border-0 hover:bg-muted/30 transition-colors cursor-pointer h-14"
                  >
                    <TableCell className="py-2">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="size-10 rounded-sm"
                          rounded={item.itemType === 'artist' ? 'full' : 'sm'}
                        >
                          <AvatarImage src={item.artwork} className="object-cover" />
                          <AvatarFallback className="rounded-sm text-xs font-medium bg-muted">
                            {item.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-normal text-foreground leading-tight truncate">
                              {item.name}
                            </p>
                            {item.playCount > 1 && (
                              <Badge variant="secondary" className="h-5">
                                x{item.playCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {item.itemType === 'song' ? item.artist : ' '}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon type={item.itemType} />
                        <span className="text-sm text-muted-foreground font-normal capitalize">
                          {item.itemType}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground py-2 font-normal">
                      {formatDistanceToNow(new Date(item.playedAt), { addSuffix: true })}
                    </TableCell>

                    <TableCell className="text-right text-sm text-muted-foreground py-2 font-normal tabular-nums">
                      {item.itemType === 'song' && item.duration ? item.duration : '—'}
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
          )}
        </ScrollArea>
      </div>
    </div>
  )
}