"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getConsultantSchedule, updateConsultantSchedule, type ScheduleData } from "@/app/actions/schedule"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft, Clock, Save, Loader2, CheckCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
]

export default function ConsultantSchedulePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [schedule, setSchedule] = useState<ScheduleData>({})
  const [saving, setSaving] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "consultant")) {
      router.push("/login")
      return
    }

    if (!loading && userData?.role === "consultant" && !userData?.approved) {
      router.push("/consultant-pending")
      return
    }

    if (user) {
      fetchSchedule()
    }
  }, [user, userData, loading, router])

  const fetchSchedule = async () => {
    try {
      const result = await getConsultantSchedule(user!.uid)
      if (result.success && result.data) {
        setSchedule(result.data)
      }
    } catch (error) {
      console.error("Error fetching schedule:", error)
    }
  }

  const handleSaveSchedule = async () => {
    if (!user) return

    setSaving(true)
    try {
      const result = await updateConsultantSchedule(user.uid, schedule)
      if (result.success) {
        setShowSuccessDialog(true)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error saving schedule:", error)
      alert("Failed to save schedule. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: !schedule[day]?.enabled,
      },
    })
  }

  const toggleTimeSlot = (day: string, timeSlot: string) => {
    const currentSlots = schedule[day]?.timeSlots || []
    const newSlots = currentSlots.includes(timeSlot)
      ? currentSlots.filter((slot) => slot !== timeSlot)
      : [...currentSlots, timeSlot].sort()

    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: schedule[day]?.enabled ?? true,
        timeSlots: newSlots,
      },
    })
  }

  const selectAllSlots = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: true,
        timeSlots: [...TIME_SLOTS],
      },
    })
  }

  const clearAllSlots = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        timeSlots: [],
      },
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Schedule</h1>
            <p className="text-gray-600">Set your availability for each day of the week</p>
          </div>
          <Button onClick={handleSaveSchedule} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Schedule
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {DAYS.map((day) => (
            <Card key={day}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Switch checked={schedule[day]?.enabled ?? true} onCheckedChange={() => toggleDay(day)} />
                    <CardTitle className="capitalize">{day}</CardTitle>
                    {schedule[day]?.timeSlots?.length > 0 && (
                      <Badge variant="secondary">{schedule[day].timeSlots.length} slots available</Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllSlots(day)}
                      disabled={!schedule[day]?.enabled}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearAllSlots(day)}
                      disabled={!schedule[day]?.enabled}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {schedule[day]?.enabled ? "Select available time slots for this day" : "This day is disabled"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {schedule[day]?.enabled ? (
                  <div className="grid grid-cols-6 gap-2">
                    {TIME_SLOTS.map((timeSlot) => {
                      const isSelected = schedule[day]?.timeSlots?.includes(timeSlot) ?? false
                      return (
                        <Button
                          key={timeSlot}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTimeSlot(day, timeSlot)}
                          className="text-xs"
                        >
                          {timeSlot}
                        </Button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Day is disabled. Enable to set time slots.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Schedule Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Time slots are shown in 30-minute intervals</li>
            <li>• Disabled days won't show up for client booking</li>
            <li>• Changes are reflected immediately for new bookings</li>
            <li>• Existing appointments won't be affected by schedule changes</li>
          </ul>
        </div>
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader className="flex flex-col items-center justify-center text-center space-y-4 pt-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold">Schedule Saved!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-500">
              Your weekly availability has been successfully updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center p-4">
            <AlertDialogAction 
              onClick={() => setShowSuccessDialog(false)}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 min-w-[120px]"
            >
              Okay
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

