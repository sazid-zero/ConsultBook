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
import { searchConsultants } from "@/app/actions/consultants"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<any[]>([])
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
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const data = await searchConsultants(query)
      setResults(data)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-all w-48 lg:w-64"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="sr-only">
          <DialogTitle>Global Search</DialogTitle>
          <DialogDescription>Search for consultants, messages, and more.</DialogDescription>
        </div>
        <CommandInput 
          placeholder="Type to search consultants..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching..." : "No results found."}
          </CommandEmpty>
          
          {results.length > 0 && (
            <CommandGroup heading="Consultants">
              {results.map((c) => (
                <CommandItem
                  key={c.uid}
                  value={c.name}
                  onSelect={() => runCommand(() => router.push(`/consultant/${c.uid}`))}
                  className="flex items-center gap-3 p-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.profilePhoto || ""} />
                    <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{c.name}</span>
                    <span className="text-xs text-blue-600 font-medium">{c.specialty}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          
          <CommandGroup heading="Quick Links">
            <CommandItem onSelect={() => runCommand(() => router.push("/book-consultant"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Find Consultants</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/messages"))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Messages</span>
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
