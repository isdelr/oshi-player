import { useState, useEffect } from 'react'

// This hook encapsulates the logic for the custom title bar.
export const useTitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [useCustomFrame, setUseCustomFrame] = useState(true) // Default to custom
  const [platform, setPlatform] = useState<'mac' | 'windows' | 'linux'>('linux')

  useEffect(() => {
    // Determine the platform from the user agent
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('mac')) setPlatform('mac')
    else if (userAgent.includes('windows')) setPlatform('windows')
    else setPlatform('linux')

    // Fetch the initial frame style setting from the main process
    window.api.getSetting('windowFrameStyle').then((frameStyle) => {
      setUseCustomFrame(frameStyle !== 'native')
    })

    // Listen for window state changes from the main process
    const removeListener = window.api.onWindowStateChange((maximized) => {
      setIsMaximized(maximized)
    })

    // Cleanup the listener when the component unmounts
    return () => removeListener()
  }, [])

  // Window control functions that call the main process
  const controls = {
    minimize: () => window.api.minimize(),
    maximize: () => window.api.maximize(),
    close: () => window.api.close()
  }

  return { isMaximized, useCustomFrame, platform, controls }
}