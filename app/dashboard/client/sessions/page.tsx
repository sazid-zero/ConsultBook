"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getClientDashboardData } from "@/app/actions/dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Search, Video, MapPin } from "lucide-react"
import Link from "next/link"

export default function ClientSessionsPage() {
  const { user, loading: authLoading } = useAuth()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  async function loadData() {
    setLoading(true)
    const data = await getClientDashboardData(user!.uid)
    if (data) {
      setRegistrations(data.registrations || [])
    }
    setLoading(false)
  }

  if (loading || authLoading) {
     return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">My Sessions</h1>
              <p className="text-gray-500 font-medium">Workshops, masterclasses, and group sessions you've joined.</p>
           </div>
           <Link href="/sessions">
              <Button className="rounded-xl font-bold bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:text-blue-600 shadow-sm">
                 <Search className="h-4 w-4 mr-2" />
                 Find Sessions
              </Button>
           </Link>
        </div>

        {registrations.length === 0 ? (
           <div className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-gray-100">
               <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-purple-400" />
               </div>
               <h2 className="text-xl font-bold text-gray-900 mb-2">No registered sessions</h2>
               <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">Join diverse workshops and masterclasses hosted by expert consultants.</p>
               <Link href="/sessions">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl px-8 h-12 shadow-lg shadow-purple-200">
                     Browse Workshops
                  </Button>
               </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((reg) => (
                <Card key={reg.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-[24px] overflow-hidden bg-white group h-full flex flex-col">
                   <div className="relative h-48 bg-gray-900 overflow-hidden shrink-0">
                      {reg.thumbnailUrl ? (
                          <img src={reg.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                      ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900" />
                      )}
                      
                      <div className="absolute top-3 left-3 flex gap-2">
                         <Badge className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm border-none shadow-sm font-bold text-[10px] uppercase tracking-wider">
                            {reg.mode?.toUpperCase()}
                         </Badge>
                         {new Date(reg.workshopDate) > new Date() ? (
                            <Badge className="bg-green-500/90 text-white hover:bg-green-500 backdrop-blur-sm border-none shadow-sm font-bold text-[10px] uppercase tracking-wider">
                                Upcoming
                            </Badge>
                         ) : (
                            <Badge className="bg-gray-500/90 text-white hover:bg-gray-500 backdrop-blur-sm border-none shadow-sm font-bold text-[10px] uppercase tracking-wider">
                                Completed
                            </Badge>
                         )}
                      </div>
                   </div>
                   
                   <CardContent className="p-6 flex flex-col flex-1">
                      <div className="mb-6 flex-1">
                          <h3 className="font-bold text-xl text-gray-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                             {reg.workshopTitle}
                          </h3>
                          
                          <div className="space-y-3">
                             <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                                   <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                   <p className="text-gray-900 font-bold">{new Date(reg.workshopDate).toLocaleDateString()}</p>
                                   <p className="text-xs">{new Date(reg.workshopDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
                                   <Clock className="h-4 w-4" />
                                </div>
                                <span>{reg.duration} minutes</span>
                             </div>

                             <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                <div className="bg-green-50 p-2 rounded-lg text-green-500">
                                   <User className="h-4 w-4" />
                                </div>
                                <span className="truncate">By {reg.consultantName}</span>
                             </div>
                             
                             {reg.location && (
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                    <div className="bg-purple-50 p-2 rounded-lg text-purple-500">
                                        {reg.mode === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                                    </div>
                                    <span className="truncate">{reg.location}</span>
                                </div>
                             )}
                          </div>
                      </div>

                      <Link href={`/sessions/${reg.workshopId}`} className="block w-full mt-auto">
                         <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 h-12 font-bold text-sm">
                            View Details / Join
                         </Button>
                      </Link>
                   </CardContent>
                </Card>
              ))}
           </div>
        )}
      </div>
    </div>
  )
}
