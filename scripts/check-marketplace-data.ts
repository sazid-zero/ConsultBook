import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in .env.local");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function checkData() {
  console.log("🔍 Checking marketplace data...\n");

  // Get all consultants
  const consultants = await db.query.users.findMany({
    where: (users, { eq }) => eq(users.role, "consultant"),
  });

  console.log(`Found ${consultants.length} consultants:\n`);

  for (const consultant of consultants) {
    console.log(`\n📋 Consultant: ${consultant.name} (ID: ${consultant.uid})`);
    
    // Get their products
    const products = await db.query.products.findMany({
      where: (products, { eq }) => eq(products.consultantId, consultant.uid),
    });
    
    console.log(`  Products (${products.length}):`);
    products.forEach(p => {
      console.log(`    - ${p.title} (${p.type}) - $${(p.price / 100).toFixed(2)}`);
    });
    
    // Get their workshops
    const workshops = await db.query.workshops.findMany({
      where: (workshops, { eq }) => eq(workshops.consultantId, consultant.uid),
    });
    
    console.log(`  Workshops (${workshops.length}):`);
    workshops.forEach(w => {
      console.log(`    - ${w.title} (${w.mode}) - $${(w.price / 100).toFixed(2)}`);
    });
  }
}

checkData().catch((e) => {
  console.error("❌ Check failed:");
  console.error(e);
  process.exit(1);
});
