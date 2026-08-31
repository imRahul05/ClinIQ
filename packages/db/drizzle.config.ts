import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { dbConfig } from "./src/config";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbConfig.databaseUrl,
  },
});

