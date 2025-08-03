// src/renderer/src/components/LeftSidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from './ui/sidebar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Button } from './ui/button'
import { Album, Clock, Heart, Library, ListMusic, Mic2, Music, Plus, User } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import { JSX, useEffect } from 'react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { useLibraryStore } from '@renderer/stores/useLibraryStore'

export function LeftSidebar(): JSX.Element {
  const matchRoute = useMatchRoute()
  const { albums, artists, actions } = useLibraryStore()

  useEffect(() => {
    actions.loadLibrary()
  }, [actions])

  // Placeholder data for playlists
  const playlists = ['Chill Mix', 'Workout Beats', 'Late Night Lo-fi', 'Road Trip Jams']

  const createSlug = (name: string): string => name.toLowerCase().replace(/\s+/g, '-')

  return (
    <Sidebar
      className="glass-strong border-l-0 border-t-0 border-b-0" // Applying glassmorphism effect from your CSS
      collapsible="icon"
    >
      <SidebarHeader className="mb-4">
        <Link to="/" className="flex items-center gap-2 pt-2 px-2 text-foreground no-underline">
          <Music className="size-8 text-primary" />
          <h1 className="text-2xl font-bold transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
            Oshi
          </h1>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <ScrollArea className="h-full">
          <SidebarMenu className="mb-4">
            <SidebarMenuItem>
              <Link to="/" className="w-full">
                <SidebarMenuButton tooltip="Local Files" isActive={!!matchRoute({ to: '/' })}>
                  <Library className="size-5" />
                  <span>Local Files</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link to="/recently-played" className="w-full">
                <SidebarMenuButton
                  tooltip="Recently Played"
                  isActive={!!matchRoute({ to: '/recently-played' })}
                >
                  <Clock className="size-5" />
                  <span>Recently Played</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link to="/favorites" className="w-full">
                <SidebarMenuButton
                  tooltip="Favorites"
                  isActive={!!matchRoute({ to: '/favorites' })}
                >
                  <Heart className="size-5" />
                  <span>Favorites</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>

          <Accordion type="multiple" defaultValue={['artists', 'albums']} className="w-full">
            {/* Artists (from Library) */}
            <AccordionItem value="artists" className="border-none mb-4">
              <AccordionTrigger className="px-2 hover:no-underline group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2 text-sm">
                  <Mic2 className="size-5" />
                  <span>Artists</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <SidebarMenu>
                  {artists.slice(0, 15).map((artist) => {
                    const to = `/artist/$artistId`
                    return (
                      <SidebarMenuItem key={artist.id}>
                        <Link to={to} params={{ artistId: artist.id }} className="w-full">
                          <SidebarMenuButton
                            size="sm"
                            className="h-8"
                            tooltip={artist.name}
                            isActive={!!matchRoute({ to, params: { artistId: artist.id } })}
                          >
                            <User className="size-4 text-muted-foreground" />
                            {artist.name}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </AccordionContent>
            </AccordionItem>

            {/* Albums (from Library) */}
            <AccordionItem value="albums" className="border-none mb-4">
              <AccordionTrigger className="px-2 hover:no-underline group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2 text-sm">
                  <Album className="size-5" />
                  <span>Albums</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <SidebarMenu>
                  {albums.slice(0, 15).map((album) => {
                    const to = `/album/$albumId`
                    return (
                      <SidebarMenuItem key={album.id}>
                        <Link to={to} params={{ albumId: album.id }} className="w-full">
                          <SidebarMenuButton
                            size="sm"
                            className="h-8"
                            tooltip={album.name}
                            isActive={!!matchRoute({ to, params: { albumId: album.id } })}
                          >
                            <Music className="size-4 text-muted-foreground" />
                            {album.name}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </AccordionContent>
            </AccordionItem>

            {/* Playlists (static for now) */}
            <AccordionItem value="playlists" className="border-none mb-4">
              <AccordionTrigger className="px-2 hover:no-underline group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2 text-sm">
                  <ListMusic className="size-5" />
                  <span>Playlists</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <SidebarMenu>
                  {playlists.map((playlist, index) => {
                    const slug = createSlug(playlist)
                    const to = `/playlist/$playlistId`
                    return (
                      <SidebarMenuItem key={index}>
                        <Link to={to} params={{ playlistId: slug }} className="w-full">
                          <SidebarMenuButton
                            size="sm"
                            className="h-8"
                            tooltip={playlist}
                            isActive={!!matchRoute({ to, params: { playlistId: slug } })}
                          >
                            <Music className="size-4 text-muted-foreground" />
                            {playlist}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    )
                  })}
                  <SidebarMenuItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 gap-2 mt-1"
                    >
                      <Plus className="size-4" />
                      New Playlist
                    </Button>
                  </SidebarMenuItem>
                </SidebarMenu>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}
