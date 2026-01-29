"use server";

import { db } from "@/lib/db";
import { users, consultantProfiles, appointments, consultantSchedules, notifications, reviews, productOrders, products, workshopRegistrations, workshops } from "@/db/schema";
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

        // Consultant Appointments
        const consultantApts = await db.select({
            id: appointments.id,
            clientId: appointments.clientId,
            clientName: users.name, 
            clientEmail: users.email,
            date: appointments.date,
            time: appointments.time,
            status: appointments.status,
            mode: appointments.mode,
            amount: appointments.amount,
            notes: appointments.notes,
            consultantId: appointments.consultantId,
            type: sql<string>`'appointment'`,
        })
        .from(appointments)
        .leftJoin(users, eq(appointments.clientId, users.uid))
        .where(eq(appointments.consultantId, userId))
        .orderBy(desc(appointments.date), desc(appointments.time));

        // Upcoming Workshops (Created by Consultant)
        const myWorkshops = await db.select({
            id: workshops.id,
            title: workshops.title,
            date: workshops.startDate,
            duration: workshops.duration,
            price: workshops.price,
            mode: workshops.mode,
            location: workshops.location,
            maxParticipants: workshops.maxParticipants,
            thumbnailUrl: workshops.thumbnailUrl,
            type: sql<string>`'workshop'`,
        })
        .from(workshops)
        .where(
            and(
                eq(workshops.consultantId, userId),
                sql`${workshops.startDate} > NOW()`
            )
        )
        .orderBy(workshops.startDate);

        // Combine and Sort
        // We need a unified structure for the "Upcoming" list
        const upcomingAppointments = consultantApts.filter(a => a.status === "upcoming");
        
        const upcomingSchedule = [
            ...upcomingAppointments.map(a => ({
                id: a.id,
                title: `Consultation with ${a.clientName || 'Client'}`,
                subtitle: a.mode,
                date: new Date(`${a.date}T${a.time}`), // Approximate date obj
                displayDate: a.date,
                displayTime: a.time,
                type: 'appointment' as const,
                amount: a.amount,
                details: a, // Original data
            })),
            ...myWorkshops.filter(w => w.date).map(w => ({
                id: w.id,
                title: w.title,
                subtitle: `${w.duration} min • ${w.mode}`,
                date: w.date!,
                displayDate: w.date!.toISOString().split('T')[0],
                displayTime: w.date!.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                type: 'workshop' as const,
                amount: w.price,
                details: w,
            }))
        ].sort((a, b) => a.date.getTime() - b.date.getTime());

        const completed = consultantApts.filter(a => a.status === "completed");

        // Fetch Earnings details
        const productSales = await db.select({ amount: productOrders.amount })
        .from(productOrders)
        .leftJoin(products, eq(productOrders.productId, products.id))
        .where(eq(products.consultantId, userId));

        const productEarnings = productSales.reduce((sum, order) => sum + (order.amount || 0), 0);

        const workshopSales = await db.select({ price: workshops.price })
        .from(workshopRegistrations)
        .leftJoin(workshops, eq(workshopRegistrations.workshopId, workshops.id))
        .where(and(eq(workshops.consultantId, userId), eq(workshopRegistrations.paymentStatus, "completed")));

        const workshopEarnings = workshopSales.reduce((sum, reg) => sum + (reg.price || 0), 0);

        const unreadNotifications = await db.query.notifications.findMany({
            where: and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
            orderBy: [desc(notifications.createdAt)],
        });

        const appointmentEarnings = completed.filter(a => a.consultantId === userId).reduce((sum, a) => sum + (a.amount || 0), 0);
        const realProductEarnings = productEarnings / 100;
        const grandTotal = appointmentEarnings + workshopEarnings + realProductEarnings;

        return {
            appointments: consultantApts, // Legacy support
            upcomingSchedule, // NEW: Unified list
            isAvailable: profile?.isAvailable ?? true,
            notifications: unreadNotifications,
            stats: {
                upcomingCount: upcomingSchedule.length,
                completedCount: completed.length,
                totalEarnings: grandTotal,
                productEarnings: realProductEarnings,
                productSalesCount: productSales.length,
                workshopEarnings: workshopEarnings,
                bookingEarnings: appointmentEarnings
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
    
    revalidatePath("/dashboard/consultant");
    return { success: true };
  } catch (error) {
    console.error("Error toggling availability:", error);
    return { success: false, error: "Failed to update availability" };
  }
}

export async function getClientDashboardData(userId: string) {
  try {
    // Client Appointments
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
            type: sql<string>`'appointment'`,
        })
        .from(appointments)
        .leftJoin(users, eq(appointments.consultantId, users.uid))
        .leftJoin(consultantProfiles, eq(appointments.consultantId, consultantProfiles.consultantId))
        .where(eq(appointments.clientId, userId))
        .orderBy(desc(appointments.date), desc(appointments.time));

    // Client Workshop Registrations (Upcoming)
    const upcomingWorkshops = await db.select({
      id: workshopRegistrations.id,
      workshopId: workshopRegistrations.workshopId,
      status: workshopRegistrations.paymentStatus,
      workshopTitle: workshops.title,
      workshopDate: workshops.startDate,
      duration: workshops.duration,
      mode: workshops.mode,
      price: workshops.price, 
      consultantName: users.name,
      type: sql<string>`'workshop'`,
    })
    .from(workshopRegistrations)
    .leftJoin(workshops, eq(workshopRegistrations.workshopId, workshops.id))
    .leftJoin(users, eq(workshops.consultantId, users.uid))
    .where(
        and(
            eq(workshopRegistrations.clientId, userId),
            sql`${workshops.startDate} > NOW()`
        )
    )
    .orderBy(workshops.startDate);

     // Unified Upcoming Schedule
     const upcomingAppointments = clientApts.filter(a => a.status === "upcoming");
     
     const upcomingSchedule = [
        ...upcomingAppointments.map(a => ({
            id: a.id,
            title: `Session with ${a.consultantName}`,
            subtitle: a.consultantSpecialty,
            consultantName: a.consultantName,
            date: new Date(`${a.date}T${a.time}`),
            displayDate: a.date,
            displayTime: a.time,
            type: 'appointment' as const,
            amount: a.amount,
            details: a,
        })),
        ...upcomingWorkshops.filter(w => w.workshopDate).map(w => ({
            id: w.id,
            workshopId: w.workshopId,
            status: w.status,
            title: w.workshopTitle,
            subtitle: `Workshop • ${w.mode}`,
            consultantName: w.consultantName,
            date: w.workshopDate!,
            displayDate: w.workshopDate!.toISOString().split('T')[0],
            displayTime: w.workshopDate!.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            type: 'workshop' as const,
            amount: w.price,
            details: w,
        }))
     ].sort((a, b) => a.date.getTime() - b.date.getTime());


    // Fetch reviews
    const clientReviews = await db.query.reviews.findMany({
        where: eq(reviews.clientId, userId),
    });
    const reviewedAppointmentIds = new Set(clientReviews.map(r => r.appointmentId));

    const unreadNotifications = await db.query.notifications.findMany({
        where: and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
        orderBy: [desc(notifications.createdAt)],
    });

    const orders = await db.select({
      id: productOrders.id,
      productId: productOrders.productId,
      amount: productOrders.amount,
      status: productOrders.status,
      purchaseDate: productOrders.createdAt,
      productTitle: products.title,
      productType: products.type,
      thumbnailUrl: products.thumbnailUrl,
      fileUrl: products.fileUrl,
      consultantName: users.name,
    })
    .from(productOrders)
    .leftJoin(products, eq(productOrders.productId, products.id))
    .leftJoin(users, eq(products.consultantId, users.uid))
    .where(eq(productOrders.clientId, userId))
    .orderBy(desc(productOrders.createdAt));

    const registrations = await db.select({
      id: workshopRegistrations.id,
      workshopId: workshopRegistrations.workshopId,
      status: workshopRegistrations.paymentStatus,
      registrationDate: workshopRegistrations.createdAt,
      workshopTitle: workshops.title,
      workshopDate: workshops.startDate,
      duration: workshops.duration,
      mode: workshops.mode,
      location: workshops.location,
      thumbnailUrl: workshops.thumbnailUrl,
      consultantName: users.name,
    })
    .from(workshopRegistrations)
    .leftJoin(workshops, eq(workshopRegistrations.workshopId, workshops.id))
    .leftJoin(users, eq(workshops.consultantId, users.uid))
    .where(eq(workshopRegistrations.clientId, userId))
    .orderBy(desc(workshopRegistrations.createdAt));

    return {
        appointments: clientApts.map(a => ({
            ...a,
            consultantSpecialty: a.consultantSpecialty || "Consultant",
            reviewed: reviewedAppointmentIds.has(a.id),
        })),
        upcomingSchedule, // NEW: Unified list
        orders,
        registrations, // Keep full history here
        notifications: unreadNotifications,
        stats: {
           upcomingCount: upcomingSchedule.length,
           completedCount: clientApts.filter(a => a.status === "completed").length,
        }
    };
  } catch (error) {
    console.error("Error fetching client dashboard:", error);
    return null;
  }
}

export async function getUserOrders(clientId: string) {
  try {
    const orders = await db.select({
      id: productOrders.id,
      productId: productOrders.productId,
      amount: productOrders.amount,
      status: productOrders.status,
      purchaseDate: productOrders.createdAt,
      productTitle: products.title,
      productType: products.type,
      thumbnailUrl: products.thumbnailUrl,
      fileUrl: products.fileUrl,
      consultantName: users.name,
    })
    .from(productOrders)
    .leftJoin(products, eq(productOrders.productId, products.id))
    .leftJoin(users, eq(products.consultantId, users.uid))
    .where(and(eq(productOrders.clientId, clientId), eq(productOrders.status, "completed")))
    .orderBy(desc(productOrders.createdAt));

    return { success: true, data: orders };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}
