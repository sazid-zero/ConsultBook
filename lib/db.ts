import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

// During build time, DATABASE_URL might be missing. We provide a placeholder to prevent neon() from throwing.
// The actual connection only happens when a query is executed.
const databaseUrl = process.env.DATABASE_URL || "postgres://db_url_placeholder_for_build";

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
