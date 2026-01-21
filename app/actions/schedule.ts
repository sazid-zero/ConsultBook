"use server";

import { db } from "@/lib/db";
import { consultantSchedules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ScheduleData = {
  [key: string]: {
    enabled: boolean;
    timeSlots: string[];
  };
};

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export async function getConsultantSchedule(consultantId: string) {
  try {
    const schedules = await db.select().from(consultantSchedules).where(eq(consultantSchedules.consultantId, consultantId));
    
    // Transform array of rows into ScheduleData object
    const scheduleData: ScheduleData = {};
    
    // Initialize defaults
    DAYS.forEach(day => {
      scheduleData[day] = { enabled: true, timeSlots: [] };
    });

    if (schedules.length > 0) {
      schedules.forEach(s => {
        scheduleData[s.dayOfWeek] = {
          enabled: s.isEnabled,
          timeSlots: s.timeSlots || []
        };
      });
    }

    return { success: true, data: scheduleData };
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return { success: false, error: "Failed to fetch schedule" };
  }
}

export async function updateConsultantSchedule(consultantId: string, schedule: ScheduleData) {
  try {
    // We will upsert each day
    // Since Drizzle doesn't have a bulk upsert that's easy for this shape, we loop.
    // Or we could delete all and re-insert, but upsert is safer for IDs.
    // Actually, delete and re-insert is fine for this table if we don't track history heavily by ID.
    // But let's try to be granular.
    
    for (const day of DAYS) {
      const dayData = schedule[day];
      if (!dayData) continue;

      // Check if exists
      const existing = await db.query.consultantSchedules.findFirst({
        where: (schedules, { eq, and }) => and(
          eq(schedules.consultantId, consultantId),
          eq(schedules.dayOfWeek, day)
        )
      });

      if (existing) {
        await db.update(consultantSchedules)
          .set({
            isEnabled: dayData.enabled,
            timeSlots: dayData.timeSlots,
            updatedAt: new Date()
          })
          .where(eq(consultantSchedules.id, existing.id));
      } else {
        await db.insert(consultantSchedules).values({
          consultantId,
          dayOfWeek: day,
          isEnabled: dayData.enabled,
          timeSlots: dayData.timeSlots
        });
      }
    }

    revalidatePath("/consultant/schedule");
    return { success: true };
  } catch (error) {
    console.error("Error updating schedule:", error);
    return { success: false, error: "Failed to update schedule" };
  }
}
