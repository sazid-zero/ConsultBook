"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc, updateDoc, addDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
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
import { Calendar, Clock, User, Settings, LogOut, DollarSign, MessageCircle, Bell, CalendarX, X, Plus } from "lucide-react"
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

  // Add function to fetch unread message count
  const fetchUnreadMessages = async () => {
    try {
      const conversationsRef = collection(db, "conversations")
      const q = query(conversationsRef, where("consultantId", "==", user?.uid))
      const querySnapshot = await getDocs(q)

      let totalUnread = 0
      querySnapshot.forEach((doc) => {
        const conversation = doc.data()
        totalUnread += conversation.consultantUnread || 0
      })

      setUnreadMessages(totalUnread)
    } catch (error) {
      console.error("Error fetching unread messages:", error)
    }
  }

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "consultant")) {
      router.push("/login")
      return
    }

    if (!loading && userData?.role === "consultant" && !userData?.approved) {
      router.push("/consultant-pending")
      return
    }

    // Call fetchUnreadMessages in useEffect
    if (user) {
      fetchAppointments()
      fetchUnreadMessages()
    }
  }, [user, userData, loading, router])

  const fetchAppointments = async () => {
    try {
      const appointmentsRef = collection(db, "appointments")
      
      // Fetch appointments where user is the consultant
      const q1 = query(appointmentsRef, where("consultantId", "==", user?.uid))
      const snapshot1 = await getDocs(q1)
      
      // Fetch appointments where user is the client/booker (booked another consultant)
      const q2 = query(appointmentsRef, where("clientId", "==", user?.uid))
      const snapshot2 = await getDocs(q2)

      const appointmentsList: Appointment[] = []
      
      snapshot1.forEach((doc) => {
        appointmentsList.push({ id: doc.id, ...doc.data() } as Appointment)
      })
      
      snapshot2.forEach((doc) => {
        appointmentsList.push({ id: doc.id, ...doc.data() } as Appointment)
      })

      // Remove duplicates (if any)
      const uniqueAppointments = Array.from(new Map(appointmentsList.map(apt => [apt.id, apt])).values())

      // Sort by date in JavaScript instead of Firestore
      uniqueAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })

      setAppointments(uniqueAppointments)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoadingAppointments(false)
    }
  }

  const handleAvailabilityToggle = async (available: boolean) => {
    try {
      if (user) {
        // Use setDoc with merge to update or create the user document
        await setDoc(
          doc(db, "users", user.uid),
          {
            available: available,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
        setIsAvailable(available)
      }
    } catch (error) {
      console.error("Error updating availability:", error)
      alert(`Error updating availability: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleCancelAppointment = async (appointmentId: string, appointment: Appointment) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return

    setProcessingAction(true)
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: "consultant",
      })

      // Add notification for client
      await addDoc(collection(db, "notifications"), {
        recipientId: appointment.clientId,
        recipientType: "client",
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        message: `  ${userData?.name} has cancelled your appointment scheduled for ${appointment.date} at ${appointment.time}`,
        appointmentId: appointmentId,
        createdAt: new Date().toISOString(),
        read: false,
      })

      // Update local state
      setAppointments(
        appointments.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" as const } : apt)),
      )

      alert("Appointment cancelled successfully!")
      setSelectedAppointment(null)
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      alert("Error cancelling appointment. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleRescheduleAppointment = async () => {
    if (!rescheduleData.newDate || !rescheduleData.newTime || !rescheduleData.reason.trim()) {
      alert("Please fill in all fields!")
      return
    }

    setProcessingAction(true)
    try {
      await updateDoc(doc(db, "appointments", selectedAppointment!.id), {
        date: rescheduleData.newDate,
        time: rescheduleData.newTime,
        rescheduledAt: new Date().toISOString(),
        rescheduledBy: "consultant",
        rescheduleReason: rescheduleData.reason,
      })

      // Add notification for client
      await addDoc(collection(db, "notifications"), {
        recipientId: selectedAppointment!.clientId,
        recipientType: "client",
        type: "appointment_rescheduled",
        title: "Appointment Rescheduled",
        message: `  ${userData?.name} has rescheduled your appointment to ${rescheduleData.newDate} at ${rescheduleData.newTime}. Reason: ${rescheduleData.reason}`,
        appointmentId: selectedAppointment!.id,
        createdAt: new Date().toISOString(),
        read: false,
      })

      // Update local state
      setAppointments(
        appointments.map((apt) =>
          apt.id === selectedAppointment!.id
            ? { ...apt, date: rescheduleData.newDate, time: rescheduleData.newTime }
            : apt,
        ),
      )

      alert("Appointment rescheduled successfully!")
      setSelectedAppointment(null)
      setRescheduleData({ newDate: "", newTime: "", reason: "" })
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      alert("Error rescheduling appointment. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const upcomingAppointments = appointments.filter((apt) => apt.status === "upcoming")
  const completedAppointments = appointments.filter((apt) => apt.status === "completed")
  const totalEarnings = completedAppointments.reduce((sum, apt) => sum + apt.amount, 0)

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
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setLogoutOpen(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be signed out of your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-end gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">Logout</AlertDialogAction>
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

        {/* Upcoming Appointments */}
        <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-6">
            <CardTitle className="text-2xl text-gray-900">Upcoming Appointments</CardTitle>
            <CardDescription className="text-gray-600 mt-1">Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loadingAppointments ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-semibold text-lg">No upcoming appointments</p>
                <p className="text-gray-600 text-sm mt-2">Your schedule is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="group border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="bg-blue-100 p-2.5 rounded-full flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 text-base">{appointment.clientName}</h4>
                          <p className="text-sm text-gray-600">{appointment.clientEmail}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize text-xs">
                              {appointment.mode.replace("-", " ")}
                            </Badge>
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {appointment.date} at {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-3">
                        <div>
                          <p className="text-lg font-bold text-gray-900">৳{appointment.amount}</p>
                          <p className="text-xs text-gray-500 font-medium">consultation</p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/messages?clientId=${appointment.clientId}`}>
                            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-white text-xs">
                              <MessageCircle className="h-3.5 w-3.5 mr-1" />
                              Message
                            </Button>
                          </Link>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-700 hover:bg-white text-xs"
                                onClick={() => setSelectedAppointment(appointment)}
                                disabled={processingAction}
                              >
                                <CalendarX className="h-3.5 w-3.5 mr-1" />
                                Reschedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl">
                              <DialogHeader>
                                <DialogTitle>Reschedule Appointment</DialogTitle>
                                <DialogDescription>
                                  Choose a new date and time for the appointment with {selectedAppointment?.clientName}
                                </DialogDescription>
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
                                    placeholder="Please provide a reason..."
                                    rows={3}
                                    className="mt-1.5 border-gray-200 resize-none"
                                  />
                                </div>
                                <Button
                                  onClick={handleRescheduleAppointment}
                                  disabled={processingAction}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
                                >
                                  {processingAction ? "Rescheduling..." : "Reschedule Appointment"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id, appointment)}
                            disabled={processingAction}
                            className="text-xs"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                        </div>
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
    </div>
  )
}

