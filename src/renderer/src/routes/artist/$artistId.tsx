import { createFileRoute, Link } from '@tanstack/react-router'
import { JSX } from 'react'
import { Table, TableBody, TableCell, TableRow } from '../../components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { ArrowRight, Heart, Play } from 'lucide-react'

// --- MOCK DATA ---
const artistData = {
  anberlin: {
    id: 'anberlin',
    name: 'Anberlin',
    artwork: 'https://via.placeholder.com/150/8b5cf6/ffffff?text=AN',
    banner: 'https://via.placeholder.com/1200x300/8b5cf6/ffffff?text=Anberlin', // A banner image
    topSongs: [
      {
        id: '1',
        name: 'The Feel Good Drag',
        duration: '3:25',
        artwork: 'https://via.placeholder.com/40/3b82f6/ffffff?text=A'
      },
      {
        id: '2',
        name: 'Paperthin Hymn',
        duration: '3:15',
        artwork: 'https://via.placeholder.com/40/3b82f6/ffffff?text=A'
      },
      {
        id: '3',
        name: 'Impossible',
        duration: '4:03',
        artwork: 'https://via.placeholder.com/40/10b981/ffffff?text=I'
      },
      {
        id: '4',
        name: 'A Day Late',
        duration: '3:33',
        artwork: 'https://via.placeholder.com/40/3b82f6/ffffff?text=A'
      },
      {
        id: '5',
        name: 'Unstable',
        duration: '3:36',
        artwork: 'https://via.placeholder.com/40/f59e0b/ffffff?text=U'
      }
    ],
    albums: [
      {
        id: 'never-take-friendship-personal',
        name: 'Never Take Friendship Personal',
        artist: 'Anberlin',
        year: 2005,
        artwork: 'https://via.placeholder.com/150/3b82f6/ffffff?text=NTFP'
      },
      {
        id: 'cities',
        name: 'Cities',
        artist: 'Anberlin',
        year: 2007,
        artwork: 'https://via.placeholder.com/150/06b6d4/ffffff?text=C'
      },
      {
        id: 'new-surrender',
        name: 'New Surrender',
        artist: 'Anberlin',
        year: 2008,
        artwork: 'https://via.placeholder.com/150/ec4899/ffffff?text=NS'
      }
    ]
  },
  'the-weeknd': {
    // Add another artist for completeness
    id: 'the-weeknd',
    name: 'The Weeknd',
    followers: '50,123,456',
    listeners: '100,456,789',
    artwork: 'https://via.placeholder.com/150/8b5cf6/ffffff?text=TW',
    banner: 'https://via.placeholder.com/1200x300/111827/ffffff?text=The+Weeknd',
    topSongs: [
      {
        id: '1',
        name: 'Blinding Lights',
        duration: '3:20',
        plays: '3.5B',
        artwork: 'https://via.placeholder.com/40/10b981/ffffff?text=BL'
      },
      {
        id: '2',
        name: 'Save Your Tears',
        duration: '3:35',
        plays: '2.8B',
        artwork: 'https://via.placeholder.com/40/10b981/ffffff?text=SYT'
      },
      {
        id: '3',
        name: 'Starboy',
        duration: '3:50',
        plays: '2.5B',
        artwork: 'https://via.placeholder.com/40/f59e0b/ffffff?text=S'
      },
      {
        id: '4',
        name: 'The Hills',
        duration: '4:02',
        plays: '2.1B',
        artwork: 'https://via.placeholder.com/40/dc2626/ffffff?text=TH'
      },
      {
        id: '5',
        name: 'Die For You',
        duration: '4:20',
        plays: '1.9B',
        artwork: 'https://via.placeholder.com/40/06b6d4/ffffff?text=DFY'
      }
    ],
    albums: [
      {
        id: 'after-hours',
        name: 'After Hours',
        artist: 'The Weeknd',
        year: 2020,
        artwork: 'https://via.placeholder.com/150/06b6d4/ffffff?text=AH'
      },
      {
        id: 'dawn-fm',
        name: 'Dawn FM',
        artist: 'The Weeknd',
        year: 2022,
        artwork: 'https://via.placeholder.com/150/10b981/ffffff?text=DFM'
      }
    ]
  }
}

type ArtistId = keyof typeof artistData

export const Route = createFileRoute('/artist/$artistId')({
  component: ArtistView
})

function ArtistView(): JSX.Element {
  const { artistId } = Route.useParams()
  const artist = artistData[artistId as ArtistId] || Object.values(artistData)[0]

  return (
    <div className="h-full w-full -mx-8 -mt-8">
      {/* Artist Header */}
      <div
        className="relative mb-8 h-80 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${artist.banner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-8 left-8 flex items-end gap-6">
          <Avatar className="size-48 rounded-full border-4 border-background shadow-lg">
            <AvatarImage src={artist.artwork} className="object-cover" />
            <AvatarFallback className="rounded-full bg-muted text-6xl font-bold">
              {artist.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="pb-4">
            <p className="text-sm font-medium text-primary">ARTIST</p>
            <h1 className="my-1 text-8xl font-black tracking-tighter text-foreground">
              {artist.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-8">
        {/* Actions and Popular Songs */}
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-4">
            <Button size="lg" className="play-button h-12 rounded-full px-8">
              <Play className="mr-2 size-5 fill-current" />
              Play
            </Button>
            <Button variant="outline" size="lg" className="control-button h-12 rounded-full px-8">
              Follow
            </Button>
          </div>

          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Popular</h2>
          <Table>
            <TableBody>
              {artist.topSongs.slice(0, 5).map((song, index) => (
                <TableRow
                  key={song.id}
                  className="group h-14 cursor-pointer border-0 transition-colors hover:bg-muted/30"
                >
                  <TableCell className="w-[40px] pl-2 text-sm text-muted-foreground">
                    <div className="flex w-6 items-center justify-center">
                      <span className="font-normal text-muted-foreground/80 group-hover:hidden">
                        {index + 1}
                      </span>
                      <Button
                        size="sm"
                        className="control-button size-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Play className="size-3 fill-current" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 rounded-sm">
                        <AvatarImage src={song.artwork} className="object-cover" />
                      </Avatar>
                      <p className="truncate font-normal leading-tight text-foreground">
                        {song.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="w-[100px] py-2 text-right font-normal text-sm tabular-nums text-muted-foreground">
                    {song.duration}
                  </TableCell>
                  <TableCell className="w-[50px] py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 opacity-0 transition-opacity hover:bg-transparent group-hover:opacity-100"
                    >
                      <Heart className="size-4 text-muted-foreground transition-colors hover:text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="ghost" className="mt-2">
            Show more
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>

        {/* Albums */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Albums</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {artist.albums.map((album) => (
              <Link key={album.id} to="/album/$albumId" params={{ albumId: album.id }}>
                <Card
                  key={album.id}
                  className="group cursor-pointer overflow-hidden rounded-lg border-none bg-transparent shadow-none"
                >
                  <CardHeader className="relative p-0">
                    <Avatar className="aspect-square h-auto w-full rounded-lg">
                      <AvatarImage src={album.artwork} className="object-cover" />
                      <AvatarFallback className="rounded-lg bg-muted text-2xl font-bold">
                        {album.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button className="play-button pulse-glow size-12 rounded-full">
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
      </div>
    </div>
  )
}
