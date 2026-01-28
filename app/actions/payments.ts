"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { products, workshops, consultantProfiles } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function createPaymentIntent(items: { id: string, type: 'product' | 'workshop' | 'appointment', duration?: number }[]) {
  try {
    let totalAmount = 0;

    for (const item of items) {
      if (item.type === 'product') {
        const product = await db.query.products.findFirst({
          where: eq(products.id, item.id),
        });
        if (product) totalAmount += product.price;
      } else if (item.type === 'workshop') {
        const workshop = await db.query.workshops.findFirst({
          where: eq(workshops.id, item.id),
        });
        if (workshop) totalAmount += workshop.price;
      } else if (item.type === 'appointment') {
        const profile = await db.query.consultantProfiles.findFirst({
          where: eq(consultantProfiles.consultantId, item.id),
        });
        if (profile && item.duration) {
          totalAmount += (profile.hourlyRate * item.duration) / 60;
        }
      }
    }

    if (totalAmount <= 0) {
      throw new Error("Invalid total amount");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount), // Amount in cents
      currency: "usd", // Or "bdt" if supported, but keys are likely USD test keys
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        items: JSON.stringify(items.map(i => ({ id: i.id, type: i.type }))),
      }
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
    };
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return { success: false, error: error.message };
  }
}
