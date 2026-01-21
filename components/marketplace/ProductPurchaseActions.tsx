"use client"

import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Settings } from "lucide-react"

interface ProductPurchaseActionsProps {
  product: {
    id: string
    title: string
    price: number
    type: string
    consultantId: string
    consultantName: string
  }
}

export function ProductPurchaseActions({ product }: ProductPurchaseActionsProps) {
  const { user } = useAuth()
  const isOwner = user?.uid === product.consultantId

  if (isOwner) {
    return (
      <div className="space-y-4 mb-8">
        <Link href="/dashboard/consultant/library" className="w-full">
          <Button className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Settings className="mr-2 h-5 w-5" />
            Manage Product
          </Button>
        </Link>
        <p className="text-center text-xs font-bold text-blue-600 uppercase tracking-widest">
          This is your product
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-8">
      <Link href={`/checkout?productId=${product.id}`}>
        <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
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
      />
    </div>
  )
}
