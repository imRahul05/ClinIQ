import { z } from "zod";

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string({
      invalid_type_error: "NEXT_PUBLIC_API_URL must be a valid URL string.",
    })
    .default("http://localhost:4000"),
  NEXT_PUBLIC_WS_URL: z
    .string({
      invalid_type_error: "NEXT_PUBLIC_WS_URL must be a valid WebSocket URL string.",
    })
    .default("ws://localhost:4000"),
  NEXT_PUBLIC_MEDPLUM_BASE_URL: z
    .string({
      invalid_type_error: "NEXT_PUBLIC_MEDPLUM_BASE_URL must be a valid URL string.",
    })
    .default("http://localhost:8103/"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export interface ClientConfig {
  readonly apiUrl: string;
  readonly wsUrl: string;
  readonly medplumBaseUrl: string;
}

export function formatClientEnvErrors(error: z.ZodError): string {
  const issues = error.issues
    .map((issue) => `  • [${issue.path.join(".")}]: ${issue.message}`)
    .join("\n");

  return [
    "================================================================================",
    "❌ ClinIQ Web Client Configuration Error: Missing or invalid NEXT_PUBLIC_* variables",
    "================================================================================",
    issues,
    "",
    "👉 Action Required:",
    "   Please check your .env or .env.local file before starting @cliniq/web.",
    "================================================================================",
  ].join("\n");
}

export function buildClientConfig(env: ClientEnv): ClientConfig {
  return {
    apiUrl: env.NEXT_PUBLIC_API_URL.replace(/\/$/, ""),
    wsUrl: env.NEXT_PUBLIC_WS_URL.replace(/\/$/, ""),
    medplumBaseUrl: env.NEXT_PUBLIC_MEDPLUM_BASE_URL.endsWith("/")
      ? env.NEXT_PUBLIC_MEDPLUM_BASE_URL
      : `${env.NEXT_PUBLIC_MEDPLUM_BASE_URL}/`,
  };
}

export function validateClientEnv(
  rawEnv: {
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_WS_URL?: string;
    NEXT_PUBLIC_MEDPLUM_BASE_URL?: string;
  } = {
    // Explicit static references for Next.js build-time inlining
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_MEDPLUM_BASE_URL: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL,
  }
): ClientConfig {
  const result = clientEnvSchema.safeParse(rawEnv);

  if (!result.success) {
    const formattedMessage = formatClientEnvErrors(result.error);
    console.error(formattedMessage);
    // In client browser, provide fallback configuration rather than crashing UI render
    return {
      apiUrl: "http://localhost:4000",
      wsUrl: "ws://localhost:4000",
      medplumBaseUrl: "http://localhost:8103/",
    };
  }

  return buildClientConfig(result.data);
}

export const clientConfig: ClientConfig = validateClientEnv();
