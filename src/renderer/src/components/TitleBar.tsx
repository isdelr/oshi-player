// src/renderer/src/components/TitleBar.tsx
import { Minimize2, X, Square } from 'lucide-react'
import { JSX, ReactNode, useState, useEffect } from 'react'

interface TitleBarProps {
  children: ReactNode
}

export function TitleBar({ children }: TitleBarProps): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // This listener will be set up by the preload script
    const cleanup = window.api.onWindowStateChange((maximized) => {
      setIsMaximized(maximized)
    })
    // Cleanup the listener when the component unmounts
    return () => cleanup()
  }, [])

  const handleMinimize = (): void => {
    window.api.minimize()
  }

  const handleMaximize = (): void => {
    window.api.maximize()
  }

  const handleClose = (): void => {
    window.api.close()
  }

  const platform = window.navigator.platform

  const windowControls = (
    <div
      className="flex items-center"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <button
        onClick={handleMinimize}
        className="h-8 w-10 flex items-center justify-center hover:bg-muted/40 transition-colors"
        aria-label="Minimize"
      >
        <Minimize2 className="size-4" />
      </button>
      <button
        onClick={handleMaximize}
        className="h-8 w-10 flex items-center justify-center hover:bg-muted/40 transition-colors"
        aria-label="Maximize"
      >
        {isMaximized ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2.5H13.5V6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 9.5H2.5V13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.5 2.5L9.5 6.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 9.5L2.5 13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <Square className="size-4" />
        )}
      </button>
      <button
        onClick={handleClose}
        className="h-8 w-12 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="size-4" />
      </button>
    </div>
  )

  const macOsWindowControls = (
    <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
      {/* These are just for show on non-mac platforms, real controls are handled by OS */}
    </div>
  )

  return (
    <div
      className="flex h-16 items-center justify-between"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex-1 pl-2">{children}</div>
      <div
        className={`window-controls ${platform.startsWith('Win') ? '' : 'pr-2'}`}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {platform.startsWith('Win') ? windowControls : macOsWindowControls}
      </div>
    </div>
  )
}
