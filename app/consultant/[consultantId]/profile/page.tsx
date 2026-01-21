"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, MapPin, DollarSign, Clock, User, MessageSquare, ArrowLeft, CalendarCheck, Globe, Upload, Trash2, Award, BookOpen, Users, Briefcase, Linkedin, Twitter, ExternalLink, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getPublicConsultantProfile } from "@/app/actions/consultants"
import { updateConsultantImage } from "@/app/actions/profile"
import { getConsultantReviews, updateReview, deleteReview } from "@/app/actions/reviews"
import { getProducts } from "@/app/actions/library"
import { getWorkshops } from "@/app/actions/workshops"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface ConsultantProfile {
  consultantId: string
  consultantName: string
  consultantEmail: string
  specialty: string
  bio: string
  hourlyRate: number
  address: string
  city: string
  state: string
  country: string
  experience: string
  languages: string[]
  consultationModes: string[]
  profilePhoto?: string
  coverPhoto?: string
  published: boolean
  rating?: number
  reviewCount?: number
  appointmentCount?: number
  // New fields
  certifications?: Array<{ name: string; issuer: string; year: number }>
  qualifications?: Array<{ degree: string; university: string; year: number }>
  specializations?: string[]
  portfolioItems?: Array<{ title: string; description: string; imageUrl?: string }>
  socialLinks?: { linkedin?: string; twitter?: string; website?: string; instagram?: string }
  hoursDelivered?: number
  verified?: boolean
}

interface Review {
  id: string
  clientId: string
  clientName: string
  rating: number
  comment: string
  createdAt: string
}
interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  contentType: string;
}
export default function ConsultantPublicProfilePage({ params }: { params: { consultantId: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [consultantId, setConsultantId] = useState<string>("")
  const [isOwner, setIsOwner] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profileHover, setProfileHover] = useState(false)
  const [coverHover, setCoverHover] = useState(false)
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'books' | 'sessions'>('books')
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [editReviewData, setEditReviewData] = useState({ rating: 5, comment: "" })
  const [products, setProducts] = useState<any[]>([])
  const [workshops, setWorkshops] = useState<any[]>([])
  const profileFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

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
    if (user && consultantId) {
      setIsOwner(user.uid === consultantId);
    }
  }, [user, consultantId])

  useEffect(() => {
    if (consultantId) {
      fetchConsultant()
      fetchProducts()
      fetchWorkshops()
    }
  }, [consultantId])

  const fetchProducts = async () => {
    const result = await getProducts({ consultantId, publishedOnly: true })
    console.log('Fetching products for consultant:', consultantId, 'Result:', result)
    if (result.success) {
      setProducts(result.data || [])
      console.log('Products set:', result.data?.length || 0)
    }
  }

  const fetchWorkshops = async () => {
    // Don't filter by upcomingOnly - show all workshops on profile
    const result = await getWorkshops({ consultantId, publishedOnly: true })
    console.log('Fetching workshops for consultant:', consultantId, 'Result:', result)
    if (result.success) {
      setWorkshops(result.data || [])
      console.log('Workshops set:', result.data?.length || 0)
    }
  }

  const uploadToCloudinary = async (file: File, fileType: "cover" | "profile"): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)
    
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "duj3kbfhm"
    
    if (!uploadPreset) {
      console.error("Cloudinary upload preset not configured")
      alert("Upload configuration error. Please contact support.")
      return null
    }
    
    formData.append("upload_preset", uploadPreset)
    formData.append("folder", `consultbook/${consultantId}/${fileType}-photo`)

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error("Cloudinary error:", data)
        throw new Error(data.error?.message || "Upload failed")
      }
      
      return data.secure_url
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      return null
    }
  }



  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, "profile")
      if (url) {
        await updateConsultantImage(consultantId, "profile", url)
        setConsultant(prev => prev ? { ...prev, profilePhoto: url } : null)
      }
    } catch (error) {
      console.error("Error updating profile photo:", error)
    } finally {
      setUploading(false)
      if (profileFileInputRef.current) profileFileInputRef.current.value = ""
    }
  }

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, "cover")
      if (url) {
        await updateConsultantImage(consultantId, "cover", url)
        setConsultant(prev => prev ? { ...prev, coverPhoto: url } : null)
      }
    } catch (error) {
      console.error("Error updating cover photo:", error)
    } finally {
      setUploading(false)
      if (coverFileInputRef.current) coverFileInputRef.current.value = ""
    }
  }

  const handleRemoveCoverPhoto = async () => {
    setUploading(true)
    try {
      await updateConsultantImage(consultantId, "cover", null)
      setConsultant(prev => prev ? { ...prev, coverPhoto: undefined } : null)
    } catch (error) {
      console.error("Error removing cover photo:", error)
    } finally {
      setUploading(false)
    }
  }

  const fetchConsultant = async () => {
    try {
      const data = await getPublicConsultantProfile(consultantId)
      if (data) {
        setConsultant(data as unknown as ConsultantProfile)
        
        // Fetch real reviews
        const reviewsResult = await getConsultantReviews(consultantId)
        if (reviewsResult.success && reviewsResult.data) {
            setReviews(reviewsResult.data.map((r: any) => ({
                id: r.id,
                clientId: r.clientId,
                clientName: r.client?.name || "Client",
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt
            })))
        }
      } else {
        setConsultant(null)
      }
    } catch (error) {
      console.error("Error fetching consultant:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete your review?")) return
    try {
        const result = await deleteReview(reviewId)
        if (result.success) {
            setReviews(reviews.filter(r => r.id !== reviewId))
            fetchConsultant() // Refresh stats
        }
    } catch (error) {
        console.error("Error deleting review:", error)
    }
  }

  const handleUpdateReview = async () => {
    if (!editingReview || !editReviewData.comment.trim()) return
    try {
        const result = await updateReview(editingReview.id, editReviewData.rating, editReviewData.comment)
        if (result.success) {
            setReviews(reviews.map(r => r.id === editingReview.id ? { ...r, rating: editReviewData.rating, comment: editReviewData.comment } : r))
            setEditingReview(null)
            fetchConsultant() // Refresh stats
        }
    } catch (error) {
        console.error("Error updating review:", error)
    }
  }

  // Removed getConsultantRating, getReviewCount, getAppointmentCount, fetchConsultantReviews
  // as they are now handled by getPublicConsultantProfile (or mocked there)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!consultant) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900">Consultant not found</h1>
            <p className="text-gray-600 mt-2">This consultant profile does not exist or is not published.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button & Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header with Cover Photo */}
        <div 
          className="relative h-40 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl mb-20 overflow-hidden"
          onMouseEnter={() => isOwner && setCoverHover(true)}
          onMouseLeave={() => setCoverHover(false)}
        >
          {consultant.coverPhoto ? (
            <Image
              src={consultant.coverPhoto}
              alt="Cover Photo"
              layout="fill"
              objectFit="cover"
              className="rounded-3xl"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl" />
          )}
          
          {/* Hover Overlay */}
          {isOwner && coverHover && (
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-3xl flex items-center justify-center gap-4">
              <Button 
                className="bg-white text-gray-900 hover:bg-gray-100 gap-2"
                onClick={() => coverFileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {consultant.coverPhoto ? "Change Photo" : "Upload Photo"}
              </Button>
              {consultant.coverPhoto && (
                <Button 
                  className="bg-red-500 text-white hover:bg-red-600 gap-2"
                  onClick={() => setRemoveConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverPhotoUpload}
            disabled={uploading}
          />

        {/* Remove Cover Photo Confirmation Dialog */}
        <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove cover photo?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove your cover photo. You can upload a new one anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveCoverPhoto} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-16 relative z-10 mb-12">
          {/* Left: Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-end gap-6">
              {/* Profile Avatar with Hover */}
              <div 
                className="relative flex-shrink-0 group"
                onMouseEnter={() => isOwner && setProfileHover(true)}
                onMouseLeave={() => setProfileHover(false)}
              >
                <Avatar className="h-40 w-40 border-4 border-white shadow-xl">
                  <AvatarImage src={consultant.profilePhoto} className="object-cover" />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold uppercase">
                    {consultant.consultantName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Hover Overlay */}
                {isOwner && profileHover && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => profileFileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                )}

                {/* Hidden Profile File Input */}
                <input
                  ref={profileFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoUpload}
                  disabled={uploading}
                />
              </div>

              <div className="pb-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{consultant.consultantName}</h1>
                <p className="text-blue-600 font-semibold text-xl mb-4">{consultant.specialty}</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    {consultant.rating || '0.0'} 
                    <span className="font-normal text-gray-500 text-sm">({consultant.reviewCount || 0} reviews)</span>
                  </div>
                  <Separator orientation="vertical" className="h-6 bg-gray-200" />
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarCheck className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">{consultant.appointmentCount || 0}</span>
                    <span className="text-sm">completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                About
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {consultant.bio}
              </p>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</p>
                      <p className="text-lg font-semibold text-gray-900">{consultant.experience}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                      <div className="flex flex-col">
                        {consultant.address && <p className="text-lg font-semibold text-gray-900">{consultant.address}</p>}
                        <p className="text-lg font-semibold text-gray-900">
                          {[consultant.city, consultant.state, consultant.country].filter(Boolean).join(", ") || "Location not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hourly Rate</p>
                      <p className="text-lg font-semibold text-gray-900">৳{consultant.hourlyRate}/hour</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                      <Globe className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Languages</p>
                      <p className="text-lg font-semibold text-gray-900">{consultant.languages.join(", ")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Consultation Methods */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Consultation Methods</h3>
              <div className="flex flex-wrap gap-3">
                {consultant.consultationModes.map((mode) => (
                  <Badge key={mode} className="bg-blue-100 text-blue-700 border-blue-200 font-medium text-sm px-4 py-2 capitalize">
                    {mode.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Live Statistics Widget */}
            <div className="space-y-4 border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-blue-600" />
                Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-gray-200 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{consultant.appointmentCount || 0}</p>
                      <p className="text-xs text-gray-600 mt-2 font-medium">Total Consultations</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">{Math.round((consultant.rating || 0) * 10) / 10}</p>
                      <p className="text-xs text-gray-600 mt-2 font-medium">Client Satisfaction</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{consultant.hoursDelivered || (consultant.appointmentCount || 0) * 1}</p>
                      <p className="text-xs text-gray-600 mt-2 font-medium">Hours Delivered</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">{consultant.languages.length}</p>
                      <p className="text-xs text-gray-600 mt-2 font-medium">Languages</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Portfolio & Credentials */}
            {isOwner ? (
              // Show full section for owner (even if empty) with CTA to add content
              <div className="space-y-8 border-t pt-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Award className="h-8 w-8 text-blue-600" />
                    </div>
                    Credentials & Expertise
                  </h2>
                  <p className="text-gray-600">Professional qualifications and certifications</p>
                </div>

                {!(consultant.certifications?.length || consultant.qualifications?.length || consultant.specializations?.length || consultant.portfolioItems?.length) ? (
                  <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
                    <Award className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Build Your Professional Profile</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">Add your certifications, education, specializations, and portfolio items to showcase your expertise to potential clients.</p>
                    <Link href="/consultant/profile">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Add Credentials
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Certifications */}
                    {consultant.certifications && consultant.certifications.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                          <h3 className="text-2xl font-bold text-gray-900">Certifications</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {consultant.certifications.map((cert, idx) => (
                            <Card key={idx} className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow">
                              <CardContent className="p-5">
                                <div className="flex gap-4">
                                  <div className="p-2 bg-white rounded-lg h-fit">
                                    <CheckCircle className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{cert.name}</h4>
                                    <p className="text-sm text-gray-700 font-medium">{cert.issuer}</p>
                                    <p className="text-xs text-gray-600 mt-2">Awarded in {cert.year}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Qualifications/Degrees */}
                    {consultant.qualifications && consultant.qualifications.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                          <h3 className="text-2xl font-bold text-gray-900">Education</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {consultant.qualifications.map((qual, idx) => (
                            <Card key={idx} className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow">
                              <CardContent className="p-5">
                                <div className="flex gap-4">
                                  <div className="p-2 bg-white rounded-lg h-fit">
                                    <Award className="h-6 w-6 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{qual.degree}</h4>
                                    <p className="text-sm text-gray-700 font-medium">{qual.university}</p>
                                    <p className="text-xs text-gray-600 mt-2">Completed in {qual.year}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specializations */}
                    {consultant.specializations && consultant.specializations.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                          <h3 className="text-2xl font-bold text-gray-900">Specializations</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {consultant.specializations.map((spec, idx) => (
                            <Badge 
                              key={idx} 
                              className="bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border-2 border-indigo-200 font-semibold text-sm px-4 py-2 rounded-full hover:shadow-md transition-shadow"
                            >
                              ✨ {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Portfolio Items */}
                    {consultant.portfolioItems && consultant.portfolioItems.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                          <h3 className="text-2xl font-bold text-gray-900">Case Studies & Portfolio</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {consultant.portfolioItems.map((item, idx) => (
                            <Card key={idx} className="border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
                              {item.imageUrl && (
                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    layout="fill"
                                    objectFit="cover"
                                    className="group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <CardContent className={`p-5 ${!item.imageUrl && 'pt-8'}`}>
                                <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{item.title}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              // Show only if has content for non-owner
              (consultant.certifications?.length || consultant.qualifications?.length || consultant.specializations?.length || consultant.portfolioItems?.length) && (
                <div className="space-y-8 border-t pt-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Award className="h-8 w-8 text-blue-600" />
                      </div>
                      Credentials & Expertise
                    </h2>
                    <p className="text-gray-600">Professional qualifications and certifications</p>
                  </div>

                  {/* Certifications */}
                  {consultant.certifications && consultant.certifications.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-gray-900">Certifications</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {consultant.certifications.map((cert, idx) => (
                          <Card key={idx} className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                              <div className="flex gap-4">
                                <div className="p-2 bg-white rounded-lg h-fit">
                                  <CheckCircle className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-lg mb-1">{cert.name}</h4>
                                  <p className="text-sm text-gray-700 font-medium">{cert.issuer}</p>
                                  <p className="text-xs text-gray-600 mt-2">Awarded in {cert.year}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Qualifications/Degrees */}
                  {consultant.qualifications && consultant.qualifications.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-gray-900">Education</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {consultant.qualifications.map((qual, idx) => (
                          <Card key={idx} className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                              <div className="flex gap-4">
                                <div className="p-2 bg-white rounded-lg h-fit">
                                  <Award className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-lg mb-1">{qual.degree}</h4>
                                  <p className="text-sm text-gray-700 font-medium">{qual.university}</p>
                                  <p className="text-xs text-gray-600 mt-2">Completed in {qual.year}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specializations */}
                  {consultant.specializations && consultant.specializations.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-gray-900">Specializations</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {consultant.specializations.map((spec, idx) => (
                          <Badge 
                            key={idx} 
                            className="bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border-2 border-indigo-200 font-semibold text-sm px-4 py-2 rounded-full hover:shadow-md transition-shadow"
                          >
                            ✨ {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Items */}
                  {consultant.portfolioItems && consultant.portfolioItems.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-gray-900">Case Studies & Portfolio</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {consultant.portfolioItems.map((item, idx) => (
                          <Card key={idx} className="border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
                            {item.imageUrl && (
                              <div className="relative h-48 bg-gray-100 overflow-hidden">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.title}
                                  layout="fill"
                                  objectFit="cover"
                                  className="group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <CardContent className={`p-5 ${!item.imageUrl && 'pt-8'}`}>
                              <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{item.title}</h4>
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Social Links & Verification Badge */}
            {(consultant.socialLinks && Object.keys(consultant.socialLinks).length > 0) || consultant.verified && (
              <div className="space-y-4 border-t pt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Connect</h2>
                  {consultant.verified && (
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Verified</span>
                    </div>
                  )}
                </div>
                {consultant.socialLinks && (
                  <div className="flex flex-wrap gap-3">
                    {consultant.socialLinks.linkedin && (
                      <a href={consultant.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
                        <Linkedin className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">LinkedIn</span>
                      </a>
                    )}
                    {consultant.socialLinks.twitter && (
                      <a href={consultant.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors">
                        <Twitter className="h-5 w-5 text-sky-600" />
                        <span className="text-sm font-medium text-sky-600">Twitter</span>
                      </a>
                    )}
                    {consultant.socialLinks.website && (
                      <a href={consultant.socialLinks.website} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                        <ExternalLink className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Website</span>
                      </a>
                    )}
                    {consultant.socialLinks.instagram && (
                      <a href={consultant.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg transition-colors">
                        <ExternalLink className="h-5 w-5 text-pink-600" />
                        <span className="text-sm font-medium text-pink-600">Instagram</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Books & Sessions Tabs */}
            <div className="space-y-4 border-t pt-8">
              <div className="flex gap-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('books')}
                  className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${
                    activeTab === 'books'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Books, Courses & Assets
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${
                    activeTab === 'sessions'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Sessions & Workshops
                  </div>
                </button>
              </div>

              {/* Books Section */}
              {activeTab === 'books' && (
                <div className="space-y-4">
                  {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product: any) => (
                        <Link key={product.id} href={`/library/${product.id}`}>
                          <Card className="border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer">
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                              {product.thumbnailUrl ? (
                                <img 
                                  src={product.thumbnailUrl} 
                                  alt={product.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                                  <BookOpen className="h-16 w-16 text-white/20" />
                                </div>
                              )}
                              <Badge className="absolute top-3 left-3 bg-white/95 text-gray-900 border-none shadow-md text-xs font-bold px-3 py-1">
                                {product.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <CardContent className="p-5">
                              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {product.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-black text-gray-900">${(product.price / 100).toFixed(2)}</span>
                                <Badge className="bg-blue-50 text-blue-600 border-none text-xs">
                                  {product.salesCount || 0} sales
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No published products yet</p>
                      <p className="text-sm text-gray-400 mt-1">Check back later for books, courses, and digital assets</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sessions Section */}
              {activeTab === 'sessions' && (
                <div className="space-y-4">
                  {workshops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {workshops.map((workshop: any) => (
                        <Link key={workshop.id} href={`/sessions/${workshop.id}`}>
                          <Card className="border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer">
                            <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                              {workshop.thumbnailUrl ? (
                                <img 
                                  src={workshop.thumbnailUrl} 
                                  alt={workshop.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-60"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                                  <Users className="h-16 w-16 text-white/20" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                              <Badge className="absolute top-3 left-3 bg-white/95 text-gray-900 border-none shadow-md text-xs font-bold px-3 py-1">
                                {workshop.mode.toUpperCase()}
                              </Badge>
                              <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="font-bold text-white text-lg line-clamp-2 drop-shadow-md">
                                  {workshop.title}
                                </h3>
                              </div>
                            </div>
                            <CardContent className="p-5">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  {new Date(workshop.startDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Users className="h-4 w-4" />
                                  {workshop.registrations?.length || 0}/{workshop.maxParticipants || '∞'}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-black text-gray-900">${(workshop.price / 100).toFixed(2)}</span>
                                <Badge className="bg-green-50 text-green-600 border-none text-xs">
                                  {workshop.duration} min
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No workshops yet</p>
                      <p className="text-sm text-gray-400 mt-1">This consultant hasn't published any workshops or masterclasses</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="space-y-4 border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                Client Reviews
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <p className="text-gray-500 font-medium">No reviews yet</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to review this consultant!</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4 border border-gray-100 rounded-2xl bg-gray-50 p-4">
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="border-gray-200 rounded-lg shadow-none">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-semibold text-gray-900">{review.clientName}</p>
                                <div className="flex gap-0.5 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                                {user?.uid === review.clientId && (
                                    <div className="flex gap-1">
                                        <Dialog open={editingReview?.id === review.id} onOpenChange={(open: boolean) => {
                                            if (open) {
                                                setEditingReview(review)
                                                setEditReviewData({ rating: review.rating, comment: review.comment })
                                            } else {
                                                setEditingReview(null)
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500">
                                                    <Briefcase className="h-4 w-4" /> {/* Using Briefcase as edit icon fallback or import Edit */}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Edit Your Review</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4 pt-4">
                                                    <div className="flex gap-1">
                                                        {[1,2,3,4,5].map(s => (
                                                            <button key={s} onClick={() => setEditReviewData({...editReviewData, rating: s})}>
                                                                <Star className={`h-6 w-6 ${s <= editReviewData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <Textarea 
                                                        value={editReviewData.comment}
                                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditReviewData({...editReviewData, comment: e.target.value})}
                                                        rows={4}
                                                        className="rounded-xl border-gray-200"
                                                    />
                                                    <Button onClick={handleUpdateReview} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                                            onClick={() => handleDeleteReview(review.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200 shadow-lg rounded-2xl sticky top-32">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-6">
                <CardTitle className="text-lg text-gray-900">Ready to consult?</CardTitle>
                <CardDescription className="text-gray-600 text-sm mt-1">Book your appointment now</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <p className="text-2xl font-bold text-gray-900">৳{consultant.hourlyRate}</p>
                    <p className="text-xs text-gray-600 mt-1">per hour consultation</p>
                  </div>

                  <Link href={`/book-appointment/${consultant.consultantId}`} className="w-full">
                    <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg shadow-md">
                      Book Appointment
                    </Button>
                  </Link>

                  <Button variant="outline" className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Consultant
                  </Button>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700"><span className="font-semibold">{consultant.appointmentCount || 0}</span> consultations completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-700"><span className="font-semibold">{consultant.rating || '0.0'}</span> average rating</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700"><span className="font-semibold">{consultant.reviewCount || 0}</span> reviews</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
