// src/renderer/src/components/MusicPlayer.tsx
import { JSX, useEffect } from 'react'
import {
  Play,
  SkipBack,
  SkipForward,
  ListMusic,
  Repeat,
  Shuffle,
  Volume2,
  Maximize2,
  Heart,
  Pause,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'

// A utility to format time from seconds to MM:SS
const formatTime = (secs: number | undefined): string => {
  if (secs === undefined || isNaN(secs)) return '0:00'
  const minutes = Math.floor(secs / 60)
  const seconds = Math.floor(secs % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

export function MusicPlayer(): JSX.Element {
  // Add isLoading to the destructured state
  const { currentSong, isPlaying, isLoading, currentTime, actions } = usePlayerStore()

  useEffect(() => {
    const cleanup = actions.initializeListeners()
    return cleanup
  }, [actions])

  // Called when the user releases the slider
  const handleSeekCommit = (value: number[]): void => {
    actions.seekSongCommit(value[0])
  }

  // Called while the user is dragging the slider
  const handleSeekValueChange = (value: number[]): void => {
    actions.seekSong(value[0])
  }

  // Handle the new isLoading state in the play button
  const PlayPauseButton = (): JSX.Element => {
    return (
      <Button
        size="icon"
        className="play-button size-9 rounded-full"
        onClick={actions.togglePlayPause}
        disabled={!currentSong}
      >
        {isPlaying ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current" />
        )}
      </Button>
    )
  }

  if (!currentSong) {
    // ... (The disabled player state remains the same, no changes needed here)
    return (
      <footer className="music-player z-50 flex h-20 shrink-0 items-center justify-between gap-3 border-t px-4 py-2 overflow-show">
        <div className="flex w-1/6 min-w-0 items-center gap-2">
          <Avatar className="size-10 rounded-md bg-muted" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground leading-tight">No song selected</p>
            <p className="truncate text-xs text-muted-foreground leading-tight">-</p>
          </div>
        </div>
        <div className="flex w-3/6 max-w-xl flex-col items-center gap-1 pt-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-7 rounded-full" disabled>
              <Shuffle className="size-3" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7 rounded-full" disabled>
              <SkipBack className="size-4" />
            </Button>
            <Button size="icon" className="play-button size-9 rounded-full" disabled>
              <Play className="size-4 fill-current" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7 rounded-full" disabled>
              <SkipForward className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7 rounded-full" disabled>
              <Repeat className="size-3" />
            </Button>
          </div>
          <div className="flex w-full items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground tabular-nums">0:00</span>
            <Slider value={[0]} max={100} step={1} className="w-full" disabled />
            <span className="text-sm font-mono text-muted-foreground tabular-nums">0:00</span>
          </div>
        </div>
        <div className="flex w-1/6 items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="size-7 rounded-full" disabled>
            <ListMusic className="size-4" />
          </Button>
          <div className="flex w-24 items-center gap-2">
            <Volume2 className="size-4" />
            <Slider defaultValue={[50]} max={100} step={1} className="w-full" disabled />
          </div>
          <Button variant="ghost" size="icon" className="size-7 rounded-full" disabled>
            <Maximize2 className="size-4" />
          </Button>
        </div>
      </footer>
    )
  }

  return (
    <footer className="music-player z-50 flex h-20 shrink-0 items-center justify-between gap-3 border-t px-4 py-2 overflow-show">
      {/* Left Section: Track Info */}
      <div className="flex w-1/6 min-w-0 items-center gap-2">
        <Avatar className="size-10 rounded-md">
          <AvatarImage src={currentSong.artwork} />
          <AvatarFallback className="rounded-md bg-muted text-xs">
            {currentSong.artist[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground leading-tight">
            {currentSong.name}
          </p>
          <p className="truncate text-xs text-muted-foreground leading-tight">{currentSong.artist}</p>
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
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full"
            onClick={actions.playPreviousSong}
          >
            <SkipBack className="size-4" />
          </Button>
          {/* Use the new PlayPauseButton component here */}
          <PlayPauseButton />
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full"
            onClick={actions.playNextSong}
          >
            <SkipForward className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 rounded-full">
            <Repeat className="size-3" />
          </Button>
        </div>
        <div className="flex w-full items-center gap-2">
          <span className="text-sm font-mono text-muted-foreground tabular-nums">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={currentSong.rawDuration || 1}
            step={1}
            className="w-full"
            onValueChange={handleSeekValueChange}
            onValueCommit={handleSeekCommit}
            disabled={isLoading || !currentSong}
          />
          <span className="text-sm font-mono text-muted-foreground tabular-nums">
            {currentSong.duration}
          </span>
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