"use server"

import { db } from "@/lib/db"
import { users, consultantProfiles, qualifications, rejectedConsultants, consultantSchedules, certifications, appointments } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getAdminDashboardData() {
  try {
    // Fetch Pending Consultants
    const pendingConsultants = await db.select({
      uid: users.uid,
      name: users.name,
      email: users.email,
      phone: users.phone,
      profilePhoto: users.profilePhoto,
      createdAt: users.createdAt,
      consultantType: users.role, // Assuming role is enough, or we might need a field in profile
      // Join fields
      consultantProfile: consultantProfiles,
    })
    .from(users)
    .leftJoin(consultantProfiles, eq(users.uid, consultantProfiles.consultantId))
    .where(and(eq(users.role, "consultant"), eq(consultantProfiles.isApproved, false)))
    
    // Fetch Approved Consultants
    const approvedConsultants = await db.select({
      uid: users.uid,
      name: users.name,
      email: users.email,
      phone: users.phone,
      profilePhoto: users.profilePhoto,
      createdAt: users.createdAt,
      consultantProfile: consultantProfiles,
    })
    .from(users)
    .leftJoin(consultantProfiles, eq(users.uid, consultantProfiles.consultantId))
    .where(and(eq(users.role, "consultant"), eq(consultantProfiles.isApproved, true)))

    // Fetch Rejected History
    const rejectedHistory = await db.select().from(rejectedConsultants).orderBy(desc(rejectedConsultants.rejectedAt))

    // Fetch Qualifications for each pending consultant (if needed for the modal)
    // For optimization, we could fetch this only when viewing details, but for now we'll eager load or let the client fetch details?
    // Let's attach qualifications to the pending list for simplicity in the UI
    const pendingWithQuals = await Promise.all(pendingConsultants.map(async (c) => {
        const quals = await db.select().from(qualifications).where(eq(qualifications.consultantId, c.uid));
        return { ...c, qualifications: quals };
    }));

    return {
      pending: pendingWithQuals,
      approved: approvedConsultants,
      rejected: rejectedHistory
    }

  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return { pending: [], approved: [], rejected: [] }
  }
}

export async function approveConsultant(uid: string) {
  try {
    await db.update(consultantProfiles)
      .set({ isApproved: true, isPublished: true }) // Auto publish on approval?
      .where(eq(consultantProfiles.consultantId, uid))

    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (error) {
    console.error("Error approving consultant:", error)
    return { success: false, error: "Failed to approve consultant" }
  }
}

export async function rejectConsultant(uid: string, reason: string) {
  try {
    console.log(`[rejectConsultant] Starting rejection for uid: ${uid}`)
    
    // 1. Get user data for history
    const user = await db.query.users.findFirst({
      where: eq(users.uid, uid),
      with: {
        consultantProfile: true
      }
    })

    if (!user) {
        console.error(`[rejectConsultant] User not found: ${uid}`)
        return { success: false, error: "User not found" }
    }

    console.log(`[rejectConsultant] Found user, archiving to rejectedConsultants`)

    // 2. Add to rejected history
    await db.insert(rejectedConsultants).values({
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        rejectionReason: reason,
        originalData: user // JSON dump
    })

    // 3. Delete from related tables (Manual cascade to avoid FK errors)
    // Deleting in order of dependency (children first)
    console.log(`[rejectConsultant] Deleting dependent records...`)
    
    // Delete all related data
    await db.delete(qualifications).where(eq(qualifications.consultantId, uid))
    await db.delete(consultantSchedules).where(eq(consultantSchedules.consultantId, uid))
    await db.delete(certifications).where(eq(certifications.consultantId, uid))
    
    // Check appointments - strictly speaking we shouldn't delete concluded appointments, but for a "Pending" user who is being rejected?
    // They shouldn't have real appointments yet.
    await db.delete(appointments).where(eq(appointments.consultantId, uid))

    await db.delete(consultantProfiles).where(eq(consultantProfiles.consultantId, uid))
    
    // Let's delete from users last
    await db.delete(users).where(eq(users.uid, uid))
    
    console.log(`[rejectConsultant] Successfully rejected and deleted user ${uid}`)
    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (error) {
    console.error("Error rejecting consultant:", error)
    return { success: false, error: "Failed to reject consultant" }
  }
}
