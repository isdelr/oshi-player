// src/renderer/src/hooks/useNavigation.ts
import { useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export function useNavigation() {
  const router = useRouter()
  const { history } = router
  const {
    location: { state: locationState }
  } = useRouterState({
    select: (s) => ({ location: s.location })
  })

  const [canGoForward, setCanGoForward] = useState(false)
  const canGoBack = router.history.canGoBack()

  useEffect(() => {
    // A function to update the canGoForward state
    const updateCanGoForward = () => {
      // Access the history from the window object
      const { length, state } = window.history
      // The current index in the history stack
      const currentIndex = state?.index ?? 0

      setCanGoForward(currentIndex < length - 1)
    }

    // Call it once to set the initial state
    updateCanGoForward()

    // Subscribe to router navigation events to update on change
    const unsubscribe = router.subscribe('onResolved', () => {
      updateCanGoForward()
    })

    // Cleanup subscription on component unmount
    return unsubscribe
  }, [history, locationState, router])

  const goBack = () => {
    if (canGoBack) {
      router.history.back()
    }
  }

  const goForward = () => {
    // No need for a try-catch, router.history.forward() is safe to call
    router.history.forward()
  }

  return {
    canGoBack,
    canGoForward,
    goBack,
    goForward
  }
}
