import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in .env.local");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting Seeding...");
  
  // 0. Clear existing data to avoid duplicates
  console.log("🧹 Clearing existing marketplace data...");
  await db.delete(schema.productReviews);
  await db.delete(schema.productOrders);
  await db.delete(schema.products);
  await db.delete(schema.workshopRegistrations);
  await db.delete(schema.workshops);

  // 1. Get Consultants
  const consultants = await db.query.users.findMany({
    where: eq(schema.users.role, "consultant"),
    limit: 5,
  });

  if (consultants.length === 0) {
    console.log("❌ No consultants found. Please register at least one consultant first.");
    return;
  }

  const consultantIds = consultants.map((c) => c.uid);

  // 2. Seed Products
  console.log("📦 Seeding Products...");
  const mockProducts = [
    {
      title: "Mastering Strategy: The Consultant's Playbook",
      description: "A deep dive into business strategy, frameworks, and client management. Includes 20+ templates and case studies from Fortune 500 projects.",
      type: "book" as const,
      price: 2999, // $29.99
      thumbnailUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
      isPublished: true,
    },
    {
      title: "Advanced Financial Modeling Course",
      description: "10 hours of video content teaching you how to build complex financial models from scratch for investment banking and private equity.",
      type: "course" as const,
      price: 9900, // $99.00
      thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600",
      isPublished: true,
    },
    {
      title: "Brand Strategy Canvas Toolset",
      description: "A comprehensive digital asset for brand consultants. Includes interactive Google Sheets and Figma templates for brand discovery.",
      type: "digital_asset" as const,
      price: 1500, // $15.00
      thumbnailUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=600",
      isPublished: true,
    },
    {
      title: "The Python for Data Analysis Handbook",
      description: "Learn Python from a consultant's perspective. Focuses purely on libraries like Pandas, NumPy, and Scikit-learn for business insights.",
      type: "book" as const,
      price: 4500, // $45.00
      thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=600",
      isPublished: true,
    }
  ];

  // Assign all products to the FIRST consultant for easier testing
  const firstConsultantId = consultantIds[0];
  console.log(`Assigning all products to consultant: ${firstConsultantId}`);
  
  for (const product of mockProducts) {
    await db.insert(schema.products).values({
      ...product,
      consultantId: firstConsultantId,
    });
  }

  // 3. Seed Workshops
  console.log("🗓️ Seeding Workshops...");
  const mockWorkshops = [
    {
      title: "Scale Your Agency: Weekend Masterclass",
      description: "Join me for a 4-hour intensive session on how to move from solo-consultant to a multi-member agency without burning out.",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      duration: 240,
      price: 500, // $5.00
      mode: "online" as const,
      location: "https://zoom.us/j/mock-meeting-id",
      thumbnailUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
      maxParticipants: 50,
      isPublished: true,
    },
    {
      title: "Live Branding Workshop (London Office)",
      description: "A hands-on physical workshop where we'll build your brand identity from the ground up over coffee and collaboration.",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      duration: 360,
      price: 25000, // $250.00
      mode: "offline" as const,
      location: "123 Creative Hub, Shoreditch, London",
      thumbnailUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
      maxParticipants: 15,
      isPublished: true,
    },
    {
      title: "Effective Client Communication: Mini-Session",
      description: "Learn the secrets of managing difficult stakeholders and closing high-ticket deals through proper framing and psychology.",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: 60,
      price: 4900, // $49.00
      mode: "online" as const,
      location: "https://meet.google.com/mock-id",
      thumbnailUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
      maxParticipants: 100,
      isPublished: true,
    }
  ];

  // Assign all workshops to the FIRST consultant for easier testing
  console.log(`Assigning all workshops to consultant: ${firstConsultantId}`);
  
  for (const workshop of mockWorkshops) {
    await db.insert(schema.workshops).values({
      ...workshop,
      consultantId: firstConsultantId,
    });
  }

  console.log("✅ Seeding completed successfully!");
}

seed().catch((e) => {
  console.error("❌ Seeding failed:");
  console.error(e);
  process.exit(1);
});
