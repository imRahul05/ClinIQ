import { Router } from "express";
import { db, careGaps } from "@cliniq/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, requireRole, orgId } from "../middleware/auth";
import { CloseCareGapSchema } from "@cliniq/api-spec";
import { logPhiAccess } from "../lib/audit";

const router = Router();
router.use(authMiddleware);

// Close an open HEDIS care gap
router.post("/close", requireRole("physician", "nurse", "care_coordinator"), async (req, res) => {
  const parseResult = CloseCareGapSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid care gap closure payload", details: parseResult.error.format() });
    return;
  }

  const { careGapId, evidence, closedEncounterId } = parseResult.data;
  const currentOrgId = orgId(req);

  const [closedGap] = await db
    .update(careGaps)
    .set({
      status: "closed",
      closedDate: new Date().toISOString().slice(0, 10),
      closedEvidence: evidence,
      closedBy: req.user?.providerId || undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(careGaps.id, careGapId), eq(careGaps.organizationId, currentOrgId)))
    .returning();

  if (!closedGap) {
    res.status(404).json({ error: "Care gap not found" });
    return;
  }

  await logPhiAccess({
    organizationId: currentOrgId,
    actorId: req.user?.userId,
    actorRole: req.user?.role,
    patientId: closedGap.patientId,
    action: "update",
    resourceType: "CareGap" as "PatientChart",
    resourceId: closedGap.id,
    requestPath: req.path,
    details: { action: "closed_care_gap", measure: closedGap.measure },
  });

  res.json({ careGap: closedGap });
});

export default router;
