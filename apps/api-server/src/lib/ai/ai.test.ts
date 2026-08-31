import { describe, it, expect } from "vitest";
import { generateClinicalSoapNote } from "./scribe";
import { classifyFaxDocument } from "./fax";
import { AI_MODELS, AI_TASK_ROUTING } from "../../config/ai.config";

describe("Clinical AI Architecture & Routing", () => {
  it("should have valid models configured for tasks", () => {
    expect(AI_TASK_ROUTING.clinicalScribe.primary.provider).toBe("anthropic");
    expect(AI_TASK_ROUTING.clinicalScribe.primary.model).toBe(AI_MODELS.anthropic.sonnetLegacy);
    expect(AI_TASK_ROUTING.clinicalScribe.fallbacks.length).toBeGreaterThan(0);
    expect(AI_TASK_ROUTING.faxClassification.primary.provider).toBe("google");
  });

  it("should gracefully return structured fallback SOAP note when AI providers are unconfigured", async () => {
    const result = await generateClinicalSoapNote({
      transcript: "Doctor: Hello, how are you feeling today? Patient: I have had a bad cough for 3 days.",
      patientContext: {
        age: 45,
        gender: "female",
        activeConditions: ["Asthma"],
      },
    });

    expect(result).toBeDefined();
    expect(result.soapNote).toBeDefined();
    expect(result.soapNote.subjective).toContain("Patient presented for consultation");
    expect(result.soapNote.objective).toBeDefined();
    expect(result.soapNote.assessment).toBeDefined();
    expect(result.soapNote.plan).toBeDefined();
    expect(Array.isArray(result.suggestedIcdCodes)).toBe(true);
    expect(result.suggestedIcdCodes.length).toBeGreaterThan(0);
    expect(result.summary).toBeDefined();
  });

  it("should classify fax documents using rule-based fallback when AI providers are unconfigured", async () => {
    const dischargeFax = await classifyFaxDocument("Official Hospital Discharge Summary for patient Jane Doe.");
    expect(dischargeFax.classification).toBe("Discharge Summary");
    expect(dischargeFax.extractedEntities).toBeDefined();

    const labFax = await classifyFaxDocument("Comprehensive Metabolic Panel Lab Requisition blood test results.");
    expect(labFax.classification).toBe("Lab Requisition");

    const rxFax = await classifyFaxDocument("Prescription Referral for Amoxicillin 500mg PO TID.");
    expect(rxFax.classification).toBe("Prescription Referral");
  });
});
