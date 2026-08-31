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
  const parseResult = AuditLogQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid query parameters", details: parseResult.error.format() });
    return;
  }

  const { limit, offset, patientId, actorId } = parseResult.data;

  const logs = await db
    .select()
    .from(auditLogs)
    .where(
      patientId && actorId
        ? and(
            eq(auditLogs.organizationId, currentOrgId),
            eq(auditLogs.patientId, patientId),
            eq(auditLogs.actorId, actorId)
          )
        : patientId
        ? and(eq(auditLogs.organizationId, currentOrgId), eq(auditLogs.patientId, patientId))
        : actorId
        ? and(eq(auditLogs.organizationId, currentOrgId), eq(auditLogs.actorId, actorId))
        : eq(auditLogs.organizationId, currentOrgId)
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({ logs });
});

export default router;
