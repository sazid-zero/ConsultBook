"use server"

import { db as pgDb } from "@/lib/db" 
import { workshops, workshopRegistrations, users } from "@/db/schema"
import { eq, and, desc, gte } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getWorkshops(filters?: { consultantId?: string, upcomingOnly?: boolean, publishedOnly?: boolean }) {
  try {
    const conditions = []
    if (filters?.consultantId) conditions.push(eq(workshops.consultantId, filters.consultantId))
    if (filters?.publishedOnly) conditions.push(eq(workshops.isPublished, true))
    if (filters?.upcomingOnly) conditions.push(gte(workshops.startDate, new Date()))

    const result = await pgDb.query.workshops.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        consultant: true,
        registrations: true
      },
      orderBy: [desc(workshops.startDate)]
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching workshops:", error)
    return { success: false, error: "Failed to fetch workshops" }
  }
}

export async function getWorkshop(id: string) {
  try {
    console.log("Fetching workshop with ID:", id)
    const workshop = await pgDb.query.workshops.findFirst({
      where: eq(workshops.id, id),
      with: {
        consultant: true,
        registrations: {
          with: {
            client: true
          }
        }
      }
    })

    if (!workshop) return { success: false, error: "Workshop not found" }
    return { success: true, data: workshop }
  } catch (error) {
    console.error("Error fetching workshop:", error)
    return { success: false, error: "Failed to fetch workshop" }
  }
}

export async function createWorkshop(data: {
  consultantId: string
  title: string
  description: string
  startDate: Date
  duration: number
  price: number
  mode: "online" | "offline"
  location?: string
  thumbnailUrl?: string
  maxParticipants?: number
  isPublished?: boolean
}) {
  try {
    const [newWorkshop] = await pgDb.insert(workshops).values({
      ...data,
      isPublished: data.isPublished ?? false,
    }).returning()

    revalidatePath("/sessions")
    revalidatePath(`/dashboard/consultant/sessions`)
    
    return { success: true, data: newWorkshop }
  } catch (error) {
    console.error("Error creating workshop:", error)
    return { success: false, error: "Failed to create workshop" }
  }
}

export async function updateWorkshop(id: string, data: Partial<typeof workshops.$inferInsert>) {
  try {
    const [updatedWorkshop] = await pgDb.update(workshops)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workshops.id, id))
      .returning()

    revalidatePath("/sessions")
    revalidatePath(`/sessions/${id}`)
    revalidatePath(`/dashboard/consultant/sessions`)

    return { success: true, data: updatedWorkshop }
  } catch (error) {
    console.error("Error updating workshop:", error)
    return { success: false, error: "Failed to update workshop" }
  }
}

export async function deleteWorkshop(id: string) {
  try {
    await pgDb.delete(workshops).where(eq(workshops.id, id))
    revalidatePath("/sessions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting workshop:", error)
    return { success: false, error: "Failed to delete workshop" }
  }
}

export async function registerForWorkshop(workshopId: string, clientId: string) {
  try {
    const workshop = await pgDb.query.workshops.findFirst({
      where: eq(workshops.id, workshopId),
      with: {
        registrations: true
      }
    })

    if (!workshop) return { success: false, error: "Workshop not found" }

    if (workshop.consultantId === clientId) {
      return { success: false, error: "You cannot register for your own workshop." }
    }

    // Check if full
    if (workshop.maxParticipants && workshop.registrations.length >= workshop.maxParticipants) {
      return { success: false, error: "Workshop is already full" }
    }

    // Check if already registered
    const alreadyRegistered = workshop.registrations.some(r => r.clientId === clientId)
    if (alreadyRegistered) {
      return { success: false, error: "You are already registered for this workshop" }
    }

    const [registration] = await pgDb.insert(workshopRegistrations).values({
      workshopId,
      clientId,
      paymentStatus: "completed", // Mocked as completed
    }).returning()

    revalidatePath(`/sessions/${workshopId}`)
    revalidatePath("/dashboard/client")

    return { success: true, data: registration }
  } catch (error) {
    console.error("Error registering for workshop:", error)
    return { success: false, error: "Failed to register for workshop" }
  }
}
