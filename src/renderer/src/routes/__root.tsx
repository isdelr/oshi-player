import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { LeftSidebar } from '@renderer/components/LeftSidebar'
import { SidebarProvider, SidebarInset } from '@renderer/components/ui/sidebar'
import { JSX } from 'react'

export const Route = createRootRoute({
  component: RootLayout
})

function RootLayout(): JSX.Element {
  return (
    // Wrap the entire app in the SidebarProvider
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* The new sidebar component */}
        <LeftSidebar />
        {/* The main content area */}
        <SidebarInset>
          <main className="p-4 w-full">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </SidebarProvider>
  )
}
