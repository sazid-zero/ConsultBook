"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Shield, Clock, Star, CheckCircle, TrendingUp, Award, MapPin, DollarSign, ChevronRight, Check, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar/Navbar"

export default function HomePage() {
  const { user, userData, loading } = useAuth()

  const dashboardHref = userData?.role === 'admin' 
    ? '/dashboard/admin' 
    : userData?.role === 'consultant' 
      ? '/dashboard/consultant' 
      : '/dashboard/client'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Connect with Expert Consultants
            <span className="text-blue-600"> Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Book appointments with verified professionals across various fields. Get expert advice through in-person,
            phone, or virtual consultations.
          </p>
          <div className="flex justify-center space-x-4">
            {!loading && user ? (
              <Link href={dashboardHref}>
                <Button size="lg" className="px-8 py-3">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register?type=client">
                  <Button size="lg" className="sm:px-8 py-3 px-4 ">
                    Book a Consultation
                  </Button>
                </Link>
                <Link href="/register?type=consultant">
                  <Button variant="outline" size="lg" className="sm:px-8 px-4 py-3">
                    Join as Consultant
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ConsultBook?</h2>
            <p className="text-lg text-gray-600">Everything you need for seamless consultation booking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Verified Consultants</CardTitle>
                <CardDescription>
                  All consultants are verified with proper credentials and certifications
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Real-time Availability</CardTitle>
                <CardDescription>See live availability and book appointments instantly</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>Your data is protected with enterprise-grade security</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Multiple Consultation Modes</CardTitle>
                <CardDescription>Choose from in-person, phone, or virtual consultations</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Reviews & Ratings</CardTitle>
                <CardDescription>Read reviews and ratings from previous clients</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Easy Rescheduling</CardTitle>
                <CardDescription>Reschedule or cancel appointments with just a few clicks</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section with Visual */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Professional Clean Mockup */}
            <div className="relative h-96 lg:h-full min-h-96 flex items-center justify-center">
              <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 group">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">ConsultBook</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>

                {/* Search & Filters */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Find consultants..." className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full" disabled />
                  </div>
                  <div className="flex gap-2 text-xs">
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">All</div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">Business</div>
                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">Career</div>
                  </div>
                </div>

                {/* Consultant List */}
                <div className="overflow-y-auto h-64 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {/* Consultant 1 */}
                  <div className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group/card">
                    <div className="flex items-start gap-4">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop" alt="Fatima Ahmed" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">Fatima Ahmed</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-700">4.9</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Business Strategy Consultant</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>📍 San Francisco</span>
                          <span className="font-semibold text-gray-700">$150/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consultant 2 */}
                  <div className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group/card">
                    <div className="flex items-start gap-4">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop" alt="Anik Islam" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">Anik Islam</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-700">4.8</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Career & Executive Coach</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>📍 New York</span>
                          <span className="font-semibold text-gray-700">$120/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consultant 3 */}
                  <div className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group/card">
                    <div className="flex items-start gap-4">
                      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop" alt="Priya Chakraborty" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">Priya Chakraborty</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-700">4.9</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Marketing Strategist</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>📍 Los Angeles</span>
                          <span className="font-semibold text-gray-700">$100/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consultant 4 */}
                  <div className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group/card">
                    <div className="flex items-start gap-4">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop" alt="Kabir Hassan" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">Kabir Hassan</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-700">4.7</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">Tech Startup Advisor</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>📍 Austin</span>
                          <span className="font-semibold text-gray-700">$180/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 text-center">
                  Showing 1-4 of 12,000+ consultants
                </div>
              </div>
            </div>

            {/* Right - Stats Grid */}
            <div className="space-y-8">
              <div>
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">BY THE NUMBERS</span>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
                <p className="text-xl text-gray-600">Growing every day with satisfied consultants and clients</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Stat 1 */}
                <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-all duration-300">
                      <TrendingUp className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">↑ 45%</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">12K+</div>
                  <p className="text-gray-600 text-sm">Expert Consultants</p>
                </div>

                {/* Stat 2 */}
                <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-all duration-300">
                      <Users className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">↑ 38%</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">85K+</div>
                  <p className="text-gray-600 text-sm">Active Clients</p>
                </div>

                {/* Stat 3 */}
                <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-600 transition-all duration-300">
                      <Calendar className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">↑ 62%</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">250K+</div>
                  <p className="text-gray-600 text-sm">Consultations Done</p>
                </div>

                {/* Stat 4 */}
                <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-600 transition-all duration-300">
                      <Award className="h-6 w-6 text-yellow-600 group-hover:text-yellow-400 transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Top Rated</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">4.9★</div>
                  <p className="text-gray-600 text-sm">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mock: Browse Consultants Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">FIND EXPERTS</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse Expert Consultants</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover vetted professionals across all specializations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Consultant Card 1 */}
            <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop" alt="Fatima Ahmed" className="w-16 h-16 rounded-full border-4 border-blue-100 shadow-lg object-cover" />
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">4.9</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">Fatima Ahmed</h3>
                <p className="text-blue-600 font-semibold text-sm mb-3">Business Strategy Consultant</p>
                <p className="text-gray-600 text-sm mb-4">10+ years helping startups scale with proven strategies and mentorship.</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">$150/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Next available: Today at 2 PM</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors cursor-pointer">
                    View Profile
                  </div>
                  <div className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer">
                    Book Now
                  </div>
                </div>
              </div>
            </div>

            {/* Consultant Card 2 */}
            <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop" alt="Anik Islam" className="w-16 h-16 rounded-full border-4 border-indigo-100 shadow-lg object-cover" />
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">4.8</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">Anik Islam</h3>
                <p className="text-indigo-600 font-semibold text-sm mb-3">Career & Executive Coach</p>
                <p className="text-gray-600 text-sm mb-4">Helping professionals advance their careers with personalized coaching.</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>New York, NY</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">$120/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Next available: Tomorrow at 10 AM</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-100 transition-colors cursor-pointer">
                    View Profile
                  </div>
                  <div className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors cursor-pointer">
                    Book Now
                  </div>
                </div>
              </div>
            </div>

            {/* Consultant Card 3 */}
            <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop" alt="Priya Chakraborty" className="w-16 h-16 rounded-full border-4 border-purple-100 shadow-lg object-cover" />
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">4.9</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">Priya Chakraborty</h3>
                <p className="text-purple-600 font-semibold text-sm mb-3">Marketing Strategist</p>
                <p className="text-gray-600 text-sm mb-4">Digital marketing specialist with expertise in growth and brand strategy.</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>Los Angeles, CA</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">$100/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Next available: Today at 4 PM</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-100 transition-colors cursor-pointer">
                    View Profile
                  </div>
                  <div className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition-colors cursor-pointer">
                    Book Now
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/book-consultant">
              <Button size="lg" variant="outline" className="px-8">
                Browse All Consultants <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mock: Booking Flow Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-semibold mb-4">SEAMLESS BOOKING</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quick & Easy Booking Process</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Schedule your consultation in just a few clicks</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Calendar & Time Selection */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Select Date & Time</h3>
              
              {/* Simple Calendar Mock */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-semibold text-gray-500 text-sm py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(35)].map((_, i) => {
                    const day = i - 5;
                    const isCurrentMonth = day > 0 && day <= 28;
                    const isSelected = isCurrentMonth && day === 15;
                    const isAvailable = isCurrentMonth && day > 10;
                    
                    return (
                      <button
                        key={i}
                        className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : isAvailable
                            ? "bg-blue-50 text-gray-700 hover:bg-blue-100"
                            : isCurrentMonth
                            ? "text-gray-400"
                            : "text-gray-200"
                        }`}
                      >
                        {isCurrentMonth ? day : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">Available Times</p>
                <div className="grid grid-cols-3 gap-3">
                  {["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"].map((time) => (
                    <button
                      key={time}
                      className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                        time === "02:00 PM"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Booking Summary */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>
                
                <div className="space-y-4 mb-8 pb-8 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Consultant</span>
                    <span className="text-gray-900 font-semibold">Fatima Ahmed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Specialty</span>
                    <span className="text-gray-900 font-semibold">Business Strategy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Date</span>
                    <span className="text-gray-900 font-semibold">Jan 25, 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Time</span>
                    <span className="text-gray-900 font-semibold">2:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Duration</span>
                    <span className="text-gray-900 font-semibold">1 hour</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Mode</span>
                    <span className="inline-flex items-center gap-1 text-gray-900 font-semibold bg-white px-3 py-1 rounded-full text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      Video Call
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Hourly Rate</span>
                    <span className="text-gray-900 font-semibold">$150/hr</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold border-t border-blue-200 pt-4 mt-4">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">$150.00</span>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-base font-semibold">
                  Confirm & Pay
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-600">128-bit encrypted</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Verified Expert</p>
                    <p className="text-xs text-gray-600">Background checked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mock: Client Dashboard Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-4">MANAGE EASILY</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Personal Dashboard</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Manage appointments, track history, and organize your consultations</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Welcome back, Akash!</h3>
                <p className="text-purple-100 text-sm">You have 2 upcoming consultations</p>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm font-semibold">
                  Next: Today at 2 PM
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2">
                  <h4 className="text-lg font-bold text-gray-900 mb-6">Upcoming Consultations</h4>
                  <div className="space-y-4">
                    {/* Appointment Card 1 */}
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=56&h=56&fit=crop" alt="Fatima Ahmed" className="w-14 h-14 rounded-full object-cover" />
                          <div>
                            <h5 className="font-bold text-gray-900">Business Strategy Session</h5>
                            <p className="text-sm text-gray-600">with Fatima Ahmed</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <Check className="h-3 w-3" />
                          Confirmed
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4 pb-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Jan 25, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>2:00 PM - 3:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Video Call</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" variant="outline">Reschedule</Button>
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Join Call</Button>
                      </div>
                    </div>

                    {/* Appointment Card 2 */}
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop" alt="Anik Islam" className="w-14 h-14 rounded-full object-cover" />
                          <div>
                            <h5 className="font-bold text-gray-900">Career Development Coaching</h5>
                            <p className="text-sm text-gray-600">with Anik Islam</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4 pb-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Jan 27, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>10:00 AM - 11:00 AM</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">Phone Call</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" variant="outline">Cancel</Button>
                        <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700">Confirm</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Sidebar */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h4>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <div className="text-sm text-gray-600 mb-2">Completed</div>
                    <div className="text-3xl font-bold text-green-700 mb-2">8</div>
                    <p className="text-xs text-green-600">consultations</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <div className="text-sm text-gray-600 mb-2">Total Spent</div>
                    <div className="text-3xl font-bold text-blue-700 mb-2">$1,200</div>
                    <p className="text-xs text-blue-600">on consultations</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
                    <div className="text-sm text-gray-600 mb-2">Rating</div>
                    <div className="text-3xl font-bold text-yellow-700 mb-2">4.8★</div>
                    <p className="text-xs text-yellow-600">average from consultants</p>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                    View Full Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">SUCCESS STORIES</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Clients & Consultants</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Join thousands who have transformed their consultation experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "ConsultBook completely changed how I manage my consultation business. The platform is intuitive and my clients love the booking experience. I've increased my revenue by 40% in just 3 months."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=56&h=56&fit=crop" alt="Saira Begum" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                <p className="font-semibold text-gray-900">Saira Begum</p>
                  <p className="text-sm text-gray-500">Business Consultant</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "As a first-time consultant seeker, I was nervous. But ConsultBook made it so easy to find the perfect professional. The booking process was smooth and the consultation was invaluable."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop" alt="Ashraf Rahman" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                <p className="font-semibold text-gray-900">Ashraf Rahman</p>
                  <p className="text-sm text-gray-500">Entrepreneur</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The platform's security and professionalism give me confidence. Managing multiple clients, scheduling, and payments is effortless. This is a game-changer for independent consultants."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=56&h=56&fit=crop" alt="Nadia Khan" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                <p className="font-semibold text-gray-900">Nadia Khan</p>
                  <p className="text-sm text-gray-500">Career Coach</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
       <section id="how-it-works" className="py-16 bg-gray-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Sign up as a client or register as a consultant</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Find & Book</h3>
              <p className="text-gray-600">Search for consultants and book available time slots</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Consult</h3>
              <p className="text-gray-600">Attend your consultation and get expert advice</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of satisfied clients and consultants</p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-xl font-bold">ConsultBook</span>
              </div>
              <p className="text-gray-400">Connecting clients with expert consultants worldwide.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Clients</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/book-consultant" className="hover:text-blue-400 transition-colors">Find Consultants</Link></li>
                <li><Link href="/book-consultant" className="hover:text-blue-400 transition-colors">Book Appointments</Link></li>
                <li><Link href="/dashboard/client" className="hover:text-blue-400 transition-colors">Manage Bookings</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Consultants</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register?type=consultant" className="hover:text-blue-400 transition-colors">Join Platform</Link></li>
                <li><Link href="/consultant/schedule" className="hover:text-blue-400 transition-colors">Manage Schedule</Link></li>
                <li><Link href="/dashboard/consultant" className="hover:text-blue-400 transition-colors">Grow Business</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-blue-400 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ConsultBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

