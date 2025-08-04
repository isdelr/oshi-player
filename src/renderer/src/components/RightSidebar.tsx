import { JSX, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash, Save } from 'lucide-react'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'
import { Song } from '@renderer/stores/useLibraryStore'
import { ScrollArea } from './ui/scroll-area'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { cn } from '@renderer/lib/utils'
import { SaveQueueDialog } from './SaveQueueDialog'
import { toast } from 'sonner'

function SortableSongItem({ song, isActive }: { song: Song; isActive: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: song.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-2 rounded-md transition-colors',
        isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-muted-foreground/50 hover:text-muted-foreground"
      >
        <GripVertical className="size-5" />
      </button>
      <Avatar className="size-10 rounded-sm">
        <AvatarImage src={song.artwork} />
        <AvatarFallback className="rounded-sm bg-muted text-xs">{song.name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-normal text-sm leading-tight truncate max-w-48',
            isActive ? 'text-primary' : 'text-foreground'
          )}
        >
          {song.name}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{song.artist}</p>
      </div>
      <span className="text-xs font-mono text-muted-foreground tabular-nums">{song.duration}</span>
    </div>
  )
}

export function RightSidebar(): JSX.Element {
  const { playlist, currentIndex, actions } = usePlayerStore()
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const songIds = playlist.map((s) => s.id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = playlist.findIndex((song) => song.id === active.id)
      const newIndex = playlist.findIndex((song) => song.id === over.id)
      actions.reorderPlaylist(oldIndex, newIndex)
    }
  }

  const handleSaveClick = () => {
    if (playlist.length === 0) return toast.error('Queue is empty.')
    setSaveDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-full bg-background border-l">
      <header className="p-4 border-b shrink-0">
        <h2 className="text-lg font-semibold mb-4">Queue</h2>
        <div className="flex justify-start gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveClick}>
            <Save className="size-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              actions.clearQueue()
              actions.toggleQueueSidebar()
            }}
          >
            <Trash className="size-4 mr-2" />
            Clear
          </Button>
        </div>
      </header>
      <ScrollArea className="flex-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={songIds} strategy={verticalListSortingStrategy}>
            <div className="p-2 space-y-1">
              {playlist.map((song, index) => (
                <SortableSongItem key={song.id} song={song} isActive={index === currentIndex} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {playlist.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <p className="text-sm">The queue is empty.</p>
            <p className="text-xs mt-1">
              Play a song, album, or playlist to add songs to the queue.
            </p>
          </div>
        )}
      </ScrollArea>
      <SaveQueueDialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen} />
    </div>
  )
}
