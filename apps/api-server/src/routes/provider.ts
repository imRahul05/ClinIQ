import { Router } from "express";
import {
  db,
  patients,
  providers,
  nurseAvailability,
  encounters,
  careGaps,
  callSessions,
} from "@cliniq/db";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware, requireRole, orgId } from "../middleware/auth";
import { ProviderAvailabilitySchema } from "@cliniq/api-spec";
import { logPhiAccess } from "../lib/audit";

const router = Router();
router.use(authMiddleware);
router.use(requireRole("physician", "nurse", "care_coordinator", "admin"));

// Get clinical worklist
router.get("/worklist", async (req, res) => {
  const currentOrgId = orgId(req);
  const providerId = req.user?.providerId;

  // Fetch patient worklist assigned to this nurse or open high-risk members
  const worklistPatients = await db
    .select()
    .from(patients)
    .where(eq(patients.organizationId, currentOrgId))
    .limit(50);

  res.json({ patients: worklistPatients });
});

// Provider toggle availability / on-duty status
router.post("/availability", async (req, res) => {
  const parseResult = ProviderAvailabilitySchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid availability parameters", details: parseResult.error.format() });
    return;
  }

  const currentOrgId = orgId(req);
  const providerId = req.user?.providerId;
  const { isAvailable, status } = parseResult.data;

  if (!providerId) {
    res.status(400).json({ error: "No provider associated with user" });
    return;
  }

  const [existing] = await db
    .select()
    .from(nurseAvailability)
    .where(eq(nurseAvailability.providerId, providerId));

  if (existing) {
    const [updated] = await db
      .update(nurseAvailability)
      .set({
        isAvailable: Boolean(isAvailable),
        status: status || (isAvailable ? "available" : "offline"),
        lastHeartbeat: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(nurseAvailability.id, existing.id))
      .returning();
    res.json({ availability: updated });
    return;
  }

  const [created] = await db
    .insert(nurseAvailability)
    .values({
      providerId,
      organizationId: currentOrgId,
      isAvailable: Boolean(isAvailable),
      status: status || (isAvailable ? "available" : "offline"),
    })
    .returning();

  res.json({ availability: created });
});

// Full longitudinal patient chart view
router.get("/chart/:patientId", async (req, res) => {
  const currentOrgId = orgId(req);
  const { patientId } = req.params;

  if (!patientId) {
    res.status(400).json({ error: "patientId param is required" });
    return;
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.organizationId, currentOrgId)));

  if (!patient) {
    res.status(404).json({ error: "Patient chart not found" });
    return;
  }

  const patientEncounters = await db
    .select()
    .from(encounters)
    .where(and(eq(encounters.patientId, patientId), eq(encounters.organizationId, currentOrgId)))
    .orderBy(desc(encounters.createdAt));

  const patientGaps = await db
    .select()
    .from(careGaps)
    .where(and(eq(careGaps.patientId, patientId), eq(careGaps.organizationId, currentOrgId)));

  await logPhiAccess({
    organizationId: currentOrgId,
    actorId: req.user?.userId,
    actorRole: req.user?.role,
    patientId: patient.id,
    action: "read",
    resourceType: "PatientChart",
    resourceId: patient.id,
    requestPath: req.path,
  });

  res.json({
    patient,
    encounters: patientEncounters,
    careGaps: patientGaps,
  });
});

export default router;
