"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  BookOpen,
  Video,
  Star,
  User as UserIcon,
} from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { getGlobalSearchResults } from "@/app/actions/search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

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
      if (e.key === "Escape") {
        setOpen(false)
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

  const handleSelect = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  const hasResults = results.consultants.length > 0 || results.products.length > 0 || results.workshops.length > 0

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center lg:justify-start gap-2 h-10 w-10 lg:w-[15vw] xl:w-[20vw] max-w-2xl px-0 lg:px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-all shadow-sm"
      >
        <Search className="h-5 w-5 lg:h-4 lg:w-4" />
        <span className="hidden lg:block flex-1 text-left">Search everything...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 bg-[#1c1c1c] border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Power Search v3</DialogTitle>
          </VisuallyHidden>
          {/* Search Input */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for consultants, products, or commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-lg text-white placeholder:text-gray-500 outline-none"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="p-4 space-y-1 max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="py-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <p>Searching...</p>
                </div>
              </div>
            )}

            {!loading && !hasResults && query.length >= 2 && (
              <div className="py-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-12 w-12 text-gray-700" />
                  <p className="font-semibold">No results found</p>
                  <p className="text-sm">Try searching for consultants, products, or workshops</p>
                </div>
              </div>
            )}

            {!loading && !hasResults && query.length < 2 && (
              <div className="space-y-1">
                {/* Quick Links */}
                <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" onClick={() => handleSelect('/book-consultant')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Find Business Strategists</p>
                      <p className="text-xs text-gray-500">Search specialized consultants</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 uppercase">Quick Link</span>
                </div>

                <div className="px-4 py-4 rounded-2xl flex items-center justify-between hover:bg-white/5 group/item transition-colors cursor-pointer" onClick={() => handleSelect('/library')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Browse Top Rated Products</p>
                      <p className="text-xs text-gray-500">Featured e-books & masterclasses</p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-4 rounded-2xl flex items-center justify-between hover:bg-white/5 group/item transition-colors cursor-pointer" onClick={() => handleSelect('/sessions')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                      <Video className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Upcoming Workshops</p>
                      <p className="text-xs text-gray-500">Next live sessions this week</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Consultants Results */}
            {results.consultants.length > 0 && (
              <div className="space-y-2">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Consultants</div>
                {results.consultants.map((c) => (
                  <div
                    key={c.uid}
                    onClick={() => handleSelect(`/consultant/${c.uid}`)}
                    className="px-4 py-4 rounded-2xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={c.profilePhoto || ""} />
                          <AvatarFallback className="bg-blue-600 text-white text-sm font-bold">{c.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{c.name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {c.rating && (
                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-400">{c.rating}</span>
                        </div>
                      )}
                      <Badge variant="outline" className="text-[10px] font-black text-blue-400 border-blue-400/30 bg-blue-400/10">
                        CONSULTANT
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Results */}
            {results.products.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Library & Assets</div>
                {results.products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(`/library/${p.id}`)}
                    className="px-4 py-4 rounded-2xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{p.title}</p>
                        <p className="text-xs text-gray-500 capitalize truncate">{p.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-400">${(p.price / 100).toFixed(2)}</span>
                      <Badge variant="outline" className="text-[10px] font-black text-indigo-400 border-indigo-400/30 bg-indigo-400/10">
                        PRODUCT
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Workshops Results */}
            {results.workshops.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Sessions & Workshops</div>
                {results.workshops.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => handleSelect(`/sessions/${w.id}`)}
                    className="px-4 py-4 rounded-2xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center flex-shrink-0">
                        <Video className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white truncate">{w.title}</p>
                        <p className="text-xs text-gray-500 capitalize truncate">{w.mode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-green-400">${(w.price / 100).toFixed(2)}</span>
                      <Badge variant="outline" className="text-[10px] font-black text-green-400 border-green-400/30 bg-green-400/10">
                        WORKSHOP
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#151515] px-6 py-3 border-t border-white/5 flex justify-between items-center">
            <div className="flex gap-4">
              <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                <span className="bg-white/10 px-1.5 py-0.5 rounded font-mono">↑↓</span> Navigate
              </span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                <span className="bg-white/10 px-1.5 py-0.5 rounded font-mono">↵</span> Select
              </span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                <span className="bg-white/10 px-1.5 py-0.5 rounded font-mono">Esc</span> Close
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Power Search v3</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
