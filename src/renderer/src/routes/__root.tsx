// src/renderer/src/routes/__root.tsx
import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { LeftSidebar } from '@renderer/components/LeftSidebar'
import { SidebarProvider, SidebarInset } from '@renderer/components/ui/sidebar'
import { JSX, useEffect } from 'react'
import { GlobalSearch } from '@renderer/components/GlobalSearch'
import { Button } from '@renderer/components/ui/button'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { ThemeProvider } from '@renderer/components/providers/ThemeProvider'
import { ThemeSwitcher } from '@renderer/components/ThemeSwitcher'
import { TitleBar } from '@renderer/components/TitleBar'
import { MusicPlayer } from '@renderer/components/MusicPlayer'
import { useNavigation } from '@renderer/hooks/useNavigation'
import { Toaster } from '@renderer/components/ui/sonner'
import { useFavoritesStore } from '@renderer/stores/useFavoritesStore'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@renderer/components/ui/resizable'
import { RightSidebar } from '@renderer/components/RightSidebar'
import { usePlayerStore } from '@renderer/stores/usePlayerStore'

export const Route = createRootRoute({
  component: RootLayout
})

function RootLayout(): JSX.Element {
  const { canGoBack, canGoForward, goForward, goBack } = useNavigation()
  const { loadFavorites } = useFavoritesStore((s) => s.actions)
  const { isQueueSidebarOpen, actions: playerActions } = usePlayerStore()

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const showSearchBar = location.pathname !== '/settings'

  return (
    <ThemeProvider defaultTheme="dark" storageKey="oshi-theme">
      <SidebarProvider>
        <div className="flex h-screen w-full flex-col">
          {/* Portal mount for floating UI (search results, etc.) */}
          <div id="app-portals" /> {/* Added */}
          <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 overflow-hidden">
            <ResizablePanel defaultSize={12} minSize={12} maxSize={20}>
              <LeftSidebar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <SidebarInset className="flex flex-col p-0 h-full">
                <TitleBar showBorder={false}>
                  <div className="flex w-full items-center gap-4 bg-transparent px-4">
                    <div
                      className="flex items-center gap-2"
                      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full"
                        onClick={goBack}
                        disabled={!canGoBack}
                      >
                        <ChevronLeft className="size-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full"
                        onClick={goForward}
                        disabled={!canGoForward}
                      >
                        <ChevronRight className="size-5" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      {showSearchBar && (
                        <div
                          className="mx-auto w-full max-w-xl"
                          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                        >
                          <GlobalSearch />
                        </div>
                      )}
                    </div>
                    <div
                      className="mr-4 flex items-center gap-2"
                      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                      <ThemeSwitcher />
                      <Link to="/settings" activeOptions={{ exact: true }}>
                        {({ isActive }) => (
                          <Button
                            variant={isActive ? 'secondary' : 'ghost'}
                            size="icon"
                            className="size-8 rounded-full"
                            aria-label="Open Settings"
                          >
                            <Settings className="size-5" />
                          </Button>
                        )}
                      </Link>
                    </div>
                  </div>
                </TitleBar>
                <main className="flex-1 overflow-hidden p-8">
                  <Outlet />
                </main>
              </SidebarInset>
            </ResizablePanel>
            <ResizableHandle className={!isQueueSidebarOpen ? 'hidden' : ''} />
            <ResizablePanel
              minSize={20}
              defaultSize={20}
              maxSize={30}
              className={!isQueueSidebarOpen ? 'hidden' : ''}
              onCollapse={() => {
                if (isQueueSidebarOpen) playerActions.toggleQueueSidebar()
              }}
            >
              <RightSidebar />
            </ResizablePanel>
          </ResizablePanelGroup>
          <MusicPlayer />
          <Toaster position="bottom-right" richColors />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
