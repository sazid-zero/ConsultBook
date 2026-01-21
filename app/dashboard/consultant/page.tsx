"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { getConsultantDashboardDataWithDetails, toggleAvailability } from "@/app/actions/dashboard"
import { cancelAppointment, rescheduleAppointment } from "@/app/actions/appointments"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { checkAppointmentAlerts } from "@/app/actions/alerts"
import { markNotificationAsRead, markAllAsRead } from "@/app/actions/notifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, User, Settings, LogOut, DollarSign, MessageCircle, Bell, CalendarX, X, Plus, Video } from "lucide-react"
import Link from "next/link"

interface Appointment {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  date: string
  time: string
  status: "upcoming" | "completed" | "cancelled"
  mode: "in-person" | "virtual" | "phone"
  amount: number
  notes?: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  appointmentId?: string
  createdAt: string
  read: boolean
}

interface RescheduleData {
  newDate: string
  newTime: string
  reason: string
}

export default function ConsultantDashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [isAvailable, setIsAvailable] = useState(true)
  const [processingAction, setProcessingAction] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [rescheduleData, setRescheduleData] = useState<RescheduleData>({ newDate: "", newTime: "", reason: "" })
  const [logoutOpen, setLogoutOpen] = useState(false)
  // Add state for unread messages
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [upcomingSchedule, setUpcomingSchedule] = useState<any[]>([])
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<{id: string, apt: Appointment} | null>(null)

  // Add function to fetch unread message count
  const fetchUnreadMessages = async () => {
    try {
      const { getTotalUnreadMessages } = await import("@/app/actions/messages")
      const result = await getTotalUnreadMessages(user!.uid)
      if (result.success) {
        setUnreadMessages(result.count)
      }
    } catch (error) {
      console.error("Error fetching unread messages:", error)
    }
  }

  useEffect(() => {
    // Debug logging
    console.log("[Dashboard] Auth Check:", { loading, user: user?.uid, role: userData?.role, approved: userData?.approved })

    if (!loading) {
      if (!user) {
        console.log("[Dashboard] Redirecting to login (No User)")
        router.push("/login")
        return
      }
      
      if (userData?.role !== "consultant") {
        console.log("[Dashboard] Redirecting to login (Role mismatch):", userData?.role)
        // If userData is missing but user exists, it might be a fetch failure. 
        // We'll show a loading state or redirect.
        if (!userData) {
           // Allow a moment for data to load if it's lagging? 
           // But 'loading' is false meant data fetch attempted.
        }
        router.push("/login")
        return
      }

      if (!userData?.approved) {
        console.log("[Dashboard] Redirecting to pending")
        router.push("/consultant-pending")
        return
      }
    }

    // Call fetchUnreadMessages in useEffect
    if (user) {
      loadDashboardData()
      fetchUnreadMessages()
    }
  }, [user, loading, router])

  const loadDashboardData = async () => {
    try {
      setLoadingAppointments(true)
      const data = await getConsultantDashboardDataWithDetails(user!.uid)
      if (data) {
        setAppointments(data.appointments as any)
        setUpcomingSchedule(data.upcomingSchedule || [])
        setIsAvailable(data.isAvailable)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoadingAppointments(false)
    }
  }


  const handleAvailabilityToggle = async (available: boolean) => {
    try {
      if (user) {
        const result = await toggleAvailability(user.uid, available)
        if (result.success) {
           setIsAvailable(available)
        } else {
           throw new Error(result.error)
        }
      }
    } catch (error) {
      console.error("Error updating availability:", error)
      toast.error(`Error updating availability: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return

    setProcessingAction(true)
    try {
      const result = await cancelAppointment(appointmentToCancel.id, "consultant")
      if (!result.success) throw new Error(result.error)

      // Notifications omitted for V1 update

      // Update local state
      setAppointments(
        appointments.map((apt) => (apt.id === appointmentToCancel.id ? { ...apt, status: "cancelled" as const } : apt)),
      )

      toast.success("Appointment cancelled successfully!")
      setSelectedAppointment(null)
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast.error("Error cancelling appointment. Please try again.")
    } finally {
      setProcessingAction(false)
      setCancelDialogOpen(false)
      setAppointmentToCancel(null)
    }
  }

  const handleCancelTrigger = (id: string, apt: Appointment) => {
    setAppointmentToCancel({ id, apt })
    setCancelDialogOpen(true)
  }

  const handleRescheduleAppointment = async () => {
    if (!rescheduleData.newDate || !rescheduleData.newTime || !rescheduleData.reason.trim()) {
      toast.error("Please fill in all fields!")
      return
    }

    setProcessingAction(true)
    try {
      const result = await rescheduleAppointment(selectedAppointment!.id, rescheduleData.newDate, rescheduleData.newTime, rescheduleData.reason, "consultant")
      if (!result.success) throw new Error(result.error)

      // Notifications omitted

      // Update local state
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment!.id
            ? { ...apt, date: rescheduleData.newDate, time: rescheduleData.newTime }
            : apt,
        ),
      )

      toast.success("Appointment rescheduled successfully!")
      setSelectedAppointment(null)
      setRescheduleData({ newDate: "", newTime: "", reason: "" })
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      toast.error("Error rescheduling appointment. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const upcomingAppointments = appointments.filter((apt) => apt.status === "upcoming")
  const completedAppointments = appointments.filter((apt) => apt.status === "completed")
  const totalEarnings = stats?.totalEarnings || completedAppointments.reduce((sum, apt) => sum + apt.amount, 0)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

   const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Consultant Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Welcome back, {userData?.name}!</p>
            </div>
            <div className="flex items-center gap-4">
             <Link href={`/consultant/${user?.uid}/profile`}>
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 h-10 px-4 rounded-xl"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>

              <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 h-10 px-4 rounded-xl"
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be signed out of your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex justify-end gap-3 pt-4">
                    <AlertDialogCancel className="rounded-xl border-gray-200">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 rounded-xl px-6">Logout</AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Upcoming</p>
                  <p className="text-4xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                  <p className="text-xs text-gray-500 mt-2">appointments scheduled</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Earnings</p>
                  <p className="text-4xl font-bold text-gray-900">৳{totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-2">from all consultations</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                  <p className="text-4xl font-bold text-gray-900">{completedAppointments.length}</p>
                  <p className="text-xs text-gray-500 mt-2">consultations done</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/consultant/profile">
            <Card className="border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 cursor-pointer hover:-translate-y-1 rounded-2xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">Manage Profile</h3>
                    <p className="text-sm text-gray-600">Update your information</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/consultant/schedule">
            <Card className="border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300 cursor-pointer hover:-translate-y-1 rounded-2xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-600 transition-colors">Manage Schedule</h3>
                    <p className="text-sm text-gray-600">Set availability & time slots</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Availability</h3>
                    <p className="text-sm text-gray-600">Currently {isAvailable ? "Available" : "Unavailable"}</p>
                  </div>
                </div>
                <Switch checked={isAvailable} onCheckedChange={handleAvailabilityToggle} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Schedule */}
        <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-6">
            <CardTitle className="text-2xl text-gray-900">Upcoming Schedule</CardTitle>
            <CardDescription className="text-gray-600 mt-1">Your upcoming appointments and workshops</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loadingAppointments ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading schedule...</p>
              </div>
            ) : upcomingSchedule.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-semibold text-lg">No upcoming events</p>
                <p className="text-gray-600 text-sm mt-2 mb-6">You have no upcoming appointments or workshops.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSchedule.map((item: any) => (
                  <div key={`${item.type}-${item.id}`} className="group border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-full flex-shrink-0 transition-colors ${item.type === 'workshop' ? 'bg-orange-100 group-hover:bg-orange-200' : 'bg-blue-100 group-hover:bg-blue-200'}`}>
                          {item.type === 'workshop' ? (
                             <Video className={`h-5 w-5 ${item.type === 'workshop' ? 'text-orange-600' : 'text-blue-600'}`} />
                          ) : (
                             <User className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                          <div className="flex flex-col gap-1">
                             <p className="text-sm text-gray-600 font-medium">{item.subtitle}</p>
                             {item.type === 'appointment' && (
                                <p className="text-xs text-blue-600 font-medium">{item.details.mode}</p>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className={`${item.type === 'workshop' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'} capitalize text-xs`}>
                              {item.type === 'workshop' ? 'Workshop' : 'Appointment'}
                            </Badge>
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {item.displayDate} at {item.displayTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">৳{item.amount}</p>
                        <p className="text-xs text-gray-500 font-medium">{item.type === 'workshop' ? 'per ticket' : 'fee'}</p>
                        
                        {item.type === 'appointment' ? (
                           <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3 text-xs border-gray-300 text-gray-700 hover:bg-white group-hover:border-blue-300 group-hover:text-blue-600"
                              onClick={() => setSelectedAppointment(item.details)}
                            >
                              View Details
                            </Button>
                        ) : (
                          <div className="mt-3 text-right">
                             <Link href={`/dashboard/consultant/sessions`}>
                               <Button variant="outline" size="sm" className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50 group-hover:border-orange-300">
                                 Manage Workshop
                               </Button>
                             </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>


        {/* Recent Consultations */}
        <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-gray-100 py-6">
            <CardTitle className="text-2xl text-gray-900">Recent Consultations</CardTitle>
            <CardDescription className="text-gray-600 mt-1">Your completed sessions</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {completedAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-semibold text-lg">No completed consultations yet</p>
                <p className="text-gray-600 text-sm mt-2">Your completed sessions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedAppointments.slice(0, 10).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900">{appointment.clientName}</h4>
                        <span className="text-sm text-gray-500">
                          {appointment.date} at {appointment.time}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge className="bg-green-100 text-green-700 border-none">Completed</Badge>
                      <p className="text-sm text-gray-600 mt-2 font-semibold">৳{appointment.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Appointment Details</DialogTitle>
            <DialogDescription>
              Consultation with {selectedAppointment?.clientName}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Client</Label>
                  <p className="text-sm font-semibold text-gray-900">{selectedAppointment.clientName}</p>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Email</Label>
                  <p className="text-sm font-semibold text-gray-900">{selectedAppointment.clientEmail}</p>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Date & Time</Label>
                  <p className="text-sm font-semibold text-gray-900">{selectedAppointment.date} at {selectedAppointment.time}</p>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Mode</Label>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedAppointment.mode.replace("-", " ")}</p>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Fee</Label>
                  <p className="text-sm font-semibold text-gray-900">৳{selectedAppointment.amount}</p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Client Notes</Label>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Badge className="bg-blue-100 text-blue-700 border-none capitalize">{selectedAppointment.status}</Badge>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Link href={`/messages?clientId=${selectedAppointment.clientId}`} className="flex-1">
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Client
                  </Button>
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold">
                      <CalendarX className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Reschedule Appointment</DialogTitle>
                      <DialogDescription>Choose a new date and time</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newDate" className="font-semibold">New Date</Label>
                        <Input
                          id="newDate"
                          type="date"
                          value={rescheduleData.newDate}
                          onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                          min={new Date().toISOString().split("T")[0]}
                          className="mt-1.5 border-gray-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newTime" className="font-semibold">New Time</Label>
                        <Input
                          id="newTime"
                          type="time"
                          value={rescheduleData.newTime}
                          onChange={(e) => setRescheduleData({ ...rescheduleData, newTime: e.target.value })}
                          className="mt-1.5 border-gray-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reason" className="font-semibold">Reason for Rescheduling</Label>
                        <Textarea
                          id="reason"
                          value={rescheduleData.reason}
                          onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                          placeholder="Inform the client why you're rescheduling..."
                          rows={3}
                          className="mt-1.5 border-gray-200 resize-none"
                        />
                      </div>
                      <Button
                        onClick={() => handleRescheduleAppointment()}
                        disabled={processingAction}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
                      >
                        {processingAction ? "Processing..." : "Confirm Reschedule"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="destructive" 
                  className="flex-1 bg-red-600 hover:bg-red-700 font-bold"
                  onClick={() => handleCancelTrigger(selectedAppointment.id, selectedAppointment)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the appointment with {appointmentToCancel?.apt?.clientName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel disabled={processingAction}>Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmCancelAppointment();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={processingAction}
            >
              {processingAction ? "Cancelling..." : "Confirm Cancellation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

