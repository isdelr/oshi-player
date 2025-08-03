// src/renderer/src/components/MusicPlayer.tsx
import { JSX } from 'react'
import {
  Play,
  SkipBack,
  SkipForward,
  Mic2,
  ListMusic,
  Repeat,
  Shuffle,
  Volume2,
  Maximize2,
  Heart
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Slider } from './ui/slider'

/**
 * A component that renders a stylized waveform.
 * Note: This is for display purposes only and is not functional.
 */
const Waveform = (): JSX.Element => {
  // Generate an array of random heights for the waveform bars to simulate audio
  const bars = Array.from({ length: 100 }, () => Math.floor(Math.random() * 16) + 3)
  // Simulate playback progress (e.g., 40%)
  const progressPercentage = 40
  const progressIndex = Math.floor((bars.length * progressPercentage) / 100)

  return (
    <div className="group flex h-6 w-full cursor-pointer items-end gap-px overflow-hidden">
      {bars.map((height, index) => (
        <div
          key={index}
          style={{ height: `${height}px` }}
          className={`w-[2px] rounded-full transition-all duration-200 ease-in-out ${
            index < progressIndex
              ? 'bg-primary'
              : 'bg-muted-foreground/30 group-hover:bg-primary/40'
          }`}
        />
      ))}
    </div>
  )
}

/**
 * The main music player component fixed to the bottom of the UI.
 */
export function MusicPlayer(): JSX.Element {
  return (
    <footer className="music-player z-50 flex h-20 shrink-0 items-center justify-between gap-3 border-t px-4 py-2 overflow-show">
      {/* Left Section: Track Info */}
      <div className="flex w-1/6 min-w-0 items-center gap-2">
        <Avatar className="size-10 rounded-md">
          <AvatarImage src="https://via.placeholder.com/150/3b82f6/ffffff?text=A" />
          <AvatarFallback className="rounded-md bg-muted text-xs">A</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground leading-tight">The Feel Good Drag</p>
          <p className="truncate text-xs text-muted-foreground leading-tight">Anberlin</p>
        </div>
        <Button variant="ghost" size="icon" className="size-7 shrink-0 rounded-full">
          <Heart className="size-4 text-muted-foreground hover:text-red-500" />
        </Button>
      </div>

      {/* Center Section: Controls & Progress */}
      <div className="flex w-3/6 max-w-xl flex-col items-center gap-1 pt-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-7 rounded-full">
            <Shuffle className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-full">
            <SkipBack className="size-4" />
          </Button>
          <Button size="icon" className="play-button size-9 rounded-full">
            <Play className="size-4 fill-current" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-full">
            <SkipForward className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-full">
            <Repeat className="size-3" />
          </Button>
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="text-sm font-mono text-muted-foreground tabular-nums">1:25</span>
          <Waveform />
          <span className="text-sm font-mono text-muted-foreground tabular-nums">3:25</span>
        </div>
      </div>

      {/* Right Section: Volume & Options */}
      <div className="flex w-1/6 items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="size-7 rounded-full">
          <ListMusic className="size-4" />
        </Button>
        <div className="flex w-24 items-center gap-2">
          <Volume2 className="size-4" />
          <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
        </div>
        <Button variant="ghost" size="icon" className="size-7 rounded-full">
          <Maximize2 className="size-4" />
        </Button>
      </div>
    </footer>
  )
}