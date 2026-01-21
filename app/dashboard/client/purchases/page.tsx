"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getClientDashboardData } from "@/app/actions/dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Search, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function ClientPurchasesPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  async function loadData() {
    setLoading(true)
    const data = await getClientDashboardData(user!.uid)
    if (data) {
      setOrders(data.orders || [])
    }
    setLoading(false)
  }

  if (loading || authLoading) {
     return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">My Purchases</h1>
              <p className="text-gray-500 font-medium">Access your digital assets, books, and courses.</p>
           </div>
           <Link href="/library">
              <Button className="rounded-xl font-bold bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:text-blue-600 shadow-sm">
                 <Search className="h-4 w-4 mr-2" />
                 Browse More
              </Button>
           </Link>
        </div>

        {orders.length === 0 ? (
           <div className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-gray-100">
               <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 text-blue-400" />
               </div>
               <h2 className="text-xl font-bold text-gray-900 mb-2">No purchases yet</h2>
               <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">Start building your knowledge library today with our curated resources.</p>
               <Link href="/library">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl px-8 h-12 shadow-lg shadow-blue-200">
                     Explore Marketplace
                  </Button>
               </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-[24px] overflow-hidden bg-white group">
                  <div className="p-2">
                     <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
                        {order.thumbnailUrl ? (
                           <img src={order.thumbnailUrl} alt={order.productTitle} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                           <div className="h-full w-full flex items-center justify-center bg-blue-50 text-blue-400">
                              <ShoppingBag className="h-10 w-10" />
                           </div>
                        )}
                        <div className="absolute top-2 left-2">
                           <Badge className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm border-none shadow-sm font-bold text-[10px] uppercase tracking-wider">
                              {order.productType}
                           </Badge>
                        </div>
                     </div>
                  </div>
                  
                  <CardContent className="p-6 pt-2">
                    <div className="mb-4">
                       <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {order.productTitle}
                       </h3>
                       <p className="text-sm text-gray-500 font-medium">By {order.consultantName}</p>
                    </div>

                    <div className="flex items-center justify-between mb-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                       <span>Purchased {new Date(order.purchaseDate).toLocaleDateString()}</span>
                       <span>${(order.amount / 100).toFixed(2)}</span>
                    </div>

                    {order.fileUrl ? (
                       <a href={order.fileUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 text-sm font-bold shadow-lg shadow-gray-200">
                             Download Content
                          </Button>
                       </a>
                    ) : (
                       <Link href={`/library/${order.productId}`} className="block w-full">
                          <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-11 text-sm font-bold">
                             View Details
                          </Button>
                       </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
           </div>
        )}
      </div>
    </div>
  )
}
