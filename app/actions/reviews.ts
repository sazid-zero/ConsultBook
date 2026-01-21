"use server";

import { db } from "@/lib/db";
import { reviews, consultantProfiles, appointments } from "@/db/schema";
import { eq, desc, and, avg, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface SubmitReviewData {
  consultantId: string;
  clientId: string;
  appointmentId: string;
  rating: number;
  comment: string;
}

export async function submitReview(data: SubmitReviewData) {
  try {
    // 1. Insert review
    await db.insert(reviews).values({
      consultantId: data.consultantId,
      clientId: data.clientId,
      appointmentId: data.appointmentId,
      rating: data.rating,
      comment: data.comment,
    });

    // 2. Update Consultant Stats
    await updateConsultantRatingStats(data.consultantId);

    revalidatePath(`/consultant/${data.consultantId}/profile`);
    revalidatePath("/dashboard/client");
    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

export async function updateReview(reviewId: string, rating: number, comment: string) {
  try {
    const [updatedReview] = await db.update(reviews)
      .set({ rating, comment, updatedAt: new Date() })
      .where(eq(reviews.id, reviewId))
      .returning();

    if (updatedReview) {
      await updateConsultantRatingStats(updatedReview.consultantId);
      revalidatePath(`/consultant/${updatedReview.consultantId}/profile`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating review:", error);
    return { success: false, error: "Failed to update review" };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const [deletedReview] = await db.delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning();

    if (deletedReview) {
      await updateConsultantRatingStats(deletedReview.consultantId);
      revalidatePath(`/consultant/${deletedReview.consultantId}/profile`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "Failed to delete review" };
  }
}

async function updateConsultantRatingStats(consultantId: string) {
    // Calculate new average and count
    const stats = await db.select({
        avgRating: avg(reviews.rating),
        totalCount: count(reviews.id),
    }).from(reviews).where(eq(reviews.consultantId, consultantId));

    const avgVal = stats[0].avgRating ? Math.round(parseFloat(stats[0].avgRating as string)) : 0;
    const countVal = stats[0].totalCount || 0;

    await db.update(consultantProfiles)
        .set({
            averageRating: avgVal,
            ratingCount: countVal,
        })
        .where(eq(consultantProfiles.consultantId, consultantId));
}

export async function getConsultantReviews(consultantId: string) {
    try {
        const consultantReviews = await db.query.reviews.findMany({
            where: eq(reviews.consultantId, consultantId),
            with: {
                client: true, // Requires relation in schema
            },
            orderBy: [desc(reviews.createdAt)],
        });
        return { success: true, data: consultantReviews };
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return { success: false, error: "Failed to fetch reviews" };
    }
}
