"use client"

import React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Shield, Clock, Star, CheckCircle, TrendingUp, Award, MapPin, DollarSign, ChevronRight, Check, Search, MessageCircle, FileText, Send, X, User as UserIcon, Video, BookOpen, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
      <section className="relative h-[calc(100vh-64px)] items-center flex justify-center overflow-hidden isolate">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 will-change-transform translate-z-0"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] translate-z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors px-4 py-1.5 text-sm font-bold rounded-full shadow-sm">
            v3.0 Now Live — The Expert Ecosystem
          </Badge>
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
            The World's Most <br className="hidden lg:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Powerful Knowledge Hub</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            From 1-on-1 consultations to exclusive digital masterclasses and expert-led workshops. 
            Everything you need to accelerate your growth in one unified platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            {!loading && user ? (
              <Link href={dashboardHref}>
                <Button size="lg" className="px-10 h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-2xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95">
                  Access My Dashboard
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register?type=client">
                  <Button size="lg" className="px-10 h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-2xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
                    Start Learning
                  </Button>
                </Link>
                <Link href="/register?type=consultant">
                  <Button variant="outline" size="lg" className="px-10 h-14 border-white/20 bg-white/5 text-white hover:bg-white hover:text-black text-lg font-bold rounded-2xl transition-all w-full sm:w-auto">
                    Become an Expert
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-6 opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm font-bold text-gray-300">Verified Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm font-bold text-gray-300">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm font-bold text-gray-300">Lifetime Access</span>
            </div>
          </div>
        </div>
      </section>



      {/* Stats Section with Visual */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Professional Clean Mockup */}
            <div className="relative h-96 lg:h-full min-h-96 flex items-center justify-center overflow-hidden pointer-events-none shadow-2xl">
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
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop" alt="Fatima Ahmed" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
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
                          <span className="font-semibold text-gray-700">$5/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consultant 2 */}
                  <div className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group/card">
                    <div className="flex items-start gap-4">
                      <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=128&h=128&fit=crop" alt="Anik Islam" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
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
                          <span className="font-semibold text-gray-700">$4/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consultant 3 */}
                  <div className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group/card ">
                    <div className="flex items-start gap-4">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSExB73QWelAdzbMJ-YbNAf8UHq-ZZaLhqZcA&s" alt="Priya Chakraborty" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
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
                          <span className="font-semibold text-gray-700">$3/hr</span>
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
                <div className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border border-blue-100 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 will-change-transform translate-z-0">
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
                <div className="group bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-6 border border-indigo-100 hover:border-indigo-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 will-change-transform translate-z-0">
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
                <div className="group bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 border border-green-100 hover:border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 will-change-transform translate-z-0">
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
                <div className="group bg-gradient-to-br from-white to-yellow-50 rounded-2xl p-6 border border-yellow-100 hover:border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 will-change-transform translate-z-0">
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
            <div className="group bg-gradient-to-br from-white to-blue-50/50 rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 will-change-transform translate-z-0">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop" alt="Fatima Ahmed" className="w-16 h-16 rounded-full border-4 border-blue-100 shadow-lg object-cover" />
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
                    <span className="font-semibold text-gray-900">$5/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Next available: Today at 2 PM</span>
                  </div>
                </div>

                  <div className="flex gap-2">
                    <Link href="/consultant/consultant_fatima" className="flex-1">
                      <div className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors cursor-pointer">
                        View Profile
                      </div>
                    </Link>
                    <Link href="/consultant/consultant_fatima" className="flex-1">
                      <div className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer">
                        Book Now
                      </div>
                    </Link>
                  </div>
              </div>
            </div>

            {/* Consultant Card 2 */}
            <div className="group bg-gradient-to-br from-white to-indigo-50/50 rounded-2xl overflow-hidden border border-gray-200 hover:border-indigo-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 will-change-transform translate-z-0">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=128&h=128&fit=crop" alt="Anik Islam" className="w-16 h-16 rounded-full border-4 border-indigo-100 shadow-lg object-cover" />
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
                    <span className="font-semibold text-gray-900">$4/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Next available: Tomorrow at 10 AM</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href="/consultant/consultant_anik" className="flex-1">
                    <div className="w-full inline-flex items-center justify-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-100 transition-colors cursor-pointer">
                      View Profile
                    </div>
                  </Link>
                  <Link href="/consultant/consultant_anik" className="flex-1">
                    <div className="w-full inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors cursor-pointer">
                      Book Now
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Consultant Card 3 */}
            <div className="group bg-gradient-to-br from-white to-purple-50/50 rounded-2xl overflow-hidden border border-gray-200 hover:border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 will-change-transform translate-z-0">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSExB73QWelAdzbMJ-YbNAf8UHq-ZZaLhqZcA&s" alt="Priya Chakraborty" className="w-16 h-16 rounded-full border-4 border-purple-100 shadow-lg object-cover" />
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
                    <span className="font-semibold text-gray-900">$3/hr</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Next available: Today at 4 PM</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href="/consultant/consultant_priya" className="flex-1">
                    <div className="w-full inline-flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-100 transition-colors cursor-pointer">
                      View Profile
                    </div>
                  </Link>
                  <Link href="/consultant/consultant_priya" className="flex-1">
                    <div className="w-full inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition-colors cursor-pointer">
                      Book Now
                    </div>
                  </Link>
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
                    <span className="text-gray-900 font-semibold">$5/hr</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold border-t border-blue-200 pt-4 mt-4">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">$5.00</span>
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

      {/* NEW: Expert Marketplace Showcase */}
      <section className="py-24 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-blue-600 font-black text-sm uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">THE MARKETPLACE</span>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">Learn from the Best, <br /> Any Time.</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Unlock exclusive digital assets. Masterclasses, downloadable toolkits, and private e-books written by our top-rated consultants.
              </p>
            </div>
            <Link href="/book-consultant">
              <Button variant="outline" className="h-12 px-8 rounded-xl font-bold border-gray-200 hover:bg-white hover:border-blue-300 group">
                Browse Marketplace
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Mock: Product 1 */}
            <div className="group bg-gradient-to-br from-white to-indigo-50/30 rounded-3xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-2 will-change-transform translate-z-0">
              <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1553481187-be93c21490a9?w=600&h=450&fit=crop" 
                  alt="Marketplace Product" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl font-black text-gray-900 shadow-sm">
                  $3.00
                </div>
              </div>
              <div className="p-8">
                <Badge className="mb-3 bg-indigo-50 text-indigo-700 border-none capitalize">E-Book</Badge>
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Mastering UX Strategy</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">Complete guide to building user-centric products that scale effortlessly in modern markets.</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                       <img src="https://technicalraju.com/wp-content/uploads/2024/07/Muslim-Beautiful-Girl-Pic-and-Hijab-Girl-Pic-for-Profile-Sample-1024x1024.jpg" alt="Author" />
                     </div>
                     <span className="text-sm font-bold text-gray-700">Fatima Ahmed</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                     <span className="text-sm font-bold">4.9</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Project Mock: Product 2 */}
            <div className="group bg-gradient-to-br from-white to-blue-50/30 rounded-3xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-2 will-change-transform translate-z-0">
              <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&h=450&fit=crop" 
                  alt="Marketplace Product" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl font-black text-gray-900 shadow-sm">
                  $5.00
                </div>
              </div>
              <div className="p-8">
                <Badge className="mb-3 bg-blue-50 text-blue-700 border-none capitalize">Video Course</Badge>
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">SaaS Growth Engine</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">Learn the exact framework used to scale startups from $0 to $10M ARR in 24 months.</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop" alt="Author" />
                     </div>
                     <span className="text-sm font-bold text-gray-700">Rohan Hasan</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                     <span className="text-sm font-bold">5.0</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Project Mock: Product 3 */}
            <div className="group bg-gradient-to-br from-white to-purple-50/30 rounded-3xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 hover:-translate-y-2 will-change-transform translate-z-0">
              <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                <img 
                  src="https://plus.unsplash.com/premium_photo-1661719191032-79c57f9b11e6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Marketplace Product" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl font-black text-gray-900 shadow-sm">
                  $1.50
                </div>
              </div>
              <div className="p-8">
                <Badge className="mb-3 bg-purple-50 text-purple-700 border-none capitalize">Digital Toolkit</Badge>
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Consultant Sales Kit</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">All the templates, contracts, and pitch decks you need to start your high-ticket consulting.</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1589386417686-0d34b5903d23?w=64&h=64&fit=crop" alt="Author" />
                     </div>
                     <span className="text-sm font-bold text-gray-700">Zarif Hussain</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                     <span className="text-sm font-bold">4.8</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Live Masterclasses Section */}
      <section className="py-24 bg-white overflow-hidden relative isolate">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-100/40 rounded-full blur-[80px] -z-1 translate-z-0 will-change-[filter]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-indigo-600 font-black text-sm uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-6 inline-block">LIVE WORKSHOPS</span>
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tight">Interactive <br /> Masterclasses</h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Join live group sessions hosted by top industry leaders. Real-time Q&A, collaborative brainstorming, and hands-on learning with experts worldwide.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Real-time Feedback</h4>
                    <p className="text-gray-600">Get your questions answered instantly by the host.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Networking Hub</h4>
                    <p className="text-gray-600">Connect with other ambitious learners in your industry.</p>
                  </div>
                </div>
              </div>

              <Link href="/book-consultant">
                <Button size="lg" className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100">
                  Find a Workshop
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-4 shadow-2xl rotate-3">
                 <div className="bg-white rounded-[2.2rem] overflow-hidden lg:aspect-square">
                    <img 
                      src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=800&h=800&fit=crop" 
                      className="w-full h-full object-cover -rotate-3 hover:rotate-0 transition-transform duration-700" 
                      alt="Workshop Preview" 
                    />
                    <div className="absolute bottom-12 left-12 right-12 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl -rotate-3 border border-indigo-50">
                       <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-indigo-600 text-white border-transparent">TODAY • 4:00 PM</Badge>
                          <span className="text-indigo-600 font-black">$1.50</span>
                       </div>
                       <h4 className="text-xl font-black text-gray-900 mb-2">Public Speaking for Introverts</h4>
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=64&h=64&fit=crop" alt="Dr. Sameer Khan" />
                          </div>
                          <span className="text-sm font-bold text-gray-600">with Dr. Sameera</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Global Command Feature */}
      <section className="py-24 bg-gray-950 text-white overflow-hidden relative isolate">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all">
              Power Search v3.0
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-6">Expertise at Your <br className="hidden lg:block" /> Fingertips</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our advanced Command Palette lets you discover consultants, launch workshops, and access your library with a single keystroke.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              {/* Floating Key Hints */}
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl shadow-2xl">⌘</div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl shadow-2xl">K</div>
              </div>

              {/* Mock Command Dialog */}
              <div className="bg-[#1c1c1c] border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden transition-all group-hover:border-blue-500/30 will-change-transform translate-z-0">
                <div className="px-6 py-5 border-b border-white/5 flex items-center gap-4">
                  <Search className="h-5 w-5 text-gray-500" />
                  <span className="text-lg text-gray-500 font-medium">Search for consultants, products, or commands...</span>
                </div>
                <div className="p-4 space-y-1">
                  <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                         <p className="font-bold text-sm">Find Business Strategists</p>
                         <p className="text-xs text-gray-500">Search specialized consultants</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 uppercase">Quick Link</span>
                  </div>

                  <div className="px-4 py-4 rounded-2xl flex items-center justify-between hover:bg-white/5 group/item transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                        <Award className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                         <p className="font-bold text-sm">Browse Top Rated Products</p>
                         <p className="text-xs text-gray-500">Featured e-books & masterclasses</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-4 rounded-2xl flex items-center justify-between hover:bg-white/5 group/item transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                         <p className="font-bold text-sm">Upcoming Workshops</p>
                         <p className="text-xs text-gray-500">Next live sessions this week</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#151515] px-6 py-3 border-t border-white/5 flex justify-between items-center">
                   <div className="flex gap-4">
                     <span className="text-[10px] text-gray-500 flex items-center gap-1.5"><span className="bg-white/10 px-1 rounded">↑↓</span> Navigate</span>
                     <span className="text-[10px] text-gray-500 flex items-center gap-1.5"><span className="bg-white/10 px-1 rounded">↵</span> Select</span>
                   </div>
                   <span className="text-[10px] text-gray-500">Knowledge Search v3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Real-time Messaging Hub */}
      <section className="py-24 bg-white overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="order-2 lg:order-1 relative">
                  <div className="relative bg-gray-50 rounded-[3rem] p-10 border border-gray-100 shadow-2xl isolate will-change-transform translate-z-0">
                     <div className="absolute -top-6 -right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl animate-bounce">
                        <MessageCircle className="h-8 w-8" />
                     </div>
                     <div className="space-y-6">
                        <div className="flex gap-4">
                           <div className="w-12 h-12 rounded-full bg-blue-600 overflow-hidden flex-shrink-0 relative">
                              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop" alt="Fatima" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 ring-1 ring-blue-500/20 rounded-full" />
                           </div>
                           <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 italic text-gray-500 text-sm">
                              "Hi Akash! I've uploaded the strategy roadmap to our chat. Let's discuss it during our call tomorrow."
                           </div>
                        </div>
                        <div className="flex gap-4 flex-row-reverse">
                           <div className="w-12 h-12 rounded-full bg-indigo-600 overflow-hidden flex-shrink-0">
                              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop" alt="Akash" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-sm text-white text-sm font-medium">
                              "Perfect! Just reviewed it. The growth projections look incredible. Can't wait!"
                           </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                           <div className="flex items-center gap-3">
                              <div className="bg-red-50 p-2 rounded-lg">
                                 <FileText className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-gray-800">Growth_Strategy.pdf</p>
                                 <p className="text-xs text-gray-400">2.4 MB • Shared 5 mins ago</p>
                              </div>
                           </div>
                           <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50">Download</Button>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="order-1 lg:order-2">
                  <span className="text-blue-600 font-black text-sm uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-6 inline-block">REAL-TIME SYNC</span>
                  <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 underline decoration-blue-500/30">Never Miss <br /> a Beat.</h2>
                  <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                     Integrated chat, file-sharing, and notifications keep you connected to your experts. Share ideas, provide feedback, and grow together in a secure environment.
                  </p>
                  <Link href="/messages">
                     <Button size="lg" className="h-14 px-10 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold shadow-xl shadow-gray-200">
                        Explore Messaging
                        <Send className="ml-2 h-4 w-4" />
                     </Button>
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Client Dashboard Preview Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full text-sm font-semibold mb-4">YOUR COMMAND CENTER</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Manage Everything in One Place</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Track appointments, access your library, and stay connected with your experts</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xl isolate will-change-transform translate-z-0">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-white mb-2">Welcome back, Akash!</h3>
                  <p className="text-indigo-100 text-sm">Here's what's happening with your consultations</p>
                </div>
                <div className="hidden lg:flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next: Today at 2 PM
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-8 bg-gradient-to-b from-indigo-50/50 to-white border-b border-gray-100">
              <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-600 transition-all duration-300">
                    <Calendar className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">This Month</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">12</div>
                <p className="text-gray-600 text-sm font-medium">Total Sessions</p>
              </div>

              <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-600 transition-all duration-300">
                    <Clock className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Upcoming</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">3</div>
                <p className="text-gray-600 text-sm font-medium">Scheduled</p>
              </div>

              <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-600 transition-all duration-300">
                    <Check className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">↑ 25%</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">9</div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-black text-gray-900">Upcoming Appointments</h4>
                    <Link href="/dashboard/client">
                      <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">View All →</span>
                    </Link>
                  </div>

                  {/* Appointment Card 1 */}
                  <div className="group border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img src="https://technicalraju.com/wp-content/uploads/2024/07/Muslim-Beautiful-Girl-Pic-and-Hijab-Girl-Pic-for-Profile-Sample-1024x1024.jpg" alt="Fatima Ahmed" className="w-14 h-14 rounded-full object-cover ring-4 ring-indigo-50" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 text-lg mb-1">Business Strategy Session</h5>
                          <p className="text-sm text-gray-600 font-medium">with Fatima Ahmed</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-gray-700">4.9</span>
                            <span className="text-xs text-gray-500 ml-1">• Business Strategy</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                        <Check className="h-3 w-3 mr-1" />
                        Confirmed
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 pb-5 border-t border-gray-100 pt-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">Jan 25, 2025</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">2:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Video Call</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-gray-900">$5</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button size="sm" variant="outline" className="flex-1 font-semibold">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-semibold">
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </Button>
                    </div>
                  </div>

                  {/* Appointment Card 2 */}
                  <div className="group border border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img src="https://img.freepik.com/premium-photo/engaging-lifestyle-photograph-capturing-modern-young-indian-man_948023-4921.jpg?semt=ais_user_personalization&w=740&q=80" alt="Anik Islam" className="w-14 h-14 rounded-full object-cover ring-4 ring-purple-50" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 text-lg mb-1">Career Development Coaching</h5>
                          <p className="text-sm text-gray-600 font-medium">with Anik Islam</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-gray-700">4.8</span>
                            <span className="text-xs text-gray-500 ml-1">• Career Coach</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
                        Pending
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 pb-5 border-t border-gray-100 pt-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Jan 27, 2025</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">10:00 AM</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Phone Call</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-gray-900">$4</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button size="sm" variant="outline" className="flex-1 font-semibold text-red-600 border-red-200 hover:bg-red-50">
                        Cancel
                      </Button>
                      <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 font-semibold">
                        Confirm Booking
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sidebar: Quick Actions & Recent Activity */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <Link href="/book-consultant">
                        <div className="group cursor-pointer bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">Book Session</p>
                              <p className="text-xs text-gray-600">Find an expert</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>

                      <Link href="/library">
                        <div className="group cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600 rounded-lg">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">Browse Library</p>
                              <p className="text-xs text-gray-600">Digital products</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>

                      <Link href="/messages">
                        <div className="group cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg relative">
                              <MessageCircle className="h-5 w-5 text-white" />
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">3</div>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">Messages</p>
                              <p className="text-xs text-gray-600">3 unread</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">Session Completed</p>
                          <p className="text-xs text-gray-600">Marketing Strategy with Priya</p>
                          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">New Purchase</p>
                          <p className="text-xs text-gray-600">Growth Hacking E-book</p>
                          <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Video className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">Workshop Joined</p>
                          <p className="text-xs text-gray-600">Public Speaking Masterclass</p>
                          <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link href="/dashboard/client">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg" size="lg">
                      Open Full Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
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
                  <img src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=128&h=128&fit=crop" alt="Saira Begum" className="w-full h-full rounded-full object-cover" />
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
                  <img src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=128&h=128&fit=crop" alt="Ashraf Rahman" className="w-full h-full rounded-full object-cover" />
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
                  <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&h=128&fit=crop" alt="Nadia Khan" className="w-full h-full rounded-full object-cover" />
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
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

            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
              <p className="text-gray-400 mb-4 text-sm">Subscribe for research updates and academic insights.</p>
              <div className="flex flex-col gap-3">
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 h-10"
                />
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-10">
                  Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
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

