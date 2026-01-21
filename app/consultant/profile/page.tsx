"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getConsultantProfile, updateConsultantProfile } from "@/app/actions/profile"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Save, Eye, MapPin, DollarSign, Clock, User, Upload, Trash2, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConsultantProfile {
  bio: string
  hourlyRate: number
  address: string
  city: string
  state: string
  country: string
  experience: string
  languages: string[]
  consultationModes: string[]
  published: boolean
  profilePhoto?: string
  coverPhoto?: string
  // New portfolio fields
  certifications?: Array<{ name: string; issuer: string; year: number }>
  qualifications?: Array<{ degree: string; university: string; year: number }>
  specializations?: string[]
  portfolioItems?: Array<{ title: string; description: string; imageUrl?: string }>
  socialLinks?: { linkedin?: string; twitter?: string; website?: string; instagram?: string }
  hoursDelivered?: number
  verified?: boolean
  availability: {
    [key: string]: string[] // day: time slots
  }
}

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  url: string
  contentType: string
}

export default function ConsultantProfilePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<UploadedFile[]>([])
  const [coverPhoto, setCoverPhoto] = useState<UploadedFile[]>([])
  const [profile, setProfile] = useState<ConsultantProfile>({
    bio: "",
    hourlyRate: 0,
    address: "",
    city: "",
    state: "",
    country: "",
    experience: "",
    languages: [],
    consultationModes: [],
    published: false,
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  })
  const [uploading, setUploading] = useState(false)
  const [profileHover, setProfileHover] = useState(false)
  const [coverHover, setCoverHover] = useState(false)
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [certifications, setCertifications] = useState<Array<{ id: string; name: string; issuer: string; year: number }>>([])
  const [qualifications, setQualifications] = useState<Array<{ id: string; degree: string; university: string; year: number }>>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [portfolioItems, setPortfolioItems] = useState<Array<{ id: string; title: string; description: string; imageUrl?: string }>>([])
  const [socialLinks, setSocialLinks] = useState<{ linkedin?: string; twitter?: string; website?: string; instagram?: string }>({ linkedin: '', twitter: '', website: '', instagram: '' })
  const [certInput, setCertInput] = useState({ name: '', issuer: '', year: new Date().getFullYear() })
  const [qualInput, setQualInput] = useState({ degree: '', university: '', year: new Date().getFullYear() })
  const [specInput, setSpecInput] = useState('')
  const [portItem, setPortItem] = useState({ title: '', description: '' })
  const profileFileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

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
      // First try to fetch from userData which should have it if registered correctly
      if (userData?.profilePhoto) {
        setProfilePhoto([
          {
            id: "existing",
            filename: "profile.jpg",
            originalName: "Profile Photo",
            url: userData.profilePhoto,
            contentType: "image/jpeg",
          },
        ])
      }
      fetchProfile()
    }
  }, [user, userData, loading, router])

  // Helper function to remove undefined values from object
  const removeUndefinedValues = (obj: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value
      }
    }
    return cleaned
  }

  const uploadToCloudinary = async (file: File, fileType: "cover" | "profile"): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)
    
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "duj3kbfhm"
    
    if (!uploadPreset) {
      console.error("Cloudinary upload preset not configured")
      toast.error("Upload configuration error. Please contact support.")
      return null
    }
    
    formData.append("upload_preset", uploadPreset)
    formData.append("folder", `consultbook/${user?.uid}/${fileType}-photo`)

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
      toast.error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
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
        const profileData = removeUndefinedValues({
          ...profile,
          profilePhoto: url,
          consultantId: user!.uid,
        })
        const result = await updateConsultantProfile(profileData as any)
        if (!result.success) throw new Error(result.error)

        setProfile(prev => ({ ...prev, profilePhoto: url }))
        setProfilePhoto([{
          id: "existing",
          filename: "profile.jpg",
          originalName: "Profile Photo",
          url: url,
          contentType: "image/jpeg",
        }])
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
        const profileData = removeUndefinedValues({
          ...profile,
          coverPhoto: url,
          consultantId: user!.uid,
        })
        const result = await updateConsultantProfile(profileData as any)
        if (!result.success) throw new Error(result.error)

        setProfile(prev => ({ ...prev, coverPhoto: url }))
        setCoverPhoto([{
          id: "existing",
          filename: "cover.jpg",
          originalName: "Cover Photo",
          url: url,
          contentType: "image/jpeg",
        }])
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
      const profileData = removeUndefinedValues({
        ...profile,
        coverPhoto: null,
        consultantId: user!.uid,
      })
      const result = await updateConsultantProfile(profileData as any)
      if (!result.success) throw new Error(result.error)

      setProfile(prev => ({ ...prev, coverPhoto: undefined }))
      setCoverPhoto([])
    } catch (error) {
      console.error("Error removing cover photo:", error)
    } finally {
      setUploading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const dataToLoad = await getConsultantProfile(user!.uid)
      console.log("[Client] fetchProfile dataToLoad:", dataToLoad)
      
      if (dataToLoad) {
        // Merge with defaults to ensure all fields exist
        setProfile({
          bio: dataToLoad.bio || "",
          hourlyRate: dataToLoad.hourlyRate || 0,
          address: dataToLoad.address || "",
          city: dataToLoad.city || "",
          state: dataToLoad.state || "",
          country: dataToLoad.country || "",
          experience: dataToLoad.experience || "",
          languages: dataToLoad.languages || [],
          consultationModes: dataToLoad.consultationModes || [],
          published: dataToLoad.isPublished || false,
          profilePhoto: dataToLoad.profilePhoto || undefined,
          coverPhoto: dataToLoad.coverPhoto || undefined,
          certifications: dataToLoad.certifications,
          qualifications: dataToLoad.education as any, // Map education to qualifications state
          specializations: dataToLoad.specializations || [],
          portfolioItems: dataToLoad.portfolioItems as any,
          socialLinks: dataToLoad.socialLinks as any,
          hoursDelivered: dataToLoad.hoursDelivered || 0,
          verified: dataToLoad.isApproved || false, 
          availability: (dataToLoad.availability as any) || {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          },
        })
        if (dataToLoad.certifications) setCertifications((dataToLoad.certifications as any[]).map((c, i) => ({ id: String(i), ...c })))
        if (dataToLoad.education) setQualifications((dataToLoad.education as any[]).map((q, i) => ({ id: String(i), ...q })))
        // Handle specializations
        if (dataToLoad.specializations) {
          const specs = typeof dataToLoad.specializations === 'string'
            ? (dataToLoad.specializations as string).split(',').map((s: string) => s.trim()).filter((s: string) => s)
            : dataToLoad.specializations as string[]
          setSpecializations(specs)
        }
        if (dataToLoad.portfolioItems) setPortfolioItems((dataToLoad.portfolioItems as any[]).map((p, i) => ({ id: String(i), ...p })))
        if (dataToLoad.socialLinks) setSocialLinks(dataToLoad.socialLinks as any)
        if (dataToLoad.profilePhoto) {
          setProfilePhoto([
            {
              id: "existing",
              filename: "profile.jpg",
              originalName: "Profile Photo",
              url: dataToLoad.profilePhoto,
              contentType: "image/jpeg",
            },
          ])
        }
        if (dataToLoad.coverPhoto) {
          setCoverPhoto([
            {
              id: "existing",
              filename: "cover.jpg",
              originalName: "Cover Photo",
              url: dataToLoad.coverPhoto,
              contentType: "image/jpeg",
            },
          ])
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile.bio.trim() || profile.hourlyRate <= 0 || !profile.city.trim()) {
      toast.error("Please fill in all required fields (Bio, Hourly Rate, City)!")
      return
    }

    if (!user) {
      toast.error("User not authenticated!")
      return
    }

    setSaving(true)
    try {
      const profileData = removeUndefinedValues({
        ...profile,
        profilePhoto: profilePhoto.length > 0 ? profilePhoto[0].url : null,
        coverPhoto: coverPhoto.length > 0 ? coverPhoto[0].url : null,
        certifications: certifications.map(({ id, ...rest }) => rest),
        education: qualifications.map(({ id, ...rest }) => rest), // Map qualifications state to education
        specializations,
        portfolioItems: portfolioItems.map(({ id, ...rest }) => rest),
        socialLinks,
        consultantId: user.uid,
      })

      const result = await updateConsultantProfile(profileData as any)
      if (!result.success) throw new Error(result.error)

      setShowSuccessDialog(true)
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error(`Error saving profile: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  const handlePublishProfile = async () => {
    if (!profile.bio.trim() || profile.hourlyRate <= 0 || !profile.city.trim()) {
      toast.error("Please complete all required fields before publishing!")
      return
    }

    if (!user) {
      toast.error("User not authenticated!")
      return
    }

    setSaving(true)
    try {
      const profileData = removeUndefinedValues({
        ...profile,
        published: true,
        profilePhoto: profilePhoto.length > 0 ? profilePhoto[0].url : null,
        coverPhoto: coverPhoto.length > 0 ? coverPhoto[0].url : null,
        certifications: certifications.map(({ id, ...rest }) => rest),
        education: qualifications.map(({ id, ...rest }) => rest),
        specializations,
        portfolioItems: portfolioItems.map(({ id, ...rest }) => rest),
        socialLinks,
        consultantId: user.uid,
      })

      const result = await updateConsultantProfile(profileData as any)
      if (!result.success) throw new Error(result.error)

      setProfile({ ...profile, published: true })
      toast.success("Profile published successfully! You are now available for bookings.")
    } catch (error) {
      console.error("Error publishing profile:", error)
      toast.error(`Error publishing profile: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  const addLanguage = (language: string) => {
    if (language && !profile.languages.includes(language)) {
      setProfile({ ...profile, languages: [...profile.languages, language] })
    }
  }

  const removeLanguage = (language: string) => {
    setProfile({ ...profile, languages: profile.languages.filter((l) => l !== language) })
  }

  const toggleConsultationMode = (mode: string) => {
    const modes = profile.consultationModes.includes(mode)
      ? profile.consultationModes.filter((m) => m !== mode)
      : [...profile.consultationModes, mode]
    setProfile({ ...profile, consultationModes: modes })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* Main Profile Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>Complete your profile to start accepting bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div 
                    className="relative w-32 h-32 group"
                    onMouseEnter={() => setProfileHover(true)}
                    onMouseLeave={() => setProfileHover(false)}
                  >
                    <Avatar className="h-32 w-32 border-4 border-gray-200">
                      <AvatarImage src={profilePhoto.length > 0 ? profilePhoto[0].url : profile.profilePhoto} className="object-cover" />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                        {userData?.name.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Hover Overlay */}
                    {profileHover && (
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
                </div>

                <div className="space-y-2">
                  <Label>Cover Photo</Label>
                  <div 
                    className="relative w-full h-32 group rounded-lg overflow-hidden border-2 border-gray-200"
                    onMouseEnter={() => setCoverHover(true)}
                    onMouseLeave={() => setCoverHover(false)}
                  >
                    {profile.coverPhoto ? (
                      <Image
                        src={profile.coverPhoto}
                        alt="Cover Photo"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-lg" />
                    )}
                    
                    {/* Hover Overlay */}
                    {coverHover && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center gap-4">
                        <Button 
                          className="bg-white text-gray-900 hover:bg-gray-100 gap-2"
                          onClick={() => coverFileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          {profile.coverPhoto ? "Change Photo" : "Upload Photo"}
                        </Button>
                        {profile.coverPhoto && (
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

                    {/* Hidden Cover File Input */}
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverPhotoUpload}
                      disabled={uploading}
                    />
                  </div>
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell clients about your background, expertise, and approach..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (৳) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={profile.hourlyRate}
                      onChange={(e) => setProfile({ ...profile, hourlyRate: Number.parseInt(e.target.value) || 0 })}
                      placeholder="1500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      placeholder="Dhaka"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input
                      id="state"
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      placeholder="e.g., Dhaka"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profile.country}
                      onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                      placeholder="e.g., Bangladesh"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select onValueChange={(value) => setProfile({ ...profile, experience: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="11-15">11-15 years</SelectItem>
                      <SelectItem value="15+">15+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Languages you can provide consultations in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language) => (
                    <Badge key={language} variant="secondary" className="cursor-pointer">
                      {language}
                      <button onClick={() => removeLanguage(language)} className="ml-2 text-red-500 hover:text-red-700">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Select onValueChange={addLanguage}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Add language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Bengali">Bengali</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Urdu">Urdu</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Modes */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications & Education</CardTitle>
                <CardDescription>Build your professional credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Certifications Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Certifications</h3>
                  <div className="space-y-2">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <p className="font-medium text-gray-900">{cert.name}</p>
                          <p className="text-sm text-gray-600">{cert.issuer} • {cert.year}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCertifications(certifications.filter(c => c.id !== cert.id))}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        placeholder="Certification name"
                        value={certInput.name}
                        onChange={(e) => setCertInput({ ...certInput, name: e.target.value })}
                      />
                      <Input
                        placeholder="Issuer"
                        value={certInput.issuer}
                        onChange={(e) => setCertInput({ ...certInput, issuer: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="Year"
                        value={certInput.year}
                        onChange={(e) => setCertInput({ ...certInput, year: Number(e.target.value) })}
                      />
                      <Button
                        onClick={() => {
                          if (certInput.name && certInput.issuer && certInput.year) {
                            setCertifications([...certifications, { id: Date.now().toString(), ...certInput }])
                            setCertInput({ name: '', issuer: '', year: new Date().getFullYear() })
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add Certification
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  {/* Qualifications Section */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Education</h3>
                    <div className="space-y-2">
                      {qualifications.map((qual) => (
                        <div key={qual.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div>
                            <p className="font-medium text-gray-900">{qual.degree}</p>
                            <p className="text-sm text-gray-600">{qual.university} • {qual.year}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQualifications(qualifications.filter(q => q.id !== qual.id))}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          placeholder="Degree (e.g., Bachelor, Master)"
                          value={qualInput.degree}
                          onChange={(e) => setQualInput({ ...qualInput, degree: e.target.value })}
                        />
                        <Input
                          placeholder="University"
                          value={qualInput.university}
                          onChange={(e) => setQualInput({ ...qualInput, university: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          type="number"
                          placeholder="Year"
                          value={qualInput.year}
                          onChange={(e) => setQualInput({ ...qualInput, year: Number(e.target.value) })}
                        />
                        <Button
                          onClick={() => {
                            if (qualInput.degree && qualInput.university && qualInput.year) {
                              setQualifications([...qualifications, { id: Date.now().toString(), ...qualInput }])
                              setQualInput({ degree: '', university: '', year: new Date().getFullYear() })
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Add Education
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specializations & Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations & Social Links</CardTitle>
                <CardDescription>Highlight your expertise and connect socially</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Specializations */}
                <div className="space-y-3">
                  <Label>Specializations</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Marketing, Finance, Tech"
                      value={specInput}
                      onChange={(e) => setSpecInput(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (specInput && !specializations.includes(specInput)) {
                          setSpecializations([...specializations, specInput])
                          setSpecInput('')
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec) => (
                      <Badge
                        key={spec}
                        className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1 flex items-center gap-2"
                      >
                        {spec}
                        <button
                          onClick={() => setSpecializations(specializations.filter(s => s !== spec))}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-3 pt-4 border-t">
                  <Label>Social Links</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="LinkedIn URL"
                      value={socialLinks.linkedin || ''}
                      onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    />
                    <Input
                      placeholder="Twitter URL"
                      value={socialLinks.twitter || ''}
                      onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    />
                    <Input
                      placeholder="Website URL"
                      value={socialLinks.website || ''}
                      onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    />
                    <Input
                      placeholder="Instagram URL"
                      value={socialLinks.instagram || ''}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Modes */}
            <Card>
              <CardHeader>
                <CardTitle>Consultation Modes</CardTitle>
                <CardDescription>How you prefer to conduct consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["in-person", "virtual", "phone"].map((mode) => (
                    <div
                      key={mode}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        profile.consultationModes.includes(mode)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleConsultationMode(mode)}
                    >
                      <div className="text-center">
                        <div className="capitalize font-medium">{mode.replace("-", " ")}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {mode === "in-person" && "Face-to-face meetings"}
                          {mode === "virtual" && "Video calls"}
                          {mode === "phone" && "Voice calls"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 md:h-screen md:overflow-y-auto">
            {/* Profile Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Profile Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 overflow-hidden">
                    {profilePhoto.length > 0 ? (
                      <img
                        src={profilePhoto[0].url || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold">  {userData?.name}</h3>
    
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <div className="flex flex-col">
                      {profile.address && <span>{profile.address}</span>}
                      <span className="font-medium">
                        {[profile.city, profile.state, profile.country].filter(Boolean).join(", ") || "Location not set"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <span>৳{profile.hourlyRate || 0}/hour</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{profile.experience || "Experience not set"}</span>
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Bio</h4>
                    <p className="text-xs text-gray-600 line-clamp-3">{profile.bio}</p>
                  </div>
                )}

                {profile.languages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>

                {!profile.published ? (
                  <Button
                    onClick={handlePublishProfile}
                    disabled={saving || !profile.bio || !profile.hourlyRate || !profile.city}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Publish Profile
                  </Button>
                ) : (
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Profile is Live!
                    </Badge>
                    <p className="text-xs text-gray-600 mt-2">Clients can now book appointments with you</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader className="flex flex-col items-center justify-center text-center space-y-4 pt-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold">Profile Saved Successfully!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-500">
              Your consultant profile has been updated and your changes are now live.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center p-4">
            <AlertDialogAction 
              onClick={() => setShowSuccessDialog(false)}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 min-w-[120px]"
            >
              Great, thanks!
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

