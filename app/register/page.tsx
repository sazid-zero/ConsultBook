"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Eye, EyeOff, Check, X } from "lucide-react"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  url: string
  contentType: string
}

interface QualificationEntry {
  id: string
  name: string
  certificateFile: UploadedFile | null
  certificateRawFile?: File // Store the actual File object for upload
}

// Global Consultant Type Categories (immutable)
const CONSULTANT_TYPES = [
  { value: "medical", label: "Medical Consultant" },
  { value: "legal", label: "Legal Consultant" },
  { value: "financial", label: "Financial Advisor" },
  { value: "technical", label: "Technical Consultant" },
  { value: "business", label: "Business Consultant" },
  { value: "career", label: "Career Coach" },
  { value: "wellness", label: "Wellness Expert" },
  { value: "education", label: "Education Specialist" },
  { value: "marketing", label: "Marketing Consultant" },
  { value: "other", label: "Other" },
]

const PasswordStrength = ({ password }: { password: string }) => {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one number", met: /\d/.test(password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(password) },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
  ]

  return (
    <div className="space-y-2 mt-2">
      <p className="text-xs font-medium text-gray-500">Password Requirements:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center space-x-2">
            {check.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-gray-300" />
            )}
            <span className={`text-[10px] ${check.met ? "text-green-600" : "text-gray-400"}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userData, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("client")
  const [certificates, setCertificates] = useState<UploadedFile[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!authLoading && user && userData) {
      if (userData.role === "client") {
        router.push("/dashboard/client")
      } else if (userData.role === "consultant") {
        router.push("/dashboard/consultant")
      } else if (userData.role === "admin") {
        router.push("/dashboard/admin")
      }
    }
  }, [user, userData, authLoading, router])

  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [consultantData, setConsultantData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consultantType: "",
    specializations: "",
    address: "",
    city: "",
    state: "",
    country: "",
  })

  const [qualifications, setQualifications] = useState<QualificationEntry[]>([])
  const [newQualName, setNewQualName] = useState("")

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "consultant") {
      setActiveTab("consultant")
    }
  }, [searchParams])

  const validatePassword = (password: string) => {
    return password.length >= 8 && /\d/.test(password) && /[^A-Za-z0-9]/.test(password) && /[A-Z]/.test(password)
  }

  const handleClientRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    if (clientData.password !== clientData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" })
      return
    }

    if (!validatePassword(clientData.password)) {
      setErrors({ password: "Password does not meet requirements" })
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, clientData.email, clientData.password)

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        role: "client",
        createdAt: new Date().toISOString(),
      })

      toast.success("Registration Successful", {
        description: "Welcome to ConsultBook! Redirecting to your dashboard..."
      })
      router.push("/dashboard/client")
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: "Email already exists" })
      } else {
        toast.error("Registration failed", { description: error.message })
      }
    } finally {
      setLoading(false)
    }
  }

  const uploadCertificateToCloudinary = async (file: File, qualId: string): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)
    
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "duj3kbfhm"
    
    if (!uploadPreset) {
      console.error("Cloudinary upload preset not configured")
      return null
    }
    
    formData.append("upload_preset", uploadPreset)
    formData.append("folder", `consultbook/temp-qual-${qualId}/certificate`)
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        console.error("Upload failed:", response.statusText)
        return null
      }
      
      const data = await response.json()
      return data.secure_url
    } catch (error) {
      console.error("Upload error:", error)
      return null
    }
  }


  const handleConsultantRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})


    if (!consultantData.consultantType) {
      setErrors({ consultantType: "Please select a consultant type" })
      return
    }

    if (!consultantData.specializations.trim()) {
      setErrors({ specializations: "Please enter at least one specialization" })
      return
    }

    if (qualifications.length === 0) {
      toast.error("Qualifications Required", {
        description: "Please add at least one qualification with a certificate."
      })
      return
    }

    // Check all qualifications have both name and certificate
    const invalidQual = qualifications.find(q => !q.name.trim() || !q.certificateFile)
    if (invalidQual) {
      toast.error("Incomplete Qualifications", {
        description: "Each qualification must have a name and certificate uploaded."
      })
      return
    }

    if (consultantData.password !== consultantData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" })
      return
    }

    if (!validatePassword(consultantData.password)) {
      setErrors({ password: "Password does not meet requirements" })
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, consultantData.email, consultantData.password)

      // Transform specializations string to array
      const specializationsList = consultantData.specializations
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0)

      // Upload certificates and transform qualifications for Firestore
      const qualificationsData = await Promise.all(qualifications.map(async (qual) => {
        let certificateUrl = qual.certificateFile?.url
        let certificateFilename = qual.certificateFile?.filename
        
        // If we have a raw file, upload it to Cloudinary
        if (qual.certificateRawFile && certificateUrl?.startsWith('blob:')) {
          const uploadedUrl = await uploadCertificateToCloudinary(qual.certificateRawFile, qual.id)
          if (uploadedUrl) {
            certificateUrl = uploadedUrl
          }
        }
        
        return {
          id: qual.id,
          name: qual.name,
          certificateUrl: certificateUrl,
          certificateFilename: certificateFilename,
          status: "pending",
        }
      }))

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: consultantData.name,
        email: consultantData.email,
        phone: consultantData.phone,
        role: "consultant",
        consultantType: consultantData.consultantType, // Global immutable category
        specializations: specializationsList,
        address: consultantData.address,
        city: consultantData.city,
        state: consultantData.state,
        country: consultantData.country,
        qualifications: qualificationsData,
        approved: false,
        createdAt: new Date().toISOString(),
      })

      toast.success("Application Submitted!", {
        description: "Your application has been submitted for review. We'll notify you soon."
      })
      router.push("/dashboard/consultant")
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrors({ email: "Email already exists" })
      } else {
        toast.error("Application failed", { description: error.message })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddQualification = () => {
    if (!newQualName.trim()) {
      toast.error("Enter Qualification Name", {
        description: "Please enter a name for the qualification before adding."
      })
      return
    }
    
    const newEntry: QualificationEntry = {
      id: Date.now().toString(),
      name: newQualName,
      certificateFile: null,
    }
    
    setQualifications([...qualifications, newEntry])
    setNewQualName("")
  }

  const handleRemoveQualification = (id: string) => {
    setQualifications(qualifications.filter(q => q.id !== id))
  }

  const handleQualificationCertificateUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create a file object with the required properties
      const uploadedFile: UploadedFile = {
        id: `cert-${Date.now()}`,
        filename: file.name,
        originalName: file.name,
        url: URL.createObjectURL(file), // Create a temporary URL for preview
        contentType: file.type,
      }
      setQualifications(
        qualifications.map(q => 
          q.id === id ? { ...q, certificateFile: uploadedFile, certificateRawFile: file } : q
        )
      )
    }
  }

  const handleRemoveCertificate = (id: string) => {
    setQualifications(
      qualifications.map(q => {
        if (q.id === id && q.certificateFile?.url.startsWith('blob:')) {
          // Clean up blob URL
          URL.revokeObjectURL(q.certificateFile.url)
        }
        return q.id === id ? { ...q, certificateFile: null, certificateRawFile: undefined } : q
      })
    )
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Column: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 justify-center p-12 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-800 opacity-90" />
        <div className="relative z-10 w-full max-w-sm">
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="bg-white p-2 rounded-xl">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-3xl font-bold tracking-tight">ConsultBook</span>
          </Link>
          
          <h1 className="text-4xl font-extrabold mb-6 leading-tight">
            Start Your Journey <br /> 
            <span className="text-blue-200">With Us Today.</span>
          </h1>
          
          <p className="text-lg text-blue-100 mb-10 leading-relaxed">
            Join a global network of professionals and clients. Seamless booking, secure payments, and expert advice at your fingertips.
          </p>

          <div className="space-y-6 pt-8 border-t border-blue-500/50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/30 flex items-center justify-center border border-blue-400/30">
                <Check className="h-5 w-5" />
              </div>
              <p className="font-medium">Verified Professional Network</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/30 flex items-center justify-center border border-blue-400/30">
                <Check className="h-5 w-5" />
              </div>
              <p className="font-medium">Secure & Encrypted Platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-2 sm:p-8 bg-gray-50/50 overflow-y-auto">
        <div className="w-full max-w-2xl py-8">
          <div className="lg:hidden flex items-center justify-center mb-8 mr-6">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="ml-3 text-2xl font-bold text-gray-900">ConsultBook</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create your account</h2>
            <p className="text-gray-600 mt-2">Get started by choosing your account type below</p>
          </div>

          <Card className="border-none shadow-xl lg:shadow-none lg:bg-transparent">
            <CardContent className="p-2 sm:p-6 lg:p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/80 rounded-xl">
                  <TabsTrigger 
                    value="client" 
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Client
                  </TabsTrigger>
                  <TabsTrigger 
                    value="consultant" 
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Consultant
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="client">
                  <form onSubmit={handleClientRegister} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client-name">Full Name</Label>
                        <Input
                          id="client-name"
                          type="text"
                          required
                          value={clientData.name}
                          onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client-email" className={errors.email ? "text-destructive" : ""}>Email</Label>
                        <Input
                          id="client-email"
                          type="email"
                          required
                          className={`h-11 ${errors.email ? "border-destructive" : ""}`}
                          value={clientData.email}
                          onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                        />
                        {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Phone Number</Label>
                      <Input
                        id="client-phone"
                        type="tel"
                        required
                        value={clientData.phone}
                        onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                        className="h-11"
                      />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client-password" className={errors.password ? "text-destructive" : ""}>Password</Label>
                        <div className="relative">
                          <Input
                            id="client-password"
                            type={showPassword ? "text" : "password"}
                            required
                            className={`h-11 ${errors.password ? "border-destructive" : ""}`}
                            value={clientData.password}
                            onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <PasswordStrength password={clientData.password} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client-confirm-password" className={errors.confirmPassword ? "text-destructive" : ""}>Confirm Password</Label>
                        <Input
                          id="client-confirm-password"
                          type={showPassword ? "text" : "password"}
                          required
                          className={`h-11 ${errors.confirmPassword ? "border-destructive" : ""}`}
                          value={clientData.confirmPassword}
                          onChange={(e) => setClientData({ ...clientData, confirmPassword: e.target.value })}
                        />
                        {clientData.confirmPassword && (
                          <p className={`text-xs font-medium ${clientData.password === clientData.confirmPassword ? "text-green-600" : "text-destructive"}`}>
                            {clientData.password === clientData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                          </p>
                        )}
                        {errors.confirmPassword && <p className="text-xs text-destructive font-medium">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold" disabled={loading}>
                      {loading ? "Creating Account..." : "Register as Client"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="consultant">
                  <form onSubmit={handleConsultantRegister} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="consultant-name">Full Name</Label>
                        <Input
                          id="consultant-name"
                          type="text"
                          required
                          value={consultantData.name}
                          onChange={(e) => setConsultantData({ ...consultantData, name: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultant-email" className={errors.email ? "text-destructive" : ""}>Email</Label>
                        <Input
                          id="consultant-email"
                          type="email"
                          required
                          className={`h-11 ${errors.email ? "border-destructive" : ""}`}
                          value={consultantData.email}
                          onChange={(e) => setConsultantData({ ...consultantData, email: e.target.value })}
                        />
                        {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="consultant-phone">Phone Number</Label>
                        <Input
                          id="consultant-phone"
                          type="tel"
                          required
                          value={consultantData.phone}
                          onChange={(e) => setConsultantData({ ...consultantData, phone: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultant-type" className={errors.consultantType ? "text-destructive" : ""}>Consultant Type *</Label>
                        <Select onValueChange={(value) => setConsultantData({ ...consultantData, consultantType: value })}>
                          <SelectTrigger className={`h-11 ${errors.consultantType ? "border-destructive" : ""}`}>
                            <SelectValue placeholder="Select your field" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONSULTANT_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.consultantType && <p className="text-xs text-destructive font-medium">{errors.consultantType}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultant-specializations" className={errors.specializations ? "text-destructive" : ""}>Specializations *</Label>
                      <Input
                        id="consultant-specializations"
                        type="text"
                        required
                        placeholder="e.g., Cardiac Surgery, Taxation, Startup Strategy"
                        value={consultantData.specializations}
                        onChange={(e) => setConsultantData({ ...consultantData, specializations: e.target.value })}
                        className={`h-11 ${errors.specializations ? "border-destructive" : ""}`}
                      />
                      <p className="text-xs text-gray-500">Separate multiple specializations with commas</p>
                      {errors.specializations && <p className="text-xs text-destructive font-medium">{errors.specializations}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultant-address">Address</Label>
                      <Input
                        id="consultant-address"
                        type="text"
                        required
                        value={consultantData.address}
                        onChange={(e) => setConsultantData({ ...consultantData, address: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="consultant-city">City</Label>
                        <Input
                          id="consultant-city"
                          type="text"
                          required
                          placeholder="e.g., New York"
                          value={consultantData.city}
                          onChange={(e) => setConsultantData({ ...consultantData, city: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultant-state">State / Province</Label>
                        <Input
                          id="consultant-state"
                          type="text"
                          required
                          placeholder="e.g., New York"
                          value={consultantData.state}
                          onChange={(e) => setConsultantData({ ...consultantData, state: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultant-country">Country</Label>
                        <Input
                          id="consultant-country"
                          type="text"
                          required
                          placeholder="e.g., United States"
                          value={consultantData.country}
                          onChange={(e) => setConsultantData({ ...consultantData, country: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Qualifications Section */}
                    <div className="space-y-4 border-t pt-6">
                      <div>
                        <Label className="text-base font-semibold">Qualifications & Certificates *</Label>
                        <p className="text-xs text-gray-500 mt-1">Add your qualifications with supporting certificates for admin review</p>
                      </div>

                      {/* Add New Qualification */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                        <Label htmlFor="qual-name" className="font-medium">Add New Qualification</Label>
                        <Input
                          id="qual-name"
                          type="text"
                          placeholder="e.g., MD in Cardiology, CFA Level 3"
                          value={newQualName}
                          onChange={(e) => setNewQualName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddQualification()
                            }
                          }}
                          className="h-11"
                        />
                        <Button
                          type="button"
                          onClick={handleAddQualification}
                          variant="outline"
                          className="w-full border-blue-300 text-blue-600 hover:bg-blue-100"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Qualification
                        </Button>
                      </div>

                      {/* Listed Qualifications */}
                      {qualifications.length > 0 && (
                        <div className="space-y-3 border-t pt-4">
                          {qualifications.map((qual, idx) => (
                            <div key={qual.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{idx + 1}. {qual.name}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveQualification(qual.id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm">Upload Certificate (PDF or Image)</Label>
                                {qual.certificateFile ? (
                                  <div className="bg-white p-3 rounded border border-green-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Check className="h-4 w-4 text-green-600" />
                                      <span className="text-sm text-green-700 font-medium">{qual.certificateFile.originalName}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveCertificate(qual.id)}
                                      className="text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleQualificationCertificateUpload(qual.id, e)}
                                    className="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-md file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-50 file:text-blue-700
                                      hover:file:bg-blue-100"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Empty State */}
                      {qualifications.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-gray-600 text-sm">No qualifications added yet</p>
                        </div>
                      )}
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="consultant-password" className={errors.password ? "text-destructive" : ""}>Password</Label>
                        <div className="relative">
                          <Input
                            id="consultant-password"
                            type={showPassword ? "text" : "password"}
                            required
                            className={`h-11 ${errors.password ? "border-destructive" : ""}`}
                            value={consultantData.password}
                            onChange={(e) => setConsultantData({ ...consultantData, password: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <PasswordStrength password={consultantData.password} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultant-confirm-password" className={errors.confirmPassword ? "text-destructive" : ""}>Confirm Password</Label>
                        <Input
                          id="consultant-confirm-password"
                          type={showPassword ? "text" : "password"}
                          required
                          className={`h-11 ${errors.confirmPassword ? "border-destructive" : ""}`}
                          value={consultantData.confirmPassword}
                          onChange={(e) => setConsultantData({ ...consultantData, confirmPassword: e.target.value })}
                        />
                        {consultantData.confirmPassword && (
                          <p className={`text-xs font-medium ${consultantData.password === consultantData.confirmPassword ? "text-green-600" : "text-destructive"}`}>
                            {consultantData.password === consultantData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                          </p>
                        )}
                        {errors.confirmPassword && <p className="text-xs text-destructive font-medium">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold" disabled={loading}>
                      {loading ? "Submitting Application..." : "Apply as Consultant"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-8 text-center border-t border-gray-100 pt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
