
import { db } from "../lib/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const LOCALLY_TARGETED_CONSULTANTS = [
  {
    name: "Fatima Ahmed",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop"
  },
  {
    name: "Anik Islam",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=500&h=500&fit=crop"
  },
  {
    name: "Priya Chakraborty",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=500&h=500&fit=crop"
  }
];

async function localizeConsultants() {
  console.log("Starting localization of consultant imagery...");
  
  for (const consultant of LOCALLY_TARGETED_CONSULTANTS) {
    try {
      const result = await db.update(users)
        .set({ profilePhoto: consultant.image })
        .where(eq(users.name, consultant.name))
        .returning();
      
      if (result.length > 0) {
        console.log(`Successfully updated ${consultant.name}'s profile photo.`);
      } else {
        console.warn(`No user found with name ${consultant.name}. (This is expected if the user hasn't been created yet in this environment)`);
      }
    } catch (error) {
      console.error(`Error updating ${consultant.name}:`, error);
    }
  }
  
  console.log("Localization process completed.");
  process.exit(0);
}

localizeConsultants().catch((err) => {
  console.error("Critical error in localization script:", err);
  process.exit(1);
});
