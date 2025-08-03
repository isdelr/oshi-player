// src/renderer/src/routes/__root.tsx
import { createRootRoute, Outlet, Link} from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { LeftSidebar } from '@renderer/components/LeftSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@renderer/components/ui/sidebar'
import { JSX } from 'react'
import { GlobalSearch } from '@renderer/components/GlobalSearch'
import { Button } from '@renderer/components/ui/button'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { ThemeProvider } from '@renderer/components/providers/ThemeProvider'
import { ThemeSwitcher } from '@renderer/components/ThemeSwitcher'
import { TitleBar } from '@renderer/components/TitleBar'
import { MusicPlayer } from '@renderer/components/MusicPlayer'
import { useNavigation } from '@renderer/hooks/useNavigation'

export const Route = createRootRoute({
  component: RootLayout
})

function RootLayout(): JSX.Element {
  const { canGoBack, canGoForward, goForward, goBack } = useNavigation()

  // Conditionally render the search bar
  const showSearchBar = location.pathname !== '/settings'

  return (
    <ThemeProvider defaultTheme="dark" storageKey="oshi-theme">
      <SidebarProvider>
        <div className="flex h-screen w-full flex-col">
          <div className="flex flex-1 overflow-y-hidden">
            <LeftSidebar />
            <SidebarInset className="flex flex-col p-0">
              <TitleBar>
                <div className="flex h-16 w-full items-center gap-4 bg-transparent px-4">
                  {/* Wrap interactive elements in a div with 'no-drag' */}
                  <div
                    className="flex items-center gap-2"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                  >
                    <div className="md:hidden">
                      <SidebarTrigger />
                    </div>
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

                  {/* The search bar area. The flex-1 div itself remains draggable. */}
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

                  {/* Wrap interactive elements in a div with 'no-drag' */}
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
              <main className="flex-1 p-8">
                <Outlet />
              </main>
            </SidebarInset>
          </div>
          <MusicPlayer />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}