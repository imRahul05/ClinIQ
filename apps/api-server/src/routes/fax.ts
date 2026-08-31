import { Router } from "express";
import { db, faxInbox } from "@cliniq/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, requireRole, orgId } from "../middleware/auth";
import { IngestFaxSchema } from "@cliniq/api-spec";
import { classifyFaxDocument } from "../lib/ai";

const router = Router();
router.use(authMiddleware);
router.use(requireRole("nurse", "care_coordinator", "admin"));

// List inbound faxes
router.get("/inbox", async (req, res) => {
  const currentOrgId = orgId(req);

  const faxes = await db
    .select()
    .from(faxInbox)
    .where(eq(faxInbox.organizationId, currentOrgId))
    .orderBy(desc(faxInbox.receivedAt));

  res.json({ faxes });
});

// Ingest and AI-classify a fax document
router.post("/ingest", async (req, res) => {
  const parseResult = IngestFaxSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid fax document payload" });
    return;
  }

  const { senderNumber, documentBase64, fileName } = parseResult.data;
  const currentOrgId = orgId(req);

  // In production, OCR text is extracted from documentBase64 via cloud vision or Tesseract
  const dummyOcrText = `Clinical Discharge Summary from Memorial Hospital for patient. Inbound fax from ${senderNumber || "unknown"}.`;
  const aiClassification = await classifyFaxDocument(dummyOcrText);

  const [newFax] = await db
    .insert(faxInbox)
    .values({
      organizationId: currentOrgId,
      senderNumber: senderNumber || "(555) 019-2834",
      classification: aiClassification.classification,
      extractedEntities: aiClassification.extractedEntities,
      status: "pending_review",
    })
    .returning();

  res.status(201).json({ fax: newFax });
});

export default router;
