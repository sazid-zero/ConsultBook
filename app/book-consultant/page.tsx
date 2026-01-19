"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  User, 
  Star, 
  ArrowLeft, 
  Filter, 
  MessageSquare,
  CalendarCheck,
} from "lucide-react"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar/Navbar"

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
  published: boolean
  rating?: number
  reviewCount?: number
  appointmentCount?: number
}

interface Review {
  id: string
  clientName: string
  rating: number
  comment: string
  createdAt: string
}

export default function BookConsultantPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([])
  const [filteredConsultants, setFilteredConsultants] = useState<ConsultantProfile[]>([])
  const [loadingConsultants, setLoadingConsultants] = useState(true)
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantProfile | null>(null)
  const [consultantReviews, setConsultantReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [maxRate, setMaxRate] = useState("")
  const [selectedMode, setSelectedMode] = useState("all")

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "client")) {
      router.push("/login")
      return
    }

    if (user) {
      fetchConsultants()
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    filterConsultants()
  }, [consultants, searchTerm, selectedSpecialty, selectedCity, maxRate, selectedMode])

  const fetchConsultants = async () => {
    try {
      const profilesRef = collection(db, "consultantProfiles")
      const q = query(profilesRef, where("published", "==", true))
      const querySnapshot = await getDocs(q)

      const consultantsList: ConsultantProfile[] = []

      for (const docSnapshot of querySnapshot.docs) {
        const consultantData = docSnapshot.data() as ConsultantProfile

        const [avgRating, reviewCount, appointmentCount] = await Promise.all([
          getConsultantRating(consultantData.consultantId),
          getReviewCount(consultantData.consultantId),
          getAppointmentCount(consultantData.consultantId),
        ])

        consultantsList.push({
          ...consultantData,
          rating: avgRating,
          reviewCount,
          appointmentCount,
        })
      }

      setConsultants(consultantsList)
    } catch (error) {
      console.error("Error fetching consultants:", error)
    } finally {
      setLoadingConsultants(false)
    }
  }

  const getConsultantRating = async (consultantId: string): Promise<number> => {
    try {
      const reviewsRef = collection(db, "reviews")
      const q = query(reviewsRef, where("consultantId", "==", consultantId))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return 0

      let totalRating = 0
      querySnapshot.forEach((doc) => {
        totalRating += doc.data().rating
      })

      return Math.round((totalRating / querySnapshot.size) * 10) / 10
    } catch (error) {
      console.error("Error fetching rating:", error)
      return 0
    }
  }

  const getReviewCount = async (consultantId: string): Promise<number> => {
    try {
      const reviewsRef = collection(db, "reviews")
      const q = query(reviewsRef, where("consultantId", "==", consultantId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.size
    } catch (error) {
      console.error("Error fetching review count:", error)
      return 0
    }
  }

  const getAppointmentCount = async (consultantId: string): Promise<number> => {
    try {
      const appointmentsRef = collection(db, "appointments")
      const q = query(appointmentsRef, where("consultantId", "==", consultantId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.size
    } catch (error) {
      console.error("Error fetching appointment count:", error)
      return 0
    }
  }

  const fetchConsultantReviews = async (consultantId: string) => {
    setLoadingReviews(true)
    try {
      const reviewsRef = collection(db, "reviews")
      const q = query(reviewsRef, where("consultantId", "==", consultantId))
      const querySnapshot = await getDocs(q)

      const reviewsList: Review[] = []
      querySnapshot.forEach((doc) => {
        reviewsList.push({ id: doc.id, ...doc.data() } as Review)
      })

      reviewsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setConsultantReviews(reviewsList)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoadingReviews(false)
    }
  }

  const filterConsultants = () => {
    let filtered = consultants

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.consultantName.toLowerCase().includes(term) ||
          c.specialty.toLowerCase().includes(term) ||
          c.bio.toLowerCase().includes(term)
      )
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((c) => c.specialty === selectedSpecialty)
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter((c) => c.city.toLowerCase().includes(selectedCity.toLowerCase()))
    }

    if (maxRate) {
      filtered = filtered.filter((c) => c.hourlyRate <= Number.parseInt(maxRate))
    }

    if (selectedMode !== "all") {
      filtered = filtered.filter((c) => c.consultationModes.includes(selectedMode))
    }

    setFilteredConsultants(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedSpecialty("all")
    setSelectedCity("all")
    setMaxRate("")
    setSelectedMode("all")
  }

  const handleViewProfile = async (consultant: ConsultantProfile) => {
    setSelectedConsultant(consultant)
    setIsProfileOpen(true)
    await fetchConsultantReviews(consultant.consultantId)
  }

  const specialties = [...new Set(consultants.map((c) => c.specialty))]
  const cities = [...new Set(consultants.map((c) => c.city))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Consultants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6">
            <Card className="border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <CardHeader className="bg-white border-b border-gray-100 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <Filter className="h-4 w-4 text-blue-600" />
                    Filters
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Name, specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-10 border-gray-200 focus-visible:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialty</Label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {specialties.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Rate (৳/hr)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="Any"
                      value={maxRate}
                      onChange={(e) => setMaxRate(e.target.value)}
                      className="pl-9 h-10 border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mode</Label>
                  <Select value={selectedMode} onValueChange={setSelectedMode}>
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="Any Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Mode</SelectItem>
                      <SelectItem value="in-person">In-person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recommended Professionals</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {loadingConsultants ? "Loading professionals..." : `Showing ${filteredConsultants.length} expert consultants`}
                </p>
              </div>
            </div>

            {loadingConsultants ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-64 animate-pulse bg-white border-gray-100" />
                ))}
              </div>
            ) : filteredConsultants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No consultants found</h3>
                <p className="text-gray-500 max-w-xs text-center mt-2">
                  Try adjusting your filters or searching for something else.
                </p>
                <Button onClick={clearFilters} className="mt-6 bg-blue-600 hover:bg-blue-700">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredConsultants.map((consultant) => (
                  <Card key={consultant.consultantId} className="group hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden bg-white border-gray-200">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white ring-2 ring-gray-50 shadow-sm flex-shrink-0">
                          <AvatarImage src={consultant.profilePhoto} className="object-cover" />
                          <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-bold uppercase">
                            {consultant.consultantName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                Dr. {consultant.consultantName}
                              </h3>
                              <p className="text-sm font-medium text-blue-600">{consultant.specialty}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-900">৳{consultant.hourlyRate}</p>
                              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">per hour</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1">
                              <Star className={`h-4 w-4 ${consultant.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                              <span className="text-sm font-bold text-gray-900">{consultant.rating || 'N/A'}</span>
                              <span className="text-xs text-gray-500">({consultant.reviewCount || 0})</span>
                            </div>
                            <Separator orientation="vertical" className="h-4 bg-gray-200" />
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate">{consultant.city}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none font-medium text-[11px] h-6">
                          <Clock className="h-3 w-3 mr-1" /> {consultant.experience}
                        </Badge>
                        {consultant.consultationModes.slice(0, 2).map((mode) => (
                          <Badge key={mode} variant="outline" className="text-blue-600 border-blue-100 bg-blue-50 text-[11px] h-6 font-medium capitalize">
                            {mode.replace("-", " ")}
                          </Badge>
                        ))}
                      </div>

                      <p className="mt-4 text-sm text-gray-600 line-clamp-2 leading-relaxed h-10">
                        {consultant.bio}
                      </p>
                    </CardContent>
                    <CardFooter className="p-5 pt-0 flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-10 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm"
                        onClick={() => handleViewProfile(consultant)}
                      >
                        View Profile
                      </Button>
                      <Link href={`/book-appointment/${consultant.consultantId}`} className="flex-1">
                        <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm">
                          Book Now
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none gap-0 bg-white">
          <DialogHeader className="sr-only">
            <DialogTitle>Consultant Profile - {selectedConsultant?.consultantName}</DialogTitle>
          </DialogHeader>
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800" />
          <div className="px-6 pb-6">
            <div className="relative -mt-12 flex items-end justify-between gap-4 mb-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-white">
                <AvatarImage src={selectedConsultant?.profilePhoto} className="object-cover" />
                <AvatarFallback className="bg-blue-50 text-blue-600 text-3xl font-bold uppercase">
                  {selectedConsultant?.consultantName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-3 mb-2">
                <Link href={`/book-appointment/${selectedConsultant?.consultantId}`} className="flex-1">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm px-8 h-11">
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dr. {selectedConsultant?.consultantName}</h2>
                  <p className="text-blue-600 font-semibold">{selectedConsultant?.specialty}</p>
                  
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      {selectedConsultant?.rating || '0.0'} 
                      <span className="font-normal text-gray-500">({selectedConsultant?.reviewCount || 0} Reviews)</span>
                    </div>
                    <Separator orientation="vertical" className="h-4 bg-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <CalendarCheck className="h-4 w-4 text-blue-600" />
                      {selectedConsultant?.appointmentCount || 0} Bookings Completed
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Professional Biography
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {selectedConsultant?.bio}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    Patient Feedback
                  </h4>
                  <ScrollArea className="h-64 pr-4">
                    {loadingReviews ? (
                      <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : consultantReviews.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm italic">No reviews available yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {consultantReviews.map((review) => (
                          <div key={review.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-sm font-bold text-gray-900">{review.clientName}</p>
                                <div className="flex gap-0.5 mt-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                <Card className="border-gray-100 shadow-sm bg-[#F8FAFC]">
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><DollarSign className="h-3.5 w-3.5" /> Hourly Rate</span>
                        <span className="font-bold text-gray-900">৳{selectedConsultant?.hourlyRate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Experience</span>
                        <span className="font-bold text-gray-900">{selectedConsultant?.experience}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Location</span>
                        <span className="font-bold text-gray-900">{selectedConsultant?.city}</span>
                      </div>
                    </div>
                    <Separator className="bg-gray-200" />
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Languages</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedConsultant?.languages.map(lang => (
                          <Badge key={lang} variant="secondary" className="bg-white border-gray-200 text-gray-600 text-[10px] px-2 h-5 font-medium">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Availability</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedConsultant?.consultationModes.map(mode => (
                          <Badge key={mode} variant="outline" className="text-blue-600 border-blue-100 bg-blue-50 text-[10px] px-2 h-5 font-bold capitalize">
                            {mode.replace("-", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
