/**
 * Centralized AI Models & Task Routing Configuration
 *
 * Model identifiers are non-sensitive configuration values and are defined here with full
 * TypeScript type safety and compile-time verification instead of being stored in environment variables.
 */

export const AI_MODELS = {
  anthropic: {
    flagship: "claude-opus-5",
    workhorse: "claude-sonnet-5",
    sonnet37: "claude-3-7-sonnet-20250219",
    sonnetLegacy: "claude-3-5-sonnet-20241022",
    fast: "claude-haiku-4-5-20251001",
    haikuLegacy: "claude-3-5-haiku-20241022",
  },
  openai: {
    flagship: "gpt-5.6-sol",
    workhorse: "gpt-5.6-terra",
    fast: "gpt-5.6-luna",
    legacy: "gpt-4o",
    miniLegacy: "gpt-4o-mini",
  },
  google: {
    flagship: "gemini-3.1-pro",
    workhorse: "gemini-3.7-flash",
    fast: "gemini-3.5-flash",
  },
} as const;

export type SupportedProvider = "anthropic" | "openai" | "google";

export interface ModelExecutionTarget {
  readonly provider: SupportedProvider;
  readonly model: string;
}

/**
 * Task-specific routing and cascading fallback configurations.
 * To change a model or provider priority across the entire system, modify this configuration.
 */
export const AI_TASK_ROUTING = {
  // Clinical Scribe (Ambient audio encounter transcript -> Structured SOAP note + ICD codes)
  clinicalScribe: {
    primary: {
      provider: "anthropic",
      model: AI_MODELS.anthropic.sonnetLegacy, // High reliability clinical reasoning
    } satisfies ModelExecutionTarget,
    fallbacks: [
      { provider: "openai", model: AI_MODELS.openai.legacy },
      { provider: "google", model: AI_MODELS.google.workhorse },
      { provider: "anthropic", model: AI_MODELS.anthropic.fast },
    ] satisfies ModelExecutionTarget[],
    temperature: 0.1, // Near-zero temperature for deterministic clinical documentation
    maxOutputTokens: 2500,
  },

  // Inbound Fax Document Triage & OCR Entity Extraction
  faxClassification: {
    primary: {
      provider: "google",
      model: AI_MODELS.google.fast, // Fast and cost-efficient document classification
    } satisfies ModelExecutionTarget,
    fallbacks: [
      { provider: "openai", model: AI_MODELS.openai.fast },
      { provider: "anthropic", model: AI_MODELS.anthropic.fast },
    ] satisfies ModelExecutionTarget[],
    temperature: 0.0,
    maxOutputTokens: 600,
  },
} as const;
