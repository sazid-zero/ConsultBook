"use server"

import { db as pgDb } from "@/lib/db" 
import { products, productReviews, productOrders, users } from "@/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getProducts(filters?: { consultantId?: string, type?: string, publishedOnly?: boolean }) {
  try {
    const conditions = []
    if (filters?.consultantId) conditions.push(eq(products.consultantId, filters.consultantId))
    if (filters?.type) conditions.push(eq(products.type, filters.type as "book" | "course" | "digital_asset"))
    if (filters?.publishedOnly) conditions.push(eq(products.isPublished, true))

    const result = await pgDb.query.products.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        consultant: true,
      },
      orderBy: [desc(products.createdAt)]
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

export async function getProduct(id: string, clientId?: string) {
  try {
    console.log("Fetching product with ID:", id)
    const product = await pgDb.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        consultant: true,
        reviews: {
          with: {
            client: true
          }
        }
      }
    })

    if (!product) return { success: false, error: "Product not found" }

    let isOwned = false
    if (clientId) {
      if (product.consultantId === clientId) {
        isOwned = true
      } else {
        const order = await pgDb.query.productOrders.findFirst({
          where: and(
            eq(productOrders.productId, id),
            eq(productOrders.clientId, clientId),
            eq(productOrders.status, "completed")
          )
        })
        if (order) isOwned = true
      }
    }

    return { 
      success: true, 
      data: { ...product, isOwned } 
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    return { success: false, error: "Failed to fetch product" }
  }
}

export async function isProductOwned(productId: string, clientId: string) {
  try {
    const product = await pgDb.query.products.findFirst({
      where: eq(products.id, productId)
    })

    if (!product) return false
    if (product.consultantId === clientId) return true

    const order = await pgDb.query.productOrders.findFirst({
      where: and(
        eq(productOrders.productId, productId),
        eq(productOrders.clientId, clientId),
        eq(productOrders.status, "completed")
      )
    })

    return !!order
  } catch (error) {
    console.error("Error checking product ownership:", error)
    return false
  }
}

export async function createProduct(data: {
  consultantId: string
  title: string
  description: string
  type: "book" | "course" | "digital_asset"
  price: number
  thumbnailUrl?: string
  fileUrl?: string
  isPublished?: boolean
}) {
  try {
    const [newProduct] = await pgDb.insert(products).values({
      ...data,
      isPublished: data.isPublished ?? false,
    }).returning()

    revalidatePath("/library")
    revalidatePath(`/dashboard/consultant/library`)
    
    return { success: true, data: newProduct }
  } catch (error) {
    console.error("Error creating product:", error)
    return { success: false, error: "Failed to create product" }
  }
}

export async function updateProduct(id: string, data: Partial<typeof products.$inferInsert>) {
  try {
    const [updatedProduct] = await pgDb.update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()

    revalidatePath("/library")
    revalidatePath(`/library/${id}`)
    revalidatePath(`/dashboard/consultant/library`)

    return { success: true, data: updatedProduct }
  } catch (error) {
    console.error("Error updating product:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function deleteProduct(id: string) {
  try {
    // Delete reviews and orders first due to foreign key constraints
    await pgDb.delete(productReviews).where(eq(productReviews.productId, id))
    await pgDb.delete(productOrders).where(eq(productOrders.productId, id))
    await pgDb.delete(products).where(eq(products.id, id))
    
    revalidatePath("/library")
    revalidatePath("/dashboard/consultant/library")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

export async function purchaseProduct(productId: string, clientId: string) {
  try {
    const product = await pgDb.query.products.findFirst({
      where: eq(products.id, productId)
    })

    if (!product) return { success: false, error: "Product not found" }

    if (product.consultantId === clientId) {
      return { success: false, error: "You cannot purchase your own product." }
    }

    const [order] = await pgDb.insert(productOrders).values({
      productId,
      clientId,
      amount: product.price,
      status: "completed", // Mocked as completed for now
    }).returning()

    // Increment sales count
    await pgDb.update(products)
      .set({ salesCount: sql`${products.salesCount} + 1` })
      .where(eq(products.id, productId))

    revalidatePath(`/library/${productId}`)
    revalidatePath("/dashboard/client")

    return { success: true, data: order }
  } catch (error) {
    console.error("Error purchasing product:", error)
    return { success: false, error: "Failed to process purchase" }
  }
}

export async function submitProductReview(data: {
  productId: string
  clientId: string
  rating: number
  comment: string
}) {
  try {
    const [newReview] = await pgDb.insert(productReviews).values({
      ...data,
    }).returning()

    // Update average rating (simplified for mock for now)
    // In real app, you'd calculate average of all reviews
    await pgDb.update(products)
      .set({ averageRating: data.rating })
      .where(eq(products.id, data.productId))

    revalidatePath(`/library/${data.productId}`)
    
    return { success: true, data: newReview }
  } catch (error) {
    console.error("Error submitting review:", error)
    return { success: false, error: "Failed to submit review" }
  }
}
