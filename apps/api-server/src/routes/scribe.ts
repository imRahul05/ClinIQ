import { Router } from "express";
import { db, encounters, callSessions } from "@cliniq/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, requireRole, orgId } from "../middleware/auth";
import { GenerateSoapNoteSchema, SignEncounterSchema } from "@cliniq/api-spec";
import { generateClinicalSoapNote } from "../lib/ai";
import { logPhiAccess } from "../lib/audit";

const router = Router();
router.use(authMiddleware);

// Generate AI SOAP note from encounter audio transcript
router.post("/generate-soap", requireRole("physician", "nurse", "care_coordinator"), async (req, res) => {
  const parseResult = GenerateSoapNoteSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid transcript payload", details: parseResult.error.format() });
    return;
  }

  const { transcript, patientContext, callSessionId } = parseResult.data;
  const currentOrgId = orgId(req);

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
      .where(and(eq(callSessions.id, callSessionId), eq(callSessions.organizationId, currentOrgId)));
  }

  res.json({
    soapNote: aiResult.soapNote,
    suggestedCodes: aiResult.suggestedIcdCodes,
    summary: aiResult.summary,
  });
});

// Clinician review, edit, and digital sign-off
router.post("/sign-encounter", requireRole("physician", "nurse"), async (req, res) => {
  const parseResult = SignEncounterSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid sign payload", details: parseResult.error.format() });
    return;
  }

  const { encounterId, soapNote, diagnoses, erDeflectionFlag } = parseResult.data;
  const currentOrgId = orgId(req);
  const providerId = req.user?.providerId;

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
    .where(and(eq(encounters.id, encounterId), eq(encounters.organizationId, currentOrgId)))
    .returning();

  if (signedEncounter) {
    await logPhiAccess({
      organizationId: currentOrgId,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      patientId: signedEncounter.patientId,
      action: "update",
      resourceType: "Encounter",
      resourceId: signedEncounter.id,
      requestPath: req.path,
      details: { status: "signed", erDeflected: erDeflectionFlag },
    });
  }

  res.json({
    encounter: signedEncounter,
  });
});

export default router;
