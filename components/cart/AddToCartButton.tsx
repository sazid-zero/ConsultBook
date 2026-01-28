"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"

interface AddToCartButtonProps {
  item: {
    id: string
    title: string
    price: number
    type: string
    consultantName: string
  }
  variant?: "outline" | "default" | "ghost" | "icon"
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

export function AddToCartButton({ item, variant = "default", className, children, disabled }: AddToCartButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const addToCart = () => {
    if (!user) {
      toast.error("Please login to add items to your cart")
      router.push(`/login?redirect=${pathname}`)
      return
    }

    const savedCart = localStorage.getItem("consultbook_cart")
    let cart = savedCart ? JSON.parse(savedCart) : []
    
    // Check if duplicate
    if (cart.find((i: any) => i.id === item.id)) {
      toast.info("Item is already in your cart")
      return
    }

    cart.push(item)
    localStorage.setItem("consultbook_cart", JSON.stringify(cart))
    
    // Trigger storage event for other components (like Navbar cart count if implemented)
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new Event("cartUpdated"))
    
    toast.success(`Added to cart!`)
  }

  if (variant === "icon") {
    return (
      <Button 
        size="icon" 
        className={className}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          addToCart()
        }}
      >
        <ShoppingCart className="h-5 w-5 text-white" />
      </Button>
    )
  }

  return (
    <Button 
      variant={variant}
      className={`${className} ${disabled ? 'grayscale opacity-70 cursor-not-allowed' : ''}`}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart()
      }}
    >
      {children || (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  )
}
