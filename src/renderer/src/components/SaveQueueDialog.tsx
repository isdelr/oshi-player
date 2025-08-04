import { JSX, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { usePlaylistStore } from '@renderer/stores/usePlaylistStore'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'

interface SaveQueueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveQueueDialog({ open, onOpenChange }: SaveQueueDialogProps): JSX.Element {
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const playlistActions = usePlaylistStore((s) => s.actions)
  const { playlist } = usePlayerStore()

  const handleCreate = async () => {
    if (!name || playlist.length === 0) return

    setIsCreating(true)
    const songIds = playlist.map((s) => s.id)
    await playlistActions.createPlaylistFromQueue(name, songIds)
    setIsCreating(false)
    setName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Queue as Playlist</DialogTitle>
          <DialogDescription>
            Give your new playlist a name. It will contain all {playlist.length} songs currently in
            your queue.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="My Awesome Queue" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button type="submit" onClick={handleCreate} disabled={!name || isCreating}>{isCreating ? 'Saving...' : 'Save Playlist'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}