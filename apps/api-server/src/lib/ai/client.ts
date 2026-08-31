import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { config } from "../../config";
import type { SupportedProvider } from "../../config/ai.config";

/**
 * Direct SDK provider instances initialized with credentials from environment.
 * All network calls connect directly from our server to the respective provider API.
 */
export const anthropicClient = config.ai.anthropicApiKey
  ? createAnthropic({ apiKey: config.ai.anthropicApiKey })
  : null;

export const openaiClient = config.ai.openaiApiKey
  ? createOpenAI({ apiKey: config.ai.openaiApiKey })
  : null;

export const googleClient = config.ai.googleApiKey
  ? createGoogleGenerativeAI({ apiKey: config.ai.googleApiKey })
  : null;

/**
 * Resolves a typed LanguageModel instance for any supported provider.
 * Returns null if the provider's API key is not configured.
 */
export function resolveModel(
  provider: SupportedProvider,
  modelName: string
): LanguageModel | null {
  switch (provider) {
    case "anthropic":
      return anthropicClient ? anthropicClient(modelName) : null;
    case "openai":
      return openaiClient ? openaiClient(modelName) : null;
    case "google":
      return googleClient ? googleClient(modelName) : null;
    default:
      return null;
  }
}
