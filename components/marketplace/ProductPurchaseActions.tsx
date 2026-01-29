"use client"

import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Settings, ExternalLink, CheckCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { isProductOwned } from "@/app/actions/library"

interface ProductPurchaseActionsProps {
  product: {
    id: string
    title: string
    price: number
    type: string
    consultantId: string
    consultantName: string
    isOwned?: boolean
    fileUrl?: string
  }
}

export function ProductPurchaseActions({ product }: ProductPurchaseActionsProps) {
  const { user } = useAuth()
  const [isOwned, setIsOwned] = useState(product.isOwned || false)
  const [isLoading, setIsLoading] = useState(!product.isOwned)
  const isOwner = user?.uid === product.consultantId

  useEffect(() => {
    async function checkOwnership() {
      if (user?.uid && !product.isOwned) {
        setIsLoading(true)
        const result = await isProductOwned(product.id, user.uid)
        setIsOwned(result)
        setIsLoading(false)
      } else if (!user) {
        setIsOwned(false)
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    }
    checkOwnership()
  }, [user?.uid, product.id, product.isOwned])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-8">
      {isOwner && (
        <div className="space-y-2">
          <Link href="/dashboard/consultant/library" className="w-full">
            <Button className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Settings className="mr-2 h-5 w-5" />
              Manage Product
            </Button>
          </Link>
          <p className="text-center text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
            This is your product
          </p>
        </div>
      )}

      {(isOwned || product.isOwned) && !isOwner && (
        <div className="space-y-4">
           <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg text-white">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-black text-green-900 uppercase tracking-wider">You own this {product.type}</p>
                <p className="text-[10px] font-bold text-green-700/70">Full access granted</p>
              </div>
           </div>

           <Link href={product.fileUrl || "#"} target="_blank" className="w-full block">
              <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <ExternalLink className="mr-2 h-6 w-6" />
                Open Product
              </Button>
           </Link>
        </div>
      )}

      {!(isOwned || product.isOwned) && !isOwner && (
        <>
          <Link href={`/checkout?productId=${product.id}`}>
            <Button 
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:grayscale disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Buy Now
            </Button>
          </Link>
          <AddToCartButton 
            item={{
              id: product.id,
              title: product.title,
              price: product.price,
              type: product.type.replace('_', ' '),
              consultantName: product.consultantName
            }}
            className="w-full h-14 border-gray-100 text-gray-600 hover:bg-gray-50 rounded-2xl font-bold flex items-center justify-center gap-2"
            variant="outline"
            isOwned={isOwned || product.isOwned}
          />
        </>
      )}
    </div>
  )
}
