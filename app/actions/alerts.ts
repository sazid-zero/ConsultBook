"use server";

import { db } from "@/lib/db";
import { appointments, notifications } from "@/db/schema";
import { and, eq, gte, lte, or } from "drizzle-orm";

export async function checkAppointmentAlerts(userId: string) {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const halfHourLater = new Date(now.getTime() + 30 * 60 * 1000);
    const twoHoursLater = new Date(now.getTime() + 120 * 60 * 1000);

    const todayStr = now.toISOString().split("T")[0];

    // Fetch upcoming appointments for today for this user
    const upcoming = await db.query.appointments.findMany({
      where: and(
        eq(appointments.status, "upcoming"),
        eq(appointments.date, todayStr),
        or(eq(appointments.clientId, userId), eq(appointments.consultantId, userId))
      ),
    });

    for (const apt of upcoming) {
      const aptTime = new Date(`${apt.date}T${apt.time}`);
      const diffMs = aptTime.getTime() - now.getTime();
      const diffMin = Math.floor(diffMs / (60 * 1000));

      if (diffMin > 0 && diffMin <= 60) {
        // 1 hour or less
        const type = diffMin <= 30 ? "30m" : "1h";
        const title = `Reminder: Appointment in ${type}`;
        
        // Check if alert already exists to avoid duplicates
        const existing = await db.query.notifications.findFirst({
            where: and(
                eq(notifications.userId, userId),
                eq(notifications.relatedId, apt.id),
                eq(notifications.type, "alert"),
                // Check content or a more specific relatedId if needed
            )
        });

        // Simple check: if we already sent an alert for this appointment today, 
        // we might need to distinguish between 1h and 30m.
        // For simplicity, let's include the type in title/content and check.
        
        const specificTitle = `Reminder: Appointment in ${type}`;
        const alreadySent = await db.query.notifications.findFirst({
            where: and(
                eq(notifications.userId, userId),
                eq(notifications.relatedId, apt.id),
                eq(notifications.title, specificTitle)
            )
        });

        if (!alreadySent) {
            await db.insert(notifications).values({
                userId,
                title: specificTitle,
                content: `You have an appointment today at ${apt.time}.`,
                type: "alert",
                relatedId: apt.id,
            });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error checking alerts:", error);
    return { success: false };
  }
}
