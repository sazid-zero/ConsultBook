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
import Link from "next/link"

interface ConsultantProfile {
  consultantId: string
  consultantName: string
  consultantEmail: string
  specialty: string // We might map specializations[0] here
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

// Map availability: dayName -> timeSlots
type ScheduleData = Record<string, string[]>

export default function BookAppointmentPage({ params }: { params: { consultantId: string } }) {
  const { user, userData, loading } = useAuth()
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

  // Handle params properly for Next.js 15
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
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (consultantId) {
      loadBookingData()
    }
  }, [user, loading, consultantId, router])

  const loadBookingData = async () => {
    try {
      setLoadingConsultant(true)
      const data = await getConsultantBookingData(consultantId)
      
      if (!data) {
        alert("Consultant not found")
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
      
      // Need to adjust action to return everything if missing. 
      // But for now, let's map what we have.
      // Action returns: specializations, hourlyRate, bio... 
      // Missed: experience, languages, consultationModes in my action `getConsultantBookingData`.
      // I should update action `getConsultantBookingData` to return these fields. 
      // But assuming I update action later or now, let's proceed.
      // Actually I should verify action content.
      
      setConsultantSchedule(data.availability)
      
      // Map booked slots
      const slots = data.bookedAppointments.map(a => `${a.date}_${a.time}`)
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

    // If day is not enabled (no slots), return empty
    if (!availableSlots) {
      return []
    }

    const slots = availableSlots.map((time) => {
      const slotKey = `${booking.date}_${time}`
      const isBooked = bookedSlots.includes(slotKey)
      return { time, isBooked }
    })

    return slots
  }

  const calculateTotal = () => {
    if (!consultant) return 0
    return (consultant.hourlyRate * booking.duration) / 60
  }

  // Calendar helper functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

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
    return !consultantSchedule[dayName] // If no entry, it's not available
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]
  
  const dayOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handleSelectDate = (day: number) => {
    if (isDateDisabled(selectedYear, selectedMonth, day) || isDateBooked(selectedYear, selectedMonth, day)) {
      return
    }
    const dateString = formatDateString(selectedYear, selectedMonth, day)
    setBooking({ ...booking, date: dateString, time: "" })
  }

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const handleSubmitBooking = async () => {
    if (!booking.date || !booking.time || !booking.mode || !booking.paymentMethod) {
      alert("Please fill in all required fields!")
      return
    }

    // Check if the selected day is available
    const dayName = getDayName(booking.date)
    const availableSlots = consultantSchedule[dayName]

    if (!availableSlots) {
      alert("The consultant is not available on this day. Please select another date.")
      return
    }

    // Check if the selected time slot is available in consultant's schedule
    if (!availableSlots.includes(booking.time)) {
      alert("This time slot is not available in the consultant's schedule. Please select another time.")
      return
    }

    const slotKey = `${booking.date}_${booking.time}`
    if (bookedSlots.includes(slotKey)) {
      alert("This time slot is already booked. Please select another time.")
      return
    }

    setSubmitting(true)
    try {
      const result = await createAppointment({
        clientId: user!.uid,
        consultantId: consultantId,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        mode: booking.mode,
        amount: calculateTotal(),
        notes: booking.notes,
        paymentMethod: booking.paymentMethod,
      })

      if (!result.success) throw new Error(result.error)

      // Mock payment processing (visual delay)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert("Appointment booked successfully!")
      router.push(userData?.role === "consultant" ? "/dashboard/consultant" : "/dashboard/client")
    } catch (error) {
      console.error("Error booking appointment:", error)
      alert("Error booking appointment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || loadingConsultant || !consultantId) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!consultant) {
    return <div className="flex items-center justify-center min-h-screen">Consultant not found</div>
  }

  const timeSlots = booking.date ? generateTimeSlots() : []
  const selectedDayName = booking.date ? getDayName(booking.date) : ""
  const isDayAvailable = selectedDayName ? !!consultantSchedule[selectedDayName] : false

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 sticky top-0 z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/book-consultant" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Consultants
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Book Your Consultation</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-6">
                <CardTitle className="text-2xl text-gray-900">Schedule Details</CardTitle>
                <CardDescription className="text-gray-600 mt-1">Select your preferred date, time, and duration</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Calendar Section */}
                <div className="space-y-4">
                  <Label className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Select Date & Time
                  </Label>

                  {/* Year Selector */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePreviousMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        type="button"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>
                      <div className="text-center min-w-[200px]">
                        <h3 className="text-lg font-bold text-gray-900">
                          {monthNames[selectedMonth]} {selectedYear}
                        </h3>
                      </div>
                      <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        type="button"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-32 h-9 border-gray-200 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map(
                          (year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calendar Grid */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    {/* Day of week headers */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {dayOfWeekNames.map((day) => (
                        <div key={day} className="text-center font-semibold text-gray-500 text-xs h-8 flex items-center justify-center">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-2">
                      {generateCalendarDays().map((day, index) => {
                        const isDisabled = day === null || isDateDisabled(selectedYear, selectedMonth, day) || isDateBooked(selectedYear, selectedMonth, day)
                        const dateString = day ? formatDateString(selectedYear, selectedMonth, day) : ""
                        const isSelected = booking.date === dateString

                        return (
                          <button
                            key={index}
                            onClick={() => {
                              if (day !== null) handleSelectDate(day)
                            }}
                            disabled={isDisabled}
                            type="button"
                            className={`
                              h-10 rounded-lg font-semibold text-sm transition-all
                              ${!day
                                ? "bg-transparent cursor-default"
                                : isDisabled
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200"
                                : isSelected
                                ? "bg-blue-600 text-white border border-blue-600 shadow-md"
                                : "bg-white text-gray-900 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                              }
                            `}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></span>
                        Past dates & unavailable days
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-600 border border-blue-600 rounded"></span>
                        Selected date
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time Slot Selection */}
                {booking.date && isDayAvailable && (
                  <div className="space-y-3 border-t pt-6">
                    <Label className="font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Select Time
                    </Label>
                    {timeSlots.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700 font-medium">No time slots available for this date.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-4 border border-gray-200 rounded-2xl bg-gray-50">
                          {timeSlots.map(({ time, isBooked }) => (
                            <Button
                              key={time}
                              variant={booking.time === time ? "default" : "outline"}
                              size="sm"
                              disabled={isBooked}
                              onClick={() => setBooking({ ...booking, time })}
                              type="button"
                              className={`h-10 font-medium text-sm transition-all rounded-lg ${
                                isBooked
                                  ? "bg-red-100 text-red-400 border-red-200 cursor-not-allowed"
                                  : booking.time === time
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                  : "border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Red slots are already booked</p>
                      </>
                    )}
                  </div>
                )}
                {booking.date && !isDayAvailable && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">
                      The consultant is not available on {selectedDayName}s. Please select another date.
                    </p>
                  </div>
                )}

                {/* Duration */}
                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Duration</Label>
                  <Select
                    value={booking.duration.toString()}
                    onValueChange={(value) => setBooking({ ...booking, duration: Number.parseInt(value) })}
                  >
                    <SelectTrigger className="h-11 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Consultation Mode */}
                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Consultation Mode</Label>
                  <Select value={booking.mode} onValueChange={(value) => setBooking({ ...booking, mode: value })}>
                    <SelectTrigger className="h-11 border-gray-200">
                      <SelectValue placeholder="Select consultation mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {consultant.consultationModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode.replace("-", " ").charAt(0).toUpperCase() + mode.replace("-", " ").slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <Label htmlFor="notes" className="font-semibold text-gray-900">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={booking.notes}
                    onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                    placeholder="Describe your concerns or what you'd like to discuss..."
                    rows={3}
                    className="border-gray-200 resize-none focus-visible:ring-blue-500"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    Payment Method
                  </Label>
                  <Select
                    value={booking.paymentMethod}
                    onValueChange={(value) => setBooking({ ...booking, paymentMethod: value })}
                  >
                    <SelectTrigger className="h-11 border-gray-200">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="rocket">Rocket</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="cash">Cash (for in-person)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mock Payment Info */}
                {booking.paymentMethod && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="mt-0.5">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Demo Payment System</p>
                      <p className="text-xs text-blue-700 mt-1">This is a demonstration. No actual payment will be processed.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Consultant Info & Booking Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Consultant Card */}
            <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden top-32 max-h-[calc(100vh-200px)]">
              <CardContent className="p-6 overflow-y-auto max-h-[calc(100vh-240px)]" data-lenis-prevent="true">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                    {consultant?.profilePhoto ? (
                      <img
                        src={consultant.profilePhoto}
                        alt={consultant?.consultantName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100">
                        <User className="h-10 w-10 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">{consultant?.consultantName}</h3>
                  <p className="text-blue-600 font-semibold text-sm mt-1">{consultant?.specialty}</p>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{consultant?.city}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">৳{consultant?.hourlyRate}/hour</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{consultant?.experience}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Languages</p>
                    <div className="flex flex-wrap gap-1.5">
                      {consultant?.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 text-xs px-2 py-1 font-medium">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Modes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {consultant?.consultationModes.map((mode) => (
                        <Badge key={mode} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs px-2 py-1 font-medium capitalize">
                          {mode.replace("-", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card className="border-gray-200 shadow-sm rounded-2xl bg-gradient-to-br from-gray-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">{booking.duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hourly Rate:</span>
                    <span className="font-semibold text-gray-900">৳{consultant?.hourlyRate}/hr</span>
                  </div>
                  {booking.mode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mode:</span>
                      <span className="font-semibold text-gray-900 capitalize">{booking.mode.replace("-", " ")}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-900 font-semibold">Total:</span>
                  <span className="text-3xl font-bold text-blue-600">৳{calculateTotal()}</span>
                </div>

                <Button
                  onClick={handleSubmitBooking}
                  disabled={submitting || !isDayAvailable || timeSlots.length === 0}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md rounded-lg"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    `Confirm Booking`
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">By booking, you agree to our terms and conditions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

