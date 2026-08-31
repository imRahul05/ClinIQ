import { Router } from "express";
import {
  db,
  patients,
  conditions,
  medications,
  labReadings,
  careGaps,
  encounters,
} from "@cliniq/db";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware, orgId } from "../middleware/auth";
import { logPhiAccess } from "../lib/audit";

const router = Router();
router.use(authMiddleware);

// Get current patient profile & health dashboard
router.get("/profile", async (req, res) => {
  const currentOrgId = orgId(req);
  const patientId = req.user?.patientId;

  if (!patientId) {
    res.status(400).json({ error: "No patient associated with current user" });
    return;
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.organizationId, currentOrgId)));

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

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

  res.json({ patient });
});

// Get patient vitals & lab readings
router.get("/labs-and-vitals", async (req, res) => {
  const currentOrgId = orgId(req);
  const patientId = req.user?.patientId || (req.query.patientId as string);

  if (!patientId) {
    res.status(400).json({ error: "Patient ID required" });
    return;
  }

  const readings = await db
    .select()
    .from(labReadings)
    .where(and(eq(labReadings.patientId, patientId), eq(labReadings.organizationId, currentOrgId)))
    .orderBy(desc(labReadings.readingDate));

  res.json({ readings });
});

// Get patient active medications
router.get("/medications", async (req, res) => {
  const currentOrgId = orgId(req);
  const patientId = req.user?.patientId || (req.query.patientId as string);

  if (!patientId) {
    res.status(400).json({ error: "Patient ID required" });
    return;
  }

  const meds = await db
    .select()
    .from(medications)
    .where(and(eq(medications.patientId, patientId), eq(medications.organizationId, currentOrgId)));

  res.json({ medications: meds });
});

// Get patient active conditions
router.get("/conditions", async (req, res) => {
  const currentOrgId = orgId(req);
  const patientId = req.user?.patientId || (req.query.patientId as string);

  if (!patientId) {
    res.status(400).json({ error: "Patient ID required" });
    return;
  }

  const conds = await db
    .select()
    .from(conditions)
    .where(and(eq(conditions.patientId, patientId), eq(conditions.organizationId, currentOrgId)));

  res.json({ conditions: conds });
});

// Get patient open care gaps
router.get("/care-gaps", async (req, res) => {
  const currentOrgId = orgId(req);
  const patientId = req.user?.patientId || (req.query.patientId as string);

  if (!patientId) {
    res.status(400).json({ error: "Patient ID required" });
    return;
  }

  const gaps = await db
    .select()
    .from(careGaps)
    .where(and(eq(careGaps.patientId, patientId), eq(careGaps.organizationId, currentOrgId)));

  res.json({ careGaps: gaps });
});

export default router;
