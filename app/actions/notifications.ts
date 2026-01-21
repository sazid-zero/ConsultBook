"use server";

import { db } from "@/lib/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CreateNotificationData {
  userId: string;
  title: string;
  content: string;
  type: "booking" | "reschedule" | "cancellation" | "message" | "alert";
  relatedId?: string;
}

export async function createNotification(data: CreateNotificationData) {
  try {
    await db.insert(notifications).values({
      userId: data.userId,
      title: data.title,
      content: data.content,
      type: data.type,
      relatedId: data.relatedId,
      isRead: false,
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

export async function getNotifications(userId: string) {
  try {
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });
    return { success: true, data: userNotifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}
