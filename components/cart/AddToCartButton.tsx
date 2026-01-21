"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"

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
}

export function AddToCartButton({ item, variant = "default", className, children }: AddToCartButtonProps) {
  const addToCart = () => {
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
      className={className}
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
