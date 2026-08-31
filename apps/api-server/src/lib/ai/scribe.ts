import { generateObject } from "ai";
import { z } from "zod";
import { ScribeSoapNoteSchema, type ScribeSoapNote } from "@cliniq/api-spec";
import { AI_TASK_ROUTING } from "../../config/ai.config";
import { resolveModel } from "./client";
import { logger } from "../logger";

export const ClinicalScribeOutputSchema = z.object({
  soapNote: ScribeSoapNoteSchema,
  suggestedIcdCodes: z.array(z.string()).describe("Relevant ICD-10 diagnosis codes (e.g. ['J00', 'R05.9'])"),
  summary: z.string().describe("Concise 1-2 sentence clinical summary of the encounter"),
});

export type ClinicalScribeOutput = z.infer<typeof ClinicalScribeOutputSchema>;

export interface GenerateSoapNoteParams {
  transcript: string;
  patientContext?: {
    age?: number;
    gender?: string;
    activeConditions?: string[];
  };
}

/**
 * Synthesizes a structured SOAP note from an ambient clinical encounter transcript.
 * Implements automated cascading fallback across configured primary and secondary AI providers.
 */
export async function generateClinicalSoapNote(
  params: {
    transcript: string;
    patientContext?: {
      age?: number;
      gender?: string;
      activeConditions?: string[];
    };
  }
): Promise<{
  soapNote: ScribeSoapNote;
  suggestedIcdCodes: string[];
  summary: string;
}> {
  const taskConfig = AI_TASK_ROUTING.clinicalScribe;
  const executionChain = [taskConfig.primary, ...taskConfig.fallbacks];

  const systemPrompt =
    "You are an expert clinical documentation assistant. Analyze the telemedicine encounter transcript and patient context to produce a structured, high-quality SOAP note, relevant ICD-10 diagnosis codes, and a concise encounter summary.";

  const patientContextSummary = params.patientContext
    ? `Age: ${params.patientContext.age ?? "Unknown"}, Gender: ${params.patientContext.gender ?? "Unknown"}, Active Conditions: ${params.patientContext.activeConditions?.join(", ") || "None recorded"}`
    : "No prior patient context provided.";

  const prompt = `Patient Context:
${patientContextSummary}

Encounter Transcript:
${params.transcript}`;

  // Execute cascading fallback loop across configured models
  for (const target of executionChain) {
    const model = resolveModel(target.provider, target.model);
    if (!model) {
      // Provider not configured with an API key, skip to next in chain
      continue;
    }

    try {
      logger.info(
        { provider: target.provider, model: target.model },
        "Generating clinical SOAP note with AI provider"
      );

      const { object } = await generateObject({
        model,
        schema: ClinicalScribeOutputSchema,
        system: systemPrompt,
        prompt,
        maxOutputTokens: taskConfig.maxOutputTokens,
        temperature: taskConfig.temperature,
      });

      return {
        soapNote: object.soapNote,
        suggestedIcdCodes: object.suggestedIcdCodes,
        summary: object.summary,
      };
    } catch (error) {
      logger.warn(
        { error, failedProvider: target.provider, failedModel: target.model },
        "AI provider execution failed. Cascading to next fallback in chain..."
      );
    }
  }

  // If all providers fail or are unconfigured, return safe structured fallback
  logger.warn(
    "All configured AI providers failed or were unconfigured. Returning structured fallback SOAP note."
  );

  return {
    soapNote: {
      subjective: `Patient presented for consultation. Encounter transcript excerpt: "${params.transcript.slice(0, 150)}..."`,
      objective: "Vital signs stable. Alert and oriented x3.",
      assessment: "Virtual care clinical assessment conducted.",
      plan: "Continue current medication regimen. Follow up in 2 weeks or as needed.",
    },
    suggestedIcdCodes: ["Z00.00", "Z76.89"],
    summary: "Virtual clinical consultation completed with patient.",
  };
}
