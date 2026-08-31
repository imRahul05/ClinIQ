import { generateObject } from "ai";
import { z } from "zod";
import { AI_TASK_ROUTING } from "../../config/ai.config";
import { resolveModel } from "./client";
import { logger } from "../logger";

export const FaxClassificationResultSchema = z.object({
  classification: z.enum([
    "Discharge Summary",
    "Lab Requisition",
    "Prescription Referral",
    "General Clinical Document",
  ]),
  extractedEntities: z.record(z.string()).describe("Key clinical entities such as patientName, mrn, referringPhysician, or date"),
});

export type FaxClassificationResult = z.infer<typeof FaxClassificationResultSchema>;

/**
 * Classifies inbound clinical fax OCR text and extracts key entities.
 * Cascades across AI providers with local rule-based fallback.
 */
export async function classifyFaxDocument(ocrText: string): Promise<FaxClassificationResult> {
  const taskConfig = AI_TASK_ROUTING.faxClassification;
  const executionChain = [taskConfig.primary, ...taskConfig.fallbacks];

  const systemPrompt =
    "You are a medical records classification specialist. Classify inbound fax OCR text into one of: 'Discharge Summary', 'Lab Requisition', 'Prescription Referral', or 'General Clinical Document', and extract key entities.";

  for (const target of executionChain) {
    const model = resolveModel(target.provider, target.model);
    if (!model) continue;

    try {
      const { object } = await generateObject({
        model,
        schema: FaxClassificationResultSchema,
        system: systemPrompt,
        prompt: `Document OCR Text:\n${ocrText}`,
        maxOutputTokens: taskConfig.maxOutputTokens,
        temperature: taskConfig.temperature,
      });

      return object;
    } catch (error) {
      logger.warn(
        { error, failedProvider: target.provider, failedModel: target.model },
        "Fax classification AI model failed. Trying fallback..."
      );
    }
  }

  // Deterministic rule-based fallback
  const lower = ocrText.toLowerCase();
  const fallbackClassification = lower.includes("discharge")
    ? "Discharge Summary"
    : lower.includes("lab") || lower.includes("blood") || lower.includes("specimen")
    ? "Lab Requisition"
    : lower.includes("prescription") || lower.includes("rx") || lower.includes("refill")
    ? "Prescription Referral"
    : "General Clinical Document";

  return {
    classification: fallbackClassification,
    extractedEntities: {
      parsedSnippet: ocrText.slice(0, 200),
    },
  };
}
