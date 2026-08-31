import { Router } from "express";
import { db, callSessions, patients, providers } from "@cliniq/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, orgId } from "../middleware/auth";
import { InitiateCallSchema, AnswerCallSchema, EndCallSchema } from "@cliniq/api-spec";
import { ringProvidersForCall } from "../lib/callRouting";
import { logPhiAccess } from "../lib/audit";

const router = Router();
router.use(authMiddleware);

// Initiate virtual call (telehealth)
router.post("/initiate", async (req, res) => {
  const parseResult = InitiateCallSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid call initiation parameters", details: parseResult.error.format() });
    return;
  }

  const { patientId, callType, reason, urgency } = parseResult.data;
  const currentOrgId = orgId(req);

  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.organizationId, currentOrgId)));

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  const roomName = `cliniq-room-${patientId.slice(0, 8)}-${Date.now()}`;

  const [session] = await db
    .insert(callSessions)
    .values({
      organizationId: currentOrgId,
      patientId,
      callType,
      reason,
      urgency,
      roomName,
      status: "ringing",
    })
    .returning();

  if (!session) {
    res.status(500).json({ error: "Failed to initialize call session" });
    return;
  }

  // Trigger 3-tier smart call routing
  const routing = await ringProvidersForCall({
    organizationId: currentOrgId,
    assignedNurseId: patient.assignedNurseId,
    callSessionId: session.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    reason,
  });

  await logPhiAccess({
    organizationId: currentOrgId,
    actorId: req.user?.userId,
    actorRole: req.user?.role,
    patientId,
    action: "create",
    resourceType: "CallSession",
    resourceId: session.id,
    requestPath: req.path,
  });

  res.json({
    callSession: session,
    routing,
  });
});

// Answer incoming call (provider)
router.post("/answer", async (req, res) => {
  const parseResult = AnswerCallSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid call answer parameters" });
    return;
  }

  const { callSessionId } = parseResult.data;
  const currentOrgId = orgId(req);
  const providerId = req.user?.providerId;

  const [updatedSession] = await db
    .update(callSessions)
    .set({
      status: "in_progress",
      answeredAt: new Date(),
      nurseId: providerId || undefined,
    })
    .where(and(eq(callSessions.id, callSessionId), eq(callSessions.organizationId, currentOrgId)))
    .returning();

  if (!updatedSession) {
    res.status(404).json({ error: "Call session not found" });
    return;
  }

  res.json({
    callSession: updatedSession,
  });
});

// End call session
router.post("/end", async (req, res) => {
  const parseResult = EndCallSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid call end parameters", details: parseResult.error.format() });
    return;
  }

  const { callSessionId, durationSeconds, transcriptText } = parseResult.data;
  const currentOrgId = orgId(req);

  const [endedSession] = await db
    .update(callSessions)
    .set({
      status: "completed",
      endedAt: new Date(),
      durationSeconds: durationSeconds || 0,
      transcriptText: transcriptText || undefined,
    })
    .where(and(eq(callSessions.id, callSessionId), eq(callSessions.organizationId, currentOrgId)))
    .returning();

  if (!endedSession) {
    res.status(404).json({ error: "Call session not found" });
    return;
  }

  res.json({
    callSession: endedSession,
  });
});

export default router;
