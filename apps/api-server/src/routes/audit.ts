import { Router } from "express";
import { db, auditLogs } from "@cliniq/db";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware, requireAdmin, orgId } from "../middleware/auth";
import { AuditLogQuerySchema } from "@cliniq/api-spec";

const router = Router();
router.use(authMiddleware);
router.use(requireAdmin);

// Query searchable, paginated PHI Audit Log
router.get("/logs", async (req, res) => {
  const currentOrgId = orgId(req);
  const { limit = 50, offset = 0, patientId, actorId } = req.query;

  const logs = await db
    .select()
    .from(auditLogs)
    .where(
      patientId
        ? and(eq(auditLogs.organizationId, currentOrgId), eq(auditLogs.patientId, String(patientId)))
        : eq(auditLogs.organizationId, currentOrgId)
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(Number(limit))
    .offset(Number(offset));

  res.json({ logs });
});

export default router;
