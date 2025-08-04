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
import { Textarea } from './ui/textarea'
import { ImagePlus } from 'lucide-react'

interface CreatePlaylistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePlaylistDialog({
  open,
  onOpenChange
}: CreatePlaylistDialogProps): JSX.Element {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const playlistActions = usePlaylistStore((s) => s.actions)

  const handleCreate = async () => {
    if (!title) return
    setIsCreating(true)
    await playlistActions.createPlaylist({
      name: title,
      description,
      artwork: image ?? undefined
    })
    setIsCreating(false)
    setTitle('')
    setDescription('')
    setImage(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new playlist</DialogTitle>
          <DialogDescription>
            Give your playlist a title and an optional description and image.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-start gap-4">
            <div className="w-24 shrink-0">
              <button className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
                <ImagePlus className="size-8" />
              </button>
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="name" className="sr-only">
                Title
              </Label>
              <Input
                id="name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Playlist"
                className="text-base font-semibold"
              />
              <Label htmlFor="description" className="sr-only">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add an optional description..."
                className="min-h-[80px]"
                rows={3}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleCreate} disabled={!title || isCreating}>
            {isCreating ? 'Creating...' : 'Create Playlist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
