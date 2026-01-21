"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { registerUser } from "@/app/actions/register"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { user, userData, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    const provider = new GoogleAuthProvider()
    
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Sync with our DB
      const dbResult = await registerUser({
        uid: user.uid,
        email: user.email || "",
        name: user.displayName || "Google User",
        phone: user.phoneNumber || "",
        role: "client", // Default role for social login
        profilePhoto: user.photoURL || undefined
      })

      if (!dbResult.success) {
        toast.error("Database sync failed", {
          description: "We couldn't sync your account with our database."
        })
      }

      toast.success("Login successful")
      // Redirect happens in useEffect
    } catch (error: any) {
      console.error("Google login error:", error)
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error("Google login failed", {
          description: error.message
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address to reset your password."
      })
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("Reset email sent", {
        description: "Check your inbox for password reset instructions."
      })
    } catch (error: any) {
      toast.error("Reset failed", {
        description: error.message
      })
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
                    <button 
                      type="button" 
                      onClick={handleResetPassword}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </button>
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white lg:bg-transparent px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                type="button" 
                className="w-full h-11 border-gray-200 hover:bg-gray-50 font-medium flex items-center justify-center gap-3" 
                onClick={handleGoogleLogin} 
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>

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
