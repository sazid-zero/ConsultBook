"use server";

import { db } from "@/lib/db";
import { users, consultantProfiles, appointments, consultantSchedules, notifications, reviews } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getConsultantDashboardData(userId: string) {
  try {
    const profile = await db.query.consultantProfiles.findFirst({
      where: eq(consultantProfiles.consultantId, userId),
    });

    const consultantAppointments = await db.select().from(appointments).where(
      eq(appointments.consultantId, userId)
    ).orderBy(desc(appointments.date), desc(appointments.time)); // Sorting requires standard date format, text might be tricky. 

    // Re-verify date sorting. Since it is YYYY-MM-DD text, lexical sort works.
    
    // We also need appointments where user is client (if consultant booked someone else)
    const clientAppointments = await db.select().from(appointments).where(
      eq(appointments.clientId, userId)
    ).orderBy(desc(appointments.date), desc(appointments.time));
    
    // Merge but keep separate for stats? 
    // Dashboard logic mixes them or shows specific ones?
    // "Fetch appointments where user is the consultant" -> q1
    // "Fetch appointments where user is client" -> q2
    // then merge.

    const allAppointments = [...consultantAppointments, ...clientAppointments];
    // Remove duplicates by ID (unlikely if queries are distinct unless self-booking)
    const uniqueAppointments = Array.from(new Map(allAppointments.map(a => [a.id, a])).values());
    
    // Calculate stats
    const upcoming = uniqueAppointments.filter(a => a.status === "upcoming");
    const completed = uniqueAppointments.filter(a => a.status === "completed");
    const totalEarnings = completed.filter(a => a.consultantId === userId).reduce((sum, a) => sum + (a.amount || 0), 0);
    // Earnings only from consultant role

    return {
      appointments: uniqueAppointments.map(a => ({
         ...a,
         clientName: "Client Name", // We need to fetch names?
         // This is N+1 problem. Ideally perform a join.
      })),
      isAvailable: profile?.isAvailable ?? true, 
      stats: {
        upcomingCount: upcoming.length,
        completedCount: completed.length,
        totalEarnings,
      }
    };
  } catch (error) {
    console.error("Error fetching consultant dashboard:", error);
    return null;
  }
}

// Optimized Fetch with Joins
export async function getConsultantDashboardDataWithDetails(userId: string) {
    try {
        const profile = await db.query.consultantProfiles.findFirst({
            where: eq(consultantProfiles.consultantId, userId),
        });

        // Consultant Appointments with Client Info
        const consultantApts = await db.select({
            id: appointments.id,
            clientId: appointments.clientId,
            clientName: users.name, // Client Name
            clientEmail: users.email,
            date: appointments.date,
            time: appointments.time,
            status: appointments.status,
            mode: appointments.mode,
            amount: appointments.amount,
            notes: appointments.notes,
            consultantId: appointments.consultantId, // to filter earnings
        })
        .from(appointments)
        .leftJoin(users, eq(appointments.clientId, users.uid))
        .where(eq(appointments.consultantId, userId))
        .orderBy(desc(appointments.date), desc(appointments.time));

        // Client Appointments (Consultant acting as client) with Consultant Info
        const clientApts = await db.select({
            id: appointments.id,
            clientId: appointments.clientId,
            clientName: sql<string>`'You'`, // Self
            clientEmail: sql<string>`''`,
            date: appointments.date,
            time: appointments.time,
            status: appointments.status,
            mode: appointments.mode,
            amount: appointments.amount,
            notes: appointments.notes,
            consultantId: appointments.consultantId,
            // We might want Consultant Name here
        })
        .from(appointments)
        .where(eq(appointments.clientId, userId)) // No join for simplicity or join consultant
        .orderBy(desc(appointments.date), desc(appointments.time));

        // Let's refine the join for clientApts to get Consultant Name if needed
        // For dashboard list, we usually show "Client Name" column. 
        // If I am observing as consultant, I want to see Client Name.
        // If I am observing as client, I want to see Consultant Name.
        // The dashboard UI unified them.
        
        // Let's stick to returning a unified list where `clientName` is correctly populated for Consultant view.
        
        const allAppointments = [...consultantApts, ...clientApts];
        const unique = Array.from(new Map(allAppointments.map(a => [a.id, a])).values());
        
        // Sort
        unique.sort((a, b) => {
             const dateA = new Date(`${a.date}T${a.time}`);
             const dateB = new Date(`${b.date}T${b.time}`);
             return dateB.getTime() - dateA.getTime();
        });

        const upcoming = unique.filter(a => a.status === "upcoming");
        const completed = unique.filter(a => a.status === "completed");
        const totalEarnings = completed.filter(a => a.consultantId === userId).reduce((sum, a) => sum + (a.amount || 0), 0);

        // Fetch unread notifications
        const unreadNotifications = await db.query.notifications.findMany({
            where: and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
            orderBy: [desc(notifications.createdAt)],
        });

        return {
            appointments: unique,
            isAvailable: profile?.isAvailable ?? true,
            notifications: unreadNotifications,
            stats: {
                upcomingCount: upcoming.length,
                completedCount: completed.length,
                totalEarnings,
            }
        };

    } catch (error) {
        console.error("Error fetching dashboard:", error);
        return null;
    }
}

export async function toggleAvailability(userId: string, isAvailable: boolean) {
  try {
    await db.insert(consultantProfiles).values({
      consultantId: userId,
      isAvailable: isAvailable,
    }).onConflictDoUpdate({
      target: consultantProfiles.consultantId,
      set: { isAvailable: isAvailable, updatedAt: new Date() }
    });
    
    // Also update users table if needed for legacy? Not needed if we switched logic.
    // Dashboard page reads from `profile` or `users`. 
    // We should ensure frontend reads from correct source.
    
    revalidatePath("/dashboard/consultant");
    return { success: true };
  } catch (error) {
    console.error("Error toggling availability:", error);
    return { success: false, error: "Failed to update availability" };
  }
}

export async function getClientDashboardData(userId: string) {
  try {
   const clientApts = await db.select({
            id: appointments.id,
            consultantId: appointments.consultantId,
            consultantName: users.name,
            consultantEmail: users.email,
            date: appointments.date,
            time: appointments.time,
            status: appointments.status,
            mode: appointments.mode,
            amount: appointments.amount,
            notes: appointments.notes,
            consultantSpecialty: sql<string>`${consultantProfiles.specializations}[1]`,
        })
        .from(appointments)
        .leftJoin(users, eq(appointments.consultantId, users.uid))
        .leftJoin(consultantProfiles, eq(appointments.consultantId, consultantProfiles.consultantId))
        .where(eq(appointments.clientId, userId))
        .orderBy(desc(appointments.date), desc(appointments.time));

    // Fetch reviews by this client to mark appointments as reviewed
    const clientReviews = await db.query.reviews.findMany({
        where: eq(reviews.clientId, userId),
    });
    const reviewedAppointmentIds = new Set(clientReviews.map(r => r.appointmentId));

    // Fetch unread notifications
    const unreadNotifications = await db.query.notifications.findMany({
        where: and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
        orderBy: [desc(notifications.createdAt)],
    });

    return {
        appointments: clientApts.map(a => ({
            ...a,
            consultantSpecialty: a.consultantSpecialty || "Consultant",
            reviewed: reviewedAppointmentIds.has(a.id),
        })),
        notifications: unreadNotifications,
        stats: {
           upcomingCount: clientApts.filter(a => a.status === "upcoming").length,
           completedCount: clientApts.filter(a => a.status === "completed").length,
        }
    };
  } catch (error) {
    console.error("Error fetching client dashboard:", error);
    return null;
  }
}
