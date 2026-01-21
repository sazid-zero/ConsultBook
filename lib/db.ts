import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

// Lazy initialization using a Proxy to prevent crashes during Next.js build evaluation
// when DATABASE_URL is missing or invalid.
let _db: any = null;

export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!_db) {
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        // Only throw at runtime when a query is actually attempted
        throw new Error("DATABASE_URL is not set. Please provide it in your environment variables.");
      }
      
      const sql = neon(databaseUrl);
      _db = drizzle(sql, { schema });
    }
    return _db[prop];
  }
});
