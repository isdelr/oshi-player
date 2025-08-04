// src/renderer/src/components/LeftSidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel
} from '@renderer/components/ui/sidebar'
import { Button } from './ui/button'
import { Clock, Heart, Library, ListMusic, Music, Plus } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import { JSX, useEffect, useState } from 'react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { useLibraryStore } from '@renderer/stores/useLibraryStore'
import { usePlaylistStore } from '@renderer/stores/usePlaylistStore'
import { CreatePlaylistDialog } from './CreatePlaylistDialog'

export function LeftSidebar(): JSX.Element {
  const matchRoute = useMatchRoute()
  const { actions: libraryActions } = useLibraryStore()
  const { playlists, actions: playlistActions } = usePlaylistStore()
  const [isCreatePlaylistOpen, setCreatePlaylistOpen] = useState(false)

  useEffect(() => {
    libraryActions.loadLibrary()
    playlistActions.fetchPlaylists()
  }, [libraryActions, playlistActions])

  return (
    <>
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

        <SidebarContent className="p-0">
          <ScrollArea className="h-full">
            <SidebarMenu className="mb-4 p-2">
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

            <SidebarGroup>
              <div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:hidden">
                <SidebarGroupLabel asChild>
                  <div className="flex items-center gap-2 text-sm">
                    <ListMusic className="size-5" />
                    <span>Playlists</span>
                  </div>
                </SidebarGroupLabel>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setCreatePlaylistOpen(true)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <SidebarMenu className="mt-1 px-2">
                {playlists.map((playlist) => {
                  const to = `/playlist/$playlistId`
                  return (
                    <SidebarMenuItem key={playlist.id}>
                      <Link to={to} params={{ playlistId: playlist.id }} className="w-full">
                        <SidebarMenuButton
                          size="sm"
                          className="h-8"
                          tooltip={playlist.name}
                          isActive={!!matchRoute({ to, params: { playlistId: playlist.id } })}
                        >
                          <Music className="size-4 text-muted-foreground" />
                          {playlist.name}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <CreatePlaylistDialog open={isCreatePlaylistOpen} onOpenChange={setCreatePlaylistOpen} />
    </>
  )
}
