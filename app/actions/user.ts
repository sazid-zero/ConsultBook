"use server";

import { db } from "@/lib/db";
import { users, consultantProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserProfile(uid: string) {
  try {
    console.log(`[getUserProfile] Fetching profile for uid: ${uid}`);
    const user = await db.query.users.findFirst({
      where: eq(users.uid, uid),
    });
    console.log(`[getUserProfile] Result:`, user ? "Found" : "Not Found");

    if (!user) return null;

    // If consultant, fetch approval status from consultantProfiles if needed
    // But 'isApproved' is in consultantProfiles, not users?
    // Let's check schema.
    
    let isApproved = false;
    let isPublished = false;

    if (user.role === "consultant") {
        const profile = await db.query.consultantProfiles.findFirst({
            where: eq(consultantProfiles.consultantId, uid)
        });
        if (profile) {
            isApproved = profile.isApproved ?? false;
            isPublished = profile.isPublished ?? false;
        }
    }

    // Return structure matching UserData interface partially or fully
    // UserData interface has: uid, email, role, name, ...
    // We need to return what AuthContext expects.
    
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      approved: isApproved, 
      published: isPublished
    };

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
