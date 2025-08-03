// src/renderer/src/routes/settings/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { JSX, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Button, buttonVariants } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import { Switch } from '@renderer/components/ui/switch'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@renderer/components/ui/alert-dialog'
import {
  FolderPlus,
  Trash2,
  Download,
  Upload,
  Monitor,
  Smartphone,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { useLibraryStore } from '@renderer/stores/useLibraryStore'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage
})

function SettingsPage(): JSX.Element {
  const { folders, isScanning, actions } = useLibraryStore()
  
  useEffect(() => {
    const loadFolders = async () => {
      const initialFolders = await window.api.getMusicDirectories()
      useLibraryStore.setState({ folders: initialFolders })
    }
    loadFolders()
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-lg text-muted-foreground">
          Manage your application preferences and data.
        </p>
      </div>

      {/* Music Library Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Music Library</CardTitle>
          <CardDescription>
            Manage the folders where Oshi Player looks for your music files. Adding or removing a
            folder will trigger a new scan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Scanned Folders</Label>
            <div className="space-y-2 rounded-lg border p-2 min-h-[6rem]">
              {folders && folders.length > 0 ? (
                folders.map((path, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/40"
                  >
                    <span className="text-sm font-mono truncate pr-4 text-muted-foreground">
                      {path}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={() => actions.removeFolder(path)}
                      disabled={isScanning}
                    >
                      <Trash2 className="size-4 text-muted-foreground/80 hover:text-destructive transition-colors" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full p-4 text-muted-foreground text-sm">
                  {isScanning ? 'Scanning...' : 'No music folders added.'}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={actions.addFolder}
                disabled={isScanning}
              >
                <FolderPlus className="size-4 mr-2" />
                Add Folder
              </Button>
              {/* <Button
                variant="secondary"
                className="w-full"
                onClick={actions.rescanFolders}
                disabled={isScanning}
              >
                {isScanning ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {isScanning ? 'Scanning...' : 'Rescan All Folders'}
              </Button> */}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label htmlFor="recursive-scan" className="font-medium">
                Recursive Scanning
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Scan subdirectories within the selected folders.
              </p>
            </div>
            <Switch id="recursive-scan" defaultChecked disabled />
          </div>
        </CardContent>
      </Card>

      {/* Application Behavior Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Application Behavior</CardTitle>
          <CardDescription>Control the application's startup and window behavior.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label htmlFor="run-on-startup" className="font-medium">
                Run on Startup
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically start Oshi Player when you log in.
              </p>
            </div>
            <Switch id="run-on-startup" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label htmlFor="minimize-to-tray" className="font-medium">
                Minimize to Tray
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Keep the app running in the tray when the window is closed.
              </p>
            </div>
            <Switch id="minimize-to-tray" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application window.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label className="text-base font-medium">Window Frame Style</Label>
          <RadioGroup defaultValue="custom" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <Label
              htmlFor="custom-bar"
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <RadioGroupItem value="custom" id="custom-bar" className="sr-only" />
              <Smartphone className="mb-3 h-7 w-7" />
              Custom Frame
            </Label>
            <Label
              htmlFor="native-bar"
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <RadioGroupItem value="native" id="native-bar" className="sr-only" />
              <Monitor className="mb-3 h-7 w-7" />
              Native OS Frame
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Data Management Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Configuration</CardTitle>
          <CardDescription>
            Export or import your application settings and library data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label htmlFor="include-songs" className="font-medium">
                Include Song Data
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Include song metadata (play counts, favorites, etc.) in the export.
              </p>
            </div>
            <Switch id="include-songs" defaultChecked />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline">
              <Upload className="mr-2 size-4" />
              Import from file...
            </Button>
            <Button variant="outline">
              <Download className="mr-2 size-4" />
              Export to file...
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-destructive size-6" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-destructive/80">
            These actions are permanent and cannot be undone. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
            <div>
              <Label className="font-semibold text-foreground">Reset Application</Label>
              <p className="text-sm text-destructive/90 mt-1">
                This will delete all library data and restore default settings.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset Everything</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action is irreversible. All your scanned library data, playlists,
                    favorites, and custom settings will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: 'destructive' })}
                    onClick={() => console.log('App reset confirmed.')}
                  >
                    Yes, reset the application
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}