"use server";

import { db } from "@/lib/db";
import { users, consultantProfiles, consultantSchedules, qualifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface RegisterUserData {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: "client" | "consultant";
  profilePhoto?: string;
  // Consultant specific
  consultantType?: string;
  specializations?: string[];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  qualifications?: any[]; // We store this in JSON or normalize. For now, let's keep it simple or migrate structure later.
}

export async function registerUser(data: RegisterUserData) {
  try {
    // 1. Create User
    await db.insert(users).values({
      uid: data.uid,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: data.role,
      profilePhoto: data.profilePhoto,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
    }).onConflictDoUpdate({
      target: users.uid,
      set: {
        email: data.email,
        name: data.name,
        updatedAt: new Date(),
      }
    });

    // 2. If Consultant, create Profile
    if (data.role === "consultant") {
      await db.insert(consultantProfiles).values({
        consultantId: data.uid,
        city: data.city || "",
        specializations: data.specializations || [],
        hourlyRate: 0,
        isApproved: false,
        isPublished: false,

        // Populate education from qualifications for profile view
        education: data.qualifications?.map(q => ({
            degree: q.name,
            university: q.institute || q.issuer || "Not specified", // Support both institute and issuer fields
            year: typeof q.year === 'string' ? parseInt(q.year) : (q.year || new Date().getFullYear())
        })) || [],
        // Add other fields mapping if needed
      }).onConflictDoNothing();
      
      // 3. Qualifications
      if (data.qualifications && data.qualifications.length > 0) {
        for (const qual of data.qualifications) {
          await db.insert(qualifications).values({
            consultantId: data.uid,
            name: qual.name,
            certificateUrl: qual.certificateUrl,
            certificateFilename: qual.certificateFilename,
            status: "pending"
          });
        }
      }
    }


    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: "Failed to register user in database" };
  }
}
