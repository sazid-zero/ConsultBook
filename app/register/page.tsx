"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
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
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("client")
  const [certificates, setCertificates] = useState<UploadedFile[]>([])
  const [profilePhoto, setProfilePhoto] = useState<UploadedFile[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Client form data
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  // Consultant form data
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">ConsultBook</span>
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join our platform as a client or consultant</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="consultant">Consultant</TabsTrigger>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-email" className={errors.email ? "text-destructive" : ""}>Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      required
                      className={errors.email ? "border-destructive" : ""}
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
                        className={errors.password ? "border-destructive" : ""}
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
                      className={errors.confirmPassword ? "border-destructive" : ""}
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

                <Button type="submit" className="w-full" disabled={loading}>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultant-email" className={errors.email ? "text-destructive" : ""}>Email</Label>
                    <Input
                      id="consultant-email"
                      type="email"
                      required
                      className={errors.email ? "border-destructive" : ""}
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultant-specialty">Specialty</Label>
                    <Select onValueChange={(value) => setConsultantData({ ...consultantData, specialty: value })}>
                      <SelectTrigger>
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
                        className={errors.password ? "border-destructive" : ""}
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
                      className={errors.confirmPassword ? "border-destructive" : ""}
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting Application..." : "Apply as Consultant"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
