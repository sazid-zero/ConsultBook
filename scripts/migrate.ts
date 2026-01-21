import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { db as pgDb } from "../lib/db";
import { users, consultantProfiles, appointments, consultantSchedules } from "../db/schema";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

// You need to set GOOGLE_APPLICATION_CREDENTIALS in .env.local 
// pointing to your service account json file, OR paste the json content here for one-time use.
// const serviceAccount = require("../service-account.json"); 

async function migrate() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error("Please provide GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY in .env.local");
    return;
  }

  // Initialize Firebase Admin
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS || JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)),
    });
  }

  const firestore = getFirestore();
  console.log("Connected to Firestore. Starting migration...");

  try {
    // 1. Migrate Users
    console.log("Migrating Users...");
    const usersSnap = await firestore.collection("users").get();
    for (const doc of usersSnap.docs) {
      const data = doc.data();
      // Basic User Info
      await pgDb.insert(users).values({
        uid: data.uid,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role as "client" | "consultant" | "admin",
        profilePhoto: data.profilePhoto,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: new Date(), // Set update time to now
      }).onConflictDoNothing();

      // If Consultant, migrate profile
      if (data.role === "consultant") {
          // Check if profile exists in users doc (based on provided code analysis)
          // or in consultantProfiles collection? 
          // The code showed usage of BOTH. We should check both.
          
          let profileData = data;
          const profileDoc = await firestore.collection("consultantProfiles").doc(data.uid).get();
          if (profileDoc.exists) {
             profileData = { ...data, ...profileDoc.data() };
          }

          await pgDb.insert(consultantProfiles).values({
            consultantId: data.uid,
            bio: profileData.bio || "",
            specializations: profileData.specializations || [],
            hourlyRate: profileData.hourlyRate || 0,
            city: profileData.city,
            experience: profileData.experience,
            languages: profileData.languages || [],
            consultationModes: profileData.consultationModes || [],
            isApproved: profileData.approved || false,
            isPublished: profileData.published || false,
            coverPhoto: profileData.coverPhoto,
            // Map other fields...
            hoursDelivered: profileData.hoursDelivered,
            ratingCount: profileData.ratingCount,
            averageRating: profileData.averageRating,
          }).onConflictDoNothing();
      }
    }

    // 2. Migrate Appointments
    console.log("Migrating Appointments...");
    const appointmentsSnap = await firestore.collection("appointments").get();
    for (const doc of appointmentsSnap.docs) {
      const data = doc.data();
      await pgDb.insert(appointments).values({
        // id: doc.id, // Let Postgres generate UUID or use Firestore ID if we change schema to text
        // Schema uses UUID defaultRandom(), so we skip ID unless we change schema to text to keep Firestore IDs.
        // For now, let's create NEW IDs or we should change schema to text to support Firestore IDs.
        // DECISION: To keep history valid, we should probably keep Firestore IDs if possible, 
        // but Postgres UUID is better. Let's map Firestore ID to a legacy_id field if needed, 
        // OR just drop the ID requirement if foreign keys aren't strictly relying on appointment IDs yet.
        // Actually, schema definition says `id: uuid(...)`. Firestore IDs are strings.
        // We will generate new UUIDs for migrated appointments.
        clientId: data.clientId,
        consultantId: data.consultantId,
        date: data.date,
        time: data.time,
        duration: data.duration,
        mode: data.mode,
        amount: data.amount,
        status: data.status,
        paymentStatus: data.paymentStatus || "pending",
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      }).onConflictDoNothing();
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
