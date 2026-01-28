"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getConsultantBookingData, createAppointment } from "@/app/actions/booking"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft, User, MapPin, DollarSign, Clock, CreditCard, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { createPaymentIntent } from "@/app/actions/payments"
import StripePaymentForm from "@/components/payments/StripePaymentForm"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ConsultantProfile {
  consultantId: string
  consultantName: string
  consultantEmail: string
  specialty: string
  bio: string
  hourlyRate: number
  city: string
  experience: string
  languages: string[]
  consultationModes: string[]
  profilePhoto?: string
}

interface BookingData {
  date: string
  time: string
  duration: number
  mode: string
  notes: string
  paymentMethod: string
}

type ScheduleData = Record<string, string[]>

export default function BookAppointmentPage({ params }: { params: { consultantId: string } }) {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null)
  const [consultantSchedule, setConsultantSchedule] = useState<ScheduleData>({})
  const [loadingConsultant, setLoadingConsultant] = useState(true)
  const [consultantId, setConsultantId] = useState<string>("")
  const [booking, setBooking] = useState<BookingData>({
    date: "",
    time: "",
    duration: 60,
    mode: "",
    notes: "",
    paymentMethod: "",
  })
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await Promise.resolve(params)
      setConsultantId(resolvedParams.consultantId)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/book-appointment/${consultantId}`)
      return
    }

    if (consultantId && user) {
      loadBookingData()
    }
  }, [user, authLoading, consultantId, router])

  const loadBookingData = async () => {
    try {
      setLoadingConsultant(true)
      const data = await getConsultantBookingData(consultantId)
      
      if (!data) {
        toast.error("Consultant not found")
        router.push("/book-consultant")
        return
      }

      setConsultant({
        consultantId: data.consultant.id,
        consultantName: data.consultant.name,
        consultantEmail: data.consultant.email,
        specialty: data.consultant.specializations?.[0] || "",
        bio: data.consultant.bio,
        hourlyRate: data.consultant.hourlyRate,
        city: data.consultant.city || "",
        experience: data.consultant.experience || "",
        languages: data.consultant.languages || [],
        consultationModes: data.consultant.consultationModes || ["video", "audio"],
        profilePhoto: data.consultant.profilePhoto || undefined,
      })
      
      setConsultantSchedule(data.availability)
      const slots = data.bookedAppointments.map((a: any) => `${a.date}_${a.time}`)
      setBookedSlots(slots)
      
    } catch (error) {
      console.error("Error loading booking data:", error)
    } finally {
      setLoadingConsultant(false)
    }
  }

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[date.getDay()]
  }

  const generateTimeSlots = () => {
    if (!booking.date) return []
    const dayName = getDayName(booking.date)
    const availableSlots = consultantSchedule[dayName]
    if (!availableSlots) return []
    return availableSlots.map((time) => {
      const slotKey = `${booking.date}_${time}`
      const isBooked = bookedSlots.includes(slotKey)
      return { time, isBooked }
    })
  }

  const calculateTotal = () => {
    if (!consultant) return 0
    return (consultant.hourlyRate * booking.duration) / 60
  }

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()
  const formatDateString = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  const isDateDisabled = (year: number, month: number, day: number) => {
    const dateString = formatDateString(year, month, day)
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isDateBooked = (year: number, month: number, day: number) => {
    const dateString = formatDateString(year, month, day)
    const dayName = getDayName(dateString)
    return !consultantSchedule[dayName]
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) days.push(day)
    return days
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handleSelectDate = (day: number) => {
    if (isDateDisabled(selectedYear, selectedMonth, day) || isDateBooked(selectedYear, selectedMonth, day)) return
    const dateString = formatDateString(selectedYear, selectedMonth, day)
    setBooking({ ...booking, date: dateString, time: "" })
  }

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1)
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1)
  }

  useEffect(() => {
    if (booking.paymentMethod === 'card' && consultant && !clientSecret) {
      const fetchSecret = async () => {
        const res = await createPaymentIntent([{ id: consultantId, type: 'appointment', duration: booking.duration }])
        if (res.success && res.clientSecret) setClientSecret(res.clientSecret)
        else toast.error("Could not initialize Stripe: " + res.error)
      }
      fetchSecret()
    } else if (booking.paymentMethod !== 'card') {
      setClientSecret(null)
    }
  }, [booking.paymentMethod, booking.duration, consultant, consultantId, clientSecret])

  const handleSubmitBooking = async () => {
    if (!booking.date || !booking.time || !booking.mode || !booking.paymentMethod) {
      toast.error("Please fill in all required fields!")
      return
    }

    const dayName = getDayName(booking.date)
    const availableSlots = consultantSchedule[dayName]
    if (!availableSlots || !availableSlots.includes(booking.time)) {
      toast.error("This slot is no longer available.")
      return
    }

    const slotKey = `${booking.date}_${booking.time}`
    if (bookedSlots.includes(slotKey)) {
      toast.error("This slot is already booked.")
      return
    }

    setSubmitting(true)
    try {
      const result = await createAppointment({
        clientId: user!.uid,
        consultantId,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        mode: booking.mode,
        amount: calculateTotal(),
        notes: booking.notes,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentMethod === 'card' ? 'completed' : 'pending',
      })
      if (!result.success) throw new Error(result.error)
      toast.success("Appointment booked successfully!")
      router.push(userData?.role === "consultant" ? "/dashboard/consultant" : "/dashboard/client")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to book appointment.")
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !user || loadingConsultant || !consultantId) return <div className="flex items-center justify-center min-h-screen bg-gray-50/50 flex-col gap-4">
    <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Securing session...</p>
  </div>
  
  if (!consultant) return <div className="flex items-center justify-center min-h-screen">Consultant not found</div>

  const timeSlots = booking.date ? generateTimeSlots() : []
  const selectedDayName = booking.date ? getDayName(booking.date) : ""
  const isDayAvailable = selectedDayName ? !!consultantSchedule[selectedDayName] : false

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/book-consultant" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-xs mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Consultants
          </Link>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Book Your Consultation</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-6">
                <CardTitle className="text-2xl text-gray-900">Schedule Details</CardTitle>
                <CardDescription className="text-gray-600 mt-1">Select your preferred date, time, and duration</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Select Date & Time
                  </Label>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button onClick={handlePreviousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="h-5 w-5 text-gray-600" /></button>
                      <div className="text-center min-w-[200px]"><h3 className="text-lg font-bold text-gray-900">{monthNames[selectedMonth]} {selectedYear}</h3></div>
                      <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="h-5 w-5 text-gray-600" /></button>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="grid grid-cols-7 gap-2 mb-4">{dayOfWeekNames.map(day => (<div key={day} className="text-center font-semibold text-gray-500 text-xs h-8 flex items-center justify-center">{day}</div>))}</div>
                    <div className="grid grid-cols-7 gap-2">{generateCalendarDays().map((day, index) => {
                      const isDisabled = day === null || isDateDisabled(selectedYear, selectedMonth, day) || isDateBooked(selectedYear, selectedMonth, day)
                      const isSelected = day ? booking.date === formatDateString(selectedYear, selectedMonth, day) : false
                      return (
                        <button key={index} onClick={() => day && handleSelectDate(day)} disabled={isDisabled} className={`h-10 rounded-lg font-semibold text-sm transition-all ${!day ? "bg-transparent cursor-default" : isDisabled ? "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200" : isSelected ? "bg-blue-600 text-white border border-blue-600 shadow-md" : "bg-white text-gray-900 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"}`}>{day}</button>
                      )
                    })}</div>
                  </div>
                </div>

                {booking.date && isDayAvailable && (
                  <div className="space-y-3 border-t pt-6">
                    <Label className="font-semibold text-gray-900 flex items-center gap-2"><Clock className="h-4 w-4 text-blue-600" />Select Time</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-4 border border-gray-200 rounded-2xl bg-gray-50">
                      {timeSlots.map(({ time, isBooked }) => (
                        <Button key={time} variant={booking.time === time ? "default" : "outline"} size="sm" disabled={isBooked} onClick={() => setBooking({ ...booking, time })} className={`h-10 font-medium text-sm transition-all rounded-lg ${isBooked ? "bg-red-100 text-red-400 border-red-200" : booking.time === time ? "bg-blue-600 text-white" : ""}`}>{time}</Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Duration</Label>
                  <Select value={booking.duration.toString()} onValueChange={v => setBooking({ ...booking, duration: parseInt(v) })}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="30">30 min</SelectItem><SelectItem value="60">1 hour</SelectItem></SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Consultation Mode</Label>
                  <Select value={booking.mode} onValueChange={v => setBooking({ ...booking, mode: v })}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Mode" /></SelectTrigger>
                    <SelectContent>{consultant.consultationModes.map(m => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Payment Method</Label>
                  <Select value={booking.paymentMethod} onValueChange={v => setBooking({ ...booking, paymentMethod: v })}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Method" /></SelectTrigger>
                    <SelectContent><SelectItem value="bkash">bKash</SelectItem><SelectItem value="card">Card</SelectItem></SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    {consultant.profilePhoto ? <img src={consultant.profilePhoto} className="w-full h-full rounded-full object-cover" /> : <User className="h-8 w-8 text-blue-600" />}
                  </div>
                  <h3 className="font-bold text-lg">{consultant.consultantName}</h3>
                  <p className="text-blue-600 text-sm font-semibold">{consultant.specialty}</p>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                   <div className="flex justify-between"><span>Rate:</span><span className="font-bold text-gray-900">৳{consultant.hourlyRate}/hr</span></div>
                   <div className="flex justify-between"><span>Total:</span><span className="font-bold text-blue-600 text-xl">৳{calculateTotal()}</span></div>
                </div>

                {booking.paymentMethod === 'card' && clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm amount={calculateTotal()} onSuccess={async () => { await handleSubmitBooking() }} isLoading={submitting} />
                  </Elements>
                ) : (
                  <Button onClick={handleSubmitBooking} disabled={submitting || !isDayAvailable} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                    {submitting ? "Processing..." : "Confirm Booking"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
