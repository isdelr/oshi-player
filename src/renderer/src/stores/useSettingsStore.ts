// src/renderer/src/stores/useSettingsStore.ts
import { create } from 'zustand'
import { toast } from 'sonner'

type WindowFrameStyle = 'custom' | 'native'

interface SettingsState {
  // Behavior
  runOnStartup: boolean
  minimizeToTray: boolean
  // Appearance
  windowFrameStyle: WindowFrameStyle
  // Actions
  actions: {
    loadAllSettings: () => Promise<void>
    setRunOnStartup: (enabled: boolean) => Promise<void>
    setMinimizeToTray: (enabled: boolean) => Promise<void>
    setWindowFrameStyle: (style: WindowFrameStyle) => Promise<void>
    resetApp: () => Promise<void>
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  runOnStartup: false,
  minimizeToTray: true, // Default to true as per your UI
  windowFrameStyle: 'custom', // Default to custom as per your UI
  actions: {
    loadAllSettings: async () => {
      try {
        const [startupSettings, traySetting, frameSetting] = await Promise.all([
          window.api.getLoginSettings(),
          window.api.getSetting('minimizeToTray'),
          window.api.getSetting('windowFrameStyle')
        ])
        set({
          runOnStartup: startupSettings.openAtLogin,
          minimizeToTray: traySetting !== 'false', // Default to true if not set
          windowFrameStyle: (frameSetting as WindowFrameStyle) || 'custom'
        })
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    },
    setRunOnStartup: async (enabled) => {
      try {
        await window.api.setLoginSettings({ openAtLogin: enabled })
        set({ runOnStartup: enabled })
        toast.success(`Run on startup has been ${enabled ? 'enabled' : 'disabled'}.`)
      } catch (error) {
        console.error('Failed to set startup settings:', error)
        toast.error('Failed to update startup settings.')
      }
    },
    setMinimizeToTray: async (enabled) => {
      try {
        await window.api.setSetting('minimizeToTray', String(enabled))
        set({ minimizeToTray: enabled })
        toast.success(`Minimize to tray has been ${enabled ? 'enabled' : 'disabled'}.`)
      } catch (error) {
        console.error('Failed to set minimize to tray:', error)
        toast.error('Failed to update minimize to tray setting.')
      }
    },
    setWindowFrameStyle: async (style) => {
      try {
        await window.api.setSetting('windowFrameStyle', style)
        set({ windowFrameStyle: style })
        toast.info('The application needs to restart to apply the new window frame style.', {
          action: {
            label: 'Restart Now',
            onClick: () => window.api.relaunchApp()
          },
          duration: 10000 // 10 seconds
        })
      } catch (error) {
        console.error('Failed to set window frame style:', error)
        toast.error('Failed to update window frame style.')
      }
    },
    resetApp: async () => {
      try {
        await window.api.resetApp()
        // The app will restart, so no further state change is needed.
      } catch (error) {
        console.error('Failed to reset app:', error)
        toast.error('An error occurred while trying to reset the application.')
      }
    }
  }
}))