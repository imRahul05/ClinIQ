import { db, encounters, callSessions } from "@cliniq/db";
import { eq, and } from "drizzle-orm";
import type {
  CreateSoapNoteInput,
  SignEncounterInput,
  ClinicalScribeOutput,
} from "@cliniq/api-spec";
import { generateClinicalSoapNote } from "../lib/ai";
import { logPhiAccess } from "../lib/audit";

export interface CreateSoapNoteParams extends CreateSoapNoteInput {
  organizationId: string;
}

export interface SignEncounterParams extends SignEncounterInput {
  organizationId: string;
  providerId?: string;
  actorId?: string;
  actorRole?: string;
  requestPath: string;
}

export async function createSoapNote(
  params: CreateSoapNoteParams
): Promise<ClinicalScribeOutput> {
  const { organizationId, transcript, patientContext, callSessionId } = params;

  const aiResult = await generateClinicalSoapNote({
    transcript,
    patientContext,
  });

  // Save generated SOAP note to call session if linked
  if (callSessionId) {
    await db
      .update(callSessions)
      .set({
        soapNote: aiResult.soapNote,
        suggestedCodes: aiResult.suggestedIcdCodes,
        transcriptText: transcript,
      })
      .where(and(eq(callSessions.id, callSessionId), eq(callSessions.organizationId, organizationId)));
  }

  return {
    soapNote: aiResult.soapNote,
    suggestedIcdCodes: aiResult.suggestedIcdCodes,
    summary: aiResult.summary,
  };
}

export async function signEncounter(
  params: SignEncounterParams
): Promise<typeof encounters.$inferSelect | null> {
  const {
    organizationId,
    encounterId,
    soapNote,
    diagnoses,
    erDeflectionFlag,
    providerId,
    actorId,
    actorRole,
    requestPath,
  } = params;

  const [signedEncounter] = await db
    .update(encounters)
    .set({
      soapNote,
      confirmedCodes: diagnoses,
      erDeflectionFlag,
      status: "signed",
      signedAt: new Date(),
      signedBy: providerId || undefined,
    })
    .where(and(eq(encounters.id, encounterId), eq(encounters.organizationId, organizationId)))
    .returning();

  if (!signedEncounter) {
    return null;
  }

  await logPhiAccess({
    organizationId,
    actorId,
    actorRole,
    patientId: signedEncounter.patientId,
    action: "update",
    resourceType: "Encounter",
    resourceId: signedEncounter.id,
    requestPath,
    details: { status: "signed", erDeflected: erDeflectionFlag },
  });

  return signedEncounter;
}
