"use server"

import { db } from "@/lib/db"
import { products, workshops, users, consultantProfiles } from "@/db/schema"
import { eq, and, or, sql } from "drizzle-orm"

export async function getGlobalSearchResults(query: string) {
  try {
    if (!query || query.length < 2) return { consultants: [], products: [], workshops: [] }

    const queryLower = query.toLowerCase()

    // 1. Search Consultants
    const consultants = await db.select({
      uid: users.uid,
      name: users.name,
      specialty: sql<string>`${consultantProfiles.specializations}[1]`,
      profilePhoto: users.profilePhoto,
    })
    .from(consultantProfiles)
    .innerJoin(users, eq(consultantProfiles.consultantId, users.uid))
    .where(
      and(
        eq(consultantProfiles.isPublished, true),
        or(
          sql`${users.name} ILIKE ${`%${query}%`}`,
          sql`${consultantProfiles.specializations}::text ILIKE ${`%${query}%`}`
        )
      )
    )
    .limit(5)

    // 2. Search Products
    const productsRes = await db.select({
      id: products.id,
      title: products.title,
      type: products.type,
      price: products.price,
      thumbnailUrl: products.thumbnailUrl,
    })
    .from(products)
    .where(
      and(
        eq(products.isPublished, true),
        or(
          sql`${products.title} ILIKE ${`%${query}%`}`,
          sql`${products.description} ILIKE ${`%${query}%`}`
        )
      )
    )
    .limit(5)

    // 3. Search Workshops
    const workshopsRes = await db.select({
      id: workshops.id,
      title: workshops.title,
      mode: workshops.mode,
      price: workshops.price,
      startDate: workshops.startDate,
      thumbnailUrl: workshops.thumbnailUrl,
    })
    .from(workshops)
    .where(
      and(
        eq(workshops.isPublished, true),
        or(
          sql`${workshops.title} ILIKE ${`%${query}%`}`,
          sql`${workshops.description} ILIKE ${`%${query}%`}`
        )
      )
    )
    .limit(5)

    return {
      consultants,
      products: productsRes,
      workshops: workshopsRes,
    }
  } catch (error) {
    console.error("Error in global search:", error)
    return { consultants: [], products: [], workshops: [] }
  }
}
