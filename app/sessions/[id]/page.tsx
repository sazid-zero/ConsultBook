export const dynamic = 'force-dynamic'

import { getWorkshop } from "@/app/actions/workshops"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Globe, 
  Users, 
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Video,
  Share2
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { WorkshopRegistrationActions } from "@/components/marketplace/WorkshopRegistrationActions"
import { notFound } from "next/navigation"
import { ScrollFix } from "@/components/scroll-fix"

import { WorkshopStatusBanner } from "@/components/marketplace/WorkshopStatusBanner"

export default async function WorkshopDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getWorkshop(id)
  
  if (!result.success || !result.data) {
    notFound()
  }

  const workshop = result.data as any
  const registrations = workshop.registrations || []
  const isFull = workshop.maxParticipants && registrations.length >= workshop.maxParticipants

  return (
    <div className="min-h-screen bg-white">
      <ScrollFix />
      {/* Sub-nav */}
      <div className="border-b border-gray-100 bg-gray-50/50 sticky top-16 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/sessions" className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-all uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:text-blue-600">
               <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Left Column: Workshop Details */}
          <div className="lg:col-span-2">
            <div className="mb-10">
              <Badge className="mb-4 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                Interactive {workshop.mode} Session
              </Badge>
              
              <WorkshopStatusBanner workshop={{ 
                startDate: workshop.startDate, 
                registrations: registrations 
              }} />

              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
                {workshop.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-8 text-sm">
                <div className="flex items-center gap-3">
                   <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
                      <CalendarDays className="h-5 w-5" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">When</span>
                      <span className="text-sm font-black text-gray-900">{new Date(workshop.startDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
                      <Clock className="h-5 w-5" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</span>
                      <span className="text-sm font-black text-gray-900">{new Date(workshop.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-100">
                      {workshop.mode === "online" ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{workshop.mode === "online" ? "Access" : "Location"}</span>
                      <span className="text-sm font-black text-gray-900 truncate max-w-[200px]">{workshop.mode === "online" ? "Link sent after booking" : workshop.location}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Banner Image */}
            <div className="aspect-[21/9] rounded-[40px] overflow-hidden bg-gray-900 mb-16 relative shadow-2xl shadow-blue-500/10">
               <img 
                src={workshop.thumbnailUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200"} 
                className="w-full h-full object-cover opacity-60"
                alt="Workshop Header"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
               <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Avatar className="h-16 w-16 border-4 border-white/20 ring-4 ring-blue-500/20">
                        <AvatarImage src={workshop.consultant?.profilePhoto} />
                        <AvatarFallback className="bg-blue-600 text-white font-black text-xl">
                           {workshop.consultant?.name?.charAt(0)}
                        </AvatarFallback>
                     </Avatar>
                     <div>
                        <p className="text-white font-black text-lg">{workshop.consultant?.name}</p>
                        <p className="text-blue-300 text-sm font-bold tracking-tight">Lead Consultant</p>
                     </div>
                  </div>
                  {isFull && (
                    <Badge className="bg-red-500 text-white border-none px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                       Sold Out
                    </Badge>
                  )}
               </div>
            </div>

            {/* Description Section */}
            <div className="max-w-3xl mb-16">
               <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight uppercase">About this workshop</h2>
               <div className="text-gray-600 text-lg leading-relaxed space-y-6">
                 {workshop.description.split('\n').map((para: string, i: number) => (
                   <p key={i}>{para}</p>
                 ))}
               </div>
            </div>

            {/* Curriculum / Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
               {[
                 { title: "Expert Instruction", desc: "Learn directly from a verified industry veteran." },
                 { title: "Dynamic Q&A", desc: "Interact live and get answers to your specific problems." },
                 { title: "Collaborative Learning", desc: "Network with other ambitious professionals in the session." },
                 { title: "Recorded Access", desc: "Get lifetime access to the session recording afterwards." }
               ].map((item, i) => (
                 <div key={i} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-xl hover:border-transparent transition-all duration-300">
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>

            {/* Consultant Bio Card */}
            <div className="bg-gray-950 rounded-[40px] p-10 flex flex-col md:flex-row gap-10 items-center border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
               <Avatar className="h-32 w-32 shrink-0 ring-8 ring-white/5 shadow-2xl">
                 <AvatarImage src={workshop.consultant?.profilePhoto} className="object-cover" />
                 <AvatarFallback className="text-4xl font-black bg-blue-600 text-white">
                    {workshop.consultant?.name?.charAt(0)}
                 </AvatarFallback>
               </Avatar>
               <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white mb-2">Hosted by {workshop.consultant?.name}</h3>
                  <p className="text-gray-400 font-medium mb-6 leading-relaxed max-w-lg">
                    {workshop.consultant?.bio || "An industry leader dedicated to sharing high-impact knowledge and helping consultants reach their full potential."}
                  </p>
                  <Link href={`/consultant/${workshop.consultantId}/profile`}>
                    <Button variant="outline" className="rounded-2xl border-white/10 text-white hover:bg-white hover:text-black font-black text-xs uppercase tracking-widest h-12 px-8">
                       View Expert Profile
                    </Button>
                  </Link>
               </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-40">
               <Card className="rounded-[40px] border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] bg-white p-2 overflow-hidden">
                  <div className="p-8 space-y-8">
                     <div className="flex flex-col items-center text-center">
                        <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Registration Fee</p>
                        <div className="flex items-baseline gap-2 mb-2">
                           <span className="text-5xl font-black text-gray-900">${(workshop.price / 100).toFixed(2)}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">All inclusive access</p>
                     </div>

                     <WorkshopRegistrationActions 
                        workshop={{
                          id: workshop.id,
                          consultantId: workshop.consultantId,
                          isFull: isFull,
                          startDate: workshop.startDate,
                          registrations: registrations

                        }}
                     />

                     <div className="space-y-6 pt-8 border-t border-gray-50 text-center">
                        <div className="flex flex-col items-center gap-3">
                           <div className="flex -space-x-3 mb-2">
                              {[1,2,3,4,5].map(i => (
                                 <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400 shrink-0">
                                    {i === 5 ? "+12" : "U"}
                                 </div>
                              ))}
                           </div>
                           <p className="text-[10px] font-bold text-gray-400 leading-tight">
                              <span className="text-gray-900">{registrations.length} experts</span> have already <br/> reserved their spot.
                           </p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
                           <ShieldCheck className="h-4 w-4" />
                           Money-back guarantee
                        </div>
                     </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 text-center">
                     <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                        Secure your spot today. Registration closes 2 hours before the session starts.
                     </p>
                  </div>
               </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
