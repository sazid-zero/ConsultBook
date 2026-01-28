"use server";

import { db } from "@/lib/db";
import { users, consultantProfiles, consultantSchedules, appointments, notifications } from "@/db/schema";
import { eq, and, gte, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getConsultantBookingData(consultantId: string) {
  try {
    // 1. Fetch Consultant Profile
    const profile = await db.query.consultantProfiles.findFirst({
      where: eq(consultantProfiles.consultantId, consultantId),
    });
    
    const user = await db.query.users.findFirst({
      where: eq(users.uid, consultantId)
    });

    if (!user) return null; // Should have a user at least

    // 2. Fetch Schedule
    const schedules = await db.select().from(consultantSchedules).where(eq(consultantSchedules.consultantId, consultantId));
    
    // Transform schedules to simple object { monday: ['09:00', ...], ... }
    const availability: Record<string, string[]> = {};
    schedules.forEach((s: any) => {
       if (s.isEnabled) {
         availability[s.dayOfWeek] = s.timeSlots || [];
       }
    });

    // 3. Fetch Upcoming Appointments (to block slots)
    // For simplicity, fetch all upcoming appointments for this consultant.
    // Optimisation: filter by date range if frontend sends it. For now, fetch all upcoming.
    const bookedAppointments = await db.select().from(appointments).where(
        and(
            eq(appointments.consultantId, consultantId),
            ne(appointments.status, "cancelled"),
            // gte(appointments.date, new Date().toISOString().split('T')[0]) // Optional: only future
        )
    );

    return {
      consultant: {
        id: user.uid,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto, // User photo is primary 
        bio: profile?.bio || "",
        specializations: profile?.specializations || [],
        hourlyRate: profile?.hourlyRate || 0,
        city: profile?.city || user.city,
        country: profile?.country || user.country,
        experience: profile?.experience || "",
        languages: profile?.languages || [],
        consultationModes: profile?.consultationModes || ["video", "audio"],
      },
      availability,
      bookedAppointments: bookedAppointments.map((a: any) => ({
        date: a.date,
        time: a.time,
        duration: a.duration,
      })),
    };
  } catch (error) {
    console.error("Error fetching booking data:", error);
    return null;
  }
}

interface CreateAppointmentData {
  clientId: string;
  consultantId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number;
  mode: string; // video, audio, etc.
  amount: number;
  notes?: string;
  paymentMethod?: string;
  paymentStatus?: "pending" | "completed" | "refunded";
}

export async function createAppointment(data: CreateAppointmentData) {
  try {
    if (data.clientId === data.consultantId) {
      return { success: false, error: "You cannot book an appointment with yourself." };
    }
    // Validate slot availability? (Ideally yes, but UI does it too. Race condition possible.)
    // We'll skip complex validation for V1 migration and rely on UI + simple check.
    
    const [newAppointment] = await db.insert(appointments).values({
      clientId: data.clientId,
      consultantId: data.consultantId,
      date: data.date,
      time: data.time,
      duration: data.duration,
      mode: data.mode,
      amount: data.amount,
      status: "upcoming",
      paymentStatus: data.paymentStatus || "pending", 
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      createdAt: new Date(), 
    }).returning();

    // Notify Consultant
    const client = await db.query.users.findFirst({ where: eq(users.uid, data.clientId) });
    await db.insert(notifications).values({
      userId: data.consultantId,
      title: "New Booking",
      content: `${client?.name || "A client"} has booked a ${data.duration} min session for ${data.date} at ${data.time}`,
      type: "booking",
      relatedId: newAppointment.id,
    });

    revalidatePath(`/book-appointment/${data.consultantId}`);
    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/consultant");
    return { success: true };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error: "Failed to book appointment" };
  }
}
