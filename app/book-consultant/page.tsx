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
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  User, 
  Filter,
  Star,
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


  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [maxRate, setMaxRate] = useState("")
  const [selectedMode, setSelectedMode] = useState("all")

  useEffect(() => {
    if (!loading) {
      fetchConsultants()
    }
  }, [loading])

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
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Expert Consultant</h1>
          <p className="text-lg text-gray-600">Browse and connect with experienced professionals across various fields</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            <Card className="border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <Filter className="h-4 w-4 text-blue-600" />
                    Filters
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                  >
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Name, specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 border-gray-200 text-sm focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialty</Label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="h-9 border-gray-200 text-sm">
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
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="h-9 border-gray-200 text-sm">
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
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Rate (৳/hr)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="Any"
                      value={maxRate}
                      onChange={(e) => setMaxRate(e.target.value)}
                      className="pl-9 h-9 border-gray-200 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Mode</Label>
                  <Select value={selectedMode} onValueChange={setSelectedMode}>
                    <SelectTrigger className="h-9 border-gray-200 text-sm">
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

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Browse Consultants</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {loadingConsultants ? "Loading professionals..." : `Showing ${filteredConsultants.length} expert${filteredConsultants.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {loadingConsultants ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-64 animate-pulse bg-gray-100 border-gray-200" />
                ))}
              </div>
            ) : filteredConsultants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-white p-4 rounded-full mb-4 border border-gray-200">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No consultants found</h3>
                <p className="text-gray-500 max-w-xs text-center mt-2 text-sm">
                  Try adjusting your filters or search for something else.
                </p>
                <Button onClick={clearFilters} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredConsultants.map((consultant) => (
                  <Card 
                    key={consultant.consultantId} 
                    className="group overflow-hidden bg-white border border-gray-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-2xl"
                  >
                    <CardContent className="p-6">
                      {/* Header with avatar and name */}
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-14 w-14 border-2 border-gray-100 flex-shrink-0">
                          <AvatarImage src={consultant.profilePhoto} className="object-cover" />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-base font-bold uppercase">
                            {consultant.consultantName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                            {consultant.consultantName}
                          </h3>
                          <p className="text-sm font-semibold text-blue-600 truncate">{consultant.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className={`h-4 w-4 ${consultant.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            <span className="text-sm font-semibold text-gray-900">{consultant.rating || 'N/A'}</span>
                            <span className="text-xs text-gray-500">({consultant.reviewCount || 0})</span>
                          </div>
                        </div>
                      </div>

                      {/* Location and rate */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {consultant.city}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">৳{consultant.hourlyRate}</p>
                          <p className="text-xs text-gray-500 font-medium">per hour</p>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed h-10">
                        {consultant.bio}
                      </p>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-none font-medium text-xs px-2 py-1">
                          <Clock className="h-3 w-3 mr-1 inline" /> {consultant.experience}
                        </Badge>
                        {consultant.consultationModes.slice(0, 2).map((mode) => (
                          <Badge key={mode} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs px-2 py-1 font-medium capitalize">
                            {mode.replace("-", " ")}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    {/* Action buttons */}
                    <CardFooter className="p-6 pt-0 flex gap-3">
                      <Link href={`/consultant/${consultant.consultantId}/profile`} className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm h-10"
                        >
                          View Profile
                        </Button>
                      </Link>
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


    </div>
  )
}
