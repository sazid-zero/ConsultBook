"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if already logged in as admin
    if (typeof window !== 'undefined' && localStorage.getItem('adminSession')) {
      router.push('/dashboard/admin')
    }
  }, [router])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Simple admin check - in production, use proper admin authentication
      if (email === "admin@consultbook.com" && password === "admin123") {
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
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Left Column: Info & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 items-center justify-center p-12 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90" />
        <div className="relative z-10 max-w-lg">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="bg-white p-2 rounded-xl">
              <Calendar className="h-8 w-8 text-gray-900" />
            </div>
            <span className="text-3xl font-bold tracking-tight">ConsultBook</span>
          </Link>
          
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Admin Portal
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Manage consultants, review qualifications, and oversee the platform from the admin dashboard.
          </p>

          <div className="pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              For security reasons, this login page is not publicly listed.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-2 sm:p-8 bg-gray-50/50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8 mr-6">
            <Calendar className="h-8 w-8 text-gray-900" />
            <span className="ml-3 text-2xl font-bold text-gray-900">ConsultBook</span>
          </div>

          <Card className="border-none shadow-xl lg:shadow-none lg:bg-transparent">
            <CardHeader className="space-y-1 px-2 pb-8 text-center lg:text-left">
              <CardTitle className="text-2xl font-bold tracking-tight">Admin Access</CardTitle>
              <CardDescription className="text-base">
                Sign in to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-0">
              <form onSubmit={handleAdminLogin} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@consultbook.com"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
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
                <Button type="submit" className="w-full h-11 bg-gray-900 hover:bg-black text-base font-semibold" disabled={loading}>
                  {loading ? "Verifying..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-8 text-center border-t border-gray-100 pt-8">
                <p className="text-sm text-gray-600">
                  <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-500">
                    Back to user login
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
