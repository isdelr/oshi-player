import { create } from 'zustand'

interface SettingsState {
  settings: Record<string, string | null>
  isMaximized: boolean
  actions: {
    loadSetting: (key: string) => Promise<void>
    updateSetting: (key: string, value: string) => Promise<void>
    setIsMaximized: (isMaximized: boolean) => void
    initializeListeners: () => () => void
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  isMaximized: false,
  actions: {
    loadSetting: async (key) => {
      const value = await window.api.getSetting(key)
      set((state) => ({ settings: { ...state.settings, [key]: value } }))
    },
    updateSetting: async (key, value) => {
      await window.api.setSetting(key, value)
      set((state) => ({ settings: { ...state.settings, [key]: value } }))
    },
    setIsMaximized: (isMaximized) => {
      set({ isMaximized })
    },
    initializeListeners: () => {
      const removeListener = window.api.onWindowStateChange((isMaximized) => {
        get().actions.setIsMaximized(isMaximized)
      })
      return () => removeListener()
    }
  }
}))
