import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator
} from './ui/sidebar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Button } from './ui/button'
import { Clock, Heart, Library, ListMusic, Mic2, Music, Plus, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { JSX } from 'react'

export function LeftSidebar(): JSX.Element {
  // Placeholder data for playlists and artists
  const playlists = ['Chill Mix', 'Workout Beats', 'Late Night Lo-fi', 'Road Trip Jams']
  const artists = ['Arijit Singh', 'The Weeknd', 'Taylor Swift']

  return (
    <Sidebar
      className="glass-strong" // Applying glassmorphism effect from your CSS
      collapsible="icon"
    >
      <SidebarHeader className="mb-4">
        <div className="flex items-center gap-2 pt-2 px-2">
          <Music className="size-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
            Oshi
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className='p-2'>
        <ScrollArea className="custom-scrollbar">
          <SidebarMenu className="mb-4">
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Recently Played" isActive>
                <Clock className="size-5" />
                <span>Recently Played</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Favorites">
                <Heart className="size-5" />
                <span>Favorites</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Local Files">
                <Library className="size-5" />
                <span>Local Files</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <Accordion type="multiple" defaultValue={['playlists']}>
            <AccordionItem value="playlists" className="border-none mb-4">
              <AccordionTrigger className="px-2 hover:no-underline group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2 text-sm">
                  <ListMusic className="size-5" />
                  <span>Playlists</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <SidebarMenu>
                  {playlists.map((playlist, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton size="sm" className="h-8">
                        <Music className="size-4 text-muted-foreground" />
                        {playlist}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
            <AccordionItem value="artists" className="border-none">
              <AccordionTrigger className="px-2 hover:no-underline group-data-[collapsible=icon]:hidden">
                <div className="flex items-center gap-2 text-sm">
                  <Mic2 className="size-5" />
                  <span>Artists</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <SidebarMenu>
                  {artists.map((artist, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton size="sm" className="h-8">
                        <User className="size-4 text-muted-foreground" />
                        {artist}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}
