"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Settings } from "lucide-react"

interface WorkshopRegistrationActionsProps {
  workshop: {
    id: string
    consultantId: string
    isFull: boolean
  }
}

export function WorkshopRegistrationActions({ workshop }: WorkshopRegistrationActionsProps) {
  const { user } = useAuth()
  const isHost = user?.uid === workshop.consultantId

  return (
    <div className="space-y-4">
      {isHost && (
        <div className="space-y-2">
          <Link href="/dashboard/consultant/sessions" className="w-full">
            <Button className="w-full h-16 bg-gray-900 hover:bg-gray-800 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Settings className="mr-2 h-6 w-6" />
              Manage Workshop
            </Button>
          </Link>
          <p className="text-center text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
            You are hosting this session
          </p>
        </div>
      )}
      <Link href={`/checkout?workshopId=${workshop.id}`} className="w-full">
        <Button 
          className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:grayscale disabled:opacity-50"
          disabled={workshop.isFull}
        >
          {workshop.isFull ? "Workshop Full" : "Book Spot Now"}
        </Button>
      </Link>
    </div>
  )
}
