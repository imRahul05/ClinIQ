import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { dbConfig } from "./config";
import * as schema from "./schema";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: dbConfig.databaseUrl,
  max: 10,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
export * from "./config";

