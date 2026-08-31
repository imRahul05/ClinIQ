import "dotenv/config";
import { z } from "zod";

export const dbEnvSchema = z.object({
  DATABASE_URL: z
    .string({
      required_error: "DATABASE_URL is required to establish database connections.",
      invalid_type_error: "DATABASE_URL must be a valid connection string.",
    })
    .min(1, "DATABASE_URL cannot be empty.")
    .refine(
      (val) => val.startsWith("postgres://") || val.startsWith("postgresql://"),
      {
        message: "DATABASE_URL must start with 'postgresql://' or 'postgres://'.",
      }
    ),
});

export type DbEnv = z.infer<typeof dbEnvSchema>;

export interface DbConfig {
  readonly databaseUrl: string;
}

export function formatDbConfigErrors(error: z.ZodError): string {
  const issues = error.issues
    .map((issue) => `  • [${issue.path.join(".")}]: ${issue.message}`)
    .join("\n");

  return [
    "================================================================================",
    "❌ ClinIQ Database Configuration Error: Missing or invalid DATABASE_URL",
    "================================================================================",
    issues,
    "",
    "👉 Action Required:",
    "   Set DATABASE_URL in your environment or .env file before connecting.",
    "   Example: postgresql://postgres:postgres@localhost:5433/cliniq",
    "================================================================================",
  ].join("\n");
}

export function validateDbConfig(
  rawEnv: Record<string, string | undefined> = process.env
): DbConfig {
  const result = dbEnvSchema.safeParse(rawEnv);

  if (!result.success) {
    const formattedMessage = formatDbConfigErrors(result.error);
    throw new Error(formattedMessage);
  }

  return {
    databaseUrl: result.data.DATABASE_URL,
  };
}

export const dbConfig: DbConfig = validateDbConfig();
