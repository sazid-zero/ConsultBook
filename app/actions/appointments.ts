"use server";

import { db } from "@/lib/db";
import { appointments, users, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function cancelAppointment(appointmentId: string, byWho: "client" | "consultant") {
  try {
    const appointment = await db.query.appointments.findFirst({
        where: eq(appointments.id, appointmentId)
    });

    await db.update(appointments).set({
      status: "cancelled",
      updatedAt: new Date(),
    }).where(eq(appointments.id, appointmentId));

    if (appointment) {
        const notifyTo = byWho === "client" ? appointment.consultantId : appointment.clientId;
        const sender = await db.query.users.findFirst({ where: eq(users.uid, byWho === "client" ? appointment.clientId : appointment.consultantId) });
        
        await db.insert(notifications).values({
          userId: notifyTo,
          title: "Appointment Cancelled",
          content: `${sender?.name || "The other party"} has cancelled the appointment on ${appointment.date}`,
          type: "cancellation",
          relatedId: appointmentId,
        });
    }

    revalidatePath("/dashboard/consultant");
    revalidatePath("/dashboard/client");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error: "Failed to cancel appointment" };
  }
}

export async function rescheduleAppointment(appointmentId: string, newDate: string, newTime: string, reason: string, byWho: "client" | "consultant") {
  try {
     // Ideally check availability again
     const appointment = await db.query.appointments.findFirst({
        where: eq(appointments.id, appointmentId)
     });

    await db.update(appointments).set({
      date: newDate,
      time: newTime,
      updatedAt: new Date(),
    }).where(eq(appointments.id, appointmentId));

    if (appointment) {
        const notifyTo = byWho === "client" ? appointment.consultantId : appointment.clientId;
        const sender = await db.query.users.findFirst({ where: eq(users.uid, byWho === "client" ? appointment.clientId : appointment.consultantId) });
        
        await db.insert(notifications).values({
          userId: notifyTo,
          title: "Appointment Rescheduled",
          content: `${sender?.name || "The other party"} has rescheduled the appointment to ${newDate} at ${newTime}. Reason: ${reason}`,
          type: "reschedule",
          relatedId: appointmentId,
        });
    }

    revalidatePath("/dashboard/consultant");
    revalidatePath("/dashboard/client");
    return { success: true };
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    return { success: false, error: "Failed to reschedule appointment" };
  }
}

export async function addReview(data: { appointmentId: string, consultantId: string, clientId: string, rating: number, comment: string }) {
    // Reviews table? I haven't defined it in schema.ts yet.
    // Assuming schema update for reviews is needed or I skip it for now.
    // The previous dashboard code used `reviews` collection.
    // I should add `reviews` table to schema.
    return { success: false, error: "Reviews table not implemented yet" };
}
