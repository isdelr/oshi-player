// src/renderer/src/components/GlobalSearch.tsx
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { JSX } from 'react'

export function GlobalSearch(): JSX.Element {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        placeholder="Search artists, songs, albums..."
        className="w-full pl-10 h-10 rounded-lg bg-muted/40 border-transparent transition-colors focus:bg-background focus:border-primary"
      />
    </div>
  )
}