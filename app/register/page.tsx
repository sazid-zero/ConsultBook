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
import FileUpload from "@/components/file-upload"
import { toast } from "sonner"

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  url: string
  contentType: string
}

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
  const [profilePhoto, setProfilePhoto] = useState<UploadedFile[]>([])
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
    specialty: "",
    address: "",
    qualifications: "",
  })

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
        profilePhoto: profilePhoto.length > 0 ? profilePhoto[0].url : null,
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

  const handleConsultantRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (activeTab === "consultant" && profilePhoto.length === 0) {
      toast.error("Profile Photo Required", {
        description: "Please upload a profile photo."
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

    if (certificates.length === 0) {
      toast.error("Required Documents Missing", {
        description: "Please upload at least one certificate for review."
      })
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, consultantData.email, consultantData.password)

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: consultantData.name,
        email: consultantData.email,
        phone: consultantData.phone,
        role: "consultant",
        specialty: consultantData.specialty,
        address: consultantData.address,
        qualifications: consultantData.qualifications,
        certificates: certificates.map((cert) => ({
          id: cert.id,
          filename: cert.filename,
          originalName: cert.originalName,
          url: cert.url,
        })),
        profilePhoto: profilePhoto.length > 0 ? profilePhoto[0].url : null,
        approved: false,
        createdAt: new Date().toISOString(),
      })

      router.push("/register/success")
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
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Calendar className="h-10 w-10 text-blue-600" />
            <span className="ml-3 text-3xl font-bold text-gray-900">ConsultBook</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
            <p className="text-gray-600 mt-2">Get started by choosing your account type below</p>
          </div>

          <Card className="border-none shadow-xl lg:shadow-none lg:bg-transparent">
            <CardContent className="p-2 sm:p-6 lg:p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/80 p-1 rounded-xl">
                  <TabsTrigger 
                    value="client" 
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5"
                  >
                    Client
                  </TabsTrigger>
                  <TabsTrigger 
                    value="consultant" 
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5"
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

                    <div className="space-y-2">
                      <Label>Profile Photo (Optional)</Label>
                      <FileUpload
                        userId="temp-client"
                        fileType="profile"
                        onUploadComplete={setProfilePhoto}
                        multiple={false}
                        accept="image/*"
                        maxSize={5}
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
                        <Label htmlFor="consultant-specialty">Specialty</Label>
                        <Select onValueChange={(value) => setConsultantData({ ...consultantData, specialty: value })}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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

                    <div className="space-y-2">
                      <Label htmlFor="consultant-qualifications">Qualifications</Label>
                      <Textarea
                        id="consultant-qualifications"
                        required
                        value={consultantData.qualifications}
                        onChange={(e) => setConsultantData({ ...consultantData, qualifications: e.target.value })}
                        placeholder="List your qualifications, degrees, certifications..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Profile Photo *</Label>
                      <FileUpload
                        userId="temp-consultant"
                        fileType="profile"
                        onUploadComplete={setProfilePhoto}
                        multiple={false}
                        accept="image/*"
                        maxSize={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Certificates *</Label>
                      <FileUpload
                        userId="temp-consultant"
                        fileType="certificate"
                        onUploadComplete={setCertificates}
                        multiple={true}
                        accept=".pdf,image/*"
                        maxSize={10}
                      />
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
