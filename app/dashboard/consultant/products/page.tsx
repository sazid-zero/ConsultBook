"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getProducts } from "@/app/actions/library"
import { getConsultantDashboardDataWithDetails } from "@/app/actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ShoppingBag, 
  TrendingUp, 
  BookOpen, 
  Video, 
  FileDigit,
  DollarSign,
  Package,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function ConsultantProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  async function loadData() {
    setLoading(true)
    const [productsRes, dashboardRes] = await Promise.all([
      getProducts({ consultantId: user?.uid }),
      getConsultantDashboardDataWithDetails(user!.uid)
    ])

    if (productsRes.success) {
      setProducts(productsRes.data || [])
    }

    if (dashboardRes) {
      setStats(dashboardRes.stats)
    }
    setLoading(false)
  }

  // Calculate local stats if dashboard stats are not granular enough or as valid cross-check
  const totalBooks = products.filter(p => p.type === 'book').length
  const totalCourses = products.filter(p => p.type === 'course').length
  const totalAssets = products.filter(p => p.type === 'digital_asset').length
  
  const soldBooks = products.filter(p => p.type === 'book').reduce((acc, p) => acc + p.salesCount, 0)
  const soldCourses = products.filter(p => p.type === 'course').reduce((acc, p) => acc + p.salesCount, 0)
  const soldAssets = products.filter(p => p.type === 'digital_asset').reduce((acc, p) => acc + p.salesCount, 0)
  
  // Total sales count
  const totalSales = products.reduce((acc, p) => acc + p.salesCount, 0)
  
  // Revenue from products (calculated locally from products list current snapshot)
  // Note: This matches `dashboardRes.stats.productEarnings` usually, but that one comes from `productOrders`.
  // `productEarnings` from dashboardRes is more accurate for actual transactions.
  const totalRevenue = stats?.productEarnings || 0

  if (loading) {
     return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2">My Products</h1>
        <p className="text-gray-500 font-medium">Track sales and performance of your digital assets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left: Product List */}
         <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
               <CardHeader className="border-b border-gray-50 p-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">Product Performance</CardTitle>
                    <CardDescription>Sales figures for each item</CardDescription>
                  </div>
                  <Link href="/dashboard/consultant/library">
                     <Button variant="outline" className="rounded-xl font-bold border-gray-200">
                        Manage Library
                     </Button>
                  </Link>
               </CardHeader>
               <CardContent className="p-0">
                  {products.length === 0 ? (
                      <div className="p-12 text-center">
                          <p className="text-gray-500 font-medium mb-4">No products found.</p>
                          <Link href="/dashboard/consultant/library">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">Go to Library to Launch</Button>
                          </Link>
                      </div>
                  ) : (
                      <div className="divide-y divide-gray-50">
                          {products.map((product) => (
                              <div key={product.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors group">
                                  <div className="h-24 w-24 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                      {product.thumbnailUrl ? (
                                          <img src={product.thumbnailUrl} className="h-full w-full object-cover" />
                                      ) : (
                                          <div className="h-full w-full flex items-center justify-center bg-blue-50 text-blue-400">
                                              <Package className="h-8 w-8" />
                                          </div>
                                      )}
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                          <div>
                                              <Badge variant="outline" className="mb-2 uppercase text-[10px] font-bold tracking-wider">{product.type}</Badge>
                                              <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{product.title}</h3>
                                              <p className="text-sm text-gray-500 font-medium line-clamp-1">{product.description}</p>
                                          </div>
                                          <p className="text-lg font-black text-gray-900">${(product.price / 100).toFixed(2)}</p>
                                      </div>
                                      
                                      <div className="mt-4 flex items-center gap-6">
                                          <div className="flex items-center gap-2">
                                              <ShoppingBag className="h-4 w-4 text-green-500" />
                                              <span className="text-sm font-bold text-gray-700">{product.salesCount} Sold</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                              <TrendingUp className="h-4 w-4 text-blue-500" />
                                              <span className="text-sm font-bold text-gray-700">
                                                  ${((product.price * product.salesCount) / 100).toFixed(2)} Revenue
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* Right: Summary Card */}
         <div className="space-y-6">
            <Card className="rounded-[32px] border-none shadow-xl bg-gray-900 text-white overflow-hidden relative">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

               <CardHeader className="p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <DollarSign className="h-5 w-5 text-green-400" />
                     </div>
                     <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Revenue</span>
                  </div>
                  <CardTitle className="text-4xl font-black tracking-tight">
                      ${totalRevenue.toFixed(2)}
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 pt-0 relative z-10 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Sold</p>
                          <p className="text-2xl font-black text-white">{totalSales}</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Products</p>
                          <p className="text-2xl font-black text-white">{products.length}</p>
                      </div>
                  </div>

                  <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 font-medium flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-400" /> E-Books
                          </span>
                          <span className="font-bold text-white">{soldBooks} sold ({totalBooks})</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 font-medium flex items-center gap-2">
                              <Video className="h-4 w-4 text-purple-400" /> Courses
                          </span>
                          <span className="font-bold text-white">{soldCourses} sold ({totalCourses})</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 font-medium flex items-center gap-2">
                              <FileDigit className="h-4 w-4 text-orange-400" /> Assets
                          </span>
                          <span className="font-bold text-white">{soldAssets} sold ({totalAssets})</span>
                      </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-blue-50 to-white overflow-hidden">
                <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2">Grow your Sales</h3>
                    <p className="text-sm text-gray-500 mb-4 font-medium">Create more high-value content to increase your revenue stream.</p>
                    <Link href="/dashboard/consultant/library">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200">
                             Launch New Product <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
