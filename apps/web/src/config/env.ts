import { z } from "zod";

const emptyStringToUndefined = (val: unknown): unknown =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

function sanitizeHttpUrl(defaultUrl: string, errorLabel: string) {
  return z.preprocess(
    emptyStringToUndefined,
    z
      .string({
        invalid_type_error: `${errorLabel} must be a valid URL string.`,
      })
      .refine(
        (val) => val.startsWith("http://") || val.startsWith("https://"),
        {
          message: `${errorLabel} must start with http:// or https://`,
        }
      )
      .default(defaultUrl)
  );
}

function sanitizeWsUrl(defaultUrl: string, errorLabel: string) {
  return z.preprocess(
    emptyStringToUndefined,
    z
      .string({
        invalid_type_error: `${errorLabel} must be a valid WebSocket URL string.`,
      })
      .refine(
        (val) =>
          val.startsWith("ws://") ||
          val.startsWith("wss://") ||
          val.startsWith("http://") ||
          val.startsWith("https://"),
        {
          message: `${errorLabel} must start with ws://, wss://, http://, or https://`,
        }
      )
      .default(defaultUrl)
  );
}

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: sanitizeHttpUrl(
    "http://localhost:4000",
    "NEXT_PUBLIC_API_URL"
  ),
  NEXT_PUBLIC_WS_URL: sanitizeWsUrl(
    "ws://localhost:4000",
    "NEXT_PUBLIC_WS_URL"
  ),
  NEXT_PUBLIC_MEDPLUM_BASE_URL: sanitizeHttpUrl(
    "http://localhost:8103/",
    "NEXT_PUBLIC_MEDPLUM_BASE_URL"
  ),
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
  const apiUrl = env.NEXT_PUBLIC_API_URL.trim().replace(/\/+$/, "");
  const wsUrl = env.NEXT_PUBLIC_WS_URL.trim().replace(/\/+$/, "");
  const trimmedMedplum = env.NEXT_PUBLIC_MEDPLUM_BASE_URL.trim();
  const medplumBaseUrl = trimmedMedplum.endsWith("/")
    ? trimmedMedplum
    : `${trimmedMedplum}/`;

  return {
    apiUrl,
    wsUrl,
    medplumBaseUrl,
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
    // In client browser or build-time fallback, provide safe default configuration rather than crashing UI render / static prerender
    return {
      apiUrl: "http://localhost:4000",
      wsUrl: "ws://localhost:4000",
      medplumBaseUrl: "http://localhost:8103/",
    };
  }

  return buildClientConfig(result.data);
}

export const clientConfig: ClientConfig = validateClientEnv();
