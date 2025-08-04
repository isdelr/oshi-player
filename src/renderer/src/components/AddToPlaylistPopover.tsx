import { JSX, useState, useEffect } from 'react'
import { Search, Music } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { Input } from './ui/input'
import { usePlaylistStore } from '@renderer/stores/usePlaylistStore'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from './ui/command'
import { ScrollArea } from './ui/scroll-area'
import { toast } from 'sonner'

interface AddToPlaylistPopoverProps {
  songId: string
  children: React.ReactNode
}

export function AddToPlaylistPopover({ songId, children }: AddToPlaylistPopoverProps): JSX.Element {
  const { playlists, actions: playlistActions } = usePlaylistStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      playlistActions.fetchPlaylists()
    }
  }, [isOpen, playlistActions])

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectPlaylist = async (playlist: { id: string; name: string }) => {
    await playlistActions.addSongToPlaylist(playlist.id, songId)
    setIsOpen(false) // Close popover after adding
    toast.success(`Added to ${playlist.name}`)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <div className="flex items-center border-b px-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Filter playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <ScrollArea className="h-48">
            <CommandList>
              {filteredPlaylists.length > 0 ? (
                <CommandGroup>
                  {filteredPlaylists.map((playlist) => (
                    <CommandItem
                      key={playlist.id}
                      onSelect={() => handleSelectPlaylist(playlist)}
                      className="cursor-pointer"
                    >
                      <Music className="mr-2 size-4 text-muted-foreground" />
                      <span>{playlist.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No playlists found.</CommandEmpty>
              )}
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}