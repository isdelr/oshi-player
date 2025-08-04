// src/renderer/src/components/TitleBar.tsx
import { Minimize2, X, Square } from 'lucide-react'
import { CSSProperties, JSX, ReactNode } from 'react'
import { useTitleBar } from '@renderer/stores/useTitleBar'
import '@renderer/assets/titleBar.css' // Import the CSS file

interface TitleBarProps {
  children: ReactNode
  className?: string
  showBorder?: boolean
}

export function TitleBar({
  children,
  className = '',
  showBorder = true
}: TitleBarProps): JSX.Element {
  const { isMaximized, useCustomFrame, platform, controls } = useTitleBar()

  const WindowsControls = (): JSX.Element => (
    <div className="flex items-center h-full title-bar-controls">
      <button
        onClick={controls.minimize}
        className="h-full px-4 flex items-center justify-center windows-control hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 group"
        aria-label="Minimize window"
        tabIndex={-1}
      >
        <Minimize2 className="w-[10px] h-[10px] group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={controls.maximize}
        className="h-full px-4 flex items-center justify-center windows-control hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 group"
        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
        tabIndex={-1}
      >
        {isMaximized ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current group-hover:scale-110 transition-transform"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="6" height="6" strokeWidth="1" />
            <rect x="1" y="1" width="6" height="6" strokeWidth="1" fill="transparent" />
          </svg>
        ) : (
          <Square className="w-[10px] h-[10px] group-hover:scale-110 transition-transform" />
        )}
      </button>
      <button
        onClick={controls.close}
        className="h-full px-4 flex items-center justify-center windows-control close hover:bg-red-600 hover:text-white transition-colors duration-200 group"
        aria-label="Close window"
        tabIndex={-1}
      >
        <X className="w-[10px] h-[10px] group-hover:scale-110 transition-transform" />
      </button>
    </div>
  )

  const MacControls = (): JSX.Element => (
    <div className="flex items-center space-x-2 pl-2 py-1 mac-traffic-lights">
      <div className="flex space-x-2">
        <button
          onClick={controls.close}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 group flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          aria-label="Close window"
          tabIndex={-1}
        >
          <X className="w-1.5 h-1.5 text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={controls.minimize}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 group flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          aria-label="Minimize window"
          tabIndex={-1}
        >
          <Minimize2 className="w-1.5 h-1.5 text-yellow-900 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={controls.maximize}
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-200 group flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
          tabIndex={-1}
        >
          <div className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {isMaximized ? (
              <svg
                width="6"
                height="6"
                viewBox="0 0 6 6"
                className="fill-green-900"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="4" height="4" />
              </svg>
            ) : (
              <svg
                width="6"
                height="6"
                viewBox="0 0 6 6"
                className="fill-green-900"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="5"
                  height="5"
                  strokeWidth="0.5"
                  fill="none"
                  stroke="currentColor"
                />
              </svg>
            )}
          </div>
        </button>
      </div>
    </div>
  )

  const LinuxControls = (): JSX.Element => (
    <div className="flex items-center space-x-1 h-full title-bar-controls">
      <button
        onClick={controls.minimize}
        className="h-8 px-3 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-label="Minimize window"
        tabIndex={-1}
      >
        <Minimize2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={controls.maximize}
        className="h-8 px-3 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
        tabIndex={-1}
      >
        {isMaximized ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current group-hover:scale-110 transition-transform"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="6" height="6" strokeWidth="1" />
            <path d="M2 4V2h6v6h-2" strokeWidth="1" fill="none" />
          </svg>
        ) : (
          <Square className="w-3 h-3 group-hover:scale-110 transition-transform" />
        )}
      </button>
      <button
        onClick={controls.close}
        className="h-8 px-3 flex items-center justify-center hover:bg-red-600 hover:text-white rounded transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        aria-label="Close window"
        tabIndex={-1}
      >
        <X className="w-3 h-3 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  )

  const renderControls = (): JSX.Element => {
    if (!useCustomFrame) return <></>

    if (platform === 'mac') return <MacControls />
    if (platform === 'linux') return <LinuxControls />
    return <WindowsControls />
  }

  // Define padding based on platform. A fixed height is now used.
  const getTitleBarPadding = (): string => {
    if (!useCustomFrame) return 'px-0'
    if (platform === 'mac') return 'pl-20 pr-4'
    if (platform === 'windows') return 'pl-4 h-8' // Keep Windows bar thin but allow content to be taller
    return 'px-4' // Linux default
  }

  const getPlatformClass = (): string => {
    if (platform === 'mac') return 'title-bar-mac'
    if (platform === 'windows') return 'title-bar-windows'
    return 'title-bar-linux'
  }

  const getDragRegionStyles = (): CSSProperties => {
    if (!useCustomFrame) return {}
    return { WebkitAppRegion: 'drag' } as CSSProperties
  }

  const getNoDragStyles = (): CSSProperties =>
    ({
      WebkitAppRegion: 'no-drag'
    }) as CSSProperties

  // Don't render anything if using native frame
  if (!useCustomFrame) {
    return <></>
  }

  return (
    <header
      className={`
      title-bar
      ${getPlatformClass()}
      flex items-center justify-between
      h-16
      ${getTitleBarPadding()}
      ${showBorder ? 'border-b border-border/20' : ''}
      bg-background/95 backdrop-blur-sm
      relative z-50
      ${className}
    `}
      style={getDragRegionStyles()}
      role="banner"
      aria-label="Window title bar"
    >
      <div
        className={`
        flex items-center flex-1 min-w-0 h-full
        ${platform === 'mac' ? 'justify-center' : 'justify-start'}
        title-bar-content
      `}
        style={platform === 'mac' ? getNoDragStyles() : {}}
      >
        {platform === 'mac' && (
          <div
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
            style={getNoDragStyles()}
          >
            {renderControls()}
          </div>
        )}

        <div
          className={`
          flex items-center truncate h-full
          ${platform === 'mac' ? 'max-w-md' : 'flex-1'}
          ${platform === 'windows' ? 'text-sm' : ''}
        `}
        >
          {children}
        </div>
      </div>

      {(platform === 'windows' || platform === 'linux') && (
        <div className="h-full" style={getNoDragStyles()}>
          {renderControls()}
        </div>
      )}
    </header>
  )
}