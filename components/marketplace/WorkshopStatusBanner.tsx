"use client"

import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface WorkshopStatusBannerProps {
  workshop: {
    startDate: string | Date
    registrations: any[]
  }
}

export function WorkshopStatusBanner({ workshop }: WorkshopStatusBannerProps) {
  const { user } = useAuth()
  
  const isRegistered = user && workshop.registrations?.some(reg => reg.clientId === user.uid)
  const isCompleted = new Date(workshop.startDate) < new Date()

  if (!isRegistered && !isCompleted) return null

  return (
    <div className="mb-8 space-y-3">
      {isRegistered && (
        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-[24px] text-green-700 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-green-600 p-2 rounded-xl text-white shadow-lg shadow-green-200">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-widest">You're In!</p>
            <p className="text-xs font-bold text-green-600/80">You are registered for this workshop. Check your dashboard for access details.</p>
          </div>
        </div>
      )}
      
      {isCompleted && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-[24px] text-gray-700 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          <div className="bg-gray-400 p-2 rounded-xl text-white shadow-lg shadow-gray-200">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-widest">Session Completed</p>
            <p className="text-xs font-bold text-gray-500">This event has already taken place. Stay tuned for future sessions!</p>
          </div>
        </div>
      )}
    </div>
  )
}
