"use client"

import { useState, useEffect } from "react"
import { getWorkshops } from "@/app/actions/workshops"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Globe, 
  Users, 
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

export default function SessionsPage() {
  const { userData } = useAuth()
  const [workshops, setWorkshops] = useState<any[]>([])
  const [filteredWorkshops, setFilteredWorkshops] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorkshops() {
      const result = await getWorkshops({ publishedOnly: true, upcomingOnly: true })
      if (result.success) {
        setWorkshops(result.data || [])
        setFilteredWorkshops(result.data || [])
      }
      setLoading(false)
    }
    loadWorkshops()
  }, [])

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let filtered = workshops

    // Filter by category (Heuristic)
    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase()
      filtered = filtered.filter(w => 
        w.title.toLowerCase().includes(cat) || 
        w.description.toLowerCase().includes(cat)
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(w => 
        w.title.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query)
      )
    }

    setFilteredWorkshops(filtered)
  }, [searchQuery, selectedCategory, workshops])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Section */}
      <section className="bg-gray-950 pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full -top-24 -left-24" />
        <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full -bottom-24 -right-24" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <Badge className="mb-6 bg-blue-500/20 text-blue-400 border-blue-500/30 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
               Interactive Learning
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Deep Dive Sessions with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Industry Leaders.</span>
            </h1>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Join live workshops, hands-on masterclasses, and collaborative sessions to master new skills in real-time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <Avatar key={i} className="h-10 w-10 border-4 border-gray-950 ring-2 ring-blue-500/20">
                     <AvatarFallback className="bg-gray-800 text-[10px] font-bold text-gray-400">U</AvatarFallback>
                   </Avatar>
                 ))}
               </div>
               <p className="text-sm text-gray-500 font-bold tracking-tight">
                  <span className="text-white">+2.4k</span> users joined this month
               </p>
            </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 mb-16 flex flex-col md:flex-row items-center gap-4">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Find a session or topic..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
              />
           </div>
           <Button size="lg" className="h-[60px] px-8 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black shadow-lg shadow-blue-100 flex items-center gap-3">
              Search Sessions
           </Button>
        </div>

        {/* Categories / Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
           {["All Masterclasses", "Marketing", "Business", "Development", "Design", "Productivity"].map((cat, i) => (
             <Button 
               key={i}
               onClick={() => setSelectedCategory(i === 0 ? "all" : cat.toLowerCase())}
               variant={selectedCategory === (i === 0 ? "all" : cat.toLowerCase()) ? "default" : "outline"} 
               className={`rounded-2xl h-11 px-6 font-bold text-xs uppercase tracking-widest transition-all ${
                 selectedCategory === (i === 0 ? "all" : cat.toLowerCase()) ? "bg-blue-600 shadow-md text-white" : "border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
               }`}
             >
               {cat}
             </Button>
           ))}
        </div>

        {/* Workshops Grid */}
        {filteredWorkshops && filteredWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredWorkshops.map((ws: any) => (
              <Card key={ws.id} className="group border-none shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 rounded-[32px] bg-white overflow-hidden flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent z-10" />
                   <img 
                    src={ws.thumbnailUrl || `https://images.unsplash.com/photo-1591115765373-520b7a42b102?auto=format&fit=crop&q=80&w=800`}
                    alt={ws.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                   />
                   <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                     <Badge className="bg-white/95 backdrop-blur-md text-gray-950 border-none shadow-lg text-[10px] font-black px-4 py-1.5 rounded-full ring-4 ring-white/20">
                       {ws.mode.toUpperCase()}
                     </Badge>
                     {ws.registrations?.length >= (ws.maxParticipants || 100) && (
                       <Badge className="bg-red-500 text-white border-none shadow-lg text-[10px] font-black px-4 py-1.5 rounded-full uppercase">
                         Sold Out
                       </Badge>
                     )}
                   </div>
                   
                   <div className="absolute bottom-4 left-4 right-4 z-20">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8 ring-2 ring-white/50">
                          <AvatarImage src={ws.consultant?.profilePhoto} />
                          <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                             {ws.consultant?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-white/90 drop-shadow-md tracking-tight">{ws.consultant?.name}</span>
                      </div>
                      <h3 className="text-xl font-black text-white leading-tight drop-shadow-md group-hover:text-blue-300 transition-colors">{ws.title}</h3>
                   </div>
                </div>

                <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-50">
                     <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span>
                           <span className="text-xs font-black text-gray-900">{new Date(ws.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starts</span>
                           <span className="text-xs font-black text-gray-900">{new Date(ws.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                     </div>
                  </div>

                  <p className="text-sm text-gray-500 font-medium leading-[1.6] mb-8 line-clamp-3">
                    {ws.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Pass</span>
                        <span className="text-2xl font-black text-gray-900">${(ws.price / 100).toFixed(2)}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Link href={`/sessions/${ws.id}`}>
                            <Button variant="outline" className="h-11 border-gray-100 rounded-2xl px-4 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-gray-50">
                               Details
                            </Button>
                         </Link>
                         
                         {userData && ws.registrations?.some((r: any) => r.clientId === userData.uid) ? (
                           <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                             <CheckCircle2 className="h-4 w-4 text-blue-600" />
                             <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Registered</span>
                           </div>
                         ) : (
                           <Link href={ws.consultantId === userData?.uid ? "#" : `/checkout?workshopId=${ws.id}`}>
                             <Button 
                               className="h-11 bg-gray-900 hover:bg-blue-600 text-white rounded-2xl px-4 font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:translate-x-1 disabled:grayscale disabled:opacity-70 disabled:cursor-not-allowed"
                               disabled={ws.consultantId === userData?.uid || (ws.registrations?.length >= (ws.maxParticipants || 100))}
                             >
                                {ws.registrations?.length >= (ws.maxParticipants || 100) ? "Sold Out" : "Book Spot"}
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                             </Button>
                           </Link>
                         )}
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-sm">
             <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-gray-100/50">
                <Sparkles className="h-10 w-10 text-blue-400" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">New Masterclasses are cooking!</h3>
             <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
               We're collaborating with top consultants to bring you the best interactive learning experiences. Stay tuned!
             </p>
             <Button variant="outline" size="lg" className="rounded-2xl border-gray-200 h-14 px-8 font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-50">
                Notify Me
             </Button>
          </div>
        )}
      </main>
      
      {/* Newsletter / CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="bg-blue-600 rounded-[40px] p-12 md:p-20 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_40px_100px_-20px_rgba(37,99,235,0.4)]">
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 blur-[80px] rounded-full" />
           <div className="relative z-10 max-w-xl">
             <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">Never miss a deep dive <br/> session again.</h2>
             <p className="text-blue-100 text-lg font-medium">Get early-bird access to limited workshops and masterclasses delivered by top experts.</p>
           </div>
           <div className="relative z-10 w-full md:w-auto">
             <div className="bg-white/10 backdrop-blur-md p-3 rounded-3xl flex flex-col sm:flex-row gap-3">
               <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white rounded-2xl px-6 py-4 flex-1 text-gray-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all border-none placeholder:text-gray-400"
               />
               <Button className="bg-gray-900 hover:bg-black text-white h-full py-4 px-10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95">
                 Get Early Access
               </Button>
             </div>
           </div>
        </div>
      </section>
    </div>
  )
}
