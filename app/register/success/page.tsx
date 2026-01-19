"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mail, Clock } from "lucide-react"

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Registration Submitted!</CardTitle>
          <CardDescription>Thank you for joining ConsultBook</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-left bg-blue-50 p-4 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Under Review</p>
                <p className="text-sm text-blue-800">Your profile and certificates are currently being reviewed by our admin team.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-left bg-green-50 p-4 rounded-lg">
              <Mail className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Email Notification</p>
                <p className="text-sm text-green-800">You will receive an email once your account has been approved. This usually takes 24-48 hours.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col space-y-2">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">Return Home</Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
