"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getProduct, purchaseProduct } from "@/app/actions/library"
import { getWorkshop, registerForWorkshop } from "@/app/actions/workshops"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck,
  Zap,
  Package,
  Calendar,
  Info
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Suspense } from "react"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const productId = searchParams.get("productId")
  const workshopId = searchParams.get("workshopId")
  const isCartCheckout = searchParams.get("cart") === "true"
  
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!productId && !workshopId && !isCartCheckout) {
      router.push("/library")
      return
    }

    async function fetchData() {
       setLoading(true)
       
       // Scroll to top on mount
       window.scrollTo(0, 0)
       
       if (isCartCheckout) {
          // Load from localStorage
          const savedCart = localStorage.getItem("consultbook_cart")
          if (savedCart) {
             setItems(JSON.parse(savedCart))
          } else {
             router.push("/cart")
          }
          setLoading(false)
          return
       }

       let result
       if (productId) {
         result = await getProduct(productId)
       } else if (workshopId) {
         result = await getWorkshop(workshopId)
       }
       
       if (result?.success) {
         setItems([result.data])
       } else {
         toast.error("Item not found")
         router.push("/library")
       }
       setLoading(false)
    }

    fetchData()
  }, [productId, workshopId, isCartCheckout])

  async function handleCheckout() {
    if (!user) {
      const redirectUrl = isCartCheckout ? "/checkout?cart=true" : `/checkout?${productId ? `productId=${productId}` : `workshopId=${workshopId}`}`
      router.push(`/login?redirect=${redirectUrl}`)
      return
    }

    setProcessing(true)
    // Artificial delay for premium feel
    await new Promise(r => setTimeout(r, 2000))

    const results = await Promise.all(items.map(async (item) => {
       let res
       if (item.type === "workshop" || item.mode) {
          res = await registerForWorkshop(item.id || item.workshopId, user.uid)
       } else {
          res = await purchaseProduct(item.id || item.productId, user.uid)
       }
       return { item, res }
    }))

    const failed = results.filter(r => !r.res?.success)
    const successList = results.filter(r => r.res?.success)

    setProcessing(false)

    if (failed.length === 0) {
      if (isCartCheckout) {
         localStorage.removeItem("consultbook_cart")
         window.dispatchEvent(new Event("cartUpdated"))
      }
      setSuccess(true)
      toast.success("Purchase Successful!")
    } else {
      if (successList.length > 0) {
         // Some succeeded
         if (isCartCheckout) {
            // Update cart to only have failed items
            const failedItemsInCart = failed.map(f => f.item)
            localStorage.setItem("consultbook_cart", JSON.stringify(failedItemsInCart))
            window.dispatchEvent(new Event("cartUpdated"))
         }
         toast.warning(`Partially successful. Could not process: ${failed.map(f => f.item.title).join(", ")}`)
         setSuccess(true) // Still show success screen because some were bought
      } else {
         toast.error(`Purchase failed: ${failed.map(f => f.item.title).join(", ")}`)
      }
    }
  }

  const subtotal = items.reduce((acc, item) => acc + (item.price || 0), 0)

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
         <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Securing session...</p>
         </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
         <div className="max-w-md w-full text-center">
            <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-green-100/50">
               <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Payment Complete!</h1>
            <p className="text-gray-500 font-medium leading-relaxed mb-10">
               Your order has been processed successfully. You can now access your content or view your workshop details in your dashboard.
            </p>
            <div className="space-y-4">
               <Link href="/dashboard/client">
                  <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all hover:scale-[1.02]">
                    Go to My Dashboard
                  </Button>
               </Link>
               <Link href="/library">
                  <Button variant="ghost" className="w-full h-14 text-gray-400 font-bold">
                    Return to Marketplace
                  </Button>
               </Link>
            </div>
         </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <Link href={isCartCheckout ? "/cart" : (productId ? `/library/${productId}` : `/sessions`)} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-all uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" />
            Cancel and Return
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
           {/* Left: Summary */}
           <div className="lg:col-span-3 space-y-8">
              <div className="flex items-center gap-4">
                 <h1 className="text-4xl font-black text-gray-900 tracking-tight">Checkout</h1>
                 <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1">
                    {items.length} Item{items.length !== 1 ? 's' : ''}
                 </Badge>
              </div>
              
              {/* Product Info Cards */}
              <div className="space-y-4">
                {items.map((item, index) => (
                   <Card key={index} className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
                     <CardContent className="p-8">
                        <div className="flex gap-6 items-start">
                           <div className="h-24 w-24 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
                              {(item.type === "workshop" || item.mode) ? <Calendar className="h-10 w-10 text-white/50" /> : <Package className="h-10 w-10 text-white/50" />}
                           </div>
                           <div className="flex-1">
                              <Badge className="mb-2 bg-blue-50 text-blue-600 border-none font-bold uppercase text-[9px] tracking-widest">
                                {(item.type === "workshop" || item.mode) ? "Interactive Session" : "Digital Asset"}
                              </Badge>
                              <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">{item.title}</h2>
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                 <span>Author:</span>
                                 <span className="text-gray-900">{item.consultantName || item.consultant?.name}</span>
                              </div>
                           </div>
                           <div className="text-2xl font-black text-gray-900">
                              ${(item.price / 100).toFixed(2)}
                           </div>
                        </div>
                     </CardContent>
                   </Card>
                ))}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-2xl text-green-500">
                       <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="font-bold text-gray-900 text-sm">Secure Payment</p>
                       <p className="text-xs text-gray-400 font-medium">SSL Encrypted Transaction</p>
                    </div>
                 </div>
                 <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-500">
                       <Zap className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="font-bold text-gray-900 text-sm">Instant Access</p>
                       <p className="text-xs text-gray-400 font-medium">Auto-delivery after purchase</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right: Payment Form */}
           <div className="lg:col-span-2">
              <Card className="rounded-[40px] border-none shadow-2xl bg-gray-900 p-2 overflow-hidden sticky top-32">
                 <CardHeader className="p-8 pb-4">
                   <CardTitle className="text-white text-xl font-black flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-400" />
                      Secure Checkout
                   </CardTitle>
                   <CardDescription className="text-gray-400 font-medium">Complete your transaction</CardDescription>
                 </CardHeader>
                 
                 <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                       <div className="grid gap-2">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Card Details</label>
                         <div className="relative group">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 transition-colors group-focus-within:text-blue-400" />
                            <input 
                              type="text" 
                              placeholder="4242 4242 4242 4242" 
                              readOnly
                              value="4242 4242 4242 4242"
                              className="w-full pl-12 pr-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:bg-gray-800 transition-all cursor-not-allowed"
                            />
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Expiry</label>
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              value="12/28"
                              readOnly
                              className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white font-bold text-sm focus:outline-none cursor-not-allowed"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">CVC</label>
                            <input 
                              type="text" 
                              placeholder="123" 
                              value="***"
                              readOnly
                              className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white font-bold text-sm focus:outline-none cursor-not-allowed"
                            />
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-gray-800 space-y-4">
                       <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                          <span>Subtotal</span>
                          <span className="text-white">${(subtotal / 100).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                          <span>Taxes</span>
                          <span className="text-white">$0.00</span>
                       </div>
                       <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-white">
                          <span className="text-lg font-black uppercase tracking-tighter">Total Price</span>
                          <span className="text-3xl font-black text-blue-400">${(subtotal / 100).toFixed(2)}</span>
                       </div>
                    </div>

                    <Button 
                      className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black text-lg shadow-lg shadow-blue-900/50"
                      onClick={handleCheckout}
                      disabled={processing}
                    >
                      {processing ? "Processing..." : `Pay $${(subtotal / 100).toFixed(2)}`}
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                       <ShieldCheck className="h-3 w-3" />
                       Encrypted Payment
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
