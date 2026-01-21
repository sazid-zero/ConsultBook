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

async function reassignToSingleConsultant() {
  console.log("🔄 Reassigning all products and workshops to single consultant...\n");

  // Find the consultant who has products
  const productsWithConsultant = await db.query.products.findMany({
    with: {
      consultant: true
    },
    limit: 1
  });

  if (productsWithConsultant.length === 0) {
    console.log("❌ No products found. Please run seed-marketplace.ts first.");
    return;
  }

  const targetConsultantId = productsWithConsultant[0].consultantId;
  const targetConsultant = productsWithConsultant[0].consultant;
  
  console.log(`✅ Target consultant: ${targetConsultant?.name} (ID: ${targetConsultantId})\n`);

  // Update all products to this consultant
  const productsResult = await db.update(schema.products)
    .set({ consultantId: targetConsultantId })
    .returning();
  
  console.log(`📦 Updated ${productsResult.length} products to consultant ${targetConsultantId}`);

  // Update all workshops to this consultant
  const workshopsResult = await db.update(schema.workshops)
    .set({ consultantId: targetConsultantId })
    .returning();
  
  console.log(`🗓️ Updated ${workshopsResult.length} workshops to consultant ${targetConsultantId}`);

  console.log("\n✅ All marketplace items now assigned to single consultant!");
  
  // Show summary
  const products = await db.query.products.findMany({
    where: eq(schema.products.consultantId, targetConsultantId)
  });
  
  const workshops = await db.query.workshops.findMany({
    where: eq(schema.workshops.consultantId, targetConsultantId)
  });

  console.log(`\n📊 Summary for ${targetConsultant?.name}:`);
  console.log(`   Products: ${products.length}`);
  products.forEach(p => {
    console.log(`     - ${p.title} (${p.type})`);
  });
  console.log(`   Workshops: ${workshops.length}`);
  workshops.forEach(w => {
    console.log(`     - ${w.title} (${w.mode})`);
  });
}

reassignToSingleConsultant().catch((e) => {
  console.error("❌ Reassignment failed:");
  console.error(e);
  process.exit(1);
});
