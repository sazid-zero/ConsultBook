"use server";

import { db } from "@/lib/db";
import { appointments, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function seedHistory(userId: string, role: "client" | "consultant") {
  try {
    // Find a counterpart
    const counterpartRole = role === "client" ? "consultant" : "client";
    const counterpart = await db.query.users.findFirst({
      where: eq(users.role, counterpartRole)
    });

    if (!counterpart) {
        return { success: false, error: "No counterpart user found to link history" };
    }

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const dateStr = pastDate.toISOString().split("T")[0];

    await db.insert(appointments).values({
      clientId: role === "client" ? userId : counterpart.uid,
      consultantId: role === "consultant" ? userId : counterpart.uid,
      date: dateStr,
      time: "10:00",
      duration: 60,
      mode: "video",
      amount: 1500,
      status: "completed",
      paymentStatus: "completed",
      createdAt: new Date(),
    });

    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/consultant");
    return { success: true };
  } catch (error) {
    console.error("Error seeding history:", error);
    return { success: false, error: "Failed to seed history" };
  }
}
