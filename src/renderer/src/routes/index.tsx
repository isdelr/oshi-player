import { createFileRoute } from '@tanstack/react-router'
import { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'

export const Route = createFileRoute('/')({
  component: Index
})

function Index(): JSX.Element {
  return (
    <div className="h-full w-full">
      <Card className="glass h-[80vh]">
        <CardHeader>
          <CardTitle>Main Content Area</CardTitle>
          <CardDescription>
            This is where your song lists, player controls, and other content will go.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            The sidebar on the left provides app navigation. It's collapsible by clicking the icon
            or pressing{' '}
            <kbd className="bg-muted text-muted-foreground rounded-sm px-1.5 py-0.5 text-xs">
              ⌘+B
            </kbd>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
