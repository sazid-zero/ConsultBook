"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  MessageSquare,
  LayoutDashboard,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getGlobalSearchResults } from "@/app/actions/search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Calendar as CalendarIcon, Video } from "lucide-react"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<{ consultants: any[], products: any[], workshops: any[] }>({ consultants: [], products: [], workshops: [] })
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (query.length < 2) {
      setResults({ consultants: [], products: [], workshops: [] })
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const data = await getGlobalSearchResults(query)
      setResults(data)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  const hasResults = results.consultants.length > 0 || results.products.length > 0 || results.workshops.length > 0

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-all w-48 lg:w-64"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search everything...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="sr-only">
          <DialogTitle>Global Search</DialogTitle>
          <DialogDescription>Search for consultants, products, workshops, and more.</DialogDescription>
        </div>
        <CommandInput 
          placeholder="Type to search anything..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching..." : "No results found."}
          </CommandEmpty>
          
          {results.consultants.length > 0 && (
            <CommandGroup heading="Consultants">
              {results.consultants.map((c) => (
                <CommandItem
                  key={c.uid}
                  value={c.name}
                  onSelect={() => runCommand(() => router.push(`/consultant/${c.uid}`))}
                  className="flex items-center gap-3 p-2"
                >
                  <Avatar className="h-8 w-8 hover:scale-110 transition-transform">
                    <AvatarImage src={c.profilePhoto || ""} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">{c.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{c.name}</span>
                    <span className="text-xs text-blue-600 font-medium">{c.specialty}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.products.length > 0 && (
            <CommandGroup heading="Library & Assets">
              {results.products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.title}
                  onSelect={() => runCommand(() => router.push(`/library/${p.id}`))}
                  className="flex items-center gap-3 p-2"
                >
                  <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{p.title}</span>
                    <span className="text-xs text-gray-500 font-medium capitalize">{p.type.replace('_', ' ')} • ${(p.price / 100).toFixed(2)}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.workshops.length > 0 && (
            <CommandGroup heading="Sessions & Workshops">
              {results.workshops.map((w) => (
                <CommandItem
                  key={w.id}
                  value={w.title}
                  onSelect={() => runCommand(() => router.push(`/sessions/${w.id}`))}
                  className="flex items-center gap-3 p-2"
                >
                  <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Video className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{w.title}</span>
                    <span className="text-xs text-gray-500 font-medium capitalize">{w.mode} • ${(w.price / 100).toFixed(2)}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {hasResults && <CommandSeparator />}
          
          <CommandGroup heading="Quick Links">
            <CommandItem onSelect={() => runCommand(() => router.push("/library"))}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Browse Library</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/sessions"))}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Browse Sessions</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/book-consultant"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Find Consultants</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
