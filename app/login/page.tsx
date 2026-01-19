"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { user, userData, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

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

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()

        if (userData.role === "consultant" && !userData.approved) {
          toast.error("Account Pending Approval", {
            description: "Your consultant application is still pending approval."
          })
          setLoading(false)
          return
        }

        // Redirect based on role
        if (userData.role === "client") {
          router.push("/dashboard/client")
        } else if (userData.role === "consultant") {
          router.push("/dashboard/consultant")
        }
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError("Invalid email or password")
      } else {
        toast.error("Login failed", {
          description: error.message
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Simple admin check - in production, use proper admin authentication
      if (adminEmail === "admin@consultbook.com" && adminPassword === "admin123") {
        localStorage.setItem("adminSession", "true")
        toast.success("Admin Access Granted", {
          description: "Redirecting to admin dashboard..."
        })
        router.push("/dashboard/admin")
      } else {
        setError("Invalid admin credentials")
      }
    } catch (error: any) {
      toast.error("Admin Login Error", {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-white flex overflow-hidden">
      {/* Left Column: Info & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 items-center justify-center p-12 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-800 opacity-90" />
        <div className="relative z-10 max-w-lg">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="bg-white p-2 rounded-xl">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-3xl font-bold tracking-tight">ConsultBook</span>
          </Link>
          
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Connect with Experts, <br /> 
            <span className="text-blue-200">Grow Faster.</span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            The world's most trusted platform for professional consultations. Book, manage, and scale your expert network in one place.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-blue-500/50">
            <div>
              <p className="text-3xl font-bold mb-1">10k+</p>
              <p className="text-blue-200 text-sm">Expert Consultants</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-1">50k+</p>
              <p className="text-blue-200 text-sm">Successful Sessions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-2 sm:p-8 bg-gray-50/50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8 mr-6">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="ml-3 text-2xl font-bold text-gray-900">ConsultBook</span>
          </div>

          <Card className="border-none shadow-xl lg:shadow-none lg:bg-transparent">
            <CardHeader className="space-y-1 px-2 pb-8 text-center lg:text-left">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Choose your login method and access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-0">
              <Tabs defaultValue="user" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/80">
                  <TabsTrigger value="user" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">User Login</TabsTrigger>
                  <TabsTrigger value="admin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Admin Login</TabsTrigger>
                </TabsList>

                <TabsContent value="user">
                  <form onSubmit={handleUserLogin} className="space-y-5">
                    {error && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                        <p className="text-sm font-medium text-red-600">{error}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="name@example.com"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10 h-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="admin">
                  <form onSubmit={handleAdminLogin} className="space-y-5">
                    {error && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                        <p className="text-sm font-medium text-red-600">{error}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@consultbook.com"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Admin Password</Label>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="pr-10 h-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gray-900 hover:bg-black text-base font-semibold" disabled={loading}>
                      {loading ? "Verifying..." : "Admin Sign In"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-8 text-center border-t border-gray-100 pt-8">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-500">
                    Create one now
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
