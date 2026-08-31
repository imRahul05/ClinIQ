import type { Request, Response } from "express";
import { AuditLogQuerySchema } from "@cliniq/api-spec";
import { orgId } from "../middleware/auth";
import { getAuditLogs } from "../domain/audit.domain";
import { sendValidationError } from "../middleware/errorHandler";

/**
 * Handle GET /api/audit/logs
 */
export async function getAuditLogsController(req: Request, res: Response): Promise<void> {
  const currentOrgId = orgId(req);
  const parseResult = AuditLogQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    sendValidationError(res, parseResult.error, "Invalid query parameters");
    return;
  }

  const result = await getAuditLogs(currentOrgId, parseResult.data);
  res.json(result);
}
