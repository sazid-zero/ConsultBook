"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { Calendar, Clock, User, Search, LogOut, Plus, Star, MessageCircle, X, CalendarX, Settings, Bell } from "lucide-react"
import Link from "next/link"

interface Appointment {
  id: string
  consultantId: string
  consultantName: string
  consultantSpecialty: string
  consultantEmail: string
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  time: string
  duration: number
  status: "upcoming" | "completed" | "cancelled"
  mode: "in-person" | "virtual" | "phone"
  amount: number
  notes?: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  reviewed?: boolean
  reviewedAt?: string
}

interface ReviewData {
  rating: number
  comment: string
}

interface RescheduleData {
  newDate: string
  newTime: string
  reason: string
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

export default function ClientDashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [reviewData, setReviewData] = useState<ReviewData>({ rating: 5, comment: "" })
  const [rescheduleData, setRescheduleData] = useState<RescheduleData>({ newDate: "", newTime: "", reason: "" })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  // Add state for unread messages
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Add function to fetch unread message count
  const fetchUnreadMessages = async () => {
    try {
      const conversationsRef = collection(db, "conversations")
      const q = query(conversationsRef, where("clientId", "==", user?.uid))
      const querySnapshot = await getDocs(q)

      let totalUnread = 0
      querySnapshot.forEach((doc) => {
        const conversation = doc.data()
        totalUnread += conversation.clientUnread || 0
      })

      setUnreadMessages(totalUnread)
    } catch (error) {
      console.error("Error fetching unread messages:", error)
    }
  }

  // Call fetchUnreadMessages in useEffect
  useEffect(() => {
    if (!loading && (!user || userData?.role !== "client")) {
      router.push("/login")
      return
    }

    if (user) {
      fetchAppointments()
      fetchUnreadMessages()
    }
  }, [user, userData, loading, router])

  const fetchAppointments = async () => {
    try {
      const appointmentsRef = collection(db, "appointments")
      const q = query(appointmentsRef, where("clientId", "==", user?.uid))
      const querySnapshot = await getDocs(q)

      const appointmentsList: Appointment[] = []
      querySnapshot.forEach((doc) => {
        appointmentsList.push({ id: doc.id, ...doc.data() } as Appointment)
      })

      // Sort by date in JavaScript instead of Firestore
      appointmentsList.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })

      setAppointments(appointmentsList)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoadingAppointments(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return

    setProcessingAction(true)
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: "client",
      })

      // Add notification for consultant
      await addDoc(collection(db, "notifications"), {
        recipientId: selectedAppointment?.consultantId,
        recipientType: "consultant",
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        message: `${userData?.name} has cancelled the appointment scheduled for ${selectedAppointment?.date} at ${selectedAppointment?.time}`,
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
        rescheduledBy: "client",
        rescheduleReason: rescheduleData.reason,
      })

      // Add notification for consultant
      await addDoc(collection(db, "notifications"), {
        recipientId: selectedAppointment?.consultantId,
        recipientType: "consultant",
        type: "appointment_rescheduled",
        title: "Appointment Rescheduled",
        message: `${userData?.name} has rescheduled the appointment to ${rescheduleData.newDate} at ${rescheduleData.newTime}. Reason: ${rescheduleData.reason}`,
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

  const handleSubmitReview = async () => {
    if (!selectedAppointment || !reviewData.comment.trim()) {
      alert("Please provide a rating and comment!")
      return
    }

    setSubmittingReview(true)
    try {
      // Add review to reviews collection
      await addDoc(collection(db, "reviews"), {
        appointmentId: selectedAppointment.id,
        consultantId: selectedAppointment.consultantId,
        clientId: user!.uid,
        clientName: userData!.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        createdAt: new Date().toISOString(),
      })

      // Update appointment to mark as reviewed
      await updateDoc(doc(db, "appointments", selectedAppointment.id), {
        reviewed: true,
        reviewedAt: new Date().toISOString(),
      })

      // Update local state
      setAppointments(appointments.map((apt) => (apt.id === selectedAppointment.id ? { ...apt, reviewed: true } : apt)))

      alert("Review submitted successfully!")
      setSelectedAppointment(null)
      setReviewData({ rating: 5, comment: "" })
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Error submitting review. Please try again.")
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const upcomingAppointments = appointments.filter((apt) => apt.status === "upcoming")
  const pastAppointments = appointments.filter((apt) => apt.status === "completed")

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Welcome back, {userData?.name}!</p>
            </div>
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
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                  <p className="text-4xl font-bold text-gray-900">{pastAppointments.length}</p>
                  <p className="text-xs text-gray-500 mt-2">consultations done</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Messages</p>
                  <p className="text-4xl font-bold text-gray-900">{unreadMessages}</p>
                  <p className="text-xs text-gray-500 mt-2">unread messages</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Bell className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/book-consultant">
            <Card className="border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 cursor-pointer hover:-translate-y-1 rounded-2xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">Find Consultants</h3>
                    <p className="text-sm text-gray-600">Browse and book experts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/book-consultant">
            <Card className="border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300 cursor-pointer hover:-translate-y-1 rounded-2xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Plus className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-600 transition-colors">Book Appointment</h3>
                    <p className="text-sm text-gray-600">Schedule a consultation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
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
                <p className="text-gray-600 text-sm mt-2 mb-6">Book your first consultation today</p>
                <Link href="/book-consultant">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">Book Consultation</Button>
                </Link>
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
                          <h4 className="font-bold text-gray-900 text-base">{appointment.consultantName}</h4>
                          <p className="text-sm text-blue-600 font-medium">{appointment.consultantSpecialty}</p>
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
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">৳{appointment.amount}</p>
                        <p className="text-xs text-gray-500 font-medium">{appointment.duration} min</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3 text-xs border-gray-300 text-gray-700 hover:bg-white group-hover:border-blue-300 group-hover:text-blue-600"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">Appointment Details</DialogTitle>
                              <DialogDescription>
                                Consultation with {selectedAppointment?.consultantName}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedAppointment && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Consultant</Label>
                                    <p className="text-sm font-semibold text-gray-900">{selectedAppointment.consultantName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Specialty</Label>
                                    <p className="text-sm font-semibold text-gray-900">{selectedAppointment.consultantSpecialty}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Date & Time</Label>
                                    <p className="text-sm font-semibold text-gray-900">{selectedAppointment.date} at {selectedAppointment.time}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Duration</Label>
                                    <p className="text-sm font-semibold text-gray-900">{selectedAppointment.duration} minutes</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Mode</Label>
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{selectedAppointment.mode.replace("-", " ")}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Amount</Label>
                                    <p className="text-sm font-semibold text-gray-900">৳{selectedAppointment.amount}</p>
                                  </div>
                                </div>

                                {selectedAppointment.notes && (
                                  <div>
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Notes</Label>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                  <Badge className="bg-blue-100 text-blue-700 border-none capitalize">{selectedAppointment.status}</Badge>
                                  <Badge variant="outline">{selectedAppointment.paymentStatus}</Badge>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                  <Link href={`/messages?consultantId=${selectedAppointment.consultantId}`} className="flex-1">
                                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Message
                                    </Button>
                                  </Link>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
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
                                            placeholder="Let the consultant know why you're rescheduling..."
                                            rows={3}
                                            className="mt-1.5 border-gray-200 resize-none"
                                          />
                                        </div>
                                        <Button
                                          onClick={() => handleRescheduleAppointment()}
                                          disabled={processingAction}
                                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                          {processingAction ? "Processing..." : "Confirm Reschedule"}
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm" className="w-full bg-red-600 hover:bg-red-700">
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-2xl">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to cancel this appointment? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-gray-300">Keep Appointment</AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() => handleCancelAppointment(selectedAppointment.id)}
                                        >
                                          Cancel Appointment
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultation History */}
        <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-gray-100 py-6">
            <CardTitle className="text-2xl text-gray-900">Consultation History</CardTitle>
            <CardDescription className="text-gray-600 mt-1">Your past consultations</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {pastAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-semibold text-lg">No consultation history yet</p>
                <p className="text-gray-600 text-sm mt-2">Book your first consultation to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="group border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:bg-green-50 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="bg-green-100 p-2.5 rounded-full flex-shrink-0 group-hover:bg-green-200 transition-colors">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 text-base">{appointment.consultantName}</h4>
                          <p className="text-sm text-blue-600 font-medium">{appointment.consultantSpecialty}</p>
                          <span className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {appointment.date} at {appointment.time}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge className="bg-green-100 text-green-700 border-none mb-3">Completed</Badge>
                        {(appointment as any).reviewed ? (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 block w-full text-center text-xs">
                            ✓ Reviewed
                          </Badge>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs border-gray-300 text-gray-700 hover:bg-white group-hover:border-green-300 group-hover:text-green-600"
                                onClick={() => setSelectedAppointment(appointment)}
                              >
                                <Star className="h-3.5 w-3.5 mr-1" />
                                Rate & Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">Rate & Review</DialogTitle>
                                <DialogDescription>
                                  Share your experience with {selectedAppointment?.consultantName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div>
                                  <Label className="font-semibold text-gray-900 mb-3 block">Your Rating</Label>
                                  <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                                        className={`p-1.5 transition-transform hover:scale-110 ${
                                          star <= reviewData.rating ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                      >
                                        <Star className="h-7 w-7 fill-current" />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="comment" className="font-semibold text-gray-900 mb-2 block">Your Review</Label>
                                  <Textarea
                                    id="comment"
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    placeholder="Tell others about your experience..."
                                    rows={4}
                                    className="border-gray-200 resize-none focus-visible:ring-blue-500"
                                  />
                                </div>

                                <Button 
                                  onClick={handleSubmitReview} 
                                  disabled={submittingReview} 
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
                                >
                                  {submittingReview ? "Submitting..." : "Submit Review"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
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

