
import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"], {
    errorMap: () => ({
      message:
        "NODE_ENV is required and must be explicitly set to 'development', 'production', or 'test'.",
    }),
  }),
  PORT: z.coerce
    .number({
      invalid_type_error: "PORT must be a valid port number.",
    })
    .int("PORT must be an integer.")
    .positive("PORT must be a positive integer.")
    .default(4000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"], {
      errorMap: () => ({
        message:
          "LOG_LEVEL must be one of: 'fatal', 'error', 'warn', 'info', 'debug', 'trace'.",
      }),
    })
    .default("info"),
  JWT_SECRET: z
    .string({
      required_error: "JWT_SECRET is required to sign and verify user authentication tokens.",
      invalid_type_error: "JWT_SECRET must be a valid string.",
    })
    .min(1, "JWT_SECRET cannot be empty."),
  CORS_ORIGIN: z
    .string({
      invalid_type_error: "CORS_ORIGIN must be a string.",
    })
    .default("http://localhost:3000"),
  MEDPLUM_BASE_URL: z
    .string({
      invalid_type_error: "MEDPLUM_BASE_URL must be a valid string.",
    })
    .url("MEDPLUM_BASE_URL must be a valid URL (e.g. 'http://localhost:8103/').")
    .default("http://localhost:8103/"),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  DEEPGRAM_API_KEY: z.string().optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

export interface AppConfig {
  readonly port: number;
  readonly nodeEnv: "development" | "production" | "test";
  readonly isProduction: boolean;
  readonly isDevelopment: boolean;
  readonly isTest: boolean;
  readonly logLevel: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
  readonly jwt: {
    readonly secret: string;
    readonly expiresIn: string;
  };
  readonly cors: {
    readonly origin: string;
  };
  readonly medplum: {
    readonly baseUrl: string;
  };
  readonly ai: {
    readonly anthropicApiKey?: string;
    readonly anthropicEnabled: boolean;
    readonly openaiApiKey?: string;
    readonly openaiEnabled: boolean;
    readonly googleApiKey?: string;
    readonly googleEnabled: boolean;
    readonly deepgramApiKey?: string;
    readonly deepgramEnabled: boolean;
  };
}

export function formatEnvErrors(error: z.ZodError): string {
  const issues = error.issues
    .map((issue) => `  • [${issue.path.join(".")}]: ${issue.message}`)
    .join("\n");

  return [
    "================================================================================",
    "❌ ClinIQ Configuration Error: Missing or invalid environment variables",
    "================================================================================",
    issues,
    "",
    "👉 Action Required:",
    "   Please check your .env file or environment before starting @cliniq/api-server.",
    "================================================================================",
  ].join("\n");
}

export function buildAppConfig(env: ValidatedEnv): AppConfig {
  const anthropicApiKey = env.ANTHROPIC_API_KEY?.trim();
  const openaiApiKey = env.OPENAI_API_KEY?.trim();
  const googleApiKey = (env.GOOGLE_GENERATIVE_AI_API_KEY || env.GEMINI_API_KEY)?.trim();
  const deepgramApiKey = env.DEEPGRAM_API_KEY?.trim();

  return {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === "production",
    isDevelopment: env.NODE_ENV === "development",
    isTest: env.NODE_ENV === "test",
    logLevel: env.LOG_LEVEL,
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: "7d",
    },
    cors: {
      origin: env.CORS_ORIGIN,
    },
    medplum: {
      baseUrl: env.MEDPLUM_BASE_URL,
    },
    ai: {
      anthropicApiKey: anthropicApiKey || undefined,
      anthropicEnabled: Boolean(anthropicApiKey && anthropicApiKey.length > 0),
      openaiApiKey: openaiApiKey || undefined,
      openaiEnabled: Boolean(openaiApiKey && openaiApiKey.length > 0),
      googleApiKey: googleApiKey || undefined,
      googleEnabled: Boolean(googleApiKey && googleApiKey.length > 0),
      deepgramApiKey: deepgramApiKey || undefined,
      deepgramEnabled: Boolean(deepgramApiKey && deepgramApiKey.length > 0),
    },
  };
}

export function validateEnv(
  rawEnv: Record<string, string | undefined> = process.env
): AppConfig {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const formattedMessage = formatEnvErrors(result.error);
    throw new Error(formattedMessage);
  }

  return buildAppConfig(result.data);
}

export const config: AppConfig = validateEnv();
