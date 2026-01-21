"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getConsultants } from "@/app/actions/consultants"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search, 
  MapPin, 
  DollarSign, 
  Star,
  MessageCircle,
  Grid3x3,
  List,
  SlidersHorizontal,
  X,
  Video,
  Phone,
  Users as UsersIcon,
  Clock,
  Award,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  profilePhoto?: string | null
  isPublished: boolean
  rating?: number
  reviewCount?: number
  appointmentCount?: number
}

export default function BookConsultantPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([])
  const [filteredConsultants, setFilteredConsultants] = useState<ConsultantProfile[]>([])
  const [loadingConsultants, setLoadingConsultants] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')

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
  }, [consultants, searchTerm, selectedSpecialty, selectedCity, maxRate, selectedMode, sortBy])

  // Scroll to top on mount to fix navigation scroll issue
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const fetchConsultants = async () => {
    try {
      const data = await getConsultants()
      setConsultants(data as any[])
    } catch (error) {
      console.error("Error fetching consultants:", error)
    } finally {
      setLoadingConsultants(false)
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

    // Sorting
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.hourlyRate - b.hourlyRate)
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.hourlyRate - a.hourlyRate)
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0))
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

  const activeFilterCount = [
    searchTerm,
    selectedSpecialty !== "all",
    selectedCity !== "all",
    maxRate,
    selectedMode !== "all"
  ].filter(Boolean).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Consultants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header with Filters */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Row */}
          <div className="py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Find Your Expert</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredConsultants.length} {filteredConsultants.length === 1 ? 'consultant' : 'consultants'} available
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-10 border-gray-200 rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search consultants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-200 rounded-xl bg-gray-50"
                />
              </div>

              {/* Specialty */}
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-[160px] h-10 border-gray-200 rounded-xl bg-gray-50">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location */}
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[140px] h-10 border-gray-200 rounded-xl bg-gray-50">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mode */}
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="w-[140px] h-10 border-gray-200 rounded-xl bg-gray-50">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>

              {/* Max Rate */}
              <div className="relative w-[140px]">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Max rate"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  className="pl-10 h-10 border-gray-200 rounded-xl bg-gray-50"
                />
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-10 px-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl font-semibold"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear ({activeFilterCount})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingConsultants ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConsultants.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No consultants found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <Button onClick={clearFilters} variant="outline" className="rounded-xl">
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredConsultants.map((consultant) => (
              viewMode === 'grid' ? (
                <ConsultantCardGrid key={consultant.consultantId} consultant={consultant} user={user} router={router} />
              ) : (
                <ConsultantCardList key={consultant.consultantId} consultant={consultant} user={user} router={router} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Grid View Card Component
function ConsultantCardGrid({ consultant, user, router }: { consultant: ConsultantProfile, user: any, router: any }) {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-2 ring-gray-100 group-hover:ring-indigo-100 transition-all">
              <AvatarImage src={consultant.profilePhoto || ""} />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-lg">
                {consultant.consultantName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate text-lg">{consultant.consultantName}</h3>
            <p className="text-sm text-indigo-600 font-semibold truncate">{consultant.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg flex-shrink-0">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-900">{consultant.rating ?? 0}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="truncate">{consultant.city}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
          <DollarSign className="h-4 w-4" />
          <span>${consultant.hourlyRate}/hr</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="truncate">{consultant.experience} experience</span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{consultant.bio}</p>

      {/* Modes */}
      <div className="flex flex-wrap gap-2 mb-4">
        {consultant.consultationModes.map((mode) => (
          <Badge key={mode} variant="outline" className="text-xs bg-gray-50 border-gray-200">
            {mode === 'video' && <Video className="h-3 w-3 mr-1" />}
            {mode === 'phone' && <Phone className="h-3 w-3 mr-1" />}
            {mode === 'in-person' && <UsersIcon className="h-3 w-3 mr-1" />}
            {mode}
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={`/consultant/${consultant.consultantId}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full rounded-xl font-semibold">
            View Profile
          </Button>
        </Link>
        {user && (
          <Button
            size="sm"
            onClick={() => router.push(`/messages?consultantId=${consultant.consultantId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold px-3"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// List View Card Component
function ConsultantCardList({ consultant, user, router }: { consultant: ConsultantProfile, user: any, router: any }) {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-16 w-16 ring-2 ring-gray-100 group-hover:ring-indigo-100 transition-all">
            <AvatarImage src={consultant.profilePhoto || ""} />
            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-xl">
              {consultant.consultantName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg">{consultant.consultantName}</h3>
              <p className="text-sm text-indigo-600 font-semibold">{consultant.specialty}</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg ml-4">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-gray-900">{consultant.rating ?? 0}</span>
              {consultant.reviewCount && (
                <span className="text-xs text-gray-500">({consultant.reviewCount})</span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-1 mb-3">{consultant.bio}</p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{consultant.city}</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-indigo-600">
              <DollarSign className="h-4 w-4" />
              <span>${consultant.hourlyRate}/hr</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{consultant.experience}</span>
            </div>
            <div className="flex gap-1">
              {consultant.consultationModes.slice(0, 3).map((mode) => (
                <Badge key={mode} variant="outline" className="text-xs bg-gray-50 border-gray-200">
                  {mode}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/messages?consultantId=${consultant.consultantId}`)}
              className="rounded-xl font-semibold"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          )}
          <Link href={`/consultant/${consultant.consultantId}`}>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold px-6">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
