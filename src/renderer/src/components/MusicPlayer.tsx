import { JSX, useEffect, useRef } from 'react'
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
  Pause
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'

const formatTime = (secs: number | undefined): string => {
  if (secs === undefined || isNaN(secs)) return '0:00'
  const minutes = Math.floor(secs / 60)
  const seconds = Math.floor(secs % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const HTMLAudioComponent = ({ playerRef, actions }): JSX.Element => (
  <audio
    ref={playerRef}
    onPlay={actions._handlePlay}
    onPause={actions._handlePause}
    onEnded={actions._handleEnded}
    onTimeUpdate={actions._handleTimeUpdate}
    onLoadedData={actions._handleLoadedData}
    onVolumeChange={actions._handleVolumeChange}
    onSeeked={actions._handleSeeked}
    style={{ display: 'none' }}
  />
)
export function MusicPlayer(): JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { currentSong, isPlaying, currentTime, volume, actions } = usePlayerStore()

  // On mount, link the audio element ref to the store so actions can control it.
  useEffect(() => {
    actions.setAudioRef(audioRef)
  }, [actions])

  // --- Event handlers now call the simplified store actions ---
  const handleSeekCommit = (value: number[]): void => actions.seek(value[0])
  const handleVolumeChange = (value: number[]): void => actions.setVolume(value[0])

  const PlayPauseButton = (): JSX.Element => (
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

  const disabledPlayer = (
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
          <Slider value={[50]} max={100} step={1} className="w-full" disabled />
        </div>
        <Button variant="ghost" size="icon" className="size-7 rounded-full" disabled>
          <Maximize2 className="size-4" />
        </Button>
      </div>
    </footer>
  )

  return (
    <>
      {/* The audio element is always in the DOM, controlled by the Zustand store */}
      <HTMLAudioComponent playerRef={audioRef} actions={actions} />

      {!currentSong ? (
        disabledPlayer
      ) : (
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
              <p className="truncate text-xs text-muted-foreground leading-tight">
                {currentSong.artist}
              </p>
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
                onClick={actions.playPrevious} // Corrected action name
              >
                <SkipBack className="size-4" />
              </Button>
              <PlayPauseButton />
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-full"
                onClick={actions.playNext} // Corrected action name
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
                step={0.1}
                className="w-full"
                onValueCommit={handleSeekCommit} // Only update on commit
                disabled={!currentSong}
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
              <Slider
                value={[volume * 100]} // Convert store's 0-1 volume to 0-100 for slider
                max={100}
                step={1}
                className="w-full"
                onValueChange={handleVolumeChange} // Use onValueChange for live feedback
              />
            </div>
            <Button variant="ghost" size="icon" className="size-7 rounded-full">
              <Maximize2 className="size-4" />
            </Button>
          </div>
        </footer>
      )}
    </>
  )
}