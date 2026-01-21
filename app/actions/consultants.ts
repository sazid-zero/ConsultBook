"use server";

import { db } from "@/lib/db";
import { consultantProfiles, users, appointments, certifications, qualifications } from "@/db/schema";
import { eq, and, or, like, desc, sql } from "drizzle-orm";

export async function getConsultants() {
  try {
    const consultants = await db.select({
      consultantId: consultantProfiles.consultantId,
      consultantName: users.name,
      consultantEmail: users.email,
      specialty: sql<string>`${consultantProfiles.specializations}[1]`, // Get first element
      bio: consultantProfiles.bio,
      hourlyRate: consultantProfiles.hourlyRate,
      city: consultantProfiles.city,
      experience: consultantProfiles.experience,
      languages: consultantProfiles.languages,
      consultationModes: consultantProfiles.consultationModes,
      profilePhoto: users.profilePhoto,
      isPublished: consultantProfiles.isPublished,
      // ratings?
    })
    .from(consultantProfiles)
    .innerJoin(users, eq(consultantProfiles.consultantId, users.uid))
    .where(eq(consultantProfiles.isPublished, true));
    
    // For ratings and counts, ideally we do aggregations. 
    // Since we don't have reviews table yet, return 0.
    // Appointment count:
    
    // This N+1 is bad, but for MVP/Refactor step:
    const enriched = await Promise.all(consultants.map(async (c) => {
        // Mock rating or impl later
        return {
            ...c,
            rating: 5.0, // Default/Mock
            reviewCount: 0,
            appointmentCount: 0, // Could fetch count from appointments
        }
    }));

    return enriched;

  } catch (error) {
    console.error("Error fetching consultants:", error);
    return [];
  }
}

export async function getPublicConsultantProfile(consultantId: string) {
  try {
    const profile = await db.query.consultantProfiles.findFirst({
      where: eq(consultantProfiles.consultantId, consultantId),
      with: {
        user: true, 
      }
    });

    if (!profile) return null;

    // Fetch related tables
    const certs = await db.select().from(certifications).where(eq(certifications.consultantId, consultantId));
    const quals = await db.select().from(qualifications).where(eq(qualifications.consultantId, consultantId));

    // Transform to match UI expectation
    return {
      consultantId: profile.consultantId,
      consultantName: profile.user?.name || "Unknown",
      consultantEmail: profile.user?.email || "",
      specialty: Array.isArray(profile.specializations) && profile.specializations.length > 0 ? profile.specializations[0] : "",
      bio: profile.bio || "",
      hourlyRate: profile.hourlyRate || 0,
      address: profile.address || "", 
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "",
      experience: profile.experience || "",
      languages: profile.languages || [],
      consultationModes: profile.consultationModes || [],
      profilePhoto: profile.user?.profilePhoto,
      coverPhoto: profile.coverPhoto,
      published: profile.isPublished || false,
      rating: profile.averageRating || 0,
      reviewCount: profile.ratingCount || 0,
      appointmentCount: profile.hoursDelivered || 0,
      
      certifications: certs.map(c => ({ name: c.name, issuer: c.issuer, year: c.year })),
      qualifications: profile.education ? (profile.education as any[]) : [], 
      specializations: profile.specializations || [],
      portfolioItems: profile.portfolioItems ? (profile.portfolioItems as any[]) : [],
      socialLinks: profile.socialLinks ? (profile.socialLinks as any) : {},
      hoursDelivered: profile.hoursDelivered,
      verified: profile.isApproved
    };

  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}

export async function searchConsultants(query: string) {
  try {
    if (!query || query.length < 2) return [];

    const results = await db.select({
      uid: users.uid,
      name: users.name,
      specialty: sql<string>`${consultantProfiles.specializations}[1]`,
      profilePhoto: users.profilePhoto,
    })
    .from(consultantProfiles)
    .innerJoin(users, eq(consultantProfiles.consultantId, users.uid))
    .where(
      and(
        eq(consultantProfiles.isPublished, true),
        or(
          sql`${users.name} ILIKE ${`%${query}%`}`,
          sql`${consultantProfiles.specializations}::text ILIKE ${`%${query}%`}`
        )
      )
    )
    .limit(10);

    return results;
  } catch (error) {
    console.error("Error searching consultants:", error);
    return [];
  }
}
