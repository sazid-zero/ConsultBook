"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Trash2, 
  ShoppingCart, 
  ArrowRight, 
  ShoppingBag, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Package
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CartPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load items from localStorage (mock simple cart)
    const savedCart = localStorage.getItem("consultbook_cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
    setLoading(false)
  }, [])

  const removeItem = (id: string) => {
    const updated = items.filter(item => item.id !== id)
    setItems(updated)
    localStorage.setItem("consultbook_cart", JSON.stringify(updated))
    window.dispatchEvent(new Event("cartUpdated"))
    toast.success("Item removed from cart")
  }

  const subtotal = items.reduce((acc, item) => acc + (item.price || 0), 0)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
       <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-3 mb-10">
           <div className="bg-gray-900 p-3 rounded-2xl text-white shadow-xl shadow-gray-200">
              <ShoppingCart className="h-6 w-6" />
           </div>
           <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Review your premium assets</p>
           </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                       <div className="h-24 w-24 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                          {item.type === "workshop" ? <Calendar className="h-10 w-10 text-white/50" /> : <Package className="h-10 w-10 text-white/50" />}
                       </div>
                       <div className="flex-1">
                          <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                             <span>By {item.consultantName}</span>
                             <span>•</span>
                             <span>{item.type || "Digital Asset"}</span>
                          </div>
                       </div>
                       <div className="flex flex-col items-center sm:items-end gap-4 min-w-[100px]">
                          <span className="text-2xl font-black text-gray-900">${((item.price || 0) / 100).toFixed(2)}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => removeItem(item.id)}
                          >
                             <Trash2 className="h-5 w-5" />
                          </Button>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                 <Link href="/library">
                    <Button variant="ghost" className="rounded-xl font-bold text-gray-400 flex items-center gap-2 hover:bg-gray-100">
                       <ArrowRight className="h-4 w-4 rotate-180" />
                       Continue Shopping
                    </Button>
                 </Link>
                 <Button 
                   variant="ghost" 
                   className="rounded-xl font-bold text-red-400 hover:bg-red-50"
                   onClick={() => {
                     setItems([])
                     localStorage.removeItem("consultbook_cart")
                     window.dispatchEvent(new Event("cartUpdated"))
                     toast.success("Cart cleared")
                   }}
                 >
                    Clear Cart
                 </Button>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
               <div className="sticky top-32">
                  <Card className="rounded-[40px] border-none shadow-2xl bg-white p-2 overflow-hidden">
                     <div className="p-10 space-y-8">
                        <div>
                           <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Order Summary</h2>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                                 <span>Subtotal ({items.length} items)</span>
                                 <span className="text-gray-900">${(subtotal / 100).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                                 <span>Tax</span>
                                 <span className="text-gray-900">$0.00</span>
                              </div>
                              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                 <span className="text-lg font-black text-gray-900 uppercase tracking-tighter">Total Price</span>
                                 <span className="text-3xl font-black text-blue-600">${(subtotal / 100).toFixed(2)}</span>
                              </div>
                           </div>
                        </div>

                        <Button 
                          className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                          onClick={() => {
                            // For now, redirect to checkout with first item (products) or first workshop
                            const firstProduct = items.find(i => i.type !== "workshop")
                            const firstWorkshop = items.find(i => i.type === "workshop")
                            
                            if (firstProduct) {
                              window.location.href = `/checkout?productId=${firstProduct.id}`
                            } else if (firstWorkshop) {
                              window.location.href = `/checkout?workshopId=${firstWorkshop.id}`
                            }
                          }}
                        >
                          Checkout Now
                          <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <div className="space-y-4 pt-6 text-center">
                           <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                              Secure Transaction
                           </div>
                           <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <Zap className="h-4 w-4 text-blue-400" />
                              Instant Access Enabled
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-gray-50 p-6 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Info className="h-3 w-3" />
                        Platform fee fully covered
                     </div>
                  </Card>
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[60px] border-2 border-dashed border-gray-200 shadow-sm px-6">
             <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-gray-50/50">
                <ShoppingBag className="h-10 w-10 text-gray-300" />
             </div>
             <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your cart is feeling light.</h2>
             <p className="text-gray-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                Explore our curated library of digital assets and masterclasses to unlock your next level of growth.
             </p>
             <Link href="/library">
                <Button className="h-14 px-10 bg-gray-900 hover:bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all">
                   Browse The Library
                </Button>
             </Link>
          </div>
        )}
      </div>
    </div>
  )
}
